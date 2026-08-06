/**
 * Idempotent production-safe rebuild of SiteSetting site-image-public-map-v2.
 *
 * Default: create the map only when missing/empty (never clobber newer admin edits).
 * Force: rebuild from active SiteImage rows (--force).
 *
 * Usage:
 *   node --env-file=.env scripts/rebuild-site-image-public-map.mjs
 *   node --env-file=.env scripts/rebuild-site-image-public-map.mjs --force
 *
 * Does not print connection strings or credentials.
 */
import fs from "node:fs";
import pg from "pg";

const KEY = "site-image-public-map-v2";
const FORCE = process.argv.includes("--force");

function loadEnvUrl() {
  if (process.env.DATABASE_URL) {
    let v = process.env.DATABASE_URL.trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    const line = fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("DATABASE_URL="));
    if (!line) continue;
    let v = line.slice("DATABASE_URL=".length).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  throw new Error("DATABASE_URL is not set");
}

function shouldUse(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/media/") || trimmed.startsWith("/uploads/")) {
    return !trimmed.startsWith("//") && !/[\u0000-\u001f]/.test(trimmed);
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (
      parsed.hostname.includes("supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/public/")
    ) {
      return true;
    }
    return (
      parsed.pathname.startsWith("/media/") ||
      parsed.pathname.startsWith("/uploads/")
    );
  } catch {
    return false;
  }
}

async function main() {
  const connectionString = loadEnvUrl();
  const host = new URL(connectionString).hostname;
  console.log(
    JSON.stringify({
      action: "rebuild-site-image-public-map",
      key: KEY,
      force: FORCE,
      host,
    }),
  );

  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
  client.on("error", () => {});
  await client.connect();

  try {
    await client.query("SET statement_timeout TO 20000");

    const existing = await client.query(
      `SELECT length(value::text)::int AS len, "updatedAt"
       FROM "SiteSetting" WHERE key = $1`,
      [KEY],
    );
    const hasRow = existing.rowCount > 0;
    const len = Number(existing.rows[0]?.len ?? 0);

    if (hasRow && len > 2 && !FORCE) {
      console.log(
        JSON.stringify({
          ok: true,
          skipped: true,
          reason: "map already present; pass --force to rebuild",
          bytes: len,
          updatedAt: existing.rows[0].updatedAt,
        }),
      );
      return;
    }

    const images = await client.query(
      `SELECT name, url FROM "SiteImage" WHERE "isActive" = true`,
    );
    const compact = {};
    for (const record of images.rows) {
      const url = String(record.url || "").trim();
      if (!shouldUse(url)) continue;
      /*
       * Persist remote CMS uploads and local /media|/uploads overrides
       * (including /media/hathor/optimized migrations). Never persist
       * Supabase storage URLs — those cause Cached Egress on the free plan.
       */
      if (url.includes("supabase.co/storage")) continue;
      compact[record.name] = url;
    }

    const payload = JSON.stringify(compact);
    await client.query(
      `INSERT INTO "SiteSetting" (key, value, "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
      [KEY, payload],
    );

    console.log(
      JSON.stringify({
        ok: true,
        skipped: false,
        siteImageRows: images.rowCount,
        overrideKeys: Object.keys(compact).length,
        payloadBytes: payload.length,
        note: "Call admin image save or revalidateTag('public-cms') after deploy so Next cache refreshes",
      }),
    );
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
});
