import type { AdminTheme } from "@/lib/admin-theme";
import { hathorImage } from "@/lib/hathor-media";

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

/** Homepage hero wordmark — centered over video */
export const HATHOR_MAIN_LOGO_SRC =
  "/branding/hathor-main-logo-egypt-toors.svg";

/** Home hero second line — replaces "Dahabiya Cruise" script text */
export const HATHOR_DAHABIYA_WORDMARK_SRC =
  "/branding/dahabiya-cruise-nile-cruises-and-tours.webp";

/** Custom site-wide pointer — tip hotspot at ~11×1 in 32×32 viewBox */
export const HATHOR_CURSOR_SRC =
  "/branding/hathor-mouse-arrow-egypt-tours-GOLDEN.svg";
export const HATHOR_BRAND_NAME = "HATHOR";

/** Admin panel — day / dark wordmarks from assets/LOGOS. */
export const HATHOR_ADMIN_LOGO_DAY_SRC = "/branding/hathor-logo-nile-cruise-day-mode.webp";
export const HATHOR_ADMIN_LOGO_DARK_SRC = "/branding/hathor-logo-nile-cruise.webp";

/** Admin login — white Hathor icon (same as public hero header). */
export const HATHOR_ADMIN_LOGIN_ICON_SRC = HATHOR_HERO_ICON_SRC;

/** Full-bleed homepage hero — Vercel static CDN (same origin, edge-cached). */
export const HATHOR_HERO_VIDEO_SRC =
  "/media/hathor/videos/hathor-luxury-nile-cruise-promo-bestofegypt.mp4";

/** Hero poster while video buffers — local Hathor still. */
export const HATHOR_HERO_POSTER_SRC = hathorImage("home-hero-poster");

export function getHathorLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;
}

export function getHathorAdminLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_ADMIN_LOGO_DAY_SRC : HATHOR_ADMIN_LOGO_DARK_SRC;
}
