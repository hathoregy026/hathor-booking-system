import "dotenv/config";
import { prisma } from "../lib/prisma";
import { SITE_IMAGE_SLOTS } from "../lib/site-image-slots";

async function main() {
  const slots = SITE_IMAGE_SLOTS.filter((slot) => slot.pagePath === "/gastronomy");
  await prisma.$transaction(async (tx) => {
    await tx.siteImage.deleteMany({ where: { pagePath: "/gastronomy" } });
    await tx.siteImage.createMany({
      data: slots.map((slot) => ({
        name: slot.name,
        altText: slot.altText,
        url: slot.url,
        category: slot.category,
        pagePath: slot.pagePath,
        displayOrder: slot.displayOrder,
        isActive: true,
      })),
    });
  });
  console.log(`[reconcile-gastronomy-images] reset ${slots.length} private dining slots`);
}

main()
  .catch((error) => {
    console.error("[reconcile-gastronomy-images] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
