/**
 * Optimizes default email bucket images for reliable display in email clients.
 * Run: node --env-file=.env scripts/optimize-email-bucket-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "email-images";
const BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");

const TARGETS = {
  logoUrl: {
    source: "e-mail-logo-egypttoor-booking-cruise-honeymoon.png",
    dest: "hathor-email-logo.png",
    optimize: (buffer) =>
      sharp(buffer, { failOn: "none" })
        .rotate()
        .resize(400, 120, { fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer(),
    contentType: "image/png",
  },
  heroImageUrl: {
    source: "cruise-in-egypt-hathor-holiday-on-nile.JPG",
    dest: "hathor-email-hero.jpg",
    optimize: (buffer) =>
      sharp(buffer, { failOn: "none" })
        .rotate()
        .resize(1200, 800, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer(),
    contentType: "image/jpeg",
  },
};

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const [label, config] of Object.entries(TARGETS)) {
    console.log(`\n${label}: downloading ${config.source}...`);
    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(config.source);

    if (downloadError || !data) {
      throw new Error(`Download failed: ${downloadError?.message}`);
    }

    const original = Buffer.from(await data.arrayBuffer());
    console.log(`  original: ${(original.length / 1024).toFixed(0)} KB`);

    const optimized = await config.optimize(original);
    console.log(`  optimized: ${(optimized.length / 1024).toFixed(0)} KB`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(config.dest, optimized, {
        contentType: config.contentType,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const publicUrl = `${BASE}/storage/v1/object/public/${BUCKET}/${config.dest}`;
    const verify = await fetch(publicUrl, { method: "HEAD" });
    console.log(`  public: ${publicUrl}`);
    console.log(`  HEAD: ${verify.status}`);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
