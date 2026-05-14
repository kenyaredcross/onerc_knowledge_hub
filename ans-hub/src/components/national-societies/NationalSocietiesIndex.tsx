import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";
import {
  Globe2,
  Users,
  GitBranch,
  Filter,
  Search,
  ArrowUpRight,
  Clock3,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface NSSociety {
  name: string;
  national_society_name: string;
  abbreviation: string;
  logo: string | null;
  country: string;
  region_name: string | null;
  about: string | null;
  mission_statement: string | null;
  key_focus_area: string | null;
  website: string | null;
  email: string | null;
  phone_number: string | null;
  secretary_general_name: string | null;
  active_vonteers: number | null;
  active_branches: number | null;
  organization_size_update_date: string | null;
  pillars: string[]; // list of pillar names e.g. ["Leadership", "Finance"]
}

// ── Pillar styling helpers ──────────────────────────────────────────────────
const PILLAR_BG: Record<string, string> = {
  Leadership: "bg-pillar-leadership",
  "Branch Development": "bg-pillar-branch",
  "Resource Mobilisation": "bg-pillar-resource",
  "Finance Development": "bg-pillar-finance",
};
const PILLAR_TEXT: Record<string, string> = {
  Leadership: "text-pillar-leadership-foreground",
  "Branch Development": "text-pillar-branch-foreground",
  "Resource Mobilisation": "text-pillar-resource-foreground",
  "Finance Development": "text-pillar-finance-foreground",
};
const PILLAR_BORDER_L: Record<string, string> = {
  Leadership: "border-l-4 border-pillar-leadership",
  "Branch Development": "border-l-4 border-pillar-branch",
  "Resource Mobilisation": "border-l-4 border-pillar-resource",
  "Finance Development": "border-l-4 border-pillar-finance",
};

function pillarBg(pillar: string) {
  return PILLAR_BG[pillar] ?? "bg-gray-400";
}
function pillarBadge(pillar: string) {
  return `${PILLAR_BG[pillar] ?? "bg-gray-100"} ${PILLAR_TEXT[pillar] ?? "text-gray-700"}`;
}
function societyBorderL(pillars: string[]) {
  return PILLAR_BORDER_L[pillars[0]] ?? "border-l-4 border-gray-200";
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-dash-navy/10 ${className}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="flex items-start gap-5 bg-white rounded border border-gray-200 p-5 border-l-4">
      <div className="flex-shrink-0">
        <Skeleton className="h-14 w-14 rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function NationalSocietiesIndex() {
  const [activeRegion, setActiveRegion] = useState("All Regions");
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.national_society.get_national_societies_list",
    {},
  );

  const societies: NSSociety[] = useMemo(
    () => data?.message || [],
    [data],
  );

  // Derive regions dynamically
  const regions = useMemo(() => {
    const unique = Array.from(
      new Set(societies.map((s) => s.region_name).filter(Boolean)),
    ) as string[];
    return ["All Regions", ...unique.sort()];
  }, [societies]);

  const filtered = useMemo(() => {
    return societies.filter((ns) => {
      const matchRegion =
        activeRegion === "All Regions" || ns.region_name === activeRegion;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        ns.national_society_name.toLowerCase().includes(q) ||
        ns.country?.toLowerCase().includes(q) ||
        ns.region_name?.toLowerCase().includes(q) ||
        ns.abbreviation?.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [societies, activeRegion, query]);

  const totalVolunteers = useMemo(
    () => societies.reduce((s, ns) => s + (ns.active_vonteers || 0), 0),
    [societies],
  );
  const totalBranches = useMemo(
    () => societies.reduce((s, ns) => s + (ns.active_branches || 0), 0),
    [societies],
  );

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Network Summary Card */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-dash-navy to-dash-red" />
              <div className="px-4 pb-4 -mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-dash-navy flex items-center justify-center">
                    <Globe2 className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Alliance Network</h3>
                <p className="text-sm text-gray-600 mb-4">Localisation Hub · Africa</p>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member Societies</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-8" />
                    ) : (
                      <span className="font-bold text-dash-red">{societies.length}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Volunteers</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className="font-bold text-dash-red">
                        {totalVolunteers > 0
                          ? `${(totalVolunteers / 1000).toFixed(0)}k+`
                          : "—"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Branches</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-10" />
                    ) : (
                      <span className="font-bold text-dash-red">
                        {totalBranches > 0 ? totalBranches : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Region Filter */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <h3 className="font-bold text-gray-900">Filter by Region</h3>
              </div>
              <div className="space-y-1">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    className={[
                      "w-full flex items-center justify-between p-2 rounded text-left text-sm transition-colors",
                      activeRegion === r
                        ? "bg-dash-red/10 text-dash-red font-semibold"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span>{r}</span>
                    <span className="text-xs text-gray-400">
                      {r === "All Regions"
                        ? societies.length
                        : societies.filter((ns) => ns.region_name === r).length}
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
                <Globe2 className="h-5 w-5 text-dash-red" />
                <span className="text-xs font-bold uppercase tracking-wider text-dash-red">
                  Member Societies
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">National Societies</h1>
              <p className="text-sm text-gray-600 mb-4">
                Explore all member National Societies in the Localisation Hub Alliance — their
                profiles, pillar alignment, and contact information.
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, country, abbreviation or region…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dash-red/30 focus:border-dash-red transition"
                />
              </div>
            </div>

            {/* Error state */}
            {error && !isLoading && (
              <div className="bg-white rounded border border-red-200 p-6 flex items-center gap-4 text-red-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Failed to load National Societies</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    {error?.message || "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              </div>
            )}

            {/* Results count */}
            {!isLoading && !error && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">
                  Showing {filtered.length} of {societies.length} societies
                </span>
                {activeRegion !== "All Regions" && (
                  <span className="text-xs text-gray-400">· {activeRegion}</span>
                )}
              </div>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Society Cards */}
            {!isLoading && !error && (
              <div className="space-y-3">
                {filtered.map((ns) => (
                  <Link
                    key={ns.name}
                    to={`/national-societies/${encodeURIComponent(ns.name)}`}
                    className={[
                      "group flex items-start gap-5 bg-white rounded border border-gray-200 p-5 transition-all hover:shadow-md hover:border-dash-red/30",
                      societyBorderL(ns.pillars),
                    ].join(" ")}
                  >
                    {/* Logo / avatar */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                      {ns.logo ? (
                        <img
                          src={ns.logo}
                          alt={ns.abbreviation}
                          className="h-14 w-14 rounded object-contain border border-gray-100 bg-white p-1"
                        />
                      ) : (
                        <div
                          className={`h-14 w-14 rounded bg-dash-navy flex items-center justify-center text-white font-bold text-xl`}
                        >
                          {(ns.abbreviation || ns.national_society_name).charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-base font-bold text-gray-900 group-hover:text-dash-red transition-colors leading-snug">
                            {ns.national_society_name}
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[ns.abbreviation, ns.region_name, ns.country]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-dash-red transition-colors shrink-0 mt-1" />
                      </div>

                      {/* Mission / about excerpt */}
                      {(ns.mission_statement || ns.about) && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                          {ns.mission_statement ||
                            ns.about?.replace(/<[^>]*>/g, "").slice(0, 200)}
                        </p>
                      )}

                      {/* Stats row */}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {ns.active_branches != null && (
                          <span className="flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5" />
                            {ns.active_branches} branches
                          </span>
                        )}
                        {ns.active_vonteers != null && (
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {ns.active_vonteers.toLocaleString()} volunteers
                          </span>
                        )}
                      </div>

                      {/* Pillar badges */}
                      {ns.pillars.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ns.pillars.map((p) => (
                            <span
                              key={p}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${pillarBadge(p)}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Updated date */}
                      {ns.organization_size_update_date && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500">
                            Organisation size updated{" "}
                            <span className="font-medium text-gray-700">
                              {ns.organization_size_update_date}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="bg-white rounded border border-gray-200 p-12 text-center">
                    <Globe2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No societies match your search.
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setActiveRegion("All Regions");
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
    </div>
  );
}
