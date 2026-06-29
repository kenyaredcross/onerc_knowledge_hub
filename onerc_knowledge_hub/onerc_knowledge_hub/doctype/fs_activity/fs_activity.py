# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class FSActivity(Document):
	def validate(self):
		# Normalise emails so invitations and submissions match reliably
		# (pre/post pairing is done by email within the activity).
		if self.notification_email:
			self.notification_email = self.notification_email.strip().lower()
		for participant in self.participants:
			if participant.email:
				participant.email = participant.email.strip().lower()
