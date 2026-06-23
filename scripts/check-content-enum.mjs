import "dotenv/config";
import pg from "pg";

function getSeedConnectionString() {
  if (process.env.DATABASE_DIRECT_URL) return process.env.DATABASE_DIRECT_URL;
  return process.env.DATABASE_URL
    .replace(":6543/", ":5432/")
    .replace("pgbouncer=true&", "")
    .replace("&pgbouncer=true", "")
    .replace("?pgbouncer=true", "");
}

const pool = new pg.Pool({
  connectionString: getSeedConnectionString(),
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  const enums = await pool.query(
    `SELECT e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     WHERE t.typname = 'ContentSection'
     ORDER BY e.enumsortorder`,
  );
  console.log("ContentSection values:", enums.rows.map((r) => r.enumlabel));
} finally {
  await pool.end();
}
