import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  ArrowUpRight,
  Users,
  Target,
  TrendingUp,
  ClipboardList,
  ExternalLink,
  Lock,
  MessageSquareText,
} from "lucide-react";
import { UserContext } from "../../contexts/UserContext";

// Roles allowed to view Financial Sustainability admin pages.
const FS_ROLES = ["LH FS Manager", "System Manager"];

function hasFsAccess(userData: any): boolean {
  const roles = userData?.roles?.map((r: any) => r.role) || [];
  return FS_ROLES.some((r) => roles.includes(r));
}

function NotAuthorized() {
  return (
    <div className="min-h-full bg-dash-bg flex items-center justify-center p-8">
      <div className="bg-white rounded border border-gray-200 p-10 shadow-sm text-center max-w-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <Lock className="h-7 w-7 text-dash-red" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Restricted area</h2>
        <p className="text-sm text-gray-600 mb-6">
          The Financial Sustainability dashboard is only available to users with the
          <span className="font-semibold"> LH FS Manager</span> role.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-4 py-2 bg-dash-navy text-white rounded hover:bg-blue-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  accent,
}: {
  value: any;
  label: string;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all ${
        accent ? "border-t-2 border-t-dash-red" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded bg-dash-navy text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function phaseBadge(phase: string) {
  const map: Record<string, string> = {
    Pre: "bg-blue-50 text-blue-700",
    Post: "bg-red-50 text-dash-red",
    Both: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
        map[phase] || map.Both
      }`}
    >
      {phase}
    </span>
  );
}

function DistributionBars({ dist }: { dist: any[] }) {
  const max = Math.max(...dist.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {dist.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between gap-3 text-xs mb-1">
            <span
              className={
                d.is_correct ? "font-semibold text-emerald-700" : "text-gray-700"
              }
            >
              {d.is_correct ? "✓ " : ""}
              {d.label}
            </span>
            <span className="text-gray-500 shrink-0 tabular-nums">{d.count}</span>
          </div>
          <div className="h-2 rounded bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded ${
                d.is_correct ? "bg-emerald-600" : "bg-dash-navy"
              }`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FinancialSustainabilityDashboard() {
  const { userData, isLoading: userLoading } = useContext(UserContext) as any;
  const [ns, setNs] = useState("");
  const [phase, setPhase] = useState("");

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.assessment.get_dashboard_data",
    { national_society: ns, phase },
  );

  if (userLoading) {
    return (
      <div className="min-h-full bg-dash-bg flex items-center justify-center p-8 text-gray-500">
        Loading…
      </div>
    );
  }
  if (!hasFsAccess(userData)) return <NotAuthorized />;

  const d: any = data?.message || {};
  const stats = d.stats || {};
  const questions: any[] = d.questions || [];
  const actions: any[] = d.action_items || [];
  const recent: any[] = d.recent || [];
  const societies: any[] = d.national_societies || [];

  const phaseChart = [
    { name: "Pre", value: stats.pre_average || 0 },
    { name: "Post", value: stats.post_average || 0 },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header band */}
      <div className="bg-gradient-to-r from-dash-navy via-blue-900 to-dash-red p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Hub
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-yellow-300">
                Peer Learning
              </span>
              <h1 className="text-3xl font-bold mt-1">
                Financial Sustainability Assessment
              </h1>
              <p className="text-white/85 mt-1">
                Responses and analytics across the pre & post peer-learning assessment.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/financial-sustainability/responses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium border border-white/20"
              >
                <ClipboardList className="h-4 w-4" /> All Responses
              </Link>
              <a
                href="/fs-assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dash-red hover:bg-red-600 rounded text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" /> Public Form
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              National Society
            </label>
            <select
              value={ns}
              onChange={(e) => setNs(e.target.value)}
              className="text-sm px-3 py-2 border border-gray-200 rounded bg-white min-w-[220px] focus:outline-none focus:border-dash-navy"
            >
              <option value="">All National Societies</option>
              {societies.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.national_society_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Phase
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="text-sm px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:border-dash-navy"
            >
              <option value="">Pre & Post</option>
              <option value="Pre">Pre-Assessment</option>
              <option value="Post">Post-Assessment</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            Could not load dashboard data.
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded border border-gray-200 p-6 shadow-sm animate-pulse h-32"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                value={stats.total_responses ?? 0}
                label="Total Responses"
                icon={Users}
                accent
              />
              <StatCard
                value={`${stats.average_percentage ?? 0}%`}
                label="Average Score"
                icon={Target}
              />
              <StatCard
                value={stats.pre_count ?? 0}
                label="Pre-Assessments"
                icon={ClipboardList}
              />
              <StatCard
                value={stats.post_count ?? 0}
                label="Post-Assessments"
                icon={TrendingUp}
              />
            </div>

            {/* Pre vs Post chart */}
            <div className="bg-white rounded border border-gray-200 p-6 shadow-sm mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Average Score: Pre vs Post
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Mean percentage score across scored questions.
              </p>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={phaseChart}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={90}>
                      <Cell fill="#011E41" />
                      <Cell fill="#ee2435" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Question analytics */}
            <h2 className="text-sm font-bold uppercase tracking-wide text-dash-navy mb-4">
              Question Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {questions.map((q, i) => (
                <div
                  key={q.name}
                  className="bg-white rounded border border-gray-200 p-6 shadow-sm"
                >
                  <div className="flex items-start gap-2 mb-1">
                    {phaseBadge(q.phase || "Both")}
                    <span className="font-semibold text-sm text-gray-900">
                      {i + 1}. {q.question_text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    {q.response_count || 0} response(s)
                    {q.is_scored ? " · scored" : ""}
                  </div>
                  {q.distribution ? (
                    q.distribution.length ? (
                      <DistributionBars dist={q.distribution} />
                    ) : (
                      <p className="text-sm text-gray-400 italic">No answers yet.</p>
                    )
                  ) : q.qualitative && q.qualitative.length ? (
                    <ul className="space-y-3 max-h-64 overflow-y-auto">
                      {q.qualitative.map((it: any, idx: number) => (
                        <li
                          key={idx}
                          className="text-sm border-t border-gray-100 pt-3 first:border-t-0 first:pt-0"
                        >
                          {it.national_society && (
                            <span className="block text-[11px] font-semibold text-dash-navy mb-0.5">
                              {it.national_society}
                              {it.phase ? ` · ${it.phase}` : ""}
                            </span>
                          )}
                          <span className="text-gray-700">{it.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic flex items-center gap-2">
                      <MessageSquareText className="h-4 w-4" /> No responses yet.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Action plans */}
            <h2 className="text-sm font-bold uppercase tracking-wide text-dash-navy mb-4">
              Action Plans
            </h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mb-8">
              {actions.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                      <th className="px-4 py-3">National Society</th>
                      <th className="px-4 py-3">Action Item</th>
                      <th className="px-4 py-3">Timeline</th>
                      <th className="px-4 py-3">Expected Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((a, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-dash-navy">
                            {a.national_society || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{a.action_item}</td>
                        <td className="px-4 py-3 text-gray-700">{a.timeline}</td>
                        <td className="px-4 py-3 text-gray-700">{a.expected_outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-sm text-gray-400 italic">
                  No action plans submitted yet.
                </p>
              )}
            </div>

            {/* Recent submissions */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-dash-navy">
                Recent Submissions
              </h2>
              <Link
                to="/financial-sustainability/responses"
                className="inline-flex items-center gap-1 text-xs font-medium text-dash-red hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              {recent.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                      <th className="px-4 py-3">Respondent</th>
                      <th className="px-4 py-3">National Society</th>
                      <th className="px-4 py-3">Phase</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.name} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.respondent_name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.national_society || "—"}
                        </td>
                        <td className="px-4 py-3">{phaseBadge(r.phase)}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.max_score > 0 ? `${r.percentage}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {(r.submitted_on || "").substring(0, 16).replace("T", " ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-sm text-gray-400 italic">No submissions yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
