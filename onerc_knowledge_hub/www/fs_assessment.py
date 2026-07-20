# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import json

import frappe

from onerc_knowledge_hub.api.assessment import _public_questions

no_cache = 1

PHASE_MAP = {"pre": "Pre", "post": "Post"}


def get_context(context):
	context.no_cache = 1

	phase = PHASE_MAP.get((frappe.form_dict.get("phase") or "").lower())
	context.phase = phase
	context.activity = None
	context.prefill = {}

	if phase:
		context.questions = _public_questions(phase)
		# `</` is escaped so the JSON can be embedded safely inside a <script> tag.
		context.questions_json = json.dumps(context.questions).replace("</", "<\\/")
		context.national_societies = frappe.get_all(
			"National Society",
			fields=["name", "national_society_name"],
			order_by="national_society_name asc",
		)
		_load_activity(context)
	else:
		context.questions = []
		context.questions_json = "[]"
		context.national_societies = []

	return context


def _load_activity(context):
	"""When the form is opened from an invitation link (?activity=&email=),
	surface the activity details and prefill the invited participant."""
	activity_id = frappe.form_dict.get("activity")
	if not activity_id or not frappe.db.exists("FS Activity", activity_id):
		return

	act = frappe.db.get_value(
		"FS Activity",
		activity_id,
		["name", "activity_name", "country", "activity_date"],
		as_dict=True,
	)
	context.activity = {
		"name": act.name,
		"activity_name": act.activity_name,
		"country": act.country,
		"activity_date": frappe.utils.formatdate(act.activity_date) if act.activity_date else None,
	}

	email = (frappe.form_dict.get("email") or "").strip().lower()
	if not email:
		return

	context.prefill["email"] = email
	participant = frappe.db.get_value(
		"FS Activity Participant",
		{"parent": activity_id, "parenttype": "FS Activity", "email": email},
		["participant_name", "national_society"],
		as_dict=True,
	)
	if participant:
		context.prefill["respondent_name"] = participant.participant_name
		context.prefill["national_society"] = participant.national_society
