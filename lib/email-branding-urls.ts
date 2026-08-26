import { VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";

/** Same-origin paths — required for admin email preview under site CSP (img-src 'self'). */
export const HATHOR_EMAIL_LOGO_PATH = "/email/hathor-email-icon.png";
export const HATHOR_EMAIL_HERO_PATH = "/email/hathor-email-hero.jpg";

/**
 * Locked brand mark for every booking email.
 * Not editable in the dashboard — always the Hathor ring icon.
 */
export const HATHOR_EMAIL_LOGO_URL =
  process.env.HATHOR_EMAIL_LOGO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}${HATHOR_EMAIL_LOGO_PATH}`;

export const HATHOR_EMAIL_HERO_URL =
  process.env.HATHOR_EMAIL_HERO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}${HATHOR_EMAIL_HERO_PATH}`;

/** Legacy wordmark path kept for older DB rows. */
export const HATHOR_EMAIL_LOGO_WORDMARK_URL = `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-logo.png`;

const SITE_EMAIL_FILE = /\/email\/hathor-email-(icon|logo|hero)\.[a-z0-9]+$/i;

/**
 * Admin preview iframe inherits CSP img-src 'self'. Absolute vercel.app URLs
 * break when the admin host differs — rewrite site /email assets to relative paths.
 */
export function toSameOriginEmailAssetUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/email/")) {
    return trimmed.split("?")[0] ?? trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (SITE_EMAIL_FILE.test(parsed.pathname)) {
      return parsed.pathname;
    }
  } catch {
    /* ignore */
  }

  return trimmed.split("?")[0] ?? trimmed;
}
