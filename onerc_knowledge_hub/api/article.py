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

	# Build filters
	filters = {}
	if not int(include_drafts):
		filters["status"] = "Published"
		filters["docstatus"] = 1

	# For managers AND regular users, filter by national society
	# Only admins see everything
	if not is_admin:
		# Get user's national society
		user_ns = frappe.db.get_value(
			"Localisation Hub User",
			{"user_id": current_user},
			"national_society"
		)

		frappe.log_error(f"User NS: {user_ns}", "Article Filter Debug")

		if user_ns:
			# Get all users from the same national society
			ns_users = frappe.get_all(
				"Localisation Hub User",
				filters={"national_society": user_ns},
				pluck="user_id"
			)

			frappe.log_error(f"NS Users: {ns_users}", "Article Filter Debug")

			# Filter articles by owner - only show articles from same national society
			if ns_users:
				filters["owner"] = ["in", ns_users]
			else:
				# No users found, return empty
				frappe.log_error("No users found for NS", "Article Filter Debug")
				return []
		else:
			# User has no national society set, return empty for non-admins
			frappe.log_error(f"User {current_user} has no national society", "Article Filter Debug")
			return []

	# Get articles with essential fields
	articles = frappe.get_all(
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

	frappe.log_error(f"Filters applied: {filters}, Articles found: {len(articles)}", "Article Filter Debug")

	# Add national society info for debugging
	for article in articles:
		owner_ns = frappe.db.get_value(
			"Localisation Hub User",
			{"user_id": article["owner"]},
			"national_society"
		)
		article["owner_national_society"] = owner_ns
		frappe.log_error(f"Article: {article['title']}, Owner: {article['owner']}, Owner NS: {owner_ns}", "Article Filter Debug")

	return articles
