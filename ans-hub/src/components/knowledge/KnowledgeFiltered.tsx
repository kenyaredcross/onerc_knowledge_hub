import { useFrappeGetCall } from "frappe-react-sdk";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  FolderOpen,
  Grid3x3,
  ArrowLeft,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

interface KnowledgeEntry {
  name: string;
  title: string;
  resource_type: string;
  category: string;
  summary: string;
  description: string;
  file_attachment: string | null;
  external_url: string;
  language: string;
  contributing_ns: string;
  uploaded_by: string;
  status: string;
  published_date: string | null;
  download_count: number;
  route?: string;
}

const resourceStyles: Record<string, string> = {
  Publication:
    "bg-blue-50 text-blue-700 border border-blue-200 shadow-blue-100",
  Report:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-100",
  "Tools & Templates":
    "bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-100",
};

export default function KnowledgeFiltered() {
  const { type } = useParams<{ type: string }>();

  const { data: entriesData, isLoading: entriesLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_entries",
    {},
  );

  const entries: KnowledgeEntry[] = useMemo(
    () => entriesData?.message || [],
    [entriesData],
  );

  const getResourceTypeFromSlug = (slug?: string) => {
    switch (slug) {
      case "publications":
        return "Publication";
      case "reports":
        return "Report";
      case "templates":
        return "Tools & Templates";
      default:
        return "All";
    }
  };

  const getDisplayTitle = (slug?: string) => {
    switch (slug) {
      case "publications":
        return "Publications";
      case "reports":
        return "Reports";
      case "templates":
        return "Tools & Templates";
      default:
        return "All Resources";
    }
  };

  const activeResourceType = getResourceTypeFromSlug(type);

  const filteredEntries = useMemo(() => {
    if (activeResourceType === "All") {
      return entries;
    }
    return entries.filter((e) => e.resource_type === activeResourceType);
  }, [entries, activeResourceType]);

  if (entriesLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-dash-red border-t-transparent" />
          Loading knowledge repository...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-dash-red transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {getDisplayTitle(type)}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredEntries.length} resources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {filteredEntries.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEntries.map((pub) => (
              <Link
                key={pub.name}
                to={`/knowledge/${pub.route || pub.name}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-dash-red/20 hover:shadow-2xl hover:shadow-dash-red/5"
              >
                <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-dash-navy/5 via-white to-dash-red/5 p-8">
                  <div className="absolute right-4 top-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                        resourceStyles[pub.resource_type] ||
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {pub.resource_type}
                    </span>
                  </div>

                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl transition-transform duration-500 group-hover:scale-110">
                    <FileText className="h-11 w-11 text-dash-navy" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-dash-red">
                    <Calendar className="h-3.5 w-3.5" />
                    {pub.published_date || "No date"}
                  </div>

                  <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-dash-red">
                    {pub.title}
                  </h3>

                  <p className="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {pub.summary}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Language
                      </div>

                      <div className="mt-1 text-sm font-semibold text-gray-700">
                        {pub.language || "N/A"}
                      </div>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-dash-red text-white transition-all duration-300 group-hover:translate-x-1">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-dash-red/10">
                <Grid3x3 className="h-9 w-9 text-dash-red" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                No resources found
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                No resources match this filter.
              </p>

              <Link
                to="/knowledge"
                className="mt-6 rounded-xl bg-dash-navy px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-dash-red"
              >
                Back to Knowledge Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
