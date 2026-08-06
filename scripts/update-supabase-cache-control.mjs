/**
 * Re-upload existing public website-images / email-images objects with
 * cacheControl=31536000 so browsers/CDN can cache for 1 year.
 *
 * Usage:
 *   node --env-file=.env scripts/update-supabase-cache-control.mjs
 *   node --env-file=.env scripts/update-supabase-cache-control.mjs --dry-run
 *   node --env-file=.env scripts/update-supabase-cache-control.mjs --bucket=email-images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const DRY = process.argv.includes("--dry-run");
const CACHE_CONTROL = "31536000";
const reportPath = path.join(root, ".tmp-update-cache-control-report.json");

const bucketArg = process.argv.find((a) => a.startsWith("--bucket="));
const BUCKETS = bucketArg
  ? [bucketArg.slice("--bucket=".length)]
  : ["website-images", "email-images"];

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

async function listAll(supabase, bucket, prefix = "") {
  const out = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    if (!data?.length) break;

    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id) {
        out.push({
          path: full,
          size: entry.metadata?.size ?? null,
          cacheControl: entry.metadata?.cacheControl ?? null,
        });
      } else {
        const nested = await listAll(supabase, bucket, full);
        out.push(...nested);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }
  return out;
}

function guessContentType(objectPath) {
  const ext = objectPath.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

function downloadPublicViaPowerShell(publicUrl, tmpPath) {
  const ps = `
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri @'
${publicUrl}
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
      `download failed: ${(r.stderr || r.stdout || String(r.status)).slice(0, 240)}`,
    );
  }
  const buf = fs.readFileSync(tmpPath);
  try {
    fs.unlinkSync(tmpPath);
  } catch {
    /* ignore */
  }
  return buf;
}

async function main() {
  const url = loadEnv("SUPABASE_URL");
  const key = loadEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results = [];

  for (const bucket of BUCKETS) {
    console.log(`\nListing ${bucket}...`);
    const files = await listAll(supabase, bucket);
    console.log(`  ${files.length} objects`);

    for (const file of files) {
      const already =
        String(file.cacheControl || "").includes("31536000") ||
        String(file.cacheControl || "").includes("max-age=31536000");
      if (already) {
        results.push({
          bucket,
          path: file.path,
          action: "skip-already-long-cache",
          cacheControl: file.cacheControl,
        });
        continue;
      }

      try {
        if (DRY) {
          results.push({
            bucket,
            path: file.path,
            action: "dry-run",
            beforeCache: file.cacheControl,
          });
          continue;
        }

        const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${file.path}`;
        const tmp = path.join(
          root,
          `.tmp-cc-${bucket}-${file.path.replace(/[\\/]/g, "_")}-${Date.now()}.bin`,
        );
        const buffer = downloadPublicViaPowerShell(publicUrl, tmp);
        const contentType = guessContentType(file.path);
        const body = new Uint8Array(buffer);

        const { error: upError } = await supabase.storage
          .from(bucket)
          .upload(file.path, body, {
            contentType,
            cacheControl: CACHE_CONTROL,
            upsert: true,
          });
        if (upError) throw new Error(upError.message);

        const head = await fetch(publicUrl, { method: "HEAD" }).catch(() => null);
        const cc = head?.headers?.get("cache-control") ?? null;

        results.push({
          bucket,
          path: file.path,
          action: "updated",
          bytes: buffer.byteLength,
          beforeCache: file.cacheControl,
          afterCache: cc,
          headStatus: head?.status ?? null,
        });
        console.log(`  ✓ ${bucket}/${file.path} → ${cc || "(pending)"}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ ${bucket}/${file.path}: ${message}`);
        results.push({
          bucket,
          path: file.path,
          action: "failed",
          error: message,
        });
      }
    }
  }

  const summary = {
    dryRun: DRY,
    updated: results.filter((r) => r.action === "updated").length,
    skipped: results.filter((r) => r.action === "skip-already-long-cache")
      .length,
    failed: results.filter((r) => r.action === "failed").length,
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\nReport: ${reportPath}`);
  console.log(
    `updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed}`,
  );
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
