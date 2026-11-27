import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import {
  ArrowLeft,
  Calendar,
  Images,
  Info,
  Loader2,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileUploadField } from "../fields/FileUploadField";
import { LinkField } from "../fields/LinkField";
import {
  MultiImageUploadField,
  type UploadedPhoto,
} from "../fields/MultiImageUploadField";
import { withCsrfRetry } from "../../lib/csrf";
import { formatAlbumDate, type GalleryAlbum } from "../../lib/gallery";

export default function NewAlbum() {
  const { t } = useTranslation(["gallery", "forms", "common"]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    album_title: "",
    event_name: "",
    album_date: "",
    location: "",
    description: "",
    national_society: "",
    cover_image: "",
    is_published: 1,
  });
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateField = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const {
    data: albumsData,
    isLoading: albumsLoading,
    mutate,
  } = useFrappeGetCall<{ message: GalleryAlbum[] }>(
    "onerc_knowledge_hub.api.gallery.get_albums",
    { include_unpublished: 1 },
    "my-albums",
  );

  const {
    call: createAlbum,
    loading: isSubmitting,
    error: submitError,
  } = useFrappePostCall("onerc_knowledge_hub.api.gallery.create_album");

  const myAlbums = useMemo(
    () => (albumsData?.message || []).filter((album) => album.can_edit),
    [albumsData],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!form.album_title.trim()) {
      setValidationError(t("gallery:titleRequired"));
      return;
    }
    if (photos.length === 0) {
      setValidationError(t("gallery:photoRequired"));
      return;
    }

    try {
      const response = await withCsrfRetry(() =>
        createAlbum({
          ...form,
          photos: JSON.stringify(photos),
        }),
      );
      const created = response?.message;
      await mutate();
      if (created?.name) {
        navigate(`/gallery/${created.name}`);
      } else {
        navigate("/gallery");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const linkFieldClasses = {
    buttonClassName: "rounded-2xl border-gray-200 bg-gray-50 text-gray-900",
    dropdownClassName: "rounded-2xl border border-gray-200 shadow-2xl",
    inputClassName: "h-12 text-sm",
    optionClassName: "rounded-xl",
    activeOptionClassName: "bg-dash-red/10 text-dash-red",
  };

  const inputClass =
    "h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10";

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link
            to="/gallery"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-dash-red"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("gallery:backToGallery")}
          </Link>

          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-dash-red/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-dash-red">
              <Images className="h-3.5 w-3.5" />
              {t("gallery:title")}
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900">
              {t("gallery:newAlbum")}
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              {t("gallery:subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Album details */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("gallery:albumTitle")}
                </h2>
                <p className="text-sm text-gray-600">
                  {t("gallery:subtitle")}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t("gallery:albumTitle")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.album_title}
                  onChange={(e) => updateField("album_title", e.target.value)}
                  placeholder="Localisation Alliance Leadership Conference"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t("gallery:eventName")}
                </label>
                <input
                  type="text"
                  value={form.event_name}
                  onChange={(e) => updateField("event_name", e.target.value)}
                  placeholder="IoME Peer Learning Event"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  {t("gallery:filterByEvent")}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t("gallery:eventDate")}
                </label>
                <input
                  type="date"
                  value={form.album_date}
                  onChange={(e) => updateField("album_date", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t("gallery:location")}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Nairobi, Kenya"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <LinkField
                  doctype="National Society"
                  label={t("forms:nationalSociety", "National Society")}
                  value={form.national_society}
                  onChange={(val) => updateField("national_society", val)}
                  {...linkFieldClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  {t("gallery:description")}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                />
              </div>

              <div className="md:col-span-2">
                <FileUploadField
                  label={t("gallery:coverImage")}
                  value={form.cover_image}
                  onChange={(url) => updateField("cover_image", url || "")}
                  accept=".png,.jpg,.jpeg,.webp"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  {t("gallery:coverHint")}
                </p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Images className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("gallery:addPhotos")}
                </h2>
                <p className="text-sm text-gray-600">
                  {photos.length > 0
                    ? t("gallery:photosSelected", { count: photos.length })
                    : t("gallery:selectPhotos")}
                </p>
              </div>
            </div>

            <MultiImageUploadField
              value={photos}
              onChange={setPhotos}
              captionPlaceholder={t("gallery:captionPlaceholder")}
              creditPlaceholder={t("gallery:creditPlaceholder")}
            />
          </div>

          {/* Publish and submit */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!!form.is_published}
                onChange={(e) =>
                  updateField("is_published", e.target.checked ? 1 : 0)
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-dash-red focus:ring-dash-red"
              />
              <span>
                <span className="block text-sm font-bold text-gray-800">
                  {t("gallery:publishAlbum")}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {form.is_published
                    ? t("gallery:published")
                    : t("gallery:draft")}
                </span>
              </span>
            </label>

            {(validationError || submitError) && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {validationError ||
                  (submitError as any)?.message ||
                  "Could not create the album."}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <Link
                to="/gallery"
                className="rounded border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t("common:cancel", "Cancel")}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded bg-dash-red px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-dash-red/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting
                  ? t("gallery:creatingAlbum")
                  : t("gallery:createAlbum")}
              </button>
            </div>
          </div>
        </form>

        {/* Albums this member can manage */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            {t("gallery:myAlbums")}
          </h2>

          {albumsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-dash-red" />
            </div>
          ) : myAlbums.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
              {t("gallery:noAlbums")}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {myAlbums.map((album) => (
                <Link
                  key={album.name}
                  to={`/gallery/${album.name}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {album.cover_image ? (
                      <img
                        src={album.cover_image}
                        alt={album.album_title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Images className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {album.album_title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                      <span>
                        {album.photo_count || 0}{" "}
                        {album.photo_count === 1
                          ? t("gallery:photo")
                          : t("gallery:photos")}
                      </span>
                      {formatAlbumDate(album.album_date) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatAlbumDate(album.album_date)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-xs font-bold uppercase tracking-wide ${
                      album.is_published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {album.is_published
                      ? t("gallery:published")
                      : t("gallery:draft")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
