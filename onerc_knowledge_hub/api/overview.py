# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_dashboard_overview():
	"""
	Get overview statistics for the dashboard.
	Returns counts for key entities and recent activities.
	"""
	try:
		# Get counts for various entities
		stats = {
			"national_societies": get_national_societies_count(),
			"consortium_partners": get_consortium_partners_count(),
			"total_users": get_total_users_count(),
			"active_users": get_active_users_count(),
			"pending_users": get_pending_users_count(),
			"news_stories": get_articles_count(),
			"knowledge_hub": get_knowledge_hub_count(),
			"upcoming_events": get_upcoming_events_count(),
			"news_updates": get_news_count(),
			"events": get_events_count(),
			"knowledge_resources": get_knowledge_resources_count(),
		}

		# Get recent activities
		recent_data = {
			"recent_news": get_recent_news(limit=3),
			"upcoming_events": get_upcoming_events(limit=3),
			"featured_resources": get_featured_resources(limit=6),
			"recent_users": get_recent_users(limit=5),
		}

		return {
			"success": True,
			"stats": stats,
			"recent_data": recent_data
		}

	except Exception as e:
		frappe.log_error(f"Error fetching dashboard overview: {str(e)}")
		return {
			"success": False,
			"message": _("Failed to load dashboard data"),
			"error": str(e)
		}


def get_national_societies_count():
	"""Count of national societies"""
	return frappe.db.count("National Society")


def get_consortium_partners_count():
	"""Count of consortium partners (could be a custom field or doctype)"""
	# Adjust based on your actual data structure
	return frappe.db.count("National Society", {"is_consortium_partner": 1}) if frappe.db.has_column("National Society", "is_consortium_partner") else 7


def get_total_users_count():
	"""Count of all Localisation Hub Users"""
	return frappe.db.count("Localisation Hub User")


def get_active_users_count():
	"""Count of approved and activated users"""
	return frappe.db.count("Localisation Hub User", {
		"status": "Approved",
		"user_id": ["!=", ""]
	})


def get_pending_users_count():
	"""Count of pending users"""
	return frappe.db.count("Localisation Hub User", {"status": "Pending"})


def get_news_count():
	"""Count of news articles (adjust based on your doctype)"""
	# Check if News doctype exists, otherwise return default
	if frappe.db.exists("DocType", "News Article"):
		return frappe.db.count("News Article")
	return 0


def get_events_count():
	"""Count of events"""
	if frappe.db.exists("DocType", "Event"):
		return frappe.db.count("Event")
	return 0


def get_knowledge_resources_count():
	"""Count of knowledge resources/publications"""
	if frappe.db.exists("DocType", "Knowledge Resource"):
		return frappe.db.count("Knowledge Resource")
	return 0


def get_articles_count():
	"""Count of published articles"""
	if frappe.db.exists("DocType", "Article"):
		return frappe.db.count("Article", {"status": "Published", "docstatus": 1})
	return 0


def get_knowledge_hub_count():
	"""Count of knowledge hub entries"""
	if frappe.db.exists("DocType", "Knowledge Hub"):
		return frappe.db.count("Knowledge Hub", {"status": "Published"})
	return 0


def get_upcoming_events_count():
	"""Count of upcoming events"""
	# Check for Buzz Event first, then fall back to Event
	if frappe.db.exists("DocType", "Buzz Event"):
		from frappe.utils import nowdate
		return frappe.db.count("Buzz Event", {
			"start_date": [">=", nowdate()],
			"is_published": 1
		})
	elif frappe.db.exists("DocType", "Event"):
		from frappe.utils import nowdate
		return frappe.db.count("Event", {"starts_on": [">=", nowdate()]})

	return 0


