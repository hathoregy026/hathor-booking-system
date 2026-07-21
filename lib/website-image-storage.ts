import { IMAGE_BUCKET } from "@/lib/image-upload";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

/**
 * Extract the object path inside `website-images` from a public Supabase URL.
 * Returns null for local `/media/...` defaults (not in the bucket).
 */
export function parseWebsiteImageStoragePath(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return null;

  const raw = trimmed.slice(idx + marker.length).split("?")[0]?.split("#")[0];
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Best-effort delete of a previous upload from Supabase Storage. Never throws. */
export async function deleteWebsiteImageByUrl(
  url: string | null | undefined,
): Promise<boolean> {
  const path = parseWebsiteImageStoragePath(url);
  if (!path) return false;

  try {
    const supabase = createSupabaseStorageAdminClient();
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) {
      console.error("[website-image-storage] remove failed:", path, error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[website-image-storage] remove error:", error);
    return false;
  }
}
