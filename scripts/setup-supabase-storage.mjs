/**
 * Creates the public Supabase Storage bucket "website-images".
 *
 * Prerequisites:
 *   1. Add to .env:
 *        SUPABASE_URL=https://<project-ref>.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  (recommended for uploads)
 *        SUPABASE_ANON_KEY=<anon-key>
 *   2. Get keys from Supabase Dashboard → Project Settings → API
 *
 * Run:
 *   node scripts/setup-supabase-storage.mjs
 *
 * Manual setup (Supabase Dashboard → Storage):
 *   - Create bucket: website-images
 *   - Enable "Public bucket"
 *   - File size limit: 5 MB (Project Settings → Storage)
 *   - Allowed MIME types: image/jpeg, image/png, image/webp (optional)
 *
 * Storage policies (SQL Editor) for public reads:
 *   create policy "Public read website images"
 *   on storage.objects for select
 *   using ( bucket_id = 'website-images' );
 *
 * Uploads are handled by the Next.js admin API using the service role key
 * (protected by admin session middleware). Do not expose the service role key
 * to the browser.
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "website-images";

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

const alreadyExists = existing.some((bucket) => bucket.name === BUCKET);

if (alreadyExists) {
  console.log(`Bucket "${BUCKET}" already exists.`);
} else {
  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (createError) {
    console.error("Failed to create bucket:", createError.message);
    process.exit(1);
  }

  console.log(`Created public bucket "${BUCKET}".`);
}

console.log("\nDone. Public image URLs will look like:");
console.log(
  `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/<folder>/<filename>`,
);
