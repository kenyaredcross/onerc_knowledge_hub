# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.utils import validate_email_address
from frappe.utils.password import update_password

#Creates a Localisation Hub User with status "Pending".
@frappe.whitelist(allow_guest=True)
def register_localisation_hub_user(
	first_name,
	last_name,
	national_society,
	middle_name=None,
	salutation=None,
	gender=None,
	phone_number=None,
	prefered_contact_email=None,
	preferred_contact_email=None,
	company_email=None,
	position=None,
	personnel_type=None,
	primary_language=None,
	bio=None,
	other_languages=None,
	expertise=None,
):

	# Use whichever email field is provided (frontend sends preferred_contact_email)
	email = preferred_contact_email or prefered_contact_email or company_email

	if not email:
		frappe.throw(frappe._("Email is required"))

	# Validate required email
	validate_email_address(email, True)

	# Prevent duplicate email (note: field name has typo in database - "prefered" not "preferred")
	existing = frappe.db.get_value(
		"Localisation Hub User",
		{"prefered_contact_email": email},
		"name",
	)
	if existing:
		frappe.throw(
			frappe._("A registration with email {0} already exists ({1}).").format(
				email, existing
			)
		)

	doc = frappe.get_doc({
		"doctype": "Localisation Hub User",
		"salutation": salutation,
		"first_name": first_name,
		"middle_name": middle_name or "",
		"last_name": last_name,
		"gender": gender,
		"company_email": company_email or email,
		"prefered_contact_email": email,
		"phone_number": phone_number or "",
		"national_society": national_society,
		"position": position,
		"personnel_type": personnel_type,
		"primary_language": primary_language,
		"bio": bio or "",
		"other_languages": [],
		"expertise": [],
		"status": "Pending",
	})

	# Table MultiSelect: other_languages — rows have field `language_name`
	if other_languages:
		langs = json.loads(other_languages) if isinstance(other_languages, str) else other_languages
		for lang in langs:
			doc.append("other_languages", {"language_name": lang})

	# Table MultiSelect: expertise — rows have field `expertise`
	if expertise:
		exp_list = json.loads(expertise) if isinstance(expertise, str) else expertise
		for exp in exp_list:
			doc.append("expertise", {"expertise": exp})

	doc.insert(ignore_permissions=True)

	return {
		"localisation_hub_user": doc.name,
		"full_name": doc.full_name,
		"status": doc.status,
	}


#Frappe User created after admin approves and user sets password
@frappe.whitelist(allow_guest=True)
def check_registration_status(email):
	"""
	Check the status of a Localisation Hub User registration by email.
	Returns status information: Pending, Approved, Rejected
	"""
	if not email:
		frappe.throw(frappe._("Email is required"))

	validate_email_address(email, True)

	# Note: field name has typo in database - "prefered" not "preferred"
	lhu = frappe.db.get_value(
		"Localisation Hub User",
		{"prefered_contact_email": email},
		["name", "status", "user_id", "full_name", "creation", "modified"],
		as_dict=True,
	)

	if not lhu:
		return {
			"found": False,
			"message": "No registration found with this email"
		}

	result = {
		"found": True,
		"name": lhu.name,
		"full_name": lhu.full_name,
		"status": lhu.status,
		"created_on": lhu.creation,
		"last_updated": lhu.modified,
		"has_user_account": bool(lhu.user_id),
	}

	# If approved and has user account, check if it's activated
	if lhu.status == "Approved" and lhu.user_id:
		user_enabled = frappe.db.get_value("User", lhu.user_id, "enabled")
		result["user_enabled"] = bool(user_enabled)

	return result


@frappe.whitelist(allow_guest=True)
def set_password_and_activate(token, new_password):
	"""
	Activate user account using secure token and set password.
	"""
	if not token or not new_password:
		frappe.throw(frappe._("Invalid request"))

	# Import the verify function from user_management
	from onerc_knowledge_hub.api.user_management import verify_activation_token
	import hashlib

	# Verify the token
	verification = verify_activation_token(token)

	if not verification.get("valid"):
		frappe.throw(frappe._(verification.get("message", "Invalid activation link")))

	localisation_hub_user = verification.get("localisation_hub_user")

	# Get the Localisation Hub User details
	lhu = frappe.db.get_value(
		"Localisation Hub User",
		localisation_hub_user,
		["name", "user_id", "status"],
		as_dict=True,
	)

	if not lhu:
		frappe.throw(frappe._("Localisation Hub User not found"))

	if lhu.status != "Approved":
		frappe.throw(frappe._("Your application has not been approved yet"))

	if not lhu.user_id:
		frappe.throw(frappe._("No system user linked to this account"))

	user = frappe.get_doc("User", lhu.user_id)

	if user.enabled:
		frappe.throw(frappe._("Account is already active"))

	# Set password and enable user
	update_password(user.name, new_password)
	user.enabled = 1
	user.save(ignore_permissions=True)

	# Clear the activation token so it can't be reused
	frappe.db.set_value("Localisation Hub User", lhu.name, {
		"activation_token": None,
		"activation_token_expiry": None
	})
	frappe.db.commit()

	return {"activated": True, "user": user.name}


