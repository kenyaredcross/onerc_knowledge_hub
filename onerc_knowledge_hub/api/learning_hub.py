# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_learning_resources(filters=None):
	"""
	Get list of Learning Hub resources with optional filters.
	"""
	filters = filters or {}

	# Build filter conditions
	conditions = {"docstatus": ["!=", 2]}  # Exclude cancelled documents

	if filters.get("pillar"):
		conditions["pillar"] = filters["pillar"]

	if filters.get("category"):
		conditions["category"] = filters["category"]

	if filters.get("national_society"):
		conditions["national_society"] = filters["national_society"]

	# Get learning resources
	resources = frappe.get_all(
		"Learning Hub",
		fields=[
			"name",
			"title",
			"national_society",
			"pillar",
			"cover_image",
			"views_count",
			"type",
			"external_platform_name",
			"external_url",
			"category",
			"date_posted",
			"summary",
			"description"
		],
		filters=conditions,
		order_by="date_posted desc"
	)

	# Get pillar names
	for resource in resources:
		if resource.get("pillar"):
			resource["pillar_name"] = frappe.db.get_value("Localization Pillar", resource["pillar"], "pillar")

		if resource.get("category"):
			resource["category_name"] = frappe.db.get_value("Category", resource["category"], "category_name")

		if resource.get("national_society"):
			resource["national_society_name"] = frappe.db.get_value("National Society", resource["national_society"], "national_society_name")

	return resources


@frappe.whitelist()
def get_learning_resource(name):
	"""
	Get a single learning resource by name.
	"""
	if not frappe.db.exists("Learning Hub", name):
		frappe.throw(_("Learning resource not found"), frappe.DoesNotExistError)

	resource = frappe.get_doc("Learning Hub", name)

	# Increment view count
	frappe.db.set_value("Learning Hub", name, "views_count", (resource.views_count or 0) + 1)
	frappe.db.commit()

	return resource.as_dict()


@frappe.whitelist()
def get_learning_stats():
	"""
	Get statistics for the learning hub overview.
	"""
	stats = {
		"total_resources": frappe.db.count("Learning Hub", {"docstatus": ["!=", 2]}),
		"total_views": frappe.db.sql("""
			SELECT COALESCE(SUM(views_count), 0) as total
			FROM `tabLearning Hub`
			WHERE docstatus != 2
		""", as_dict=True)[0].get("total", 0),
		"resources_by_pillar": frappe.db.sql("""
			SELECT
				p.pillar as pillar_name,
				COUNT(lh.name) as count
			FROM `tabLearning Hub` lh
			LEFT JOIN `tabLocalization Pillar` p ON lh.pillar = p.name
			WHERE lh.docstatus != 2
			GROUP BY lh.pillar
			ORDER BY count DESC
		""", as_dict=True),
		"recent_resources": frappe.db.count("Learning Hub", {
			"docstatus": ["!=", 2],
			"date_posted": [">", frappe.utils.add_days(frappe.utils.nowdate(), -30)]
		})
	}

	return stats


@frappe.whitelist()
def get_categories():
	"""
	Get all categories for filtering.
	"""
	categories = frappe.get_all(
		"Category",
		fields=["name", "category_name"],
		order_by="category_name asc"
	)

	return categories


@frappe.whitelist()
def get_pillars():
	"""
	Get all pillars for filtering.
	"""
	pillars = frappe.get_all(
		"Localization Pillar",
		fields=["name", "pillar"],
		order_by="pillar asc"
	)

	return pillars
