# Copyright (c) 2026, Lennox Mwita and contributors
# For license information, please see license.txt
"""Photo gallery: event photos organised into albums.

Albums are created and filled in from the hub UI by any registered member, so
reads run with ignore_permissions (the published flag is the visibility gate)
while every write is checked against the caller's roles and ownership here.
"""

import json

import frappe
from frappe import _

CONTRIBUTOR_ROLES = ("LH User", "LH Manager", "LH Admin", "System Manager")
MANAGER_ROLES = ("LH Manager", "LH Admin", "System Manager")

ALBUM_LIST_FIELDS = [
	"name",
	"album_title",
	"album_date",
	"category",
	"pillar",
	"description",
	"event_name",
	"event_route",
	"location",
	"national_society",
	"cover_image",
	"is_published",
	"uploaded_by",
	"photo_count",
	"view_count",
	"owner",
	"creation",
	"modified",
]

ALBUM_EDITABLE_FIELDS = (
	"album_title",
	"album_date",
	"category",
	"pillar",
	"description",
	"event_name",
	"event_route",
	"location",
	"national_society",
	"cover_image",
	"is_published",
)


# --------------------------------------------------------------------------- #
# Access helpers
# --------------------------------------------------------------------------- #
def _roles(user=None):
	return frappe.get_roles(user or frappe.session.user)


def is_manager(user=None):
	"""True when the user may manage every album, not only their own."""
	roles = _roles(user)
	return any(role in roles for role in MANAGER_ROLES)


def can_contribute(user=None):
	"""True when the user may create albums and upload photos."""
	roles = _roles(user)
	return any(role in roles for role in CONTRIBUTOR_ROLES)


def _require_contributor():
	if frappe.session.user == "Guest" or not can_contribute():
		frappe.throw(
			_("You need contributor access to add gallery content"),
			frappe.PermissionError,
		)


def _load_album_for_write(album):
	"""Fetch an album the caller is allowed to change, or raise."""
	_require_contributor()

	doc = frappe.get_doc("Gallery Album", album)

	if not is_manager() and doc.owner != frappe.session.user:
		frappe.throw(_("You can only change albums you created"), frappe.PermissionError)

	return doc


def _parse_photos(photos):
	"""Accept a JSON string or a list of dicts/urls and normalise to rows."""
	if isinstance(photos, str):
		photos = json.loads(photos or "[]")

	rows = []
	for photo in photos or []:
		if isinstance(photo, str):
			image, caption, credit = photo, None, None
		else:
			image = photo.get("image") or photo.get("file_url") or photo.get("url")
			caption = photo.get("caption")
			credit = photo.get("credit")

		if image:
			rows.append({"image": image, "caption": caption or "", "credit": credit or ""})

	return rows


# --------------------------------------------------------------------------- #
# Reads
# --------------------------------------------------------------------------- #
@frappe.whitelist()
def get_albums(include_unpublished=0, category=None, event_name=None):
	"""List albums, newest event first.

	Unpublished albums are hidden unless the caller asks for them and may see
	them: managers see every draft, members see their own.
	"""
	filters = {}

	if category:
		filters["category"] = category
	if event_name:
		filters["event_name"] = event_name

	albums = frappe.get_all(
		"Gallery Album",
		filters={**filters, "is_published": 1},
		fields=ALBUM_LIST_FIELDS,
		order_by="album_date desc, creation desc",
		ignore_permissions=True,
	)

	if frappe.utils.cint(include_unpublished) and can_contribute():
		draft_filters = {**filters, "is_published": 0}
		if not is_manager():
			draft_filters["owner"] = frappe.session.user

		drafts = frappe.get_all(
			"Gallery Album",
			filters=draft_filters,
			fields=ALBUM_LIST_FIELDS,
			order_by="album_date desc, creation desc",
			ignore_permissions=True,
		)
		albums = drafts + albums

	_attach_authors(albums)

	for album in albums:
		album["can_edit"] = is_manager() or album.get("owner") == frappe.session.user

	return albums


def _attach_authors(albums):
	"""Resolve uploader names and National Societies in one pass."""
	user_ids = {a.get("uploaded_by") or a.get("owner") for a in albums}
	user_ids.discard(None)

	if not user_ids:
		return

	hub_users = frappe.get_all(
		"Localisation Hub User",
		filters={"user_id": ["in", list(user_ids)]},
		fields=["user_id", "full_name", "national_society"],
		ignore_permissions=True,
	)
	by_user = {u.user_id: u for u in hub_users}

	society_ids = {u.national_society for u in hub_users if u.national_society}
	society_names = {}
	if society_ids:
		society_names = {
			s.name: s.national_society_name
			for s in frappe.get_all(
				"National Society",
				filters={"name": ["in", list(society_ids)]},
				fields=["name", "national_society_name"],
				ignore_permissions=True,
			)
		}

	fallback_names = {
		u.name: u.full_name
		for u in frappe.get_all(
			"User",
			filters={"name": ["in", list(user_ids)]},
			fields=["name", "full_name"],
			ignore_permissions=True,
		)
	}

	for album in albums:
		uploader = album.get("uploaded_by") or album.get("owner")
		hub_user = by_user.get(uploader)

		if hub_user:
			album["author_name"] = hub_user.full_name or fallback_names.get(uploader)
			album["author_national_society"] = society_names.get(hub_user.national_society)
		else:
			album["author_name"] = fallback_names.get(uploader)
			album["author_national_society"] = None


