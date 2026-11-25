# Copyright (c) 2026, Lennox Mwita and contributors
# For license information, please see license.txt
"""Give every already-registered hub member managerial (contributor) access.

The hub launched with content authoring restricted to a few administrators.
Members are meant to upload and share their own events, news and stories,
knowledge resources and gallery albums, so this patch grants the LH User and
LH Manager roles to every enabled System User on the site.

Idempotent: users who already hold the roles are skipped, so re-running after
further members have been approved simply tops them up.
"""

import frappe

from onerc_knowledge_hub.install import (
	create_custom_roles,
	grant_contributor_roles_to_all_users,
)


def execute():
	# The roles themselves may not exist on sites installed before they were added.
	create_custom_roles()

	result = grant_contributor_roles_to_all_users()

	frappe.logger().info(
		"onerc_knowledge_hub: granted {0} contributor role(s) across {1} user(s); "
		"{2} user(s) already had them".format(
			result.get("granted"),
			result.get("users_updated"),
			result.get("skipped"),
		)
	)
