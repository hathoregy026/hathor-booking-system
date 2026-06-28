import type { AdminTheme } from "@/lib/admin-theme";

export const HATHOR_LOGO_SRC = "/branding/hathor-logo-nile-cruise.webp";
export const HATHOR_LOGO_DAY_SRC =
  "/branding/hathor-logo-nile-cruise-day-mode.webp";
export const HATHOR_FAVICON_SRC = "/branding/hathor-logo-nile-cruise-favicon.webp";
export const HATHOR_BRAND_NAME = "HATHOR";

/** Full-bleed homepage hero background (synced from assets/ on build). */
export const HATHOR_HERO_VIDEO_SRC = "/videos/Hathor-Luxor-Promo-nile-cruise.mp4";

export function getHathorLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;
}
