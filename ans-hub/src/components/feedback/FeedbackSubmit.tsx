import { useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import {
  MessageSquarePlus,
  CheckCircle2,
  RefreshCw,
  Send,
} from "lucide-react";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";

interface FeedbackType {
  name: string;
  title: string;
  description: string | null;
}

export default function FeedbackSubmit() {
  const [form, setForm] = useState({ feedback_type: "", subject: "", message: "" });
  const [attachment, setAttachment] = useState<string>("");
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
      await submitFeedback({
        feedback_type: form.feedback_type,
        subject: form.subject,
        message: form.message,
        ...(attachment ? { attachment } : {}),
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ feedback_type: "", subject: "", message: "" });
    setAttachment("");
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
              onClick={handleReset}
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
              <div>
                <LinkField
                  doctype="Feedback Type"
                  label="Feedback Type"
                  required
                  value={form.feedback_type}
                  onChange={(val) => setForm((f) => ({ ...f, feedback_type: val }))}
                  buttonClassName="rounded-xl border-gray-200 bg-gray-50 h-12"
                  dropdownClassName="rounded-xl"
                  activeOptionClassName="bg-dash-red/10 text-dash-red"
                />
                {form.feedback_type && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    {feedbackTypes.find((ft) => ft.name === form.feedback_type)?.description}
                  </p>
                )}
              </div>

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

              <div>
                <FileUploadField
                  label="Attachment (optional)"
                  value={attachment}
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
                  onChange={(url) => setAttachment(url ?? "")}
                />
                <p className="mt-1 text-xs text-gray-400 ml-1">
                  Attach a screenshot or file to help illustrate the issue
                </p>
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
