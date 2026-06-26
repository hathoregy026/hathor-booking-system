import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";

/** Resolve hosted HTTPS image src for email HTML. */
export function resolveEmailImageSrcForSend(
  url: string | null | undefined,
  fallback: string,
): string {
  return pickReliableEmailImageUrl(url) ?? fallback;
}

export function resolveEmailLogoSrcForSend(
  url: string | null | undefined,
): string {
  return resolveEmailImageSrcForSend(url, HATHOR_EMAIL_LOGO_URL);
}

export function resolveEmailHeroSrcForSend(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  return resolveEmailImageSrcForSend(url, HATHOR_EMAIL_HERO_URL);
}
