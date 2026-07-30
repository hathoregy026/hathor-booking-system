import { cache } from "react";
import {
  SITE_IMAGE_SLOTS,
  getDefaultSiteImage,
  type SiteImageName,
} from "@/lib/site-image-slots";

export type ResolvedSiteImage = {
  src: string;
  alt: string;
};

export type SiteImageMap = Record<string, ResolvedSiteImage>;

/** Accept CMS URLs that the public site can actually load. */
export function shouldUseDatabaseSiteImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/media/") || trimmed.startsWith("/uploads/")) {
    return !trimmed.startsWith("//") && !/[\u0000-\u001f]/.test(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    if (
      parsed.hostname.includes("supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/public/")
    ) {
      return true;
    }
    /* Absolute site URLs that still point at local media paths */
    if (
      parsed.pathname.startsWith("/media/") ||
      parsed.pathname.startsWith("/uploads/")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function defaultSiteImageMap(): SiteImageMap {
  const map: SiteImageMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }
  return map;
}

/**
 * Request-memoized image map for callers outside the public CMS bundle.
 *
 * Uses slot defaults only — Prisma SiteImage findMany stalls under Next SSR
 * against the Supabase transaction pooler (same SQL is fine outside the app).
 * Public layout uses `loadPublicCmsBundle` defaults the same way.
 */
export const resolveSiteImageMap = cache(async (): Promise<SiteImageMap> => {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return defaultSiteImageMap();
  }
  /*
   * Avoid live Prisma SiteImage reads here: they were the primary cause of
   * 60s+ static generation hangs on /preview and /test-scroll-reveal.
   * Slot defaults keep those shells rendering; admin soft-refresh covers CMS.
   */
  return defaultSiteImageMap();
});

export function resolveSiteImageFromMap(
  map: SiteImageMap,
  name: SiteImageName | string,
): ResolvedSiteImage {
  return map[name] ?? getDefaultSiteImage(name);
}
