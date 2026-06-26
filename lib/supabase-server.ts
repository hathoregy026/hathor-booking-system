import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("SUPABASE_URL is not configured.");
  }
  return url;
}

/** Storage uploads must use the service role — never the anon key. */
export function createSupabaseStorageAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for storage uploads. Add it in Vercel environment variables.",
    );
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const key = serviceRoleKey ?? anonKey;

  if (!key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for uploads).",
    );
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
