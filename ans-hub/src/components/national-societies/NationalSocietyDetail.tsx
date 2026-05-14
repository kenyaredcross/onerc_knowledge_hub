import { useParams, Link, Navigate } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Globe2,
  Users,
  GitBranch,
  MapPin,
  Mail,
  ExternalLink,
  Phone,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Newspaper,
  Calendar,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface NSSociety {
  name: string;
  national_society_name: string;
  abbreviation: string;
  logo: string | null;
  banner_image: string | null;
  country: string;
  region_name: string | null;
  about: string | null;
  mission_statement: string | null;
  key_focus_area: string | null;
  website: string | null;
  email: string | null;
  phone_number: string | null;
  physical_address: string | null;
  secretary_general_name: string | null;
  bio: string | null;
  active_vonteers: number | null;
  active_branches: number | null;
  organization_size_update_date: string | null;
  pillars: string[];
  social_media: Array<{ platform: string; url: string }>;
}

// ── Pillar helpers ──────────────────────────────────────────────────────────
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

function pillarBg(p: string) {
  return PILLAR_BG[p] ?? "bg-gray-400";
}
function pillarBadge(p: string) {
  return `${PILLAR_BG[p] ?? "bg-gray-100"} ${PILLAR_TEXT[p] ?? "text-gray-700"}`;
}

