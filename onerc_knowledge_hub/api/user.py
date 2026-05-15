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
			"status": "Approved"
		},
		fields=[
			"name",
			"full_name",
			"first_name",
			"last_name",
			"position",
			"national_society",
			"image",
			"bio"
		],
		order_by="creation asc"
	)

	# Get position and national society names
	for member in members:
		if member.get("position"):
			member["position_name"] = frappe.db.get_value("Designation", member["position"], "designation_name")

		if member.get("national_society"):
			member["national_society_name"] = frappe.db.get_value("National Society", member["national_society"], "national_society_name")

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
             "company_email", "prefered_contact_email", "status", "is_steering_group"],
            as_dict=True
        )

        if lh_user:
            user_dict["lh_user"] = lh_user
    except Exception as e:
        frappe.log_error(f"Error fetching LH User: {str(e)}")

    return user_dict