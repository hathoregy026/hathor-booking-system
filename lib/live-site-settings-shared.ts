export const LIVE_SITE_SETTINGS_KEY = "live-site";

/** Default Coming Soon background — sepia Hathor / Nile illustration. */
export const DEFAULT_LIVE_SITE_BG_SRC = "/branding/hathor-coming-soon-bg.png";

/*
 * Validation (zod) lives in `live-site-settings-schema.ts`, which only the
 * server and the dashboard load — this file is also part of every public page.
 */
export type LiveSiteSettings = {
  /**
   * When true, the public site is shown normally everywhere.
   * When false, Coming Soon shows on the custom domain only —
   * Vercel / localhost keep the real site (admin always available).
   */
  enabled: boolean;
  /** Full-bleed Coming Soon background (rendered at 10% opacity). */
  backgroundImageUrl: string;
};

export const DEFAULT_LIVE_SITE_SETTINGS: LiveSiteSettings = {
  enabled: true,
  backgroundImageUrl: DEFAULT_LIVE_SITE_BG_SRC,
};

export function isLiveSiteSettingsEqual(
  a: LiveSiteSettings,
  b: LiveSiteSettings,
): boolean {
  return (
    a.enabled === b.enabled && a.backgroundImageUrl === b.backgroundImageUrl
  );
}
