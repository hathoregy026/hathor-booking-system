/** Client-safe email image helpers (no Node.js fs). */

export const EMAIL_LOGO_ASSET_PATH =
  "/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png";

export const FALLBACK_LOGO_SVG_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAxODAgNjAiPjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iNjAiIGZpbGw9IiNGQUY4RjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiIGZpbGw9IiM4QjY5MTQiIGZvbnQtc2l6ZT0iMTgiPkhhdGhvcjwvdGV4dD48L3N2Zz4=";

export function isEmailImageDataUrl(value: string | null | undefined): boolean {
  return Boolean(value?.trim().startsWith("data:image/"));
}

/** Resolve logo for admin UI and browser preview. */
export function resolveEmailLogoSrc(
  dataUrl: string | null | undefined,
  url: string | null | undefined,
): string {
  if (isEmailImageDataUrl(dataUrl)) {
    return dataUrl!.trim();
  }

  if (isEmailImageDataUrl(url)) {
    return url!.trim();
  }

  if (url?.trim()) {
    return url.trim();
  }

  return EMAIL_LOGO_ASSET_PATH;
}

export function resolveEmailImageSrc(
  dataUrl: string | null | undefined,
  url: string | null | undefined,
  options?: { useDefaultLogo?: boolean },
): string | null {
  if (isEmailImageDataUrl(dataUrl)) {
    return dataUrl!.trim();
  }

  if (url?.trim()) {
    return url.trim();
  }

  if (options?.useDefaultLogo) {
    return EMAIL_LOGO_ASSET_PATH;
  }

  return null;
}