@frappe.whitelist(allow_guest=True)
def reset_password_with_token(token, new_password):
	"""
	Reset password for an already activated user using a secure token.
	"""
	if not token or not new_password:
		frappe.throw(frappe._("Invalid request"))

	# Import the verify function from user_management
	from onerc_knowledge_hub.api.user_management import verify_activation_token
	import hashlib

	# Verify the token
	verification = verify_activation_token(token)

	if not verification.get("valid"):
		frappe.throw(frappe._(verification.get("message", "Invalid reset link")))

	localisation_hub_user = verification.get("localisation_hub_user")

	# Get the Localisation Hub User details
	lhu = frappe.db.get_value(
		"Localisation Hub User",
		localisation_hub_user,
		["name", "user_id", "status"],
		as_dict=True,
	)

	if not lhu:
		frappe.throw(frappe._("Localisation Hub User not found"))

	if lhu.status != "Approved":
		frappe.throw(frappe._("Your application has not been approved"))

	if not lhu.user_id:
		frappe.throw(frappe._("No system user linked to this account"))

	user = frappe.get_doc("User", lhu.user_id)

	# For password reset, the user should already be enabled
	# But we'll allow reset for both enabled and disabled accounts

	# Set new password
	update_password(user.name, new_password)

	# Make sure user is enabled
	if not user.enabled:
		user.enabled = 1
		user.save(ignore_permissions=True)

	# Clear the reset token so it can't be reused
	frappe.db.set_value("Localisation Hub User", lhu.name, {
		"activation_token": None,
		"activation_token_expiry": None
	})
	frappe.db.commit()

	return {"success": True, "message": "Password reset successfully", "user": user.name}


#update status of Localisation Hub User to Approved and create User account
@frappe.whitelist()
def approve_localisation_hub_user(name):
	frappe.only_for("LH Admin", "System Manager")

	lhu = frappe.get_doc("Localisation Hub User", name)
	if lhu.status != "Pending":
		frappe.throw(frappe._("Only users with Pending status can be approved"))

	if lhu.user_id:
		frappe.throw(frappe._("User account already exists for this person"))

	# Create inactive User account
	user = frappe.get_doc({
		"doctype": "User",
		"email": lhu.prefered_contact_email,
		"first_name": lhu.first_name,
		"last_name": lhu.last_name or "",
		"enabled": 0,  # Account is disabled until password is set
		"send_welcome_email": 0,
		"user_type": "System User",
	})
	user.insert(ignore_permissions=True)

	# Add default role - customize as needed
	# user.add_roles("Localisation Hub User Role")

	# Update LH User status and link to User account
	lhu.status = "Approved"
	lhu.user_id = user.name
	lhu.save(ignore_permissions=True)

	# Send activation email
	send_activation_email(lhu)

	frappe.db.commit()

	return {
		"name": lhu.name,
		"status": lhu.status,
		"user_id": user.name,
		"message": "User approved and activation email sent"
	}


def send_activation_email(lhu):
	"""Send activation email to approved user with password setup link."""
	try:
		# Generate activation link
		activation_link = frappe.utils.get_url(f"/set-password?key={lhu.name}")

		# Email subject and message
		subject = "Your Africa Localisation Hub Account Has Been Approved"

		message = f"""
		<p>Dear {lhu.first_name},</p>

		<p>Congratulations! Your application to join the Africa Localisation Hub has been approved.</p>

		<p>To activate your account and set your password, please click the link below:</p>

		<p><a href="{activation_link}" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 6px;">Activate Your Account</a></p>

		<p>Or copy and paste this link into your browser:</p>
		<p>{activation_link}</p>

		<p>This link will allow you to set your password and gain full access to the platform.</p>

		<p>If you did not request this account, please contact our support team immediately.</p>

		<p>Best regards,<br>
		The Africa Localisation Hub Team</p>
		"""

		frappe.sendmail(
			recipients=[lhu.prefered_contact_email],
			subject=subject,
			message=message,
			delayed=False
		)

		return True

	except Exception as e:
		frappe.log_error(f"Failed to send activation email to {lhu.prefered_contact_email}: {str(e)}")
		return False

