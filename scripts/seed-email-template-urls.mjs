/**
 * Seeds all EmailTemplate rows with hosted Supabase image URLs.
 *
 * Run: node scripts/seed-email-template-urls.mjs
 */

import "dotenv/config";
import pg from "pg";

const LOGO_URL =
  process.env.HATHOR_EMAIL_LOGO_URL?.trim() ??
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/email-images/e-mail-logo-egypttoor-booking-cruise-honeymoon.png";

const HERO_URL =
  process.env.HATHOR_EMAIL_HERO_URL?.trim() ??
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/email-images/cruise-in-egypt-hathor-holiday-on-nile.JPG";

const connectionString =
  process.env.DATABASE_URL?.trim() ||
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_DIRECT_URL?.trim();

if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const TEMPLATE_NAMES = ["BookingReceived", "BookingConfirmed", "AdminAlert"];

const ensureTableSql = `
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "logoUrl" TEXT,
  "heroImageUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#C9A96E',
  "backgroundColor" TEXT NOT NULL DEFAULT '#FAF8F5',
  "heroHeading" TEXT,
  "bodyText" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmailTemplate_name_key" ON "EmailTemplate"("name");
ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "logoDataUrl";
ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "heroImageDataUrl";
`;

try {
  await pool.query(ensureTableSql);

  await pool.query(
    `UPDATE "EmailTemplate"
     SET "logoUrl" = $1, "heroImageUrl" = $2, "updatedAt" = NOW()`,
    [LOGO_URL, HERO_URL],
  );

  for (const name of TEMPLATE_NAMES) {
    const existing = await pool.query(
      `SELECT "id" FROM "EmailTemplate" WHERE "name" = $1`,
      [name],
    );

    if (existing.rows.length === 0) {
      const id = `seed-${name.toLowerCase()}`;
      await pool.query(
        `INSERT INTO "EmailTemplate" (
          "id", "name", "subject", "logoUrl", "heroImageUrl",
          "primaryColor", "backgroundColor", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, '#C9A96E', '#FAF8F5', NOW())`,
        [
          id,
          name,
          name === "AdminAlert"
            ? "New booking request — {guestName}"
            : `Your Hathor ${name === "BookingConfirmed" ? "cruise is confirmed" : "booking request has been received"}`,
          LOGO_URL,
          HERO_URL,
        ],
      );
      console.log(`Created template: ${name}`);
    } else {
      console.log(`Updated template: ${name}`);
    }
  }

  const verify = await pool.query(
    `SELECT "name", "logoUrl", "heroImageUrl" FROM "EmailTemplate" ORDER BY "name"`,
  );
  console.log("\nCurrent templates:");
  for (const row of verify.rows) {
    console.log(`  ${row.name}`);
    console.log(`    logo: ${row.logoUrl}`);
    console.log(`    hero: ${row.heroImageUrl}`);
  }
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
