import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(
  'ALTER TABLE "Cruise" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;',
);
console.log('Cruise.imageUrl column is ready.');
await client.end();
