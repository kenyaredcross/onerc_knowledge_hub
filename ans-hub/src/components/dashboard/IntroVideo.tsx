import { useFrappeGetCall } from "frappe-react-sdk";
import {
  BookOpen,
  Calendar,
  Images,
  Newspaper,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasAnyRole, MANAGER_ROLES, useRoles } from "../auth/RoleRoute";

type IntroVideoData = {
  enabled: boolean;
  title?: string;
  description?: string;
  poster?: string | null;
  kind?: "iframe" | "file" | null;
  src?: string | null;
  has_video?: boolean;
};

/**
 * Orientation panel for the Overview page: an introductory video plus the four
 * ways a member can contribute. Content is managed in Localization Hub
 * Settings, and the whole section hides if an administrator turns it off.
 */
export default function IntroVideo() {
  const { t } = useTranslation(["dashboard", "navigation", "gallery"]);
  const canCreateAlbum = hasAnyRole(useRoles(), MANAGER_ROLES);

  const { data } = useFrappeGetCall<{ message: IntroVideoData }>(
    "onerc_knowledge_hub.api.overview.get_intro_video",
  );

  const intro = data?.message;

  if (!intro?.enabled) return null;

  const contributeLinks = [
    {
      to: "/create/news",
      label: t("navigation:newsStories"),
      description: t("dashboard:contributeNews"),
      icon: Newspaper,
    },
    {
      to: "/create/event",
      label: t("navigation:events"),
      description: t("dashboard:contributeEvents"),
      icon: Calendar,
    },
    {
      to: "/create/knowledge",
      label: t("navigation:knowledgeHub"),
      description: t("dashboard:contributeKnowledge"),
      icon: BookOpen,
    },
    // Adding an album is manager-and-above, so do not offer it to everyone.
    ...(canCreateAlbum
      ? [
          {
            to: "/create/album",
            label: t("navigation:gallery"),
            description: t("dashboard:contributeGallery"),
            icon: Images,
          },
        ]
      : []),
  ];

  return (
    <section className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-2">
        {/* Player */}
        <div className="relative bg-dash-navy">
          {intro.has_video && intro.kind === "iframe" && intro.src && (
            <div className="aspect-video w-full">
              <iframe
                src={intro.src}
                title={intro.title || t("dashboard:introVideoTitle")}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {intro.has_video && intro.kind === "file" && intro.src && (
            <div className="aspect-video w-full">
              <video
                src={intro.src}
                poster={intro.poster || undefined}
                controls
                preload="metadata"
                className="h-full w-full bg-black object-contain"
              />
            </div>
          )}

          {!intro.has_video && (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 p-8 text-center">
              <PlayCircle className="h-12 w-12 text-white/30" />
              <p className="text-sm font-semibold text-white/80">
                {t("dashboard:introVideoComingSoon")}
              </p>
              <p className="max-w-xs text-xs text-white/50">
                {t("dashboard:introVideoComingSoonHint")}
              </p>
            </div>
          )}
        </div>

        {/* Orientation copy and the ways to contribute */}
        <div className="p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-dash-red">
            <Sparkles className="h-3.5 w-3.5" />
            {t("dashboard:newHere")}
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {intro.title || t("dashboard:introVideoTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {intro.description || t("dashboard:introVideoDescription")}
          </p>

          <p className="mt-6 text-xs font-bold uppercase tracking-wider text-gray-500">
            {t("dashboard:waysToContribute")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {contributeLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:border-dash-red/40 hover:bg-gray-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-navy/5 text-dash-navy transition-colors group-hover:bg-dash-red/10 group-hover:text-dash-red">
                  <link.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-gray-500">
                    {link.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
