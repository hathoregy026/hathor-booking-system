import "dotenv/config";
import pg from "pg";

const urls = [
  {
    label: "session-5432",
    url: process.env.DATABASE_URL,
  },
  {
    label: "transaction-6543",
    url: process.env.DATABASE_URL?.replace(":5432/", ":6543/").concat(
      process.env.DATABASE_URL?.includes("pgbouncer=true") ? "" : "&pgbouncer=true",
    ),
  },
];

for (const { label, url } of urls) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query('SELECT id FROM "Booking" LIMIT 1');
    await client.query("COMMIT");
    console.log(`${label}: OK`);
  } catch (error) {
    console.log(`${label}: FAIL`, error.message);
  } finally {
    await client.end().catch(() => {});
  }
}
