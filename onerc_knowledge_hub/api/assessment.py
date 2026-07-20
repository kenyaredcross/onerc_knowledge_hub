# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Public submission + admin tooling for the Financial Sustainability assessment.

The whole assessment is data-driven: questions, options, correct answers and
per-option scores live in the `FS Assessment Question` doctype, so both the
public form and the dashboard adapt automatically to whatever is configured.

Engagements are organised as `FS Activity` records. An admin adds participants
and emails them the pre-assessment link in advance, then the post-assessment
link after the engagement. Responses link back to the activity, which lets us
pair a person's Pre and Post (by email, within the activity) and report the
change in their score.
"""

import json
from urllib.parse import quote

import frappe
from frappe import _
from frappe.utils import escape_html, flt, get_url

DASHBOARD_ROLES = {"LH FS Manager", "System Manager"}
VALID_PHASES = ("Pre", "Post")

# Brand tokens reused across every email.
NAVY = "#011E41"
RED = "#ee2435"
BORDER = "#e5e7eb"
GREEN = "#1f8a5b"
MUTED = "#6b7280"


# --------------------------------------------------------------------------- #
# Public: questions + submission
# --------------------------------------------------------------------------- #

@frappe.whitelist(allow_guest=True)
def get_public_questions(phase):
	"""Return the (sanitised) questions for a phase, ordered by display order.

	Scores and the `is_correct` flag are deliberately stripped, because guests must
	never see the answer key.
	"""
	return _public_questions(phase)


def _public_questions(phase):
	if phase not in VALID_PHASES:
		frappe.throw(_("Invalid assessment phase"))

	questions = frappe.get_all(
		"FS Assessment Question",
		filters={"phase": ["in", [phase, "Both"]]},
		fields=[
			"name",
			"question_text",
			"question_type",
			"phase",
			"display_order",
			"is_required",
			"has_followup",
			"help_text",
			"followup_prompt",
		],
		order_by="display_order asc, creation asc",
	)

	for q in questions:
		if q.question_type in ("Single Choice", "Multiple Choice"):
			q["options"] = frappe.get_all(
				"FS Assessment Option",
				filters={"parent": q.name, "parenttype": "FS Assessment Question"},
				fields=["option_text"],
				order_by="idx asc",
				pluck="option_text",
			)
		else:
			q["options"] = []

	return questions


@frappe.whitelist(allow_guest=True)
def submit_assessment(payload):
	"""Create an FS Assessment Response from a public submission.

	The server recomputes the score from the question configuration in
	`FSAssessmentResponse.validate()`, so the client never sends scores.
	"""
	data = payload if isinstance(payload, dict) else json.loads(payload or "{}")

	respondent_name = (data.get("respondent_name") or "").strip()
	phase = data.get("phase")

	if not respondent_name:
		frappe.throw(_("Your name is required"))
	if phase not in VALID_PHASES:
		frappe.throw(_("Invalid assessment phase"))

	national_society = data.get("national_society") or None
	if national_society and not frappe.db.exists("National Society", national_society):
		frappe.throw(_("Unknown National Society"))

	activity = data.get("activity") or None
	if activity and not frappe.db.exists("FS Activity", activity):
		frappe.throw(_("Unknown activity"))

	# Normalise the email so pre/post pairing (by email within the activity) is
	# reliable regardless of how the respondent typed it.
	email = (data.get("email") or "").strip().lower() or None

	doc = frappe.get_doc(
		{
			"doctype": "FS Assessment Response",
			"respondent_name": respondent_name,
			"email": email,
			"national_society": national_society,
			"activity": activity,
			"phase": phase,
		}
	)

	for ans in data.get("answers") or []:
		question = ans.get("question")
		if not question:
			continue
		selected = ans.get("selected_options") or []
		if not isinstance(selected, list):
			selected = [selected]
		doc.append(
			"answers",
			{
				"question": question,
				"selected_options": json.dumps(selected) if selected else "",
				"narrative_answer": (ans.get("narrative_answer") or "").strip() or None,
			},
		)

	for row in data.get("action_plan") or []:
		if not any((row.get("action_item"), row.get("timeline"), row.get("expected_outcome"))):
			continue
		doc.append(
			"action_plan",
			{
				"action_item": row.get("action_item"),
				"timeline": row.get("timeline"),
				"expected_outcome": row.get("expected_outcome"),
			},
		)

	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	# Post-processing. Each step is best-effort so a failure never prevents the
	# respondent from getting their "recorded" confirmation in the browser.
	comparison = _apply_score_comparison(doc)
	_record_participant_progress(doc)
	email_sent = _send_confirmation_email(doc, comparison)
	_notify_admin(doc, comparison)

	return {
		"name": doc.name,
		"total_score": doc.total_score,
		"max_score": doc.max_score,
		"percentage": round(flt(doc.percentage), 1),
		"baseline_percentage": comparison.get("baseline_percentage"),
		"score_change": comparison.get("score_change"),
		"email_sent": email_sent,
	}


# --------------------------------------------------------------------------- #
# Pre/Post pairing + participant progress
# --------------------------------------------------------------------------- #

def _apply_score_comparison(doc):
	"""For a Post response, find this person's Pre response in the same activity
	(matched by email) and store the baseline + change. Returns a dict consumed
	by the API response and the confirmation email.
	"""
	result = {"baseline_percentage": None, "score_change": None}
	if doc.phase != "Post" or not doc.email or not doc.activity or flt(doc.max_score) <= 0:
		return result

	pre = frappe.get_all(
		"FS Assessment Response",
		filters={
			"activity": doc.activity,
			"phase": "Pre",
			"email": doc.email,
			"max_score": [">", 0],
		},
		fields=["percentage"],
		order_by="creation desc",
		limit=1,
	)
	if not pre:
		return result

	baseline = round(flt(pre[0].percentage), 1)
	current = round(flt(doc.percentage), 1)
	change = round(current - baseline, 1)

	doc.db_set("baseline_percentage", baseline, update_modified=False)
	doc.db_set("score_change", change, update_modified=False)

	result["baseline_percentage"] = baseline
	result["score_change"] = change
	return result


def _record_participant_progress(doc):
	"""Tick the participant's pre/post completion flag on the activity."""
	if not doc.activity or not doc.email:
		return
	field = "pre_completed" if doc.phase == "Pre" else "post_completed"
	try:
		rows = frappe.get_all(
			"FS Activity Participant",
			filters={"parent": doc.activity, "parenttype": "FS Activity", "email": doc.email},
			pluck="name",
		)
		for row_name in rows:
			frappe.db.set_value("FS Activity Participant", row_name, field, 1, update_modified=False)
		if rows:
			frappe.db.commit()
	except Exception:
		frappe.log_error(title="FS participant progress update failed", message=frappe.get_traceback())


