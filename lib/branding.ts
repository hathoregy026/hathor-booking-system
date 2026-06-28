import type { AdminTheme } from "@/lib/admin-theme";
import { hathorImage, hathorVideo } from "@/lib/hathor-media";

/** Hero header icon — default (light on hero video) */
export const HATHOR_HERO_ICON_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON.svg";

/** Hero header icon — day mode menu hover */
export const HATHOR_HERO_ICON_DARK_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg";

/** Header logo — dark / night mode */
export const HATHOR_LOGO_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-golden-for-dark.svg";

/** Header logo — day mode */
export const HATHOR_LOGO_DAY_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-golden.svg";

/** Footer logo — dark / night mode */
export const HATHOR_FOOTER_LOGO_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-white.svg";

/** Footer logo — day mode */
export const HATHOR_FOOTER_LOGO_DAY_SRC =
  "/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-black.svg";

export const HATHOR_FAVICON_SRC = "/branding/hathor-logo-nile-cruise-favicon.webp";
export const HATHOR_BRAND_NAME = "HATHOR";

/** Same-origin hero video (fast on Vercel). */
export const HATHOR_HERO_VIDEO_LOCAL_SRC = hathorVideo("hero-promo");

/** Supabase fallback — Hathor boat reel (with audio when encoded in source). */
export const HATHOR_HERO_VIDEO_SUPABASE_SRC =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/videos/hathor-hero-promo.mp4";

export const HATHOR_HERO_VIDEO_SOURCES = [
  HATHOR_HERO_VIDEO_LOCAL_SRC,
  HATHOR_HERO_VIDEO_SUPABASE_SRC,
] as const;

/** @deprecated Use HATHOR_HERO_VIDEO_SOURCES */
export const HATHOR_HERO_VIDEO_SRC = HATHOR_HERO_VIDEO_SUPABASE_SRC;

/** Hero poster while video buffers — local Hathor still. */
export const HATHOR_HERO_POSTER_SRC = hathorImage("home-hero-poster");

export function getHathorLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;
}
