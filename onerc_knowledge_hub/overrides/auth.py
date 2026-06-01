import frappe
from frappe.utils import cint, md_to_html
from frappe.utils.oauth import get_oauth2_authorize_url, get_oauth_keys


@frappe.whitelist(allow_guest=True)
def get_login_context(redirect_to: str | None = None):
	"""
	Override Buzz's get_login_context to redirect to /ans-hub instead of /dashboard
	"""
	context = {
		"disable_signup": frappe.get_website_settings("disable_signup"),
		"disable_user_pass_login": frappe.get_system_settings("disable_user_pass_login"),
		"login_with_email_link": frappe.get_system_settings("login_with_email_link"),
		"login_banner": md_to_html(raw_banner)
		if (raw_banner := frappe.db.get_single_value("Buzz Settings", "login_banner"))
		else None,
		"provider_logins": [],
	}

	# Override: Redirect to /ans-hub instead of /dashboard
	if not redirect_to:
		redirect_to = frappe.utils.get_url("/ans-hub")

	social_login_keys = frappe.get_all(
		"Social Login Key",
		filters={"enable_social_login": 1},
		fields=["name", "provider_name", "icon", "client_id", "base_url"],
	)

	for provider in social_login_keys:
		if provider.client_id and provider.base_url and get_oauth_keys(provider.name):
			context["provider_logins"].append(
				{
					"name": provider.name,
					"provider_name": provider.provider_name,
					"icon": provider.icon or "",
					"auth_url": get_oauth2_authorize_url(provider.name, redirect_to),
				}
			)

	return context


def on_session_creation(login_manager):
	"""
	Redirect users to /ans-hub after successful login
	Override default Buzz behavior that redirects to /dashboard
	"""
	# Get the requested redirect or default to /ans-hub
	redirect_to = frappe.local.request.args.get('redirect-to') or '/ans-hub'

	# Ensure we don't redirect to Buzz dashboard
	if redirect_to == '/dashboard':
		redirect_to = '/ans-hub'

	frappe.local.response['home_page'] = redirect_to
