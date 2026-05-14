import { Link } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { Newspaper, TrendingUp, Activity, ArrowUpRight, ChevronRight, BookOpen, Filter, Star, ChevronLeft } from "lucide-react";
import { pillarColor, publications } from "../../lib/site-data";
import { mapArticleToNewsItem, type Article } from "../../lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export default function NewsIndex() {
  // Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Fetch articles from API
  const { data: articlesData, isLoading, error } = useFrappeGetCall<{ message: Article[] }>(
    "onerc_core.api.article.get_articles",
    {}
  );

  // Fetch categories from API
  const { data: categoriesData } = useFrappeGetCall<{ message: Array<{ name: string; category_name: string; description: string }> }>(
    "onerc_core.api.article.get_categories",
    {}
  );

  // Transform API data to component format with cover images
  const news = useMemo(() => {
    if (!articlesData?.message) return [];
    return articlesData.message.map(article => ({
      ...mapArticleToNewsItem(article),
      cover_image: article.cover_image,
      is_featured: article.is_featured
    }));
  }, [articlesData]);

  // Get featured stories for carousel
  const featuredStories = useMemo(() => {
    return news.filter(n => n.is_featured).slice(0, 5);
  }, [news]);

  // Category to color mapping
  const categoryColorMap: Record<string, string> = {
    "Leadership": "bg-pillar-leadership",
    "Branch Development": "bg-pillar-branch",
    "Resource Mobilisation": "bg-pillar-resource",
    "Finance Development": "bg-pillar-finance",
  };

  // Calculate category counts dynamically from API categories
  const categories = useMemo(() => {
    if (!categoriesData?.message) return [];
    return categoriesData.message.map(cat => ({
      name: cat.category_name || cat.name,
      color: categoryColorMap[cat.category_name || cat.name] || "bg-pillar-leadership",
      count: news.filter(n => n.tag === (cat.category_name || cat.name)).length
    }));
  }, [categoriesData, news]);
  return (
    <div className="min-h-full bg-gray-50">
      {/* Featured Stories Carousel */}
      {!isLoading && featuredStories.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-dash-red fill-current" />
                Featured Stories
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={scrollNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {featuredStories.map((story) => (
                  <div key={story.slug} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                    <Link
                      to={`/news/${story.slug}`}
                      className="block group"
                    >
                      <div className="relative h-64 rounded-lg overflow-hidden mb-3">
                        {story.cover_image ? (
                          <img
                            src={story.cover_image}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <>
                            <div className={`absolute inset-0 ${pillarColor[story.color]}`} />
                            <div
                              className="absolute inset-0 opacity-10"
                              style={{
                                backgroundImage: "radial-gradient(circle at 30% 50%, white 2px, transparent 2px)",
                                backgroundSize: "24px 24px",
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white/20 text-6xl font-bold">{story.tag.toUpperCase()}</div>
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${pillarColor[story.color]}`}>
                              {story.tag}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-white">
                              <Star className="h-3 w-3 fill-current" />
                              Featured
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:underline">
                            {story.title}
                          </h3>
                          <p className="text-sm text-white/90 line-clamp-2">{story.excerpt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{story.place}</span>
                        <span>·</span>
                        <span>{story.date}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn-style container */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Sidebar - Sticky */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Profile Card */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-dash-navy to-dash-red"></div>
              <div className="px-4 pb-4 -mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                    A
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Hub Network</h3>
                <p className="text-sm text-gray-600 mb-4">Localisation Hub · Africa</p>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stories viewed</span>
                    <span className="font-bold text-dash-red">247</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Network updates</span>
                    <span className="font-bold text-dash-red">{news.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                </h3>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${cat.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Items */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Saved items</h3>
              <p className="text-sm text-gray-600">Save stories to read later</p>
            </div>
          </div>

          {/* Main Feed - Center */}
          <div className="lg:col-span-6 space-y-4">
            {/* Create Post Card */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                  A
                </div>
                <button className="flex-1 text-left px-4 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                  Start a post
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors">
                  <Newspaper className="h-4 w-4 text-dash-red" />
                  <span>Write article</span>
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <button className="text-xs font-medium text-gray-700 hover:underline">Top</button>
            </div>

            {/* News Feed */}
            <div className="space-y-4">
              {/* Loading State */}
              {isLoading && (
                <>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-white rounded border border-gray-200 p-4 animate-pulse">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-12 w-12 rounded bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-white rounded border border-red-200 p-8 text-center">
                  <Newspaper className="h-12 w-12 text-red-300 mx-auto mb-3" />
                  <p className="text-red-600 font-medium mb-2">Failed to load articles</p>
                  <p className="text-sm text-gray-500">Please try refreshing the page</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && news.length === 0 && (
                <div className="bg-white rounded border border-gray-200 p-12 text-center">
                  <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">No stories published yet</p>
                  <p className="text-sm text-gray-400">Check back later for updates from the network</p>
                </div>
              )}

              {/* News Items */}
              {!isLoading && !error && news.map((n, index) => (
                <div key={n.slug} className="bg-white rounded border border-gray-200">
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-12 w-12 rounded shrink-0 ${pillarColor[n.color]} flex items-center justify-center text-white font-bold text-lg`}>
                        {n.tag.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">{n.tag}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{n.place}</span>
                          <span>·</span>
                          <span>{n.date}</span>
                          {index === 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-dash-red font-medium">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Featured
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <Link to={`/news/${n.slug}`} className="block px-4 pb-3 hover:bg-gray-50 transition-colors">
                    <h2 className="font-bold text-gray-900 mb-2 leading-snug">{n.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{n.excerpt}</p>
                  </Link>

                  {/* Post Visual - Show cover image if available, otherwise show featured placeholder */}
                  {(n.cover_image || index === 0) && (
                    <div className="mx-4 mb-3 h-48 rounded relative overflow-hidden">
                      {n.cover_image ? (
                        <img
                          src={n.cover_image}
                          alt={n.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <div className={`absolute inset-0 ${pillarColor[n.color]}`} />
                          <div
                            className="absolute inset-0 opacity-10"
                            style={{
                              backgroundImage: "radial-gradient(circle at 30% 50%, white 2px, transparent 2px)",
                              backgroundSize: "24px 24px",
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/20 text-6xl font-bold">{n.tag.toUpperCase()}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-around">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">Comment</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Featured News */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-4 w-4 text-dash-red" />
                  Featured
                </h3>
              </div>
              <div className="space-y-3">
                {news.slice(0, 3).map((n) => (
                  <Link
                    key={n.slug}
                    to={`/news/${n.slug}`}
                    className="block p-3 rounded border border-gray-200 hover:border-dash-red/30 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 shrink-0 rounded ${pillarColor[n.color]} flex items-center justify-center text-white font-bold text-sm`}>
                        {n.tag.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{n.title}</h4>
                        <p className="text-xs text-gray-600">{n.place}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Resources */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resources
                </h3>
                <Link to="/knowledge" className="text-xs font-medium text-dash-red hover:underline">
                  Browse
                </Link>
              </div>
              <div className="space-y-3">
                {publications.slice(0, 3).map((pub) => (
                  <div
                    key={pub.slug}
                    className="p-3 rounded border border-gray-200 hover:border-dash-red/30 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${pillarColor[pub.pillar]}`}>
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">{pub.title}</h4>
                        <p className="text-[10px] text-gray-600">{pub.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Feed */}
            <div className="bg-white rounded border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Add to your feed</h3>
              <p className="text-xs text-gray-600 mb-3">Follow categories and pillars to see more content</p>
              <div className="space-y-2">
                {categories.slice(0, 2).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded ${cat.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {cat.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <button className="text-xs font-medium text-dash-red hover:bg-gray-50 px-3 py-1 rounded border border-gray-300">
                      + Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
