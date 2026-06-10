import { useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Info,
  Loader2,
  Save,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";
import { MultiSelectLinkField } from "../fields/MultiSelectLinkField";
import { RichTextEditor } from "../fields/RichTextEditor";
import { useTranslation } from 'react-i18next';

export default function NewKnowledge() {
  const { t } = useTranslation(['forms', 'common']);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    language: "",
    resource_type: "",
    tools_subcategory: "",
    summary: "",
    description: "",
    file_attachment: "",
    external_url: "",
    contributing_ns: [],
    uploaded_by: "Administrator",
    report_impact: "Yes",
    metric_type: "",
    status: "Draft",
    is_highlighted: 0,
    highlight_order: 0,
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    call: createKnowledgeHub,
    loading: isSubmitting,
    error,
  } = useFrappePostCall(
    "onerc_knowledge_hub.api.knowledge_hub.create_knowledge_hub",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createKnowledgeHub({ ...form });
      const createdDoc = response?.message;
      if (createdDoc?.name) {
        navigate(`/knowledge/${createdDoc.name}`);
      } else {
        navigate("/knowledge");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const linkFieldClasses = {
    buttonClassName:
      "rounded-2xl border-gray-200 bg-gray-50 text-gray-900",
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
            to="/knowledge"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('forms:backTo')} Knowledge Repository
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                <BookOpen className="h-3.5 w-3.5" />
                {t('forms:createResource')}
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
                {t('forms:addNew')} Knowledge Resource
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
                <h2 className="text-xl font-bold text-gray-900">{t('forms:overview')}</h2>
                <p className="text-sm text-gray-600">
                  {t('forms:overviewDescription')}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t('forms:title')} <span className="text-red-500">*</span>
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
                <LinkField
                  doctype="Category"
                  label={t('forms:category')}
                  required
                  value={form.category}
                  onChange={(val) => updateField("category", val)}
                  {...linkFieldClasses}
                />
              </div>

              <div>
                <LinkField
                  doctype="Language"
                  label={t('forms:language')}
                  required
                  value={form.language}
                  onChange={(val) => updateField("language", val)}
                  {...linkFieldClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t('forms:resourceType')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.resource_type}
                  onChange={(e) => updateField("resource_type", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                >
                  <option value="">{t('forms:selectType')}</option>
                  <option value="Publication">{t('forms:publication')}</option>
                  <option value="Report">{t('forms:report')}</option>
                  <option value="Tools & Templates">{t('forms:toolsTemplates')}</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <MultiSelectLinkField
                  doctype="National Society Detail"
                  targetDoctype="National Society"
                  label={t('forms:contributingNS')}
                  value={form.contributing_ns}
                  onChange={(val) => updateField("contributing_ns", val)}
                  {...linkFieldClasses}
                />
              </div>

              {form.resource_type === "Tools & Templates" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('forms:toolsSubcategory')}
                  </label>
                  <select
                    value={form.tools_subcategory}
                    onChange={(e) =>
                      updateField("tools_subcategory", e.target.value)
                    }
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                  >
                    <option value="">{t('forms:selectSubcategory')}</option>
                    <option value="Strategy Templates">
                      {t('forms:strategyTemplates')}
                    </option>
                    <option value="Institutional Policy Templates">
                      {t('forms:institutionalPolicyTemplates')}
                    </option>
                    <option value="Tools & Frameworks">
                      {t('forms:toolsFrameworks')}
                    </option>
                    <option value="Proposal & Resource Mobilisation Templates">
                      {t('forms:proposalResourceMobilisationTemplates')}
                    </option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t('forms:summary')}
                </label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <RichTextEditor
                  label={t('forms:description')}
                  value={form.description}
                  onChange={(val) => updateField("description", val)}
                  placeholder="Provide a detailed description of this resource..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('forms:contentAccess')}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-1">
              <div>
                <FileUploadField
                  label={t('forms:fileAttachment')}
                  value={form.file_attachment}
                  doctype="Knowledge Hub"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(url) => updateField("file_attachment", url ?? "")}
                />
                <p className="text-[11px] text-gray-500 ml-2 mt-1">
                  {t('forms:allowedFileTypes')}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t('forms:externalUrl')}
                </label>
                <input
                  type="url"
                  value={form.external_url}
                  onChange={(e) => updateField("external_url", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('forms:impactReporting')}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t('forms:reportImpactQuestion')}
                </label>
                <select
                  value={form.report_impact}
                  onChange={(e) => updateField("report_impact", e.target.value)}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                >
                  <option value="Yes">{t('forms:yes')}</option>
                  <option value="No">{t('forms:no')}</option>
                </select>
              </div>
              {form.report_impact === "Yes" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('forms:metricType')}
                  </label>
                  <input
                    type="text"
                    value={form.metric_type}
                    onChange={(e) => updateField("metric_type", e.target.value)}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
              <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-tight">
                <Info className="h-4 w-4" />
                {t('forms:submissionError')}
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
                  {t('forms:finalReview')}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {t('forms:finalReviewMessage')}
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
{t('forms:save')} {t('forms:resource')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
