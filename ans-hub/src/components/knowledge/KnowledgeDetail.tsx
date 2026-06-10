import { useFrappeGetCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Globe,
  Info,
  Loader2,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const resourceBadge: Record<string, string> = {
  Publication: "bg-blue-100 text-blue-700 border border-blue-200",
  Report: "bg-green-100 text-green-700 border border-green-200",
  "Tools & Templates": "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function KnowledgeDetail() {
  const { t } = useTranslation(['knowledge', 'common']);
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useFrappeGetCall(
    "onerc_knowledge_hub.api.knowledge_hub.get_knowledge_hub_details",
    { name: slug },
  );

  const resource = data?.message;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  if (error || !resource) {
    return <Navigate to="/knowledge" replace />;
  }

  return (
    <div className="min-h-full bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/knowledge"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common:back')} to Knowledge Repository
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-dash-navy via-dash-navy to-dash-red px-8 py-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                      resourceBadge[resource.resource_type] ||
                      "bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {resource.resource_type}
                  </span>

                  {resource.category && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                      {resource.category}
                    </span>
                  )}

                  {resource.language && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
                      {resource.language}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
                  {resource.title}
                </h1>

                {resource.summary && (
                  <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/70 lg:text-lg">
                    {resource.summary}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl">
                  <BookOpen className="h-14 w-14 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="border-r border-gray-100 p-8 lg:col-span-8 lg:p-12">
              {resource.summary && (
                <div className="mb-10 rounded-2xl border border-dash-red/10 bg-dash-red/5 p-6">
                  <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-dash-red">
                    <Info className="h-4 w-4" />
                    Overview
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700 lg:text-base">
                    {resource.summary}
                  </p>
                </div>
              )}

              <section className="mb-12">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-dash-red/10">
                    <FileText className="h-5 w-5 text-dash-red" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Full Description
                    </h2>

                    <p className="text-sm text-gray-500">
                      Detailed information about this resource
                    </p>
                  </div>
                </div>

                <div
                  className="prose prose-slate max-w-none prose-sm lg:prose-base"
                  dangerouslySetInnerHTML={{
                    __html: resource.description || "",
                  }}
                />
              </section>

              {resource.contributing_ns?.length > 0 && (
                <section>
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-dash-navy/10">
                      <FolderOpen className="h-5 w-5 text-dash-navy" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Contributing National Societies
                      </h2>

                      <p className="text-sm text-gray-500">
                        Organisations contributing to this resource
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {resource.contributing_ns.map((ns: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700"
                      >
                        {ns.national_society || ns.name || ns}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="bg-gray-50/70 p-8 lg:col-span-4 lg:p-10">
              <div className="sticky top-8 space-y-8">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-gray-400">
                    Resource Information
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dash-red/10">
                        <Tag className="h-5 w-5 text-dash-red" />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Resource Type
                        </div>

                        <div className="mt-1 text-sm font-bold text-gray-900">
                          {resource.resource_type}
                        </div>

                        {resource.tools_subcategory && (
                          <div className="mt-1 text-xs text-gray-500">
                            {resource.tools_subcategory}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dash-navy/10">
                        <Calendar className="h-5 w-5 text-dash-navy" />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {t('common:published')}
                        </div>

                        <div className="mt-1 text-sm font-bold text-gray-900">
                          {resource.published_date
                            ? new Date(
                                resource.published_date,
                              ).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Not published"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                        <TrendingUp className="h-5 w-5 text-emerald-700" />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Engagement
                        </div>

                        <div className="mt-1 text-sm font-bold text-gray-900">
                          {resource.view_count || 0} {t('common:views')}
                        </div>

                        <div className="text-xs text-gray-500">
                          {resource.download_count || 0} {t('common:downloads')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100">
                        <User className="h-5 w-5 text-purple-700" />
                      </div>

                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Uploaded By
                        </div>

                        <div className="mt-1 text-sm font-bold text-gray-900">
                          {resource.uploaded_by || "Unknown"}
                        </div>
                      </div>
                    </div>

                    {resource.language && (
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                          <Globe className="h-5 w-5 text-blue-700" />
                        </div>

                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {t('forms:language')}
                          </div>

                          <div className="mt-1 text-sm font-bold text-gray-900">
                            {resource.language}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(resource.file_attachment || resource.external_url) && (
                  <div className="rounded-3xl bg-dash-navy p-6 text-white shadow-2xl shadow-dash-navy/10">
                    <h3 className="text-lg font-bold">Access This Resource</h3>

                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      Download the attached file or open the external resource
                      link.
                    </p>

                    <div className="mt-6 space-y-3">
                      {resource.file_attachment && (
                        <a
                          href={resource.file_attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-dash-red px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.98]"
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </a>
                      )}

                      {resource.external_url && (
                        <a
                          href={resource.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open External Link
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
