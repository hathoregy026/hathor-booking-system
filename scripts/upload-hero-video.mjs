import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const localPath = join(
    root,
    "public",
    "media",
    "hathor",
    "videos",
    "hero-promo.mp4",
  );
  if (!existsSync(localPath)) {
    console.warn(
      "hero-promo.mp4 not found locally (optional legacy upload source). Nothing to upload.",
    );
    return;
  }
  const buffer = readFileSync(localPath);
  const { error } = await supabase.storage.from("videos").upload("hathor-hero-promo.mp4", buffer, {
    contentType: "video/mp4",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
  console.log(
    `${supabaseUrl}/storage/v1/object/public/videos/hathor-hero-promo.mp4`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
