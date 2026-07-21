import { revalidatePath } from "next/cache";
import { HOMEPAGE_LIVE_SLOT_NAMES } from "@/lib/site-image-preview";
import { getSiteImageSlot } from "@/lib/site-image-slots";

/** Public routes that consume SiteImage slots — call after CMS image saves. */
const SITE_IMAGE_REVALIDATE_PATHS = [
  "/",
  "/cruises",
  "/rooms",
  "/luxury-cabins-Nile-Cruise",
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "/about",
  "/gastronomy",
  "/wellness",
  "/highlights",
  "/charter",
  "/contact",
  "/blogs",
  "/suites",
  "/experiences",
] as const;

/**
 * Revalidate public pages after CMS image saves.
 * Pass slot names to limit work to the pages that actually use those slots.
 */
export function revalidateSiteImagePages(slotNames?: string[]): void {
  revalidatePath("/", "layout");

  if (!slotNames?.length) {
    for (const path of SITE_IMAGE_REVALIDATE_PATHS) {
      revalidatePath(path);
    }
    return;
  }

  const paths = new Set<string>();
  for (const name of slotNames) {
    const slot = getSiteImageSlot(name);
    if (slot?.pagePath) paths.add(slot.pagePath);
    if (HOMEPAGE_LIVE_SLOT_NAMES.has(name)) paths.add("/");
  }

  if (paths.size === 0) {
    revalidatePath("/");
    return;
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
