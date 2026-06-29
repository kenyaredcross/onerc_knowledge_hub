// Copyright (c) 2026, Kenya Red Cross Society and contributors
// For license information, please see license.txt

frappe.ui.form.on("FS Activity", {
	refresh(frm) {
		if (frm.is_new()) return;

		frm.add_custom_button(
			__("Send Pre Invitations"),
			() => send_invitations(frm, "pre"),
			__("Invitations")
		);
		frm.add_custom_button(
			__("Send Post Invitations"),
			() => send_invitations(frm, "post"),
			__("Invitations")
		);
	},
});

function send_invitations(frm, phase) {
	if (frm.is_dirty()) {
		frappe.msgprint(__("Please save your changes before sending invitations."));
		return;
	}
	if (!(frm.doc.participants || []).length) {
		frappe.msgprint(__("Add at least one participant first."));
		return;
	}

	const method =
		phase === "pre"
			? "onerc_knowledge_hub.api.assessment.send_pre_invitations"
			: "onerc_knowledge_hub.api.assessment.send_post_invitations";

	frappe.confirm(
		__("Email the {0}-assessment link to all {1} participant(s)?", [
			phase,
			(frm.doc.participants || []).length,
		]),
		() => {
			frappe.call({
				method,
				args: { activity: frm.doc.name },
				freeze: true,
				freeze_message: __("Sending invitations…"),
				callback(r) {
					const m = r.message || {};
					frappe.msgprint(
						__("Sent {0} invitation(s); skipped {1}.", [m.sent || 0, m.skipped || 0])
					);
					frm.reload_doc();
				},
			});
		}
	);
}
