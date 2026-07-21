import { logDbError } from "@/lib/db-safe";
import { listSiteImages } from "@/lib/image-management";
import {
  SITE_IMAGE_SLOTS,
  getDefaultSiteImage,
  getSiteImageSlot,
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

export async function resolveSiteImageMap(): Promise<SiteImageMap> {
  const map: SiteImageMap = {};

  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }

  try {
    const records = await listSiteImages();
    for (const record of records) {
      if (!record.isActive) continue;
      const slot = getSiteImageSlot(record.name);
      const fallback = slot
        ? { src: slot.url, alt: slot.altText }
        : getDefaultSiteImage(record.name);

      if (shouldUseDatabaseSiteImageUrl(record.url)) {
        map[record.name] = { src: record.url, alt: record.altText || fallback.alt };
      } else {
        map[record.name] = fallback;
      }
    }
  } catch (error) {
    logDbError("resolveSiteImageMap", error);
  }

  return map;
}

export function resolveSiteImageFromMap(
  map: SiteImageMap,
  name: SiteImageName | string,
): ResolvedSiteImage {
  return map[name] ?? getDefaultSiteImage(name);
}
