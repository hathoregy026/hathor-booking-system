import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CMS_CACHE_TAG } from "@/lib/public-cms-bundle";

/**
 * Cruise and room edits feed the homepage accordion and public catalog.
 * Invalidate the shared public layout so the next request receives fresh
 * database content without making every visitor pay for live queries.
 */
export function revalidatePublicCatalog(): void {
  revalidateTag(PUBLIC_CMS_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/cruises");
}
