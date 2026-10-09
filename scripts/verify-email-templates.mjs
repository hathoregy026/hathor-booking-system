import "dotenv/config";
import pg from "pg";
import { pgConnectionOptions } from "../lib/database-tls.mjs";

const pool = new pg.Pool({
  ...pgConnectionOptions(process.env.DATABASE_URL),
});

const result = await pool.query(
  'SELECT name, subject FROM "EmailTemplate" ORDER BY name',
);
console.log(result.rows);
await pool.end();
