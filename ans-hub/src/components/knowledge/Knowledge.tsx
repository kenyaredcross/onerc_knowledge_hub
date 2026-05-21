import { useFrappeGetCall } from "frappe-react-sdk";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Grid3X3,
  Info,
  List,
  Loader2,
  MapPin,
  MoreVertical,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  contributing_ns: any[];
  uploaded_by: string;
  status: string;
  published_date: string | null;
  download_count: number;
  view_count: number;
  is_highlighted?: boolean;
  route?: string;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "Publication":
      return BookOpen;
    case "Report":
      return FileText;
    case "Tools & Templates":
      return Folder;
    default:
      return FileText;
  }
};

const getResourceColor = (type: string) => {
  switch (type) {
    case "Publication":
      return "text-blue-600 bg-blue-50";
    case "Report":
      return "text-emerald-600 bg-emerald-50";
    case "Tools & Templates":
      return "text-purple-600 bg-purple-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export default function Knowledge() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedResource, setSelectedResource] = useState<KnowledgeEntry | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: entriesData, isLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_entries",
    {},
  );

  const { data: eventsData, isLoading: eventsLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.events.get_events",
    {},
  );

  const entries: KnowledgeEntry[] = useMemo(
    () => entriesData?.message || [],
    [entriesData],
  );

  const filteredEntries = useMemo(() => {
    if (filterType === "all") return entries;
    return entries.filter((e) => e.resource_type === filterType);
  }, [entries, filterType]);

  const upcomingEvents = useMemo(() => {
    const result = eventsData?.message || {};
    return result.upcoming || [];
  }, [eventsData]);

  const featuredResources = useMemo(() => {
    return entries.filter((e) => e.is_highlighted).slice(0, 4);
  }, [entries]);

  // Get folder types for filtering
  const folderTypes = useMemo(() => {
    const types = ["Publication", "Report", "Tools & Templates"];
    return types.map((type) => ({
      name: type,
      count: entries.filter((e) => e.resource_type === type).length,
    }));
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-50">
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Upcoming Events Section */}
        {!eventsLoading && upcomingEvents.length > 0 && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                to="/events"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event: any) => (
                <Link
                  key={event.name}
                  to={`/events/${event.route}`}
                  className="group flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-600 text-white">
                    <div className="text-xl font-bold">
                      {new Date(event.start_date).getDate()}
                    </div>
                    <div className="text-[10px] font-bold uppercase">
                      {new Date(event.start_date).toLocaleString("default", {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.start_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue || event.medium}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Resources Section */}
        {featuredResources.length > 0 && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Featured Resources</h2>
              <p className="text-sm text-gray-500">Tools, reports & learning materials</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredResources.map((resource) => {
                const Icon = getResourceIcon(resource.resource_type);
                return (
                  <button
                    key={resource.name}
                    onClick={() => setSelectedResource(resource)}
                    className="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div
                      className={`mb-3 flex h-20 w-full items-center justify-center rounded-lg ${getResourceColor(resource.resource_type)}`}
                    >
                      <Icon className="h-10 w-10" />
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                      {resource.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-xs text-gray-500">
                      {resource.summary || resource.description?.replace(/<[^>]*>/g, "").substring(0, 80)}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-xs font-medium text-gray-600">
                        {resource.resource_type}
                      </span>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-4 flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilterType("all")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              filterType === "all"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Files ({entries.length})
          </button>
          {folderTypes.map((folder) => (
            <button
              key={folder.name}
              onClick={() => setFilterType(folder.name)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                filterType === folder.name
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {folder.name} ({folder.count})
            </button>
          ))}
        </div>

        {/* Files - List or Grid View */}
        {filteredEntries.length > 0 ? (
          viewMode === "list" ? (
            // List View
            <div className="rounded-lg border border-gray-200 bg-white">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-4 py-3 text-xs font-medium text-gray-500">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Last Modified</div>
                <div className="col-span-2">File Size</div>
                <div className="col-span-1"></div>
              </div>

              {/* File Rows */}
              <div className="divide-y divide-gray-100">
                {filteredEntries.map((entry) => {
                  const Icon = getResourceIcon(entry.resource_type);
                  return (
                    <button
                      key={entry.name}
                      onClick={() => setSelectedResource(entry)}
                      className="grid w-full grid-cols-12 gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${getResourceColor(entry.resource_type)}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {entry.title}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {entry.resource_type}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {entry.uploaded_by || "Unknown"}
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {entry.published_date
                          ? new Date(entry.published_date).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-gray-600">
                        {entry.download_count || 0} downloads
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button className="rounded p-1 hover:bg-gray-100">
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredEntries.map((entry) => {
                const Icon = getResourceIcon(entry.resource_type);
                return (
                  <button
                    key={entry.name}
                    onClick={() => setSelectedResource(entry)}
                    className="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div
                      className={`mb-3 flex h-24 w-full items-center justify-center rounded-lg ${getResourceColor(entry.resource_type)}`}
                    >
                      <Icon className="h-12 w-12" />
                    </div>
                    <p className="mb-1 truncate text-sm font-medium text-gray-900">
                      {entry.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {entry.resource_type}
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-xs text-gray-400">
                        {entry.published_date
                          ? new Date(entry.published_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <button className="rounded p-1 hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white py-20 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">No files found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-2xl">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute right-4 top-4 rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              <div className="mb-6 flex items-start gap-4">
                {(() => {
                  const Icon = getResourceIcon(selectedResource.resource_type);
                  return (
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${getResourceColor(selectedResource.resource_type)}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedResource.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedResource.resource_type}
                  </p>
                </div>
              </div>

              {selectedResource.summary && (
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-gray-700">{selectedResource.summary}</p>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Owner</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResource.uploaded_by || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Published</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResource.published_date
                      ? new Date(selectedResource.published_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Language</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResource.language || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Downloads</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResource.download_count || 0}
                  </p>
                </div>
              </div>

              {selectedResource.description && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Description
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedResource.description }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                {selectedResource.file_attachment && (
                  <a
                    href={selectedResource.file_attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                )}
                {selectedResource.external_url && (
                  <a
                    href={selectedResource.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Link
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
