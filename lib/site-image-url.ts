/**
 * Client-safe URL helpers for CMS / site images (no DB / Prisma imports).
 */

/** Stored when a hide-on-clear slot is deleted in the dashboard. */
export const SITE_IMAGE_CLEARED_SRC = "__cleared__";

export function isDiningPlateSlotName(name: string): boolean {
  return name.startsWith("dining-plate-");
}

/** These slots can be removed in Site Images and then stay hidden on the live page. */
export function canHideSiteImageOnClear(name: string): boolean {
  return isDiningPlateSlotName(name);
}

export function isSiteImageClearedSrc(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? "";
  return !trimmed || trimmed === SITE_IMAGE_CLEARED_SRC;
}

export function publicSiteImageSrc(name: string, url: string): string {
  if (canHideSiteImageOnClear(name) && isSiteImageClearedSrc(url)) return "";
  return url.trim();
}

/** Remote CMS URLs must skip Next `/_next/image` — large Supabase files often 400 there. */
export function isRemoteCmsImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
