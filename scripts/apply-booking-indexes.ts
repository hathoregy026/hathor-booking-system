import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Booking_deletedAt_createdAt_idx"
    ON "Booking"("deletedAt", "createdAt");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Booking_status_deletedAt_createdAt_idx"
    ON "Booking"("status", "deletedAt", "createdAt");
  `);

  console.log("Booking list indexes created (or already exist).");
}

main()
  .catch((error) => {
    console.error("Failed to create indexes:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
