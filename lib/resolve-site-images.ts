import { logDbError } from "@/lib/db-safe";
import { listSiteImages } from "@/lib/image-management";
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

export async function resolveSiteImageMap(): Promise<SiteImageMap> {
  const map: SiteImageMap = {};

  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }

  try {
    const records = await listSiteImages();
    for (const record of records) {
      if (!record.isActive) continue;
      map[record.name] = { src: record.url, alt: record.altText };
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
