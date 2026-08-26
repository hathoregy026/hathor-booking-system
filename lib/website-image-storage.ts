import { IMAGE_BUCKET } from "@/lib/image-upload";
import { sanitizeStorageFolder } from "@/lib/seo-image-filename";
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

export function websiteImageFolderFromPath(path: string): string | null {
  const cleaned = path.replace(/^\/+|\/+$/g, "");
  const slash = cleaned.lastIndexOf("/");
  if (slash <= 0) return null;
  return sanitizeStorageFolder(cleaned.slice(0, slash));
}

function siteImageSlotFolder(slotName: string): string {
  return sanitizeStorageFolder(`site-images/${slotName.trim().toLowerCase()}`);
}

async function removeStoragePaths(paths: string[]): Promise<number> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return 0;

  const supabase = createSupabaseStorageAdminClient();
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(unique);
  if (error) {
    console.error("[website-image-storage] remove failed:", unique, error.message);
    return 0;
  }
  return unique.length;
}

/** Best-effort delete of a previous upload from Supabase Storage. Never throws. */
export async function deleteWebsiteImageByUrl(
  url: string | null | undefined,
): Promise<boolean> {
  const path = parseWebsiteImageStoragePath(url);
  if (!path) return false;

  try {
    const removed = await removeStoragePaths([path]);
    return removed > 0;
  } catch (error) {
    console.error("[website-image-storage] remove error:", error);
    return false;
  }
}

/**
 * Delete every object in a storage folder except `keepPath`.
 * Used so replacing a dashboard image cannot leave older files behind.
 */
export async function purgeWebsiteImageFolder(
  folder: string,
  keepPath?: string | null,
): Promise<number> {
  const safeFolder = sanitizeStorageFolder(folder);
  /* Never wipe the shared catch-all folder — only named slot/cruise folders. */
  if (!safeFolder || safeFolder === "general") {
    return 0;
  }

  try {
    const supabase = createSupabaseStorageAdminClient();
    const keep = keepPath?.replace(/^\/+/, "") ?? null;
    const stale: string[] = [];
    let offset = 0;

    for (let page = 0; page < 20; page += 1) {
      const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list(
        safeFolder,
        { limit: 100, offset },
      );
      if (error) {
        console.error(
          "[website-image-storage] list failed:",
          safeFolder,
          error.message,
        );
        break;
      }
      if (!data?.length) break;

      for (const object of data) {
        if (!object.name || object.name.endsWith("/")) continue;
        const fullPath = `${safeFolder}/${object.name}`;
        if (keep && fullPath === keep) continue;
        stale.push(fullPath);
      }

      if (data.length < 100) break;
      offset += data.length;
    }

    return await removeStoragePaths(stale);
  } catch (error) {
    console.error("[website-image-storage] folder purge error:", error);
    return 0;
  }
}

/**
 * Permanently remove the previous Storage object (and any other files in the
 * same slot folder) when a dashboard image is replaced or cleared.
 * Bundled `/media/...` defaults are never deleted.
 */
export async function purgeReplacedWebsiteImage(options: {
  previousUrl?: string | null;
  nextUrl?: string | null;
  slotName?: string | null;
}): Promise<void> {
  try {
    const previousPath = parseWebsiteImageStoragePath(options.previousUrl);
    const nextPath = parseWebsiteImageStoragePath(options.nextUrl);
    if (previousPath && previousPath === nextPath) return;

    const folders = new Set<string>();
    if (options.slotName?.trim()) {
      folders.add(siteImageSlotFolder(options.slotName));
    }
    if (previousPath) {
      const folder = websiteImageFolderFromPath(previousPath);
      if (folder) folders.add(folder);
    }

    if (previousPath) {
      await removeStoragePaths([previousPath]);
    }

    for (const folder of folders) {
      await purgeWebsiteImageFolder(folder, nextPath);
    }
  } catch (error) {
    console.error("[website-image-storage] replace purge error:", error);
  }
}
