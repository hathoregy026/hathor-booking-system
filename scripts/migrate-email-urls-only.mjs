/**
 * Migrates EmailTemplate to URL-only image storage.
 * - Drops logoDataUrl / heroImageDataUrl columns (base64 no longer used)
 * - Clears any data:image values accidentally stored in URL columns
 *
 * Run: node scripts/migrate-email-urls-only.mjs
 */

import "dotenv/config";
import pg from "pg";

const connectionString =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL or DIRECT_URL is required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

try {
  await pool.query(`
    ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "logoDataUrl";
    ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "heroImageDataUrl";
  `);
  console.log("Dropped logoDataUrl and heroImageDataUrl columns.");

  const { rows } = await pool.query(
    `SELECT "name", "logoUrl", "heroImageUrl" FROM "EmailTemplate"`,
  );

  for (const row of rows) {
    const logoUrl = row.logoUrl?.startsWith("data:image/") ? null : row.logoUrl;
    const heroImageUrl = row.heroImageUrl?.startsWith("data:image/")
      ? null
      : row.heroImageUrl;

    if (logoUrl !== row.logoUrl || heroImageUrl !== row.heroImageUrl) {
      await pool.query(
        `UPDATE "EmailTemplate"
         SET "logoUrl" = $1, "heroImageUrl" = $2, "updatedAt" = NOW()
         WHERE "name" = $3`,
        [logoUrl, heroImageUrl, row.name],
      );
      console.log(`Cleared invalid data URLs for template: ${row.name}`);
    }
  }

  console.log("Migration complete — email templates now use hosted URLs only.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