// ── Skeleton block ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-dash-navy/10 ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <Skeleton className="h-24 rounded-none" />
          <div className="px-5 pb-5 pt-4 space-y-3">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded border border-gray-200 p-5 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="text-center p-2">
      <div className="text-lg font-bold text-gray-900">
        {value != null ? value.toLocaleString() : "—"}
      </div>
      <div className="text-[10px] text-gray-500 leading-tight">{label}</div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function NationalSocietyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const decodedName = slug ? decodeURIComponent(slug) : "";

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.national_society.get_national_society_detail",
    { name: decodedName },
    // Only fetch when we have a name
    decodedName ? undefined : null,
  );

  const society: NSSociety | null = data?.message || null;

  // ── Guard: no slug ──────────────────────────────────────────────────────
  if (!slug) return <Navigate to="/national-societies" replace />;

  // ── Guard: not found (404 from Frappe) ──────────────────────────────────
  if (!isLoading && error && (error as any)?.httpStatus === 404) {
    return <Navigate to="/national-societies" replace />;
  }

  const primaryPillar = society?.pillars?.[0] ?? "";

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Back navigation */}
        <Link
          to="/national-societies"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-dash-red transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to National Societies
        </Link>

        {/* Error banner */}
        {error && !isLoading && (
          <div className="mb-6 bg-white rounded border border-red-200 p-6 flex items-center gap-4 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Failed to load society details</p>
              <p className="text-xs text-red-500 mt-0.5">
                {(error as any)?.message || "An unexpected error occurred."}
              </p>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && <DetailSkeleton />}

        {/* Content */}
        {!isLoading && society && (
          <div className="grid gap-6 lg:grid-cols-12">

            {/* ── Left sidebar ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Society Profile Card */}
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                {/* Banner */}
                {society.banner_image ? (
                  <img
                    src={society.banner_image}
                    alt={society.national_society_name}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-24 bg-dash-navy relative overflow-hidden`}
                  >
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 30% 50%, white 2px, transparent 2px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <div className="absolute bottom-3 right-4 text-white/20 text-4xl font-bold">
                      {(society.abbreviation || society.national_society_name).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Avatar + identity */}
                <div className="px-5 pb-5 -mt-9">
                  <div className="mb-3">
                    {society.logo ? (
                      <img
                        src={society.logo}
                        alt={society.abbreviation}
                        className="h-[72px] w-[72px] rounded-xl border-4 border-white shadow-sm object-contain bg-white p-1"
                      />
                    ) : (
                      <div
                        className={`h-[72px] w-[72px] rounded-xl border-4 border-white shadow-sm bg-dash-navy flex items-center justify-center text-white font-bold text-2xl`}
                      >
                        {(society.abbreviation || society.national_society_name).charAt(0)}
                      </div>
                    )}
                  </div>

                  <h1 className="font-bold text-gray-900 text-lg leading-snug mb-0.5">
                    {society.national_society_name}
                  </h1>

                  {society.abbreviation && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {society.abbreviation}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {society.region_name && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {society.region_name}
                      </span>
                    )}
                    {society.country && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {society.country}
                      </span>
                    )}
                  </div>

                  {/* Key stats */}
                  <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-1 divide-x divide-gray-100">
                    <StatCard label="Branches" value={society.active_branches} />
                    <StatCard label="Volunteers" value={society.active_vonteers} />
                  </div>
                </div>
              </div>

              {/* Contact card */}
              {(society.email || society.phone_number || society.website || society.physical_address) && (
                <div className="bg-white rounded border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Contact</h3>
                  <div className="space-y-2.5">
                    {society.email && (
                      <a
                        href={`mailto:${society.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-dash-red transition-colors"
                      >
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{society.email}</span>
                      </a>
                    )}
                    {society.phone_number && (
                      <a
                        href={`tel:${society.phone_number}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-dash-red transition-colors"
                      >
                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>{society.phone_number}</span>
                      </a>
                    )}
                    {society.physical_address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-xs leading-snug">{society.physical_address}</span>
                      </div>
                    )}
                    {society.website && (
                      <a
                        href={
                          society.website.startsWith("http")
                            ? society.website
                            : `https://${society.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-dash-red hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span>Visit website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Pillar Alignment */}
              {society.pillars.length > 0 && (
                <div className="bg-white rounded border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Pillar Alignment</h3>
                  <div className="space-y-2">
                    {society.pillars.map((p, idx) => (
                      <div key={p} className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${pillarBg(p)}`}
                        />
                        <span className="text-sm text-gray-700">{p}</span>
                        {idx === 0 && (
                          <span className="ml-auto text-[9px] font-bold uppercase text-gray-400">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secretary General */}
              {society.secretary_general_name && (
                <div className="bg-white rounded border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Leadership</h3>
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full bg-dash-navy flex items-center justify-center text-white font-bold text-base shrink-0`}>
                      {society.secretary_general_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {society.secretary_general_name}
                      </p>
                      <p className="text-xs text-gray-500">Secretary General</p>
                      {society.bio && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                          {society.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Main Content ── */}
            <div className="lg:col-span-8 space-y-4">

              {/* Pillar banner + About */}
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                {primaryPillar && (
                  <div className={`px-6 py-3 ${pillarBg(primaryPillar)}`}>
                    <span className="text-xs font-semibold uppercase tracking-widest text-white">
                      {primaryPillar} · Primary Focus
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                  {society.about ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: society.about }}
                    />
                  ) : society.mission_statement ? (
                    <p className="text-sm leading-relaxed text-gray-700">
                      {society.mission_statement}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No description available yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Mission + Key Focus */}
              {(society.mission_statement || society.key_focus_area) && (
                <div className="bg-white rounded border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-dash-red" />
                    <h2 className="font-bold text-gray-900">Mission & Focus</h2>
                  </div>
                  <div className="space-y-4">
                    {society.mission_statement && (
                      <div className="flex items-start gap-3 p-4 rounded bg-gray-50 border border-gray-200">
                        <CheckCircle2
                          className={`h-5 w-5 shrink-0 mt-0.5 ${pillarBg(primaryPillar).replace("bg-", "text-")}`}
                          style={{ color: undefined }}
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            Mission Statement
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {society.mission_statement}
                          </p>
                        </div>
                      </div>
                    )}
                    {society.key_focus_area && (
                      <div className="flex items-start gap-3 p-4 rounded bg-gray-50 border border-gray-200">
                        <Globe2 className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            Key Focus Area
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {society.key_focus_area}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Organisation Size */}
              {(society.active_branches != null || society.active_vonteers != null) && (
                <div className="bg-white rounded border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900 mb-4">Organisation Size</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {society.active_branches != null && (
                      <div className="flex items-center gap-4 p-4 rounded bg-gray-50 border border-gray-200">
                        <div className={`h-10 w-10 rounded ${pillarBg(primaryPillar)} flex items-center justify-center`}>
                          <GitBranch className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {society.active_branches.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Active Branches</div>
                        </div>
                      </div>
                    )}
                    {society.active_vonteers != null && (
                      <div className="flex items-center gap-4 p-4 rounded bg-gray-50 border border-gray-200">
                        <div className={`h-10 w-10 rounded ${pillarBg(primaryPillar)} flex items-center justify-center`}>
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {society.active_vonteers.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Active Volunteers</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {society.organization_size_update_date && (
                    <p className="text-xs text-gray-400 mt-3">
                      Last updated: {society.organization_size_update_date}
                    </p>
                  )}
                </div>
              )}

              {/* Social media */}
              {society.social_media.length > 0 && (
                <div className="bg-white rounded border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="h-4 w-4 text-dash-red" />
                    <h2 className="font-bold text-gray-900">Social Media</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {society.social_media.map((sm, i) => (
                      sm.url && (
                        <a
                          key={i}
                          href={sm.url.startsWith("http") ? sm.url : `https://${sm.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:border-dash-red/40 hover:text-dash-red transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {sm.platform || sm.url}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
