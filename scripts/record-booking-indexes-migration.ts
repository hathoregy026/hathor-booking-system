import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { prisma } from "../lib/prisma";

const MIGRATION_NAME = "20250623151000_booking_list_indexes";

async function main() {
  const sql = readFileSync(
    `prisma/migrations/${MIGRATION_NAME}/migration.sql`,
    "utf8",
  );
  const checksum = createHash("sha256").update(sql).digest("hex");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const existing = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
    `SELECT "migration_name" FROM "_prisma_migrations" WHERE "migration_name" = $1`,
    MIGRATION_NAME,
  );

  if (existing.length > 0) {
    console.log(`Migration ${MIGRATION_NAME} already recorded.`);
    return;
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "_prisma_migrations" (
      "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
    ) VALUES (
      gen_random_uuid()::text, $1, NOW(), $2, NULL, NULL, NOW(), 1
    )`,
    checksum,
    MIGRATION_NAME,
  );

  console.log(`Recorded migration ${MIGRATION_NAME} in _prisma_migrations.`);
}

main()
  .catch((error) => {
    console.error("Failed to record migration:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
