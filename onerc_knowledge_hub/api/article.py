# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe


@frappe.whitelist()
def get_current_user_ns():
	"""Get current user's national society"""
	current_user = frappe.session.user
	ns = frappe.db.get_value(
		"Localisation Hub User",
		{"user_id": current_user},
		"national_society"
	)
	return {"national_society": ns, "user_id": current_user}


@frappe.whitelist()
def get_articles_filtered(include_drafts=0):
	"""
	Get articles with role-based filtering.

	- Admins see all articles
	- Managers see only articles from their national society
	- Regular users see only published articles
	"""
	user_roles = frappe.get_roles()
	current_user = frappe.session.user

	# Check if user is admin
	is_admin = "LH Admin" in user_roles or "System Manager" in user_roles
	is_manager = "LH Manager" in user_roles and not is_admin

	frappe.log_error(f"User: {current_user}, Roles: {user_roles}, is_admin: {is_admin}, is_manager: {is_manager}", "Article Filter Debug")

	is_lh_user = not is_admin and not is_manager

	if is_admin:
		# Admins see everything
		filters = {}
		if not int(include_drafts):
			filters["status"] = "Published"
			filters["docstatus"] = 1

		return frappe.get_all(
			"Article",
			filters=filters,
			fields=[
				"name", "title", "slug", "subtitle",
				"summary", "body", "cover_image",
				"article_type", "category", "status", "docstatus",
				"author", "published_on", "read_time",
				"is_featured", "sort_order", "view_count",
				"like_count", "comment_count", "owner"
			],
			order_by="is_featured desc, published_on desc"
		)

	# Resolve the current user's national society (required for managers and LH users)
	user_ns = frappe.db.get_value(
		"Localisation Hub User",
		{"user_id": current_user},
		"national_society"
	)

	if not user_ns:
		return []

	ns_users = frappe.get_all(
		"Localisation Hub User",
		filters={"national_society": user_ns},
		pluck="user_id"
	)

	if not ns_users:
		return []

	if is_manager:
		# Managers see all articles (drafts + published) from their NS
		filters = {"owner": ["in", ns_users]}
		if not int(include_drafts):
			filters["status"] = "Published"
			filters["docstatus"] = 1

		return frappe.get_all(
			"Article",
			filters=filters,
			fields=[
				"name", "title", "slug", "subtitle",
				"summary", "body", "cover_image",
				"article_type", "category", "status", "docstatus",
				"author", "published_on", "read_time",
				"is_featured", "sort_order", "view_count",
				"like_count", "comment_count", "owner"
			],
			order_by="is_featured desc, published_on desc"
		)

	# LH User: published articles from their NS + their own drafts
	published = frappe.get_all(
		"Article",
		filters={"owner": ["in", ns_users], "status": "Published", "docstatus": 1},
		fields=[
			"name", "title", "slug", "subtitle",
			"summary", "body", "cover_image",
			"article_type", "category", "status", "docstatus",
			"author", "published_on", "read_time",
			"is_featured", "sort_order", "view_count",
			"like_count", "comment_count", "owner"
		],
		order_by="is_featured desc, published_on desc"
	)

	if int(include_drafts):
		my_drafts = frappe.get_all(
			"Article",
			filters={"owner": current_user, "docstatus": 0},
			fields=[
				"name", "title", "slug", "subtitle",
				"summary", "body", "cover_image",
				"article_type", "category", "status", "docstatus",
				"author", "published_on", "read_time",
				"is_featured", "sort_order", "view_count",
				"like_count", "comment_count", "owner"
			],
			order_by="is_featured desc, published_on desc"
		)
		# Merge, deduplicating by name (a user's own published articles appear in both queries)
		seen = {a["name"] for a in published}
		for draft in my_drafts:
			if draft["name"] not in seen:
				published.append(draft)

	return published


ARTICLE_EDITABLE_FIELDS = [
	"title", "subtitle", "article_type", "category", "pillar", "location",
	"summary", "body", "cover_image", "source_name", "source_url",
	"is_featured", "status", "author",
]


@frappe.whitelist()
def save_article(name, fields):
	"""Save editable fields on a draft Article. Caller must own it or be LH Admin/Manager."""
	import json
	fields = json.loads(fields) if isinstance(fields, str) else fields

	doc = frappe.get_doc("Article", name)

	if doc.docstatus != 0:
		frappe.throw(frappe._("Only draft articles can be edited"))

	user_roles = frappe.get_roles()
	is_privileged = "LH Admin" in user_roles or "LH Manager" in user_roles or "System Manager" in user_roles
	if not is_privileged and doc.owner != frappe.session.user:
		frappe.throw(frappe._("Not permitted"), frappe.PermissionError)

	for field in ARTICLE_EDITABLE_FIELDS:
		if field in fields:
			doc.set(field, fields[field])

	# Always set author to current user if missing
	if not doc.author:
		doc.author = frappe.session.user

	doc.save(ignore_permissions=True)
	return {"name": doc.name, "modified": str(doc.modified)}


@frappe.whitelist()
def publish_article(name):
	"""Set status=Published and submit a draft Article."""
	doc = frappe.get_doc("Article", name)

	if doc.docstatus != 0:
		frappe.throw(frappe._("Only draft articles can be published"))

	user_roles = frappe.get_roles()
	is_privileged = "LH Admin" in user_roles or "LH Manager" in user_roles or "System Manager" in user_roles
	if not is_privileged and doc.owner != frappe.session.user:
		frappe.throw(frappe._("Not permitted"), frappe.PermissionError)

	if not doc.author:
		doc.author = frappe.session.user

	doc.status = "Published"
	doc.save(ignore_permissions=True)
	doc.submit()

	return {"name": doc.name, "status": doc.status}
