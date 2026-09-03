import { GASTRONOMY_DINING_MEDIA, diningPlateSrc } from "@/lib/gastronomy-dining-media";

/** Canonical GPT dining clone asset per dashboard slot name. */
export const GASTRONOMY_DINING_SLOT_SRC: Record<string, string> = {
  "gastronomy-hero": GASTRONOMY_DINING_MEDIA.legacyHero,
  "gastronomy-restaurant": GASTRONOMY_DINING_MEDIA.experience,
  "gastronomy-table": GASTRONOMY_DINING_MEDIA.table,
  "gastronomy-courses": GASTRONOMY_DINING_MEDIA.courses,
  "gastronomy-wine": GASTRONOMY_DINING_MEDIA.wine,
  "gastronomy-chef": GASTRONOMY_DINING_MEDIA.chef,
  "gastronomy-service": GASTRONOMY_DINING_MEDIA.service,
  "gastronomy-celebration": GASTRONOMY_DINING_MEDIA.celebration,
  "gastronomy-plate-1": diningPlateSrc(1),
  "gastronomy-plate-2": diningPlateSrc(2),
  "gastronomy-plate-3": diningPlateSrc(3),
  "gastronomy-plate-4": diningPlateSrc(4),
  "gastronomy-plate-5": diningPlateSrc(5),
  "gastronomy-plate-6": diningPlateSrc(6),
  "gastronomy-plate-7": diningPlateSrc(7),
  "dining-plate-1": diningPlateSrc(1),
  "dining-plate-2": diningPlateSrc(2),
  "dining-plate-3": diningPlateSrc(3),
  "dining-plate-4": diningPlateSrc(4),
  "dining-plate-5": diningPlateSrc(5),
  "dining-plate-6": diningPlateSrc(6),
  "dining-plate-7": diningPlateSrc(7),
};

/**
 * Prefer a real dashboard upload; otherwise keep the canonical dining default.
 * Accepts Supabase Storage CMS URLs so Site Images edits reach Dining.
 * Legacy CMS rows still pointing at /media/hathor/r2/*.webp must not win.
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
  if (src.includes("supabase.co/storage")) return src;
  if (
    /^https?:\/\//i.test(src) &&
    !src.includes("/media/hathor/r2/")
  ) {
    return src;
  }
  return diningDefault;
}
