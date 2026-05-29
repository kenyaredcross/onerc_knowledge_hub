import { useFrappeGetCall } from "frappe-react-sdk";
import {
  Award,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const formatBadge = {
  Webinar: "bg-blue-50 text-blue-700 border border-blue-200",
  "In-person": "bg-green-50 text-green-700 border border-green-200",
  Hybrid: "bg-purple-50 text-purple-700 border border-purple-200",
};

const formatColor = {
  Webinar: "bg-blue-500",
  "In-person": "bg-green-500",
  Hybrid: "bg-purple-500",
};

export default function EventsIndex() {
  const [showPastEvents, setShowPastEvents] = useState(false);

  const { data, isLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.events.get_events",
    {},
  );

  const { data: pastEventsData, isLoading: pastEventsLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.events.get_past_events",
    {},
    showPastEvents ? undefined : { enabled: false } // Only fetch when needed
  );

  const { featuredEvent, upcomingEvents } = useMemo(() => {
    const result = data?.message || {};
    return {
      featuredEvent: result.featured || null,
      upcomingEvents: result.upcoming || [],
    };
  }, [data]);

  const pastEvents = useMemo(() => {
    return pastEventsData?.message || [];
  }, [pastEventsData]);

  const truncateText = (text: string, limit: number) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  if (!featuredEvent) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-gray-500">No upcoming events found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white pb-12">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-dash-red" />
            <span className="text-[10px] font-black uppercase tracking-wider text-dash-red">
              Events &amp; Gatherings
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Convening the network
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-3.5 w-3.5 text-dash-red" />
            <span className="text-[10px] font-black uppercase tracking-wider text-dash-red">
              Featured Event
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl">
            <div className="grid lg:grid-cols-12 gap-0">
              <div
                className={`relative lg:col-span-4 h-56 lg:h-auto ${formatColor[featuredEvent.medium] || "bg-gray-800"} flex items-center justify-center overflow-hidden`}
              >
                {featuredEvent.banner_image && (
                  <img
                    src={featuredEvent.banner_image}
                    className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                    alt=""
                  />
                )}
                <div className="relative text-center text-white z-10 p-4">
                  <div className="text-7xl font-black leading-none tracking-tighter">
                    {new Date(featuredEvent.start_date).getDate()}
                  </div>
                  <div className="text-lg font-bold uppercase tracking-[0.2em]">
                    {new Date(featuredEvent.start_date).toLocaleString(
                      "default",
                      { month: "short" },
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${formatBadge[featuredEvent.medium]}`}
                  >
                    {featuredEvent.medium}
                  </span>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {featuredEvent.start_time}{" "}
                    ({featuredEvent.time_zone})
                  </span>
                </div>

                <Link to={`/events/${featuredEvent.route}`}>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 hover:text-dash-red transition-colors leading-tight">
                    {featuredEvent.title}
                  </h2>
                </Link>

                <p className="mt-4 text-gray-600 leading-relaxed text-sm lg:text-base">
                  {truncateText(featuredEvent.short_description, 220)}
                  {featuredEvent.short_description?.length > 220 && (
                    <Link
                      to={`/events/${featuredEvent.route}`}
                      className="ml-2 text-dash-red font-bold hover:underline inline-flex items-center gap-1 text-sm"
                    >
                      Read more <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </p>

                {featuredEvent.featured_speakers?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> Featured Speakers
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {featuredEvent.featured_speakers
                        .slice(0, 2)
                        .map((speaker: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            {speaker.display_image && (
                              <img
                                src={speaker.display_image}
                                className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-gray-50"
                                alt={speaker.display_name}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 truncate">
                                {speaker.display_name}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate">
                                {speaker.designation}
                              </div>
                              <div className="text-[9px] text-dash-red font-bold uppercase truncate">
                                {speaker.company}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {featuredEvent.event_sponsors?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" /> Event Sponsors
                    </div>
                    <div className="flex flex-wrap gap-6 items-center opacity-70 hover:opacity-100 transition-opacity">
                      {featuredEvent.event_sponsors.map(
                        (sponsor: any, i: number) =>
                          sponsor.logo && (
                            <img
                              key={i}
                              src={sponsor.logo}
                              className="h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                              alt={sponsor.sponsor_name}
                              title={`${sponsor.sponsor_name} (${sponsor.tier})`}
                            />
                          ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Toggle between Upcoming and Past Events */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {showPastEvents ? "Past Events" : "Upcoming Schedule"}
            </h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowPastEvents(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showPastEvents
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setShowPastEvents(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  showPastEvents
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Events List */}
          {showPastEvents ? (
            // Past Events
            pastEventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-dash-red" />
              </div>
            ) : pastEvents.length > 0 ? (
              <div className="grid gap-4">
                {pastEvents.map((e: any) => (
                  <Link
                    key={e.name}
                    to={`/events/${e.route}`}
                    className="group flex items-start gap-6 rounded border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-dash-red/30"
                  >
                    {e.banner_image && (
                      <div className="relative h-32 md:w-48 md:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <img
                          src={e.banner_image}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          alt=""
                        />
                      </div>
                    )}

                    <div className="flex-1 py-0.5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-gray-500 uppercase">
                          {new Date(e.start_date).toLocaleDateString("default", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${formatBadge[e.medium] || "bg-gray-100 text-gray-700"}`}
                        >
                          {e.medium}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-dash-red transition-colors mb-2">
                        {e.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                        {truncateText(e.short_description, 120)}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-dash-red" />{" "}
                          {e.venue || "Online"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> {e.start_time}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No past events found.</p>
              </div>
            )
          ) : (
            // Upcoming Events
            <div className="grid gap-4">
              {upcomingEvents.map((e: any) => (
                <Link
                  key={e.name}
                  to={`/events/${e.route}`}
                  className="group flex items-start gap-6 rounded border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-dash-red/30"
                >
                  {e.banner_image && (
                    <div className="relative h-32 md:w-48 md:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                      <img
                        src={e.banner_image}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                    </div>
                  )}

                  <div className="flex-1 py-0.5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-dash-red uppercase">
                        {new Date(e.start_date).toLocaleDateString("default", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${formatBadge[e.medium] || "bg-gray-100 text-gray-700"}`}
                      >
                        {e.medium}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-dash-red transition-colors mb-2">
                      {e.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {truncateText(e.short_description, 120)}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-dash-red" />{" "}
                        {e.venue || "Online"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {e.start_time}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
