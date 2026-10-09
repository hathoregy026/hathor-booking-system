import "dotenv/config";
import pg from "pg";
import { pgConnectionOptions } from "../lib/database-tls.mjs";

const client = new pg.Client({
  ...pgConnectionOptions(process.env.DATABASE_URL),
});

await client.connect();
await client.query(
  'ALTER TABLE "Cruise" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;',
);
console.log('Cruise.imageUrl column is ready.');
await client.end();
