/** Hosted email brand images (Supabase Storage — public bucket `email-images`). */

export const HATHOR_EMAIL_LOGO_URL =
  process.env.HATHOR_EMAIL_LOGO_URL?.trim() ??
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/email-images/hathor-email-logo.png";

export const HATHOR_EMAIL_HERO_URL =
  process.env.HATHOR_EMAIL_HERO_URL?.trim() ??
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/email-images/hathor-email-hero.jpg";
