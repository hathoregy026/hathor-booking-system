import "dotenv/config";
import pg from "pg";
import { pgConnectionOptions } from "../lib/database-tls.mjs";

const client = new pg.Client({
  ...pgConnectionOptions(process.env.DATABASE_URL),
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
