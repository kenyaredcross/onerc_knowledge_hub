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

	if phase:
		context.questions = _public_questions(phase)
		# `</` is escaped so the JSON can be embedded safely inside a <script> tag.
		context.questions_json = json.dumps(context.questions).replace("</", "<\\/")
		context.national_societies = frappe.get_all(
			"National Society",
			fields=["name", "national_society_name"],
			order_by="national_society_name asc",
		)
	else:
		context.questions = []
		context.questions_json = "[]"
		context.national_societies = []

	return context
