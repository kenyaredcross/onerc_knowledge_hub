"""Controller for the hub SPA page (www/ans-hub.html).

The file name must be `ans_hub.py`, not `ans-hub.py`: Frappe looks for a page's
controller by converting hyphens in the template name to underscores, so a
hyphenated controller is silently ignored and the page renders with no context
at all, which is what used to leave `window.csrf_token` empty.
"""

import frappe
from frappe.utils import get_system_timezone

no_cache = 1


def get_context():
	# A token minted while rendering a page is thrown away with the rest of the
	# GET, so the page would hand the SPA a token the session never stored. That
	# goes unnoticed until something else stores one for the same session (a Desk
	# visit does), at which point every save from the hub comes back as
	# "Invalid Request". Commit the new token so the page and the session agree.
	had_token = bool(frappe.session.data.get("csrf_token"))
	csrf_token = frappe.sessions.get_csrf_token()
	if not had_token:
		frappe.db.commit()

	context = frappe._dict()
	context.boot = get_boot()
	context.boot.csrf_token = csrf_token
	# Read by the template, the way Frappe's own Desk page passes it. The template
	# used to read frappe.session.csrf_token instead, which only ever shows a
	# token the session has already stored and renders as "None" otherwise.
	context.csrf_token = csrf_token
	return context


@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
	if not frappe.conf.developer_mode:
		frappe.throw("This method is only meant for developer mode")
	return get_boot()


def get_boot():
	return frappe._dict(
		{
			"frappe_version": frappe.__version__,
			"site_name": frappe.local.site,
			"read_only_mode": frappe.flags.read_only,
			"system_timezone": get_system_timezone(),
		}
	)
