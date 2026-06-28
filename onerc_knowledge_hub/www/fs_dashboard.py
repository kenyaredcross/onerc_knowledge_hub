# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe

no_cache = 1

ALLOWED_ROLES = {"LH FS Manager", "System Manager"}


def get_context(context):
	context.no_cache = 1

	# Guests are sent to log in, then bounced back here.
	if frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = "/login?redirect-to=/fs-dashboard"
		raise frappe.Redirect

	# Authenticated users without the role get a hard 403.
	if not ALLOWED_ROLES.intersection(set(frappe.get_roles())):
		raise frappe.PermissionError("You are not permitted to view the FS Assessment dashboard")

	context.user = frappe.session.user
	return context