#Reject a Localisation Hub User application
@frappe.whitelist()
def reject_localisation_hub_user(name, reason=None):
	frappe.only_for("LH Admin", "System Manager")

	lhu = frappe.get_doc("Localisation Hub User", name)

	if lhu.status == "Rejected":
		frappe.throw(frappe._("User is already rejected"))

	if lhu.user_id:
		frappe.throw(frappe._("Cannot reject user with existing user account"))

	lhu.status = "Rejected"
	lhu.save(ignore_permissions=True)

	frappe.db.commit()

	return {
		"name": lhu.name,
		"status": lhu.status,
		"message": "User application rejected"
	}


#Get list of pending Localisation Hub Users
@frappe.whitelist()
def get_pending_users():
	frappe.only_for("LH Admin", "System Manager")

	users = frappe.get_all(
		"Localisation Hub User",
		fields=[
			"name",
			"full_name",
			"first_name",
			"last_name",
			"prefered_contact_email",
			"phone_number",
			"position",
			"national_society",
			"primary_language",
			"status",
			"creation",
			"modified"
		],
		filters={"status": "Pending"},
		order_by="creation desc"
	)

	return users


#Get all Localisation Hub Users with optional status filter
@frappe.whitelist()
def get_all_hub_users(status=None):
	frappe.only_for("LH Admin", "System Manager")

	filters = {}
	if status:
		filters["status"] = status

	users = frappe.get_all(
		"Localisation Hub User",
		fields=[
			"name",
			"full_name",
			"first_name",
			"last_name",
			"prefered_contact_email",
			"phone_number",
			"position",
			"national_society",
			"primary_language",
			"status",
			"user_id",
			"creation",
			"modified"
		],
		filters=filters,
		order_by="creation desc"
	)

	# Add user enabled status
	for user in users:
		if user.get("user_id"):
			user["user_enabled"] = frappe.db.get_value("User", user.user_id, "enabled")
		else:
			user["user_enabled"] = False

	return users


# Link Lookup APIs
@frappe.whitelist(allow_guest=True)
def get_national_societies():
	"""Returns all National Society records"""
	return frappe.get_all(
		"National Society",
		fields=["name", "full_official_name", "short_name", "country"],
		order_by="full_official_name asc",
	)


@frappe.whitelist(allow_guest=True)
def get_languages():
	"""Returns all Language records"""
	return frappe.get_all(
		"Language",
		fields=["name", "language_name"],
		order_by="language_name asc",
	)


@frappe.whitelist(allow_guest=True)
def get_designations():
	"""Returns all Designation records"""
	return frappe.get_all(
		"Designation",
		fields=["name"],
		order_by="name asc",
	)


@frappe.whitelist(allow_guest=True)
def get_salutations():
	"""Returns all Salutation records"""
	return frappe.get_all(
		"Salutation",
		fields=["name"],
		order_by="name asc",
	)


@frappe.whitelist(allow_guest=True)
def get_genders():
	"""Returns all Gender records"""
	return frappe.get_all(
		"Gender",
		fields=["name"],
		order_by="name asc",
	)


@frappe.whitelist(allow_guest=True)
def get_expertise_options():
	"""Returns all Expertise"""
	return frappe.get_all(
		"Expertise Selector",
		fields=["name", "expertise"],
		order_by="expertise asc",
	)

@frappe.whitelist(allow_guest=True)
def get_other_languages():
	"""Returns all Selector Language records"""
	return frappe.get_all(
		"Language Selector",
		fields=["name", "language_name"],
		order_by="language_name asc",
	)


# ================== Password Reset Functions ==================

@frappe.whitelist(allow_guest=True)
def request_password_reset(email):
	"""
	Request a password reset link for a registered user.
	Sends an email with a reset token.
	"""
	if not email:
		frappe.throw(frappe._("Email is required"))

	validate_email_address(email, True)

	# Check if user exists and is active
	user = frappe.db.get_value("User", {"email": email, "enabled": 1}, ["name", "first_name"], as_dict=True)

	if not user:
		# Don't reveal whether email exists for security
		return {
			"success": True,
			"message": "If an account with that email exists, you will receive a password reset link shortly."
		}

	# Use Frappe's built-in password reset key generation
	from frappe.utils import random_string, now_datetime, add_to_date

	# Generate secure reset key
	reset_key = random_string(32)

	# Set reset key with expiration (1 hour)
	frappe.db.set_value("User", user.name, {
		"reset_password_key": reset_key,
		"last_reset_password_key_generated_on": now_datetime()
	})
	frappe.db.commit()

	# Send reset email
	send_password_reset_email(user.name, user.first_name, email, reset_key)

	return {
		"success": True,
		"message": "If an account with that email exists, you will receive a password reset link shortly."
	}


