// Copyright (c) 2026, Kenya Red Cross Society and contributors
// For license information, please see license.txt

frappe.ui.form.on("Delegate Registration", {
	refresh(frm) {
		if (frm.is_new() || !frm.doc.accommodation_boma) return;

		frm.add_custom_button(__("Resend Boma Request"), () => {
			frappe.confirm(
				__("Resend the accommodation request to the Boma Hotel for this delegate?"),
				() => {
					frappe.call({
						method: "onerc_knowledge_hub.api.registration.resend_boma_request",
						args: { name: frm.doc.name },
						freeze: true,
						freeze_message: __("Sending request…"),
						callback(r) {
							const sent = r.message && r.message.sent;
							frappe.msgprint(
								sent
									? __("The accommodation request has been sent to the Boma Hotel.")
									: __("The request could not be sent. Check the Boma Hotel email in Delegate Registration Settings.")
							);
							frm.reload_doc();
						},
					});
				}
			);
		});
	},
});
