import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "AdminProfile" (
      "id" TEXT NOT NULL,
      "displayName" TEXT NOT NULL DEFAULT 'Admin',
      "avatarUrl" TEXT,
      "lastSeenBookingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
    )
  `);

  await pool.query(`
    INSERT INTO "AdminProfile" ("id", "displayName", "lastSeenBookingAt", "createdAt", "updatedAt")
    VALUES ('default', 'Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING
  `);

  const profile = await pool.query(
    'SELECT "id", "displayName", "avatarUrl" FROM "AdminProfile" WHERE "id" = $1',
    ["default"],
  );

  console.log(JSON.stringify({ migrated: true, profile: profile.rows[0] }, null, 2));
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
