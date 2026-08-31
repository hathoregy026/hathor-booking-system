import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { rebuildSiteImagePublicMap } from "@/lib/site-image-public-map";
import { HOMEPAGE_LIVE_SLOT_NAMES } from "@/lib/site-image-preview";
import { getSiteImageSlot } from "@/lib/site-image-slots";

/** Public routes that consume SiteImage slots — call after CMS image saves. */
const SITE_IMAGE_REVALIDATE_PATHS = [
  "/",
  "/home-2",
  "/cruises-list",
  "/rooms",
  "/luxury-cabins-Nile-Cruise",
  "/royal-suites",
  "/about",
  "/gastronomy",
  "/wellness",
  "/highlights",
  "/charter",
  "/contact",
  "/blogs",
  "/suites",
  "/partners",
  "/experiences",
  "/booking",
  "/book",
] as const;

const GLOBAL_NAV_IMAGE_SLOTS = new Set(["burger-nav-image"]);

/**
 * Rebuild denormalized public image map, then invalidate CMS cache + paths.
 */
export async function revalidateSiteImagePages(
  slotNames?: string[],
): Promise<void> {
  await rebuildSiteImagePublicMap();
  revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
  revalidatePath("/", "layout");

  if (!slotNames?.length) {
    for (const path of SITE_IMAGE_REVALIDATE_PATHS) {
      revalidatePath(path);
    }
    return;
  }

  const paths = new Set<string>();
  const touchesGlobalNav = slotNames.some((name) =>
    GLOBAL_NAV_IMAGE_SLOTS.has(name),
  );
  if (touchesGlobalNav) {
    for (const path of SITE_IMAGE_REVALIDATE_PATHS) {
      paths.add(path);
    }
  }
  for (const name of slotNames) {
    const slot = getSiteImageSlot(name);
    if (slot?.pagePath) paths.add(slot.pagePath);
    if (HOMEPAGE_LIVE_SLOT_NAMES.has(name)) paths.add("/");
    if (name === "home-wheel-image") {
      paths.add("/home-2");
      paths.add("/partners");
    }
  }

  if (paths.size === 0) {
    revalidatePath("/");
    return;
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
