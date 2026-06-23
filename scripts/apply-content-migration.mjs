import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30_000,
  });

  await client.connect();

  const migrationSql = fs.readFileSync(
    path.join(__dirname, "../prisma/migrations/20250620120000_add_blog_post/migration.sql"),
    "utf8",
  );

  await client.query(migrationSql);

  for (const value of ["CHARTER", "CONTACT"]) {
    await client.query(
      `ALTER TYPE "ContentSection" ADD VALUE IF NOT EXISTS '${value}'`,
    );
  }

  await client.end();
  console.log("Schema migration applied via DATABASE_URL.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
