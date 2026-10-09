import "dotenv/config";
import pg from "pg";
import { pgConnectionOptions } from "../lib/database-tls.mjs";

const client = new pg.Client({
  ...pgConnectionOptions(process.env.DATABASE_URL),
});

await client.connect();
const result = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
);
console.log(result.rows);
await client.end();
