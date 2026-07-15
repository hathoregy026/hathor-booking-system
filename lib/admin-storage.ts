import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import { getPublicImageUrl, IMAGE_BUCKET } from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import {
  buildSeoImageStorageName,
  resolveImageTitle,
  sanitizeFileExtension,
  sanitizeStorageFolder,
} from "@/lib/seo-image-filename";

/** Generic admin image upload (cruises, content) — not used for email templates. */
export async function uploadWebsiteImage(options: {
  folder: string;
  buffer: Buffer;
  contentType: string;
  extension: string;
  pageName?: string;
  imageTitle?: string;
  imageName?: string;
  imageLabel?: string;
}): Promise<{ url: string; path: string; suggestedAltText?: string }> {
  const safeFolder = sanitizeStorageFolder(options.folder);
  const safeExtension =
    options.extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";

  const pageName = options.pageName?.trim() || safeFolder;
  const imageTitle = resolveImageTitle({
    title: options.imageTitle,
    name: options.imageName,
    label: options.imageLabel,
  });

  const { objectPath, suggestedAltText } = buildSeoImageStorageName({
    folder: safeFolder,
    pageName,
    imageTitle,
    extension: safeExtension,
  });

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
    suggestedAltText,
  };
}
