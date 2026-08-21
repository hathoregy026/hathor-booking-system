/**
 * Download fat PNG/JPG via 16KB ranges → WebP q90 → write to public/media/hathor/optimized/
 * (Used when Supabase upload is network-blocked.) Prints SQL for SiteImage → local path.
 *
 * Usage: node scripts/safe-compress-to-local.mjs [slotName ...]
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const WEBSITE_BUCKET = "website-images";
const CHUNK = 16384;
const WEBP_QUALITY = 90;
const MAX_EDGE = 3200;
const MARKER = `/storage/v1/object/public/${WEBSITE_BUCKET}/`;
const OUT_DIR = path.join(process.cwd(), "public/media/hathor/optimized");

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

fs.mkdirSync(OUT_DIR, { recursive: true });

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
  try {
    const parts = [];
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
    const bufs = parts.map((p) => fs.readFileSync(p));
    return Buffer.concat(bufs);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
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
  console.log(`\n=== ${row.name} (${(row.bytes / 1048576).toFixed(2)} MB) ===`);
  try {
    const total = Number(row.bytes) || 0;
    if (!total) throw new Error("unknown size");
    const input = chunkedDownload(row.url, total, row.name);
    console.log(`[${row.name}] input ${(input.length / 1048576).toFixed(3)} MB`);
    const out = await toWebp(input);
    const meta = await sharp(out, { failOn: "none" }).metadata();
    console.log(
      `[${row.name}] output ${(out.length / 1048576).toFixed(3)} MB ${meta.width}x${meta.height}`,
    );

    const fileName = `${row.name}.webp`;
    const abs = path.join(OUT_DIR, fileName);
    fs.writeFileSync(abs, out);
    const localUrl = `/media/hathor/optimized/${fileName}`;

    const item = {
      name: row.name,
      action: "wrote-local",
      before: input.length,
      after: out.length,
      saved: input.length - out.length,
      width: meta.width,
      height: meta.height,
      oldUrl: row.url,
      localUrl,
      abs,
      sql: `UPDATE "SiteImage" SET url = '${localUrl}', "updatedAt" = NOW() WHERE name = '${row.name}';`,
    };
    results.push(item);
    console.log(`[${row.name}] WROTE ${localUrl}`);
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
  ".tmp-compress-local-results.json",
  JSON.stringify({ results }, null, 2),
);
console.log("\n=== SUMMARY ===");
console.log(
  JSON.stringify(
    {
      wrote: results.filter((r) => r.action === "wrote-local").length,
      failed: results.filter((r) => r.action === "failed").length,
      savedMB: +(
        results
          .filter((r) => r.action === "wrote-local")
          .reduce((s, r) => s + r.saved, 0) / 1048576
      ).toFixed(2),
    },
    null,
    2,
  ),
);
for (const r of results.filter((x) => x.sql)) console.log(r.sql);
