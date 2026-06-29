import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Save,
  Send,
  Trash2,
  Calendar,
  Users,
  Lock,
  Pencil,
} from "lucide-react";
import { UserContext } from "../../contexts/UserContext";
import { LinkField } from "../fields/LinkField";

// Roles allowed to manage Financial Sustainability activities.
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
          Managing activities is only available to users with the
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

type Participant = {
  participant_name: string;
  email: string;
  national_society: string;
};

const emptyForm = {
  name: "",
  activity_name: "",
  country: "",
  activity_date: "",
  notification_email: "",
  description: "",
};

const blankRow = (): Participant => ({
  participant_name: "",
  email: "",
  national_society: "",
});

export default function FSActivities() {
  const { userData } = useContext(UserContext);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [participants, setParticipants] = useState<Participant[]>([blankRow()]);
  const [flash, setFlash] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );
  const [busyRow, setBusyRow] = useState<string>("");

  const {
    data,
    isLoading,
    mutate,
  } = useFrappeGetCall<{ message: { activities: any[] } }>(
    "onerc_knowledge_hub.api.assessment.list_activities"
  );

  const { call: saveActivity, loading: saving, error: saveError } =
    useFrappePostCall("onerc_knowledge_hub.api.assessment.save_activity");
  const { call: getActivity } = useFrappePostCall(
    "onerc_knowledge_hub.api.assessment.get_activity"
  );
  const { call: sendPre } = useFrappePostCall(
    "onerc_knowledge_hub.api.assessment.send_pre_invitations"
  );
  const { call: sendPost } = useFrappePostCall(
    "onerc_knowledge_hub.api.assessment.send_post_invitations"
  );

  if (!hasFsAccess(userData)) return <NotAuthorized />;

  const activities = data?.message?.activities || [];

  const flashThenClear = (type: "ok" | "err", msg: string) => {
    setFlash({ type, msg });
    window.setTimeout(() => setFlash(null), 5000);
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setParticipants([blankRow()]);
    setShowForm(true);
  };

  const openEdit = async (name: string) => {
    try {
      const res = await getActivity({ name });
      const a = res?.message || res;
      setForm({
        name: a.name || "",
        activity_name: a.activity_name || "",
        country: a.country || "",
        activity_date: a.activity_date || "",
        notification_email: a.notification_email || "",
        description: a.description || "",
      });
      setParticipants(
        (a.participants || []).length
          ? a.participants.map((p: any) => ({
              participant_name: p.participant_name || "",
              email: p.email || "",
              national_society: p.national_society || "",
            }))
          : [blankRow()]
      );
      setShowForm(true);
    } catch (e) {
      flashThenClear("err", "Could not load that activity.");
    }
  };

  const updateField = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateRow = (i: number, field: keyof Participant, value: string) =>
    setParticipants((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );

  const addRow = () => setParticipants((prev) => [...prev, blankRow()]);
  const removeRow = (i: number) =>
    setParticipants((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = participants.filter((p) => p.email.trim());
    try {
      await saveActivity({
        payload: JSON.stringify({ ...form, participants: cleaned }),
      });
      await mutate();
      setShowForm(false);
      flashThenClear(
        "ok",
        form.name ? "Activity updated." : "Activity created."
      );
    } catch (err) {
      // Error surfaced inline by saveError below.
    }
  };

  const handleSend = async (name: string, phase: "pre" | "post") => {
    setBusyRow(name + phase);
    try {
      const call = phase === "pre" ? sendPre : sendPost;
      const res = await call({ activity: name });
      const m = res?.message || res || {};
      await mutate();
      flashThenClear(
        "ok",
        `${phase === "pre" ? "Pre" : "Post"}-assessment: sent ${m.sent || 0}, skipped ${m.skipped || 0}.`
      );
    } catch (err) {
      flashThenClear("err", "Could not send invitations. Check email setup.");
    } finally {
      setBusyRow("");
    }
  };

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "-";

  // ── Create / edit form ────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <button
              onClick={() => setShowForm(false)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Activities
            </button>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
              <Calendar className="h-3.5 w-3.5" />
              {form.name ? "Edit Activity" : "New Activity"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {form.name ? form.activity_name || "Activity" : "Create an activity"}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Details</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Activity name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.activity_name}
                    onChange={(e) => updateField("activity_name", e.target.value)}
                    placeholder="e.g. Nairobi Financial Sustainability Lab"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>

                <div>
                  <LinkField
                    doctype="Country"
                    label="Country"
                    value={form.country}
                    onChange={(val) => updateField("country", val)}
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Activity date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.activity_date}
                    onChange={(e) => updateField("activity_date", e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Notification email
                  </label>
                  <input
                    type="email"
                    value={form.notification_email}
                    onChange={(e) =>
                      updateField("notification_email", e.target.value)
                    }
                    placeholder="Where submission alerts go (optional)"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Optional notes about this engagement"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Participants</h2>
                <span className="text-xs text-gray-500">
                  Email is required for each person (used to match pre and post).
                </span>
              </div>

              <div className="space-y-3">
                {participants.map((p, i) => (
                  <div
                    key={i}
                    className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
                  >
                    <input
                      type="text"
                      value={p.participant_name}
                      onChange={(e) =>
                        updateRow(i, "participant_name", e.target.value)
                      }
                      placeholder="Name"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-dash-red focus:outline-none focus:ring-2 focus:ring-dash-red/10"
                    />
                    <input
                      type="email"
                      value={p.email}
                      onChange={(e) => updateRow(i, "email", e.target.value)}
                      placeholder="Email"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-dash-red focus:outline-none focus:ring-2 focus:ring-dash-red/10"
                    />
                    <LinkField
                      doctype="National Society"
                      value={p.national_society}
                      onChange={(val) => updateRow(i, "national_society", val)}
                      placeholder="National Society (optional)"
                      buttonClassName="h-11 rounded-lg border-gray-200 bg-white text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      title="Remove participant"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-dash-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-dash-navy transition-colors hover:border-dash-navy"
              >
                <Plus className="h-4 w-4" /> Add participant
              </button>
            </div>

            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {(() => {
                  const e = saveError as any;
                  if (e?._server_messages) {
                    try {
                      return JSON.parse(e._server_messages)
                        .map((m: string) => JSON.parse(m).message)
                        .join(" ");
                    } catch {
                      return e._server_messages;
                    }
                  }
                  return e?.message || "Could not save the activity.";
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-dash-red px-7 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {form.name ? "Save changes" : "Create activity"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 px-7 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                <Calendar className="h-3.5 w-3.5" /> Financial Sustainability
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Activities
              </h1>
              <p className="mt-2 text-gray-600">
                Create an engagement, add participants, and send the pre and post
                assessment invitations.
              </p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-dash-red px-7 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-700"
            >
              <Plus className="h-4 w-4" /> New Activity
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {flash && (
          <div
            className={`mb-5 rounded-xl border px-5 py-3 text-sm ${
              flash.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {flash.msg}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No activities yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Create your first engagement to start inviting participants.
              </p>
              <button
                onClick={openNew}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-dash-red px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
              >
                <Plus className="h-4 w-4" /> New Activity
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["Activity", "Country", "Date", "Participants", "Pre done", "Post done", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 ${
                            h === "Actions" ? "text-right" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activities.map((a: any) => (
                    <tr key={a.name} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {a.activity_name}
                        </div>
                        <div className="text-xs text-gray-400">{a.name}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {a.country || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {fmtDate(a.activity_date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {a.participant_count || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 tabular-nums">
                        {a.pre_completed || 0}/{a.participant_count || 0}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 tabular-nums">
                        {a.post_completed || 0}/{a.participant_count || 0}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(a.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-dash-navy hover:text-dash-navy"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleSend(a.name, "pre")}
                            disabled={busyRow === a.name + "pre"}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-dash-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-900 disabled:opacity-50"
                          >
                            {busyRow === a.name + "pre" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            Pre
                          </button>
                          <button
                            onClick={() => handleSend(a.name, "post")}
                            disabled={busyRow === a.name + "post"}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-dash-red px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            {busyRow === a.name + "post" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            Post
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
