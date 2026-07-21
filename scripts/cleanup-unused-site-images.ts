import "dotenv/config";
import { prisma } from "../lib/prisma";
import { SITE_IMAGE_SLOTS } from "../lib/site-image-slots";
import { deleteWebsiteImageByUrl } from "../lib/website-image-storage";

/**
 * Old homepage slots that are no longer in SITE_IMAGE_SLOTS / live site.
 * Also includes DB-only leftovers like home-post-hero-media.
 */
export const REMOVED_SITE_IMAGE_NAMES = [
  "home-story-craft-small",
  "home-story-transform",
  "home-story-legacy-small",
  "home-cinematic-video",
  "home-split-service",
  "home-split-interiors",
  "home-split-venue",
  "home-collage-bg",
  "home-residences-kitchen",
  "home-residences-lounge",
  "home-residences-rooftop",
  "home-sketch-boat",
  "home-alt-dining",
  "home-alt-wellness",
  "home-testimonials-bg",
  "home-post-hero-media",
] as const;

async function main() {
  const keep = new Set(SITE_IMAGE_SLOTS.map((slot) => slot.name));
  const named = [...REMOVED_SITE_IMAGE_NAMES];

  const rows = await prisma.siteImage.findMany({
    where: {
      OR: [
        { name: { in: named } },
        {
          AND: [
            { pagePath: "/" },
            { name: { startsWith: "home-" } },
            { name: { notIn: [...keep] } },
          ],
        },
      ],
    },
  });

  console.log(`[cleanup-unused-site-images] found ${rows.length} rows to remove`);

  let deletedStorage = 0;
  for (const row of rows) {
    const removed = await deleteWebsiteImageByUrl(row.url);
    if (removed) deletedStorage += 1;
  }

  const result = await prisma.siteImage.deleteMany({
    where: { id: { in: rows.map((row) => row.id) } },
  });

  console.log(
    `[cleanup-unused-site-images] deleted db=${result.count} storageObjects=${deletedStorage}`,
  );
  console.log(
    `[cleanup-unused-site-images] names=${rows.map((row) => row.name).join(", ") || "(none)"}`,
  );
}

main()
  .catch((error) => {
    console.error("[cleanup-unused-site-images] failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
