// Copyright (c) 2026, Kenya Red Cross Society and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Learning Hub", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Learning Hub", {
    refresh(frm) {

        if (!frm.is_new()) {

            frappe.call({
                method: "onerc_knowledge_hub.onerc_knowledge_hub.doctype.learning_hub.learning_hub.increment_view_count",
                args: {
                    docname: frm.doc.name
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value("view_count", r.message);
                    }
                }
            });

        }
    }
});



frappe.ui.form.on("Learning Hub", {
    onload(frm) {

        if (frm.is_new() && !frm.doc.posted_by) {

            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Localization Hub User",
                    filters: {
                        user: frappe.session.user
                    },
                    fieldname: "name"
                },
                callback: function(r) {

                    if (r.message) {
                        frm.set_value("posted_by", r.message.name);
                    }

                }
            });

        }
    }
});