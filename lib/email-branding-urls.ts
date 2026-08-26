import { VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";

/**
 * Default email brand images — served from this site (Vercel), not Supabase.
 * Absolute HTTPS URLs are required so email clients (and CID fetch) can load them.
 * Logo default is the Hathor ring icon (PNG) — SVG is unreliable in email clients.
 */
export const HATHOR_EMAIL_LOGO_URL =
  process.env.HATHOR_EMAIL_LOGO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-icon.png`;

export const HATHOR_EMAIL_HERO_URL =
  process.env.HATHOR_EMAIL_HERO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-hero.jpg`;

/** Legacy wordmark path kept for older DB rows / env overrides. */
export const HATHOR_EMAIL_LOGO_WORDMARK_URL = `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-logo.png`;
