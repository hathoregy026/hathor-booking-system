import "dotenv/config";
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

const sql = `
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

ALTER TABLE "EmailTemplate" ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "logoDataUrl";
ALTER TABLE "EmailTemplate" DROP COLUMN IF EXISTS "heroImageDataUrl";
`;

const pool = new pg.Pool({
  connectionString: getSessionPoolerUrl(),
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("EmailTemplate table created or already exists.");
} finally {
  await pool.end();
}
