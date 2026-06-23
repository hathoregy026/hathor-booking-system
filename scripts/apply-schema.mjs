import "dotenv/config";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import pg from "pg";

const sql = execSync(
  "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
  { encoding: "utf8" },
);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
console.log("Schema applied successfully.");
await client.end();