# --------------------------------------------------------------------------- #
# Admin: send invitations (role-gated, called from the FS Activity Desk form)
# --------------------------------------------------------------------------- #

@frappe.whitelist()
def send_pre_invitations(activity):
	"""Email the pre-assessment link to every participant of an activity."""
	return _send_invitations(activity, "Pre")


@frappe.whitelist()
def send_post_invitations(activity):
	"""Email the post-assessment link to every participant of an activity."""
	return _send_invitations(activity, "Post")


def _send_invitations(activity, phase):
	_check_dashboard_access()
	if phase not in VALID_PHASES:
		frappe.throw(_("Invalid assessment phase"))

	act = frappe.get_doc("FS Activity", activity)
	invited_field = "pre_invited" if phase == "Pre" else "post_invited"

	sent = 0
	skipped = 0
	for participant in act.participants:
		email = (participant.email or "").strip().lower()
		if not email:
			skipped += 1
			continue
		try:
			frappe.sendmail(
				recipients=[email],
				subject=_invitation_subject(act, phase),
				message=_build_invitation_html(act, participant, phase),
				reference_doctype="FS Activity",
				reference_name=act.name,
				delayed=False,
			)
			frappe.db.set_value(
				"FS Activity Participant", participant.name, invited_field, 1, update_modified=False
			)
			sent += 1
		except Exception:
			frappe.log_error(title="FS invitation email failed", message=frappe.get_traceback())
			skipped += 1

	new_status = "Pre-Assessment Sent" if phase == "Pre" else "In Progress"
	frappe.db.set_value("FS Activity", act.name, "status", new_status, update_modified=False)
	frappe.db.commit()
	return {"sent": sent, "skipped": skipped}


# --------------------------------------------------------------------------- #
# Admin: dashboard analytics (role-gated)
# --------------------------------------------------------------------------- #

