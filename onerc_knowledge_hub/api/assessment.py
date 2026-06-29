# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Public submission + admin analytics for the Financial Sustainability assessment.

The whole assessment is data-driven: questions, options, correct answers and
per-option scores live in the `FS Assessment Question` doctype, so both the
public form and the dashboard adapt automatically to whatever is configured.
"""

import json

import frappe
from frappe import _
from frappe.utils import escape_html, flt, get_url

DASHBOARD_ROLES = {"LH FS Manager", "System Manager"}
VALID_PHASES = ("Pre", "Post")


# --------------------------------------------------------------------------- #
# Public: questions + submission
# --------------------------------------------------------------------------- #

@frappe.whitelist(allow_guest=True)
def get_public_questions(phase):
	"""Return the (sanitised) questions for a phase, ordered by display order.

	Scores and the `is_correct` flag are deliberately stripped — guests must
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

	doc = frappe.get_doc(
		{
			"doctype": "FS Assessment Response",
			"respondent_name": respondent_name,
			"email": (data.get("email") or "").strip() or None,
			"national_society": national_society,
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

	email_sent = _send_confirmation_email(doc)

	return {
		"name": doc.name,
		"total_score": doc.total_score,
		"max_score": doc.max_score,
		"percentage": round(flt(doc.percentage), 1),
		"email_sent": email_sent,
	}


# --------------------------------------------------------------------------- #
# Admin: dashboard analytics (role-gated)
# --------------------------------------------------------------------------- #

@frappe.whitelist()
def get_dashboard_data(national_society=None, phase=None):
	"""Aggregated analytics for the admin dashboard.

	Re-checks the role server-side so the endpoint can't be called by anyone
	who guesses the URL.
	"""
	_check_dashboard_access()

	filters = {}
	if national_society:
		filters["national_society"] = national_society
	if phase in VALID_PHASES:
		filters["phase"] = phase

	responses = frappe.get_all(
		"FS Assessment Response",
		filters=filters,
		fields=[
			"name",
			"respondent_name",
			"national_society",
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

	stats = {
		"total_responses": total,
		"average_percentage": avg_pct,
		"pre_count": sum(1 for r in responses if r.phase == "Pre"),
		"post_count": sum(1 for r in responses if r.phase == "Post"),
		"pre_average": _phase_avg("Pre"),
		"post_average": _phase_avg("Post"),
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
		else:  # Narrative / Action Matrix → qualitative
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
	}


@frappe.whitelist()
def get_responses(national_society=None, phase=None):
	"""List all assessment responses (role-gated) for the admin responses page."""
	_check_dashboard_access()

	filters = {}
	if national_society:
		filters["national_society"] = national_society
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
			"phase",
			"total_score",
			"max_score",
			"percentage",
			"submitted_on",
			"creation",
		],
		order_by="creation desc",
	)

	ns_names = {}
	for r in rows:
		if r.national_society and r.national_society not in ns_names:
			ns_names[r.national_society] = frappe.db.get_value(
				"National Society", r.national_society, "national_society_name"
			)
		r["national_society_name"] = ns_names.get(r.national_society)
		r["percentage"] = round(flt(r.percentage), 1)
		r["submitted_on"] = str(r.submitted_on or r.creation)

	return {"responses": rows, "national_societies": _national_society_options()}


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
		"phase": doc.phase,
		"submitted_on": str(doc.submitted_on),
		"total_score": flt(doc.total_score),
		"max_score": flt(doc.max_score),
		"percentage": round(flt(doc.percentage), 1),
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


# --------------------------------------------------------------------------- #
# Public: confirmation email
# --------------------------------------------------------------------------- #

NAVY = "#011E41"
RED = "#ee2435"
BORDER = "#e5e7eb"


def _send_confirmation_email(doc):
	"""Email the respondent a formatted copy of their answers and score.

	Best-effort: returns True if an email was queued. A mail failure must never
	break the public submission, so everything is wrapped and logged.
	"""
	if not doc.email:
		return False

	try:
		phase_label = "Pre-Assessment" if doc.phase == "Pre" else "Post-Assessment"
		frappe.sendmail(
			recipients=[doc.email],
			subject=_("Your Financial Sustainability {0} response").format(phase_label),
			message=_build_confirmation_html(doc, phase_label),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
		return True
	except Exception:
		frappe.log_error(
			title="FS assessment confirmation email failed",
			message=frappe.get_traceback(),
		)
		return False


def _fmt_num(value):
	"""Render scores without a trailing ``.0`` for whole numbers."""
	value = flt(value)
	return int(value) if value == int(value) else round(value, 1)


def _build_confirmation_html(doc, phase_label):
	"""Build the responsive, email-safe HTML body for the confirmation mail."""
	logo_url = get_url("/assets/onerc_knowledge_hub/ans-hub/logo.jpg")
	ns_name = (
		frappe.db.get_value("National Society", doc.national_society, "national_society_name")
		if doc.national_society
		else None
	)
	name = escape_html(doc.respondent_name or "there")

	# Intro line differs by phase.
	if doc.phase == "Pre":
		intro = _(
			"Thank you for completing the pre-assessment. We'll revisit these "
			"themes together during the peer-learning engagement. Here is a copy "
			"of your responses for your records."
		)
	else:
		intro = _(
			"Thank you for completing the post-assessment and sharing your action "
			"plan. Here is a copy of your responses for your records."
		)

	# Score badge — shown for the post-assessment only, so respondents don't
	# see how they scored before the peer-learning engagement.
	score_html = ""
	if doc.phase == "Post" and flt(doc.max_score) > 0:
		pct = _fmt_num(doc.percentage)
		score_html = f"""
		<div style="text-align:center;margin:4px 0 28px;">
			<div style="display:inline-block;background:{NAVY};color:#ffffff;border-radius:8px;padding:18px 40px;">
				<div style="font-size:38px;font-weight:700;line-height:1;">{pct}%</div>
				<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.8;margin-top:8px;">{escape_html(_('Your score'))}</div>
				<div style="font-size:12px;opacity:.7;margin-top:6px;">{_fmt_num(doc.total_score)} {escape_html(_('of'))} {_fmt_num(doc.max_score)} {escape_html(_('points'))}</div>
			</div>
		</div>"""

	# Answer blocks, in the order the questions were presented.
	answer_blocks = []
	num = 0
	for ans in doc.answers:
		num += 1
		q_text = escape_html(ans.question_text or "")
		selected = _parse_selected(ans.selected_options)
		if selected:
			answer_html = ", ".join(escape_html(s) for s in selected)
			if ans.narrative_answer:
				answer_html += (
					f"<div style=\"color:#6b7280;margin-top:4px;\">{escape_html(ans.narrative_answer)}</div>"
				)
		elif ans.narrative_answer:
			answer_html = escape_html(ans.narrative_answer).replace("\n", "<br>")
		else:
			answer_html = f"<span style=\"color:#9ca3af;\">{escape_html(_('No answer provided'))}</span>"

		answer_blocks.append(f"""
		<div style="padding:16px 0;border-top:1px solid {BORDER};">
			<div style="color:#111827;font-weight:600;font-size:15px;margin-bottom:6px;">
				<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:{NAVY};color:#ffffff;border-radius:4px;font-size:12px;margin-right:8px;">{num}</span>{q_text}
			</div>
			<div style="color:#4b5563;font-size:14px;line-height:1.6;padding-left:32px;">{answer_html}</div>
		</div>""")

	answers_section = ""
	if answer_blocks:
		answers_section = f"""
		<div style="background:#ffffff;border:1px solid {BORDER};border-radius:6px;padding:8px 24px 24px;margin-top:24px;">
			<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};padding-top:20px;">{escape_html(_('Your responses'))}</div>
			{''.join(answer_blocks)}
		</div>"""

	# Action plan table (Q13) — only present for the post-assessment.
	action_section = ""
	if doc.action_plan:
		rows = []
		for row in doc.action_plan:
			cells = [
				escape_html(row.action_item or "—"),
				escape_html(row.timeline or "—"),
				escape_html(row.expected_outcome or "—"),
			]
			tds = "".join(
				f"<td style=\"padding:10px;border:1px solid {BORDER};vertical-align:top;\">{c}</td>"
				for c in cells
			)
			rows.append(f"<tr>{tds}</tr>")
		headers = "".join(
			f"<th style=\"text-align:left;padding:10px;border:1px solid {BORDER};font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;\">{escape_html(h)}</th>"
			for h in (_("Action Item"), _("Timeline"), _("Expected Outcome"))
		)
		action_section = f"""
		<div style="background:#ffffff;border:1px solid {BORDER};border-radius:6px;padding:24px;margin-top:20px;">
			<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};margin-bottom:14px;">{escape_html(_('Your action plan'))}</div>
			<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;color:#4b5563;">
				<thead style="background:#f3f4f6;"><tr>{headers}</tr></thead>
				<tbody>{''.join(rows)}</tbody>
			</table>
		</div>"""

	meta_bits = [escape_html(phase_label)]
	if ns_name:
		meta_bits.append(escape_html(ns_name))
	meta_line = " &middot; ".join(meta_bits)

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
			<h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 6px;">{escape_html(_('Response recorded'))}</h1>
			<div style="color:#6b7280;font-size:13px;margin-bottom:18px;">{meta_line}</div>
			<p style="color:#4b5563;line-height:1.6;margin:0 0 8px;">{escape_html(_('Dear {0},')).format(name)}</p>
			<p style="color:#4b5563;line-height:1.6;margin:0 0 8px;">{escape_html(intro)}</p>
			{score_html}
			{answers_section}
			{action_section}
		</div>

		<div style="background:#f9fafb;padding:20px 28px;text-align:center;border:1px solid {BORDER};border-top:none;border-radius:0 0 6px 6px;">
			<p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 Kenya Red Cross Society &middot; Africa Localisation Hub</p>
		</div>
	</div>
	"""


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
