import "dotenv/config";
import { prisma } from "../lib/prisma";
import { SITE_IMAGE_SLOTS } from "../lib/site-image-slots";

async function main() {
  let created = 0;
  let skipped = 0;

  for (const slot of SITE_IMAGE_SLOTS) {
    const existing = await prisma.siteImage.findFirst({
      where: { name: slot.name },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.siteImage.create({
      data: {
        name: slot.name,
        altText: slot.altText,
        url: slot.url,
        category: slot.category,
        pagePath: slot.pagePath,
        displayOrder: slot.displayOrder,
        isActive: true,
      },
    });
    created += 1;
  }

  console.log(
    `[seed-site-images] created=${created} skipped=${skipped} total=${SITE_IMAGE_SLOTS.length}`,
  );
}

main()
  .catch((error) => {
    console.error("[seed-site-images] failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