@frappe.whitelist()
def get_dashboard_data(national_society=None, phase=None, activity=None):
	"""Aggregated analytics for the admin dashboard."""
	_check_dashboard_access()

	filters = {}
	if national_society:
		filters["national_society"] = national_society
	if activity:
		filters["activity"] = activity
	if phase in VALID_PHASES:
		filters["phase"] = phase

	responses = frappe.get_all(
		"FS Assessment Response",
		filters=filters,
		fields=[
			"name",
			"respondent_name",
			"national_society",
			"activity",
			"phase",
			"total_score",
			"max_score",
			"percentage",
			"submitted_on",
			"creation",
		],
		order_by="creation desc",
	)

	response_meta = {r.name: r for r in responses}
	response_names = list(response_meta.keys())

	# Headline stats ------------------------------------------------------- #
	total = len(responses)
	scored = [r for r in responses if flt(r.max_score) > 0]
	avg_pct = round(sum(flt(r.percentage) for r in scored) / len(scored), 1) if scored else 0

	def _phase_avg(p):
		rows = [r for r in scored if r.phase == p]
		return round(sum(flt(r.percentage) for r in rows) / len(rows), 1) if rows else 0

	pre_average = _phase_avg("Pre")
	post_average = _phase_avg("Post")

	stats = {
		"total_responses": total,
		"average_percentage": avg_pct,
		"pre_count": sum(1 for r in responses if r.phase == "Pre"),
		"post_count": sum(1 for r in responses if r.phase == "Post"),
		"pre_average": pre_average,
		"post_average": post_average,
		# Cohort-level movement: average post minus average pre.
		"improvement": round(post_average - pre_average, 1),
	}

	# Per-question aggregates (in display order) --------------------------- #
	questions = frappe.get_all(
		"FS Assessment Question",
		fields=["name", "question_text", "question_type", "phase", "display_order", "is_scored"],
		order_by="display_order asc, creation asc",
	)

	answers = []
	if response_names:
		answers = frappe.get_all(
			"FS Assessment Answer",
			filters={"parent": ["in", response_names], "parenttype": "FS Assessment Response"},
			fields=["parent", "question", "selected_options", "narrative_answer", "awarded_score", "max_score"],
		)

	answers_by_question = {}
	for a in answers:
		answers_by_question.setdefault(a.question, []).append(a)

	question_cards = []
	for q in questions:
		card = {
			"name": q.name,
			"question_text": q.question_text,
			"question_type": q.question_type,
			"phase": q.phase,
			"is_scored": q.is_scored,
			"response_count": 0,
		}
		q_answers = answers_by_question.get(q.name, [])

		if q.question_type in ("Single Choice", "Multiple Choice", "Yes/No"):
			counts = {}
			for a in q_answers:
				for opt in _parse_selected(a.selected_options):
					counts[opt] = counts.get(opt, 0) + 1
					card["response_count"] += 1
			# Mark the correct options so the chart can highlight them.
			correct = set()
			if q.question_type != "Yes/No":
				correct = set(
					frappe.get_all(
						"FS Assessment Option",
						filters={"parent": q.name, "parenttype": "FS Assessment Question", "is_correct": 1},
						pluck="option_text",
					)
				)
			card["distribution"] = [
				{"label": opt, "count": cnt, "is_correct": opt in correct}
				for opt, cnt in sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
			]
		else:  # Narrative / Action Matrix -> qualitative
			texts = []
			for a in q_answers:
				if a.narrative_answer:
					meta = response_meta.get(a.parent)
					texts.append(
						{
							"national_society": meta.national_society if meta else None,
							"phase": meta.phase if meta else None,
							"text": a.narrative_answer,
						}
					)
			card["response_count"] = len(texts)
			card["qualitative"] = texts

		question_cards.append(card)

	# Action plans (Q13 matrix) ------------------------------------------- #
	action_items = []
	if response_names:
		rows = frappe.get_all(
			"FS Action Plan Item",
			filters={"parent": ["in", response_names], "parenttype": "FS Assessment Response"},
			fields=["parent", "action_item", "timeline", "expected_outcome"],
		)
		for row in rows:
			meta = response_meta.get(row.parent)
			action_items.append(
				{
					"national_society": meta.national_society if meta else None,
					"action_item": row.action_item,
					"timeline": row.timeline,
					"expected_outcome": row.expected_outcome,
				}
			)

	# Recent submissions --------------------------------------------------- #
	recent = [
		{
			"name": r.name,
			"respondent_name": r.respondent_name,
			"national_society": r.national_society,
			"activity": r.activity,
			"phase": r.phase,
			"percentage": round(flt(r.percentage), 1),
			"max_score": flt(r.max_score),
			"submitted_on": str(r.submitted_on or r.creation),
		}
		for r in responses[:25]
	]

	return {
		"stats": stats,
		"questions": question_cards,
		"action_items": action_items,
		"recent": recent,
		"national_societies": _national_society_options(),
		"activities": _activity_options(),
	}


