/**
 * Creates public Supabase Storage buckets for site and email images.
 *
 * Run: node scripts/setup-supabase-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";

const BUCKETS = [
  { name: "website-images", description: "Cruise photos, content images" },
  { name: "email-assets", description: "Email template logos and hero banners" },
];

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const key = serviceRoleKey ?? anonKey;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: listError } = await supabase.storage.listBuckets();

if (listError) {
  console.error("Failed to list buckets:", listError.message);
  process.exit(1);
}

for (const bucket of BUCKETS) {
  const alreadyExists = existing.some((entry) => entry.name === bucket.name);

  if (alreadyExists) {
    console.log(`Bucket "${bucket.name}" already exists.`);
    continue;
  }

  const { error: createError } = await supabase.storage.createBucket(bucket.name, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (createError) {
    console.error(`Failed to create bucket "${bucket.name}":`, createError.message);
    process.exit(1);
  }

  console.log(`Created public bucket "${bucket.name}" (${bucket.description}).`);
}

console.log("\nPublic image URLs:");
for (const bucket of BUCKETS) {
  console.log(
    `  ${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket.name}/<path>`,
  );
}
