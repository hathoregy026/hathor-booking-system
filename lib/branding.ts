import type { AdminTheme } from "@/lib/admin-theme";

export const HATHOR_LOGO_SRC = "/branding/hathor-logo-nile-cruise.webp";
export const HATHOR_LOGO_DAY_SRC =
  "/branding/hathor-logo-nile-cruise-day-mode.webp";
export const HATHOR_FAVICON_SRC = "/branding/hathor-logo-nile-cruise-favicon.webp";
export const HATHOR_BRAND_NAME = "HATHOR";

export function getHathorLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;
}
