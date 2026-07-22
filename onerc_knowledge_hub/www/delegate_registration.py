# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.utils import formatdate

no_cache = 1


def get_context(context):
	context.no_cache = 1

	settings = frappe.get_cached_doc("Delegate Registration Settings")
	context.event_title = (settings.get("event_title") or "").strip() or "Delegate Registration"
	context.boma_hotel_url = (settings.get("boma_hotel_url") or "").strip()

	context.national_societies = frappe.get_all(
		"National Society",
		fields=["name", "national_society_name"],
		order_by="national_society_name asc",
	)

	context.countries = frappe.get_all("Country", pluck="name", order_by="name asc")

	sessions = frappe.get_all(
		"Summit Session",
		filters={"is_published": 1},
		fields=["name", "session_title", "session_date", "start_time", "end_time", "venue", "description"],
		order_by="display_order asc, session_date asc, start_time asc",
	)
	for s in sessions:
		s["session_date"] = formatdate(s["session_date"]) if s.get("session_date") else None
		s["start_time"] = _fmt_time(s.get("start_time"))
		s["end_time"] = _fmt_time(s.get("end_time"))
	context.sessions = sessions
	# `</` is escaped so the JSON can be embedded safely inside a <script> tag.
	context.sessions_json = json.dumps(sessions).replace("</", "<\\/")

	return context


def _fmt_time(value):
	"""Render a Time field (timedelta or "HH:MM:SS" string) as "HH:MM"."""
	if value in (None, ""):
		return ""
	parts = str(value).split(":")
	if len(parts) >= 2:
		return "{0}:{1}".format(parts[0].zfill(2), parts[1])
	return str(value)
