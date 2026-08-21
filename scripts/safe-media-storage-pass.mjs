/**
 * Storage-only safe compress + orphan delete.
 * DB updates are applied separately via Supabase MCP (local DB DNS blocked).
 *
 * Usage:
 *   node scripts/safe-media-storage-pass.mjs --compress
 *   node scripts/safe-media-storage-pass.mjs --delete-orphans
 *   node scripts/safe-media-storage-pass.mjs --delete-local-r2
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const WEBSITE_BUCKET = "website-images";
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
];

function sb() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");
  return { client: createClient(url, key, { auth: { persistSession: false } }), url };
}

function parsePublicPath(url) {
  const marker = "/storage/v1/object/public/";
  const i = String(url).indexOf(marker);
  if (i < 0) return null;
  const rest = url.slice(i + marker.length).split("?")[0];
  const slash = rest.indexOf("/");
  if (slash < 0) return null;
  return {
    bucket: rest.slice(0, slash),
    path: decodeURIComponent(rest.slice(slash + 1)),
  };
}

function publicUrl(base, bucket, objectPath) {
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
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
  const buffer = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  return buffer;
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

async function downloadBytes(url, parsed, client) {
  // Authenticated storage API first (more reliable than public fetch on flaky links).
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const { data, error } = await client.storage
        .from(parsed.bucket)
        .download(parsed.path);
      if (error || !data) throw new Error(error?.message || "empty download");
      return Buffer.from(await data.arrayBuffer());
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw lastErr || new Error("download failed");
}

async function compressPass() {
  const dump = JSON.parse(
    fs.readFileSync(".tmp-live-supabase-images.json", "utf8"),
  );
  const { client, url: base } = sb();
  const results = [];

  for (const row of dump) {
    const parsed = parsePublicPath(row.url);
    if (!parsed || parsed.bucket !== WEBSITE_BUCKET) {
      results.push({ name: row.name, action: "skip-bucket" });
      continue;
    }

    let input;
    try {
      input = await downloadBytes(row.url, parsed, client);
    } catch (err) {
      results.push({
        name: row.name,
        action: "download-failed",
        error: String(err?.message || err),
      });
      continue;
    }
    const ext = path.extname(parsed.path).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      results.push({ name: row.name, action: "skip-type", bytes: input.length });
      continue;
    }
    if (input.length < MIN_COMPRESS_BYTES) {
      results.push({ name: row.name, action: "skip-small", bytes: input.length });
      continue;
    }
    if (ext === ".webp" && input.length < 1_400_000) {
      results.push({ name: row.name, action: "skip-webp-ok", bytes: input.length });
      continue;
    }

    const out = await toHighQualityWebp(input);
    if (out.length >= input.length * 0.95) {
      results.push({
        name: row.name,
        action: "skip-no-gain",
        before: input.length,
        after: out.length,
      });
      continue;
    }

    const objectPath = `site-images/${row.name}/optimized-${Date.now()}.webp`;
    const newUrl = publicUrl(base, WEBSITE_BUCKET, objectPath);

    if (DRY_RUN) {
      results.push({
        name: row.name,
        action: "dry-run",
        before: input.length,
        after: out.length,
        oldUrl: row.url,
        newUrl,
        oldPath: parsed.path,
        objectPath,
      });
      console.log(
        `[dry] ${row.name} ${(input.length / 1048576).toFixed(2)}→${(out.length / 1048576).toFixed(2)} MB`,
      );
      continue;
    }

    const up = await client.storage.from(WEBSITE_BUCKET).upload(objectPath, out, {
      contentType: "image/webp",
      upsert: false,
    });
    if (up.error) {
      results.push({
        name: row.name,
        action: "upload-failed",
        error: up.error.message,
      });
      continue;
    }
    if (!(await headOk(newUrl))) {
      await client.storage.from(WEBSITE_BUCKET).remove([objectPath]);
      results.push({ name: row.name, action: "verify-failed" });
      continue;
    }

    results.push({
      name: row.name,
      action: "uploaded-pending-db",
      before: input.length,
      after: out.length,
      saved: input.length - out.length,
      oldUrl: row.url,
      newUrl,
      oldPath: parsed.path,
      objectPath,
    });
    console.log(
      `[uploaded] ${row.name} ${(input.length / 1048576).toFixed(2)}→${(out.length / 1048576).toFixed(2)} MB`,
    );
  }

  fs.writeFileSync(
    ".tmp-compress-upload-results.json",
    JSON.stringify({ dryRun: DRY_RUN, results }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        pendingDb: results.filter((r) => r.action === "uploaded-pending-db").length,
        dryRun: results.filter((r) => r.action === "dry-run").length,
        skipped: results.filter((r) => r.action.startsWith("skip")).length,
      },
      null,
      2,
    ),
  );
}

async function deleteOldAfterDb() {
  const file = ".tmp-compress-upload-results.json";
  if (!fs.existsSync(file)) throw new Error("missing compress results");
  const { results } = JSON.parse(fs.readFileSync(file, "utf8"));
  const { client } = sb();
  const done = [];
  for (const r of results) {
    if (r.action !== "uploaded-pending-db" && r.action !== "db-updated") continue;
    if (!r.oldPath) continue;
    if (DRY_RUN) {
      done.push({ name: r.name, action: "dry-run-delete-old" });
      continue;
    }
    const { error } = await client.storage
      .from(WEBSITE_BUCKET)
      .remove([r.oldPath]);
    done.push({
      name: r.name,
      action: error ? "old-delete-failed" : "old-deleted",
      error: error?.message,
    });
  }
  fs.writeFileSync(
    ".tmp-compress-old-deleted.json",
    JSON.stringify(done, null, 2),
  );
  console.log(JSON.stringify({ deletedOld: done.length }, null, 2));
}

async function deleteOrphans() {
  const liveFile = ".tmp-live-storage-keys.json";
  const allFile = ".tmp-all-storage-objects.json";
  const live = new Set(JSON.parse(fs.readFileSync(liveFile, "utf8")));
  const all = JSON.parse(fs.readFileSync(allFile, "utf8"));
  const { client } = sb();
  let freed = 0;
  const deleted = [];
  for (const obj of all) {
    const key = `${obj.bucket_id}/${obj.name}`;
    if (live.has(key)) continue;
    if (DRY_RUN) {
      deleted.push({ key, bytes: obj.bytes, action: "dry-run" });
      freed += Number(obj.bytes || 0);
      continue;
    }
    const { error } = await client.storage
      .from(obj.bucket_id)
      .remove([obj.name]);
    if (!error) {
      freed += Number(obj.bytes || 0);
      deleted.push({ key, bytes: obj.bytes, action: "deleted" });
      console.log(
        `[orphan] ${(Number(obj.bytes) / 1048576).toFixed(2)}MB ${key}`,
      );
    } else {
      deleted.push({
        key,
        bytes: obj.bytes,
        action: "failed",
        error: error.message,
      });
    }
  }
  fs.writeFileSync(
    ".tmp-orphan-delete-report.json",
    JSON.stringify({ dryRun: DRY_RUN, freed, deleted }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        count: deleted.length,
        freedMB: +(freed / 1048576).toFixed(2),
        dryRun: DRY_RUN,
      },
      null,
      2,
    ),
  );
}

function deleteLocalR2() {
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
      out.push({ key, action: "dry-run", bytes });
      continue;
    }
    fs.unlinkSync(file);
    out.push({ key, action: "unlinked", bytes });
  }
  fs.writeFileSync(".tmp-local-r2-delete.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

const mode = process.argv.find((a) =>
  ["--compress", "--delete-old", "--delete-orphans", "--delete-local-r2"].includes(
    a,
  ),
);
if (mode === "--compress") await compressPass();
else if (mode === "--delete-old") await deleteOldAfterDb();
else if (mode === "--delete-orphans") await deleteOrphans();
else if (mode === "--delete-local-r2") deleteLocalR2();
else {
  console.error(
    "Use --compress | --delete-old | --delete-orphans | --delete-local-r2 [--dry-run]",
  );
  process.exit(1);
}
