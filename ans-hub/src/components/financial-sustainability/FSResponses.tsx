import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";
import { ArrowLeft, BarChart3, Eye, Lock, X } from "lucide-react";
import { UserContext } from "../../contexts/UserContext";

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
          Assessment responses are only available to users with the
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

function phaseBadge(phase: string) {
  const map: Record<string, string> = {
    Pre: "bg-blue-50 text-blue-700",
    Post: "bg-red-50 text-dash-red",
  };
  return (
    <span
      className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
        map[phase] || "bg-gray-100 text-gray-600"
      }`}
    >
      {phase}
    </span>
  );
}

function ResponseDetailModal({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useFrappeGetCall(
    "onerc_knowledge_hub.api.assessment.get_response_detail",
    { name },
  );
  const r: any = data?.message || {};

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-xl max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {r.respondent_name || name}
              </h3>
              {r.phase && phaseBadge(r.phase)}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {r.national_society_name || r.national_society || "—"}
              {r.email ? ` · ${r.email}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <>
              {r.max_score > 0 && (
                <div className="inline-flex items-center gap-3 bg-dash-navy text-white rounded px-4 py-2">
                  <span className="text-2xl font-bold">{r.percentage}%</span>
                  <span className="text-xs uppercase tracking-wide opacity-80">
                    {r.total_score}/{r.max_score} points
                  </span>
                </div>
              )}

              {(r.answers || []).map((a: any, i: number) => (
                <div key={i} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {a.question_text}
                    </p>
                    {a.max_score > 0 && (
                      <span className="shrink-0 text-xs font-medium text-gray-500">
                        {a.awarded_score}/{a.max_score}
                      </span>
                    )}
                  </div>
                  {a.selected_options && a.selected_options.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {a.selected_options.map((o: string, j: number) => (
                        <li
                          key={j}
                          className="text-sm text-gray-700 flex gap-2 before:content-['•'] before:text-dash-red"
                        >
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}
                  {a.narrative_answer && (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-100 whitespace-pre-wrap">
                      {a.narrative_answer}
                    </p>
                  )}
                  {(!a.selected_options || a.selected_options.length === 0) &&
                    !a.narrative_answer && (
                      <p className="mt-1 text-sm text-gray-400 italic">No answer.</p>
                    )}
                </div>
              ))}

              {(r.action_plan || []).length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Action Plan
                  </p>
                  <div className="space-y-2">
                    {r.action_plan.map((ap: any, i: number) => (
                      <div
                        key={i}
                        className="text-sm bg-gray-50 border border-gray-100 rounded p-3"
                      >
                        <div className="font-medium text-gray-900">
                          {ap.action_item || "—"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ap.timeline ? `Timeline: ${ap.timeline}` : ""}
                          {ap.expected_outcome
                            ? `${ap.timeline ? " · " : ""}Outcome: ${ap.expected_outcome}`
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FSResponses() {
  const { userData, isLoading: userLoading } = useContext(UserContext) as any;
  const [ns, setNs] = useState("");
  const [phase, setPhase] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.assessment.get_responses",
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
  const responses: any[] = d.responses || [];
  const societies: any[] = d.national_societies || [];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-dash-navy via-blue-900 to-dash-red p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/financial-sustainability"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-yellow-300">
                Peer Learning
              </span>
              <h1 className="text-3xl font-bold mt-1">Assessment Responses</h1>
              <p className="text-white/85 mt-1">
                Every submission to the Financial Sustainability assessment.
              </p>
            </div>
            <Link
              to="/financial-sustainability"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-medium border border-white/20"
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
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
          <div className="ml-auto text-sm text-gray-500 self-center">
            {responses.length} response{responses.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {error ? (
            <p className="p-6 text-sm text-gray-500">Could not load responses.</p>
          ) : isLoading ? (
            <p className="p-6 text-sm text-gray-500">Loading…</p>
          ) : responses.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400 italic">
              No responses yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3">Respondent</th>
                  <th className="px-4 py-3">National Society</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr
                    key={r.name}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelected(r.name)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.respondent_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.national_society_name || r.national_society || "—"}
                    </td>
                    <td className="px-4 py-3">{phaseBadge(r.phase)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.max_score > 0 ? `${r.percentage}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(r.submitted_on || "").substring(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-dash-red font-medium">
                        <Eye className="h-4 w-4" /> View
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <ResponseDetailModal name={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
