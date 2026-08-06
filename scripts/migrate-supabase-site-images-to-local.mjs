/**
 * Migrate SiteImage rows still on Supabase Storage → local
 * /public/media/hathor/optimized/*.webp (served by Vercel).
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-supabase-site-images-to-local.mjs
 *   node --env-file=.env scripts/migrate-supabase-site-images-to-local.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import pg from "pg";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "media", "hathor", "optimized");
const reportPath = path.join(root, ".tmp-migrate-supabase-to-local-report.json");
const DRY = process.argv.includes("--dry-run");

const KB = 1024;
const TARGET = {
  hero: 800 * KB,
  content: 400 * KB,
  thumb: 150 * KB,
};

function loadEnv(key) {
  if (process.env[key]?.trim()) return process.env[key].trim();
  for (const file of [".env.local", ".env"]) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const line = fs
      .readFileSync(full, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${key}=`));
    if (!line) continue;
    let v = line.slice(key.length + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v) return v;
  }
  return null;
}

function classify(name, category) {
  const n = String(name || "").toLowerCase();
  const c = String(category || "").toLowerCase();
  if (
    n.includes("floating-ig") ||
    n.includes("thumb") ||
    n.includes("plate")
  ) {
    return "thumb";
  }
  if (
    c === "hero" ||
    n.includes("hero") ||
    n.includes("wheel") ||
    n.includes("call-to-action")
  ) {
    return "hero";
  }
  return "content";
}

function downloadViaPowerShell(url, tmpPath) {
  const ps = `
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri @'
${url}
'@ -OutFile @'
${tmpPath}
'@ -TimeoutSec 120 -UseBasicParsing
`;
  const r = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-Command", ps],
    { encoding: "utf8", timeout: 150_000, maxBuffer: 20 * 1024 * 1024 },
  );
  if (r.status !== 0 || !fs.existsSync(tmpPath)) {
    throw new Error(
      `powershell download failed: ${(r.stderr || r.stdout || String(r.status)).slice(0, 300)}`,
    );
  }
  const buf = fs.readFileSync(tmpPath);
  try {
    fs.unlinkSync(tmpPath);
  } catch {
    /* ignore locked temp cleanup */
  }
  if (buf.byteLength < 32) throw new Error("downloaded file too small");
  return buf;
}

function downloadBytes(url, name) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const tmp = path.join(
      root,
      `.tmp-dl-${name}-${Date.now()}-${attempt}.bin`,
    );
    try {
      return downloadViaPowerShell(url, tmp);
    } catch (err) {
      lastErr = err;
      console.warn(`  download attempt ${attempt} failed: ${err?.message || err}`);
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  }
  throw lastErr;
}

async function compressToWebp(input, kind) {
  const target = TARGET[kind] ?? TARGET.content;
  const edgeSteps =
    kind === "thumb"
      ? [1280, 1024, 800, 640]
      : kind === "hero"
        ? [2560, 1920, 1600, 1280]
        : [1920, 1600, 1280, 1024];

  let best = null;
  for (const maxEdge of edgeSteps) {
    const base = sharp(input, { failOn: "none" })
      .rotate()
      .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true });

    for (let quality = 82; quality >= 48; quality -= 4) {
      const out = await base.clone().webp({ quality, effort: 5 }).toBuffer();
      best = out;
      if (out.byteLength <= target) return out;
    }
  }
  return best;
}

async function connectDb(databaseUrl) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    keepAlive: true,
  });
  client.on("error", (err) => {
    console.warn(`pg client error: ${err?.message || err}`);
  });
  await client.connect();
  return client;
}

