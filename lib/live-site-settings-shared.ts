import { z } from "zod";

export const LIVE_SITE_SETTINGS_KEY = "live-site";

/** Default Coming Soon background — sepia Hathor / Nile illustration. */
export const DEFAULT_LIVE_SITE_BG_SRC = "/branding/hathor-coming-soon-bg.png";

export const liveSiteSettingsSchema = z.object({
  /**
   * When true, the public site is shown normally.
   * When false, visitors see Coming Soon (admin stays available).
   */
  enabled: z.boolean(),
  /** Full-bleed Coming Soon background (rendered at 10% opacity). */
  backgroundImageUrl: z.string().trim().min(1).max(2048),
});

export type LiveSiteSettings = z.infer<typeof liveSiteSettingsSchema>;

export const DEFAULT_LIVE_SITE_SETTINGS: LiveSiteSettings = {
  enabled: true,
  backgroundImageUrl: DEFAULT_LIVE_SITE_BG_SRC,
};

function sanitizeImageUrl(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_LIVE_SITE_SETTINGS.backgroundImageUrl;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_LIVE_SITE_SETTINGS.backgroundImageUrl;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed.slice(0, 2048);
  }
  return DEFAULT_LIVE_SITE_SETTINGS.backgroundImageUrl;
}

export function parseLiveSiteSettings(raw: unknown): LiveSiteSettings {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const candidate: LiveSiteSettings = {
    enabled:
      typeof src.enabled === "boolean"
        ? src.enabled
        : DEFAULT_LIVE_SITE_SETTINGS.enabled,
    backgroundImageUrl: sanitizeImageUrl(src.backgroundImageUrl),
  };

  const parsed = liveSiteSettingsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_LIVE_SITE_SETTINGS;
}

export function isLiveSiteSettingsEqual(
  a: LiveSiteSettings,
  b: LiveSiteSettings,
): boolean {
  return (
    a.enabled === b.enabled && a.backgroundImageUrl === b.backgroundImageUrl
  );
}
