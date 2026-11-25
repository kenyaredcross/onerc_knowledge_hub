import frappe
from frappe import _

CONTRIBUTOR_ROLES = ("LH User", "LH Manager", "LH Admin", "System Manager")


def can_contribute_resources(user=None):
	"""True when the user may upload knowledge resources."""
	roles = frappe.get_roles(user or frappe.session.user)
	return any(role in roles for role in CONTRIBUTOR_ROLES)


@frappe.whitelist(allow_guest=True)
def get_knowledge_hub_entries():
	entries = frappe.get_all(
		"Knowledge Hub",
		fields=[
			"name",
			"title",
			"category",
			"resource_type",
			"tools_subcategory",
			"presented_at_event",
			"presentation_date",
			"presenter",
			"summary",
			"description",
			"file_attachment",
			"external_url",
			"language",
			"uploaded_by",
			"status",
			"published_date",
			"view_count",
			"download_count",
			"is_highlighted",
			"highlight_order",
		],
		order_by="published_date asc",
	)

	# contributing_ns is a Table MultiSelect, so it has no column of its own and
	# cannot be selected above: load the child rows separately.
	attach_contributing_societies(entries)

	# Get author's national society for each entry
	for entry in entries:
		if entry.get("uploaded_by"):
			# Try to get Localisation Hub User
			lh_user = frappe.db.get_value(
				"Localisation Hub User",
				{"user_id": entry["uploaded_by"]},
				["national_society", "full_name"],
				as_dict=True
			)

			if lh_user and lh_user.get("national_society"):
				# Get national society name
				ns_name = frappe.db.get_value("National Society", lh_user["national_society"], "national_society_name")
				entry["author_national_society"] = ns_name
				entry["author_name"] = lh_user.get("full_name")
			else:
				# Fallback to User's full name
				user_name = frappe.db.get_value("User", entry["uploaded_by"], "full_name")
				entry["author_name"] = user_name
				entry["author_national_society"] = None

	return entries


def attach_contributing_societies(entries):
	"""Populate each entry's contributing_ns list from the child table."""
	for entry in entries:
		entry["contributing_ns"] = []

	names = [entry["name"] for entry in entries]
	if not names:
		return

	rows = frappe.get_all(
		"National Society Detail",
		filters={
			"parenttype": "Knowledge Hub",
			"parentfield": "contributing_ns",
			"parent": ["in", names],
		},
		fields=["parent", "national_society"],
		order_by="idx asc",
		ignore_permissions=True,
	)

	by_parent = {}
	for row in rows:
		by_parent.setdefault(row.parent, []).append(
			{"national_society": row.national_society}
		)

	for entry in entries:
		entry["contributing_ns"] = by_parent.get(entry["name"], [])


@frappe.whitelist(allow_guest=True)
def get_knowledge_hub_categories():
	entries = frappe.get_all(
		"Category",
		fields=[
			"name",
			"category_name",
			"description",
		],
		order_by="category_name asc",
	)
	return entries


@frappe.whitelist(allow_guest=True)
def get_knowledge_hub_details(name):
	entry = frappe.get_doc("Knowledge Hub", name)
	result = entry.as_dict()

	# Replace uploaded_by email with full name
	if result.get("uploaded_by"):
		full_name = frappe.db.get_value("User", entry.uploaded_by, "full_name")
		result["uploaded_by"] = full_name or entry.uploaded_by

	return result


@frappe.whitelist()
def create_knowledge_hub(**args):
	"""Create a knowledge resource from the hub UI.

	Any member with contributor access may upload. The resource is attributed to
	the session user, so the uploader cannot be spoofed from the client.
	"""
	if frappe.session.user == "Guest" or not can_contribute_resources():
		frappe.throw(
			_("You need contributor access to upload knowledge resources"),
			frappe.PermissionError,
		)

	data = frappe._dict(args)

	for key in ["cmd", "csrf_token", "doctype", "name", "view_count", "download_count"]:
		data.pop(key, None)

	contributing = data.get("contributing_ns") or []

	normalized = []

	for v in contributing:
		if isinstance(v, str):
			val = v
		else:
			val = v.get("national_society") or v.get("value")

		if val:
			normalized.append(
				{
					"doctype": "National Society Detail",
					"national_society": val,
					"parenttype": "Knowledge Hub",
					"parentfield": "contributing_ns",
				}
			)

	data["contributing_ns"] = normalized

	# Always attribute the upload to whoever is logged in.
	data["uploaded_by"] = frappe.session.user

	doc = frappe.get_doc({"doctype": "Knowledge Hub", **data})

	doc.insert(ignore_permissions=True)

	return {"name": doc.name}
