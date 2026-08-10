/**
 * Amenities intro fullscreen (`home-am-intro` / CMS slot `home-amenities-1`).
 * The sticky under-next “scroll hole” chapter — first full-bleed after the hero band.
 *
 * Rising chapter (`home-am-video` / `home-amenities-2`) stays a CMS still until its
 * own reel is set via `HATHOR_AMENITIES_RISING_VIDEO_SRC`.
 */
export const HATHOR_AMENITIES_INTRO_VIDEO_SRC =
  "/media/hathor/videos/bar-hathor-egypt-cruise-history-meets-luxury.mp4";

/** Compact reel — phones may use the same file. */
export const HATHOR_AMENITIES_INTRO_VIDEO_MOBILE_SRC =
  HATHOR_AMENITIES_INTRO_VIDEO_SRC;

/**
 * Amenities rising chapter (`home-am-video` / CMS slot `home-amenities-2`).
 * Null = CMS photo only (do not reuse the intro Bar reel here).
 */
export const HATHOR_AMENITIES_RISING_VIDEO_SRC: string | null = null;

/** Optional phone MP4 for the rising chapter — null keeps CMS poster. */
export const HATHOR_AMENITIES_RISING_VIDEO_MOBILE_SRC: string | null = null;
