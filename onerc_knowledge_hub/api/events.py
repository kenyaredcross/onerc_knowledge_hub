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


@frappe.whitelist(allow_guest=True)
def get_past_events():
	"""Get all past/previous events"""
	now = frappe.utils.now_datetime()

	past_events = frappe.get_all(
		"Buzz Event",
		filters=[
			["is_published", "=", 1],
			["end_date", "<", now.date()],
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
			"route",
		],
		order_by="start_date desc",  # Most recent first
		ignore_permissions=True,
	)

	# Format time to 12-hour format with AM/PM
	for event in past_events:
		if event.get("start_time"):
			time_obj = datetime.strptime(str(event["start_time"]), "%H:%M:%S")
			event["start_time"] = time_obj.strftime("%I:%M %p")

		if event.get("end_time"):
			time_obj = datetime.strptime(str(event["end_time"]), "%H:%M:%S")
			event["end_time"] = time_obj.strftime("%I:%M %p")

	return past_events


# --------------------------------------------------------------------------- #
# Member event submissions
#
# Events live in the Buzz Event doctype, which belongs to the Buzz app and is
# not part of this repo. Rather than hard-code its schema, the endpoints below
# read the doctype's meta at runtime: the form asks what fields exist and what
# values they accept, and the payload is filtered down to real fields before
# insert. That keeps the in-app form working across Buzz versions instead of
# sending members into the Frappe Desk form.
# --------------------------------------------------------------------------- #

EVENT_DOCTYPE = "Buzz Event"

CONTRIBUTOR_ROLES = ("LH User", "LH Manager", "LH Admin", "System Manager")
PUBLISHER_ROLES = ("LH Manager", "LH Admin", "System Manager")

# Fields the in-app form offers, in the order they should be rendered.
EVENT_FORM_FIELDS = (
	"title",
	"category",
	"short_description",
	"about",
	"start_date",
	"start_time",
	"end_date",
	"end_time",
	"time_zone",
	"medium",
	"venue",
	"host",
	"banner_image",
	"free_webinar",
	"registrations_close_at",
)

EVENT_MY_LIST_FIELDS = (
	"name",
	"title",
	"start_date",
	"start_time",
	"end_date",
	"venue",
	"medium",
	"is_published",
	"route",
	"banner_image",
	"owner",
)


def _event_roles(user=None):
	return frappe.get_roles(user or frappe.session.user)


def can_create_events(user=None):
	roles = _event_roles(user)
	return any(role in roles for role in CONTRIBUTOR_ROLES)


def can_publish_events(user=None):
	roles = _event_roles(user)
	return any(role in roles for role in PUBLISHER_ROLES)


def _require_event_doctype():
	if not frappe.db.exists("DocType", EVENT_DOCTYPE):
		frappe.throw(
			frappe._(
				"Events are not available on this site because the {0} doctype is missing."
			).format(EVENT_DOCTYPE)
		)


def _require_event_contributor():
	if frappe.session.user == "Guest" or not can_create_events():
		frappe.throw(
			frappe._("You need contributor access to submit an event"),
			frappe.PermissionError,
		)


def build_event_payload(data, allowed_fields):
	"""Keep only submitted values that map to a real field on the event doctype.

	Pure helper so the filtering can be reasoned about and tested without the
	Buzz app installed.
	"""
	skip = {"cmd", "csrf_token", "doctype", "name", "owner", "is_published", "route"}

	payload = {}
	for key, value in (data or {}).items():
		if key in skip or key not in allowed_fields:
			continue
		if value in (None, ""):
			continue
		payload[key] = value

	return payload


def slugify_event_title(title):
	"""Turn a title into a lowercase, hyphenated, URL-safe slug.

	frappe.scrub keeps punctuation such as "!" and "\'", which does not belong
	in a route, so accents are folded and anything else is dropped here.
	"""
	import re
	import unicodedata

	text = unicodedata.normalize("NFKD", str(title or ""))
	text = text.encode("ascii", "ignore").decode("ascii").lower()
	text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")

	return text or "event"


