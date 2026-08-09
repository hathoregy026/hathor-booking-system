/**
 * Amenities rising chapter (`home-am-video` / CMS slot `home-amenities-2`).
 *
 * Same pattern as the homepage hero video (`HATHOR_HERO_VIDEO_SRC` in branding.ts):
 * static MP4 under `/public/media/hathor/videos/`, poster from the CMS image slot.
 *
 * When the reel is ready:
 * 1. Save the file as `public/media/hathor/videos/hathor-amenities-rising-chapter.mp4`
 * 2. Set `HATHOR_AMENITIES_RISING_VIDEO_SRC` to that path (uncomment below)
 * Until then the CMS photo for `home-amenities-2` stays full-bleed.
 */
export const HATHOR_AMENITIES_RISING_VIDEO_SRC: string | null = null;
// export const HATHOR_AMENITIES_RISING_VIDEO_SRC =
//   "/media/hathor/videos/hathor-amenities-rising-chapter.mp4";

/** Optional phone MP4 — when null, phones keep the CMS poster (same as hero). */
export const HATHOR_AMENITIES_RISING_VIDEO_MOBILE_SRC: string | null = null;
