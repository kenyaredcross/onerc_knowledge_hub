import { useFrappeGetCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Award,
  Building,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const formatBadge: Record<string, string> = {
  Webinar: "bg-blue-100 text-blue-700",
  "In Person": "bg-green-100 text-green-700",
  Hybrid: "bg-purple-100 text-purple-700",
};

export default function EventDetail() {
  const { t } = useTranslation(['events', 'common']);
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.events.get_event_details",
    { event_route: slug },
  );

  const event = data?.message;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  if (error || !event) return <Navigate to="/events" replace />;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const day = startDate.getDate();
  const month = startDate.toLocaleString("default", { month: "short" });

  const registrationLink =
    event.registration_url && event.external_registration_page
      ? event.registration_url
      : `${window.location.origin}/dashboard/book-tickets/${event.route}`;

  return (
    <div className="min-h-full bg-dash-bg p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common:back')} to Events
        </Link>

        <div className="rounded-2xl bg-white border border-dash-border shadow-sm overflow-hidden">
          {event.banner_image && (
            <div className="w-full h-64 md:h-96 overflow-hidden border-b border-dash-border">
              <img
                src={event.banner_image}
                className="w-full h-full object-cover"
                alt={event.title}
              />
            </div>
          )}

          <div className="border-b border-dash-border bg-dash-navy px-8 py-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
              <span className="font-display text-4xl font-bold leading-none">
                {day}
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400 mt-1">
                {month}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider ${formatBadge[event.medium] || "bg-gray-100 text-gray-700"}`}
                >
                  {event.medium}
                </span>
                {event.category && (
                  <span className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/10">
                    {event.category}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight">
                {event.title}
              </h1>
              {event.host && (
                <p className="mt-3 text-white/60 text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" /> Hosted by{" "}
                  <span className="text-white font-semibold">{event.host}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 p-8 lg:p-12 border-r border-gray-100">
              {event.short_description && (
                <section className="mb-10 p-6 rounded-xl bg-gray-50 border-l-4 border-dash-red">
                  <h3 className="text-gray-900 font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-dash-red" />
                    Summary
                  </h3>
                  <p className="text-gray-700 text-sm italic leading-relaxed">
                    {event.short_description}
                  </p>
                </section>
              )}

              <section className="mb-12">
                <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Info className="h-4 w-4 text-dash-red" /> About the Event
                </h3>
                <div
                  className="prose prose-slate max-w-none prose-sm lg:prose-base text-gray-600"
                  dangerouslySetInnerHTML={{ __html: event.about }}
                />
              </section>

              {event.featured_speakers?.length > 0 && (
                <section className="mb-12">
                  <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                    <Users className="h-4 w-4 text-dash-red" /> Featured
                    Speakers
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-8">
                    {event.featured_speakers.map((speaker: any, i: number) => (
                      <div key={i} className="flex gap-5">
                        {speaker.display_image ? (
                          <img
                            src={speaker.display_image}
                            className="h-16 w-16 rounded-2xl object-cover shadow-md ring-4 ring-gray-50"
                            alt={speaker.display_name}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                            <Users className="h-8 w-8" />
                          </div>
                        )}
                        <div className="min-w-0 pt-1">
                          <div className="text-base font-bold text-gray-900 truncate">
                            {speaker.display_name}
                          </div>
                          <div className="text-xs font-medium text-gray-500 line-clamp-1 mt-0.5">
                            {speaker.designation || "Panelist"}
                          </div>
                          {speaker.company && (
                            <div className="text-[10px] text-dash-red font-black uppercase mt-1 tracking-wider truncate">
                              {speaker.company}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {event.event_sponsors?.length > 0 && (
                <section>
                  <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                    <Award className="h-4 w-4 text-dash-red" /> Partners &
                    Sponsors
                  </h3>
                  <div className="flex flex-wrap gap-10 items-center">
                    {event.event_sponsors.map(
                      (sponsor: any, i: number) =>
                        sponsor.logo && (
                          <div key={i} className="group transition-all">
                            <img
                              src={sponsor.logo}
                              className="h-10 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                              alt={sponsor.sponsor_name}
                            />
                          </div>
                        ),
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1 bg-gray-50/50 p-8 lg:p-12">
              <div className="sticky top-8 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-dash-red shadow-sm">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                        {t('events:date')}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                        {event.end_date &&
                          event.end_date !== event.start_date && (
                            <span className="block text-xs text-gray-500 font-medium">
                              to{" "}
                              {endDate.toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-dash-red shadow-sm">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                        {t('events:time')}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {event.start_time}
                        {event.time_zone && (
                          <span className="ml-1 text-gray-500">
                            ({event.time_zone})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-dash-red shadow-sm">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                        {t('events:venue')}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {event.venue || "Online / TBD"}
                      </div>
                    </div>
                  </div>

                  {event.tax_percentage > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-dash-red shadow-sm">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                          Pricing Details
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {event.tax_label}: {event.tax_percentage}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-dash-navy text-white shadow-xl shadow-dash-navy/10">
                  <h4 className="font-bold mb-2">Join the Event</h4>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">
                    Registrations for this session are currently open.
                    {event.allow_guest_booking
                      ? " Guests are welcome to join."
                      : " This is a members-only gathering."}
                  </p>

                  <a
                    href={registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-dash-red px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
                  >
                    Register <ExternalLink className="h-4 w-4" />
                  </a>

                  {event.registrations_close_at && (
                    <p className="mt-4 text-[10px] text-center text-white/40 font-bold uppercase tracking-tighter">
                      Closes:{" "}
                      {new Date(
                        event.registrations_close_at,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
