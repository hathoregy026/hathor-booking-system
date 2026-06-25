import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

function getSessionPoolerUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  return url
    .replace(":6543/", ":5432/")
    .replace("?pgbouncer=true&", "?")
    .replace("&pgbouncer=true", "")
    .replace("?pgbouncer=true", "");
}

function loadDefaultLogoDataUrl() {
  const logoName = "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";
  const candidates = [
    path.join(process.cwd(), "public", "assets", logoName),
    path.join(process.cwd(), "assets", logoName),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = readFileSync(filePath);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } catch {
      // try next
    }
  }

  throw new Error("Default logo file not found. Run npm run build or sync-email-assets first.");
}

async function fetchToDataUrl(url) {
  if (!url || url.startsWith("data:image/")) return url || null;

  try {
    if (url.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      const buffer = readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase();
      const mime =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : "image/png";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 2 * 1024 * 1024) return null;
    return `data:${contentType.split(";")[0]};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.warn(`[backfill] could not fetch ${url}:`, error.message);
    return null;
  }
}

const defaultLogoDataUrl = loadDefaultLogoDataUrl();

const pool = new pg.Pool({
  connectionString: getSessionPoolerUrl(),
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(`
    ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "logoDataUrl" TEXT;
    ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "heroImageDataUrl" TEXT;
  `);

  const { rows } = await pool.query(
    `SELECT "name", "logoUrl", "logoDataUrl", "heroImageUrl", "heroImageDataUrl" FROM "EmailTemplate"`,
  );

  for (const row of rows) {
    let logoDataUrl = row.logoDataUrl;
    let heroImageDataUrl = row.heroImageDataUrl;

    if (!logoDataUrl?.startsWith("data:image/")) {
      logoDataUrl =
        (await fetchToDataUrl(row.logoUrl)) ?? defaultLogoDataUrl;
    }

    if (
      row.heroImageUrl &&
      !heroImageDataUrl?.startsWith("data:image/")
    ) {
      heroImageDataUrl = await fetchToDataUrl(row.heroImageUrl);
    }

    await pool.query(
      `UPDATE "EmailTemplate"
       SET "logoDataUrl" = $1, "heroImageDataUrl" = $2, "updatedAt" = NOW()
       WHERE "name" = $3`,
      [logoDataUrl, heroImageDataUrl, row.name],
    );

    console.log(`Backfilled images for ${row.name}`);
  }

  console.log("Email template image backfill complete.");
} finally {
  await pool.end();
}
