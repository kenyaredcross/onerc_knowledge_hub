import { useFrappeGetCall } from "frappe-react-sdk";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  Filter,
  FolderOpen,
  Grid3x3,
  HardDrive,
  List,
  Search,
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
  contributing_ns: string;
  uploaded_by: string;
  status: string;
  published_date: string | null;
  download_count: number;
  route?: string;
}

interface CategoryEntry {
  name: string;
}

const resourceStyles: Record<string, string> = {
  Publication:
    "bg-blue-50 text-blue-700 border border-blue-200 shadow-blue-100",
  Report:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-100",
  "Tools & Templates":
    "bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-100",
};

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeResourceType, setActiveResourceType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const { data: entriesData, isLoading: entriesLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_entries",
    {},
  );

  const { data: categoriesData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_categories",
    {},
  );

  const entries: KnowledgeEntry[] = useMemo(
    () => entriesData?.message || [],
    [entriesData],
  );

  const categories: CategoryEntry[] = useMemo(
    () => categoriesData?.message || [],
    [categoriesData],
  );

  const resourceTypes = ["Publication", "Report", "Tools & Templates"];

  const stats = useMemo(
    () => [
      {
        label: "All Resources",
        value: entries.length.toString(),
        icon: FileText,
      },
      {
        label: "Publications",
        value: entries
          .filter((e) => e.resource_type === "Publication")
          .length.toString(),
        icon: BookOpen,
      },
      {
        label: "Templates",
        value: entries
          .filter((e) => e.resource_type === "Tools & Templates")
          .length.toString(),
        icon: FolderOpen,
      },
      {
        label: "Downloads",
        value: entries
          .reduce((acc, curr) => acc + (curr.download_count || 0), 0)
          .toString(),
        icon: HardDrive,
      },
    ],
    [entries],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesCategory =
        activeCategory === "All" || e.category === activeCategory;

      const matchesResourceType =
        activeResourceType === "All" || e.resource_type === activeResourceType;

      const matchesSearch =
        searchQuery === "" ||
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.summary?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesResourceType && matchesSearch;
    });
  }, [entries, activeCategory, activeResourceType, searchQuery]);

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
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                <BookOpen className="h-3.5 w-3.5" />
                Knowledge Repository
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
                Shared Resources & Publications
              </h1>

              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Explore reports, publications, templates, and shared knowledge
                resources from the localisation network.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-dash-navy/10">
                    <s.icon className="h-5 w-5 text-dash-navy" />
                  </div>

                  <div className="text-2xl font-black tracking-tight text-gray-900">
                    {s.value}
                  </div>

                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search resources, reports, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-14 pr-4 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Resource Type Filter */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 text-dash-red" />
            Resource Type
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveResourceType("All")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                activeResourceType === "All"
                  ? "bg-dash-red text-white shadow-lg shadow-dash-red/10"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Resources
            </button>

            {resourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveResourceType(type)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeResourceType === type
                    ? "bg-dash-red text-white shadow-lg shadow-dash-red/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="h-4 w-4 text-dash-red" />
              Categories
            </div>

            <button
              onClick={() => setActiveCategory("All")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                activeCategory === "All"
                  ? "bg-dash-navy text-white shadow-lg shadow-dash-navy/10"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeCategory === cat.name
                    ? "bg-dash-navy text-white shadow-lg shadow-dash-navy/10"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {filteredEntries.length}
                </span>{" "}
                resources
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === "card"
                    ? "bg-dash-navy text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === "list"
                    ? "bg-dash-navy text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Link
              to="/create/knowledge"
              className="inline-flex items-center gap-2 rounded-xl bg-dash-red px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:scale-105 hover:bg-red-700"
            >
              Add New
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {filteredEntries.length > 0 ? (
          viewMode === "card" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {filteredEntries.map((pub) => (
                <Link
                  key={pub.name}
                  to={`/knowledge/${pub.route || pub.name}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-dash-red/20 hover:shadow-2xl hover:shadow-dash-red/5"
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

                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl transition-transform duration-500 group-hover:scale-110">
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

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dash-red text-white transition-all duration-300 group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500">
                <div className="col-span-5">Resource</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Lang</div>
                <div className="col-span-2 text-right">Open</div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredEntries.map((pub) => (
                  <Link
                    key={pub.name}
                    to={`/knowledge/${pub.route || pub.name}`}
                    className="group grid grid-cols-12 items-center gap-4 px-6 py-5 transition-all hover:bg-gray-50"
                  >
                    <div className="col-span-5 flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-dash-navy/10">
                        <FileText className="h-5 w-5 text-dash-navy" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-dash-red">
                          {pub.title}
                        </h3>

                        <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                          {pub.summary}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                          resourceStyles[pub.resource_type] ||
                          "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {pub.resource_type}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm font-medium text-gray-600">
                      {pub.category}
                    </div>

                    <div className="col-span-1 text-sm font-semibold text-gray-600">
                      {pub.language || "-"}
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-dash-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all group-hover:translate-x-1">
                        Open
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-dash-red/10">
                <Search className="h-9 w-9 text-dash-red" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                No resources found
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                No resources match your current search or selected category.
              </p>

              <button
                onClick={() => {
                  setActiveCategory("All");
                  setActiveResourceType("All");
                  setSearchQuery("");
                }}
                className="mt-6 rounded-2xl bg-dash-navy px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-dash-red"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
