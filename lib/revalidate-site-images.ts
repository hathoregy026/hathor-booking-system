import { revalidatePath } from "next/cache";

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

export function revalidateSiteImagePages(): void {
  revalidatePath("/", "layout");
  for (const path of SITE_IMAGE_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}
