import {
  BookOpen,
  FileText,
  FolderOpen,
  Grid3x3,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Knowledge() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex flex-col">
      {/* Header Section */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
          </h1>
        </div>
      </div>

      {/* Main Category Cards - Full height container */}
      <div className="flex-1 flex items-start justify-center pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full">
            {/* All Resources Card */}
            <Link
              to="/knowledge/filter/all"
              className="group relative overflow-hidden rounded-lg bg-white border border-gray-200 p-5 sm:p-6 shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] aspect-square flex flex-col justify-between"
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="inline-flex rounded-lg bg-dash-navy/10 p-2 sm:p-2.5">
                    <Grid3x3 className="h-7 w-7 sm:h-8 sm:w-8 text-dash-navy" />
                  </div>
                  <div className="flex items-center text-dash-navy font-semibold">
                    <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">All Resources</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Browse all resources across the platform.
                  </p>
                </div>
              </div>
              {/* Decorative circles - Navy */}
              <div className="absolute -right-5 -bottom-5 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-dash-navy/10" />
              <div className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-dash-navy/15" />
              <div className="absolute right-2 bottom-2 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-dash-navy/20" />
            </Link>

            {/* Publications Card */}
            <Link
              to="/knowledge/filter/publications"
              className="group relative overflow-hidden rounded-lg bg-white border border-gray-200 p-5 sm:p-6 shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] aspect-square flex flex-col justify-between"
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="inline-flex rounded-lg bg-teal-500/10 p-2 sm:p-2.5">
                    <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <div className="flex items-center text-teal-600 font-semibold">
                    <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">Publications</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    View publications and research documents.
                  </p>
                </div>
              </div>
              {/* Decorative circles - Teal */}
              <div className="absolute -right-5 -bottom-5 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-teal-500/10" />
              <div className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-teal-500/15" />
              <div className="absolute right-2 bottom-2 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-teal-500/20" />
            </Link>

            {/* Reports Card */}
            <Link
              to="/knowledge/filter/reports"
              className="group relative overflow-hidden rounded-lg bg-white border border-gray-200 p-5 sm:p-6 shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] aspect-square flex flex-col justify-between"
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="inline-flex rounded-lg bg-yellow-400/10 p-2 sm:p-2.5">
                    <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600" />
                  </div>
                  <div className="flex items-center text-yellow-600 font-semibold">
                    <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">Reports</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Access reports and analytics documents.
                  </p>
                </div>
              </div>
              {/* Decorative stacked elements - Yellow */}
              <div className="absolute -right-4 -bottom-4 h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-yellow-400/10 rotate-12" />
              <div className="absolute -right-2 -bottom-2 h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-yellow-400/15 rotate-6" />
              <div className="absolute -right-1 -bottom-1 h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-yellow-400/20" />
            </Link>

            {/* Tools & Templates Card */}
            <Link
              to="/knowledge/filter/templates"
              className="group relative overflow-hidden rounded-lg bg-white border border-gray-200 p-5 sm:p-6 shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] aspect-square flex flex-col justify-between"
            >
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="inline-flex rounded-lg bg-rose-400/10 p-2 sm:p-2.5">
                    <FolderOpen className="h-7 w-7 sm:h-8 sm:w-8 text-rose-600" />
                  </div>
                  <div className="flex items-center text-rose-600 font-semibold">
                    <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">Tools & Templates</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Download shared tools and templates.
                  </p>
                </div>
              </div>
              {/* Decorative semi-circles - Rose */}
              <div className="absolute -right-5 -bottom-5 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-rose-400/10" />
              <div className="absolute -right-7 bottom-2 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-rose-400/15" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
