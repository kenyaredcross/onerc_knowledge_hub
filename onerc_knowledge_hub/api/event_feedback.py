import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def submit_event_feedback(
	is_anonymous,
	q1_content_relevance,
	q4_speaker_quality,
	q5_technical_experience,
	q6_mindset_change,
	q9_likelihood_recommend,
	respondent_name=None,
	email=None,
	organisation=None,
	q2_most_valuable_session=None,
	q3_topics_not_covered=None,
	q7_concrete_action=None,
	q8_followup_interest=None,
	q10_krcs_did_well=None,
	q11_suggestions=None,
):
	anonymous = frappe.utils.cint(is_anonymous)

	if not anonymous and not respondent_name:
		frappe.throw(_("Please provide your name or submit anonymously."))

	doc = frappe.new_doc("Event Feedback")
	doc.submitted_on = frappe.utils.now_datetime()
	doc.is_anonymous = anonymous

	if not anonymous:
		doc.respondent_name = respondent_name
		doc.email = email
		doc.organisation = organisation

	doc.q1_content_relevance = frappe.utils.cint(q1_content_relevance)
	doc.q2_most_valuable_session = q2_most_valuable_session
	doc.q3_topics_not_covered = q3_topics_not_covered
	doc.q4_speaker_quality = frappe.utils.cint(q4_speaker_quality)
	doc.q5_technical_experience = frappe.utils.cint(q5_technical_experience)
	doc.q6_mindset_change = q6_mindset_change
	doc.q7_concrete_action = q7_concrete_action
	doc.q8_followup_interest = q8_followup_interest or None
	doc.q9_likelihood_recommend = frappe.utils.cint(q9_likelihood_recommend)
	doc.q10_krcs_did_well = q10_krcs_did_well
	doc.q11_suggestions = q11_suggestions

	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name}
