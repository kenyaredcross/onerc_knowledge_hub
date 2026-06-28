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
from frappe.utils import flt

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

	return {
		"name": doc.name,
		"total_score": doc.total_score,
		"max_score": doc.max_score,
		"percentage": round(flt(doc.percentage), 1),
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
