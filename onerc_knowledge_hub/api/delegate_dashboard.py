# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Metrics for the Delegate Dashboard desk page.

Everything an executive assistant needs to run a summit arrival desk: how many
delegates are coming, from where, who still needs a hotel room, who lands in the
next week, and whose passport is too close to expiry to clear a visa.

One whitelisted call returns the whole payload so the page renders in a single
round trip. Access is gated on the same roles as the `/delegate-dashboard` page
that consumes it.
"""

from datetime import timedelta

import frappe
from frappe import _
from frappe.utils import add_months, getdate, nowdate

DOCTYPE = "Delegate Registration"

# Kept in step with `onerc_knowledge_hub.www.delegate_dashboard.ALLOWED_ROLES`.
ALLOWED_ROLES = {"Delegate Manager", "System Manager"}

# Passports expiring inside this window are flagged: most embassies refuse a visa
# on a passport with under six months of validity left.
PASSPORT_WARNING_MONTHS = 6

# Days ahead counted as "arriving soon" on the headline tiles.
ARRIVAL_WINDOW_DAYS = 7

# Approximate centroids, keyed by Frappe's `Country` docnames, used to place the
# markers on the world map. Anything not listed here is simply left off the map
# rather than guessed at.
COUNTRY_COORDS = {
	"Afghanistan": (33.9, 67.7),
	"Albania": (41.2, 20.2),
	"Algeria": (28.0, 1.7),
	"Andorra": (42.5, 1.6),
	"Angola": (-11.2, 17.9),
	"Antigua and Barbuda": (17.1, -61.8),
	"Argentina": (-38.4, -63.6),
	"Armenia": (40.1, 45.0),
	"Australia": (-25.3, 133.8),
	"Austria": (47.5, 14.6),
	"Azerbaijan": (40.1, 47.6),
	"Bahamas": (25.0, -77.4),
	"Bahrain": (26.0, 50.6),
	"Bangladesh": (23.7, 90.4),
	"Barbados": (13.2, -59.5),
	"Belarus": (53.7, 27.9),
	"Belgium": (50.5, 4.5),
	"Belize": (17.2, -88.5),
	"Benin": (9.3, 2.3),
	"Bolivia, Plurinational State of": (-16.3, -63.6),
	"Bosnia and Herzegovina": (43.9, 17.7),
	"Botswana": (-22.3, 24.7),
	"Brazil": (-14.2, -51.9),
	"Brunei Darussalam": (4.5, 114.7),
	"Bulgaria": (42.7, 25.5),
	"Burkina Faso": (12.2, -1.6),
	"Burundi": (-3.4, 29.9),
	"Cambodia": (12.6, 104.9),
	"Cameroon": (7.4, 12.4),
	"Canada": (56.1, -106.3),
	"Cape Verde": (16.0, -24.0),
	"Central African Republic": (6.6, 20.9),
	"Chad": (15.5, 18.7),
	"Chile": (-35.7, -71.5),
	"China": (35.9, 104.2),
	"Colombia": (4.6, -74.3),
	"Comoros": (-11.9, 43.9),
	"Congo": (-0.2, 15.8),
	"Congo, The Democratic Republic of the": (-4.0, 21.8),
	"Cook Islands": (-21.2, -159.8),
	"Costa Rica": (9.7, -83.8),
	"Croatia": (45.1, 15.2),
	"Cuba": (21.5, -77.8),
	"Cyprus": (35.1, 33.4),
	"Czech Republic": (49.8, 15.5),
	"Denmark": (56.3, 9.5),
	"Djibouti": (11.8, 42.6),
	"Dominica": (15.4, -61.4),
	"Dominican Republic": (18.7, -70.2),
	"Ecuador": (-1.8, -78.2),
	"Egypt": (26.8, 30.8),
	"El Salvador": (13.8, -88.9),
	"Equatorial Guinea": (1.7, 10.3),
	"Eritrea": (15.2, 39.8),
	"Estonia": (58.6, 25.0),
	"Ethiopia": (9.1, 40.5),
	"Fiji": (-17.7, 178.1),
	"Finland": (61.9, 25.7),
	"France": (46.2, 2.2),
	"Gabon": (-0.8, 11.6),
	"Gambia": (13.4, -15.3),
	"Georgia": (42.3, 43.4),
	"Germany": (51.2, 10.5),
	"Ghana": (7.9, -1.0),
	"Greece": (39.1, 21.8),
	"Grenada": (12.1, -61.7),
	"Guatemala": (15.8, -90.2),
	"Guinea": (9.9, -9.7),
	"Guinea-Bissau": (11.8, -15.2),
	"Guyana": (4.9, -58.9),
	"Haiti": (18.9, -72.3),
	"Honduras": (15.2, -86.2),
	"Hungary": (47.2, 19.5),
	"Iceland": (65.0, -19.0),
	"India": (20.6, 79.0),
	"Indonesia": (-0.8, 113.9),
	"Iran": (32.4, 53.7),
	"Iraq": (33.2, 43.7),
	"Ireland": (53.4, -8.2),
	"Israel": (31.0, 34.9),
	"Italy": (41.9, 12.6),
	"Ivory Coast": (7.5, -5.5),
	"Jamaica": (18.1, -77.3),
	"Japan": (36.2, 138.3),
	"Jordan": (30.6, 36.2),
	"Kazakhstan": (48.0, 66.9),
	"Kenya": (-0.02, 37.9),
	"Kiribati": (-3.4, -168.7),
	"Korea, Democratic Peoples Republic of": (40.3, 127.5),
	"Korea, Republic of": (35.9, 127.8),
	"Kuwait": (29.3, 47.5),
	"Kyrgyzstan": (41.2, 74.8),
	"Lao Peoples Democratic Republic": (19.9, 102.5),
	"Latvia": (56.9, 24.6),
	"Lebanon": (33.9, 35.9),
	"Lesotho": (-29.6, 28.2),
	"Liberia": (6.4, -9.4),
	"Libya": (26.3, 17.2),
	"Liechtenstein": (47.2, 9.6),
	"Lithuania": (55.2, 23.9),
	"Luxembourg": (49.8, 6.1),
	"Macedonia": (41.6, 21.7),
	"Madagascar": (-18.8, 46.9),
	"Malawi": (-13.3, 34.3),
	"Malaysia": (4.2, 101.98),
	"Maldives": (3.2, 73.2),
	"Mali": (17.6, -4.0),
	"Malta": (35.9, 14.4),
	"Marshall Islands": (7.1, 171.2),
	"Mauritania": (21.0, -10.9),
	"Mauritius": (-20.3, 57.6),
	"Mexico": (23.6, -102.6),
	"Micronesia, Federated States of": (7.4, 150.6),
	"Moldova, Republic of": (47.4, 28.4),
	"Monaco": (43.7, 7.4),
	"Mongolia": (46.9, 103.8),
	"Montenegro": (42.7, 19.4),
	"Morocco": (31.8, -7.1),
	"Mozambique": (-18.7, 35.5),
	"Myanmar": (21.9, 95.96),
	"Namibia": (-22.96, 18.5),
	"Nepal": (28.4, 84.1),
	"Netherlands": (52.1, 5.3),
	"New Zealand": (-40.9, 174.9),
	"Nicaragua": (12.9, -85.2),
	"Niger": (17.6, 8.1),
	"Nigeria": (9.1, 8.7),
	"Norway": (60.5, 8.5),
	"Pakistan": (30.4, 69.3),
	"Palau": (7.5, 134.6),
	"Palestinian Territory, Occupied": (31.9, 35.2),
	"Panama": (8.5, -80.8),
	"Papua New Guinea": (-6.3, 143.96),
	"Paraguay": (-23.4, -58.4),
	"Peru": (-9.2, -75.0),
	"Philippines": (12.9, 121.8),
	"Poland": (51.9, 19.1),
	"Portugal": (39.4, -8.2),
	"Qatar": (25.4, 51.2),
	"Romania": (45.9, 25.0),
	"Russian Federation": (61.5, 105.3),
	"Rwanda": (-1.9, 29.9),
	"Saint Kitts and Nevis": (17.4, -62.8),
	"Saint Lucia": (13.9, -61.0),
	"Saint Vincent and the Grenadines": (12.98, -61.3),
	"Samoa": (-13.8, -172.1),
	"San Marino": (43.9, 12.5),
	"Sao Tome and Principe": (0.2, 6.6),
	"Saudi Arabia": (23.9, 45.1),
	"Senegal": (14.5, -14.5),
	"Serbia": (44.0, 21.0),
	"Seychelles": (-4.7, 55.5),
	"Sierra Leone": (8.5, -11.8),
	"Singapore": (1.35, 103.8),
	"Slovakia": (48.7, 19.7),
	"Slovenia": (46.2, 15.0),
	"Solomon Islands": (-9.6, 160.2),
	"Somalia": (5.2, 46.2),
	"South Africa": (-30.6, 22.9),
	"South Sudan": (7.9, 30.0),
	"Spain": (40.5, -3.7),
	"Sri Lanka": (7.9, 80.8),
	"Sudan": (12.9, 30.2),
	"Suriname": (3.9, -56.03),
	"Swaziland": (-26.5, 31.5),
	"Sweden": (60.1, 18.6),
	"Switzerland": (46.8, 8.2),
	"Syria": (34.8, 39.0),
	"Tajikistan": (38.9, 71.3),
	"Tanzania": (-6.4, 34.9),
	"Thailand": (15.9, 101.0),
	"Timor-Leste": (-8.9, 125.7),
	"Togo": (8.6, 0.8),
	"Tonga": (-21.2, -175.2),
	"Trinidad and Tobago": (10.7, -61.2),
	"Tunisia": (33.9, 9.5),
	"Türkiye": (39.0, 35.2),
	"Turkmenistan": (38.97, 59.6),
	"Tuvalu": (-7.1, 177.6),
	"Uganda": (1.4, 32.3),
	"Ukraine": (48.4, 31.2),
	"United Arab Emirates": (23.4, 53.8),
	"United Kingdom": (55.4, -3.4),
	"United States": (37.1, -95.7),
	"Uruguay": (-32.5, -55.8),
	"Uzbekistan": (41.4, 64.6),
	"Vanuatu": (-15.4, 166.96),
	"Venezuela, Bolivarian Republic of": (6.4, -66.6),
	"Vietnam": (14.06, 108.3),
	"Yemen": (15.6, 48.5),
	"Zambia": (-13.1, 27.8),
	"Zimbabwe": (-19.0, 29.2),
}


@frappe.whitelist()
def get_dashboard():
	"""Return every metric the Delegate Dashboard page renders."""
	_check_permission()

	today = getdate(nowdate())
	horizon = add_months(today, PASSPORT_WARNING_MONTHS)

	rows = frappe.get_all(
		DOCTYPE,
		fields=[
			"name",
			"surname",
			"given_names",
			"national_society",
			"national_society_other",
			"designation",
			"nationality",
			"email",
			"phone_number",
			"status",
			"accommodation_boma",
			"boma_requested",
			"arrival_date",
			"arrival_time",
			"arrival_flight",
			"departure_date",
			"departure_time",
			"departure_flight",
			"passport_expiry_date",
		],
		order_by="arrival_date asc, surname asc",
		limit_page_length=0,
	)

	return {
		"generated_on": frappe.utils.now_datetime().strftime("%d %b %Y, %H:%M"),
		"kpis": _kpis(rows, today, horizon),
		"map": _map_points(rows),
		"arrivals_by_date": _arrivals_by_date(rows),
		"by_designation": _group_count(rows, "designation"),
		"top_societies": _top_societies(rows),
		"boma_pending": _boma_pending(rows),
		"upcoming_arrivals": _upcoming_arrivals(rows, today),
		"passport_alerts": _passport_alerts(rows, horizon),
		"sessions": _sessions(),
	}


def _check_permission():
	if not ALLOWED_ROLES.intersection(set(frappe.get_roles())):
		frappe.throw(_("Not permitted"), frappe.PermissionError)


def _full_name(row):
	return " ".join(p for p in [row.get("surname"), row.get("given_names")] if p).strip()


def _society(row):
	"""Readable organisation, resolving the "Other" catch-all to what was typed."""
	if row.get("national_society") == "Other":
		return (row.get("national_society_other") or "").strip() or "Other"
	return row.get("national_society") or ""


def _kpis(rows, today, horizon):
	active = [r for r in rows if r.get("status") != "Cancelled"]
	soon = today + timedelta(days=ARRIVAL_WINDOW_DAYS)

	return {
		"total": len(rows),
		"confirmed": len([r for r in rows if r.get("status") == "Confirmed"]),
		"new": len([r for r in rows if r.get("status") == "New"]),
		"cancelled": len([r for r in rows if r.get("status") == "Cancelled"]),
		"countries": len({r["nationality"] for r in active if r.get("nationality")}),
		"societies": len({_society(r) for r in active if _society(r)}),
		"boma_total": len([r for r in active if r.get("accommodation_boma")]),
		"boma_pending": len(
			[r for r in active if r.get("accommodation_boma") and not r.get("boma_requested")]
		),
		"arriving_soon": len(
			[
				r
				for r in active
				if r.get("arrival_date") and today <= getdate(r["arrival_date"]) <= soon
			]
		),
		"passport_alerts": len(
			[
				r
				for r in active
				if r.get("passport_expiry_date") and getdate(r["passport_expiry_date"]) <= horizon
			]
		),
	}


def _map_points(rows):
	"""Delegate counts per country, with a centroid for each."""
	counts = {}
	for row in rows:
		if row.get("status") == "Cancelled":
			continue
		country = row.get("nationality")
		if not country:
			continue
		counts[country] = counts.get(country, 0) + 1

	points = []
	for country, count in counts.items():
		coords = COUNTRY_COORDS.get(country)
		if not coords:
			continue
		points.append(
			{"country": country, "lat": coords[0], "lng": coords[1], "count": count}
		)
	points.sort(key=lambda p: -p["count"])
	return points


def _arrivals_by_date(rows):
	counts = {}
	for row in rows:
		if row.get("status") == "Cancelled" or not row.get("arrival_date"):
			continue
		key = str(getdate(row["arrival_date"]))
		counts[key] = counts.get(key, 0) + 1
	return [{"date": k, "count": counts[k]} for k in sorted(counts)]


def _group_count(rows, field):
	counts = {}
	for row in rows:
		if row.get("status") == "Cancelled":
			continue
		key = row.get(field) or _("Not set")
		counts[key] = counts.get(key, 0) + 1
	items = [{"label": k, "count": v} for k, v in counts.items()]
	items.sort(key=lambda i: -i["count"])
	return items


def _top_societies(rows, limit=8):
	counts = {}
	for row in rows:
		if row.get("status") == "Cancelled":
			continue
		key = _society(row) or _("Not set")
		counts[key] = counts.get(key, 0) + 1
	items = [{"label": k, "count": v} for k, v in counts.items()]
	items.sort(key=lambda i: (-i["count"], i["label"]))
	return items[:limit]


def _boma_pending(rows):
	"""Delegates who asked for a Boma room the hotel has not been told about."""
	out = []
	for row in rows:
		if row.get("status") == "Cancelled":
			continue
		if not row.get("accommodation_boma") or row.get("boma_requested"):
			continue
		out.append(
			{
				"name": row["name"],
				"delegate": _full_name(row),
				"society": _society(row),
				"arrival_date": _fmt_date(row.get("arrival_date")),
				"departure_date": _fmt_date(row.get("departure_date")),
			}
		)
	return out


def _upcoming_arrivals(rows, today, days=ARRIVAL_WINDOW_DAYS):
	horizon = today + timedelta(days=days)
	out = []
	for row in rows:
		if row.get("status") == "Cancelled" or not row.get("arrival_date"):
			continue
		arrival = getdate(row["arrival_date"])
		if not (today <= arrival <= horizon):
			continue
		out.append(
			{
				"name": row["name"],
				"delegate": _full_name(row),
				"society": _society(row),
				"date": _fmt_date(row.get("arrival_date")),
				"time": _fmt_time(row.get("arrival_time")),
				"flight": row.get("arrival_flight") or "",
				"phone": row.get("phone_number") or "",
			}
		)
	return out


def _passport_alerts(rows, horizon):
	out = []
	for row in rows:
		if row.get("status") == "Cancelled" or not row.get("passport_expiry_date"):
			continue
		expiry = getdate(row["passport_expiry_date"])
		if expiry > horizon:
			continue
		out.append(
			{
				"name": row["name"],
				"delegate": _full_name(row),
				"society": _society(row),
				"expiry": _fmt_date(row.get("passport_expiry_date")),
				"expired": expiry < getdate(nowdate()),
			}
		)
	out.sort(key=lambda r: r["expired"], reverse=True)
	return out


def _sessions():
	"""Headcount per published session, for room and catering planning."""
	sessions = frappe.get_all(
		"Summit Session",
		filters={"is_published": 1},
		fields=["name", "session_title"],
		order_by="display_order asc, session_date asc",
	)
	if not sessions:
		return []

	counts = {}
	for row in frappe.get_all(
		"Delegate Session", fields=["session"], limit_page_length=0
	):
		if row.get("session"):
			counts[row["session"]] = counts.get(row["session"], 0) + 1

	return [
		{"label": s["session_title"] or s["name"], "count": counts.get(s["name"], 0)}
		for s in sessions
	]


def _fmt_date(value):
	return frappe.utils.formatdate(value) if value else ""


def _fmt_time(value):
	"""Render a Time field (timedelta or "HH:MM:SS") as "HH:MM"."""
	if value in (None, ""):
		return ""
	parts = str(value).split(":")
	if len(parts) >= 2:
		return "{0}:{1}".format(parts[0].zfill(2), parts[1])
	return str(value)