def make_event_route(title, existing_checker=None):
	"""Build a unique, URL-safe route for an event from its title."""
	slug = slugify_event_title(title)

	if existing_checker is None:
		def existing_checker(candidate):
			return bool(
				frappe.db.exists(EVENT_DOCTYPE, {"route": candidate})
			)

	candidate = slug
	suffix = 2
	while existing_checker(candidate):
		candidate = f"{slug}-{suffix}"
		suffix += 1

	return candidate


@frappe.whitelist()
def get_event_form_options():
	"""Describe the event fields the in-app form should render.

	Returns one entry per available field with its type, label, whether it is
	required, and either its Select choices or the doctype a Link points at, so
	the form never has to guess at Buzz's schema.
	"""
	_require_event_doctype()
	_require_event_contributor()

	meta = frappe.get_meta(EVENT_DOCTYPE)

	fields = []
	for fieldname in EVENT_FORM_FIELDS:
		df = meta.get_field(fieldname)
		if not df:
			continue

		entry = {
			"fieldname": fieldname,
			"fieldtype": df.fieldtype,
			"label": df.label or fieldname.replace("_", " ").title(),
			"reqd": bool(df.reqd),
			"description": df.description,
			"default": df.default,
		}

		if df.fieldtype == "Select":
			entry["select_options"] = [
				option for option in (df.options or "").split("\n") if option.strip()
			]
		elif df.fieldtype in ("Link", "Table MultiSelect"):
			entry["link_doctype"] = df.options

		fields.append(entry)

	return {
		"fields": fields,
		"can_publish": can_publish_events(),
	}


@frappe.whitelist()
def create_event(**args):
	"""Create an event from the hub UI.

	Members submit their own events. Managers publish straight away; everyone
	else submits an unpublished event for a manager to review.
	"""
	_require_event_doctype()
	_require_event_contributor()

	data = frappe._dict(args)

	title = (data.get("title") or "").strip()
	if not title:
		frappe.throw(frappe._("Event title is required"))

	meta = frappe.get_meta(EVENT_DOCTYPE)
	allowed_fields = {df.fieldname for df in meta.fields if df.fieldname}

	payload = build_event_payload(data, allowed_fields)
	payload["title"] = title

	doc = frappe.new_doc(EVENT_DOCTYPE)
	for key, value in payload.items():
		doc.set(key, value)

	if meta.get_field("route") and not doc.get("route"):
		doc.route = make_event_route(title)

	if meta.get_field("is_published"):
		requested = frappe.utils.cint(data.get("is_published", 1))
		# Only managers may put an event live; member submissions wait for review.
		doc.is_published = 1 if (requested and can_publish_events()) else 0

	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return {
		"name": doc.name,
		"route": doc.get("route"),
		"is_published": frappe.utils.cint(doc.get("is_published")),
		"pending_review": not frappe.utils.cint(doc.get("is_published")),
	}


@frappe.whitelist()
def get_my_events():
	"""Events the caller can follow up on, including ones awaiting review.

	Members see their own submissions. Managers see every event, so the pending
	ones can be reviewed and published without leaving the hub.
	"""
	if not frappe.db.exists("DocType", EVENT_DOCTYPE):
		return []

	_require_event_contributor()

	meta = frappe.get_meta(EVENT_DOCTYPE)
	fields = [f for f in EVENT_MY_LIST_FIELDS if f == "name" or meta.get_field(f)]

	filters = {} if can_publish_events() else {"owner": frappe.session.user}

	return frappe.get_all(
		EVENT_DOCTYPE,
		filters=filters,
		fields=fields,
		order_by="creation desc",
		limit=50,
		ignore_permissions=True,
	)


@frappe.whitelist()
def set_event_published(name, is_published=1):
	"""Publish or unpublish an event. Managers only."""
	_require_event_doctype()

	if not can_publish_events():
		frappe.throw(
			frappe._("Only a hub manager can publish events"), frappe.PermissionError
		)

	meta = frappe.get_meta(EVENT_DOCTYPE)
	if not meta.get_field("is_published"):
		frappe.throw(frappe._("This event doctype has no published flag"))

	published = 1 if frappe.utils.cint(is_published) else 0
	frappe.db.set_value(EVENT_DOCTYPE, name, "is_published", published)
	frappe.db.commit()

	return {"name": name, "is_published": published}
