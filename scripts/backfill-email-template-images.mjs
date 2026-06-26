/**
 * Normalizes EmailTemplate image URLs (hosted URLs only — no base64).
 *
 * Run: npm run backfill:email-images
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  process.env.SITE_URL?.replace(/\/$/, "") ||
  "https://hathor-booking-system.vercel.app";

const defaultLogoUrl = `${siteUrl}/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png`;

function normalizeUrl(value) {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("data:image/")) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${siteUrl}${trimmed}`;
  return trimmed;
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

  const { rows } = await pool.query(
    `SELECT "name", "logoUrl", "heroImageUrl" FROM "EmailTemplate"`,
  );

  for (const row of rows) {
    const logoUrl = normalizeUrl(row.logoUrl) ?? defaultLogoUrl;
    const heroImageUrl = normalizeUrl(row.heroImageUrl);

    await pool.query(
      `UPDATE "EmailTemplate"
       SET "logoUrl" = $1, "heroImageUrl" = $2, "updatedAt" = NOW()
       WHERE "name" = $3`,
      [logoUrl, heroImageUrl, row.name],
    );
    console.log(`Updated ${row.name}: logo=${logoUrl ? "ok" : "none"}`);
  }

  console.log("Backfill complete.");
} catch (error) {
  console.error("Backfill failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
