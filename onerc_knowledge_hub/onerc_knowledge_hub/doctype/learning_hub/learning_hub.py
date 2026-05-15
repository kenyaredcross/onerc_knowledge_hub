# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LearningHub(Document):

    def validate(self):
        self.validate_summary_word_count()

    def validate_summary_word_count(self):
        if self.summary:
            word_count = len(self.summary.split())

            if word_count > 200:
                frappe.throw(
                    f"Summary cannot exceed 200 words. Current count: {word_count}"
                )

@frappe.whitelist()
def increment_view_count(docname):
	doc = frappe.get_doc("Learning Hub", docname)

	current_views = doc.view_count or 0
	doc.view_count = current_views + 1

	# avoid modified timestamp update if needed
	doc.db_set("view_count", doc.view_count, update_modified=False)

	return doc.view_count