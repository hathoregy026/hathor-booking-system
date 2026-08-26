/**
 * Frontend-only: download live CMS objects from Supabase Storage into
 * /public/media/hathor/optimized/{slot}.webp so the site can serve them from
 * Vercel instead of billing Cached Egress.
 *
 * Does NOT update the database.
 *
 *   node scripts/mirror-supabase-site-images-to-public.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "media", "hathor", "optimized");
const inventoryPath = path.join(root, "lib", "local-optimized-site-images.ts");

const KB = 1024;
const TARGET = {
  hero: 800 * KB,
  content: 400 * KB,
  thumb: 150 * KB,
};

const SKIP_IF_SMALLER_THAN = 8 * KB;

const ROWS = [
  ["about-hero", "hero", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/about-hero/about-us-hero-about-us-msm5e9xa.webp"],
  ["cruises-hero", "hero", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/cruises-hero/cruises-hero-cruises-msndpb6a.webp"],
  ["dining-intro-hero", "hero", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/dining-intro-hero/dining-intro-hero-mskpkrur.webp"],
  ["dining-projects-course-1", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/dining-projects-course-1/dining-welcome-course-mskpshi7.webp"],
  ["home-amenities-1", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-1/amenities-sequence-1-intro-fullscreen-photo-msir2hh4.webp"],
  ["home-amenities-10", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-10/amenities-sequence-10-opening-cards-fine-dining-msmvnz9w.webp"],
  ["home-amenities-11", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-11/amenities-sequence-11-opening-cards-third-photo-msms91o4.webp"],
  ["home-amenities-12", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-12/amenities-sequence-12-nature-fullscreen-after-opening-cards-mskwt0td.webp"],
  ["home-amenities-13", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-13/amenities-sequence-13-opening-cards-fourth-photo-msms9iv9.webp"],
  ["home-amenities-14", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-14/amenities-sequence-14-nature-gold-band-background-msp653e2.webp"],
  ["home-amenities-2", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-2/amenities-sequence-2-rising-full-bleed-photo-msi0ob67.webp"],
  ["home-amenities-4", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-4/amenities-sequence-4-fixed-left-stack-photo-msi115st.png"],
  ["home-amenities-5", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-5/amenities-sequence-5-slider-photo-2-msir3jnb.webp"],
  ["home-amenities-6", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-6/amenities-sequence-6-slider-photo-3-msmwyy02.webp"],
  ["home-amenities-7", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-7/amenities-sequence-7-slider-photo-4-msmvnm4o.webp"],
  ["home-amenities-8", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-8/amenities-sequence-8-opening-left-photo-msms57z5.webp"],
  ["home-amenities-9", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-amenities-9/amenities-sequence-9-opening-cards-a-way-of-life-pool-deck-mslba0ql.webp"],
  ["home-carousel-royal-3n", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-carousel-royal-3n/cruises-homepage-itinerary-3n-aswan-luxor-royal-suite-msndoppa.webp"],
  ["home-carousel-royal-4n", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-carousel-royal-4n/cruises-homepage-itinerary-4n-luxor-aswan-royal-suite-msndopev.webp"],
  ["home-carousel-royal-7n", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-carousel-royal-7n/cruises-homepage-itinerary-7n-round-trip-royal-suite-msndp0ym.webp"],
  ["home-split-courtyard", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-split-courtyard/homepage-amenities-sequence-2-rising-full-bleed-photo-msi02x8e.webp"],
  ["home-voyage-3n-aswan-luxor", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-voyage-3n-aswan-luxor/our-voyages-row-1-3-nights-4-days-aswan-to-luxor-msmcr97a.webp"],
  ["home-voyage-4n-luxor-aswan", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-voyage-4n-luxor-aswan/our-voyages-row-2-4-nights-5-days-luxor-to-aswan-msmcr90n.webp"],
  ["home-wheel-image", "hero", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/home-wheel-image/homepage-wheel-reveal-image-the-wheel-opens-into-mskwys8c.webp"],
  ["moving-tilted-3", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/moving-tilted-3/moving-tilted-cards-card-3-dining-msjh1hdz.webp"],
  ["moving-tilted-5", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/moving-tilted-5/moving-tilted-cards-card-5-suite-msjh1fcx.webp"],
  ["room-luxury", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/room-luxury/homepage-itineraries-carousel-luxury-cabin-msmzwmpz.webp"],
  ["scraped-cabin-1", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-cabin-1/luxury-cabins-gallery-luxury-cabin-gallery-photo-1-msm5a6lf.webp"],
  ["scraped-luxsuite-2", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-luxsuite-2/suites-gallery-luxury-suite-2-msjlun59.webp"],
  ["scraped-luxsuite-3", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-luxsuite-3/suites-gallery-luxury-suite-3-msjh3039.webp"],
  ["scraped-luxsuite-4", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-luxsuite-4/suites-gallery-luxury-suite-4-msjh31l1.webp"],
  ["scraped-luxsuite-5", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-luxsuite-5/suites-gallery-luxury-suite-5-msjh2zet.webp"],
  ["scraped-luxsuite-6", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-luxsuite-6/luxury-rooms-luxury-suite-gallery-photo-6-msjnfmog.webp"],
  ["scraped-royal-1", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-1/royal-suites-gallery-royal-suite-gallery-photo-1-msjgdudh.webp"],
  ["scraped-royal-2", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-2/royal-suites-gallery-royal-suite-gallery-photo-2-msjgdv98.webp"],
  ["scraped-royal-3", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-3/royal-suites-gallery-royal-suite-gallery-photo-3-msjgdvtn.webp"],
  ["scraped-royal-4", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-4/royal-suites-gallery-royal-suite-gallery-photo-4-msjgdw5f.webp"],
  ["scraped-royal-5", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-5/royal-suites-gallery-royal-suite-gallery-photo-5-msjgdtmw.webp"],
  ["scraped-royal-6", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-6/royal-suites-gallery-royal-suite-gallery-photo-6-msjgdv5x.webp"],
  ["scraped-royal-7", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-7/royal-suites-gallery-royal-suite-gallery-photo-7-msjgdv6v.webp"],
  ["scraped-royal-8", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-royal-8/royal-suites-gallery-royal-suite-gallery-photo-8-msjgdt8f.webp"],
  ["scraped-suites-hero", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-suites-hero/suites-hero-gallery-anchor-msjh32w7.webp"],
  ["scraped-suites-luxury-rooms", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-suites-luxury-rooms/suites-filter-luxury-rooms-card-msjh32sy.webp"],
  ["scraped-suites-luxury-suites", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-suites-luxury-suites/suites-filter-luxury-suites-card-msjh31gm.webp"],
  ["scraped-suites-royal", "content", "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images/scraped-suites-royal/luxury-rooms-luxury-suites-royal-suites-card-msjnfbqr.webp"],
];

function downloadBytes(url, name) {
  const tmp = path.join(root, `.tmp-mirror-${name}-${Date.now()}.bin`);
  const ps = `
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri @'
${url}
'@ -OutFile @'
${tmp}
'@ -TimeoutSec 90 -UseBasicParsing
`;
  const r = spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], {
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.status !== 0 || !fs.existsSync(tmp)) {
    throw new Error(
      `download failed: ${(r.stderr || r.stdout || String(r.status)).slice(0, 300)}`,
    );
  }
  const buf = fs.readFileSync(tmp);
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ignore */
  }
  if (buf.byteLength < 32) throw new Error("downloaded file too small");
  return buf;
}

