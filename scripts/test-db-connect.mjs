import "dotenv/config";
import pg from "pg";

async function test(label, url) {
  if (!url) {
    console.log(label, "SKIP no url");
    return;
  }

  const start = Date.now();
  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 20_000,
    ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS c FROM "Booking" WHERE "deletedAt" IS NULL`,
    );
    console.log(
      `${label}: OK — ${result.rows[0].c} active bookings (${Date.now() - start}ms)`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${label}: FAIL — ${message} (${Date.now() - start}ms)`);
  } finally {
    await pool.end();
  }
}

await test("6543-transaction (DATABASE_URL)", process.env.DATABASE_URL);
await test("5432-session (DATABASE_DIRECT_URL)", process.env.DATABASE_DIRECT_URL);
