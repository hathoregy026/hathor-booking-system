/**
 * READ-ONLY media audit — disk + code refs + optional DB URL dump.
 * Does not mutate DB or storage.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const MEDIA_EXT = new Set([
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
  ".avif",
  ".ico",
]);

const SCAN_DIRS = [
  "public/media",
  "public/branding",
  "public/assets",
  "public/uploads",
  "public/videos",
  "public/textures",
];

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function publicUrlFromRel(relPosix) {
  if (!relPosix.startsWith("public/")) return null;
  return "/" + relPosix.slice("public/".length);
}

function mb(n) {
  return +(Number(n || 0) / 1024 / 1024).toFixed(3);
}

function basenameKey(urlOrPath) {
  const clean = String(urlOrPath).split("?")[0].split("#")[0];
  return path.posix.basename(clean).toLowerCase();
}

function collectMediaFiles() {
  const files = [];
  for (const rel of SCAN_DIRS) {
    const abs = path.join(root, rel);
    for (const file of walkFiles(abs)) {
      const ext = path.extname(file).toLowerCase();
      if (!MEDIA_EXT.has(ext)) continue;
      const relPosix = toPosix(path.relative(root, file));
      const st = fs.statSync(file);
      files.push({
        rel: relPosix,
        url: publicUrlFromRel(relPosix),
        bytes: st.size,
        ext,
      });
    }
  }
  return files.sort((a, b) => b.bytes - a.bytes);
}

function collectCodeText() {
  const parts = [];
  const dirs = ["app", "components", "lib", "hooks", "emails", "scripts"];
  for (const dir of dirs) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walkFiles(abs)) {
      const ext = path.extname(file).toLowerCase();
      if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".json", ".sql"].includes(ext)) {
        continue;
      }
      if (file.includes(`${path.sep}generated${path.sep}`)) continue;
      if (/[\\/]qa-.*[\\/]out[\\/]/.test(file)) continue;
      if (file.endsWith("audit-unused-media.mjs")) continue;
      try {
        parts.push(fs.readFileSync(file, "utf8"));
      } catch {
        /* ignore */
      }
    }
  }
  return parts.join("\n");
}

