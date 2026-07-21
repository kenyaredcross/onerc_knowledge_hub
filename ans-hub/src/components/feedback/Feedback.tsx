import { useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import {
  MessageSquarePlus,
  CheckCircle2,
  Clock,
  Eye,
  CheckCheck,
  XCircle,
  RefreshCw,
  ChevronDown,
  Send,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface FeedbackType {
  name: string;
  title: string;
  description: string | null;
}

interface FeedbackItem {
  name: string;
  subject: string;
  feedback_type: string;
  status: "Open" | "Reviewed" | "Resolved" | "Closed";
  submitted_by: string | null;
  full_name: string | null;
  email: string | null;
  submission_date: string;
  reviewed_by: string | null;
  reviewed_on: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-yellow-100 text-yellow-700",
  Reviewed: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Open: Clock,
  Reviewed: Eye,
  Resolved: CheckCheck,
  Closed: XCircle,
};

// ── Submit Form (all users) ────────────────────────────────────────────────
export function FeedbackSubmit() {
  const [form, setForm] = useState({ feedback_type: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: typesData, isLoading: typesLoading } = useFrappeGetCall(
    "onerc_core.api.feedback.get_feedback_types", {},
  );
  const feedbackTypes: FeedbackType[] = typesData?.message || typesData || [];

  const { call: submitFeedback } = useFrappePostCall("onerc_core.api.feedback.submit_feedback");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.feedback_type || !form.message.trim()) return;
    setIsSubmitting(true);
    try {
      await submitFeedback({ feedback_type: form.feedback_type, subject: form.subject, message: form.message });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Your submission has been received. Our team will review it and get back to you if needed.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ feedback_type: "", subject: "", message: "" }); }}
              className="px-5 py-2.5 bg-dash-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-red text-white shadow-lg">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Feedback</h1>
            <p className="text-sm text-gray-500">Share your thoughts or report an issue</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-6">
            Your feedback helps us improve the Localisation Hub for everyone.
          </p>

          {typesLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-dash-red/20 border-t-dash-red" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Feedback Type */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Feedback Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.feedback_type}
                    onChange={(e) => setForm((f) => ({ ...f, feedback_type: e.target.value }))}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  >
                    <option value="">Select a type…</option>
                    {feedbackTypes.map((ft) => (
                      <option key={ft.name} value={ft.name}>{ft.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {form.feedback_type && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    {feedbackTypes.find((ft) => ft.name === form.feedback_type)?.description}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief summary of your feedback…"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or report an issue…"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !form.feedback_type || !form.message.trim()}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-dash-red text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Feedback</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin List (admins only) ───────────────────────────────────────────────
export function FeedbackAdmin() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingName, setUpdatingName] = useState<string | null>(null);

  const { call: updateFeedback } = useFrappePostCall("onerc_core.api.feedback.update_feedback");

  const { data, isLoading, mutate } = useFrappeGetCall(
    "onerc_core.api.feedback.get_feedback_list",
    { status: statusFilter || undefined, page, page_size: 20 },
  );

  const result = data?.message || data || { total: 0, items: [] };
  const items: FeedbackItem[] = result.items || [];
  const total: number = result.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleStatusChange = async (name: string, status: string) => {
    setUpdatingName(name);
    try {
      await updateFeedback({ name, status });
      toast.success(`Marked as ${status}`);
      mutate();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setUpdatingName(null);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-red text-white shadow-lg">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Feedback Submissions</h1>
            <p className="text-sm text-gray-500">Review and manage user feedback</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["", "Open", "Reviewed", "Resolved", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                statusFilter === s
                  ? "bg-dash-red text-white border-dash-red"
                  : "bg-white text-gray-600 border-gray-200 hover:border-dash-red hover:text-dash-red",
              ].join(" ")}
            >
              {s || "All"}
            </button>
          ))}
          <button
            onClick={() => mutate()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-dash-red/20 border-t-dash-red" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <MessageSquarePlus className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No feedback submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const StatusIcon = STATUS_ICONS[item.status] || Clock;
                    return (
                      <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(item.submission_date).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {item.feedback_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{item.subject || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {item.full_name || item.submitted_by || item.email || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.status !== "Closed" && (
                            <select
                              disabled={updatingName === item.name}
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) handleStatusChange(item.name, e.target.value);
                                e.target.value = "";
                              }}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-dash-red/30 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="">Update…</option>
                              {["Reviewed", "Resolved", "Closed"]
                                .filter((s) => s !== item.status)
                                .map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                          {updatingName === item.name && (
                            <RefreshCw className="inline h-3.5 w-3.5 animate-spin text-gray-400 ml-1" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{total} total submissions</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
