/**
 * Replace all site images with assets from `assets/HATHOR IMAGES`.
 * - Size policy: full quality ≤1 MB; compress only above 1 MB
 *   (heroes target ≤800 KB, gallery/content ≤500 KB) — see lib/image-size-policy.ts
 * - Writes to /public/media/hathor/r2/ (new path = no immutable CDN flashbacks)
 * - Uploads to Supabase website-images under hathor/r2/
 * - Deletes previous SiteImage rows and reseeds URLs
 * - NEVER touches hero video or branding/gold logo assets
 *
 * Usage: node --env-file=.env scripts/replace-site-images-from-hathor-assets.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = join(root, "assets", "HATHOR IMAGES");
const outDir = join(root, "public", "media", "hathor", "r2");
const oldWebpDir = join(root, "public", "media", "hathor");
const MEDIA_BASE = "/media/hathor/r2";
const STORAGE_PREFIX = "hathor/r2";
const BUCKET = "website-images";
const MAX_WIDTH = 1920;
const COMPRESS_ABOVE = 1 * 1024 * 1024;
const HERO_TARGET = 800 * 1024;
const CONTENT_TARGET = 500 * 1024;

function listImages(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(dir, f));
}

function take(pool, index) {
  if (!pool.length) throw new Error("Empty image pool");
  return pool[index % pool.length];
}

const pools = {
  drone: listImages(join(assetsRoot, "Drone", "Drone")),
  gym: listImages(join(assetsRoot, "Gym", "Gym")),
  lifestyle: listImages(join(assetsRoot, "Lifestyle", "Lifestyle")),
  night: listImages(join(assetsRoot, "Night overview", "Night overview")),
  overview: listImages(join(assetsRoot, "overview", "overview")),
  restaurant: listImages(join(assetsRoot, "Restaurant", "Restaurant")),
  romantic: listImages(join(assetsRoot, "Romantic Dinner", "Romantic Dinner")),
  rooms: listImages(join(assetsRoot, "Rooms", "Rooms")),
};

/** Explicit slot → source file mapping (by category pools). */
const SLOT_SOURCES = {
  // Overview / drone / night → heroes & full-bleeds
  "home-hero-poster": take(pools.overview, 0),
  "home-post-hero-media": take(pools.overview, 1),
  "home-split-courtyard": take(pools.drone, 0),
  "home-residences-rooftop": take(pools.drone, 1),
  "home-sketch-boat": take(pools.overview, 2),
  "home-testimonials-bg": take(pools.night, 0),
  "home-collage-bg": take(pools.night, 1),
  "home-story-legacy-large": take(pools.overview, 3),
  "home-story-legacy-small": take(pools.drone, 2),
  "home-split-venue": take(pools.drone, 3),
  "cruises-hero": take(pools.overview, 4),
  "about-hero": take(pools.overview, 5),
  "charter-hero": take(pools.drone, 4),
  "contact-hero": take(pools.overview, 6),
  "blog-hero": take(pools.lifestyle, 0),
  "highlights-hero": take(pools.lifestyle, 1),
  "highlights-lifestyle": take(pools.lifestyle, 2),
  "landmark-obelisk": take(pools.overview, 7),
  "landmark-hatshepsut": take(pools.drone, 5),
  "landmark-valley-kings": take(pools.overview, 8),
  "home-alt-highlights": take(pools.lifestyle, 3),
  "home-split-service": take(pools.lifestyle, 4),

  // Rooms
  "room-luxury": take(pools.rooms, 0),
  "room-suite": take(pools.rooms, 1),
  "room-royal": take(pools.rooms, 2),
  "home-story-craft-large": take(pools.rooms, 3),
  "home-story-craft-small": take(pools.rooms, 4),
  "home-story-transform": take(pools.rooms, 5),
  "home-cinematic-still": take(pools.rooms, 6),
  "home-split-interiors": take(pools.rooms, 7),
  "home-collage-large": take(pools.rooms, 8),
  "home-collage-small": take(pools.rooms, 9),
  "home-collage-living": take(pools.rooms, 10),
  "home-residences-kitchen": take(pools.rooms, 11),
  "home-residences-lounge": take(pools.rooms, 12),
  "legacy-cabin": take(pools.rooms, 13),
  "legacy-suite": take(pools.rooms, 14),
  "legacy-royal": take(pools.rooms, 15),
  "legacy-interior": take(pools.rooms, 16),

  // Dining
  "gastronomy-hero": take(pools.restaurant, 0),
  "gastronomy-restaurant": take(pools.restaurant, 1),
  "about-dining": take(pools.restaurant, 2),
  "home-alt-dining": take(pools.restaurant, 3),
  "home-cinematic-video": take(pools.romantic, 0),
  charter: take(pools.romantic, 1),

  // Wellness
  "wellness-hero": take(pools.gym, 0),
  "wellness-fitness": take(pools.gym, 1),
  "home-alt-wellness": take(pools.gym, 2),
};

