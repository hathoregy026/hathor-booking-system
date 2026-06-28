import type { AdminTheme } from "@/lib/admin-theme";

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

/** Full-bleed homepage hero — hosted on Supabase Storage. */
export const HATHOR_HERO_VIDEO_SRC =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/videos/hathor-luxury-nile-cruise-promo.mp4.mp4";

/** Nile poster while hero video metadata loads (mobile / slow connections). */
export const HATHOR_HERO_POSTER_SRC =
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=80";

export function getHathorLogoSrc(theme: AdminTheme): string {
  return theme === "day" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;
}
