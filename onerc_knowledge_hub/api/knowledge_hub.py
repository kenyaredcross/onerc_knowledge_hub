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
	return entry.as_dict()


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
