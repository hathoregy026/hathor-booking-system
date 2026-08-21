/**
 * Chunked download (16KB ranges — avoids ~25KB stall) → WebP q90 → upload.
 * Prints SQL for MCP SiteImage updates. Does NOT delete old objects until DB updated.
 *
 * Usage: node scripts/safe-compress-fat-batch.mjs [slotName ...]
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const WEBSITE_BUCKET = "website-images";
const CHUNK = 16384;
const WEBP_QUALITY = 90;
const MAX_EDGE = 3200;
const MARKER = `/storage/v1/object/public/${WEBSITE_BUCKET}/`;

const dump = JSON.parse(
  fs.readFileSync(".tmp-live-supabase-images.json", "utf8"),
);
const wanted = process.argv.slice(2);
const targets = dump.filter((r) => {
  if (wanted.length && !wanted.includes(r.name)) return false;
  if (!r.url?.includes(MARKER)) return false;
  const ext = path.extname(r.url.split("?")[0]).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) return false;
  return Number(r.bytes || 0) >= 1_000_000;
});

const base = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!base || !key) throw new Error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");
const sb = createClient(base, key, { auth: { persistSession: false } });

function objectPathFromUrl(url) {
  const i = url.indexOf(MARKER);
  if (i < 0) return null;
  return decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
}

function curlRange(url, start, end, outFile) {
  const r = spawnSync(
    "curl.exe",
    [
      "-fsSL",
      "--http1.1",
      "--max-time",
      "45",
      "-r",
      `${start}-${end}`,
      "-o",
      outFile,
      url,
    ],
    { encoding: "utf8" },
  );
  return r.status === 0;
}

function chunkedDownload(url, totalBytes, label) {
  const tmpDir = path.join(process.cwd(), `.tmp-chunks-${label}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  const parts = [];
  try {
    for (let start = 0; start < totalBytes; start += CHUNK) {
      const end = Math.min(start + CHUNK - 1, totalBytes - 1);
      const part = path.join(tmpDir, `${start}.bin`);
      let ok = false;
      for (let tryN = 1; tryN <= 10 && !ok; tryN++) {
        if (curlRange(url, start, end, part) && fs.existsSync(part)) {
          const len = fs.statSync(part).size;
          const expect = end - start + 1;
          if (len === expect || (end === totalBytes - 1 && len > 0)) ok = true;
        }
        if (!ok) {
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300 * tryN);
        }
      }
      if (!ok) throw new Error(`chunk failed ${start}-${end}`);
      parts.push(part);
      if ((start / CHUNK) % 25 === 0) {
        console.log(`[${label}] progress ${start}/${totalBytes}`);
      }
    }
    const out = path.join(process.cwd(), `.tmp-dl-${label}.bin`);
    const fd = fs.openSync(out, "w");
    for (const p of parts) {
      fs.writeSync(fd, fs.readFileSync(p));
    }
    fs.closeSync(fd);
    return fs.readFileSync(out);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    const leftover = path.join(process.cwd(), `.tmp-dl-${label}.bin`);
    // keep until read above; remove after return via caller
    void leftover;
  }
}

async function headOk(url) {
  const r = spawnSync(
    "curl.exe",
    ["-sI", "--http1.1", "--max-time", "30", url],
    { encoding: "utf8" },
  );
  return /HTTP\/\d(?:\.\d)?\s+200/i.test(r.stdout || "");
}

async function toWebp(input) {
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
  return pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
}

const results = [];

for (const row of targets) {
  const oldPath = objectPathFromUrl(row.url);
  console.log(`\n=== ${row.name} (${(row.bytes / 1048576).toFixed(2)} MB) ===`);
  try {
    let total = Number(row.bytes) || 0;
    if (!total) {
      const hi = spawnSync(
        "curl.exe",
        ["-sI", "--http1.1", "--max-time", "30", row.url],
        { encoding: "utf8" },
      );
      const m = /Content-Length:\s*(\d+)/i.exec(hi.stdout || "");
      total = m ? Number(m[1]) : 0;
    }
    if (!total) throw new Error("unknown size");

    const input = chunkedDownload(row.url, total, row.name);
    const binPath = path.join(process.cwd(), `.tmp-dl-${row.name}.bin`);
    if (fs.existsSync(binPath)) fs.unlinkSync(binPath);

    console.log(`[${row.name}] input ${(input.length / 1048576).toFixed(3)} MB`);
    const out = await toWebp(input);
    console.log(`[${row.name}] output ${(out.length / 1048576).toFixed(3)} MB`);

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
    const newUrl = `${base.replace(/\/$/, "")}/storage/v1/object/public/${WEBSITE_BUCKET}/${objectPath}`;

    const tmpOut = path.join(process.cwd(), `.tmp-out-${row.name}.webp`);
    fs.writeFileSync(tmpOut, out);
    let uploaded = false;
    let lastUpErr = "";
    for (let tryN = 1; tryN <= 8 && !uploaded; tryN++) {
      const endpoint = `${base.replace(/\/$/, "")}/storage/v1/object/${WEBSITE_BUCKET}/${objectPath}`;
      const up = spawnSync(
        "curl.exe",
        [
          "-fsS",
          "--http1.1",
          "--max-time",
          "180",
          "-X",
          "POST",
          "-H",
          `Authorization: Bearer ${key}`,
          "-H",
          `apikey: ${key}`,
          "-H",
          "Content-Type: image/webp",
          "-H",
          "x-upsert: false",
          "--data-binary",
          `@${tmpOut}`,
          endpoint,
        ],
        { encoding: "utf8" },
      );
      if (up.status === 0) {
        uploaded = true;
      } else {
        lastUpErr = up.stderr || up.stdout || `status ${up.status}`;
        console.warn(`[${row.name}] upload try ${tryN}: ${lastUpErr.slice(0, 180)}`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 800 * tryN);
      }
    }
    if (!uploaded) throw new Error(`upload failed: ${lastUpErr}`);
    // Keep .tmp-out-*.webp until DB update is confirmed.

    if (!(await headOk(newUrl))) {
      await sb.storage.from(WEBSITE_BUCKET).remove([objectPath]);
      throw new Error("verify HEAD failed");
    }

    const item = {
      name: row.name,
      action: "uploaded-pending-db",
      before: input.length,
      after: out.length,
      saved: input.length - out.length,
      oldUrl: row.url,
      oldPath,
      newUrl,
      objectPath,
      sql: `UPDATE "SiteImage" SET url = '${newUrl}', "updatedAt" = NOW() WHERE name = '${row.name}';`,
    };
    results.push(item);
    console.log(`[${row.name}] UPLOADED → pending DB`);
  } catch (err) {
    console.error(`[${row.name}] FAIL`, err?.message || err);
    results.push({
      name: row.name,
      action: "failed",
      error: String(err?.message || err),
    });
  }
}

fs.writeFileSync(
  ".tmp-compress-upload-results.json",
  JSON.stringify({ results }, null, 2),
);
console.log("\n=== SUMMARY ===");
console.log(
  JSON.stringify(
    {
      uploaded: results.filter((r) => r.action === "uploaded-pending-db").length,
      failed: results.filter((r) => r.action === "failed").length,
      skipped: results.filter((r) => r.action?.startsWith("skip")).length,
    },
    null,
    2,
  ),
);
for (const r of results.filter((x) => x.sql)) {
  console.log(r.sql);
}
