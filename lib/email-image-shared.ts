/** Client-safe email image helpers (hosted URLs only — no base64 in emails). */

import { toAbsolutePublicUrl } from "@/lib/public-url";

export const EMAIL_LOGO_ASSET_PATH =
  "/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png";

export function isEmailImageDataUrl(value: string | null | undefined): boolean {
  return Boolean(value?.trim().startsWith("data:image/"));
}

/** Resolve a hosted image URL for email <img src> — never returns base64. */
export function resolveEmailHostedImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim() || isEmailImageDataUrl(url)) {
    return null;
  }

  return toAbsolutePublicUrl(url.trim()) ?? url.trim();
}

/** Resolve logo for admin UI and outbound email (hosted URL only). */
export function resolveEmailLogoSrc(url: string | null | undefined): string {
  return resolveEmailHostedImageUrl(url) ?? EMAIL_LOGO_ASSET_PATH;
}

export function resolveEmailImageSrc(
  url: string | null | undefined,
): string | null {
  return resolveEmailHostedImageUrl(url);
}
