# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LearningHub(Document):

    def validate(self):
        self.set_posted_by()
        self.validate_summary_word_count()

    def set_posted_by(self):
        """Auto-fill posted_by with current user's Localisation Hub User record"""
        if not self.posted_by:
            # Get the current user's Localisation Hub User record
            lh_user = frappe.db.get_value(
                "Localisation Hub User",
                {"user_id": frappe.session.user},
                "name"
            )
            if lh_user:
                self.posted_by = lh_user

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