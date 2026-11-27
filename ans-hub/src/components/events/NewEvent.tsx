import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";
import { withCsrfRetry } from "../../lib/csrf";

type EventField = {
  fieldname: string;
  fieldtype: string;
  label: string;
  reqd: boolean;
  description?: string | null;
  default?: string | null;
  select_options?: string[];
  link_doctype?: string;
};

type FormOptions = {
  fields: EventField[];
  can_publish: boolean;
};

type MyEvent = {
  name: string;
  title: string;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  venue?: string | null;
  medium?: string | null;
  is_published?: number;
  route?: string | null;
  owner?: string;
};

const INPUT_CLASS =
  "h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";

const TEXTAREA_CLASS =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * In-app event submission. The field list comes from the server, which reads it
 * off the event doctype's meta, so the form matches whatever schema the site
 * actually has instead of embedding a copy of it here.
 */
export default function NewEvent() {
  const { t } = useTranslation(["events", "forms", "common"]);
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<string, any>>({});
  const [publishNow, setPublishNow] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    data: optionsData,
    isLoading: optionsLoading,
    error: optionsError,
  } = useFrappeGetCall<{ message: FormOptions }>(
    "onerc_knowledge_hub.api.events.get_event_form_options",
  );

  const {
    data: myEventsData,
    isLoading: myEventsLoading,
    mutate: refreshMyEvents,
  } = useFrappeGetCall<{ message: MyEvent[] }>(
    "onerc_knowledge_hub.api.events.get_my_events",
  );

  const {
    call: createEvent,
    loading: isSubmitting,
    error: submitError,
  } = useFrappePostCall("onerc_knowledge_hub.api.events.create_event");

  const { call: setPublished } = useFrappePostCall(
    "onerc_knowledge_hub.api.events.set_event_published",
  );

  const options = optionsData?.message;
  const fields = useMemo(() => options?.fields || [], [options]);
  const canPublish = !!options?.can_publish;
  const myEvents = useMemo(() => myEventsData?.message || [], [myEventsData]);

  const update = (fieldname: string, value: any) =>
    setValues((prev) => ({ ...prev, [fieldname]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setNotice(null);

    if (!String(values.title || "").trim()) {
      setValidationError(t("events:titleRequired"));
      return;
    }

    try {
      const response = await withCsrfRetry(() =>
        createEvent({
          ...values,
          is_published: canPublish && publishNow ? 1 : 0,
        }),
      );
      const created = response?.message;
      await refreshMyEvents();

      if (created?.pending_review) {
        setValues({});
        setNotice(t("events:pendingReviewNotice"));
        return;
      }

      if (created?.route) {
        navigate(`/events/${created.route}`);
      } else {
        navigate("/events");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublished = async (event: MyEvent) => {
    try {
      await setPublished({
        name: event.name,
        is_published: event.is_published ? 0 : 1,
      });
      await refreshMyEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const renderField = (field: EventField) => {
    const value = values[field.fieldname] ?? "";
    const labelNode = (
      <label className="mb-2 block text-sm font-bold text-gray-800">
        {field.label}
        {field.reqd ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ({t("events:optional")})
          </span>
        )}
      </label>
    );

    const wide =
      field.fieldtype === "Text Editor" ||
      field.fieldtype === "Small Text" ||
      field.fieldtype === "Text" ||
      field.fieldtype === "Long Text" ||
      field.fieldtype === "Attach Image" ||
      field.fieldname === "title";

    let control: React.ReactNode;

    switch (field.fieldtype) {
      case "Select":
        control = (
          <select
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">{t("common:selectOption", "Select...")}</option>
            {(field.select_options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        break;

      case "Link":
        return (
          <div key={field.fieldname} className={wide ? "md:col-span-2" : ""}>
            <LinkField
              doctype={field.link_doctype || ""}
              label={field.label}
              required={field.reqd}
              value={value}
              onChange={(val) => update(field.fieldname, val)}
              buttonClassName="rounded-2xl border-gray-200 bg-gray-50 text-gray-900"
              dropdownClassName="rounded-2xl border border-gray-200 shadow-2xl"
              inputClassName="h-12 text-sm"
              optionClassName="rounded-xl"
              activeOptionClassName="bg-dash-red/10 text-dash-red"
            />
            {field.description && (
              <p className="mt-1.5 text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case "Date":
        control = (
          <input
            type="date"
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={INPUT_CLASS}
          />
        );
        break;

      case "Time":
        control = (
          <input
            type="time"
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={INPUT_CLASS}
          />
        );
        break;

      case "Datetime":
        control = (
          <input
            type="datetime-local"
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={INPUT_CLASS}
          />
        );
        break;

      case "Check":
        return (
          <div key={field.fieldname} className="md:col-span-2">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) =>
                  update(field.fieldname, e.target.checked ? 1 : 0)
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-dash-red focus:ring-dash-red"
              />
              <span>
                <span className="block text-sm font-bold text-gray-800">
                  {field.label}
                </span>
                {field.description && (
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {field.description}
                  </span>
                )}
              </span>
            </label>
          </div>
        );

      case "Attach":
      case "Attach Image":
        return (
          <div key={field.fieldname} className="md:col-span-2">
            <FileUploadField
              label={field.label}
              value={value}
              onChange={(url) => update(field.fieldname, url || "")}
              accept=".png,.jpg,.jpeg,.webp"
            />
            {field.description && (
              <p className="mt-1.5 text-xs text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case "Text Editor":
      case "Small Text":
      case "Text":
      case "Long Text":
        control = (
          <textarea
            rows={field.fieldtype === "Small Text" ? 3 : 6}
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={TEXTAREA_CLASS}
          />
        );
        break;

      default:
        control = (
          <input
            type="text"
            required={field.reqd}
            value={value}
            onChange={(e) => update(field.fieldname, e.target.value)}
            className={INPUT_CLASS}
          />
        );
    }

    return (
      <div key={field.fieldname} className={wide ? "md:col-span-2" : ""}>
        {labelNode}
        {control}
        {field.description && (
          <p className="mt-1.5 text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  };

  if (optionsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  // The event doctype comes from a separate app. If it is missing, or the member
  // lacks contributor access, say so plainly instead of showing a dead form.
  if (optionsError || !options) {
    const message =
      (optionsError as any)?.message ||
      (optionsError as any)?.exception ||
      t("events:eventsUnavailable");

    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-dash-red" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {t("events:eventsUnavailable")}
        </h2>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-center gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("forms:backTo")} {t("events:pageTitle")}
          </Link>
          <a
            href="/app/buzz-event/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            {t("common:openDirectly")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("forms:backTo")} {t("events:pageTitle")}
          </Link>

          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
              <Calendar className="h-3.5 w-3.5" />
              {t("events:newEvent")}
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
              {t("events:submitEvent")}
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              {t("events:submitEventSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {notice && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-800">{notice}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("events:eventDetails")}
                </h2>
                <p className="text-sm text-gray-600">
                  {t("events:submitEventSubtitle")}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {fields.map(renderField)}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            {canPublish ? (
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={publishNow}
                  onChange={(e) => setPublishNow(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-dash-red focus:ring-dash-red"
                />
                <span>
                  <span className="block text-sm font-bold text-gray-800">
                    {t("events:publishImmediately")}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {t("events:publishImmediatelyHint")}
                  </span>
                </span>
              </label>
            ) : (
              <p className="flex items-start gap-2 text-sm text-gray-600">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                {t("events:pendingReviewNotice")}
              </p>
            )}

            {(validationError || submitError) && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {validationError ||
                  (submitError as any)?.message ||
                  "Could not submit the event."}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <Link
                to="/events"
                className="rounded border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t("common:cancel", "Cancel")}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded bg-dash-red px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-dash-red/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting
                  ? t("events:creatingEvent")
                  : t("events:createEvent")}
              </button>
            </div>
          </div>
        </form>

        {/* Events the member submitted, with their review state */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            {t("events:myEvents")}
          </h2>

          {myEventsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-dash-red" />
            </div>
          ) : myEvents.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
              {t("events:noMyEvents")}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {myEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                      {formatDate(event.start_date) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.start_date)}
                        </span>
                      )}
                      {event.venue && <span>{event.venue}</span>}
                      {event.medium && <span>{event.medium}</span>}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded px-2 py-1 text-xs font-bold uppercase tracking-wide ${
                      event.is_published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {event.is_published
                      ? t("events:live")
                      : t("events:pendingReview")}
                  </span>

                  {event.is_published && event.route && (
                    <Link
                      to={`/events/${event.route}`}
                      className="shrink-0 text-xs font-semibold text-dash-red hover:underline"
                    >
                      {t("events:readMore")}
                    </Link>
                  )}

                  {canPublish && (
                    <button
                      onClick={() => togglePublished(event)}
                      className="shrink-0 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {event.is_published
                        ? t("events:unpublish")
                        : t("events:publish")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