@frappe.whitelist()
def get_responses(national_society=None, phase=None, activity=None):
	"""List all assessment responses (role-gated) for the admin responses page."""
	_check_dashboard_access()

	filters = {}
	if national_society:
		filters["national_society"] = national_society
	if activity:
		filters["activity"] = activity
	if phase in VALID_PHASES:
		filters["phase"] = phase

	rows = frappe.get_all(
		"FS Assessment Response",
		filters=filters,
		fields=[
			"name",
			"respondent_name",
			"email",
			"national_society",
			"activity",
			"phase",
			"total_score",
			"max_score",
			"percentage",
			"baseline_percentage",
			"score_change",
			"submitted_on",
			"creation",
		],
		order_by="creation desc",
	)

	ns_names = {}
	activity_names = {}
	for r in rows:
		if r.national_society and r.national_society not in ns_names:
			ns_names[r.national_society] = frappe.db.get_value(
				"National Society", r.national_society, "national_society_name"
			)
		if r.activity and r.activity not in activity_names:
			activity_names[r.activity] = frappe.db.get_value("FS Activity", r.activity, "activity_name")
		r["national_society_name"] = ns_names.get(r.national_society)
		r["activity_name"] = activity_names.get(r.activity)
		r["percentage"] = round(flt(r.percentage), 1)
		r["submitted_on"] = str(r.submitted_on or r.creation)

	return {
		"responses": rows,
		"national_societies": _national_society_options(),
		"activities": _activity_options(),
	}


@frappe.whitelist()
def get_response_detail(name):
	"""Full detail of one response (role-gated): answers + action plan."""
	_check_dashboard_access()

	doc = frappe.get_doc("FS Assessment Response", name)

	answers = [
		{
			"question": a.question,
			"question_text": a.question_text,
			"question_type": a.question_type,
			"selected_options": _parse_selected(a.selected_options),
			"narrative_answer": a.narrative_answer,
			"awarded_score": flt(a.awarded_score),
			"max_score": flt(a.max_score),
		}
		for a in doc.answers
	]
	action_plan = [
		{
			"action_item": r.action_item,
			"timeline": r.timeline,
			"expected_outcome": r.expected_outcome,
		}
		for r in doc.action_plan
	]

	return {
		"name": doc.name,
		"respondent_name": doc.respondent_name,
		"email": doc.email,
		"national_society": doc.national_society,
		"national_society_name": frappe.db.get_value(
			"National Society", doc.national_society, "national_society_name"
		)
		if doc.national_society
		else None,
		"activity": doc.activity,
		"activity_name": frappe.db.get_value("FS Activity", doc.activity, "activity_name")
		if doc.activity
		else None,
		"phase": doc.phase,
		"submitted_on": str(doc.submitted_on),
		"total_score": flt(doc.total_score),
		"max_score": flt(doc.max_score),
		"percentage": round(flt(doc.percentage), 1),
		"baseline_percentage": round(flt(doc.baseline_percentage), 1) if doc.baseline_percentage is not None else None,
		"score_change": round(flt(doc.score_change), 1) if doc.score_change is not None else None,
		"answers": answers,
		"action_plan": action_plan,
	}


def _check_dashboard_access():
	if not DASHBOARD_ROLES.intersection(set(frappe.get_roles())):
		frappe.throw(_("Not permitted"), frappe.PermissionError)


def _national_society_options():
	return frappe.get_all(
		"National Society",
		fields=["name", "national_society_name"],
		order_by="national_society_name asc",
	)


def _activity_options():
	return frappe.get_all(
		"FS Activity",
		fields=["name", "activity_name"],
		order_by="activity_date desc",
	)


# --------------------------------------------------------------------------- #
# Admin: activity CRUD (role-gated, used by the ans-hub Activities page)
# --------------------------------------------------------------------------- #