function isWebp(buf) {
  return (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  );
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

    for (let quality = 86; quality >= 52; quality -= 4) {
      const out = await base.clone().webp({ quality, effort: 5 }).toBuffer();
      best = out;
      if (out.byteLength <= target) return out;
    }
  }
  return best;
}

function writeInventory(names) {
  const sorted = [...names].sort();
  const setBody = sorted.map((n) => `  ${JSON.stringify(n)},`).join("\n");
  const current = fs.readFileSync(inventoryPath, "utf8");
  const next = current.replace(
    /export const LOCAL_OPTIMIZED_SITE_IMAGE_SLOTS: ReadonlySet<string> = new Set\(\[[\s\S]*?\]\);/,
    `export const LOCAL_OPTIMIZED_SITE_IMAGE_SLOTS: ReadonlySet<string> = new Set([\n${setBody}\n]);`,
  );
  if (next === current) {
    throw new Error(
      "failed to patch LOCAL_OPTIMIZED_SITE_IMAGE_SLOTS in lib/local-optimized-site-images.ts",
    );
  }
  fs.writeFileSync(inventoryPath, next);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];

  for (const [name, kind, url] of ROWS) {
    const destAbs = path.join(outDir, `${name}.webp`);
    const originIsPng = url.toLowerCase().includes(".png");
    if (fs.existsSync(destAbs) && !originIsPng) {
      results.push({
        name,
        action: "kept-existing",
        afterKb: Math.round(fs.statSync(destAbs).size / KB),
      });
      console.log(
        `[${name}] reused local ${Math.round(fs.statSync(destAbs).size / KB)} KB`,
      );
      continue;
    }
    try {
      const input = downloadBytes(url, name);
      if (input.byteLength < SKIP_IF_SMALLER_THAN) {
        if (fs.existsSync(destAbs)) {
          results.push({
            name,
            action: "kept-existing",
            reason: `origin ${input.byteLength} B too small`,
            afterKb: Math.round(fs.statSync(destAbs).size / KB),
          });
          console.log(
            `[${name}] origin ${input.byteLength} B — kept existing local copy`,
          );
          continue;
        }
        throw new Error(`origin file too small (${input.byteLength} B)`);
      }

      const target = TARGET[kind] ?? TARGET.content;
      let output = input;
      let action = "copied";
      if (!isWebp(input) || input.byteLength > target) {
        output = await compressToWebp(input, kind);
        action = "compressed";
      }

      fs.writeFileSync(destAbs, output);
      results.push({
        name,
        action,
        beforeKb: Math.round(input.byteLength / KB),
        afterKb: Math.round(output.byteLength / KB),
      });
      console.log(
        `[${name}] ${action} ${Math.round(input.byteLength / KB)} KB → ${Math.round(output.byteLength / KB)} KB`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (fs.existsSync(destAbs)) {
        results.push({
          name,
          action: "kept-existing",
          reason: message,
          afterKb: Math.round(fs.statSync(destAbs).size / KB),
        });
        console.warn(`[${name}] ${message} — kept existing local copy`);
        continue;
      }
      results.push({ name, action: "failed", error: message });
      console.error(`[${name}] FAIL: ${message}`);
    }
  }

  const names = fs
    .readdirSync(outDir)
    .filter((f) => f.endsWith(".webp"))
    .map((f) => f.slice(0, -5))
    /* Hero poster is CMS-canonical — never re-add a local mirror. */
    .filter((name) => name !== "home-hero-poster");
  writeInventory(names);

  const failed = results.filter((r) => r.action === "failed").length;
  console.log(`\nMirrored ${results.length - failed}/${results.length}. Inventory ${names.length} slots.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