def get_recent_news(limit=3):
	"""Get recent published articles from Article doctype"""
	if not frappe.db.exists("DocType", "Article"):
		return []

	articles = frappe.get_all(
		"Article",
		fields=[
			"name",
			"title",
			"slug",
			"summary as excerpt",
			"published_on",
			"category as tag",
			"cover_image",
			"is_featured"
		],
		filters={"status": "Published", "docstatus": 1},
		order_by="is_featured desc, published_on desc",
		limit=limit
	)

	# Add color field based on category
	# Map category names to color schemes
	category_color_map = {
		"Leadership": "leadership",
		"Branch Development": "branch",
		"Resource Mobilisation": "resource",
		"Finance Development": "finance"
	}

	from frappe.utils import formatdate

	for article in articles:
		category = article.get("tag", "")
		article["color"] = category_color_map.get(category, "leadership")

		# Format date to show only date without time
		if article.get("published_on"):
			article["date"] = formatdate(article["published_on"], "dd MMM yyyy")
		else:
			article["date"] = "Recent"

	return articles


def get_upcoming_events(limit=3):
	"""Get upcoming events"""
	from frappe.utils import nowdate

	# Check for Buzz Event first, then fall back to Event
	if frappe.db.exists("DocType", "Buzz Event"):
		events = frappe.get_all(
			"Buzz Event",
			fields=["name", "title", "start_date", "start_time", "end_date", "end_time", "venue", "category", "route"],
			filters={
				"start_date": [">=", nowdate()],
				"is_published": 1
			},
			order_by="start_date asc",
			limit=limit
		)

		# Format event data for Buzz Event
		for event in events:
			if event.get("start_date"):
				from frappe.utils import formatdate
				event["day"] = event["start_date"].strftime("%d")
				event["month"] = event["start_date"].strftime("%b").upper()
				event["time"] = event.get("start_time") or "TBA"
				event["date"] = formatdate(event["start_date"], "dd MMM yyyy")

		return events
	elif frappe.db.exists("DocType", "Event"):
		events = frappe.get_all(
			"Event",
			fields=["name", "subject as title", "starts_on", "ends_on", "event_type"],
			filters={
				"starts_on": [">=", nowdate()],
			},
			order_by="starts_on asc",
			limit=limit
		)

		# Format event data for Event
		for event in events:
			if event.get("starts_on"):
				from frappe.utils import formatdate
				event["day"] = event["starts_on"].strftime("%d")
				event["month"] = event["starts_on"].strftime("%b").upper()
				event["time"] = event["starts_on"].strftime("%I:%M %p")
				event["date"] = formatdate(event["starts_on"], "dd MMM yyyy")

		return events

	return []


def get_featured_resources(limit=6):
	"""Get featured knowledge resources"""
	if not frappe.db.exists("DocType", "Knowledge Resource"):
		return []

	resources = frappe.get_all(
		"Knowledge Resource",
		fields=["name", "title", "description", "category", "file_type", "published_date", "pillar"],
		filters={"is_featured": 1, "published": 1},
		order_by="published_date desc",
		limit=limit
	)

	return resources


def get_recent_users(limit=5):
	"""Get recently registered users"""
	users = frappe.get_all(
		"Localisation Hub User",
		fields=["name", "full_name", "prefered_contact_email", "national_society", "status", "creation"],
		order_by="creation desc",
		limit=limit
	)

	return users


@frappe.whitelist()
def get_user_statistics():
	"""
	Get detailed user statistics for admin dashboard
	"""
	total = frappe.db.count("Localisation Hub User")
	pending = frappe.db.count("Localisation Hub User", {"status": "Pending"})
	approved = frappe.db.count("Localisation Hub User", {"status": "Approved"})
	rejected = frappe.db.count("Localisation Hub User", {"status": "Rejected"})

	# Get activated users (approved with enabled user accounts)
	activated = frappe.db.sql("""
		SELECT COUNT(*)
		FROM `tabLocalisation Hub User` lhu
		INNER JOIN `tabUser` u ON lhu.user_id = u.name
		WHERE lhu.status = 'Approved' AND u.enabled = 1
	""")[0][0]

	return {
		"total": total,
		"pending": pending,
		"approved": approved,
		"rejected": rejected,
		"activated": activated,
		"pending_activation": approved - activated
	}


@frappe.whitelist()
def get_society_statistics():
	"""
	Get statistics grouped by national society
	"""
	society_stats = frappe.db.sql("""
		SELECT
			national_society,
			COUNT(*) as total_users,
			SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_users,
			SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_users
		FROM `tabLocalisation Hub User`
		GROUP BY national_society
		ORDER BY total_users DESC
	""", as_dict=True)

	return society_stats
