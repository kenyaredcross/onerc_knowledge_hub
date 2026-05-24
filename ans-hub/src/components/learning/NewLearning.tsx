import { useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  GraduationCap,
  Check,
  FileText,
  Info,
  Loader2,
  Save,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUploadField } from "../fields/FileUploadField";
import { MultiSelectLinkField } from "../fields/MultiSelectLinkField";

export default function NewLearning() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    pillar: [] as string[],
    category: [] as string[],
    type: "",
    external_platform_name: "",
    external_url: "",
    summary: "",
    description: "",
    cover_image: "",
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    call: createLearningResource,
    loading: isSubmitting,
    error,
  } = useFrappePostCall("frappe.client.insert");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transform pillar and category arrays into child table format
      const pillarLinks = form.pillar.map((p) => ({
        doctype: "Localization Pillar Link",
        pillar: p,
        parenttype: "Learning Hub",
        parentfield: "pillar",
      }));

      const categoryLinks = form.category.map((c) => ({
        doctype: "Category Link",
        category: c,
        parenttype: "Learning Hub",
        parentfield: "category",
      }));

      // Build doc with only non-empty fields
      const doc: any = {
        doctype: "Learning Hub",
        title: form.title,
        type: form.type,
        external_url: form.external_url,
      };

      // Add optional fields only if they have values
      if (form.external_platform_name) {
        doc.external_platform_name = form.external_platform_name;
      }
      if (form.summary) {
        doc.summary = form.summary;
      }
      if (form.description) {
        doc.description = form.description;
      }
      if (form.cover_image) {
        doc.cover_image = form.cover_image;
      }
      if (pillarLinks.length > 0) {
        doc.pillar = pillarLinks;
      }
      if (categoryLinks.length > 0) {
        doc.category = categoryLinks;
      }

      console.log("Submitting doc:", doc);
      const response = await createLearningResource({ doc });
      console.log("Response:", response);

      // Navigate back to learning hub after successful creation
      navigate("/learning");
    } catch (err) {
      console.error("Error creating learning resource:", err);
    }
  };

  const linkFieldClasses = {
    buttonClassName:
      "h-14 rounded-2xl border-gray-200 bg-gray-50 text-gray-900",
    dropdownClassName: "rounded-2xl border border-gray-200 shadow-2xl",
    inputClassName: "h-12 text-sm",
    optionClassName: "rounded-xl",
    activeOptionClassName: "bg-dash-red/10 text-dash-red",
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            to="/learning"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Hub
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                <GraduationCap className="h-3.5 w-3.5" />
                Create Resource
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
                Add New Learning Resource
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Overview</h2>
                <p className="text-sm text-gray-600">
                  Primary resource classification
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                />
              </div>

              <div>
                <MultiSelectLinkField
                  doctype="Localization Pillar Link"
                  targetDoctype="Localization Pillar"
                  label="Pillar"
                  value={form.pillar}
                  onChange={(val) => updateField("pillar", val)}
                  {...linkFieldClasses}
                />
              </div>

              <div>
                <MultiSelectLinkField
                  doctype="Category Link"
                  targetDoctype="Category"
                  label="Category"
                  value={form.category}
                  onChange={(val) => updateField("category", val)}
                  {...linkFieldClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                >
                  <option value="">Select type</option>
                  <option value="External Platform">External Platform</option>
                  <option value="External URL">External URL</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Summary
                </label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Full Description
                </label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ExternalLink className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                External Resource Details
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={form.external_platform_name}
                  onChange={(e) =>
                    updateField("external_platform_name", e.target.value)
                  }
                  placeholder="e.g., Coursera, Udemy, YouTube"
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  External URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={form.external_url}
                  onChange={(e) => updateField("external_url", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Cover Image
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-1">
              <div>
                <FileUploadField
                  label="Cover Image"
                  value={form.cover_image}
                  doctype="Learning Hub"
                  accept=".png,.jpg,.jpeg"
                  onChange={(url) => updateField("cover_image", url ?? "")}
                />
                <p className="text-[11px] text-gray-500 ml-2 mt-1">
                  Only PNG, JPG, JPEG files allowed. Recommended size: 1200x630px
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
              <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-tight">
                <Info className="h-4 w-4" />
                Submission Error
              </div>
              <ul className="list-inside list-disc space-y-1.5">
                {(() => {
                  const errorObj = error as any;
                  if (errorObj?._server_messages) {
                    try {
                      const messages = JSON.parse(errorObj._server_messages);
                      return messages.map((msg: string, i: number) => {
                        const parsedMsg = JSON.parse(msg);
                        return (
                          <li key={i}>
                            {parsedMsg.message || "Unknown error"}
                          </li>
                        );
                      });
                    } catch {
                      return <li>{errorObj._server_messages}</li>;
                    }
                  }
                  if (errorObj?.exception) {
                    return <li>{errorObj.exception.split("\n")[0]}</li>;
                  }
                  return <li>{errorObj?.message || String(error)}</li>;
                })()}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                <Check className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Final Review
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Ensure all required fields marked with * are filled.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-dash-red px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
