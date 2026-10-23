# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Delegate Dashboard portal page.

The arrival-desk view for whoever runs the summit: headline counts, a world map
of where delegates are travelling from, and the three lists that actually need
chasing (imminent arrivals, hotel rooms not yet booked, passports too close to
expiry for a visa).

Access mirrors `/fs-dashboard`: guests are bounced to log in, authenticated users
without one of `ALLOWED_ROLES` get a hard 403. The metrics themselves come
from `onerc_knowledge_hub.api.delegate_dashboard`, which re-checks the role — the
page embeds the first payload server-side so it paints without a spinner, and the
Refresh button re-fetches the same whitelisted method.
"""

import json

import frappe

from onerc_knowledge_hub.api.delegate_dashboard import get_dashboard

no_cache = 1

ALLOWED_ROLES = {"Delegate Manager", "System Manager"}


def get_context(context):
	context.no_cache = 1

	# Guests are sent to log in, then bounced back here.
	if frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = "/login?redirect-to=/delegate-dashboard"
		raise frappe.Redirect

	# Authenticated users without the role get a hard 403.
	if not ALLOWED_ROLES.intersection(set(frappe.get_roles())):
		raise frappe.PermissionError("You are not permitted to view the delegate dashboard")

	context.user = frappe.session.user
	# `</` is escaped so the JSON can be embedded safely inside a <script> tag.
	context.dashboard_json = json.dumps(get_dashboard(), default=str).replace("</", "<\\/")

	return context
