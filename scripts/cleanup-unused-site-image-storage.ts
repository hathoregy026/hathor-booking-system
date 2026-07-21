import "dotenv/config";
import { deleteWebsiteImageByUrl } from "../lib/website-image-storage";

/** Supabase uploads that belonged to removed unused homepage slots */
const ORPHAN_STORAGE_URLS = [
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-sketch-boat/homepage-homepage-hathor-dahabiya-sailing-on-the-nile-mrv3ncrg.jpg",
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-story-legacy-small/homepage-ancient-egyptian-temple-viewed-from-the-nile-mrv3h9a2.jpg",
];

async function main() {
  let removed = 0;
  for (const url of ORPHAN_STORAGE_URLS) {
    const ok = await deleteWebsiteImageByUrl(url);
    console.log(`[cleanup-storage] ${ok ? "removed" : "skip"} ${url}`);
    if (ok) removed += 1;
  }
  console.log(`[cleanup-storage] done removed=${removed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
