import { useEffect, useMemo, useState } from "react";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";

// Mirrors the public Jinja form at /delegate-registration. Secretary Generals and
// delegations from other National Societies register here for the Kenya convening —
// a fully public (no login) page served inside the SPA at /ans-hub/register.

const DESIGNATIONS = [
  "Secretary General",
  "Deputy Secretary General",
  "Officer",
  "Delegate",
  "IFRC",
  "ICRC",
  "Other",
];

const OTHER_SOCIETY = "Other";

// Default event name — admins can override it via Delegate Registration Settings
// (event_title), which takes precedence over this fallback.
const EVENT_NAME = "Localisation Alliance for Financial Sustainability - 2026";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

interface FormData {
  event_title: string;
  boma_hotel_url: string;
  show_sessions: boolean;
  national_societies: { name: string; abbreviation?: string }[];
  countries: string[];
  sessions: {
    name: string;
    session_title: string;
    session_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    venue?: string | null;
    description?: string | null;
  }[];
}

interface RegForm {
  surname: string;
  given_names: string;
  national_society: string;
  national_society_other: string;
  designation: string;
  designation_other: string;
  nationality: string;
  passport_number: string;
  date_of_birth: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  email: string;
  phone_number: string;
  arrival_date: string;
  arrival_time: string;
  arrival_flight: string;
  departure_date: string;
  departure_time: string;
  departure_flight: string;
  additional_information: string;
  accommodation_boma: boolean;
  sessions: string[];
}

const emptyForm: RegForm = {
  surname: "",
  given_names: "",
  national_society: "",
  national_society_other: "",
  designation: "",
  designation_other: "",
  nationality: "",
  passport_number: "",
  date_of_birth: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  email: "",
  phone_number: "",
  arrival_date: "",
  arrival_time: "",
  arrival_flight: "",
  departure_date: "",
  departure_time: "",
  departure_flight: "",
  additional_information: "",
  accommodation_boma: false,
  sessions: [],
};

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";
const labelCls = "mb-2 block text-sm font-bold text-gray-800";
const req = <span className="text-dash-red">*</span>;

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

