import "dotenv/config";
import pg from "pg";

const urls = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
};

for (const [label, connectionString] of Object.entries(urls)) {
  if (!connectionString) {
    console.log(`${label}: (not set)`);
    continue;
  }

  let host = "(unknown)";
  try {
    host = new URL(connectionString.replace(/^postgresql:/, "http:")).host;
  } catch {
    /* ignore */
  }

  console.log(`\n=== ${label} (${host}) ===`);
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
    max: 1,
  });

  try {
    const ping = await pool.query("SELECT 1 AS ok");
    console.log("SELECT 1:", ping.rows[0]);

    const cruises = await pool.query(
      'SELECT COUNT(*)::int AS count FROM "Cruise" WHERE "deletedAt" IS NULL',
    );
    console.log("Active cruises:", cruises.rows[0].count);
  } catch (error) {
    console.error("FAIL:", error.message);
  } finally {
    await pool.end().catch(() => {});
  }
}
