import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Images,
  Loader2,
  MapPin,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MultiImageUploadField,
  type UploadedPhoto,
} from "../fields/MultiImageUploadField";
import { withCsrfRetry } from "../../lib/csrf";
import {
  formatAlbumDate,
  type AlbumDetailData,
  type AlbumPhoto,
} from "../../lib/gallery";

export default function AlbumDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["gallery", "common"]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<UploadedPhoto[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useFrappeGetCall<{
    message: AlbumDetailData;
  }>("onerc_knowledge_hub.api.gallery.get_album", { name }, `album-${name}`);

  const { call: recordView } = useFrappePostCall(
    "onerc_knowledge_hub.api.gallery.record_album_view",
  );
  const { call: addPhotos, loading: isAdding } = useFrappePostCall(
    "onerc_knowledge_hub.api.gallery.add_photos",
  );
  const { call: removePhoto } = useFrappePostCall(
    "onerc_knowledge_hub.api.gallery.remove_photo",
  );
  const { call: deleteAlbum } = useFrappePostCall(
    "onerc_knowledge_hub.api.gallery.delete_album",
  );

  const album = data?.message;
  const photos = useMemo(() => album?.photos || [], [album]);

  // Count the visit once per album, and never let a failure break the page.
  const countedRef = useRef<string | null>(null);
  useEffect(() => {
    const albumName = album?.name;
    if (!albumName || countedRef.current === albumName) return;

    countedRef.current = albumName;
    recordView({ name: albumName }).catch(() => undefined);
    // recordView is recreated on every render, so it is deliberately not a
    // dependency here; the ref is what keeps this to one call per album.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album?.name]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setLightboxIndex((current) => {
        if (current === null || photos.length === 0) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, step]);

  const handleAddPhotos = async () => {
    if (!album || pendingPhotos.length === 0) return;
    setActionError(null);
    try {
      await withCsrfRetry(() =>
        addPhotos({ album: album.name, photos: JSON.stringify(pendingPhotos) }),
      );
      setPendingPhotos([]);
      setShowUpload(false);
      await mutate();
    } catch (err: any) {
      setActionError(err?.message || "Could not add the photos.");
    }
  };

  const handleRemovePhoto = async (photo: AlbumPhoto) => {
    if (!album) return;
    setActionError(null);
    try {
      await withCsrfRetry(() =>
        removePhoto({ album: album.name, photo: photo.name }),
      );
      closeLightbox();
      await mutate();
    } catch (err: any) {
      setActionError(err?.message || "Could not remove the photo.");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    setActionError(null);
    try {
      await withCsrfRetry(() => deleteAlbum({ name: album.name }));
      navigate("/gallery");
    } catch (err: any) {
      setActionError(err?.message || "Could not delete the album.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dash-red" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Images className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-sm text-gray-500">{t("gallery:noAlbums")}</p>
        <Link
          to="/gallery"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dash-red"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("gallery:backToGallery")}
        </Link>
      </div>
    );
  }

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Link
            to="/gallery"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("gallery:backToGallery")}
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {album.event_name && (
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dash-red">
                  {album.event_name}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {album.album_title}
                </h1>
                {!album.is_published && (
                  <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                    {t("gallery:draft")}
                  </span>
                )}
              </div>
              {album.description && (
                <p className="mt-3 text-sm text-gray-600">{album.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <Images className="h-3.5 w-3.5" />
                  {photos.length}{" "}
                  {photos.length === 1 ? t("gallery:photo") : t("gallery:photos")}
                </span>
                {formatAlbumDate(album.album_date) && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatAlbumDate(album.album_date)}
                  </span>
                )}
                {album.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {album.location}
                  </span>
                )}
                {(album.author_national_society || album.author_name) && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {t("gallery:uploadedBy")}{" "}
                    {album.author_national_society || album.author_name}
                  </span>
                )}
              </div>
            </div>

            {album.can_edit && (
              <div className="flex shrink-0 flex-wrap gap-3">
                <button
                  onClick={() => setShowUpload((open) => !open)}
                  className="inline-flex items-center gap-2 rounded bg-dash-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-dash-red/90"
                >
                  <Upload className="h-4 w-4" />
                  {photos.length
                    ? t("gallery:addMorePhotos")
                    : t("gallery:addPhotos")}
                </button>
                <button
                  onClick={handleDeleteAlbum}
                  className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("gallery:deleteAlbum")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {actionError && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* Upload panel */}
        {showUpload && album.can_edit && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6">
            <MultiImageUploadField
              value={pendingPhotos}
              onChange={setPendingPhotos}
              label={t("gallery:addPhotos")}
              captionPlaceholder={t("gallery:captionPlaceholder")}
              creditPlaceholder={t("gallery:creditPlaceholder")}
            />
            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setPendingPhotos([]);
                }}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t("common:cancel", "Cancel")}
              </button>
              <button
                onClick={handleAddPhotos}
                disabled={pendingPhotos.length === 0 || isAdding}
                className="inline-flex items-center gap-2 rounded bg-dash-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-dash-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("gallery:saveChanges")}
              </button>
            </div>
          </div>
        )}

        {/* Photo grid */}
        {photos.length === 0 ? (
          <div className="rounded border border-gray-200 bg-white py-20 text-center">
            <Images className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">{t("gallery:noPhotos")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <button
                key={photo.name}
                onClick={() => setLightboxIndex(index)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-all hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={photo.image}
                    alt={photo.caption || `${album.album_title} ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
                    <p className="line-clamp-2 text-xs font-medium text-white">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            aria-label={t("gallery:close")}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label={t("gallery:previous")}
                className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label={t("gallery:next")}
                className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="flex max-h-full w-full max-w-5xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.image}
              alt={activePhoto.caption || album.album_title}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
            />
            <div className="w-full text-center">
              {activePhoto.caption && (
                <p className="text-sm font-medium text-white">
                  {activePhoto.caption}
                </p>
              )}
              {activePhoto.credit && (
                <p className="mt-1 text-xs text-white/60">
                  &copy; {activePhoto.credit}
                </p>
              )}
              <p className="mt-2 text-xs text-white/50">
                {(lightboxIndex ?? 0) + 1} / {photos.length}
              </p>
              {album.can_edit && (
                <button
                  onClick={() => handleRemovePhoto(activePhoto)}
                  className="mt-4 inline-flex items-center gap-2 rounded border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("gallery:removePhoto")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