@frappe.whitelist()
def list_activities():
	"""List activities with participant + completion counts (role-gated)."""
	_check_dashboard_access()
	activities = frappe.get_all(
		"FS Activity",
		fields=["name", "activity_name", "country", "activity_date", "status", "creation"],
		order_by="activity_date desc, creation desc",
	)
	for a in activities:
		parts = frappe.get_all(
			"FS Activity Participant",
			filters={"parent": a.name, "parenttype": "FS Activity"},
			fields=["pre_completed", "post_completed"],
		)
		a["participant_count"] = len(parts)
		a["pre_completed"] = sum(1 for p in parts if p.pre_completed)
		a["post_completed"] = sum(1 for p in parts if p.post_completed)
		a["activity_date"] = str(a.activity_date) if a.activity_date else None
	return {"activities": activities}


@frappe.whitelist()
def get_activity(name):
	"""Return one activity with its participant rows (role-gated)."""
	_check_dashboard_access()
	doc = frappe.get_doc("FS Activity", name)
	return {
		"name": doc.name,
		"activity_name": doc.activity_name,
		"country": doc.country,
		"activity_date": str(doc.activity_date) if doc.activity_date else None,
		"description": doc.description,
		"notification_email": doc.notification_email,
		"status": doc.status,
		"participants": [
			{
				"participant_name": p.participant_name,
				"email": p.email,
				"national_society": p.national_society,
				"pre_invited": p.pre_invited,
				"pre_completed": p.pre_completed,
				"post_invited": p.post_invited,
				"post_completed": p.post_completed,
			}
			for p in doc.participants
		],
	}


@frappe.whitelist()
def save_activity(payload):
	"""Create or update an activity and its participants (role-gated).

	Each participant's invited/completed flags are carried over by email, so
	editing an activity after invitations were sent never resets progress.
	"""
	_check_dashboard_access()
	data = payload if isinstance(payload, dict) else json.loads(payload or "{}")

	activity_name = (data.get("activity_name") or "").strip()
	activity_date = data.get("activity_date") or None
	if not activity_name:
		frappe.throw(_("Activity name is required"))
	if not activity_date:
		frappe.throw(_("Activity date is required"))

	name = data.get("name")
	if name and frappe.db.exists("FS Activity", name):
		doc = frappe.get_doc("FS Activity", name)
	else:
		doc = frappe.new_doc("FS Activity")

	# Snapshot existing participant progress (keyed by lower-cased email).
	existing = {(p.email or "").strip().lower(): p for p in doc.get("participants", [])}

	doc.activity_name = activity_name
	doc.country = data.get("country") or None
	doc.activity_date = activity_date
	doc.description = data.get("description") or None
	doc.notification_email = (data.get("notification_email") or "").strip() or None

	doc.set("participants", [])
	for row in data.get("participants") or []:
		email = (row.get("email") or "").strip()
		if not email:
			continue
		prev = existing.get(email.lower())
		doc.append(
			"participants",
			{
				"participant_name": row.get("participant_name"),
				"email": email,
				"national_society": row.get("national_society") or None,
				"pre_invited": prev.pre_invited if prev else 0,
				"pre_completed": prev.pre_completed if prev else 0,
				"post_invited": prev.post_invited if prev else 0,
				"post_completed": prev.post_completed if prev else 0,
			},
		)

	doc.save(ignore_permissions=True)
	frappe.db.commit()
	return {"name": doc.name, "activity_name": doc.activity_name}


def _parse_selected(raw):
	if not raw:
		return []
	if isinstance(raw, list):
		return raw
	try:
		value = json.loads(raw)
		return value if isinstance(value, list) else [value]
	except (ValueError, TypeError):
		return [raw]


# --------------------------------------------------------------------------- #
# Email: shared shell + builders
# --------------------------------------------------------------------------- #

def _fmt_num(value):
	"""Render scores without a trailing ``.0`` for whole numbers."""
	value = flt(value)
	return int(value) if value == int(value) else round(value, 1)


def _assessment_link(activity_name, phase, email=None):
	path = "/fs-assessment?phase={0}&activity={1}".format(phase.lower(), quote(activity_name))
	if email:
		path += "&email=" + quote(email)
	return get_url(path)


