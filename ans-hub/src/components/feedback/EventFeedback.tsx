import { useState } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import { CheckCircle2, RefreshCw, Send, ClipboardList } from "lucide-react";

interface EventFeedbackForm {
  is_anonymous: boolean;
  respondent_name: string;
  email: string;
  organisation: string;
  q1_content_relevance: number | null;
  q2_most_valuable_session: string;
  q3_topics_not_covered: string;
  q4_speaker_quality: number | null;
  q5_technical_experience: number | null;
  q6_mindset_change: string;
  q7_concrete_action: string;
  q8_followup_interest: string;
  q9_likelihood_recommend: number | null;
  q10_krcs_did_well: string;
  q11_suggestions: string;
}

const defaultForm: EventFeedbackForm = {
  is_anonymous: true,
  respondent_name: "",
  email: "",
  organisation: "",
  q1_content_relevance: null,
  q2_most_valuable_session: "",
  q3_topics_not_covered: "",
  q4_speaker_quality: null,
  q5_technical_experience: null,
  q6_mindset_change: "",
  q7_concrete_action: "",
  q8_followup_interest: "",
  q9_likelihood_recommend: null,
  q10_krcs_did_well: "",
  q11_suggestions: "",
};

function ScaleButtons({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-11 w-11 rounded-xl text-sm font-bold transition-all ${
            value === n
              ? "bg-dash-red text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {n}
        </button>
      ))}
      <span className="self-center text-xs text-gray-400 ml-1">
        1 = Poor &nbsp;·&nbsp; 5 = Excellent
      </span>
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            value === opt
              ? "bg-dash-red text-white border-dash-red shadow-sm"
              : "border-gray-200 text-gray-700 hover:border-dash-red hover:text-dash-red"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";

