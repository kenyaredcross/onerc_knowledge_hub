import frappe


def _parse_json(value):
    if isinstance(value, str):
        return frappe.parse_json(value)
    return value or {}


@frappe.whitelist(allow_guest=True)
def get_learning_hub(name):
    """Return a single Learning Hub document."""
    return frappe.get_doc("Learning Hub", name).as_dict()


@frappe.whitelist(allow_guest=True)
def list_learning_hubs(filters=None, fields=None, limit_start=0, limit_page_length=20, order_by="modified desc"):
    """Return a list of Learning Hub documents."""
    filters = _parse_json(filters)
    fields = _parse_json(fields) or ["name", "title", "status", "modified"]
    return frappe.get_list(
        "Learning Hub",
        filters=filters,
        fields=fields,
        limit_start=limit_start,
        limit_page_length=limit_page_length,
        order_by=order_by,
    )


@frappe.whitelist()
def create_learning_hub(data):
    """Create a new Learning Hub document."""
    data = _parse_json(data)
    doc = frappe.get_doc({"doctype": "Learning Hub", **data})
    doc.insert()
    return doc.as_dict()


@frappe.whitelist()
def update_learning_hub(name, data):
    """Update an existing Learning Hub document."""
    data = _parse_json(data)
    doc = frappe.get_doc("Learning Hub", name)
    for key, value in data.items():
        if key != "doctype":
            doc.set(key, value)
    doc.save()
    return doc.as_dict()


@frappe.whitelist()
def delete_learning_hub(name):
    """Delete a Learning Hub document."""
    frappe.delete_doc("Learning Hub", name)
    return {"deleted": name}
