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

        current_views = doc.views_count or 0
        doc.views_count = current_views + 1

        # avoid modified timestamp update if needed
        doc.db_set("views_count", doc.views_count, update_modified=False)

        return doc.view_count

    def before_insert(self):
        """
        Set posted_by automatically for new documents
        """

        if not self.posted_by:

            localisation_user = frappe.db.get_value(
                "Localisation Hub User",
                {"first_name": frappe.session.user},
                "name"
            )

            if localisation_user:
                self.posted_by = localisation_user

    def onload(self):
        """
        Increment view count when document is opened
        """

        if not self.is_new():

            current_views = self.view_count or 0
            new_views = current_views + 1

            frappe.db.set_value(
                self.doctype,
                self.name,
                "view_count",
                new_views,
                update_modified=False
            )

            self.view_count = new_views