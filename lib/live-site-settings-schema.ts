import { z } from "zod";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";

/* Server and dashboard only: public pages read the settings the server has
   already parsed, and never need zod in their bundle. */
export const liveSiteSettingsSchema = z.object({
  enabled: z.boolean(),
  backgroundImageUrl: z.string().trim().min(1).max(2048),
}) satisfies z.ZodType<LiveSiteSettings>;

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