export default function DelegateRegister() {
  const [form, setForm] = useState<RegForm>(emptyForm);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState<{
    name: string;
    boma_requested: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.registration.get_registration_form_data",
    {}
  );

  const { data: orgData } = useFrappeGetCall(
    "onerc_core.api.organization.get_organization_settings",
    {}
  );

  const config: FormData | null = useMemo(() => data?.message || null, [data]);
  const eventTitle = config?.event_title || EVENT_NAME;

  useEffect(() => {
    document.title = eventTitle;
  }, [eventTitle]);

  const org = orgData?.message || {};
  const logo = org.logo || "/assets/onerc_knowledge_hub/ans-hub/logo.jpg";
  const orgName = org.organization_name || "Africa Localization Hub";

  const { call: submitRegistration } = useFrappePostCall(
    "onerc_knowledge_hub.api.registration.submit_registration"
  );

  const set = <K extends keyof RegForm>(key: K, value: RegForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSession = (id: string) =>
    setForm((f) => ({
      ...f,
      sessions: f.sessions.includes(id)
        ? f.sessions.filter((s) => s !== id)
        : [...f.sessions, id],
    }));

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read the file"));
      reader.readAsDataURL(file);
    });

  const onPickFile = (file: File | null) => {
    if (!file) {
      setPassportFile(null);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("The passport copy must be a PDF, JPG or PNG file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("The passport copy must be 5 MB or smaller.");
      return;
    }
    setPassportFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportFile) {
      toast.error("Please attach a copy of the passport biodata page.");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataUrl = await readFileAsDataUrl(passportFile);
      const res = await submitRegistration({
        payload: JSON.stringify({
          ...form,
          accommodation_boma: form.accommodation_boma ? 1 : 0,
          passport_file_name: passportFile.name,
          passport_file_data: dataUrl,
        }),
      });
      const message = res?.message || {};
      setSubmitted({
        name: message.name,
        boma_requested: !!message.boma_requested,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(
        err?.message || "Could not submit your registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

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
            Thank you for registering. A confirmation has been sent to your
            email.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Reference: <span className="font-mono">{submitted.name}</span>
          </p>
          {submitted.boma_requested && (
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              Your accommodation request has been forwarded to the Boma Hotel.
              They will be in touch about your booking.
            </p>
          )}
          <button
            onClick={() => {
              setSubmitted(null);
              setForm(emptyForm);
              setPassportFile(null);
            }}
            className="px-5 py-2.5 bg-dash-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Register another delegate
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
              {eventTitle}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Delegate & Passport */}
          <SectionCard title="Delegate & Passport">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Surname {req}</label>
                <input
                  type="text"
                  value={form.surname}
                  onChange={(e) => set("surname", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Given Names {req}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (as on passport)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.given_names}
                  onChange={(e) => set("given_names", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>National Society {req}</label>
              <select
                value={form.national_society}
                onChange={(e) => set("national_society", e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Select your National Society</option>
                {config?.national_societies.map((ns) => (
                  <option key={ns.name} value={ns.name}>
                    {ns.abbreviation ? `${ns.name} (${ns.abbreviation})` : ns.name}
                  </option>
                ))}
              </select>
            </div>

            {form.national_society === OTHER_SOCIETY && (
              <div>
                <label className={labelCls}>Please specify {req}</label>
                <input
                  type="text"
                  value={form.national_society_other}
                  onChange={(e) =>
                    set("national_society_other", e.target.value)
                  }
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Designation {req}</label>
                <select
                  value={form.designation}
                  onChange={(e) => set("designation", e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Select your designation</option>
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {form.designation === "Other" && (
                <div>
                  <label className={labelCls}>Please specify {req}</label>
                  <input
                    type="text"
                    value={form.designation_other}
                    onChange={(e) => set("designation_other", e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Nationality {req}</label>
                <select
                  value={form.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">Select your nationality</option>
                  {config?.countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Passport Number {req}</label>
                <input
                  type="text"
                  value={form.passport_number}
                  onChange={(e) => set("passport_number", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Date of Birth {req}</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date of Passport Issue {req}</label>
                <input
                  type="date"
                  value={form.passport_issue_date}
                  onChange={(e) => set("passport_issue_date", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date of Expiry {req}</label>
                <input
                  type="date"
                  value={form.passport_expiry_date}
                  onChange={(e) => set("passport_expiry_date", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Copy of Passport {req}{" "}
                <span className="text-xs font-normal text-gray-400">
                  (PDF/JPG/PNG, max 5MB)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:border-dash-red hover:bg-white transition-colors">
                <UploadCloud className="h-5 w-5 text-dash-red" />
                <span className="truncate">
                  {passportFile ? passportFile.name : "Choose a file…"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Email {req}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number {req}</label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => set("phone_number", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* Travel */}
          <SectionCard title="Travel">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Date of Arrival in Kenya {req}</label>
                <input
                  type="date"
                  value={form.arrival_date}
                  onChange={(e) => set("arrival_date", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Arrival Time {req}</label>
                <input
                  type="time"
                  value={form.arrival_time}
                  onChange={(e) => set("arrival_time", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Arrival Flight {req}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (flight no. / airline)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.arrival_flight}
                  onChange={(e) => set("arrival_flight", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>
                  Date of Departure from Kenya {req}
                </label>
                <input
                  type="date"
                  value={form.departure_date}
                  onChange={(e) => set("departure_date", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Departure Time {req}</label>
                <input
                  type="time"
                  value={form.departure_time}
                  onChange={(e) => set("departure_time", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Departure Flight {req}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (flight no. / airline)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.departure_flight}
                  onChange={(e) => set("departure_flight", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>
          </SectionCard>

          {/* Additional information */}
          <SectionCard title="Additional Information">
            <div>
              <label className={labelCls}>
                Anything we should know before you arrive?
              </label>
              <textarea
                rows={3}
                value={form.additional_information}
                onChange={(e) =>
                  set("additional_information", e.target.value)
                }
                placeholder="Dietary needs, accessibility requirements, special requests…"
                className={inputCls + " resize-none"}
              />
            </div>
          </SectionCard>

          {/* Accommodation */}
          <SectionCard title="Accommodation">
            <div>
              <label className={labelCls}>
                Would you like accommodation at the Boma Hotel?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Yes, please", value: true },
                  { label: "No, thank you", value: false },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => set("accommodation_boma", opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      form.accommodation_boma === opt.value
                        ? "bg-dash-red text-white border-dash-red shadow-sm"
                        : "border-gray-200 text-gray-700 hover:border-dash-red hover:text-dash-red"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {config?.boma_hotel_url && (
                <a
                  href={config.boma_hotel_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-bold text-dash-red hover:underline"
                >
                  View the Boma Hotel →
                </a>
              )}
            </div>
          </SectionCard>

          {/* Sessions */}
          {config?.show_sessions && config.sessions.length > 0 && (
            <SectionCard title="Sessions">
              <p className="text-xs text-gray-500 -mt-2">
                Select the sessions you plan to attend.
              </p>
              <div className="space-y-2">
                {config.sessions.map((s) => {
                  const checked = form.sessions.includes(s.name);
                  return (
                    <label
                      key={s.name}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        checked
                          ? "border-dash-red bg-dash-red/5"
                          : "border-gray-200 hover:border-dash-red/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSession(s.name)}
                        className="mt-1 h-4 w-4 accent-dash-red"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900">
                          {s.session_title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {[s.session_date, s.start_time && s.end_time
                            ? `${s.start_time}–${s.end_time}`
                            : s.start_time, s.venue]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                        {s.description && (
                          <p className="mt-1 text-xs text-gray-400">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          )}

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
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
