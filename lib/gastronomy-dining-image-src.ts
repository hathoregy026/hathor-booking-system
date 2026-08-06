import { GASTRONOMY_DINING_MEDIA } from "@/lib/gastronomy-dining-media";

/** Canonical GPT dining clone asset per dashboard slot name. */
export const GASTRONOMY_DINING_SLOT_SRC: Record<string, string> = {
  "gastronomy-hero": GASTRONOMY_DINING_MEDIA.hero,
  "gastronomy-restaurant": GASTRONOMY_DINING_MEDIA.experience,
  "gastronomy-table": GASTRONOMY_DINING_MEDIA.table,
  "gastronomy-courses": GASTRONOMY_DINING_MEDIA.courses,
  "gastronomy-wine": GASTRONOMY_DINING_MEDIA.wine,
  "gastronomy-chef": GASTRONOMY_DINING_MEDIA.chef,
  "gastronomy-service": GASTRONOMY_DINING_MEDIA.service,
  "gastronomy-celebration": GASTRONOMY_DINING_MEDIA.celebration,
  "gastronomy-plate-1": GASTRONOMY_DINING_MEDIA.plate1,
  "gastronomy-plate-2": GASTRONOMY_DINING_MEDIA.plate2,
  "gastronomy-plate-3": GASTRONOMY_DINING_MEDIA.plate3,
  "gastronomy-plate-4": GASTRONOMY_DINING_MEDIA.plate4,
  "gastronomy-plate-5": GASTRONOMY_DINING_MEDIA.plate5,
  "gastronomy-plate-6": GASTRONOMY_DINING_MEDIA.plate6,
  "gastronomy-plate-7": GASTRONOMY_DINING_MEDIA.plate7,
};

/**
 * Keep the GPT dining visuals unless the dashboard has a real custom upload.
 * Legacy CMS rows still pointing at /media/hathor/r2/*.webp must not win.
 * Prefer local optimized uploads over hardcoded Supabase defaults.
 */
export function resolveGastronomyDiningImageSrc(
  name: string,
  cmsSrc: string,
): string {
  const diningDefault = GASTRONOMY_DINING_SLOT_SRC[name];
  if (!diningDefault) return cmsSrc;

  const src = cmsSrc.trim();
  if (!src) return diningDefault;
  if (src.includes("/media/gastronomy-dining/")) return src;
  if (src.includes("/media/hathor/optimized/")) return src;
  if (
    /^https?:\/\//i.test(src) &&
    !src.includes("/media/hathor/r2/") &&
    !src.includes("supabase.co/storage")
  ) {
    return src;
  }
  return diningDefault;
}
