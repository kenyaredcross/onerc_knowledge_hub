import { useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import {
  MessageSquarePlus,
  Clock,
  Eye,
  CheckCheck,
  XCircle,
  RefreshCw,
  Paperclip,
} from "lucide-react";

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
  attachment: string | null;
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

export default function FeedbackAdmin() {
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
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-red text-white shadow-lg">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Feedback Submissions</h1>
            <p className="text-sm text-gray-500">Review and manage user feedback</p>
          </div>
        </div>

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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attachment</th>
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
                        <td className="px-4 py-3">
                          {item.attachment ? (
                            <a
                              href={item.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-dash-red font-medium hover:underline"
                            >
                              <Paperclip className="h-3 w-3" />
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
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
