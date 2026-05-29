# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe


_original_user_save = None


def add_app_roles_before_insert(doc, method=None):
	"""
	Add app-specific roles to users before insert.
	This prevents timestamp conflicts from app hooks that run after_insert (like Buzz).
	We wrap save() to catch timestamp errors during after_insert hooks.
	"""
	global _original_user_save

	# Get list of installed apps
	installed_apps = frappe.get_installed_apps()

	# Check which roles need to be added
	existing_roles = {r.role for r in doc.roles}

	# Add Buzz User role if Buzz is installed
	if "buzz" in installed_apps and "Buzz User" not in existing_roles:
		doc.append("roles", {"role": "Buzz User"})

	# Add Raven User role if Raven is installed
	if "raven" in installed_apps and "Raven User" not in existing_roles:
		doc.append("roles", {"role": "Raven User"})

	# Add Wiki User role if Wiki is installed
	if "wiki" in installed_apps and "Wiki User" not in existing_roles:
		doc.append("roles", {"role": "Wiki User"})

	# Add LMS Student role if LMS is installed
	if "lms" in installed_apps and "LMS Student" not in existing_roles:
		doc.append("roles", {"role": "LMS Student"})

	# Add Drive User role if Drive is installed
	if "drive" in installed_apps and "Drive User" not in existing_roles:
		doc.append("roles", {"role": "Drive User"})

	# Store original save method
	if not _original_user_save:
		from frappe.core.doctype.user.user import User
		_original_user_save = User.save

	# Temporarily replace save to suppress timestamp errors during after_insert
	from frappe.core.doctype.user.user import User

	def save_suppress_timestamp_error(self, *args, **kwargs):
		"""Save but suppress timestamp errors during insert hooks"""
		try:
			return _original_user_save(self, *args, **kwargs)
		except frappe.TimestampMismatchError:
			# Suppress timestamp errors during after_insert hooks
			# The roles are already added in before_insert, so this save is unnecessary
			pass

	User.save = save_suppress_timestamp_error


def restore_save_method(doc, method=None):
	"""
	Restore the original save method after insert completes.
	This runs AFTER all after_insert hooks (including Buzz's).
	"""
	global _original_user_save

	if _original_user_save:
		from frappe.core.doctype.user.user import User
		User.save = _original_user_save
