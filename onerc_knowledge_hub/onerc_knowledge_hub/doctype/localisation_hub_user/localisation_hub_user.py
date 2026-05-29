# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address


class LocalisationHubUser(Document):
	#set full_name
	def before_save(self):
		self.full_name = " ".join(filter(None, [self.first_name, self.middle_name, self.last_name]))

	def on_update(self):
		if self.status == "Approved" and not self.user_id:
			try:
				create_user(self.name, self.prefered_contact_email or self.company_email)
			except Exception as e:
				frappe.throw(str(e))


@frappe.whitelist()
def create_user(name, email=None):
	usr = frappe.get_doc("Localisation Hub User", name)

	if usr.user_id:
		frappe.throw(frappe._("User {0} already has a linked user").format(usr.name))

	if not email:
		email = usr.prefered_contact_email or usr.company_email

	if not email:
		frappe.throw(
			frappe._(
				"No email address is available for Localisation Hub User {0}. "
				"Please set a Preferred Contact Email or Company Email."
			).format(usr.name)
		)

	validate_email_address(email, True)

	if frappe.db.exists("User", email):
		frappe.throw(frappe._("User {0} already exists").format(email))

	# Create the user disabled with LH User role
	# Our before_insert hook will automatically add app-specific roles
	user = frappe.get_doc({
		"doctype": "User",
		"email": email,
		"enabled": 0,
		"first_name": usr.first_name,
		"middle_name": usr.middle_name,
		"last_name": usr.last_name,
		"phone": usr.phone_number,
	})

	# Add LH User role
	user.append("roles", {"role": "LH User"})

	user.flags.ignore_permissions = True

	# Insert user - our before_insert hook will add app roles before insert
	# This prevents timestamp conflicts from app hooks (like Buzz)
	user.insert()
	frappe.db.commit()

	usr.db_set("user_id", user.name)

	return user.name

@frappe.whitelist()
def enable_user(user_email):
	#to call after the user successfully sets their password
	if not frappe.db.exists("User", user_email):
		frappe.throw(frappe._("User {0} not found").format(user_email))

	user = frappe.get_doc("User", user_email)
	user.enabled = 1
	user.save(ignore_permissions=True)
	return {"enabled": True}
