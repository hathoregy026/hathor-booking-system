/**
 * Upload Hathor WebP site images to Supabase (website-images bucket)
 * and sync SiteImage.url in the database — SiteImage table only.
 *
 * Usage: node --env-file=.env scripts/sync-hathor-site-images-to-supabase.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../lib/prisma.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mediaDir = join(root, "public", "media", "hathor");
const manifest = JSON.parse(
  readFileSync(join(root, "lib", "hathor-media-manifest.json"), "utf8"),
);
const bucket = "website-images";
const storagePrefix = "hathor";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceKey) {
  console.error("[sync-hathor-supabase] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function publicUrl(objectPath) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function uploadWebp(fileName) {
  const key = fileName.replace(/\.webp$/i, "");
  const objectPath = `${storagePrefix}/${key}.webp`;
  const buffer = readFileSync(join(mediaDir, fileName));

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw new Error(`${objectPath}: ${error.message}`);
  }

  return { key, url: publicUrl(objectPath) };
}

async function uploadHeroVideo() {
  const localPath = join(mediaDir, "videos", "hero-promo.mp4");
  if (!existsSync(localPath)) {
    throw new Error("hero-promo.mp4 not found");
  }

  const objectPath = "hathor-hero-promo.mp4";
  const buffer = readFileSync(localPath);
  const videoBucket = "videos";

  const { error } = await supabase.storage.from(videoBucket).upload(objectPath, buffer, {
    contentType: "video/mp4",
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw new Error(`video ${objectPath}: ${error.message}`);
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${videoBucket}/${objectPath}`;
}

async function main() {
  const webpFiles = readdirSync(mediaDir).filter((name) => name.endsWith(".webp"));
  const uploaded = new Map();

  for (const fileName of webpFiles) {
    const { key, url } = await uploadWebp(fileName);
    uploaded.set(key, url);
    console.log(`[sync-hathor-supabase] uploaded ${key}`);
  }

  let dbUpdated = 0;
  const slotNames = Object.keys(manifest.images);
  for (const slotName of slotNames) {
    const supabaseUrlForSlot = uploaded.get(slotName);
    if (!supabaseUrlForSlot) continue;

    const result = await prisma.siteImage.updateMany({
      where: { name: slotName },
      data: { url: supabaseUrlForSlot },
    });
    if (result.count > 0) dbUpdated += 1;
  }

  let heroVideoUrl = null;
  try {
    heroVideoUrl = await uploadHeroVideo();
    console.log(`[sync-hathor-supabase] uploaded hero video → ${heroVideoUrl}`);
  } catch (error) {
    console.warn("[sync-hathor-supabase] hero video upload skipped:", error.message);
  }

  console.log(
    `[sync-hathor-supabase] done — ${uploaded.size} images uploaded, ${dbUpdated} SiteImage rows updated.`,
  );
  if (heroVideoUrl) {
    console.log(`[sync-hathor-supabase] set HATHOR_HERO_VIDEO_SUPABASE_SRC to: ${heroVideoUrl}`);
  }
}

main()
  .catch((error) => {
    console.error("[sync-hathor-supabase] failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
