import { z } from "zod";
import { HATHOR_WELCOME_ABOARD_SRC } from "@/lib/branding";

export const WELCOME_SPLASH_SETTINGS_KEY = "welcome-splash";

export const welcomeSplashSettingsSchema = z.object({
  /** When false, the full-screen welcome preload is skipped on land. */
  enabled: z.boolean(),
  /** Full-screen splash image URL (CDN or /branding path). */
  imageUrl: z.string().trim().min(1).max(2048),
});

export type WelcomeSplashSettings = z.infer<typeof welcomeSplashSettingsSchema>;

/**
 * Hard kill for the gold "Welcome Aboard" land preload.
 * Not professional for this brand — public site never shows it, even if CMS is on.
 * Admin preload settings remain for assets / future use.
 */
export const WELCOME_SPLASH_PUBLIC_ENABLED = false;

export const DEFAULT_WELCOME_SPLASH_SETTINGS: WelcomeSplashSettings = {
  enabled: false,
  imageUrl: HATHOR_WELCOME_ABOARD_SRC,
};

function sanitizeImageUrl(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_WELCOME_SPLASH_SETTINGS.imageUrl;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_WELCOME_SPLASH_SETTINGS.imageUrl;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed.slice(0, 2048);
  }
  return DEFAULT_WELCOME_SPLASH_SETTINGS.imageUrl;
}

export function parseWelcomeSplashSettings(raw: unknown): WelcomeSplashSettings {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const candidate: WelcomeSplashSettings = {
    enabled:
      typeof src.enabled === "boolean"
        ? src.enabled
        : DEFAULT_WELCOME_SPLASH_SETTINGS.enabled,
    imageUrl: sanitizeImageUrl(src.imageUrl),
  };

  const parsed = welcomeSplashSettingsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_WELCOME_SPLASH_SETTINGS;
}

export function isWelcomeSplashSettingsEqual(
  a: WelcomeSplashSettings,
  b: WelcomeSplashSettings,
): boolean {
  return a.enabled === b.enabled && a.imageUrl === b.imageUrl;
}
