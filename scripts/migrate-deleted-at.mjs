import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(
    'ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)',
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS "Booking_deletedAt_idx" ON "Booking"("deletedAt")',
  );

  const total = await pool.query('SELECT COUNT(*)::int AS count FROM "Booking"');
  const active = await pool.query(
    'SELECT COUNT(*)::int AS count FROM "Booking" WHERE "deletedAt" IS NULL',
  );
  const byStatus = await pool.query(
    'SELECT status, COUNT(*)::int AS count FROM "Booking" GROUP BY status',
  );

  console.log(
    JSON.stringify(
      {
        migrated: true,
        total: total.rows[0].count,
        active: active.rows[0].count,
        byStatus: byStatus.rows,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
