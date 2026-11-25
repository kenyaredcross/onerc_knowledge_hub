# Copyright (c) 2026, Lennox Mwita and contributors
# For license information, please see license.txt
"""Turn on the Overview page's introductory video section for existing sites.

The `show_intro_video` field carries a default of 1, but a default added to an
existing Single doctype is not backfilled, so sites installed before the field
existed would keep the section hidden. Enabling it here means the orientation
panel shows up straight away; the video itself appears once an administrator
sets a URL or uploads a file in Localization Hub Settings.
"""

import frappe

DOCTYPE = "Localization Hub Settings"
FIELD = "show_intro_video"


def execute():
	if not frappe.db.exists("DocType", DOCTYPE):
		return

	# Respect an explicit choice: only seed the value when it has never been
	# stored. get_single_value cannot be used for this, because it reports a
	# missing Check field as 0 rather than None, and frappe.db.exists does not
	# work on tabSingles because Singles is a plain table, not a DocType.
	already_set = frappe.db.sql(
		"select 1 from tabSingles where doctype = %s and field = %s limit 1",
		(DOCTYPE, FIELD),
	)
	if already_set:
		return

	settings = frappe.get_single(DOCTYPE)
	settings.set(FIELD, 1)
	settings.save(ignore_permissions=True)
	frappe.db.commit()
