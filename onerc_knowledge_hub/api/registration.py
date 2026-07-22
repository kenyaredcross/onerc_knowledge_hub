# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Public submission + notifications for the Delegate Registration form.

Secretary Generals (and their delegations) from other National Societies use the
public `/delegate-registration` page to register for an event in Kenya: passport
biodata, travel dates, an optional room at the Boma Hotel, and the sessions they
plan to attend. A submission creates a `Delegate Registration` (with the passport
copy stored as a private file) and fires three best-effort emails: a confirmation
to the delegate, a notice to the KRCS admin, and — when accommodation is requested
— a request to the Boma Hotel with the KRCS admin CC'd for follow-up.

The whole flow mirrors the Financial Sustainability assessment
(`onerc_knowledge_hub.api.assessment`): guests submit through one whitelisted
method, the doc is written with `ignore_permissions`, and every email is wrapped so
a failure never blocks the browser confirmation.
"""

import base64
import json

import frappe
from frappe import _
from frappe.utils import escape_html, formatdate, get_url, now_datetime

ADMIN_ROLES = {"Delegate Manager", "System Manager"}

# Passport copies are sensitive PII, so the upload is tightly bounded.
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB

# Brand tokens, shared with every email (matches the FS assessment shell).
NAVY = "#011E41"
RED = "#ee2435"
BORDER = "#e5e7eb"
MUTED = "#6b7280"

DESIGNATIONS = {"Secretary General", "Deputy Secretary General", "Officer", "Other"}


# --------------------------------------------------------------------------- #
# Public: submission
# --------------------------------------------------------------------------- #

@frappe.whitelist(allow_guest=True)
def submit_registration(payload):
	"""Create a Delegate Registration from a public submission."""
	data = payload if isinstance(payload, dict) else json.loads(payload or "{}")

	surname = (data.get("surname") or "").strip()
	given_names = (data.get("given_names") or "").strip()
	national_society = data.get("national_society") or None
	passport_number = (data.get("passport_number") or "").strip()
	email = (data.get("email") or "").strip().lower()

	if not surname or not given_names:
		frappe.throw(_("Surname and given names are required"))
	if not national_society or not frappe.db.exists("National Society", national_society):
		frappe.throw(_("Please select a valid National Society"))
	if not passport_number:
		frappe.throw(_("Passport number is required"))
	if not email:
		frappe.throw(_("Email is required"))

	file_name = data.get("passport_file_name")
	file_data = data.get("passport_file_data")
	if not file_data:
		frappe.throw(_("A copy of the passport biodata page is required"))
	# Validate + decode the passport up-front so we never insert a registration
	# for an invalid file (bad type, oversized, or corrupt base64).
	passport_bytes, passport_ext = _decode_passport(file_name, file_data)

	designation = data.get("designation") or None
	if designation and designation not in DESIGNATIONS:
		frappe.throw(_("Invalid designation"))

	nationality = data.get("nationality") or None
	if nationality and not frappe.db.exists("Country", nationality):
		nationality = None

	doc = frappe.get_doc(
		{
			"doctype": "Delegate Registration",
			"surname": surname,
			"given_names": given_names,
			"national_society": national_society,
			"designation": designation,
			"designation_other": (data.get("designation_other") or "").strip() or None
			if designation == "Other"
			else None,
			"nationality": nationality,
			"passport_number": passport_number,
			"date_of_birth": data.get("date_of_birth") or None,
			"passport_issue_date": data.get("passport_issue_date") or None,
			"passport_expiry_date": data.get("passport_expiry_date") or None,
			"email": email,
			"phone_number": (data.get("phone_number") or "").strip() or None,
			"arrival_date": data.get("arrival_date") or None,
			"arrival_time": data.get("arrival_time") or None,
			"arrival_flight": (data.get("arrival_flight") or "").strip() or None,
			"departure_date": data.get("departure_date") or None,
			"departure_time": data.get("departure_time") or None,
			"departure_flight": (data.get("departure_flight") or "").strip() or None,
			"additional_information": (data.get("additional_information") or "").strip() or None,
			"accommodation_boma": 1 if data.get("accommodation_boma") else 0,
			"status": "New",
		}
	)

	for session_id in _clean_session_ids(data.get("sessions")):
		title = frappe.db.get_value("Summit Session", session_id, "session_title")
		doc.append("sessions", {"session": session_id, "session_title": title})

	# `passport_copy` is mandatory but can only be filled once the record has a
	# name to attach the file to, so we skip the mandatory check here and set it
	# immediately after via the attachment. The file itself is already validated.
	doc.insert(ignore_permissions=True, ignore_mandatory=True)

	# Store the passport copy as a private file attached to the record.
	_attach_passport(doc, passport_bytes, passport_ext)

	frappe.db.commit()

	# Post-processing. Each step is best-effort so a failure never prevents the
	# delegate from getting their confirmation in the browser.
	_send_confirmation_email(doc)
	_notify_admin(doc)
	boma_requested = _send_boma_request(doc)

	return {"name": doc.name, "boma_requested": boma_requested}


def _clean_session_ids(raw):
	"""Return the subset of submitted session ids that actually exist, de-duplicated."""
	if not isinstance(raw, list):
		return []
	seen = []
	for session_id in raw:
		if not session_id or session_id in seen:
			continue
		if frappe.db.exists("Summit Session", session_id):
			seen.append(session_id)
	return seen


def _decode_passport(file_name, file_data):
	"""Validate and decode a base64 (optionally data-URL) upload.

	Returns ``(raw_bytes, extension)``. Raises on an invalid type, empty/corrupt
	data, or a file larger than ``MAX_FILE_BYTES`` — before any record is created.
	"""
	name = (file_name or "passport").strip()
	ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
	if ext not in ALLOWED_EXTENSIONS:
		frappe.throw(_("The passport copy must be a PDF, JPG or PNG file"))

	# Accept both a raw base64 string and a "data:<mime>;base64,<...>" data URL.
	encoded = file_data.strip()
	if encoded.lower().startswith("data:") and "," in encoded:
		encoded = encoded.split(",", 1)[1]

	try:
		raw = base64.b64decode(encoded, validate=True)
	except Exception:
		frappe.throw(_("The passport file could not be read. Please re-attach it."))

	if not raw:
		frappe.throw(_("The passport file is empty. Please re-attach it."))
	if len(raw) > MAX_FILE_BYTES:
		frappe.throw(_("The passport copy must be 5 MB or smaller"))

	return raw, ext


def _attach_passport(doc, raw, ext):
	"""Store the decoded passport bytes as a private file on the registration.

	Frappe scans every uploaded PDF for embedded JavaScript; a malicious or simply
	corrupt PDF can make that scan raise a low-level parser error, so anything other
	than Frappe's own user-facing ValidationError is turned into a friendly message.
	"""
	try:
		file_doc = frappe.get_doc(
			{
				"doctype": "File",
				"file_name": "passport-{0}.{1}".format(doc.name, ext),
				"content": raw,
				"is_private": 1,
				"attached_to_doctype": doc.doctype,
				"attached_to_name": doc.name,
				"attached_to_field": "passport_copy",
			}
		).insert(ignore_permissions=True)
	except frappe.ValidationError:
		raise
	except Exception:
		frappe.log_error(title="Delegate registration passport save failed", message=frappe.get_traceback())
		frappe.throw(_("The passport file could not be processed. Please attach a valid PDF or image."))

	doc.db_set("passport_copy", file_doc.file_url, update_modified=False)


# --------------------------------------------------------------------------- #
# Admin: resend the Boma request (role-gated, called from the Desk form button)
# --------------------------------------------------------------------------- #

@frappe.whitelist()
def resend_boma_request(name):
	"""Re-trigger the Boma Hotel accommodation email for a registration."""
	if not ADMIN_ROLES.intersection(set(frappe.get_roles())):
		frappe.throw(_("Not permitted"), frappe.PermissionError)

	doc = frappe.get_doc("Delegate Registration", name)
	if not doc.accommodation_boma:
		frappe.throw(_("This delegate did not request Boma Hotel accommodation"))

	settings = _settings()
	if not (settings.get("boma_hotel_email") or "").strip():
		frappe.throw(_("Set the Boma Hotel email in Delegate Registration Settings first"))

	sent = _send_boma_request(doc, force=True)
	return {"sent": sent}


# --------------------------------------------------------------------------- #
# Settings + shared helpers
# --------------------------------------------------------------------------- #

def _settings():
	return frappe.get_cached_doc("Delegate Registration Settings")


def _event_title():
	title = (_settings().get("event_title") or "").strip()
	return title or "Delegate Registration"


def _full_name(doc):
	return " ".join(part for part in [doc.surname, doc.given_names] if part).strip()


def _designation_label(doc):
	if doc.designation == "Other":
		return (doc.designation_other or "").strip() or "Other"
	return doc.designation or ""


def _ns_name(doc):
	if not doc.national_society:
		return None
	return frappe.db.get_value("National Society", doc.national_society, "national_society_name")


def _sessions_summary(doc):
	"""Human-readable "Title - Date, HH:MM-HH:MM" lines for the chosen sessions."""
	lines = []
	for row in doc.sessions:
		if not row.session:
			continue
		info = frappe.db.get_value(
			"Summit Session",
			row.session,
			["session_title", "session_date", "start_time", "end_time"],
			as_dict=True,
		)
		if not info:
			lines.append(row.session_title or row.session)
			continue
		bits = [info.session_title or row.session_title or ""]
		when = []
		if info.session_date:
			when.append(formatdate(info.session_date))
		time_range = _time_range(info.start_time, info.end_time)
		if time_range:
			when.append(time_range)
		if when:
			bits.append(", ".join(when))
		lines.append(" - ".join(b for b in bits if b))
	return lines


def _time_range(start, end):
	start = _fmt_time(start)
	end = _fmt_time(end)
	if start and end:
		return "{0}-{1}".format(start, end)
	return start or end or ""


def _fmt_time(value):
	"""Render a Time field (timedelta or "HH:MM:SS" string) as "HH:MM"."""
	if value in (None, ""):
		return ""
	text = str(value)
	# Handles both "HH:MM:SS" and "H:MM:SS" style values.
	parts = text.split(":")
	if len(parts) >= 2:
		return "{0}:{1}".format(parts[0].zfill(2), parts[1])
	return text


# --------------------------------------------------------------------------- #
# Email: shared shell + detail table
# --------------------------------------------------------------------------- #

def _email_shell(heading, meta_line, body_html):
	"""Wrap a body fragment in the branded header/footer used by every email."""
	logo_url = get_url("/assets/onerc_knowledge_hub/ans-hub/logo.jpg")
	meta_html = (
		f'<div style="color:{MUTED};font-size:13px;margin:0 0 18px;">{meta_line}</div>'
		if meta_line
		else ""
	)
	return f"""
	<div style="font-family:'Google Sans',system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;background:#f0f2f5;padding:24px;">
		<div style="background:{NAVY};padding:24px 28px;border-radius:6px 6px 0 0;">
			<table cellspacing="0" cellpadding="0"><tr>
				<td style="padding-right:14px;"><img src="{logo_url}" alt="" width="40" height="40" style="display:block;border-radius:4px;background:#ffffff;" /></td>
				<td>
					<div style="color:#ff8a80;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;">{escape_html(_('Delegate Registration'))}</div>
					<div style="color:#ffffff;font-size:16px;font-weight:600;">{escape_html(_event_title())}</div>
				</td>
			</tr></table>
		</div>
		<div style="background:#ffffff;border:1px solid {BORDER};border-top:none;padding:32px 28px;">
			<h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 6px;">{heading}</h1>
			{meta_html}
			{body_html}
		</div>
		<div style="background:#f9fafb;padding:20px 28px;text-align:center;border:1px solid {BORDER};border-top:none;border-radius:0 0 6px 6px;">
			<p style="color:#9ca3af;font-size:12px;margin:0;">&copy; 2026 Kenya Red Cross Society &middot; Africa Localisation Hub</p>
		</div>
	</div>
	"""


def _details_table(rows):
	"""Render (label, value) pairs as a compact two-column table; skips blanks."""
	body = "".join(
		f'<tr><td style="padding:6px 10px;color:{MUTED};font-size:13px;border-bottom:1px solid {BORDER};white-space:nowrap;vertical-align:top;">{escape_html(label)}</td>'
		f'<td style="padding:6px 10px;color:#111827;font-size:13px;border-bottom:1px solid {BORDER};">{value}</td></tr>'
		for label, value in rows
		if value
	)
	return f'<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">{body}</table>'


def _sessions_html(doc):
	lines = _sessions_summary(doc)
	if not lines:
		return ""
	items = "".join(
		f'<li style="margin:0 0 6px;color:#4b5563;font-size:14px;">{escape_html(line)}</li>' for line in lines
	)
	return f"""
	<div style="margin-top:18px;">
		<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:{NAVY};margin-bottom:10px;">{escape_html(_('Sessions you selected'))}</div>
		<ul style="margin:0;padding-left:20px;">{items}</ul>
	</div>"""


def _when(date, time):
	"""Combine a date and optional time into "12 Aug 2026, 14:30"."""
	parts = []
	if date:
		parts.append(formatdate(date))
	t = _fmt_time(time)
	if t:
		parts.append(t)
	return ", ".join(parts)


def _delegate_detail_rows(doc):
	additional = ""
	if doc.additional_information:
		additional = escape_html(doc.additional_information).replace("\n", "<br>")
	return [
		(_("Name"), escape_html(_full_name(doc))),
		(_("National Society"), escape_html(_ns_name(doc) or "")),
		(_("Designation"), escape_html(_designation_label(doc))),
		(_("Nationality"), escape_html(doc.nationality or "")),
		(_("Passport Number"), escape_html(doc.passport_number or "")),
		(_("Email"), escape_html(doc.email or "")),
		(_("Phone"), escape_html(doc.phone_number or "")),
		(_("Arrival in Kenya"), escape_html(_when(doc.arrival_date, doc.arrival_time))),
		(_("Arrival flight"), escape_html(doc.arrival_flight or "")),
		(_("Departure from Kenya"), escape_html(_when(doc.departure_date, doc.departure_time))),
		(_("Departure flight"), escape_html(doc.departure_flight or "")),
		(_("Additional information"), additional),
		(
			_("Boma Hotel accommodation"),
			escape_html(_("Requested") if doc.accommodation_boma else _("Not requested")),
		),
	]


# --------------------------------------------------------------------------- #
# Email: senders (all best-effort)
# --------------------------------------------------------------------------- #

def _send_confirmation_email(doc):
	if not doc.email:
		return False
	try:
		intro = _(
			"Thank you for registering. Here is a copy of the details we received. "
			"Please contact us if anything needs to be corrected."
		)
		body = (
			f'<p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">{escape_html(_("Dear {0},")).format(escape_html(_full_name(doc) or "delegate"))}</p>'
			f'<p style="color:#4b5563;line-height:1.6;margin:0 0 20px;">{escape_html(intro)}</p>'
			+ _details_table(_delegate_detail_rows(doc))
			+ _sessions_html(doc)
		)
		if doc.accommodation_boma:
			body += (
				f'<p style="color:{MUTED};font-size:13px;line-height:1.6;margin:18px 0 0;">'
				f'{escape_html(_("You requested accommodation at the Boma Hotel. Our team will follow up with you on the booking."))}</p>'
			)
		frappe.sendmail(
			recipients=[doc.email],
			subject=_("Your registration for {0}").format(_event_title()),
			message=_email_shell(escape_html(_("Registration received")), escape_html(_event_title()), body),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
		return True
	except Exception:
		frappe.log_error(title="Delegate registration confirmation email failed", message=frappe.get_traceback())
		return False


def _notify_admin(doc):
	recipient = (_settings().get("notification_email") or "").strip()
	if not recipient:
		return False
	try:
		link = get_url("/app/delegate-registration/" + doc.name)
		body = (
			f'<p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">{escape_html(_("A new delegate registration has been submitted."))}</p>'
			+ _details_table(_delegate_detail_rows(doc))
			+ _sessions_html(doc)
			+ f'<div style="margin-top:20px;"><a href="{link}" style="color:{RED};font-weight:600;text-decoration:none;">{escape_html(_("View the full registration"))} &rarr;</a></div>'
		)
		frappe.sendmail(
			recipients=[recipient],
			subject=_("New registration: {0}").format(_full_name(doc)),
			message=_email_shell(escape_html(_("New delegate registration")), "", body),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
		return True
	except Exception:
		frappe.log_error(title="Delegate registration admin notification failed", message=frappe.get_traceback())
		return False


def _send_boma_request(doc, force=False):
	"""Email the Boma Hotel an accommodation request, CC'ing the KRCS admin."""
	if not doc.accommodation_boma:
		return False
	if doc.boma_requested and not force:
		return True

	settings = _settings()
	boma_email = (settings.get("boma_hotel_email") or "").strip()
	if not boma_email:
		return False
	cc = [settings.get("krcs_admin_email").strip()] if (settings.get("krcs_admin_email") or "").strip() else None

	try:
		rows = [
			(_("Guest"), escape_html(_full_name(doc))),
			(_("Organisation"), escape_html(_ns_name(doc) or "")),
			(_("Designation"), escape_html(_designation_label(doc))),
			(_("Check-in"), escape_html(_when(doc.arrival_date, doc.arrival_time) or _("To be confirmed"))),
			(_("Check-out"), escape_html(_when(doc.departure_date, doc.departure_time) or _("To be confirmed"))),
			(_("Guest email"), escape_html(doc.email or "")),
			(_("Guest phone"), escape_html(doc.phone_number or "")),
		]
		body = (
			f'<p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">'
			f'{escape_html(_("Kindly arrange accommodation at the Boma Hotel for the following delegate attending {0}. The KRCS admin team is copied for follow-up.").format(_event_title()))}</p>'
			+ _details_table(rows)
			+ f'<p style="color:{MUTED};font-size:13px;line-height:1.6;margin:18px 0 0;">'
			f'{escape_html(_("Please confirm availability and the reservation details by replying to this email."))}</p>'
		)
		frappe.sendmail(
			recipients=[boma_email],
			cc=cc,
			subject=_("Accommodation request: {0} ({1})").format(_full_name(doc), _event_title()),
			message=_email_shell(escape_html(_("Accommodation request")), escape_html(_event_title()), body),
			reference_doctype=doc.doctype,
			reference_name=doc.name,
			delayed=False,
		)
		doc.db_set("boma_requested", 1, update_modified=False)
		doc.db_set("boma_requested_on", now_datetime(), update_modified=False)
		frappe.db.commit()
		return True
	except Exception:
		frappe.log_error(title="Delegate registration Boma request failed", message=frappe.get_traceback())
		return False