function loadJson(name) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function extractUrlsFromText(text) {
  const urls = new Set();
  const re =
    /(?:https:\/\/[^\s"'\\]+\.(?:webp|jpg|jpeg|png|gif|svg|mp4|webm)|\/(?:media|branding|uploads|assets|videos|textures)\/[^\s"'\\]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    urls.add(m[0].replace(/[,)}\\\]]+$/, ""));
  }
  return [...urls];
}

function slotNamesFromCode() {
  const src = fs.readFileSync(path.join(root, "lib/site-image-slots.ts"), "utf8");
  return [...src.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const media = collectMediaFiles();
const codeText = collectCodeText();
const dbDump = loadJson(".tmp-db-media-dump.json") || {};
const dbUrls = Array.isArray(dbDump.urls) ? dbDump.urls : [];
const storageObjects = Array.isArray(dbDump.storageObjects) ? dbDump.storageObjects : [];
const siteImages = Array.isArray(dbDump.siteImages) ? dbDump.siteImages : [];
const mapV2 = dbDump.mapV2 && typeof dbDump.mapV2 === "object" ? dbDump.mapV2 : {};
const mapLegacy =
  dbDump.mapLegacy && typeof dbDump.mapLegacy === "object" ? dbDump.mapLegacy : {};

const mapV2Urls = Object.values(mapV2).filter((u) => typeof u === "string");
const mapLegacyUrls = Object.values(mapLegacy).filter((u) => typeof u === "string");
const allDbUrlText = [
  ...dbUrls,
  ...mapV2Urls,
  ...mapLegacyUrls,
  ...siteImages.map((r) => r.url),
].join("\n");

const combined = codeText + "\n" + allDbUrlText;
const slots = slotNamesFromCode();
const slotSet = new Set(slots);

const referenced = [];
const unusedLikely = [];

for (const f of media) {
  const url = f.url || "";
  const base = basenameKey(url || f.rel);
  const hits = [];
  if (url && combined.includes(url)) hits.push("exact-url");
  if (base.length >= 8 && combined.toLowerCase().includes(base)) hits.push("basename");
  if (url) {
    const noSlash = url.replace(/^\//, "");
    if (combined.includes(noSlash)) hits.push("path-fragment");
  }
  if (url.includes("/media/hathor/r2/")) {
    const key = path.posix.basename(url, path.posix.extname(url));
    if (key.length >= 6 && combined.includes(`"${key}"`)) hits.push("r2-key-quoted");
    else if (key.length >= 6 && combined.includes(key)) hits.push("r2-key");
  }
  if (hits.length) referenced.push({ ...f, hits });
  else unusedLikely.push(f);
}

/** DB SiteImage rows whose slot name is not in current SITE_IMAGE_SLOTS */
const dbOrphanSlots = siteImages.filter((r) => !slotSet.has(r.name));

/** Slots in code with no SiteImage row */
const missingDbSlots = slots.filter(
  (name) => !siteImages.some((r) => r.name === name),
);

/** Storage objects not referenced by any known DB URL / map / code */
const knownStoragePaths = new Set();
for (const u of [...dbUrls, ...mapV2Urls, ...mapLegacyUrls, ...siteImages.map((r) => r.url)]) {
  if (typeof u !== "string") continue;
  const marker = "/storage/v1/object/public/";
  const i = u.indexOf(marker);
  if (i >= 0) {
    const rest = u.slice(i + marker.length); // bucket/path
    knownStoragePaths.add(rest);
    const slash = rest.indexOf("/");
    if (slash >= 0) knownStoragePaths.add(rest.slice(slash + 1));
  }
}
const codeStorageUrls = extractUrlsFromText(codeText).filter((u) =>
  u.includes("supabase.co/storage"),
);
for (const u of codeStorageUrls) {
  const marker = "/storage/v1/object/public/";
  const i = u.indexOf(marker);
  if (i >= 0) {
    const rest = u.slice(i + marker.length);
    knownStoragePaths.add(rest);
    const slash = rest.indexOf("/");
    if (slash >= 0) knownStoragePaths.add(rest.slice(slash + 1));
  }
}

const unusedStorage = [];
const usedStorage = [];
for (const obj of storageObjects) {
  const full = `${obj.bucket_id}/${obj.name}`;
  const used =
    knownStoragePaths.has(full) ||
    knownStoragePaths.has(obj.name) ||
    [...knownStoragePaths].some(
      (k) => k.endsWith(obj.name) || obj.name.endsWith(k) || full.includes(k),
    );
  const row = {
    bucket: obj.bucket_id,
    path: obj.name,
    mb: mb(obj.bytes),
    bytes: Number(obj.bytes || 0),
  };
  if (used) usedStorage.push(row);
  else unusedStorage.push(row);
}

unusedStorage.sort((a, b) => b.bytes - a.bytes);
usedStorage.sort((a, b) => b.bytes - a.bytes);

const report = {
  generatedAt: new Date().toISOString(),
  readOnly: true,
  summary: {
    diskMediaFiles: media.length,
    diskMediaMB: mb(media.reduce((s, f) => s + f.bytes, 0)),
    diskUnusedLikely: unusedLikely.length,
    diskUnusedMB: mb(unusedLikely.reduce((s, f) => s + f.bytes, 0)),
    siteImageRows: siteImages.length,
    siteImageOrphanSlots: dbOrphanSlots.length,
    codeSlots: slots.length,
    codeSlotsMissingInDb: missingDbSlots.length,
    storageObjects: storageObjects.length,
    storageTotalMB: mb(storageObjects.reduce((s, o) => s + Number(o.bytes || 0), 0)),
    storageUnusedLikely: unusedStorage.length,
    storageUnusedMB: mb(unusedStorage.reduce((s, o) => s + o.bytes, 0)),
    mapV2Keys: Object.keys(mapV2).length,
    mapLegacyKeys: Object.keys(mapLegacy).length,
  },
  diskUnusedLikely: unusedLikely.map((f) => ({
    url: f.url,
    mb: mb(f.bytes),
    bytes: f.bytes,
  })),
  dbOrphanSlots: dbOrphanSlots.map((r) => ({
    name: r.name,
    pagePath: r.pagePath,
    url: r.url,
  })),
  missingDbSlots,
  storageUnusedLikely: unusedStorage,
  storageHeaviestUsed: usedStorage.slice(0, 20),
  diskHeaviest: media.slice(0, 20).map((f) => ({ url: f.url, mb: mb(f.bytes) })),
};

const outPath = path.join(root, ".tmp-unused-media-audit.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report.summary, null, 2));
console.log("\n=== DISK unused-likely ===");
for (const u of report.diskUnusedLikely) console.log(`${u.mb} MB  ${u.url}`);
console.log("\n=== DB SiteImage slots NOT in SITE_IMAGE_SLOTS ===");
for (const u of report.dbOrphanSlots) console.log(`${u.name}  ${u.pagePath}  ${u.url}`);
console.log("\n=== STORAGE unused-likely (top 40) ===");
for (const u of report.storageUnusedLikely.slice(0, 40)) {
  console.log(`${u.mb} MB  ${u.bucket}/${u.path}`);
}
console.log(`\nWrote ${outPath}`);
