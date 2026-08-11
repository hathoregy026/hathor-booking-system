/**
 * Amenities rising chapter media:
 * - `home-amenities-2` — base full-bleed under the clip (CMS still / optional reel)
 * - `home-amenities-3` — full sticky stage that rises via clip-path (Bar reel)
 *
 * Same wiring as homepage hero (`HATHOR_HERO_VIDEO_SRC` in branding.ts):
 * static MP4 under `/public/media/hathor/videos/` + CMS poster slot.
 */

/**
 * Slot 3 — full-stage rising clip (`home-am-video__inset`).
 * Vercel static CDN (same origin, edge-cached). Swap with a NEW filename
 * (version suffix) — never overwrite an immutable URL in place.
 * Poster = CMS `home-amenities-3`.
 */
export const HATHOR_AMENITIES_INSET_VIDEO_SRC =
  "/media/hathor/videos/bar-hathor-egypt-cruise-history-meets-luxury-v20260811.mp4";

/**
 * Phone encode for slot 3. Null = poster only on phones (same as hero:
 * `HATHOR_HERO_VIDEO_MOBILE_SRC` is null until a mobile MP4 exists).
 */
export const HATHOR_AMENITIES_INSET_VIDEO_MOBILE_SRC: string | null = null;

/** Slot 2 — base layer under the clip. Null = CMS still only. */
export const HATHOR_AMENITIES_RISING_VIDEO_SRC: string | null = null;

export const HATHOR_AMENITIES_RISING_VIDEO_MOBILE_SRC: string | null = null;
