import frappe
from datetime import datetime


@frappe.whitelist(allow_guest=True)
def get_events():
	now = frappe.utils.now_datetime()

	events = frappe.get_all(
		"Buzz Event",
		filters=[
			["is_published", "=", 1],
			["end_date", ">=", now.date()],
			[
				"name",
				"not in",
				frappe.get_all(
					"Buzz Event",
					filters={"end_date": now.date(), "end_time": ["<", now.time()]},
					pluck="name",
				),
			],
		],
		fields=[
			"name",
			"title",
			"category",
			"start_date",
			"start_time",
			"time_zone",
			"end_date",
			"end_time",
			"short_description",
			"about",
			"venue",
			"host",
			"free_webinar",
			"medium",
			"banner_image",
			"is_published",
			"registrations_close_at",
			"route",
		],
		order_by="start_date asc",
		ignore_permissions=True,
	)

	# Format time to 12-hour format with AM/PM
	for event in events:
		if event.get("start_time"):
			# Convert time string to datetime object
			time_obj = datetime.strptime(str(event["start_time"]), "%H:%M:%S")
			# Format to 12-hour with AM/PM
			event["start_time"] = time_obj.strftime("%I:%M %p")

		if event.get("end_time"):
			time_obj = datetime.strptime(str(event["end_time"]), "%H:%M:%S")
			event["end_time"] = time_obj.strftime("%I:%M %p")

	if not events:
		return {"featured": None, "upcoming": []}

	featured_name = events[0].name
	featured_doc = frappe.get_doc("Buzz Event", featured_name)

	featured_data = featured_doc.as_dict()

	featured_data["featured_speakers"] = []
	for speaker in featured_doc.get("featured_speakers"):
		speaker_doc = frappe.get_doc("Speaker Profile", speaker.speaker)
		featured_data["featured_speakers"].append(
			{
				"display_name": speaker_doc.display_name,
				"designation": speaker_doc.designation,
				"display_image": speaker_doc.display_image,
				"company": speaker_doc.company,
				"social_media_links": speaker_doc.social_media_links,
			}
		)

	featured_data["event_sponsors"] = []
	event_sponsors = frappe.get_all(
		"Event Sponsor",
		filters={"event": featured_name},
		fields=["company_name", "company_logo", "website", "tier", "country"],
		ignore_permissions=True,
	)
	for sponsor in event_sponsors:
		featured_data["event_sponsors"].append(
			{
				"sponsor_name": sponsor.company_name,
				"logo": sponsor.company_logo,
				"website": sponsor.website,
				"tier": sponsor.tier,
				"country": sponsor.country,
			}
		)

	return {"featured": featured_data, "upcoming": events[1:]}


@frappe.whitelist(allow_guest=True)
def get_event_details(event_route):
	event_doc = frappe.get_doc("Buzz Event", {"route": event_route})

	event_data = event_doc.as_dict()

	# Format time to 12-hour format with AM/PM
	if event_data.get("start_time"):
		time_obj = datetime.strptime(str(event_data["start_time"]), "%H:%M:%S")
		event_data["start_time"] = time_obj.strftime("%I:%M %p")

	if event_data.get("end_time"):
		time_obj = datetime.strptime(str(event_data["end_time"]), "%H:%M:%S")
		event_data["end_time"] = time_obj.strftime("%I:%M %p")

	event_data["featured_speakers"] = []
	for speaker in event_doc.get("featured_speakers"):
		speaker_doc = frappe.get_doc("Speaker Profile", speaker.speaker)
		event_data["featured_speakers"].append(
			{
				"display_name": speaker_doc.display_name,
				"designation": speaker_doc.designation,
				"display_image": speaker_doc.display_image,
				"company": speaker_doc.company,
				"social_media_links": speaker_doc.social_media_links,
			}
		)

	event_data["event_sponsors"] = []
	event_sponsors = frappe.get_all(
		"Event Sponsor",
		filters={"event": event_doc.name},
		fields=["company_name", "company_logo", "website", "tier", "country"],
		ignore_permissions=True,
	)
	for sponsor in event_sponsors:
		event_data["event_sponsors"].append(
			{
				"sponsor_name": sponsor.company_name,
				"logo": sponsor.company_logo,
				"website": sponsor.website,
				"tier": sponsor.tier,
				"country": sponsor.country,
			}
		)

	return event_data
