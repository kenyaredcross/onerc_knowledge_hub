# Copyright (c) 2026, Lennox Mwita and contributors
# For license information, please see license.txt
"""Session helpers for the hub SPA.

The SPA reads its CSRF token once, from the token the page template renders into
`window.csrf_token`. That token belongs to the session that rendered the page, so
a tab left open across a fresh sign-in (the Desk, another tab, a session that
expired and was renewed) keeps sending a token the current session no longer
recognises. Reads are unaffected because Frappe only checks the token on POST,
PUT and DELETE, so the tab looks healthy right up to the moment somebody saves
and gets "Invalid Request" back.

This endpoint lets the SPA re-read the token for whichever session the cookie
actually points at now, instead of making the member reload the page by hand.
"""

import frappe
from frappe import _


@frappe.whitelist(methods=["GET"])
def get_csrf_token():
	"""Return the CSRF token of the caller's own session.

	Same-origin and authenticated only, which is the exposure the page template
	already has: it prints this token into the HTML of every hub page.
	"""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please sign in again"), frappe.PermissionError)

	had_token = bool(frappe.session.data.get("csrf_token"))
	token = frappe.sessions.get_csrf_token()

	# Same reason as the page controller: a token minted during a GET is rolled
	# back unless it is committed, and an uncommitted token matches nothing.
	if not had_token:
		frappe.db.commit()

	return {"csrf_token": token}
