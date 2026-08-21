/**
 * Safe orphan deletion by known-unused prefixes + explicit paths.
 * Does NOT touch live SiteImage/map URLs.
 *
 * node scripts/safe-delete-orphan-prefixes.mjs [--dry-run]
 */
import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const sb = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
);

/** Explicit single-object orphans */
const EXPLICIT = [
  { bucket: "videos", path: "hathor-luxury-nile-cruise-promo.mp4.mp4" },
  { bucket: "email-images", path: "logo-1782521661588.png" },
  { bucket: "email-images", path: "hero-1782521676025.jpg" },
  { bucket: "email-images", path: "hathor-email-hero.jpg" },
  { bucket: "email-images", path: "hathor-email-logo.png" },
  { bucket: "email-images", path: "test-upload-debug.png" },
  {
    bucket: "website-images",
    path: "site-images/home-story-legacy-large/homepage-homepage-homepage-homepage-hathor-dahabiya-sailing-on-the-nile-mrv67r3l.webp",
  },
];

/** Folder prefixes that are entirely unused (duplicate r2 copies + removed-slot dumps) */
const PREFIXES = [
  { bucket: "website-images", prefix: "hathor/r2" },
  { bucket: "website-images", prefix: "site-imageshome-post-hero-media" },
  { bucket: "website-images", prefix: "site-imageshome-residences-rooftop" },
  { bucket: "website-images", prefix: "site-imageshome-story-legacy-small" },
  { bucket: "website-images", prefix: "site-imageshome-hero-poster" },
  { bucket: "website-images", prefix: "site-imagescruises-hero" },
  { bucket: "website-images", prefix: "site-imageslandmark-hatshepsut" },
  { bucket: "website-images", prefix: "site-imageslandmark-valley-kings" },
];

async function listAll(bucket, prefix = "") {
  const out = [];
  const { data, error } = await sb.storage.from(bucket).list(prefix, {
    limit: 1000,
  });
  if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
  for (const item of data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    const isFile = item.id != null || item.metadata != null;
    if (!isFile) {
      out.push(...(await listAll(bucket, path)));
    } else {
      out.push({
        path,
        bytes: Number(item.metadata?.size || 0),
      });
    }
  }
  return out;
}

const report = [];
let freed = 0;

async function removeOne(bucket, path, bytes = 0) {
  if (DRY) {
    report.push({ key: `${bucket}/${path}`, bytes, action: "dry-run" });
    freed += bytes;
    return;
  }
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) {
    report.push({
      key: `${bucket}/${path}`,
      bytes,
      action: "failed",
      error: error.message,
    });
    console.error("FAIL", bucket, path, error.message);
  } else {
    report.push({ key: `${bucket}/${path}`, bytes, action: "deleted" });
    freed += bytes;
    console.log(`deleted ${(bytes / 1048576).toFixed(2)}MB ${bucket}/${path}`);
  }
}

for (const item of EXPLICIT) {
  await removeOne(item.bucket, item.path, 0);
}

for (const { bucket, prefix } of PREFIXES) {
  try {
    const files = await listAll(bucket, prefix);
    console.log(`prefix ${bucket}/${prefix}: ${files.length} files`);
    for (const f of files) {
      await removeOne(bucket, f.path, f.bytes);
    }
  } catch (err) {
    console.error("prefix failed", bucket, prefix, err.message);
    report.push({
      key: `${bucket}/${prefix}`,
      action: "prefix-failed",
      error: String(err.message || err),
    });
  }
}

fs.writeFileSync(
  ".tmp-orphan-delete-report.json",
  JSON.stringify({ dryRun: DRY, freed, report }, null, 2),
);
console.log(
  JSON.stringify(
    {
      count: report.filter((r) => r.action === "deleted" || r.action === "dry-run")
        .length,
      freedMB: +(freed / 1048576).toFixed(2),
      dryRun: DRY,
    },
    null,
    2,
  ),
);
