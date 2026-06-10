import { useMemo, useState } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Calendar,
  ExternalLink,
  Grid3x3,
  List,
  Loader2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { pillarColor } from "../../lib/site-data";
import { useTranslation } from 'react-i18next';

// ── Types ──────────────────────────────────────────────────────────────────
interface LearningResource {
  name: string;
  title: string;
  national_society: string | null;
  national_society_name: string | null;
  pillar: string | null;
  pillar_name: string | null;
  cover_image: string | null;
  views_count: number | null;
  type: string;
  external_platform_name: string | null;
  external_url: string | null;
  category: string | null;
  category_name: string | null;
  date_posted: string | null;
  summary: string | null;
  description: string | null;
}

interface LearningStats {
  total_resources: number;
  total_views: number;
  resources_by_pillar: Array<{ pillar_name: string; count: number }>;
  recent_resources: number;
}

// ── Pillar styling helpers ──────────────────────────────────────────────────
const PILLAR_MAP: Record<string, string> = {
  "Leadership & Governance": "leadership",
  "Branch Development": "branch",
  "Resource Mobilisation": "resource",
  "Finance Development": "finance",
};

function getPillarColorKey(pillarName: string | null): string {
  if (!pillarName) return "leadership";
  return PILLAR_MAP[pillarName] || "leadership";
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-dash-navy/10 ${className}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LearningHub() {
  const { t } = useTranslation(['learning', 'common']);
  const [query, setQuery] = useState("");
  const [activePillar, setActivePillar] = useState("All Pillars");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);

  const { data: resourcesData, isLoading: loadingResources, error: resourcesError } = useFrappeGetCall(
    "onerc_knowledge_hub.api.learning_hub.get_learning_resources",
    {}
  );

  const { data: statsData, isLoading: loadingStats } = useFrappeGetCall(
    "onerc_knowledge_hub.api.learning_hub.get_learning_stats",
    {}
  );

  const { data: pillarsData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.learning_hub.get_pillars",
    {}
  );

  const resources: LearningResource[] = useMemo(
    () => resourcesData?.message || [],
    [resourcesData]
  );

  const stats: LearningStats = useMemo(
    () => statsData?.message || { total_resources: 0, total_views: 0, resources_by_pillar: [], recent_resources: 0 },
    [statsData]
  );

  const pillars = useMemo(() => {
    const pillarList = pillarsData?.message || [];
    return ["All Pillars", ...pillarList.map((p: any) => p.pillar)];
  }, [pillarsData]);

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const matchPillar =
        activePillar === "All Pillars" || resource.pillar_name === activePillar;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        resource.title.toLowerCase().includes(q) ||
        resource.summary?.toLowerCase().includes(q) ||
        resource.category_name?.toLowerCase().includes(q) ||
        resource.pillar_name?.toLowerCase().includes(q);
      return matchPillar && matchQuery;
    });
  }, [resources, activePillar, query]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats Card */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-dash-navy to-dash-red" />
              <div className="px-4 pb-4 -mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-dash-navy flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{t('learning:pageTitle')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('learning:pageSubtitle')}</p>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('learning:totalResources')}</span>
                    {loadingStats ? (
                      <Skeleton className="h-4 w-8" />
                    ) : (
                      <span className="font-bold text-dash-red">{stats.total_resources}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">New This Month</span>
                    {loadingStats ? (
                      <Skeleton className="h-4 w-10" />
                    ) : (
                      <span className="font-bold text-dash-red">
                        {stats.recent_resources > 0 ? stats.recent_resources : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar Filter */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <h3 className="font-bold text-gray-900">{t('learning:filterByPillar')}</h3>
              </div>
              <div className="space-y-1">
                {pillars.map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePillar(p)}
                    className={[
                      "w-full flex items-center justify-between p-2 rounded text-left text-sm transition-colors",
                      activePillar === p
                        ? "bg-dash-red/10 text-dash-red font-semibold"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span>{p}</span>
                    <span className="text-xs text-gray-400">
                      {p === t('learning:allPillars')
                        ? resources.length
                        : resources.filter((r) => r.pillar_name === p).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-9 space-y-4">
            {/* Page Header */}
            <div className="bg-white rounded border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-dash-red" />
                <span className="text-xs font-bold uppercase tracking-wider text-dash-red">
                  Learning & Development
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('learning:pageTitle')}</h1>
              <p className="text-sm text-gray-600 mb-4">
                Access curated learning resources, courses, and training materials across all four pillars of the Localisation Hub.
              </p>

              {/* Search & View Controls */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('learning:searchPlaceholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dash-red/30 focus:border-dash-red transition"
                  />
                </div>
                <Link
                  to="/create/learning"
                  className="flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded-md text-sm font-semibold hover:bg-dash-red/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Link>
                <div className="flex gap-1 border border-gray-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === "grid"
                        ? "bg-dash-navy text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-dash-navy text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Error state */}
            {resourcesError && !loadingResources && (
              <div className="bg-white rounded border border-red-200 p-6 flex items-center gap-4 text-red-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Failed to load learning resources</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    {resourcesError?.message || "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {/* Results count */}
            {!loadingResources && !resourcesError && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">
                  Showing {filtered.length} of {resources.length} resources
                </span>
                {activePillar !== "All Pillars" && (
                  <span className="text-xs text-gray-400">· {activePillar}</span>
                )}
              </div>
            )}

            {/* Loading skeletons */}
            {loadingResources && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {[...Array(6)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Resource Cards - Grid View */}
            {!loadingResources && !resourcesError && viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((resource) => {
                  const pillarKey = getPillarColorKey(resource.pillar_name);
                  return (
                    <button
                      key={resource.name}
                      onClick={() => setSelectedResource(resource)}
                      className="group bg-white rounded border border-gray-200 overflow-hidden hover:shadow-lg transition-all text-left w-full"
                    >
                      {/* Cover Image */}
                      <div className={`relative h-48 ${pillarColor[pillarKey]} overflow-hidden`}>
                        {resource.cover_image ? (
                          <img
                            src={resource.cover_image}
                            alt={resource.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <GraduationCap className="h-16 w-16 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex gap-2 flex-wrap">
                            {resource.pillar_name && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white`}>
                                {resource.pillar_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 group-hover:text-dash-red transition-colors mb-2 line-clamp-2">
                          {resource.title}
                        </h3>

                        {resource.summary && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                            {resource.summary}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          {resource.views_count != null && (
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              {resource.views_count}
                            </span>
                          )}
                          {resource.date_posted && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(resource.date_posted).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {resource.external_platform_name && (
                          <div className="pt-3 border-t border-gray-100">
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                              <ExternalLink className="h-3.5 w-3.5" />
                              {resource.external_platform_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="col-span-full bg-white rounded border border-gray-200 p-12 text-center">
                    <GraduationCap className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No learning resources match your search.
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setActivePillar("All Pillars");
                      }}
                      className="mt-3 text-xs text-dash-red hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resource Cards - List View */}
            {!loadingResources && !resourcesError && viewMode === "list" && (
              <div className="space-y-3">
                {filtered.map((resource) => {
                  const pillarKey = getPillarColorKey(resource.pillar_name);
                  return (
                    <button
                      key={resource.name}
                      onClick={() => setSelectedResource(resource)}
                      className="group flex gap-4 bg-white rounded border border-gray-200 overflow-hidden hover:shadow-lg transition-all p-4 text-left w-full"
                    >
                      {/* Thumbnail */}
                      <div className={`flex-shrink-0 w-32 h-32 rounded ${pillarColor[pillarKey]} overflow-hidden`}>
                        {resource.cover_image ? (
                          <img
                            src={resource.cover_image}
                            alt={resource.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <GraduationCap className="h-12 w-12 text-white/30" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-dash-red transition-colors line-clamp-1">
                            {resource.title}
                          </h3>
                          {resource.pillar_name && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 flex-shrink-0">
                              {resource.pillar_name}
                            </span>
                          )}
                        </div>

                        {resource.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {resource.summary}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {resource.external_platform_name && (
                            <span className="flex items-center gap-1.5">
                              <ExternalLink className="h-3.5 w-3.5" />
                              {resource.external_platform_name}
                            </span>
                          )}
                          {resource.views_count != null && (
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5" />
                              {resource.views_count}
                            </span>
                          )}
                          {resource.date_posted && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(resource.date_posted).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="bg-white rounded border border-gray-200 p-12 text-center">
                    <GraduationCap className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No learning resources match your search.
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setActivePillar("All Pillars");
                      }}
                      className="mt-3 text-xs text-dash-red hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedResource.title}
                </h2>
                {selectedResource.pillar_name && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-dash-red/10 text-dash-red">
                    {selectedResource.pillar_name}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Cover Image */}
              {selectedResource.cover_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedResource.cover_image}
                    alt={selectedResource.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Summary */}
              {selectedResource.summary && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Summary</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedResource.summary}
                  </p>
                </div>
              )}

              {/* Description */}
              {selectedResource.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedResource.description}
                  </p>
                </div>
              )}

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {selectedResource.external_platform_name && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Platform</p>
                    <p className="text-sm text-gray-900">{selectedResource.external_platform_name}</p>
                  </div>
                )}
                {selectedResource.date_posted && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Posted</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedResource.date_posted).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedResource.views_count != null && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Views</p>
                    <p className="text-sm text-gray-900">{selectedResource.views_count}</p>
                  </div>
                )}
                {selectedResource.category_name && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Category</p>
                    <p className="text-sm text-gray-900">{selectedResource.category_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with External Link Button */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <a
                href={selectedResource.external_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-dash-red text-white rounded-lg font-semibold hover:bg-dash-red/90 transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                Visit External Resource
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
