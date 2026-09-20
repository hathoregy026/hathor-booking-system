import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";
import { rebuildSiteImagePublicMap } from "@/lib/site-image-public-map";
import { getSiteImageSlot } from "@/lib/site-image-slots";
import { getSiteImageUsedOnPages } from "@/lib/site-image-usage";

/** Public routes that consume SiteImage slots — call after CMS image saves. */
const SITE_IMAGE_REVALIDATE_PATHS = [
  "/",
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
    /* Every page the audit found painting this photo. */
    for (const page of getSiteImageUsedOnPages(name)) {
      if (page.path.startsWith("/#")) continue;
      paths.add(page.path === "/" ? "/" : page.path);
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
