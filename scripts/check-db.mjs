import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const result = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
);
console.log(result.rows);
await client.end();
