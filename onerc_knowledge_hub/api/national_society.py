import frappe


@frappe.whitelist(allow_guest=True)
def get_national_societies():
	"""Get list of all national societies for dropdown"""
	societies = frappe.get_all(
		"National Society",
		fields=["name", "full_official_name", "short_name", "country"],
		order_by="full_official_name asc",
	)
	return societies


@frappe.whitelist()
def get_national_societies_list():
	"""
	Get all National Societies for the listing page.
	Returns core fields including pillars child table.
	"""
	societies = frappe.get_all(
		"National Society",
		fields=[
			"name",
			"national_society_name",
			"abbreviation",
			"logo",
			"banner_image",
			"country",
			# region_name omitted — column not yet in DB (run bench migrate to enable)
			"about",
			"mission_statement",
			"key_focus_area",
			"website",
			"email",
			"phone_number",
			"physical_address",
			"secretary_general_name",
			"active_vonteers",
			"active_branches",
			"organization_size_update_date",
		],
		order_by="national_society_name asc",
	)

	# Attach pillars for each society (child table: Localization Pillar Link)
	for society in societies:
		pillars = frappe.get_all(
			"Localization Pillar Link",
			filters={"parent": society["name"], "parenttype": "National Society"},
			fields=["pillar"],
			order_by="idx asc",
		)
		society["pillars"] = [p["pillar"] for p in pillars]

	return societies


@frappe.whitelist()
def get_national_society_detail(name):
	"""
	Get full detail for a single National Society by its document name.
	"""
	if not frappe.db.exists("National Society", name):
		frappe.throw(f"National Society '{name}' not found", frappe.DoesNotExistError)

	doc = frappe.get_doc("National Society", name)

	pillars = frappe.get_all(
		"Localization Pillar Link",
		filters={"parent": doc.name, "parenttype": "National Society"},
		fields=["pillar"],
		order_by="idx asc",
	)

	data = {
		"name": doc.name,
		"national_society_name": doc.national_society_name,
		"abbreviation": doc.abbreviation,
		"logo": doc.logo,
		"banner_image": doc.banner_image,
		"country": doc.country,
		"region_name": getattr(doc, "region_name", None),  # may not exist until bench migrate
		"about": doc.about,
		"mission_statement": doc.mission_statement,
		"key_focus_area": doc.key_focus_area,
		"website": doc.website,
		"email": doc.email,
		"phone_number": doc.phone_number,
		"physical_address": doc.physical_address,
		"secretary_general_name": doc.secretary_general_name,
		"bio": doc.bio,
		"active_vonteers": doc.active_vonteers,
		"active_branches": doc.active_branches,
		"organization_size_update_date": str(doc.organization_size_update_date) if doc.organization_size_update_date else None,
		"pillars": [p["pillar"] for p in pillars],
		"social_media": [
			{
				"platform": row.get("platform", "") if isinstance(row, dict) else getattr(row, "platform", ""),
				"url": row.get("url", "") if isinstance(row, dict) else getattr(row, "url", ""),
			}
			for row in (doc.social_media or [])
		],
	}

	return data
