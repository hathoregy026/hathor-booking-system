import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const total = await pool.query('SELECT COUNT(*)::int AS count FROM "Booking"');
  const byStatus = await pool.query(
    'SELECT status, COUNT(*)::int AS count FROM "Booking" GROUP BY status ORDER BY status',
  );

  let deletedAtInfo = null;
  try {
    const active = await pool.query(
      'SELECT COUNT(*)::int AS count FROM "Booking" WHERE "deletedAt" IS NULL',
    );
    const inBin = await pool.query(
      'SELECT COUNT(*)::int AS count FROM "Booking" WHERE "deletedAt" IS NOT NULL',
    );
    deletedAtInfo = {
      active: active.rows[0].count,
      inBin: inBin.rows[0].count,
    };
  } catch (err) {
    deletedAtInfo = { columnMissing: err.message };
  }

  const sample = await pool.query(
    'SELECT id, status, "customerName", "deletedAt", "createdAt" FROM "Booking" ORDER BY "createdAt" DESC LIMIT 5',
  );

  console.log(
    JSON.stringify(
      {
        total: total.rows[0].count,
        byStatus: byStatus.rows,
        deletedAtInfo,
        sample: sample.rows,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("ERROR:", error.message);
} finally {
  await pool.end();
}
