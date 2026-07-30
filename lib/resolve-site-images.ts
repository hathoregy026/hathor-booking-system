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
 * Shared public SiteImage map — same source as the public layout CMS bundle
 * (React.cache + unstable_cache). No per-slot queries; no nested findMany.
 */
export const resolveSiteImageMap = cache(async (): Promise<SiteImageMap> => {
  const { loadPublicCmsBundle } = await import("@/lib/public-cms-bundle");
  try {
    const cms = await loadPublicCmsBundle();
    return cms.siteImages;
  } catch {
    return defaultSiteImageMap();
  }
});

export function resolveSiteImageFromMap(
  map: SiteImageMap,
  name: SiteImageName | string,
): ResolvedSiteImage {
  return map[name] ?? getDefaultSiteImage(name);
}
