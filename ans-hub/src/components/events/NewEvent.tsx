import { useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Info,
  Loader2,
  Save,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";
import toast from "react-hot-toast";

export default function NewEvent() {
  const navigate = useNavigate();
  const [submitAction, setSubmitAction] = useState<"save" | "publish">("save");

  const [form, setForm] = useState({
    title: "",
    category: "",
    medium: "In Person",
    venue: "",
    host: "",
    start_date: "",
    start_time: "",
    time_zone: "Africa/Nairobi",
    end_date: "",
    end_time: "",
    short_description: "",
    about: "",
    banner_image: "",
    is_published: 0,
    free_webinar: 1,
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    call: createEvent,
    loading: isSubmitting,
    error,
  } = useFrappePostCall("frappe.client.insert");

  const handleSubmit = async (e: React.FormEvent, action: "save" | "publish") => {
    e.preventDefault();
    setSubmitAction(action);

    // Validation
    if (!form.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }
    if (!form.category) {
      toast.error("Please select an event category");
      return;
    }
    if (!form.start_date) {
      toast.error("Please select a start date");
      return;
    }

    const eventData = {
      doctype: "Buzz Event",
      ...form,
      is_published: action === "publish" ? 1 : 0,
    };

    try {
      const response = await createEvent({ doc: eventData });
      const newEvent = response?.message || response;

      if (action === "publish") {
        toast.success("Event published successfully!");
      } else {
        toast.success("Event saved as draft!");
      }

      // Navigate to events page
      setTimeout(() => {
        navigate("/events");
      }, 1000);
    } catch (err: any) {
      console.error("Error creating event:", err);
      toast.error(err.message || "Failed to create event");
    }
  };

  const fieldClasses = {
    label: "block text-sm font-medium text-gray-700 mb-2",
    input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none",
    textarea: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none min-h-[100px]",
    select: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none",
  };

  return (
    <div className="min-h-full bg-dash-bg p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-dash-red" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          </div>
          <p className="text-gray-600">
            Fill in the details below to create a new event for the network.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, submitAction)} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-dash-navy" />
              <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={fieldClasses.label}>
                  Event Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={fieldClasses.input}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Category */}
                <div>
                  <label className={fieldClasses.label}>
                    Category <span className="text-red-600">*</span>
                  </label>
                  <LinkField
                    doctype="Event Category"
                    value={form.category}
                    onChange={(val) => updateField("category", val)}
                    placeholder="Select category"
                    className={fieldClasses.input}
                  />
                </div>

                {/* Medium */}
                <div>
                  <label className={fieldClasses.label}>
                    Medium <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.medium}
                    onChange={(e) => updateField("medium", e.target.value)}
                    className={fieldClasses.select}
                    required
                  >
                    <option value="In Person">In Person</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Venue */}
                {form.medium !== "Online" && (
                  <div>
                    <label className={fieldClasses.label}>
                      Venue {form.medium !== "Online" && <span className="text-red-600">*</span>}
                    </label>
                    <LinkField
                      doctype="Event Venue"
                      value={form.venue}
                      onChange={(val) => updateField("venue", val)}
                      placeholder="Select venue"
                      className={fieldClasses.input}
                    />
                  </div>
                )}

                {/* Host */}
                <div>
                  <label className={fieldClasses.label}>Host</label>
                  <input
                    type="text"
                    value={form.host}
                    onChange={(e) => updateField("host", e.target.value)}
                    className={fieldClasses.input}
                    placeholder="Enter host name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-dash-navy" />
              <h2 className="text-lg font-bold text-gray-900">Date & Time</h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label className={fieldClasses.label}>
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className={fieldClasses.input}
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className={fieldClasses.label}>Start Time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => updateField("start_time", e.target.value)}
                    className={fieldClasses.input}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* End Date */}
                <div>
                  <label className={fieldClasses.label}>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => updateField("end_date", e.target.value)}
                    className={fieldClasses.input}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className={fieldClasses.label}>End Time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => updateField("end_time", e.target.value)}
                    className={fieldClasses.input}
                  />
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className={fieldClasses.label}>Time Zone</label>
                <input
                  type="text"
                  value={form.time_zone}
                  onChange={(e) => updateField("time_zone", e.target.value)}
                  className={fieldClasses.input}
                  placeholder="e.g., Africa/Nairobi"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-dash-navy" />
              <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
            </div>

            <div className="space-y-4">
              {/* Short Description */}
              <div>
                <label className={fieldClasses.label}>Short Description</label>
                <textarea
                  value={form.short_description}
                  onChange={(e) => updateField("short_description", e.target.value)}
                  className={fieldClasses.textarea}
                  placeholder="Brief summary of the event"
                  rows={3}
                />
              </div>

              {/* About */}
              <div>
                <label className={fieldClasses.label}>About the Event</label>
                <textarea
                  value={form.about}
                  onChange={(e) => updateField("about", e.target.value)}
                  className={fieldClasses.textarea}
                  placeholder="Detailed description of the event"
                  rows={6}
                />
              </div>

              {/* Banner Image */}
              <div>
                <label className={fieldClasses.label}>Banner Image</label>
                <FileUploadField
                  value={form.banner_image}
                  onChange={(val) => updateField("banner_image", val)}
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error.message || "An error occurred"}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "save")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && submitAction === "save" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save as Draft
                </>
              )}
            </button>

            <button
              type="submit"
              onClick={(e) => handleSubmit(e as any, "publish")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-dash-red px-6 py-3 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && submitAction === "publish" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Publish Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