async function main() {
  const databaseUrl = loadEnv("DATABASE_URL");
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  fs.mkdirSync(outDir, { recursive: true });

  let client = await connectDb(databaseUrl);

  const { rows } = await client.query(
    `SELECT name, category, url
     FROM "SiteImage"
     WHERE url ILIKE '%supabase.co/storage%'
     ORDER BY name`,
  );

  console.log(`Found ${rows.length} Supabase SiteImage rows`);
  const results = [];
  const pendingDb = [];

  for (const row of rows) {
    const kind = classify(row.name, row.category);
    const destRel = `/media/hathor/optimized/${row.name}.webp`;
    const destAbs = path.join(outDir, `${row.name}.webp`);

    /* Resume: if local optimized file already exists and DB still points at Supabase, reuse file. */
    if (fs.existsSync(destAbs) && !DRY) {
      const afterBytes = fs.statSync(destAbs).size;
      pendingDb.push({ name: row.name, url: destRel });
      results.push({
        name: row.name,
        kind,
        category: row.category,
        beforeBytes: null,
        afterBytes,
        beforeKb: null,
        afterKb: Math.round(afterBytes / KB),
        savedKb: null,
        oldUrl: row.url,
        newUrl: destRel,
        action: "reused-local",
      });
      console.log(
        `[${row.name}] reused local ${Math.round(afterBytes / KB)} KB → ${destRel}`,
      );
      continue;
    }

    try {
      console.log(`[${row.name}] downloading`);
      const input = downloadBytes(row.url, row.name);
      const output = await compressToWebp(input, kind);

      if (!DRY) {
        fs.writeFileSync(destAbs, output);
        pendingDb.push({ name: row.name, url: destRel });
      }

      const item = {
        name: row.name,
        kind,
        category: row.category,
        beforeBytes: input.byteLength,
        afterBytes: output.byteLength,
        beforeKb: Math.round(input.byteLength / KB),
        afterKb: Math.round(output.byteLength / KB),
        savedKb: Math.round((input.byteLength - output.byteLength) / KB),
        oldUrl: row.url,
        newUrl: destRel,
        action: DRY ? "dry-run" : "migrated",
      };
      results.push(item);
      console.log(
        `[${row.name}] ${item.beforeKb} KB → ${item.afterKb} KB (${kind}) → ${destRel}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${row.name}] FAIL: ${message}`);
      results.push({
        name: row.name,
        action: "failed",
        error: message,
        oldUrl: row.url,
      });
    }
  }

  if (!DRY && pendingDb.length) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (!client || client._ending || client._ended) {
          client = await connectDb(databaseUrl);
        }
        for (const item of pendingDb) {
          await client.query(
            `UPDATE "SiteImage"
             SET url = $1, "updatedAt" = NOW()
             WHERE name = $2`,
            [item.url, item.name],
          );
        }

        const { rows: allImages } = await client.query(
          `SELECT name, url, "altText"
           FROM "SiteImage"
           WHERE "isActive" = true
           ORDER BY name`,
        );

        const overrides = {};
        for (const img of allImages) {
          const url = String(img.url || "").trim();
          if (!url) continue;
          if (!(url.startsWith("/media/") || url.startsWith("/uploads/"))) {
            continue;
          }
          overrides[img.name] = {
            src: url,
            alt: String(img.altText || img.name).slice(0, 120),
          };
        }

        const payload = JSON.stringify(overrides);
        await client.query(
          `INSERT INTO "SiteSetting" (key, value, "updatedAt")
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, "updatedAt" = NOW()`,
          ["site-image-public-map-v2", payload],
        );
        console.log(
          `Updated ${pendingDb.length} SiteImage rows; rebuilt public map with ${Object.keys(overrides).length} overrides`,
        );
        break;
      } catch (err) {
        console.warn(
          `DB update attempt ${attempt} failed: ${err?.message || err}`,
        );
        try {
          await client?.end();
        } catch {
          /* ignore */
        }
        client = null;
        if (attempt === 3) throw err;
      }
    }
  }

  try {
    await client?.end();
  } catch {
    /* ignore */
  }

  const summary = {
    dryRun: DRY,
    migrated: results.filter((r) =>
      ["migrated", "dry-run", "reused-local"].includes(r.action),
    ).length,
    failed: results.filter((r) => r.action === "failed").length,
    totalBeforeKb: results.reduce((s, r) => s + (r.beforeKb || 0), 0),
    totalAfterKb: results.reduce((s, r) => s + (r.afterKb || 0), 0),
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\nReport: ${reportPath}`);
  console.log(
    `Totals: ${summary.totalBeforeKb} KB → ${summary.totalAfterKb} KB | failed=${summary.failed}`,
  );

  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
