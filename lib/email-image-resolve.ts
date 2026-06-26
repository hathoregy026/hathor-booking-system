import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";

/** Resolve an image src for email HTML (supports cid: inline attachments). */
export function resolveEmailImageSrcForSend(
  url: string | null | undefined,
  fallback: string,
): string {
  const trimmed = url?.trim();
  if (trimmed?.startsWith("cid:")) {
    return trimmed;
  }

  return pickReliableEmailImageUrl(trimmed) ?? fallback;
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
