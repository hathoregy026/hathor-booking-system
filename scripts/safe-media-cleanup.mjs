/**
 * Safe media maintenance (approved cleanup):
 * 1) High-quality WebP recompress of fat LIVE SiteImage assets (PNG/JPG > 1.0 MB)
 * 2) Delete storage objects not referenced by any live SiteImage / SiteContent / Email / map-v2 URL
 *
 * Quality rules:
 * - Keep original pixel dimensions unless edge > 3200 (then max 3200)
 * - WebP quality 90 (near-lossless look)
 * - Never update SiteImage until new object is uploaded + HEAD-ok
 * - Old object deleted only after DB points at the new URL
 *
 * Usage: node --env-file=.env scripts/safe-media-cleanup.mjs
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import pg from "pg";

const WEBSITE_BUCKET = "website-images";
const EMAIL_BUCKET = "email-images";
const VIDEOS_BUCKET = "videos";
const MIN_COMPRESS_BYTES = 1_000_000;
const WEBP_QUALITY = 90;
const MAX_EDGE = 3200;
const DRY_RUN = process.argv.includes("--dry-run");

const REMOVED_LOCAL_R2 = [
  "home-story-craft-small",
  "home-story-transform",
  "home-story-legacy-small",
  "home-cinematic-video",
  "home-split-interiors",
  "home-split-venue",
  "home-collage-bg",
  "home-collage-large",
  "home-collage-small",
  "home-residences-kitchen",
  "home-residences-lounge",
  "home-residences-rooftop",
  "home-sketch-boat",
  "home-alt-dining",
  "home-alt-wellness",
  "home-testimonials-bg",
  "home-post-hero-media",
  // keep home-split-service — still charter-service default
];

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!url) throw new Error("Missing SUPABASE_URL");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function dbClient() {
  // Prefer pooler URL — direct db.* host often fails DNS from local networks.
  const connectionString =
    process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim();
  if (!connectionString) throw new Error("Missing DATABASE_URL");
  return new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
    query_timeout: 90000,
  });
}

function parsePublicPath(url) {
  const marker = "/storage/v1/object/public/";
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const rest = url.slice(i + marker.length).split("?")[0];
  const slash = rest.indexOf("/");
  if (slash < 0) return null;
  return {
    bucket: rest.slice(0, slash),
    path: decodeURIComponent(rest.slice(slash + 1)),
  };
}

function publicUrl(supabaseUrl, bucket, objectPath) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function toHighQualityWebp(input) {
  const img = sharp(input, { failOn: "none" });
  const meta = await img.metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;
  const longest = Math.max(w, h);
  let pipeline = img.rotate();
  if (longest > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: w >= h ? MAX_EDGE : undefined,
      height: h > w ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  const buffer = await pipeline
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
  return { buffer, width: w, height: h };
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (res.ok) return true;
    const get = await fetch(url, { method: "GET", cache: "no-store" });
    return get.ok;
  } catch {
    return false;
  }
}

async function compressLiveFatImages(client, sb) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
  const { rows } = await client.query(`
    SELECT name, url, category
    FROM "SiteImage"
    WHERE url LIKE 'https://%supabase.co/storage%'
    ORDER BY name
  `);

  const report = [];
  for (const row of rows) {
    const parsed = parsePublicPath(row.url);
    if (!parsed || parsed.bucket !== WEBSITE_BUCKET) {
      report.push({ name: row.name, action: "skip-non-website-bucket" });
      continue;
    }

    const { data, error } = await sb.storage
      .from(parsed.bucket)
      .download(parsed.path);
    if (error || !data) {
      report.push({
        name: row.name,
        action: "skip-download-failed",
        error: error?.message,
      });
      continue;
    }

    const input = Buffer.from(await data.arrayBuffer());
    const ext = path.extname(parsed.path).toLowerCase();
    const isRaster =
      ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp";
    if (!isRaster || input.byteLength < MIN_COMPRESS_BYTES) {
      report.push({
        name: row.name,
        action: "skip-small-or-type",
        bytes: input.byteLength,
      });
      continue;
    }

    // Prefer converting heavy PNG/JPG. Re-encode already-WebP only if > 1.4MB.
    if (ext === ".webp" && input.byteLength < 1_400_000) {
      report.push({
        name: row.name,
        action: "skip-webp-ok",
        bytes: input.byteLength,
      });
      continue;
    }

    const { buffer: out } = await toHighQualityWebp(input);
    if (out.byteLength >= input.byteLength * 0.95) {
      report.push({
        name: row.name,
        action: "skip-no-gain",
        before: input.byteLength,
        after: out.byteLength,
      });
      continue;
    }

    const objectPath = `site-images/${row.name}/optimized-${Date.now()}.webp`;
    const newUrl = publicUrl(supabaseUrl, WEBSITE_BUCKET, objectPath);

    if (DRY_RUN) {
      report.push({
        name: row.name,
        action: "dry-run-compress",
        before: input.byteLength,
        after: out.byteLength,
        objectPath,
      });
      continue;
    }

    const up = await sb.storage.from(WEBSITE_BUCKET).upload(objectPath, out, {
      contentType: "image/webp",
      upsert: false,
    });
    if (up.error) {
      report.push({
        name: row.name,
        action: "upload-failed",
        error: up.error.message,
      });
      continue;
    }

    const ok = await headOk(newUrl);
    if (!ok) {
      await sb.storage.from(WEBSITE_BUCKET).remove([objectPath]);
      report.push({ name: row.name, action: "verify-failed-rolled-back" });
      continue;
    }

    await client.query(
      `UPDATE "SiteImage" SET url = $1, "updatedAt" = NOW() WHERE name = $2`,
      [newUrl, row.name],
    );

    // Delete previous object only after DB switch
    await sb.storage.from(parsed.bucket).remove([parsed.path]);

    report.push({
      name: row.name,
      action: "compressed",
      before: input.byteLength,
      after: out.byteLength,
      saved: input.byteLength - out.byteLength,
      newUrl,
    });
    console.log(
      `[compress] ${row.name} ${(input.byteLength / 1024 / 1024).toFixed(2)}MB → ${(out.byteLength / 1024 / 1024).toFixed(2)}MB`,
    );
  }
  return report;
}

async function collectLivePaths(client) {
  const { rows } = await client.query(`
    WITH live_urls AS (
      SELECT url AS u FROM "SiteImage"
      UNION ALL SELECT "imageUrl" FROM "SiteContent" WHERE COALESCE("imageUrl",'') <> ''
      UNION ALL SELECT "logoUrl" FROM "EmailTemplate" WHERE COALESCE("logoUrl",'') <> ''
      UNION ALL SELECT "heroImageUrl" FROM "EmailTemplate" WHERE COALESCE("heroImageUrl",'') <> ''
      UNION ALL
      SELECT value::json ->> k
      FROM "SiteSetting" s
      CROSS JOIN LATERAL json_object_keys(s.value::json) AS k
      WHERE s.key = 'site-image-public-map-v2'
    )
    SELECT u FROM live_urls WHERE u LIKE '%/storage/v1/object/public/%'
  `);
  const live = new Set();
  for (const row of rows) {
    const parsed = parsePublicPath(row.u);
    if (parsed) live.add(`${parsed.bucket}/${parsed.path}`);
  }
  return live;
}

async function deleteOrphanStorage(client, sb) {
  const live = await collectLivePaths(client);
  const { rows } = await client.query(`
    SELECT bucket_id, name, COALESCE((metadata->>'size')::bigint,0) AS bytes
    FROM storage.objects
    ORDER BY bytes DESC
  `);

  const report = [];
  let freed = 0;
  for (const obj of rows) {
    const key = `${obj.bucket_id}/${obj.name}`;
    if (live.has(key)) {
      report.push({ key, action: "keep-live", bytes: Number(obj.bytes) });
      continue;
    }
    // Safety: never delete email live logos if somehow mismatched — already handled by live set
    if (DRY_RUN) {
      report.push({ key, action: "dry-run-delete", bytes: Number(obj.bytes) });
      freed += Number(obj.bytes);
      continue;
    }
    const { error } = await sb.storage.from(obj.bucket_id).remove([obj.name]);
    if (error) {
      report.push({
        key,
        action: "delete-failed",
        error: error.message,
        bytes: Number(obj.bytes),
      });
      continue;
    }
    freed += Number(obj.bytes);
    report.push({ key, action: "deleted", bytes: Number(obj.bytes) });
    console.log(
      `[orphan] deleted ${(Number(obj.bytes) / 1024 / 1024).toFixed(2)}MB  ${key}`,
    );
  }
  return { report, freed };
}

function deleteLocalRemovedR2() {
  const dir = path.join(process.cwd(), "public/media/hathor/r2");
  const out = [];
  for (const key of REMOVED_LOCAL_R2) {
    const file = path.join(dir, `${key}.webp`);
    if (!fs.existsSync(file)) {
      out.push({ key, action: "missing" });
      continue;
    }
    const bytes = fs.statSync(file).size;
    if (DRY_RUN) {
      out.push({ key, action: "dry-run-unlink", bytes });
      continue;
    }
    fs.unlinkSync(file);
    out.push({ key, action: "unlinked", bytes });
    console.log(`[local-r2] removed ${key}.webp`);
  }
  return out;
}

async function rebuildMap(client) {
  // Compact overrides-only map (same idea as lib/site-image-public-map.ts)
  const { rows } = await client.query(
    `SELECT name, url, "altText" FROM "SiteImage" WHERE "isActive" = true`,
  );
  const overrides = {};
  for (const row of rows) {
    if (/^https?:\/\//i.test(row.url)) {
      overrides[row.name] = row.url;
    }
  }
  if (DRY_RUN) return { keys: Object.keys(overrides).length, dryRun: true };
  await client.query(
    `INSERT INTO "SiteSetting"(key, value, "updatedAt")
     VALUES ('site-image-public-map-v2', $1, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [JSON.stringify(overrides)],
  );
  return { keys: Object.keys(overrides).length };
}

async function main() {
  const sb = supabaseAdmin();
  const client = dbClient();
  await client.connect();
  console.log(JSON.stringify({ dryRun: DRY_RUN, phase: "start" }));

  const compress = await compressLiveFatImages(client, sb);
  const orphans = await deleteOrphanStorage(client, sb);
  const local = deleteLocalRemovedR2();
  const map = await rebuildMap(client);

  const summary = {
    dryRun: DRY_RUN,
    compressed: compress.filter((r) => r.action === "compressed").length,
    compressSavedBytes: compress
      .filter((r) => r.action === "compressed")
      .reduce((s, r) => s + (r.saved || 0), 0),
    orphansDeleted: orphans.report.filter((r) => r.action === "deleted").length,
    orphansFreedBytes: orphans.freed,
    localRemoved: local.filter((r) => r.action === "unlinked").length,
    mapKeys: map.keys,
  };

  fs.writeFileSync(
    ".tmp-safe-media-cleanup-report.json",
    JSON.stringify({ summary, compress, orphans, local, map }, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
