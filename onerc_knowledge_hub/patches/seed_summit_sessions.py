# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Seed placeholder Summit Sessions so the Delegate Registration form is not empty.

Idempotent: it only creates the test sessions when none exist yet, so it is safe
to re-run and harmless once real sessions have been added.
"""

import frappe

TEST_SESSIONS = [
	{"session_title": "Event 1", "start_time": "09:00:00", "end_time": "10:30:00", "display_order": 1},
	{"session_title": "Event 2", "start_time": "11:00:00", "end_time": "12:30:00", "display_order": 2},
	{"session_title": "Event 3", "start_time": "14:00:00", "end_time": "15:30:00", "display_order": 3},
]


def execute():
	if frappe.db.count("Summit Session"):
		return

	for row in TEST_SESSIONS:
		doc = frappe.new_doc("Summit Session")
		doc.update(row)
		doc.is_published = 1
		doc.insert(ignore_permissions=True)

	frappe.db.commit()
