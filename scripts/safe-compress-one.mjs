/**
 * Compress ONE SiteImage by name (PNG/JPG → WebP q90), upload, print SQL for MCP update.
 * Usage: node scripts/safe-compress-one.mjs <slotName>
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const name = process.argv[2];
if (!name) {
  console.error("Usage: node scripts/safe-compress-one.mjs <slotName>");
  process.exit(1);
}

const dump = JSON.parse(
  fs.readFileSync(".tmp-live-supabase-images.json", "utf8"),
);
const row = dump.find((r) => r.name === name);
if (!row) {
  console.error("slot not in dump:", name);
  process.exit(1);
}

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const sb = createClient(url, key, { auth: { persistSession: false } });

const marker = "/storage/v1/object/public/website-images/";
const idx = row.url.indexOf(marker);
const oldPath = decodeURIComponent(row.url.slice(idx + marker.length).split("?")[0]);

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function downloadViaStorageApi() {
  const { data, error } = await sb.storage.from("website-images").download(oldPath);
  if (error || !data) throw new Error(error?.message || "storage download empty");
  return Buffer.from(await data.arrayBuffer());
}

function downloadViaCurl() {
  const tmp = path.join(process.cwd(), `.tmp-dl-${name}`);
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  const authUrl = `${url.replace(/\/$/, "")}/storage/v1/object/website-images/${oldPath}`;
  const r = spawnSync(
    "curl.exe",
    [
      "-fsSL",
      "--http1.1",
      "--retry",
      "5",
      "--retry-delay",
      "2",
      "--retry-all-errors",
      "-H",
      `Authorization: Bearer ${key}`,
      "-H",
      `apikey: ${key}`,
      "-o",
      tmp,
      authUrl,
    ],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(`curl failed: ${r.stderr || r.stdout || r.status}`);
  }
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return buf;
}

async function downloadBytes() {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`download storage-api attempt ${attempt}: ${oldPath}`);
      return await downloadViaStorageApi();
    } catch (err) {
      lastErr = err;
      console.warn(`storage-api fail: ${err?.message || err}`);
      await sleep(1000 * attempt);
    }
  }
  try {
    console.log("download curl fallback");
    return downloadViaCurl();
  } catch (err) {
    throw lastErr || err;
  }
}

console.log("fetching", row.url);
const input = await downloadBytes();
console.log("input MB", +(input.length / 1048576).toFixed(3));

const meta = await sharp(input, { failOn: "none" }).metadata();
const w = meta.width || 0;
const h = meta.height || 0;
const longest = Math.max(w, h);
let pipeline = sharp(input, { failOn: "none" }).rotate();
if (longest > 3200) {
  pipeline = pipeline.resize({
    width: w >= h ? 3200 : undefined,
    height: h > w ? 3200 : undefined,
    fit: "inside",
    withoutEnlargement: true,
  });
}
const out = await pipeline.webp({ quality: 90, effort: 4 }).toBuffer();
console.log("output MB", +(out.length / 1048576).toFixed(3));

if (out.length >= input.length * 0.95) {
  console.log("NO_GAIN skip");
  process.exit(0);
}

const objectPath = `site-images/${name}/optimized-${Date.now()}.webp`;
const newUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/website-images/${objectPath}`;

const up = await sb.storage.from("website-images").upload(objectPath, out, {
  contentType: "image/webp",
  upsert: false,
});
if (up.error) throw up.error;

const check = await fetch(newUrl, { method: "HEAD", cache: "no-store" });
if (!check.ok) {
  await sb.storage.from("website-images").remove([objectPath]);
  throw new Error("verify failed");
}

const result = {
  name,
  oldUrl: row.url,
  oldPath,
  newUrl,
  objectPath,
  before: input.length,
  after: out.length,
};
fs.writeFileSync(
  `.tmp-compress-one-${name}.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
console.log(
  `SQL: UPDATE \"SiteImage\" SET url = '${newUrl}', \"updatedAt\" = NOW() WHERE name = '${name}';`,
);
