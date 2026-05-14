import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import {
  ArrowUpRight,
  BookOpen,
  Globe2,
  Calendar,
  Newspaper,
  Clock,
  MapPin,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { pillarColor } from "../../lib/site-data";

export default function Home() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard overview from API
  const { data: overviewData, error, isLoading: dataLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.overview.get_dashboard_overview"
  );

  useEffect(() => {
    if (overviewData) {
      // Handle Frappe's response format - data is nested under message
      const data = overviewData.message || overviewData;
      setDashboardData(data);
      setIsLoading(false);
    } else if (error) {
      console.error("Failed to load dashboard data:", error);
      setIsLoading(false);
    }
  }, [overviewData, error]);

  // Use API data
  const stats = [
    {
      value: dashboardData?.stats?.national_societies ?? 0,
      label: "National Societies",
      icon: Globe2
    },
    {
      value: dashboardData?.stats?.active_users ?? 0,
      label: "Active Users",
      icon: UserCheck
    },
    {
      value: dashboardData?.stats?.pending_users ?? 0,
      label: "Pending Users",
      icon: UserPlus
    },
    {
      value: dashboardData?.stats?.news_updates ?? 0,
      label: "Network Updates",
      icon: Newspaper
    },
  ];

  // Use API data if available, otherwise show empty arrays
  const recentNews = dashboardData?.recent_data?.recent_news || [];
  const upcomingEvents = dashboardData?.recent_data?.upcoming_events || [];
  const featuredPubs = dashboardData?.recent_data?.featured_resources || [];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-dash-navy via-blue-900 to-dash-red p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-yellow-300">
              Dashboard Overview
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Welcome back, Alliance!
          </h1>
          <p className="text-lg text-white/90 max-w-3xl">
            Empowering National Societies across Africa through peer learning, shared resources, and collaborative growth
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded border border-gray-200 p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded bg-gray-200"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded bg-dash-navy text-white">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent News - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent News & Stories</h2>
                <p className="text-sm text-gray-600">Latest updates from the network</p>
              </div>
              <Link
                to="/news"
                className="flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* News Cards */}
            <div className="space-y-4">
              {recentNews.length > 0 ? (
                recentNews.map((n) => (
                  <Link
                    key={n.slug || n.name}
                    to={`/news/${n.slug || n.name}`}
                    className="group block bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex">
                      {/* Color bar */}
                      <div className={`w-2 ${pillarColor[n.color || 'blue']}`}></div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${pillarColor[n.color || 'blue']}`}>
                            {n.tag || 'Update'}
                          </span>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {n.date || n.published_date || 'Recent'}
                            </span>
                            {(n.place || n.location) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {n.place || n.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-dash-red transition-colors">
                          {n.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{n.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded border border-gray-200 p-8 text-center">
                  <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent news available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                <Link to="/events" className="text-xs font-medium text-dash-red hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((e) => (
                    <Link
                      key={e.slug || e.name}
                      to={`/events/${e.slug || e.name}`}
                      className="block p-3 rounded bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded bg-white border-2 border-dash-red">
                          <span className="text-xl font-bold text-gray-900 leading-none">{e.day || '01'}</span>
                          <span className="text-[9px] font-bold uppercase text-dash-red mt-0.5">{e.month || 'JAN'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{e.title}</h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {e.time || 'TBA'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    No upcoming events
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/create/knowledge"
                  className="flex items-center gap-3 p-3 rounded bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Add Knowledge Resource</span>
                </Link>
                <Link
                  to="/create/news"
                  className="flex items-center gap-3 p-3 rounded bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  <Newspaper className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Share News Story</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Resources Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Featured Resources</h2>
              <p className="text-sm text-gray-600">Tools, reports & learning materials</p>
            </div>
            <Link
              to="/knowledge"
              className="flex items-center gap-2 px-4 py-2 bg-dash-navy text-white rounded hover:bg-blue-900 transition-colors text-sm font-medium"
            >
              Browse Library
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPubs.length > 0 ? (
              featuredPubs.map((pub) => (
                <div
                  key={pub.slug || pub.name}
                  className="bg-white rounded border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded ${pillarColor[pub.pillar || 'blue']}`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 mb-2">
                        {pub.category || 'Resource'}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                        {pub.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-4">{pub.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{pub.fileType || pub.file_type || 'PDF'}</span>
                    <span>{pub.date || pub.published_date || 'Recent'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded border border-gray-200 p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">No featured resources available</p>
                <p className="text-sm text-gray-400">Check back later for knowledge resources</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
