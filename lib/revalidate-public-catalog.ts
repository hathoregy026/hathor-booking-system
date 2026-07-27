import { revalidatePath } from "next/cache";

/**
 * Cruise and room edits feed the homepage accordion and public catalog.
 * Invalidate the shared public layout so the next request receives fresh
 * database content without making every visitor pay for live queries.
 */
export function revalidatePublicCatalog(): void {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/cruises");
}
