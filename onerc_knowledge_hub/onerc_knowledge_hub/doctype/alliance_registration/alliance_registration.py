# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from frappe.utils import now_datetime


class AllianceRegistration(Document):
	def validate(self):
		if not self.submitted_on:
			self.submitted_on = now_datetime()
		# Normalise the email so admin follow-up and de-duplication are reliable.
		if self.email:
			self.email = self.email.strip().lower()