const labelCls = "mb-2 block text-sm font-bold text-gray-800";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function EventFeedback() {
  const [form, setForm] = useState<EventFeedbackForm>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { call: submitForm } = useFrappePostCall(
    "onerc_knowledge_hub.api.event_feedback.submit_event_feedback"
  );

  const set = <K extends keyof EventFeedbackForm>(
    key: K,
    value: EventFeedbackForm[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const isValid =
    form.q1_content_relevance !== null &&
    form.q4_speaker_quality !== null &&
    form.q5_technical_experience !== null &&
    form.q6_mindset_change !== "" &&
    form.q9_likelihood_recommend !== null &&
    (form.is_anonymous || form.respondent_name.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await submitForm({
        is_anonymous: form.is_anonymous ? 1 : 0,
        respondent_name: form.respondent_name || null,
        email: form.email || null,
        organisation: form.organisation || null,
        q1_content_relevance: form.q1_content_relevance,
        q2_most_valuable_session: form.q2_most_valuable_session || null,
        q3_topics_not_covered: form.q3_topics_not_covered || null,
        q4_speaker_quality: form.q4_speaker_quality,
        q5_technical_experience: form.q5_technical_experience,
        q6_mindset_change: form.q6_mindset_change,
        q7_concrete_action: form.q7_concrete_action || null,
        q8_followup_interest: form.q8_followup_interest || null,
        q9_likelihood_recommend: form.q9_likelihood_recommend,
        q10_krcs_did_well: form.q10_krcs_did_well || null,
        q11_suggestions: form.q11_suggestions || null,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm(defaultForm);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Thank you for your feedback!
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Your response has been recorded. We appreciate you taking the time
            to share your thoughts.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-dash-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-red text-white shadow-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">
              Event Feedback
            </h1>
            <p className="text-sm text-gray-500">
              KRCS Digital Transformation Event — share your experience
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* About You */}
          <SectionCard title="About You">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("is_anonymous", !form.is_anonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.is_anonymous ? "bg-dash-red" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.is_anonymous ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Submit anonymously
              </span>
            </div>

            {!form.is_anonymous && (
              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <div>
                  <label className={labelCls}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.respondent_name}
                    onChange={(e) => set("respondent_name", e.target.value)}
                    placeholder="Your name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="your@email.com"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Organisation</label>
                  <input
                    type="text"
                    value={form.organisation}
                    onChange={(e) => set("organisation", e.target.value)}
                    placeholder="Your National Society or organisation"
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Content & Sessions */}
          <SectionCard title="Content & Sessions">
            <div>
              <label className={labelCls}>
                1. How relevant was the event content to your organisation's
                digital transformation journey?{" "}
                <span className="text-red-500">*</span>
              </label>
              <ScaleButtons
                value={form.q1_content_relevance}
                onChange={(v) => set("q1_content_relevance", v)}
              />
            </div>
            <div>
              <label className={labelCls}>
                2. Which session or activity did you find most valuable, and
                why?
              </label>
              <textarea
                rows={3}
                value={form.q2_most_valuable_session}
                onChange={(e) =>
                  set("q2_most_valuable_session", e.target.value)
                }
                placeholder="Tell us about the session that stood out most…"
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className={labelCls}>
                3. Were there topics or discussions you expected but didn't find
                covered?
              </label>
              <textarea
                rows={3}
                value={form.q3_topics_not_covered}
                onChange={(e) => set("q3_topics_not_covered", e.target.value)}
                placeholder="Any gaps you noticed in the agenda…"
                className={inputCls + " resize-none"}
              />
            </div>
          </SectionCard>

          {/* Delivery & Experience */}
          <SectionCard title="Delivery & Experience">
            <div>
              <label className={labelCls}>
                4. How would you rate the quality and clarity of speakers and
                facilitators? <span className="text-red-500">*</span>
              </label>
              <ScaleButtons
                value={form.q4_speaker_quality}
                onChange={(v) => set("q4_speaker_quality", v)}
              />
            </div>
            <div>
              <label className={labelCls}>
                5. How was your technical experience? (audio, visuals,
                connectivity, Mentimeter){" "}
                <span className="text-red-500">*</span>
              </label>
              <ScaleButtons
                value={form.q5_technical_experience}
                onChange={(v) => set("q5_technical_experience", v)}
              />
            </div>
            <div>
              <label className={labelCls}>
                6. Did the event change how you think about digital
                transformation in your NS?{" "}
                <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                options={["Yes significantly", "Somewhat", "No change"]}
                value={form.q6_mindset_change}
                onChange={(v) => set("q6_mindset_change", v)}
              />
            </div>
          </SectionCard>

          {/* Outcomes & Next Steps */}
          <SectionCard title="Outcomes & Next Steps">
            <div>
              <label className={labelCls}>
                7. What is one concrete action or commitment you are taking away
                from this event?
              </label>
              <textarea
                rows={3}
                value={form.q7_concrete_action}
                onChange={(e) => set("q7_concrete_action", e.target.value)}
                placeholder="What will you do differently or start doing…"
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className={labelCls}>
                8. Would your organisation be interested in a follow-up
                engagement with KRCS on digital transformation?
              </label>
              <RadioGroup
                options={["Yes", "Maybe, later", "No"]}
                value={form.q8_followup_interest}
                onChange={(v) => set("q8_followup_interest", v)}
              />
            </div>
            <div>
              <label className={labelCls}>
                9. How likely are you to recommend this event to a colleague?{" "}
                <span className="text-red-500">*</span>
              </label>
              <ScaleButtons
                value={form.q9_likelihood_recommend}
                onChange={(v) => set("q9_likelihood_recommend", v)}
              />
            </div>
          </SectionCard>

          {/* Open Reflection */}
          <SectionCard title="Open Reflection">
            <div>
              <label className={labelCls}>
                10. What did KRCS do well in organising and delivering this
                event?
              </label>
              <textarea
                rows={3}
                value={form.q10_krcs_did_well}
                onChange={(e) => set("q10_krcs_did_well", e.target.value)}
                placeholder="Share what worked well…"
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className={labelCls}>
                11. What suggestions do you have for future events?
              </label>
              <textarea
                rows={3}
                value={form.q11_suggestions}
                onChange={(e) => set("q11_suggestions", e.target.value)}
                placeholder="Ideas for improving future events…"
                className={inputCls + " resize-none"}
              />
            </div>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-dash-red text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Feedback
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pb-6">
            Fields marked <span className="text-red-500">*</span> are required.
          </p>
        </form>
      </div>
    </div>
  );
}
