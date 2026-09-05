import frappe

@frappe.whitelist(allow_guest=True)
def get_steering_group_members():
	"""
	Get all Localisation Hub Users who are marked as steering group members.
	"""
	members = frappe.get_all(
		"Localisation Hub User",
		filters={
			"is_steering_group": 1,
		},
		fields=[
			"name",
			"full_name",
			"first_name",
			"last_name",
			"position",
			"national_society",
			"image",
			"bio",
			"phone_number",
			"company_email",
			"prefered_contact_email"
		],
		order_by="creation asc"
	)

	# Get position and national society names, and social media links
	for member in members:
		if member.get("position"):
			member["position_name"] = frappe.db.get_value("Designation", member["position"], "designation_name")

		if member.get("national_society"):
			member["national_society_name"] = frappe.db.get_value("National Society", member["national_society"], "national_society_name")

		# Get social media links
		social_media = frappe.get_all(
			"Social Media Links",
			filters={"parent": member["name"], "parenttype": "Localisation Hub User"},
			fields=["social_media_site", "icon", "url"],
			order_by="idx"
		)
		member["social_media"] = social_media

	return members


@frappe.whitelist(allow_guest=True)
def get_user_details() -> dict:
    name = frappe.session.user
    user = frappe.get_doc("User", name)
    user_dict = user.as_dict()

    # Try to fetch associated Localisation Hub User
    try:
        lh_user = frappe.db.get_value(
            "Localisation Hub User",
            {"user_id": name},
            ["name", "first_name", "middle_name", "last_name", "full_name",
             "position", "national_society", "personnel_type", "expertise",
             "primary_language", "other_languages", "bio", "phone_number",
             "company_email", "prefered_contact_email", "status", "is_steering_group",
             "banner_image"],
            as_dict=True
        )

        if lh_user:
            if lh_user.get("national_society"):
                lh_user["national_society_name"] = frappe.db.get_value(
                    "National Society", lh_user["national_society"], "national_society_name"
                ) or lh_user["national_society"]
            user_dict["lh_user"] = lh_user
    except Exception as e:
        frappe.log_error(f"Error fetching LH User: {str(e)}")

    return user_dict


@frappe.whitelist()
def update_banner_image(banner_image):
    """Save or clear the profile banner image on the current user's LH User record."""
    lhu_name = frappe.db.get_value(
        "Localisation Hub User", {"user_id": frappe.session.user}, "name"
    )
    if not lhu_name:
        frappe.throw(frappe._("No Localisation Hub profile found for this user"))
    frappe.db.set_value("Localisation Hub User", lhu_name, "banner_image", banner_image or "")
    frappe.db.commit()
    return {"banner_image": banner_image or ""}


@frappe.whitelist()
def update_lh_user_organisation(national_society, position):
    """Update the current user's National Society and Position on their LH User record."""
    lhu_name = frappe.db.get_value(
        "Localisation Hub User", {"user_id": frappe.session.user}, "name"
    )
    if not lhu_name:
        frappe.throw(frappe._("No Localisation Hub profile found for this user"))

    doc = frappe.get_doc("Localisation Hub User", lhu_name)
    doc.national_society = national_society or doc.national_society
    doc.position = position or doc.position
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"national_society": doc.national_society, "position": doc.position}