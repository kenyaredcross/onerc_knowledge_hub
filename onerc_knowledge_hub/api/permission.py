import frappe


def has_app_permission():
	"""Check if the user has permission to access the app."""
	return True


def has_delegate_app_permission():
	"""Show the Delegate Management tile only to the summit organisers.

	Mirrors the role restriction on the `Delegate Management` workspace itself, so
	the apps screen never advertises a page the user cannot open. Administrator is
	granted every role by Frappe, so it passes without being named here.
	"""
	return "Delegate Manager" in frappe.get_roles()