def _email_shell(heading, meta_line, body_html):
	"""Wrap a body fragment in the branded header/footer used by every FS email."""
	logo_url = get_url("/assets/onerc_knowledge_hub/ans-hub/logo.jpg")
	meta_html = (
		f'<div style="color:{MUTED};font-size:13px;margin:0 0 18px;">{meta_line}</div>'
		if meta_line
		else ""
	)
	return f"""
	<div style="font-family:'Google Sans',system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;background:#f0f2f5;padding:24px;">
		<div style="background:{NAVY};padding:24px 28px;border-radius:6px 6px 0 0;">
			<table cellspacing="0" cellpadding="0"><tr>
				<td style="padding-right:14px;"><img src="{logo_url}" alt="" width="40" height="40" style="display:block;border-radius:4px;background:#ffffff;" /></td>
				<td>
					<div style="color:#ff8a80;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;">{escape_html(_('Peer Learning'))}</div>
					<div style="color:#ffffff;font-size:16px;font-weight:600;">{escape_html(_('Financial Sustainability Assessment'))}</div>
				</td>
			</tr></table>
		</div>
		<div style="background:#ffffff;border:1px solid {BORDER};border-top:none;padding:32px 28px;">
			<h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 6px;">{heading}</h1>
			{meta_html}
			{body_html}
		</div>
		<div style="background:#f9fafb;padding:20px 28px;text-align:center;border:1px solid {BORDER};border-top:none;border-radius:0 0 6px 6px;">
			<p style="color:#9ca3af;font-size:12px;margin:0;">&copy; 2026 Kenya Red Cross Society &middot; Africa Localisation Hub</p>
		</div>
	</div>
	"""


def _score_badge_html(percentage, total_score, max_score):
	return f"""
	<div style="text-align:center;margin:4px 0 20px;">
		<div style="display:inline-block;background:{NAVY};color:#ffffff;border-radius:8px;padding:18px 40px;">
			<div style="font-size:38px;font-weight:700;line-height:1;">{_fmt_num(percentage)}%</div>
			<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.8;margin-top:8px;">{escape_html(_('Your score'))}</div>
			<div style="font-size:12px;opacity:.7;margin-top:6px;">{_fmt_num(total_score)} {escape_html(_('of'))} {_fmt_num(max_score)} {escape_html(_('points'))}</div>
		</div>
	</div>"""


def _comparison_html(baseline, current, change):
	raw = flt(change)
	if raw > 0:
		color, arrow, verdict = GREEN, "&#9650;", _("Improved by {0} pts").format(_fmt_num(abs(raw)))
	elif raw < 0:
		color, arrow, verdict = RED, "&#9660;", _("Declined by {0} pts").format(_fmt_num(abs(raw)))
	else:
		color, arrow, verdict = MUTED, "&#9644;", _("No change since the pre-assessment")
	return f"""
	<div style="background:#f9fafb;border:1px solid {BORDER};border-radius:6px;padding:18px 20px;margin:0 0 20px;text-align:center;">
		<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};margin-bottom:10px;">{escape_html(_('Your progress'))}</div>
		<div style="font-size:15px;color:#4b5563;">{escape_html(_('Pre'))}: <strong>{_fmt_num(baseline)}%</strong> &nbsp;&rarr;&nbsp; {escape_html(_('Post'))}: <strong>{_fmt_num(current)}%</strong></div>
		<div style="display:inline-block;margin-top:10px;background:{color};color:#ffffff;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;">{arrow}&nbsp;{escape_html(verdict)}</div>
	</div>"""


def _answers_html(doc):
	blocks = []
	num = 0
	for ans in doc.answers:
		num += 1
		q_text = escape_html(ans.question_text or "")
		selected = _parse_selected(ans.selected_options)
		if selected:
			answer_html = ", ".join(escape_html(s) for s in selected)
			if ans.narrative_answer:
				answer_html += f'<div style="color:{MUTED};margin-top:4px;">{escape_html(ans.narrative_answer)}</div>'
		elif ans.narrative_answer:
			answer_html = escape_html(ans.narrative_answer).replace("\n", "<br>")
		else:
			answer_html = f'<span style="color:#9ca3af;">{escape_html(_("No answer provided"))}</span>'
		blocks.append(
			f"""
		<div style="padding:16px 0;border-top:1px solid {BORDER};">
			<div style="color:#111827;font-weight:600;font-size:15px;margin-bottom:6px;">
				<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:{NAVY};color:#ffffff;border-radius:4px;font-size:12px;margin-right:8px;">{num}</span>{q_text}
			</div>
			<div style="color:#4b5563;font-size:14px;line-height:1.6;padding-left:32px;">{answer_html}</div>
		</div>"""
		)
	if not blocks:
		return ""
	return f"""
	<div style="background:#ffffff;border:1px solid {BORDER};border-radius:6px;padding:8px 24px 24px;margin-top:8px;">
		<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};padding-top:20px;">{escape_html(_('Your responses'))}</div>
		{''.join(blocks)}
	</div>"""


