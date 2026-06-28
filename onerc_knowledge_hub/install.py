# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt

import frappe


def after_install():
	"""Create custom roles and seed default content after app installation"""
	create_custom_roles()
	create_fs_assessment_questions()


def create_custom_roles():
	"""Create LH Admin, LH User, LH Manager and LH FS Manager roles if they don't exist"""

	roles = [
		{
			"role_name": "LH Admin",
			"desk_access": 1,
			"disabled": 0,
		},
		{
			"role_name": "LH User",
			"desk_access": 1,
			"disabled": 0,
		},
		{
			"role_name": "LH Manager",
			"desk_access": 1,
			"disabled": 0,
		},
		{
			# Grants access to the Financial Sustainability assessment dashboard
			# (/fs-dashboard) and the FS Assessment doctypes.
			"role_name": "LH FS Manager",
			"desk_access": 1,
			"disabled": 0,
		},
	]

	for role_data in roles:
		if not frappe.db.exists("Role", role_data["role_name"]):
			role = frappe.get_doc({
				"doctype": "Role",
				"role_name": role_data["role_name"],
				"desk_access": role_data["desk_access"],
				"disabled": role_data["disabled"],
			})
			role.insert(ignore_permissions=True)
			frappe.db.commit()
			print(f"Created role: {role_data['role_name']}")
		else:
			print(f"Role already exists: {role_data['role_name']}")


@frappe.whitelist()
def setup_roles():
	"""Manual function to create roles if they don't exist. Can be called via bench console."""
	frappe.only_for("System Manager")
	create_custom_roles()
	return {"message": "Roles setup completed"}


@frappe.whitelist()
def setup_fs_assessment():
	"""Create the LH FS Manager role and seed the FS assessment questions.

	Safe to run on an already-installed site (e.g. via
	`bench --site <site> execute onerc_knowledge_hub.install.setup_fs_assessment`).
	"""
	frappe.only_for("System Manager")
	create_custom_roles()
	created = create_fs_assessment_questions()
	return {"message": f"FS assessment setup completed ({created} question(s) created)"}


def create_fs_assessment_questions():
	"""Seed the Financial Sustainability assessment questions.

	Idempotent: only seeds when there are no FS Assessment Question records, so
	the questions stay fully editable in Desk without being overwritten.
	"""
	if frappe.db.count("FS Assessment Question") > 0:
		print("FS Assessment Questions already exist — skipping seed")
		return 0

	created = 0
	for q in FS_QUESTIONS:
		doc = frappe.get_doc({
			"doctype": "FS Assessment Question",
			"question_text": q["question_text"],
			"question_type": q["question_type"],
			"phase": q.get("phase", "Both"),
			"display_order": q["display_order"],
			"is_scored": q.get("is_scored", 0),
			"is_required": q.get("is_required", 1),
			"has_followup": q.get("has_followup", 0),
			"followup_prompt": q.get("followup_prompt"),
			"help_text": q.get("help_text"),
			"options": [
				{
					"option_text": o["option_text"],
					"score": o.get("score", 0),
					"is_correct": o.get("is_correct", 0),
				}
				for o in q.get("options", [])
			],
		})
		doc.insert(ignore_permissions=True)
		created += 1

	frappe.db.commit()
	print(f"Created {created} FS Assessment Questions")
	return created


