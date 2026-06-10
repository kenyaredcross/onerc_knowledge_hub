import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { Calendar, MapPin, ArrowLeft, Newspaper, Eye } from "lucide-react";
import { pillarColor } from "../../lib/site-data";
import { mapArticleToNewsItem, type Article } from "../../lib/utils";
import Comments from "../common/Comments";
import { useTranslation } from 'react-i18next';

export default function NewsDetail() {
  const { t } = useTranslation(['news', 'common']);
  const { slug } = useParams<{ slug: string }>();

  // Fetch article from API
  const { data: articleData, isLoading, error } = useFrappeGetCall<{ message: Article }>(
    "onerc_core.api.article.get_article",
    { slug: slug || "" },
    slug ? undefined : null // Skip call if no slug
  );

  // Fetch all articles for related stories
  const { data: allArticlesData } = useFrappeGetCall<{ message: Article[] }>(
    "onerc_core.api.article.get_articles",
    {}
  );

  // Transform article data with cover image
  const article = useMemo(() => {
    if (!articleData?.message) return null;
    return {
      ...mapArticleToNewsItem(articleData.message),
      cover_image: articleData.message.cover_image
    };
  }, [articleData]);

  // Get related articles (same category, exclude current)
  const relatedArticles = useMemo(() => {
    if (!allArticlesData?.message || !article) return [];
    return allArticlesData.message
      .filter(a => a.slug !== slug && a.category === articleData?.message?.category)
      .slice(0, 2)
      .map(mapArticleToNewsItem);
  }, [allArticlesData, article, slug, articleData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full bg-dash-bg p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white border border-dash-border shadow-sm p-6 md:p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !article) {
    return (
      <div className="min-h-full bg-dash-bg p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/news"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" /> {t('common:back')} to News
          </Link>
          <div className="rounded-xl bg-white border border-dash-border shadow-sm p-12 text-center">
            <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">This article may have been removed or the link is incorrect.</p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded hover:bg-red-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t('common:back')} to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/news"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-dash-red"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common:back')} to News
        </Link>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Article Content - Left */}
          <div className="lg:col-span-8">
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              {/* Pillar header */}
              <div className={`px-6 py-3 ${pillarColor[article.color]}`}>
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  {article.tag}
                </span>
              </div>

              {/* Cover Image */}
              {article.cover_image && (
                <div className="w-full h-64 md:h-96 overflow-hidden">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                <h1 className="font-display text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
                  {article.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400 border-b border-gray-200 pb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {article.date}
                  </span>
                  {article.place && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {article.place}
                    </span>
                  )}
                </div>

                <p className="mt-6 text-base leading-relaxed text-gray-700">{article.excerpt}</p>
                <p className="mt-4 leading-relaxed text-gray-600 text-sm whitespace-pre-wrap">{article.body}</p>
              </div>
            </div>

            {/* Frappe Comments Section */}
            <div className="mt-6 rounded-xl bg-white border border-gray-200 shadow-sm p-6">
              <Comments
                doctype="Article"
                docname={articleData?.message?.name || ""}
              />
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* View Count Card */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-dash-red" />
                  Views
                </h3>
              </div>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-dash-red">
                  {articleData?.message?.view_count || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total views</p>
              </div>
            </div>

            {/* Related Stories */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-4">{t('news:relatedStories')}</h3>
                <div className="space-y-3">
                  {relatedArticles.map((n) => (
                    <Link
                      key={n.slug}
                      to={`/news/${n.slug}`}
                      className="block p-3 rounded border border-gray-200 hover:border-dash-red/30 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-12 w-12 shrink-0 rounded ${pillarColor[n.color]}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                            {n.title}
                          </h4>
                          <p className="text-xs text-gray-600">{n.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
