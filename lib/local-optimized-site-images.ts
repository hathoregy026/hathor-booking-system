/**
 * Slot names that have a local copy at /media/hathor/optimized/{name}.webp.
 * The Set is patched by scripts/mirror-supabase-site-images-to-public.mjs —
 * do not hand-maintain the list; keep the helper functions below it.
 */
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

/**
 * @deprecated Kept for scripts/mirrors that still enumerate known optimized
 * files. Live delivery never prefers these over CMS Supabase URLs — that
 * previously masked dashboard uploads on the public site.
 */
export const CMS_CANONICAL_SITE_IMAGE_SLOTS: ReadonlySet<string> = new Set([
  "home-hero-poster",
  "home-wheel-image",
]);

/** Slots that have (or had) a `/media/hathor/optimized/{name}.webp` mirror. */
export const LOCAL_OPTIMIZED_SITE_IMAGE_SLOTS: ReadonlySet<string> = new Set([
  "about-hero",
  "cruises-hero",
  "dining-gallery-left",
  "dining-gallery-right",
  "dining-intro-hero",
  "dining-projects-course-1",
  "floating-ig-1",
  "floating-ig-2",
  "floating-ig-3",
  "floating-ig-4",
  "gastronomy-celebration",
  "gastronomy-chef",
  "gastronomy-courses",
  "gastronomy-hero",
  "gastronomy-restaurant",
  "gastronomy-service",
  "gastronomy-table",
  "gastronomy-wine",
  "home-amenities-1",
  "home-amenities-10",
  "home-amenities-11",
  "home-amenities-12",
  "home-amenities-13",
  "home-amenities-14",
  "home-amenities-2",
  "home-amenities-4",
  "home-amenities-5",
  "home-amenities-6",
  "home-amenities-7",
  "home-amenities-8",
  "home-amenities-9",
  "home-call-to-action",
  "home-carousel-royal-3n",
  "home-carousel-royal-4n",
  "home-carousel-royal-7n",
  "home-split-courtyard",
  "home-story-craft-large",
  "home-story-dining",
  "home-story-legacy-large",
  "home-story-way-of-life",
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
  "home-voyage-nile-majesty",
  "home-wheel-image",
  "home-wheel-stage",
  "moving-tilted-1",
  "moving-tilted-2",
  "moving-tilted-3",
  "moving-tilted-4",
  "moving-tilted-5",
  "room-luxury",
  "room-royal",
  "room-suite",
  "scraped-cabin-1",
  "scraped-luxsuite-1",
  "scraped-luxsuite-2",
  "scraped-luxsuite-3",
  "scraped-luxsuite-4",
  "scraped-luxsuite-5",
  "scraped-luxsuite-6",
  "scraped-royal-1",
  "scraped-royal-2",
  "scraped-royal-3",
  "scraped-royal-4",
  "scraped-royal-5",
  "scraped-royal-6",
  "scraped-royal-7",
  "scraped-royal-8",
  "scraped-suites-hero",
  "scraped-suites-luxury-rooms",
  "scraped-suites-luxury-suites",
  "scraped-suites-royal",
]);

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co/storage");
}

/**
 * Must be listed in next.config `images.deviceSizes`. Used when a CMS URL is
 * shown in a native `<img>` or CSS background (no srcset).
 */
export const SITE_IMAGE_OPTIMIZER_WIDTH = 1920;

function isLocalPublicPath(src: string): boolean {
  return (
    src.startsWith("/") &&
    !src.startsWith("//") &&
    !src.startsWith("/_next/image?")
  );
}

function isAllowlistedRemoteImage(src: string): boolean {
  return isSupabaseStorageUrl(src) || src.includes("images.unsplash.com");
}

export function localOptimizedSiteImagePath(name: string): string {
  return `/media/hathor/optimized/${name}.webp`;
}

/**
 * CMS / SiteSetting overrides are the live source of truth.
 * Never replace a Supabase (or other remote) CMS URL with a stale
 * `/media/hathor/optimized/{name}.webp` mirror — that made dashboard
 * uploads appear broken on the public site.
 *
 * Local mirrors remain valid fallbacks only when the resolved src is
 * already a `/media/...` path (seed defaults). Remote URLs pass through
 * and are optimized via `toVercelOptimizedSrc` / `next/image`.
 */
export function preferLocalOptimizedSiteImage(
  _name: string,
  src: string,
): string {
  return src.trim();
}

/**
 * Send remaining Storage/Unsplash URLs through Vercel `/_next/image` so native
 * `<img>` and CSS backgrounds do not hit origin on every view.
 * Local `/media` paths stay as-is (already on this origin).
 */
export function toVercelOptimizedSrc(
  src: string,
  width: number = SITE_IMAGE_OPTIMIZER_WIDTH,
): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/_next/image?")) return trimmed;
  if (isLocalPublicPath(trimmed)) return trimmed;
  if (!/^https?:\/\//i.test(trimmed) || !isAllowlistedRemoteImage(trimmed)) {
    return trimmed;
  }

  const params = new URLSearchParams({
    url: trimmed,
    w: String(width),
    q: String(SITE_IMAGE_QUALITY),
  });
  return `/_next/image?${params.toString()}`;
}

/** Reverse `/_next/image?url=` so `next/image` can build a real srcset. */
export function originSrcForNextImage(src: string): string {
  const trimmed = src.trim();
  if (!trimmed.startsWith("/_next/image?")) return trimmed;
  try {
    const params = new URLSearchParams(trimmed.slice(trimmed.indexOf("?") + 1));
    const original = params.get("url");
    return original?.trim() || trimmed;
  } catch {
    return trimmed;
  }
}

export function cssImageUrl(src: string): string {
  const safe = src.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `url("${safe}")`;
}

/** Local mirror when we have one; otherwise Vercel-optimized Storage URL. */
export function deliverPublicSiteImage(name: string, src: string): string {
  return toVercelOptimizedSrc(preferLocalOptimizedSiteImage(name, src));
}