def _action_plan_html(doc):
	if not doc.action_plan:
		return ""
	rows = []
	for row in doc.action_plan:
		cells = [
			escape_html(row.action_item or "-"),
			escape_html(row.timeline or "-"),
			escape_html(row.expected_outcome or "-"),
		]
		tds = "".join(
			f'<td style="padding:10px;border:1px solid {BORDER};vertical-align:top;">{c}</td>' for c in cells
		)
		rows.append(f"<tr>{tds}</tr>")
	headers = "".join(
		f'<th style="text-align:left;padding:10px;border:1px solid {BORDER};font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:{MUTED};">{escape_html(h)}</th>'
		for h in (_("Action Item"), _("Timeline"), _("Expected Outcome"))
	)
	return f"""
	<div style="background:#ffffff;border:1px solid {BORDER};border-radius:6px;padding:24px;margin-top:16px;">
		<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};margin-bottom:14px;">{escape_html(_('Your action plan'))}</div>
		<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;color:#4b5563;">
			<thead style="background:#f3f4f6;"><tr>{headers}</tr></thead>
			<tbody>{''.join(rows)}</tbody>
		</table>
	</div>"""


def _response_meta_line(doc, phase_label):
	bits = [escape_html(phase_label)]
	if doc.activity:
		activity_name = frappe.db.get_value("FS Activity", doc.activity, "activity_name")
		if activity_name:
			bits.append(escape_html(activity_name))
	if doc.national_society:
		ns_name = frappe.db.get_value("National Society", doc.national_society, "national_society_name")
		if ns_name:
			bits.append(escape_html(ns_name))
	return " &middot; ".join(bits)


def _build_confirmation_html(doc, comparison):
	"""The confirmation email: a copy of the respondent's answers and score."""
	name = escape_html(doc.respondent_name or "there")
	phase_label = "Pre-Assessment" if doc.phase == "Pre" else "Post-Assessment"

	if doc.phase == "Pre":
		intro = _(
			"Thank you for completing the pre-assessment. We'll revisit these themes "
			"together during the peer-learning engagement. Here is a copy of your "
			"responses, with your score, for your records."
		)
	else:
		intro = _(
			"Thank you for completing the post-assessment and sharing your action plan. "
			"Here is a copy of your responses, with your score, for your records."
		)

	parts = [
		f'<p style="color:#4b5563;line-height:1.6;margin:0 0 8px;">{escape_html(_("Dear {0},")).format(name)}</p>',
		f'<p style="color:#4b5563;line-height:1.6;margin:0 0 8px;">{escape_html(intro)}</p>',
	]

	if flt(doc.max_score) > 0:
		parts.append(_score_badge_html(round(flt(doc.percentage), 1), doc.total_score, doc.max_score))

	if doc.phase == "Post" and comparison.get("baseline_percentage") is not None:
		parts.append(
			_comparison_html(
				comparison["baseline_percentage"], round(flt(doc.percentage), 1), comparison["score_change"]
			)
		)

	parts.append(_answers_html(doc))
	parts.append(_action_plan_html(doc))

	return _email_shell(escape_html(_("Response recorded")), _response_meta_line(doc, phase_label), "".join(parts))


def _invitation_subject(act, phase):
	if phase == "Pre":
		return _("Action needed: Pre-Assessment for {0}").format(act.activity_name)
	return _("Now open: Post-Assessment for {0}").format(act.activity_name)


def _build_invitation_html(act, participant, phase):
	name = escape_html(participant.participant_name or "there")
	email = (participant.email or "").strip().lower() or None
	link = _assessment_link(act.name, phase, email)
	activity_name = escape_html(act.activity_name or "")

	detail_bits = []
	if act.activity_date:
		detail_bits.append(escape_html(frappe.utils.formatdate(act.activity_date)))
	if act.country:
		detail_bits.append(escape_html(act.country))
	detail_line = " &middot; ".join(detail_bits)

	if phase == "Pre":
		heading = _("You're invited: Pre-Assessment")
		lead = _(
			'You have been invited to take part in the Financial Sustainability peer-learning '
			'engagement "{0}". Please complete this short pre-assessment <strong>before</strong> the '
			'engagement so we can tailor the dialogue and measure what you take away from it.'
		).format(activity_name)
		cta = _("Start Pre-Assessment")
	else:
		heading = _("Now open: Post-Assessment")
		lead = _(
			'Thank you for taking part in "{0}". Please complete the post-assessment to capture what '
			'you learned, see how your understanding has grown, and record your action plan.'
		).format(activity_name)
		cta = _("Start Post-Assessment")

	body = f"""
	<p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">{escape_html(_('Dear {0},')).format(name)}</p>
	<p style="color:#4b5563;line-height:1.6;margin:0 0 20px;">{lead}</p>
	<div style="text-align:center;margin:24px 0;">
		<a href="{link}" style="display:inline-block;padding:14px 30px;background:{RED};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">{escape_html(cta)}</a>
	</div>
	<p style="color:{MUTED};font-size:13px;line-height:1.6;margin:0;">{escape_html(_('Or paste this link into your browser:'))}<br><a href="{link}" style="color:{RED};word-break:break-all;">{link}</a></p>
	"""
	return _email_shell(escape_html(heading), detail_line, body)