# --------------------------------------------------------------------------- #
# Seed data: the 14 FS Peer-Learning Assessment questions.
# Q1-Q10 are asked in both phases; Q11-Q14 are post-assessment only.
# Correct options carry a score of 1; distractors carry 0.
# --------------------------------------------------------------------------- #
FS_QUESTIONS = [
	{
		"display_order": 1,
		"question_type": "Single Choice",
		"phase": "Both",
		"is_scored": 1,
		"question_text": "What is a financially sustainable National Society?",
		"options": [
			{
				"option_text": "A financially sustainable National Society attracts and manages the financial resources needed to deliver humanitarian services in a transparent and accountable manner, while effectively managing risks and opportunities through adaptive structures, systems, leadership, and diversified revenue streams that support its mission and long-term strategy.",
				"score": 1,
				"is_correct": 1,
			},
			{
				"option_text": "A National Society that generates enough profit from commercial activities to completely eliminate the need for external donor funding.",
			},
			{
				"option_text": "A National Society that successfully cuts administrative overhead costs to zero, so all funds go directly to humanitarian programs.",
			},
		],
	},
	{
		"display_order": 2,
		"question_type": "Multiple Choice",
		"phase": "Both",
		"is_scored": 1,
		"help_text": "Select all that apply.",
		"question_text": "What are the enablers of a financially sustainable National Society?",
		"options": [
			{"option_text": "Leveraging the auxiliary role to public authorities", "score": 1, "is_correct": 1},
			{"option_text": "Strong leadership commitment to financial sustainability", "score": 1, "is_correct": 1},
			{"option_text": "Having a formal Resource Mobilization (RM) strategy", "score": 1, "is_correct": 1},
			{"option_text": "Maintaining strong financial systems, controls, and robust branches", "score": 1, "is_correct": 1},
			{"option_text": "Securing long-term multi-million-dollar international donor projects"},
			{"option_text": "Prioritizing rapid program expansion over internal compliance and financial audits"},
		],
	},
	{
		"display_order": 3,
		"question_type": "Multiple Choice",
		"phase": "Both",
		"is_scored": 0,
		"help_text": "Select all that apply.",
		"question_text": "What tools/frameworks/guidelines for financial sustainability are you already familiar with?",
		"options": [
			{"option_text": "IFRC National Societies Financial Sustainability Framework"},
			{"option_text": "National Society Development (NSD) Compact"},
			{"option_text": "IFRC Strategy 2030"},
			{"option_text": "Financial Sustainability (FS) Impact Measurement Framework"},
			{"option_text": "None of the above"},
		],
	},
	{
		"display_order": 4,
		"question_type": "Narrative",
		"phase": "Both",
		"question_text": "How does localization contribute to financial sustainability and/or vice versa?",
	},
	{
		"display_order": 5,
		"question_type": "Yes/No",
		"phase": "Both",
		"has_followup": 1,
		"followup_prompt": "If yes, please briefly explain why.",
		"question_text": "Is it important to assess financial sustainability for National Societies?",
	},
	{
		"display_order": 6,
		"question_type": "Single Choice",
		"phase": "Both",
		"is_scored": 1,
		"question_text": "In your view, what measures should a National Society adopt in its resource mobilization approaches for financial sustainability and resilience?",
		"options": [
			{
				"option_text": "Income diversification, strategic investments, and maximizing Return on Investment (ROI) in Income Generating Initiatives and Activities (IGIAs).",
				"score": 1,
				"is_correct": 1,
			},
			{"option_text": "Focusing on donor funding to avoid commercial investment risks."},
			{"option_text": "Launching as many different micro-businesses as possible across all branches."},
		],
	},
	{
		"display_order": 7,
		"question_type": "Yes/No",
		"phase": "Both",
		"has_followup": 1,
		"followup_prompt": "If yes, how? If no, why?",
		"question_text": "Do you think partners and donors should invest in National Societies' IGIAs for financial sustainability?",
	},
	{
		"display_order": 8,
		"question_type": "Single Choice",
		"phase": "Both",
		"is_scored": 1,
		"question_text": "What type of funding should primarily be targeted through Income Generating Initiatives and Activities (IGIAs) to achieve a financially sustainable National Society?",
		"options": [
			{
				"option_text": "Unrestricted funding (to allow flexible allocation for institutional development and emergencies).",
				"score": 1,
				"is_correct": 1,
			},
			{"option_text": "Earmarked project funding (strictly tied to donor-specified project activities)."},
			{"option_text": "In-kind donations and material assets only."},
		],
	},
	{
		"display_order": 9,
		"question_type": "Multiple Choice",
		"phase": "Both",
		"is_scored": 1,
		"help_text": "Select all that apply.",
		"question_text": "Which financial sustainability risks are faced by National Societies in Africa?",
		"options": [
			{"option_text": "Heavy donor dependency", "score": 1, "is_correct": 1},
			{"option_text": "Non-profitable or poorly managed IGIAs", "score": 1, "is_correct": 1},
			{"option_text": "Balancing a commercial business mindset with the humanitarian mandate", "score": 1, "is_correct": 1},
			{"option_text": "Excessively high reserves of unrestricted cash"},
		],
	},
	{
		"display_order": 10,
		"question_type": "Narrative",
		"phase": "Both",
		"question_text": "What measures can be put in place to mitigate some of these risks, especially those involving the insufficiency of robust and reliable financial systems and leadership commitment to financial sustainability?",
	},
	{
		"display_order": 11,
		"question_type": "Narrative",
		"phase": "Post",
		"question_text": "From which peer organization(s) did you learn the most during this engagement, and what did you learn?",
	},
	{
		"display_order": 12,
		"question_type": "Narrative",
		"phase": "Post",
		"question_text": "What new ideas from the financial sustainability dialogue will you apply to strengthen financial sustainability in your National Society?",
	},
	{
		"display_order": 13,
		"question_type": "Action Matrix",
		"phase": "Post",
		"help_text": "Describe up to three specific actions you intend to implement to strengthen financial sustainability in your National Society.",
		"question_text": "Action Planning Matrix",
	},
	{
		"display_order": 14,
		"question_type": "Multiple Choice",
		"phase": "Post",
		"is_scored": 0,
		"help_text": "Select all that apply.",
		"question_text": "What peer learning support would strengthen financial sustainability in your National Society?",
		"options": [
			{"option_text": "More bilateral peer exchange visits"},
			{"option_text": "Mentorship from experienced National Societies in specific issues"},
			{"option_text": "Practical case studies and operational templates"},
			{"option_text": "Follow-up coaching and technical clinics"},
			{"option_text": "Active participation in Regional Communities of Practice"},
			{"option_text": "Tailored Resource Mobilization toolkits and investment plans"},
			{"option_text": "Quarterly thematic webinars"},
			{"option_text": "Joint investment ventures between National Societies"},
		],
	},
]
