# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class FSAssessmentQuestion(Document):
	def validate(self):
		# Choice / Yes-No questions are the only scorable types.
		if self.question_type in ("Narrative", "Action Matrix"):
			self.is_scored = 0
