import { randomUUID } from "crypto";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import { getPublicImageUrl, IMAGE_BUCKET } from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";

/** Generic admin image upload (cruises, content) — not used for email templates. */
export async function uploadWebsiteImage(options: {
  folder: string;
  buffer: Buffer;
  contentType: string;
  extension: string;
}): Promise<{ url: string; path: string }> {
  const safeFolder =
    options.folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const safeExtension =
    options.extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const objectPath = `${safeFolder}/${Date.now()}-${randomUUID()}.${safeExtension}`;

  const supabase = createSupabaseStorageAdminClient();
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(objectPath, options.buffer, {
      contentType: options.contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const publicUrl = getPublicImageUrl(objectPath, IMAGE_BUCKET);
  if (!publicUrl) {
    throw new Error("Failed to build public URL");
  }

  return {
    url: toAbsolutePublicUrl(publicUrl) ?? publicUrl,
    path: objectPath,
  };
}
