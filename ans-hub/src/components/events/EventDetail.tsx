import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { events } from "../../lib/site-data";

const formatBadge: Record<string, string> = {
  Webinar: "bg-blue-100 text-blue-700",
  "In-person": "bg-green-100 text-green-700",
  Hybrid: "bg-purple-100 text-purple-700",
};

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const event = events.find((e) => e.slug === slug);

  if (!event) return <Navigate to="/events" replace />;

  return (
    <div className="min-h-full bg-dash-bg p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        <div className="rounded-xl bg-white border border-dash-border shadow-sm overflow-hidden">
          {/* Header strip */}
          <div className="border-b border-dash-border bg-dash-navy px-6 py-5 flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-white/10 text-white">
              <span className="font-display text-2xl font-bold leading-none">{event.day}</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-red-400">{event.month}</span>
            </div>
            <div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${formatBadge[event.format]}`}>
                {event.format}
              </span>
              <h1 className="mt-2 font-display text-xl font-semibold text-white leading-snug">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {event.day} {event.month} {event.year}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {event.location}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">{event.description}</p>

            <div className="mt-8 rounded-lg border border-dash-border bg-dash-bg p-5">
              <h3 className="font-display text-base font-semibold text-gray-900 mb-2">
                Register for this event
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Open to members of the Localisation Hub network. Sign in to register or contact the secretariat.
              </p>
              <button className="rounded-md bg-dash-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                Register now
              </button>
            </div>
          </div>
        </div>

        {/* More events */}
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            More upcoming events
          </h3>
          <div className="space-y-2.5">
            {events
              .filter((e) => e.slug !== event.slug)
              .slice(0, 3)
              .map((e) => (
                <Link
                  key={e.slug}
                  to={`/events/${e.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-dash-border bg-white p-4 shadow-sm transition-all hover:border-dash-red/40 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-dash-navy text-white">
                    <span className="font-display text-base font-bold leading-none">{e.day}</span>
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-red-400">{e.month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-dash-red line-clamp-1">
                      {e.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-400">{e.type}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