def _build_admin_html(doc, comparison):
	phase_label = "Pre-Assessment" if doc.phase == "Pre" else "Post-Assessment"

	rows = [
		(_("Respondent"), escape_html(doc.respondent_name or "")),
		(_("Email"), escape_html(doc.email or "-")),
		(_("Phase"), escape_html(phase_label)),
	]
	if doc.activity:
		activity_name = frappe.db.get_value("FS Activity", doc.activity, "activity_name")
		if activity_name:
			rows.append((_("Activity"), escape_html(activity_name)))
	if doc.national_society:
		ns_name = frappe.db.get_value("National Society", doc.national_society, "national_society_name")
		if ns_name:
			rows.append((_("National Society"), escape_html(ns_name)))
	if flt(doc.max_score) > 0:
		rows.append(
			(_("Score"), f"{_fmt_num(round(flt(doc.percentage), 1))}% ({_fmt_num(doc.total_score)}/{_fmt_num(doc.max_score)})")
		)
	if doc.phase == "Post" and comparison.get("score_change") is not None:
		rows.append((_("Change vs Pre"), f"{_fmt_num(comparison['score_change'])} pts"))

	table_rows = "".join(
		f'<tr><td style="padding:6px 10px;color:{MUTED};font-size:13px;border-bottom:1px solid {BORDER};white-space:nowrap;">{label}</td>'
		f'<td style="padding:6px 10px;color:#111827;font-size:13px;border-bottom:1px solid {BORDER};">{value}</td></tr>'
		for label, value in rows
	)
	link = get_url("/app/fs-assessment-response/" + quote(doc.name))
	body = f"""
	<p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">{escape_html(_('A new assessment response has been submitted.'))}</p>
	<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">{table_rows}</table>
	<div style="margin-top:20px;"><a href="{link}" style="color:{RED};font-weight:600;text-decoration:none;">{escape_html(_('View the full response'))} &rarr;</a></div>
	"""
	return _email_shell(escape_html(_("New assessment response")), "", body)


# --------------------------------------------------------------------------- #
# Email: senders (all best-effort)
# --------------------------------------------------------------------------- #

def _send_confirmation_email(doc, comparison):
	"""Email the respondent a formatted copy of their answers and score."""
	if not doc.email:
		return False
	try:
		phase_label = "Pre-Assessment" if doc.phase == "Pre" else "Post-Assessment"
		frappe.sendmail(
			recipients=[doc.email],
			subject=_("Your Financial Sustainability {0} response").format(phase_label),
			message=_build_confirmation_html(doc, comparison),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
		return True
	except Exception:
		frappe.log_error(title="FS assessment confirmation email failed", message=frappe.get_traceback())
		return False


def _activity_notification_recipient(activity):
	if not activity:
		return None
	info = frappe.db.get_value("FS Activity", activity, ["notification_email", "owner"], as_dict=True)
	if not info:
		return None
	recipient = (info.notification_email or "").strip() or info.owner
	if recipient in (None, "", "Guest", "Administrator"):
		return None
	return recipient


def _notify_admin(doc, comparison):
	"""Notify the activity owner (or configured address) that a response arrived."""
	recipient = _activity_notification_recipient(doc.activity)
	if not recipient:
		return
	try:
		frappe.sendmail(
			recipients=[recipient],
			subject=_("New {0} response: {1}").format(doc.phase, doc.respondent_name),
			message=_build_admin_html(doc, comparison),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
	except Exception:
		frappe.log_error(title="FS admin notification failed", message=frappe.get_traceback())
