/** Bumps the browser URL for files that 404'd while they were missing from the deploy. */
const MEDIA_VERSION = "2";

/** Same-origin files under /media/. Remote CMS URLs are left alone. */
export function isVersionedMediaPath(src: string): boolean {
  const value = src.trim();
  return value.startsWith("/media/") && !value.startsWith("//");
}

/**
 * `/media/...` plus `?v=2`.
 * The previous optimizer URLs were cached as failures. This is a different address.
 */
export function freshMediaSrc(src: string): string {
  const value = src.trim();
  if (!isVersionedMediaPath(value)) return value;
  if (/[?&]v=\d+/.test(value)) return value;
  return `${value}${value.includes("?") ? "&" : "?"}v=${MEDIA_VERSION}`;
}
