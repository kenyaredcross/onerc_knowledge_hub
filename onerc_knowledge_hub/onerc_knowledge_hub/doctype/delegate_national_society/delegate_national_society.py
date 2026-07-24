# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class DelegateNationalSociety(Document):
	"""An organisation a delegate can register under.

	This is a plain reference list for the public delegate registration form —
	every RCRC National Society plus the IFRC, the ICRC and an "Other" catch-all.
	It is intentionally *not* the `National Society` doctype, which holds the
	Localisation Hub's own member profiles (pillars, assessments, logos) and whose
	record count is reported as hub membership.
	"""

	def validate(self):
		self.society_name = (self.society_name or "").strip()
		self.abbreviation = (self.abbreviation or "").strip() or None
		if not self.society_name:
			frappe.throw(frappe._("Name is required"))
