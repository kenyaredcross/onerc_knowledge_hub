// Copyright (c) 2026, Kenya Red Cross Society and contributors
// For license information, please see license.txt

frappe.ui.form.on("Localization Hub Settings", {
	refresh(frm) {
		frm.add_custom_button(__("Grant Contributor Access to All"), function () {
			frappe.confirm(
				__(
					"This will add the <b>LH User</b> and <b>LH Manager</b> roles to every active System User who does not already have them, so they can upload and share content. Continue?"
				),
				function () {
					frappe.call({
						method: "onerc_knowledge_hub.install.setup_contributor_access",
						freeze: true,
						freeze_message: __("Granting contributor access..."),
						callback: function (r) {
							if (r.message) {
								frappe.msgprint({
									title: __("Done"),
									message: __(
										"Contributor access granted to {0} user(s) ({1} role assignment(s) added). {2} user(s) already had it.",
										[
											r.message.users_updated,
											r.message.granted,
											r.message.skipped,
										]
									),
									indicator: "green",
								});
							}
						},
					});
				}
			);
		}, __("Actions"));

		frm.add_custom_button(__("Grant LH User to All"), function () {
			frappe.confirm(
				__("This will add the <b>LH User</b> role to every active System User who does not already have it. Continue?"),
				function () {
					frappe.call({
						method: "onerc_knowledge_hub.api.user_management.grant_lh_user_role_to_all",
						freeze: true,
						freeze_message: __("Granting LH User role..."),
						callback: function (r) {
							if (r.message) {
								frappe.msgprint({
									title: __("Done"),
									message: __(
										"LH User role granted to {0} user(s). {1} already had it.",
										[r.message.granted, r.message.skipped]
									),
									indicator: "green",
								});
							}
						},
					});
				}
			);
		}, __("Actions"));
	},
});
