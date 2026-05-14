import { Link } from "react-router-dom";
import { Newspaper, TrendingUp, Activity, ArrowUpRight, ChevronRight, BookOpen, Filter, Star } from "lucide-react";
import { news, pillarColor, publications } from "../../lib/site-data";

const categories = [
  { name: "Leadership", color: "bg-pillar-leadership", count: news.filter(n => n.color === "leadership").length },
  { name: "Branch Development", color: "bg-pillar-branch", count: news.filter(n => n.color === "branch").length },
  { name: "Resource Mobilisation", color: "bg-pillar-resource", count: news.filter(n => n.color === "resource").length },
  { name: "Finance Development", color: "bg-pillar-finance", count: news.filter(n => n.color === "finance").length },
];

export default function NewsIndex() {
  return (
    <div className="min-h-full bg-gray-50">
      {/* LinkedIn-style container */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
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
              {news.map((n, index) => (
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

                  {/* Post Visual (for featured/first item) */}
                  {index === 0 && (
                    <div className={`mx-4 mb-3 h-48 rounded ${pillarColor[n.color]} relative overflow-hidden`}>
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

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
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
