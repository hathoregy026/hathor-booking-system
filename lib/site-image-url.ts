/**
 * Client-safe URL helpers for CMS / site images (no DB / Prisma imports).
 */

/** Remote CMS URLs must skip Next `/_next/image` — large Supabase files often 400 there. */
export function isRemoteCmsImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
