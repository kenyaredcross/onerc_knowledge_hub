app_name = "onerc_knowledge_hub"
app_title = "Onerc Knowledge Hub"
app_publisher = "Kenya Red Cross Society"
app_description = (
	"Platform that allows different members of the National societies to interact and share peer to peer"
)
app_email = "developer@redcross.or.ke"
app_license = "agpl-3.0"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
add_to_apps_screen = [
	{
		"name": "onerc_knowledge_hub",
		"logo": "/assets/onerc_knowledge_hub/logo.jpg",
		"title": "Onerc Knowledge Hub",
		"route": "/onerc_knowledge_hub",
		"has_permission": "onerc_knowledge_hub.api.permission.has_app_permission",
	},
	{
		"name": "delegate_management",
		"logo": "/assets/onerc_knowledge_hub/logo.jpg",
		"title": "Delegate Management",
		"route": "/app/delegate-management",
		"has_permission": "onerc_knowledge_hub.api.permission.has_delegate_app_permission",
	},
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/onerc_knowledge_hub/css/onerc_knowledge_hub.css"
# app_include_js = "/assets/onerc_knowledge_hub/js/onerc_knowledge_hub.js"

# include js, css files in header of web template
# web_include_css = "/assets/onerc_knowledge_hub/css/onerc_knowledge_hub.css"
# web_include_js = "/assets/onerc_knowledge_hub/js/onerc_knowledge_hub.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "onerc_knowledge_hub/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "onerc_knowledge_hub/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "index"

# website user home page (by Role)
# role_home_page = {
# 	"Guest": "ans-hub",
# 	"System Manager": "ans-hub",
# 	"All": "ans-hub"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "onerc_knowledge_hub.utils.jinja_methods",
# 	"filters": "onerc_knowledge_hub.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "onerc_knowledge_hub.install.before_install"
after_install = "onerc_knowledge_hub.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "onerc_knowledge_hub.uninstall.before_uninstall"
# after_uninstall = "onerc_knowledge_hub.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "onerc_knowledge_hub.utils.before_app_install"
# after_app_install = "onerc_knowledge_hub.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "onerc_knowledge_hub.utils.before_app_uninstall"
# after_app_uninstall = "onerc_knowledge_hub.utils.after_app_uninstall"

# Build
# ------------------
# To hook into the build process

# after_build = "onerc_knowledge_hub.build.after_build"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "onerc_knowledge_hub.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"User": {
		"before_insert": "onerc_knowledge_hub.overrides.user_hooks.add_app_roles_before_insert",
		"after_insert": "onerc_knowledge_hub.overrides.user_hooks.restore_save_method"
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"onerc_knowledge_hub.tasks.all"
# 	],
# 	"daily": [
# 		"onerc_knowledge_hub.tasks.daily"
# 	],
# 	"hourly": [
# 		"onerc_knowledge_hub.tasks.hourly"
# 	],
# 	"weekly": [
# 		"onerc_knowledge_hub.tasks.weekly"
# 	],
# 	"monthly": [
# 		"onerc_knowledge_hub.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "onerc_knowledge_hub.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "onerc_knowledge_hub.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	"buzz.api.auth.get_login_context": "onerc_knowledge_hub.overrides.auth.get_login_context"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "onerc_knowledge_hub.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["onerc_knowledge_hub.utils.before_request"]
# after_request = ["onerc_knowledge_hub.utils.after_request"]

# Session Events
# ----------------
on_session_creation = ["onerc_knowledge_hub.overrides.auth.on_session_creation"]

# Job Events
# ----------
# before_job = ["onerc_knowledge_hub.utils.before_job"]
# after_job = ["onerc_knowledge_hub.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"onerc_knowledge_hub.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []


website_route_rules = [
	{"from_route": "/ans-hub/<path:app_path>", "to_route": "ans-hub"},
	{"from_route": "/login", "to_route": "login.html"},
	{"from_route": "/home", "to_route": "home.html"},
	{"from_route": "/", "to_route": "index.html"},
]
