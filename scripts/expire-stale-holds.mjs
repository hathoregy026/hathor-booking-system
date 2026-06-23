import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const expired = await client.query(`
  UPDATE "Booking"
  SET status = 'EXPIRED'
  WHERE status = 'PENDING_HOLD'
    AND "holdExpiresAt" < NOW()
  RETURNING id
`);
console.log("Expired holds:", expired.rowCount);

await client.end();
