# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Public submission for the Localisation Alliance registration form.

Attendees register for the Localisation Alliance for Financial Sustainability
event through the public `/ans-hub/localisation-alliance-2026` page by providing
just their full name, organisation and email. A submission creates a
`Delegate Registration` record; no emails are sent.
"""

import json

import frappe
from frappe import _
from frappe.utils import validate_email_address


@frappe.whitelist(allow_guest=True)
def submit_registration(payload):
	"""Create a Delegate Registration from a public (guest) submission."""
	data = payload if isinstance(payload, dict) else json.loads(payload or "{}")

	full_name = (data.get("full_name") or "").strip()
	organisation = (data.get("organisation") or "").strip()
	email = (data.get("email") or "").strip().lower()

	for value, message in (
		(full_name, _("Full name is required")),
		(organisation, _("Organization is required")),
		(email, _("Email address is required")),
	):
		if not value:
			frappe.throw(message)

	if not validate_email_address(email):
		frappe.throw(_("Please enter a valid email address"))

	doc = frappe.get_doc(
		{
			"doctype": "Delegate Registration",
			"full_name": full_name,
			"organisation": organisation,
			"email": email,
		}
	)
	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name}
