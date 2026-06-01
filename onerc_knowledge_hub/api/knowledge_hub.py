import frappe


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
			"summary",
			"description",
			"file_attachment",
			"external_url",
			"language",
			"contributing_ns",
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

	# Ensure uploaded_by shows email instead of full name
	if result.get("uploaded_by"):
		# uploaded_by is already the email (User doctype name is email)
		# Just make sure it's not being replaced with full_name
		result["uploaded_by"] = entry.uploaded_by

	return result


@frappe.whitelist()
def create_knowledge_hub(**args):
	data = frappe._dict(args)

	for key in ["cmd", "csrf_token"]:
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

	if not data.get("uploaded_by"):
		data["uploaded_by"] = frappe.session.user

	doc = frappe.get_doc({"doctype": "Knowledge Hub", **data})

	doc.insert()

	return {"name": doc.name}
