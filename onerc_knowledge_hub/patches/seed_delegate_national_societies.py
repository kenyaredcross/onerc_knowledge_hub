# Copyright (c) 2026, Kenya Red Cross Society and contributors
# For license information, please see license.txt
"""Seed the `Delegate National Society` list and repoint existing registrations.

The delegate registration form used to draw its National Society dropdown from the
`National Society` doctype — the Localisation Hub's own member directory, which
holds a curated handful of profiles and no IFRC/ICRC entry. This patch fills the
new standalone reference list with every RCRC National Society plus the IFRC, the
ICRC and an "Other" catch-all, then migrates any registration that still points at
an old `National Society` record.

Idempotent: existing rows are left untouched, so an admin can rename or deactivate
an entry and re-running migrate will not undo it.
"""

import frappe

# (name, abbreviation, country). Country is linked only when a matching `Country`
# record exists, so a rename upstream degrades to a blank rather than a hard error.
SOCIETIES = [
	("Afghan Red Crescent Society", "ARCS", "Afghanistan"),
	("Albanian Red Cross", None, "Albania"),
	("Algerian Red Crescent", None, "Algeria"),
	("Andorran Red Cross", None, "Andorra"),
	("Angola Red Cross", None, "Angola"),
	("Antigua and Barbuda Red Cross Society", None, "Antigua and Barbuda"),
	("Argentine Red Cross", None, "Argentina"),
	("Armenian Red Cross Society", None, "Armenia"),
	("Australian Red Cross", None, "Australia"),
	("Austrian Red Cross", None, "Austria"),
	("Azerbaijan Red Crescent Society", None, "Azerbaijan"),
	("Bahamas Red Cross Society", None, "Bahamas"),
	("Bahrain Red Crescent Society", None, "Bahrain"),
	("Bangladesh Red Crescent Society", "BDRCS", "Bangladesh"),
	("Barbados Red Cross Society", None, "Barbados"),
	("Belarus Red Cross", None, "Belarus"),
	("Belgian Red Cross", None, "Belgium"),
	("Belize Red Cross Society", None, "Belize"),
	("Benin Red Cross Society", None, "Benin"),
	("Bolivian Red Cross", None, "Bolivia, Plurinational State of"),
	("Red Cross Society of Bosnia and Herzegovina", None, "Bosnia and Herzegovina"),
	("Botswana Red Cross Society", "BRCS", "Botswana"),
	("Brazilian Red Cross", None, "Brazil"),
	("Brunei Darussalam Red Crescent Society", None, "Brunei Darussalam"),
	("Bulgarian Red Cross", None, "Bulgaria"),
	("Burkinabe Red Cross Society", None, "Burkina Faso"),
	("Burundi Red Cross", None, "Burundi"),
	("Cabo Verde Red Cross", None, "Cape Verde"),
	("Cambodian Red Cross Society", "CRC", "Cambodia"),
	("Cameroon Red Cross Society", None, "Cameroon"),
	("Canadian Red Cross", None, "Canada"),
	("Central African Red Cross Society", None, "Central African Republic"),
	("Chad Red Cross", None, "Chad"),
	("Chilean Red Cross", None, "Chile"),
	("Red Cross Society of China", "RCSC", "China"),
	("Colombian Red Cross Society", None, "Colombia"),
	("Comoros Red Crescent", None, "Comoros"),
	("Congolese Red Cross", None, "Congo"),
	("Red Cross of the Democratic Republic of the Congo", None, "Congo, The Democratic Republic of the"),
	("Cook Islands Red Cross Society", None, "Cook Islands"),
	("Costa Rican Red Cross", None, "Costa Rica"),
	("Red Cross Society of Cote d'Ivoire", None, "Ivory Coast"),
	("Croatian Red Cross", None, "Croatia"),
	("Cuban Red Cross", None, "Cuba"),
	("Cyprus Red Cross Society", None, "Cyprus"),
	("Czech Red Cross", None, "Czech Republic"),
	("Danish Red Cross", None, "Denmark"),
	("Red Crescent Society of Djibouti", None, "Djibouti"),
	("Dominica Red Cross Society", None, "Dominica"),
	("Dominican Red Cross", None, "Dominican Republic"),
	("Ecuadorian Red Cross", None, "Ecuador"),
	("Egyptian Red Crescent Society", "ERCS", "Egypt"),
	("Salvadorean Red Cross Society", None, "El Salvador"),
	("Red Cross of Equatorial Guinea", None, "Equatorial Guinea"),
	("Red Cross Society of Eritrea", None, "Eritrea"),
	("Estonia Red Cross", None, "Estonia"),
	("Eswatini Red Cross Society", None, "Swaziland"),
	("Ethiopian Red Cross Society", "ERCS", "Ethiopia"),
	("Fiji Red Cross Society", None, "Fiji"),
	("Finnish Red Cross", None, "Finland"),
	("French Red Cross", None, "France"),
	("Gabonese Red Cross Society", None, "Gabon"),
	("The Gambia Red Cross Society", None, "Gambia"),
	("Red Cross Society of Georgia", None, "Georgia"),
	("German Red Cross", "DRK", "Germany"),
	("Ghana Red Cross Society", None, "Ghana"),
	("Hellenic Red Cross", None, "Greece"),
	("Grenada Red Cross Society", None, "Grenada"),
	("Guatemalan Red Cross", None, "Guatemala"),
	("Red Cross Society of Guinea", None, "Guinea"),
	("Red Cross Society of Guinea-Bissau", None, "Guinea-Bissau"),
	("The Guyana Red Cross Society", None, "Guyana"),
	("Haitian National Red Cross Society", None, "Haiti"),
	("Honduran Red Cross", None, "Honduras"),
	("Hungarian Red Cross", None, "Hungary"),
	("Icelandic Red Cross", None, "Iceland"),
	("Indian Red Cross Society", "IRCS", "India"),
	("Indonesian Red Cross Society", "PMI", "Indonesia"),
	("Red Crescent Society of the Islamic Republic of Iran", None, "Iran"),
	("Iraqi Red Crescent Society", None, "Iraq"),
	("Irish Red Cross Society", None, "Ireland"),
	("Magen David Adom in Israel", "MDA", "Israel"),
	("Italian Red Cross", None, "Italy"),
	("Jamaica Red Cross", None, "Jamaica"),
	("Japanese Red Cross Society", "JRCS", "Japan"),
	("Jordan National Red Crescent Society", None, "Jordan"),
	("Red Crescent Society of Kazakhstan", None, "Kazakhstan"),
	("Kenya Red Cross", "KRCS", "Kenya"),
	("Kiribati Red Cross Society", None, "Kiribati"),
	("Red Cross Society of the Democratic People's Republic of Korea", None, "Korea, Democratic Peoples Republic of"),
	("Republic of Korea National Red Cross", "KNRC", "Korea, Republic of"),
	("Kuwait Red Crescent Society", None, "Kuwait"),
	("Red Crescent Society of Kyrgyzstan", None, "Kyrgyzstan"),
	("Lao Red Cross", None, "Lao Peoples Democratic Republic"),
	("Latvian Red Cross", None, "Latvia"),
	("Lebanese Red Cross", None, "Lebanon"),
	("Lesotho Red Cross Society", None, "Lesotho"),
	("Liberian Red Cross Society", None, "Liberia"),
	("Libyan Red Crescent", None, "Libya"),
	("Liechtenstein Red Cross", None, "Liechtenstein"),
	("Lithuanian Red Cross Society", None, "Lithuania"),
	("Luxembourg Red Cross", None, "Luxembourg"),
	("Malagasy Red Cross Society", None, "Madagascar"),
	("Malawi Red Cross Society", "MRCS", "Malawi"),
	("Malaysian Red Crescent Society", None, "Malaysia"),
	("Maldivian Red Crescent", None, "Maldives"),
	("Mali Red Cross", None, "Mali"),
	("Malta Red Cross Society", None, "Malta"),
	("Marshall Islands Red Cross Society", None, "Marshall Islands"),
	("Mauritanian Red Crescent", None, "Mauritania"),
	("Mauritius Red Cross Society", None, "Mauritius"),
	("Mexican Red Cross", None, "Mexico"),
	("Micronesia Red Cross Society", None, "Micronesia, Federated States of"),
	("Red Cross Society of the Republic of Moldova", None, "Moldova, Republic of"),
	("Red Cross of Monaco", None, "Monaco"),
	("Mongolian Red Cross Society", None, "Mongolia"),
	("Red Cross of Montenegro", None, "Montenegro"),
	("Moroccan Red Crescent", None, "Morocco"),
	("Mozambique Red Cross Society", "CVM", "Mozambique"),
	("Myanmar Red Cross Society", None, "Myanmar"),
	("Namibia Red Cross", None, "Namibia"),
	("Nepal Red Cross Society", "NRCS", "Nepal"),
	("Netherlands Red Cross", None, "Netherlands"),
	("New Zealand Red Cross", None, "New Zealand"),
	("Nicaraguan Red Cross", None, "Nicaragua"),
	("Red Cross Society of Niger", None, "Niger"),
	("Nigerian Red Cross Society", "NRCS", "Nigeria"),
	("Red Cross of North Macedonia", None, "Macedonia"),
	("Norwegian Red Cross", None, "Norway"),
	("Pakistan Red Crescent Society", "PRCS", "Pakistan"),
	("Palau Red Cross Society", None, "Palau"),
	("Palestine Red Crescent Society", "PRCS", "Palestinian Territory, Occupied"),
	("Red Cross Society of Panama", None, "Panama"),
	("Papua New Guinea Red Cross Society", None, "Papua New Guinea"),
	("Paraguayan Red Cross", None, "Paraguay"),
	("Peruvian Red Cross", None, "Peru"),
	("Philippine Red Cross", "PRC", "Philippines"),
	("Polish Red Cross", None, "Poland"),
	("Portuguese Red Cross", None, "Portugal"),
	("Qatar Red Crescent Society", "QRCS", "Qatar"),
	("Romanian Red Cross", None, "Romania"),
	("Russian Red Cross Society", None, "Russian Federation"),
	("Rwandan Red Cross", None, "Rwanda"),
	("Saint Kitts and Nevis Red Cross Society", None, "Saint Kitts and Nevis"),
	("Saint Lucia Red Cross", None, "Saint Lucia"),
	("Saint Vincent and the Grenadines Red Cross", None, "Saint Vincent and the Grenadines"),
	("Samoa Red Cross Society", None, "Samoa"),
	("Red Cross of San Marino", None, "San Marino"),
	("Sao Tome and Principe Red Cross", None, "Sao Tome and Principe"),
	("Saudi Red Crescent Authority", "SRCA", "Saudi Arabia"),
	("Senegalese Red Cross Society", None, "Senegal"),
	("Red Cross of Serbia", None, "Serbia"),
	("Seychelles Red Cross Society", None, "Seychelles"),
	("Sierra Leone Red Cross Society", "SLRCS", "Sierra Leone"),
	("Singapore Red Cross Society", None, "Singapore"),
	("Slovak Red Cross", None, "Slovakia"),
	("Slovenian Red Cross", None, "Slovenia"),
	("Solomon Islands Red Cross", None, "Solomon Islands"),
	("Somali Red Crescent Society", "SRCS", "Somalia"),
	("South African Red Cross Society", "SARCS", "South Africa"),
	("South Sudan Red Cross", "SSRC", "South Sudan"),
	("Spanish Red Cross", None, "Spain"),
	("Sri Lanka Red Cross Society", None, "Sri Lanka"),
	("Sudanese Red Crescent Society", "SRCS", "Sudan"),
	("Suriname Red Cross", None, "Suriname"),
	("Swedish Red Cross", None, "Sweden"),
	("Swiss Red Cross", None, "Switzerland"),
	("Syrian Arab Red Crescent", "SARC", "Syria"),
	("Red Crescent Society of Tajikistan", None, "Tajikistan"),
	("Tanzania Red Cross National Society", "TRCS", "Tanzania"),
	("The Thai Red Cross Society", None, "Thailand"),
	("Timor-Leste Red Cross Society", "CVTL", "Timor-Leste"),
	("Togolese Red Cross", None, "Togo"),
	("Tonga Red Cross Society", None, "Tonga"),
	("Trinidad and Tobago Red Cross Society", None, "Trinidad and Tobago"),
	("Tunisian Red Crescent", None, "Tunisia"),
	("Turkish Red Crescent Society", None, "Türkiye"),
	("Red Crescent Society of Turkmenistan", None, "Turkmenistan"),
	("Tuvalu Red Cross Society", None, "Tuvalu"),
	("Uganda Red Cross Society", "URCS", "Uganda"),
	("Ukrainian Red Cross Society", None, "Ukraine"),
	("Red Crescent Society of the United Arab Emirates", None, "United Arab Emirates"),
	("British Red Cross", "BRC", "United Kingdom"),
	("American Red Cross", "ARC", "United States"),
	("Uruguayan Red Cross", None, "Uruguay"),
	("Red Crescent Society of Uzbekistan", None, "Uzbekistan"),
	("Vanuatu Red Cross Society", None, "Vanuatu"),
	("Venezuelan Red Cross", None, "Venezuela, Bolivarian Republic of"),
	("Viet Nam Red Cross Society", "VNRC", "Vietnam"),
	("Yemen Red Crescent Society", None, "Yemen"),
	("Zambia Red Cross Society", "ZRCS", "Zambia"),
	("Zimbabwe Red Cross Society", "ZRCS", "Zimbabwe"),
]

