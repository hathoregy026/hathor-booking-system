import { VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";

/**
 * Default email brand images — served from this site (Vercel), not Supabase.
 * Absolute HTTPS URLs are required so email clients can load them.
 */
export const HATHOR_EMAIL_LOGO_URL =
  process.env.HATHOR_EMAIL_LOGO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-logo.png`;

export const HATHOR_EMAIL_HERO_URL =
  process.env.HATHOR_EMAIL_HERO_URL?.trim() ??
  `${VERCEL_PRODUCTION_ORIGIN}/email/hathor-email-hero.jpg`;
