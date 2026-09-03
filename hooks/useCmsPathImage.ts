"use client";

import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { slotNameFromSuitesImageUrl } from "@/lib/suites-normal-image-map";

/**
 * Resolve a hardcoded `/media/...` path (or slot name) through the live
 * Site Images map so dashboard uploads replace collection-page defaults.
 */
export function useCmsPathImage(pathOrSlot: string): {
  src: string;
  alt: string;
  slot: string | null;
} {
  const asSlot =
    /^[a-z0-9-]+$/.test(pathOrSlot) && !pathOrSlot.includes("/")
      ? pathOrSlot
      : null;
  const slot = asSlot ?? slotNameFromSuitesImageUrl(pathOrSlot);
  const cms = useSiteImage(slot ?? "scraped-cabin-1");

  if (!slot) {
    return { src: pathOrSlot, alt: "", slot: null };
  }

  const src = originSrcForNextImage(cms.src.trim() || pathOrSlot);
  return { src, alt: cms.alt, slot };
}
