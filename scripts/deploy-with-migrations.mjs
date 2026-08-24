import { spawnSync } from "node:child_process";
import "dotenv/config";
import pg from "pg";

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

run(process.execPath, ["scripts/verify-production-migration-baseline.mjs"]);

const baselineMigrations = [
  "20250620120000_add_blog_post",
  "20250623151000_booking_list_indexes",
  "20250628120000_add_site_image",
  "20260718190000_add_site_setting",
  "20260823120000_add_booking_price_snapshots",
];
const rawUrl = process.env.DATABASE_URL?.replace(/^['\"]|['\"]$/g, "");
if (!rawUrl) throw new Error("DATABASE_URL is required");
const client = new pg.Client({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});
await client.connect();
const result = await client.query(
  `SELECT migration_name FROM "_prisma_migrations"
   WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
);
await client.end();
const applied = new Set(result.rows.map((row) => row.migration_name));

for (const migration of baselineMigrations) {
  if (!applied.has(migration)) {
    run(npx, ["prisma", "migrate", "resolve", "--applied", migration]);
  }
}

run(npx, ["prisma", "migrate", "deploy"]);
run(npm, ["run", "build"]);
