# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe


def after_install():
	"""Create custom roles after app installation"""
	create_custom_roles()


def create_custom_roles():
	"""Create LH Admin, LH User, and LH Manager roles if they don't exist"""

	roles = [
		{
			"role_name": "LH Admin",
			"desk_access": 1,
			"disabled": 0,
		},
		{
			"role_name": "LH User",
			"desk_access": 1,
			"disabled": 0,
		},
		{
			"role_name": "LH Manager",
			"desk_access": 1,
			"disabled": 0,
		},
	]

	for role_data in roles:
		if not frappe.db.exists("Role", role_data["role_name"]):
			role = frappe.get_doc({
				"doctype": "Role",
				"role_name": role_data["role_name"],
				"desk_access": role_data["desk_access"],
				"disabled": role_data["disabled"],
			})
			role.insert(ignore_permissions=True)
			frappe.db.commit()
			print(f"Created role: {role_data['role_name']}")
		else:
			print(f"Role already exists: {role_data['role_name']}")


@frappe.whitelist()
def setup_roles():
	"""Manual function to create roles if they don't exist. Can be called via bench console."""
	frappe.only_for("System Manager")
	create_custom_roles()
	return {"message": "Roles setup completed"}