# Pinned above and below the alphabetical list of societies on the form.
MOVEMENT_BODIES = [
	(
		"International Federation of Red Cross and Red Crescent Societies",
		"IFRC",
		"IFRC",
		1,
	),
	("International Committee of the Red Cross", "ICRC", "ICRC", 2),
]

OTHER_LABEL = "Other"


def execute():
	for label, abbreviation, org_type, order in MOVEMENT_BODIES:
		_ensure(label, abbreviation=abbreviation, organisation_type=org_type, display_order=order)

	for name, abbreviation, country in SOCIETIES:
		_ensure(
			name,
			abbreviation=abbreviation,
			organisation_type="National Society",
			country=country,
			display_order=10,
		)

	_ensure(OTHER_LABEL, organisation_type="Other", display_order=99)

	_repoint_registrations()

	frappe.db.commit()


def _ensure(society_name, abbreviation=None, organisation_type="National Society", country=None, display_order=10):
	"""Insert the entry if it is missing; never overwrite an admin's edits."""
	if frappe.db.exists("Delegate National Society", society_name):
		return

	doc = frappe.new_doc("Delegate National Society")
	doc.society_name = society_name
	doc.abbreviation = abbreviation
	doc.organisation_type = organisation_type
	doc.display_order = display_order
	doc.is_active = 1
	# Country names drift between Frappe versions (Eswatini/Swaziland, Cabo
	# Verde/Cape Verde), so an unmatched country is left blank rather than fatal.
	if country and frappe.db.exists("Country", country):
		doc.country = country
	doc.insert(ignore_permissions=True)


def _repoint_registrations():
	"""Move registrations off the old `National Society` link.

	Values are still the old `SR-YYYY-####` docnames; each is translated via its
	`national_society_name` title. Anything that cannot be matched falls back to
	"Other" with the original title preserved in `national_society_other`, so no
	registration is left pointing at a non-existent record.
	"""
	rows = frappe.get_all(
		"Delegate Registration",
		fields=["name", "national_society"],
		filters={"national_society": ["is", "set"]},
	)
	for row in rows:
		if frappe.db.exists("Delegate National Society", row.national_society):
			continue

		title = frappe.db.get_value("National Society", row.national_society, "national_society_name")
		if title and frappe.db.exists("Delegate National Society", title):
			frappe.db.set_value(
				"Delegate Registration", row.name, "national_society", title, update_modified=False
			)
			continue

		frappe.db.set_value(
			"Delegate Registration",
			row.name,
			{"national_society": OTHER_LABEL, "national_society_other": title or row.national_society},
			update_modified=False,
		)
