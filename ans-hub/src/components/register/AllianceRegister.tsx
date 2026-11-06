import { useEffect, useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle2, Download, Loader2, MapPin } from "lucide-react";

// Public (guest) registration for the Localisation Alliance for Financial
// Sustainability - 2026 event. Served inside the SPA at
// /ans-hub/localisation-alliance-2026. Writes to its own Alliance Registration
// doctype — separate from the richer Delegate Registration flow.

const EVENT_NAME = "Localisation Alliance for Financial Sustainability - 2026";

interface RegForm {
  full_name: string;
  organisation: string;
  email: string;
}

const emptyForm: RegForm = { full_name: "", organisation: "", email: "" };

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";
const labelCls = "mb-2 block text-sm font-bold text-gray-800";
const req = <span className="text-dash-red">*</span>;

export default function AllianceRegister() {
  const [form, setForm] = useState<RegForm>(emptyForm);
  const [submitted, setSubmitted] = useState<{ name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: orgData } = useFrappeGetCall(
    "onerc_core.api.organization.get_organization_settings",
    {}
  );

  const { data: infoData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.alliance_registration.get_registration_info",
    {}
  );

  const info = infoData?.message || {};
  const eventDates = info.event_dates || "9th & 10th November 2026";
  const venue = info.venue || "Ndovu Hall, Boma Hotel - Nairobi, Kenya";
  const agendaUrl: string | null = info.agenda_url || null;

  const org = orgData?.message || {};
  const logo = org.logo || "/assets/onerc_knowledge_hub/ans-hub/logo.jpg";
  const orgName = org.organization_name || "Africa Localization Hub";

  useEffect(() => {
    document.title = EVENT_NAME;
  }, []);

  const { call: submitRegistration } = useFrappePostCall(
    "onerc_knowledge_hub.api.alliance_registration.submit_registration"
  );

  const set = <K extends keyof RegForm>(key: K, value: RegForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitRegistration({
        payload: JSON.stringify(form),
      });
      setSubmitted({ name: res?.message?.name });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(
        err?.message || "Could not submit your registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Registration received
          </h2>
          <p className="text-gray-500 text-sm mb-2 max-w-sm">
            Thank you for registering for {EVENT_NAME}.
          </p>
          {submitted.name && (
            <p className="text-xs text-gray-400 mb-6">
              Reference: <span className="font-mono">{submitted.name}</span>
            </p>
          )}
          <button
            onClick={() => {
              setSubmitted(null);
              setForm(emptyForm);
            }}
            className="px-5 py-2.5 bg-dash-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Register someone else
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt={orgName}
            className="h-12 w-12 rounded-xl object-contain bg-white shadow-sm ring-1 ring-gray-100"
          />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-dash-red">
              {orgName}
            </p>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {EVENT_NAME}
            </h1>
          </div>
        </div>

        {/* Event details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-dash-red" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Dates
              </p>
              <p className="text-sm font-semibold text-gray-900">{eventDates}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-dash-red" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Venue
              </p>
              <p className="text-sm font-semibold text-gray-900">{venue}</p>
            </div>
          </div>
          {agendaUrl && (
            <a
              href={agendaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-dash-red px-4 py-2.5 text-sm font-bold text-dash-red transition-colors hover:bg-dash-red hover:text-white"
            >
              <Download className="h-4 w-4" /> Download Agenda
            </a>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className={labelCls}>Full Name {req}</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              required
              placeholder="Your full name"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Organization {req}</label>
            <input
              type="text"
              value={form.organisation}
              onChange={(e) => set("organisation", e.target.value)}
              required
              placeholder="Your National Society or organisation"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email Address {req}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-dash-red px-6 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
