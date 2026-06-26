/**
 * Creates public Supabase Storage buckets for site and email images.
 *
 * Run: node scripts/setup-supabase-storage.mjs
 */

import { createClient } from "@supabase/supabase-js";

const FIVE_MB = 5 * 1024 * 1024;
const FIFTEEN_MB = 15 * 1024 * 1024;

const BUCKETS = [
  {
    name: "website-images",
    description: "Cruise photos, content images",
    fileSizeLimit: FIVE_MB,
  },
  {
    name: "email-images",
    description: "Email template logos and hero banners",
    fileSizeLimit: FIFTEEN_MB,
  },
];

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const bucketOptions = {
    public: true,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  };

  if (alreadyExists) {
    const { error: updateError } = await supabase.storage.updateBucket(
      bucket.name,
      bucketOptions,
    );

    if (updateError) {
      console.error(
        `Failed to update bucket "${bucket.name}":`,
        updateError.message,
      );
      process.exit(1);
    }

    console.log(
      `Updated bucket "${bucket.name}" (max ${bucket.fileSizeLimit / (1024 * 1024)} MB).`,
    );
    continue;
  }

  const { error: createError } = await supabase.storage.createBucket(
    bucket.name,
    bucketOptions,
  );

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
