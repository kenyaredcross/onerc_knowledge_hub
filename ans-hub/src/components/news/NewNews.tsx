import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Newspaper,
  Check,
  FileText,
  Info,
  Loader2,
  Save,
  MapPin,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Send,
} from "lucide-react";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";
import { type Article } from "../../lib/utils";
import { UserContext } from "../../contexts/UserContext";

export default function NewNews() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [submitAction, setSubmitAction] = useState<"save" | "submit">("save");

  // Check if user has admin or manager roles
  const userRoles = (userData as any)?.roles?.map((r: any) => r.role) || [];
  const canPublish =
    userRoles.includes("LH Admin") ||
    userRoles.includes("LH Manager") ||
    userRoles.includes("System Manager");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    article_type: "",
    category: "",
    pillar: "",
    location: "",
    summary: "",
    body: "",
    cover_image: "",
    source_name: "",
    source_url: "",
    status: "Draft",
    is_featured: 0,
  });

  // Fetch current user's national society
  const { data: currentUserData } = useFrappeGetCall<{ message: any }>(
    "onerc_knowledge_hub.api.article.get_current_user_ns"
  );

  // Fetch all articles (including drafts) - filtered by national society for managers
  const { data: articlesData, isLoading, mutate } = useFrappeGetCall<{ message: Article[] }>(
    "onerc_knowledge_hub.api.article.get_articles_filtered",
    {
      include_drafts: 1,
    }
  );

  // Debug logging for filtering
  console.log("=== FILTERING DEBUG ===");
  console.log("Current User:", (userData as any)?.name);
  console.log("User Roles:", userRoles);
  console.log("Can Publish:", canPublish);
  console.log("Current User Data Response:", currentUserData);
  console.log("User's National Society:", currentUserData?.message?.national_society);
  console.log("Total Articles Returned:", articlesData?.message?.length || 0);

  if (articlesData?.message) {
    console.log("\nArticles with Owner and NS comparison:");
    const userNS = currentUserData?.message?.national_society;
    articlesData.message.forEach((article: any) => {
      const ownerNS = article.owner_national_society;
      const match = userNS === ownerNS ? "✓ MATCH" : "✗ NO MATCH";
      console.log(`  ${match} | ${article.title}`);
      console.log(`    Owner: ${article.owner} | Owner NS: ${ownerNS} | User NS: ${userNS}`);
    });
  }

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    call: createArticle,
    loading: isSubmitting,
    error,
  } = useFrappePostCall("frappe.client.insert");

  const {
    call: submitArticle,
    loading: isSubmittingDoc,
  } = useFrappePostCall("frappe.client.submit");

  const { call: getDoc } = useFrappePostCall("frappe.client.get");

  const handlePublishFromList = async (articleName: string) => {
    try {
      // First, fetch the full document
      const docResponse = await getDoc({
        doctype: "Article",
        name: articleName
      });

      const doc = docResponse?.message || docResponse;

      // Now submit with the full document
      await submitArticle({
        doc: doc
      });

      // Refresh the list
      mutate();
    } catch (error) {
      console.error("Error publishing article:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, action: "save" | "submit" = "save") => {
    e.preventDefault();
    setSubmitAction(action);

    try {
      // Build doc with only non-empty fields
      const doc: any = {
        doctype: "Article",
        title: form.title,
        article_type: form.article_type,
        category: form.category,
        summary: form.summary,
        body: form.body,
        status: action === "submit" ? "Published" : form.status,
      };

      // Add optional fields only if they have values
      if (form.subtitle) {
        doc.subtitle = form.subtitle;
      }
      if (form.pillar) {
        doc.pillar = form.pillar;
      }
      if (form.location) {
        doc.location = form.location;
      }
      if (form.cover_image) {
        doc.cover_image = form.cover_image;
      }
      if (form.source_name) {
        doc.source_name = form.source_name;
      }
      if (form.source_url) {
        doc.source_url = form.source_url;
      }
      if (form.is_featured) {
        doc.is_featured = form.is_featured;
      }

      console.log("Submitting doc:", doc);
      const response = await createArticle({ doc });
      console.log("Response:", response);

      const createdDoc = response?.message || response;

      // If action is submit, submit the document to change docstatus
      if (action === "submit" && createdDoc?.name) {
        await submitArticle({
          doc: {
            doctype: "Article",
            name: createdDoc.name
          }
        });
      }

      // Refresh the list
      mutate();

      // Reset form and hide it
      setForm({
        title: "",
        subtitle: "",
        article_type: "",
        category: "",
        pillar: "",
        location: "",
        summary: "",
        body: "",
        cover_image: "",
        source_name: "",
        source_url: "",
        status: "Draft",
        is_featured: 0,
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error creating article:", err);
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

  const articles = articlesData?.message || [];

  const getStatusBadge = (status: string, docstatus: number) => {
    if (docstatus === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          <Edit className="h-3 w-3" />
          Draft
        </span>
      );
    }
    if (docstatus === 1 && status === "Published") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" />
          Published
        </span>
      );
    }
    if (status === "Scheduled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
          <Clock className="h-3 w-3" />
          Scheduled
        </span>
      );
    }
    if (status === "Archived") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          <XCircle className="h-3 w-3" />
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
        {status}
      </span>
    );
  };

  if (showForm) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles List
            </button>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                  <Newspaper className="h-3.5 w-3.5" />
                  Create Article
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
                  Add New News Article
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-10">
          <form onSubmit={(e) => handleSubmit(e, submitAction)} className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Overview</h2>
                  <p className="text-sm text-gray-600">
                    Primary article classification
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="Optional deck or tagline shown under the title"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                </div>

                <div>
                  <LinkField
                    doctype="Localisation Type"
                    label="Localisation Type"
                    value={form.article_type}
                    onChange={(val) => updateField("article_type", val)}
                    required
                    {...linkFieldClasses}
                  />
                </div>

                <div>
                  <LinkField
                    doctype="Localisation Category"
                    label="Category"
                    value={form.category}
                    onChange={(val) => updateField("category", val)}
                    required
                    {...linkFieldClasses}
                  />
                </div>

                <div>
                  <LinkField
                    doctype="Localization Pillar"
                    label="Pillar"
                    value={form.pillar}
                    onChange={(val) => updateField("pillar", val)}
                    {...linkFieldClasses}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="e.g., Lusaka, Zambia"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured === 1}
                      onChange={(e) => updateField("is_featured", e.target.checked ? 1 : 0)}
                      className="h-5 w-5 rounded border-gray-300 text-dash-red focus:ring-dash-red focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-800">Feature this article</span>
                      <p className="text-xs text-gray-500">Featured articles appear in the carousel on the news page</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Article Content
                </h2>
              </div>
              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="Short description shown on cards and used for SEO. Max 280 characters."
                    maxLength={280}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                  />
                  <p className="text-[11px] text-gray-500 ml-2 mt-1">
                    {form.summary.length}/280 characters
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={form.body}
                    onChange={(e) => updateField("body", e.target.value)}
                    placeholder="Full article content..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
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
                  Cover Image & Attribution
                </h2>
              </div>
              <div className="grid gap-6">
                <div>
                  <FileUploadField
                    label="Cover Image"
                    value={form.cover_image}
                    doctype="Article"
                    accept=".png,.jpg,.jpeg"
                    onChange={(url) => updateField("cover_image", url ?? "")}
                  />
                  <p className="text-[11px] text-gray-500 ml-2 mt-1">
                    Only PNG, JPG, JPEG files allowed. Recommended size: 1200x630px
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Source Name
                    </label>
                    <input
                      type="text"
                      value={form.source_name}
                      onChange={(e) => updateField("source_name", e.target.value)}
                      placeholder="If reposted, the original publication"
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Source URL
                    </label>
                    <input
                      type="url"
                      value={form.source_url}
                      onChange={(e) => updateField("source_url", e.target.value)}
                      placeholder="https://..."
                      className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
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

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                    <Check className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Ready to Save?
                    </h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Save as draft or submit for immediate publishing
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    onClick={() => setSubmitAction("save")}
                    disabled={isSubmitting || isSubmittingDoc}
                    className="flex-1 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gray-600 px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-gray-700 disabled:opacity-60"
                  >
                    {isSubmitting && submitAction === "save" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Draft
                  </button>
                  {canPublish && (
                    <button
                      type="submit"
                      onClick={() => setSubmitAction("submit")}
                      disabled={isSubmitting || isSubmittingDoc}
                      className="flex-1 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-dash-red px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-700 disabled:opacity-60"
                    >
                      {isSubmitting && submitAction === "submit" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Submit & Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link
            to="/news"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
                <Newspaper className="h-3.5 w-3.5" />
                Manage Articles
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
                News Articles
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and publish news articles
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-dash-red px-8 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              Add New Article
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No articles yet</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating your first article</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-dash-red px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Add New Article
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article: any) => (
                    <tr key={article.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {article.title}
                          </div>
                          {article.subtitle && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {article.subtitle}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {article.article_type || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {article.category || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status, article.docstatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Eye className="h-3.5 w-3.5" />
                          {article.view_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {article.published_on
                          ? new Date(article.published_on).toLocaleDateString()
                          : "-"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          {canPublish && article.docstatus === 0 && (
                            <button
                              onClick={() => handlePublishFromList(article.name)}
                              disabled={isSubmittingDoc}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Publish
                            </button>
                          )}
                          <Link
                            to={`/news/${article.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-dash-red hover:text-red-700 transition-colors"
                          >
                            View
                            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                          </Link>
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
