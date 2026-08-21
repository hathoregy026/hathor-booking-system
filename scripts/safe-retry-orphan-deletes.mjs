import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
);

const retries = [
  ["email-images", "hathor-email-logo.png"],
  ["website-images", "hathor/r2/blog-hero.webp"],
  ["website-images", "hathor/r2/gastronomy-restaurant.webp"],
  ["website-images", "hathor/r2/home-cinematic-still.webp"],
  ["website-images", "hathor/r2/home-hero-poster.webp"],
  ["website-images", "hathor/r2/home-split-courtyard.webp"],
  ["website-images", "hathor/r2/home-story-legacy-large.webp"],
  ["website-images", "hathor/r2/landmark-valley-kings.webp"],
  [
    "website-images",
    "site-imagescruises-hero/1783542722393-4b0cd10b-751f-4841-9486-4233ae491cdc.png",
  ],
];

async function list(bucket, prefix) {
  const { data, error } = await sb.storage.from(bucket).list(prefix, {
    limit: 100,
  });
  if (error) throw error;
  return (data || [])
    .filter((i) => i.id != null || i.metadata)
    .map((i) => (prefix ? `${prefix}/${i.name}` : i.name));
}

for (const prefix of [
  "site-imageshome-story-legacy-small",
  "site-imageslandmark-valley-kings",
]) {
  try {
    const files = await list("website-images", prefix);
    for (const f of files) retries.push(["website-images", f]);
  } catch (e) {
    console.error("list fail", prefix, e.message);
  }
}

for (const [bucket, path] of retries) {
  for (let i = 1; i <= 3; i++) {
    const { error } = await sb.storage.from(bucket).remove([path]);
    if (!error) {
      console.log("deleted", bucket, path);
      break;
    }
    console.error("retry", i, bucket, path, error.message);
    await new Promise((r) => setTimeout(r, 1000 * i));
  }
}
console.log("retry pass done");