@frappe.whitelist()
def get_album(name):
	"""Return one album with its photos."""
	if not frappe.db.exists("Gallery Album", name):
		frappe.throw(_("Album not found"), frappe.DoesNotExistError)

	doc = frappe.get_doc("Gallery Album", name)

	viewer_may_see_draft = is_manager() or doc.owner == frappe.session.user
	if not doc.is_published and not viewer_may_see_draft:
		frappe.throw(_("This album is not published"), frappe.PermissionError)

	album = {field: doc.get(field) for field in ALBUM_LIST_FIELDS}
	album["photos"] = [
		{
			"name": row.name,
			"idx": row.idx,
			"image": row.image,
			"caption": row.caption,
			"credit": row.credit,
		}
		for row in doc.photos
	]

	_attach_authors([album])
	album["can_edit"] = viewer_may_see_draft

	return album


@frappe.whitelist()
def get_album_filters():
	"""Categories and event names that actually have published albums."""
	albums = frappe.get_all(
		"Gallery Album",
		filters={"is_published": 1},
		fields=["category", "event_name"],
		ignore_permissions=True,
	)

	categories = {}
	events = {}
	for album in albums:
		if album.category:
			categories[album.category] = categories.get(album.category, 0) + 1
		if album.event_name:
			events[album.event_name] = events.get(album.event_name, 0) + 1

	return {
		"categories": [{"name": k, "count": v} for k, v in sorted(categories.items())],
		"events": [{"name": k, "count": v} for k, v in sorted(events.items())],
	}


@frappe.whitelist()
def record_album_view(name):
	"""Bump the view counter. Best effort, never blocks the page."""
	if not frappe.db.exists("Gallery Album", name):
		return {"view_count": 0}

	count = frappe.db.get_value("Gallery Album", name, "view_count") or 0
	count += 1
	frappe.db.set_value("Gallery Album", name, "view_count", count, update_modified=False)
	return {"view_count": count}


# --------------------------------------------------------------------------- #
# Writes
# --------------------------------------------------------------------------- #
@frappe.whitelist()
def create_album(**args):
	"""Create an album, optionally with its first batch of photos."""
	_require_contributor()

	data = frappe._dict(args)
	for key in ("cmd", "csrf_token"):
		data.pop(key, None)

	if not data.get("album_title"):
		frappe.throw(_("Album title is required"))

	photos = _parse_photos(data.pop("photos", None))

	doc = frappe.new_doc("Gallery Album")
	for field in ALBUM_EDITABLE_FIELDS:
		if field in data and data.get(field) not in (None, ""):
			doc.set(field, data.get(field))

	# Members publish their own albums; the flag stays available for saving drafts.
	if "is_published" not in data:
		doc.is_published = 1

	doc.uploaded_by = frappe.session.user

	for photo in photos:
		doc.append("photos", photo)

	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name, "photo_count": doc.photo_count}


@frappe.whitelist()
def update_album(name, **args):
	"""Update an album's details. Owner or manager only."""
	doc = _load_album_for_write(name)

	data = frappe._dict(args)
	for key in ("cmd", "csrf_token", "name"):
		data.pop(key, None)

	for field in ALBUM_EDITABLE_FIELDS:
		if field in data:
			doc.set(field, data.get(field))

	doc.save(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name, "photo_count": doc.photo_count}


@frappe.whitelist()
def add_photos(album, photos):
	"""Append photos to an existing album. Owner or manager only."""
	doc = _load_album_for_write(album)

	rows = _parse_photos(photos)
	if not rows:
		frappe.throw(_("No photos to add"))

	for row in rows:
		doc.append("photos", row)

	doc.save(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name, "photo_count": doc.photo_count, "added": len(rows)}


@frappe.whitelist()
def update_photo(album, photo, caption=None, credit=None):
	"""Edit one photo's caption or credit."""
	doc = _load_album_for_write(album)

	for row in doc.photos:
		if row.name == photo:
			if caption is not None:
				row.caption = caption
			if credit is not None:
				row.credit = credit
			break
	else:
		frappe.throw(_("Photo not found in this album"))

	doc.save(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name}


@frappe.whitelist()
def remove_photo(album, photo):
	"""Remove one photo from an album."""
	doc = _load_album_for_write(album)

	remaining = [row for row in doc.photos if row.name != photo]
	if len(remaining) == len(doc.photos):
		frappe.throw(_("Photo not found in this album"))

	removed_image = next((row.image for row in doc.photos if row.name == photo), None)

	doc.photos = remaining
	for idx, row in enumerate(doc.photos, start=1):
		row.idx = idx

	# Do not leave a cover pointing at a photo that is gone.
	if removed_image and doc.cover_image == removed_image:
		doc.cover_image = None

	doc.save(ignore_permissions=True)
	frappe.db.commit()

	return {"name": doc.name, "photo_count": doc.photo_count}


@frappe.whitelist()
def delete_album(name):
	"""Delete an album. Owner or manager only."""
	doc = _load_album_for_write(name)

	if doc.is_published and not is_manager():
		frappe.throw(
			_("Published albums can only be deleted by a hub manager"),
			frappe.PermissionError,
		)

	frappe.delete_doc("Gallery Album", doc.name, ignore_permissions=True)
	frappe.db.commit()

	return {"deleted": name}