const SLOT_META = {
  "home-hero-poster": { alt: "Hathor Dahabiya sailing on the Nile at sunset", category: "hero", pagePath: "/", displayOrder: 0 },
  "home-post-hero-media": { alt: "Hathor Dahabiya on the Nile with ancient Egyptian landmarks", category: "general", pagePath: "/", displayOrder: 1 },
  "home-story-craft-large": { alt: "Ornate interior corridor aboard a luxury Dahabiya", category: "general", pagePath: "/", displayOrder: 10 },
  "home-story-craft-small": { alt: "Detailed craftsmanship on the Hathor Dahabiya", category: "general", pagePath: "/", displayOrder: 11 },
  "home-story-transform": { alt: "Grand staircase and elegant interior aboard Hathor", category: "general", pagePath: "/", displayOrder: 12 },
  "home-story-legacy-large": { alt: "Hathor Dahabiya sailing on the Nile", category: "general", pagePath: "/", displayOrder: 13 },
  "home-story-legacy-small": { alt: "Ancient Egyptian temple viewed from the Nile", category: "general", pagePath: "/", displayOrder: 14 },
  "home-cinematic-video": { alt: "Fine dining aboard Hathor Dahabiya", category: "general", pagePath: "/", displayOrder: 20 },
  "home-cinematic-still": { alt: "Luxury suite aboard Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 21 },
  "home-split-courtyard": { alt: "Hathor Dahabiya on the Nile", category: "landmark", pagePath: "/", displayOrder: 22 },
  "home-split-service": { alt: "Elegant hallway aboard the Hathor Dahabiya", category: "general", pagePath: "/", displayOrder: 30 },
  "home-split-interiors": { alt: "Luxury suite interior on the Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 31 },
  "home-split-venue": { alt: "Temple of Hatshepsut along the Nile cruise route", category: "landmark", pagePath: "/", displayOrder: 32 },
  "home-collage-bg": { alt: "Hathor Dahabiya on the Nile at golden hour", category: "hero", pagePath: "/", displayOrder: 40 },
  "home-collage-large": { alt: "Luxury corridor with chandelier aboard Hathor", category: "general", pagePath: "/", displayOrder: 41 },
  "home-collage-small": { alt: "Marble and mosaic detail aboard Hathor Dahabiya", category: "general", pagePath: "/", displayOrder: 42 },
  "home-collage-living": { alt: "Luxury suite aboard Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 43 },
  "home-residences-kitchen": { alt: "Luxury cabin interior aboard Hathor Dahabiya", category: "room", pagePath: "/", displayOrder: 50 },
  "home-residences-lounge": { alt: "Luxury lounge aboard the Hathor Dahabiya", category: "general", pagePath: "/", displayOrder: 51 },
  "home-residences-rooftop": { alt: "Sun deck aboard Hathor Dahabiya at golden hour", category: "hero", pagePath: "/", displayOrder: 52 },
  "home-sketch-boat": { alt: "Hathor Dahabiya sailing on the Nile", category: "general", pagePath: "/", displayOrder: 53 },
  "home-alt-dining": { alt: "Fine dining restaurant aboard Hathor Dahabiya", category: "dining", pagePath: "/", displayOrder: 60 },
  "home-alt-wellness": { alt: "Seneb Spa wellness pool aboard Hathor", category: "spa", pagePath: "/", displayOrder: 61 },
  "home-alt-highlights": { alt: "Ancient landmarks along the Nile", category: "landmark", pagePath: "/", displayOrder: 62 },
  "home-testimonials-bg": { alt: "Hathor Dahabiya on the Nile at sunset", category: "general", pagePath: "/", displayOrder: 70 },
  "room-luxury": { alt: "Luxury cabin aboard Hathor Dahabiya", category: "room", pagePath: "/rooms", displayOrder: 0 },
  "room-suite": { alt: "Luxury suite aboard Hathor Dahabiya", category: "suite", pagePath: "/rooms", displayOrder: 1 },
  "room-royal": { alt: "Royal suite aboard Hathor Dahabiya", category: "suite", pagePath: "/rooms", displayOrder: 2 },
  charter: { alt: "Private charter aboard Hathor Dahabiya", category: "general", pagePath: "/charter", displayOrder: 0 },
  "cruises-hero": { alt: "Luxury Dahabiya cruise on the Nile", category: "hero", pagePath: "/cruises", displayOrder: 0 },
  "about-hero": { alt: "Hathor Dahabiya sailing on the Nile", category: "hero", pagePath: "/about", displayOrder: 0 },
  "gastronomy-hero": { alt: "Gourmet dining aboard Hathor Dahabiya with Nile views", category: "dining", pagePath: "/gastronomy", displayOrder: 0 },
  "gastronomy-restaurant": { alt: "Hathor Dahabiya restaurant interior", category: "dining", pagePath: "/gastronomy", displayOrder: 1 },
  "wellness-hero": { alt: "Seneb Spa wellness aboard Hathor Dahabiya", category: "spa", pagePath: "/wellness", displayOrder: 0 },
  "wellness-fitness": { alt: "Fitness and active wellness aboard Hathor", category: "spa", pagePath: "/wellness", displayOrder: 1 },
  "highlights-hero": { alt: "Dahabiya sailing past ancient Egyptian monuments", category: "landmark", pagePath: "/highlights", displayOrder: 0 },
  "highlights-lifestyle": { alt: "Scenic Nile views from Hathor Dahabiya", category: "landmark", pagePath: "/highlights", displayOrder: 1 },
  "landmark-obelisk": { alt: "Unfinished Obelisk, Aswan", category: "landmark", pagePath: "/highlights", displayOrder: 2 },
  "landmark-hatshepsut": { alt: "Temple of Hatshepsut", category: "landmark", pagePath: "/highlights", displayOrder: 3 },
  "landmark-valley-kings": { alt: "Valley of the Kings, Luxor", category: "landmark", pagePath: "/highlights", displayOrder: 4 },
  "charter-hero": { alt: "Private charter on the Hathor Dahabiya", category: "hero", pagePath: "/charter", displayOrder: 0 },
  "contact-hero": { alt: "Hathor Dahabiya on the Nile", category: "hero", pagePath: "/contact", displayOrder: 0 },
  "blog-hero": { alt: "Hathor Dahabiya blog — stories from the Nile", category: "general", pagePath: "/blogs", displayOrder: 0 },
  "about-dining": { alt: "Fine dining aboard Hathor Dahabiya", category: "dining", pagePath: "/about", displayOrder: 1 },
  "legacy-cabin": { alt: "Luxury cabin aboard Hathor Dahabiya", category: "room", pagePath: "/", displayOrder: 90 },
  "legacy-suite": { alt: "Luxury suite aboard Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 91 },
  "legacy-royal": { alt: "Royal suite aboard Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 92 },
  "legacy-interior": { alt: "Suite interiors aboard Hathor Dahabiya", category: "suite", pagePath: "/", displayOrder: 93 },
};

async function toWebp(sourcePath, targetPath, kind = "content") {
  const input = readFileSync(sourcePath);

  /* Under 1 MB: full-quality WebP (no downscale, q100) — paths stay .webp. */
  if (input.byteLength <= COMPRESS_ABOVE) {
    const output = await sharp(input, { failOn: "none" })
      .rotate()
      .webp({ quality: 100, effort: 4 })
      .toBuffer();
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, output);
    return output;
  }

  const target = kind === "hero" ? HERO_TARGET : CONTENT_TARGET;
  const base = sharp(input, { failOn: "none" })
    .rotate()
    .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true });

  let best = null;
  for (let quality = 86; quality >= 68; quality -= 6) {
    const output = await base.clone().webp({ quality, effort: 4 }).toBuffer();
    best = output;
    if (output.byteLength <= target) break;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, best);
  return best;
}

async function main() {
  console.log("[replace-images] pools:", Object.fromEntries(
    Object.entries(pools).map(([k, v]) => [k, v.length]),
  ));

  // Safety: never delete hero video or branding
  const heroVideo = join(oldWebpDir, "videos", "hathor-luxury-nile-cruise-promo-bestofegypt.mp4");
  const goldLogo = join(root, "public", "branding", "gold.svg");
  if (!existsSync(heroVideo)) {
    console.warn("[replace-images] WARNING: hero video missing (left untouched):", heroVideo);
  } else {
    console.log("[replace-images] keeping hero video:", heroVideo);
  }
  if (!existsSync(goldLogo)) {
    console.warn("[replace-images] WARNING: gold logo missing:", goldLogo);
  } else {
    console.log("[replace-images] keeping gold logo:", goldLogo);
  }

  mkdirSync(outDir, { recursive: true });

  const written = [];
  for (const [slot, source] of Object.entries(SLOT_SOURCES)) {
    if (!existsSync(source)) {
      throw new Error(`Missing source for ${slot}: ${source}`);
    }
    const target = join(outDir, `${slot}.webp`);
    const meta = SLOT_META[slot];
    const kind = meta?.category === "hero" ? "hero" : "content";
    const buffer = await toWebp(source, target, kind);
    written.push({ slot, source, target, bytes: buffer.length });
    console.log(
      `[replace-images] ${slot} ← ${source.replace(root + "\\", "").replace(root + "/", "")} (${(buffer.length / 1024).toFixed(0)} KB)`,
    );
  }

  // Remove old flat /media/hathor/*.webp only (not videos/, not r2/)
  const oldFiles = readdirSync(oldWebpDir).filter((f) => f.endsWith(".webp"));
  for (const file of oldFiles) {
    rmSync(join(oldWebpDir, file), { force: true });
  }
  console.log(`[replace-images] deleted ${oldFiles.length} old root webp files`);

  // Upload to Supabase + reseed DB
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const uploadedUrls = new Map();

  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Best-effort: remove old hathor/*.webp objects (keep hathor/r2)
    try {
      const { data: listed } = await supabase.storage.from(BUCKET).list("hathor", { limit: 200 });
      const toRemove = (listed ?? [])
        .filter((obj) => obj.name?.endsWith(".webp"))
        .map((obj) => `hathor/${obj.name}`);
      if (toRemove.length) {
        await supabase.storage.from(BUCKET).remove(toRemove);
        console.log(`[replace-images] removed ${toRemove.length} old supabase objects under hathor/`);
      }
    } catch (error) {
      console.warn("[replace-images] old storage cleanup skipped:", error.message);
    }

    for (const { slot, target, bytes } of written) {
      const objectPath = `${STORAGE_PREFIX}/${slot}.webp`;
      const buffer = readFileSync(target);
      const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (error) throw new Error(`upload ${objectPath}: ${error.message}`);
      const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${objectPath}`;
      uploadedUrls.set(slot, url);
      console.log(`[replace-images] uploaded ${slot} (${(bytes / 1024).toFixed(0)} KB)`);
    }
  } else {
    console.warn("[replace-images] No Supabase credentials — using local /media/hathor/r2 URLs only");
  }

  // Write SQL seed for SiteImage (applied via Supabase MCP)
  const sqlLines = [
    "BEGIN;",
    'DELETE FROM "SiteImage";',
  ];
  for (const [slot, meta] of Object.entries(SLOT_META)) {
    if (!SLOT_SOURCES[slot]) continue;
    const localUrl = `${MEDIA_BASE}/${slot}.webp`;
    const alt = meta.alt.replace(/'/g, "''");
    sqlLines.push(
      `INSERT INTO "SiteImage" (id, name, "altText", url, category, "pagePath", "displayOrder", "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, '${slot}', '${alt}', '${localUrl}', '${meta.category}', '${meta.pagePath}', ${meta.displayOrder}, true, NOW(), NOW());`,
    );
  }
  sqlLines.push("COMMIT;");
  const sqlPath = join(root, "scripts", "_replace-site-images.sql");
  writeFileSync(sqlPath, sqlLines.join("\n") + "\n");
  console.log(`[replace-images] wrote SQL seed: ${sqlPath}`);
  console.log(`[replace-images] prepared ${Object.keys(SLOT_SOURCES).length} SiteImage inserts`);

  // Write manifest for future syncs
  const relativeSources = Object.fromEntries(
    Object.entries(SLOT_SOURCES).map(([slot, abs]) => [
      slot,
      abs.replace(join(root, "assets") + "\\", "").replace(join(root, "assets") + "/", "").replace(/\\/g, "/"),
    ]),
  );
  writeFileSync(
    join(root, "lib", "hathor-media-manifest.json"),
    JSON.stringify(
      {
        sourceRoot: "HATHOR IMAGES",
        mediaBase: MEDIA_BASE,
        images: relativeSources,
        videos: {
          "hero-reel": "DO-NOT-TOUCH",
          "hero-promo": "DO-NOT-TOUCH",
        },
      },
      null,
      2,
    ) + "\n",
  );

  console.log("[replace-images] DONE");
  console.log(`[replace-images] local base: ${MEDIA_BASE}`);
  console.log(`[replace-images] supabase uploads: ${uploadedUrls.size}`);
}

main().catch((error) => {
  console.error("[replace-images] FAILED:", error);
  process.exit(1);
});
