import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import { getPublicImageUrl, IMAGE_BUCKET } from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import {
  buildSeoImageStorageName,
  resolveImageTitle,
  sanitizeStorageFolder,
} from "@/lib/seo-image-filename";

function assertValidImageBytes(buffer: Buffer, contentType: string): void {
  if (buffer.byteLength < 12) {
    throw new Error("Processed image is empty. Please try another file.");
  }

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebp =
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    if (!isJpeg) throw new Error("Processed JPEG is invalid. Please try again.");
    return;
  }
  if (contentType.includes("png")) {
    if (!isPng) throw new Error("Processed PNG is invalid. Please try again.");
    return;
  }
  if (contentType.includes("webp") || (!isJpeg && !isPng)) {
    if (!isWebp) {
      throw new Error(
        "Processed WebP is invalid (binary corrupted before upload). Please try again.",
      );
    }
  }
}

/**
 * Server uploads must use signed PUT (same as the browser path).
 * Passing Node Buffer into supabase.storage.upload() UTF-8-mangles binary
 * on Vercel (RIFF size bytes become U+FFFD → broken WebP thumbnails).
 */
async function putBinaryViaSignedUrl(options: {
  objectPath: string;
  buffer: Buffer;
  contentType: string;
}): Promise<void> {
  const supabase = createSupabaseStorageAdminClient();
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUploadUrl(options.objectPath);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create signed upload URL");
  }

  const bytes = new Uint8Array(
    options.buffer.buffer,
    options.buffer.byteOffset,
    options.buffer.byteLength,
  );

  const putRes = await fetch(data.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": options.contentType || "application/octet-stream",
    },
    body: bytes,
  });

  if (!putRes.ok) {
    const detail = await putRes.text().catch(() => "");
    throw new Error(
      `Storage PUT failed (${putRes.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  const { data: stored, error: downloadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .download(options.objectPath);
  if (downloadError || !stored) {
    await supabase.storage.from(IMAGE_BUCKET).remove([options.objectPath]);
    throw new Error("Upload verification failed. Please try again.");
  }

  const storedBuf = Buffer.from(await stored.arrayBuffer());
  try {
    assertValidImageBytes(storedBuf, options.contentType);
  } catch (verifyError) {
    await supabase.storage.from(IMAGE_BUCKET).remove([options.objectPath]);
    throw verifyError;
  }
}

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

  assertValidImageBytes(options.buffer, options.contentType);

  await putBinaryViaSignedUrl({
    objectPath,
    buffer: options.buffer,
    contentType: options.contentType,
  });

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
