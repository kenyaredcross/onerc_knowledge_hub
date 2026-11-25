import { useFrappeGetCall } from "frappe-react-sdk";
import {
  Calendar,
  Eye,
  Images,
  Loader2,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatAlbumDate, type GalleryAlbum } from "../../lib/gallery";

export default function GalleryIndex() {
  const { t } = useTranslation(["gallery", "common"]);
  const [eventFilter, setEventFilter] = useState<string>("all");

  const { data, isLoading } = useFrappeGetCall<{ message: GalleryAlbum[] }>(
    "onerc_knowledge_hub.api.gallery.get_albums",
    { include_unpublished: 1 },
  );

  const albums = useMemo(() => data?.message || [], [data]);

  const events = useMemo(() => {
    const counts = new Map<string, number>();
    albums.forEach((album) => {
      if (album.event_name) {
        counts.set(album.event_name, (counts.get(album.event_name) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    if (eventFilter === "all") return albums;
    return albums.filter((album) => album.event_name === eventFilter);
  }, [albums, eventFilter]);

  const totalPhotos = useMemo(
    () => albums.reduce((sum, album) => sum + (album.photo_count || 0), 0),
    [albums],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-dash-red">
                <Images className="h-3.5 w-3.5" />
                {t("gallery:title")}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("gallery:title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                {t("gallery:subtitle")}
              </p>
              {albums.length > 0 && (
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                  {albums.length} {t("gallery:albums")} &middot; {totalPhotos}{" "}
                  {t("gallery:photos")}
                </p>
              )}
            </div>
            <Link
              to="/create/album"
              className="inline-flex items-center gap-2 self-start rounded bg-dash-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dash-red/90"
            >
              <Plus className="h-4 w-4" />
              {t("gallery:newAlbum")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Event filter */}
        {events.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEventFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                eventFilter === "all"
                  ? "bg-dash-navy text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {t("gallery:allAlbums")} ({albums.length})
            </button>
            {events.map((event) => (
              <button
                key={event.name}
                onClick={() => setEventFilter(event.name)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  eventFilter === event.name
                    ? "bg-dash-navy text-white"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {event.name} ({event.count})
              </button>
            ))}
          </div>
        )}

        {filteredAlbums.length === 0 ? (
          <div className="rounded border border-gray-200 bg-white py-20 text-center">
            <Images className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm font-semibold text-gray-700">
              {t("gallery:noAlbums")}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              {t("gallery:noAlbumsHint")}
            </p>
            <Link
              to="/create/album"
              className="mt-6 inline-flex items-center gap-2 rounded bg-dash-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dash-red/90"
            >
              <Plus className="h-4 w-4" />
              {t("gallery:newAlbum")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAlbums.map((album) => (
              <Link
                key={album.name}
                to={`/gallery/${album.name}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {album.cover_image ? (
                    <img
                      src={album.cover_image}
                      alt={album.album_title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Images className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 rounded bg-black/65 px-2 py-1 text-xs font-semibold text-white">
                    {album.photo_count || 0}{" "}
                    {album.photo_count === 1
                      ? t("gallery:photo")
                      : t("gallery:photos")}
                  </span>
                  {!album.is_published && (
                    <span className="absolute right-3 top-3 rounded bg-amber-500 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      {t("gallery:draft")}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {album.event_name && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dash-red">
                      {album.event_name}
                    </p>
                  )}
                  <h2 className="line-clamp-2 text-base font-bold text-gray-900 group-hover:text-dash-red">
                    {album.album_title}
                  </h2>
                  {album.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {album.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-1.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    {formatAlbumDate(album.album_date) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatAlbumDate(album.album_date)}
                      </div>
                    )}
                    {album.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {album.location}
                      </div>
                    )}
                    {(album.author_national_society || album.author_name) && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {album.author_national_society || album.author_name}
                      </div>
                    )}
                    {album.view_count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {album.view_count} {t("gallery:views")}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
