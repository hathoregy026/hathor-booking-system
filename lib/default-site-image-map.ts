import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import type { SiteImageMap } from "@/lib/resolve-site-images";

/** Sync defaults for development-only motion harness (no DB). */
export function getDefaultSiteImageMap(): SiteImageMap {
  const map: SiteImageMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }
  return map;
}
