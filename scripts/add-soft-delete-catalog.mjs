import "dotenv/config";
import pg from "pg";
import { pgConnectionOptions } from "../lib/database-tls.mjs";

const statements = [
  `ALTER TABLE "Cruise" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "Cruise_deletedAt_idx" ON "Cruise"("deletedAt")`,
  `ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "Room_deletedAt_idx" ON "Room"("deletedAt")`,
];

const client = new pg.Client({
  ...pgConnectionOptions(process.env.DATABASE_URL),
});

await client.connect();

for (const sql of statements) {
  await client.query(sql);
  console.log("OK:", sql.split("\n")[0]);
}

console.log("Soft-delete columns applied.");
await client.end();
