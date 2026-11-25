# Copyright (c) 2026, Lennox Mwita and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class GalleryAlbum(Document):
	def validate(self):
		self.set_uploaded_by()
		self.drop_empty_photos()
		self.set_cover_image()
		self.photo_count = len(self.photos or [])

	def set_uploaded_by(self):
		if not self.uploaded_by:
			self.uploaded_by = self.owner or frappe.session.user

	def drop_empty_photos(self):
		"""Remove rows left behind by a cancelled upload so counts stay honest."""
		kept = [row for row in (self.photos or []) if row.image]
		if len(kept) != len(self.photos or []):
			self.photos = kept
			for idx, row in enumerate(self.photos, start=1):
				row.idx = idx

	def set_cover_image(self):
		"""Fall back to the first photo so every album has something to show."""
		if self.cover_image:
			return
		if self.photos:
			self.cover_image = self.photos[0].image

	def on_trash(self):
		if self.is_published and not is_album_manager():
			frappe.throw(
				_("Published albums can only be deleted by a hub manager"),
				frappe.PermissionError,
			)


def is_album_manager(user=None):
	"""True when the user may manage any album, not just their own."""
	roles = frappe.get_roles(user or frappe.session.user)
	return any(role in roles for role in ("LH Admin", "System Manager"))
