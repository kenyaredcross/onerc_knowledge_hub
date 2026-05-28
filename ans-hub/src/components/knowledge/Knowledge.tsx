import { useFrappeGetCall } from "frappe-react-sdk";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Folder,
  Grid3X3,
  List,
  Loader2,
  MoreVertical,
  Plus,
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
  author_name?: string;
  author_national_society?: string;
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

const getLanguageName = (code: string | undefined | null) => {
  if (!code) return "N/A";

  const languages: Record<string, string> = {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "ar": "Arabic",
    "sw": "Swahili",
    "am": "Amharic",
    "ha": "Hausa",
    "yo": "Yoruba",
    "zu": "Zulu",
    "xh": "Xhosa",
    "st": "Sotho",
    "tn": "Tswana",
    "ts": "Tsonga",
    "ss": "Swazi",
    "ve": "Venda",
    "nr": "Ndebele",
    "ny": "Chichewa",
    "sn": "Shona",
    "rw": "Kinyarwanda",
    "rn": "Kirundi",
    "ti": "Tigrinya",
    "om": "Oromo",
    "so": "Somali",
    "lg": "Luganda",
  };

  return languages[code.toLowerCase()] || code;
};

export default function Knowledge() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedResource, setSelectedResource] = useState<KnowledgeEntry | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: entriesData, isLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_entries",
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
            </div>
            <Link
              to="/create/knowledge"
              className="flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded-md text-sm font-semibold hover:bg-dash-red/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
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
                        <div className="truncate">
                          {entry.author_national_society || entry.author_name || "Unknown"}
                        </div>
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
                  <p className="text-xs font-medium text-gray-500">
                    {selectedResource.author_national_society ? "National Society" : "Author"}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedResource.author_national_society || selectedResource.author_name || "Unknown"}
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
                    {getLanguageName(selectedResource.language)}
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