@frappe.whitelist(allow_guest=True)
def validate_reset_token(token):
	"""
	Validate if a password reset token is valid and not expired.
	"""
	if not token:
		frappe.throw(frappe._("Reset token is required"))

	from frappe.utils import now_datetime, add_to_date

	# Find user with this reset key
	user = frappe.db.get_value(
		"User",
		{"reset_password_key": token},
		["name", "first_name", "email", "last_reset_password_key_generated_on"],
		as_dict=True
	)

	if not user:
		return {
			"valid": False,
			"message": "Invalid or expired reset link"
		}

	# Check if token is expired (1 hour validity)
	if user.last_reset_password_key_generated_on:
		expiry_time = add_to_date(user.last_reset_password_key_generated_on, hours=1)
		if now_datetime() > expiry_time:
			return {
				"valid": False,
				"message": "This reset link has expired. Please request a new one."
			}

	return {
		"valid": True,
		"email": user.email,
		"first_name": user.first_name
	}


@frappe.whitelist(allow_guest=True)
def reset_password_with_token(token, new_password):
	"""
	Reset password using a valid reset token.
	"""
	if not token or not new_password:
		frappe.throw(frappe._("Reset token and new password are required"))

	# Validate token first
	validation = validate_reset_token(token)

	if not validation.get("valid"):
		frappe.throw(frappe._(validation.get("message", "Invalid reset token")))

	# Find user with this reset key
	user_name = frappe.db.get_value("User", {"reset_password_key": token}, "name")

	if not user_name:
		frappe.throw(frappe._("Invalid reset token"))

	# Update password
	update_password(user_name, new_password)

	# Clear reset key after successful password change
	frappe.db.set_value("User", user_name, {
		"reset_password_key": "",
		"last_reset_password_key_generated_on": None
	})
	frappe.db.commit()

	return {
		"success": True,
		"message": "Password has been reset successfully. You can now log in with your new password."
	}


def send_password_reset_email(user_name, first_name, email, reset_key):
	"""Send password reset email with reset link."""
	try:
		# Generate reset link
		reset_link = frappe.utils.get_url(f"/reset-password?token={reset_key}")

		# Email subject and message
		subject = "Reset Your Localisation Hub Password"

		message = f"""
		<div style="font-family: 'Google Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
			<div style="background: linear-gradient(135deg, #011E41 0%, #1e3a8a 100%); padding: 32px; text-align: center;">
				<div style="display: inline-flex; align-items: center; gap: 12px; background: white; padding: 16px 24px; border-radius: 4px;">
					<div style="width: 48px; height: 48px; background: #ee2435; color: white; font-weight: bold; font-size: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">+</div>
					<div style="text-align: left;">
						<div style="font-weight: 600; font-size: 18px; color: #111827;">Localisation Hub</div>
					</div>
				</div>
			</div>

			<div style="background: white; padding: 40px; border: 1px solid #e5e7eb;">
				<h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 16px 0;">Reset Your Password</h1>

				<p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">Dear {first_name},</p>

				<p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">We received a request to reset your password for your Localisation Hub account. Click the button below to create a new password:</p>

				<div style="text-align: center; margin: 32px 0;">
					<a href="{reset_link}" style="display: inline-block; padding: 14px 32px; background-color: #ee2435; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 16px;">Reset Password</a>
				</div>

				<p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Or copy and paste this link into your browser:</p>
				<p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin: 0 0 24px 0;">{reset_link}</p>

				<div style="background: #fef2f2; border-left: 4px solid #ee2435; padding: 16px; margin: 24px 0;">
					<p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
				</div>

				<p style="color: #4b5563; line-height: 1.6; margin: 24px 0 0 0;">Best regards,<br><strong>The Localisation Hub Team</strong></p>
			</div>

			<div style="background: #f9fafb; padding: 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
				<p style="color: #6b7280; font-size: 12px; margin: 0;">© 2026 The Localisation Hub</p>
			</div>
		</div>
		"""

		frappe.sendmail(
			recipients=[email],
			subject=subject,
			message=message,
			delayed=False
		)

		return True

	except Exception as e:
		frappe.log_error(f"Failed to send password reset email to {email}: {str(e)}")
		return False