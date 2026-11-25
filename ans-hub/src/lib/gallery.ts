export type GalleryAlbum = {
  name: string;
  album_title: string;
  album_date: string | null;
  pillar: string | null;
  description: string | null;
  event_name: string | null;
  event_route: string | null;
  location: string | null;
  national_society: string | null;
  cover_image: string | null;
  is_published: number;
  photo_count: number;
  view_count: number;
  author_name?: string | null;
  author_national_society?: string | null;
  can_edit?: boolean;
};

export type AlbumPhoto = {
  name: string;
  idx: number;
  image: string;
  caption: string | null;
  credit: string | null;
};

export type AlbumDetailData = GalleryAlbum & { photos: AlbumPhoto[] };

/** Render an album's event date in the viewer's locale, or nothing if unset. */
export function formatAlbumDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
