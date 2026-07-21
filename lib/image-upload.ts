import { IMAGE_SIZE_POLICY } from "@/lib/image-size-policy";

export const IMAGE_BUCKET = "website-images";

/** Dedicated public bucket for email template images (logos, hero banners). */
export const EMAIL_IMAGE_BUCKET = "email-images";

export const EMAIL_IMAGE_FOLDER = "email-templates";

/** Hard ceiling for raw uploads (oversized masters are compressed to ≤ maxBytes). */
export const MAX_IMAGE_BYTES = IMAGE_SIZE_POLICY.hardUploadMaxBytes;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_EMAIL_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
export const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);

export const MAX_EMAIL_LOGO_BYTES = MAX_EMAIL_IMAGE_BYTES;
export const MAX_EMAIL_HERO_BYTES = MAX_EMAIL_IMAGE_BYTES;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateImageFile(
  file: Pick<File, "name" | "type" | "size">,
): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || mimeFromExtension(extension);

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Invalid file extension. Use .jpg, .png, or .webp.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const maxMb = Math.round(IMAGE_SIZE_POLICY.maxBytes / (1024 * 1024));
    return `Image must be 25 MB or smaller (files over ${maxMb} MB are compressed automatically).`;
  }

  return null;
}

export function validateEmailImageFile(
  file: Pick<File, "name" | "type" | "size">,
): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || mimeFromExtension(extension);

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Invalid file extension. Use .jpg, .png, or .webp.";
  }

  if (file.size > MAX_EMAIL_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}

/** @deprecated Use validateEmailImageFile */
export function validateEmailTemplateImageFile(
  file: File,
  _field: "logoUrl" | "heroImageUrl",
): string | null {
  return validateEmailImageFile(file);
}

export function validateVideoFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || videoMimeFromExtension(extension);

  if (!mimeType || !ALLOWED_VIDEO_TYPES.has(mimeType)) {
    return "Only MP4 and WebM videos are allowed.";
  }

  if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
    return "Invalid file extension. Use .mp4 or .webm.";
  }

  if (file.size > MAX_VIDEO_BYTES) {
    return "Video must be 100 MB or smaller.";
  }

  return null;
}

function videoMimeFromExtension(extension: string): string | null {
  switch (extension) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return null;
  }
}

function mimeFromExtension(extension: string): string | null {
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}

export function getPublicImageUrl(
  path: string,
  bucket: string = IMAGE_BUCKET,
): string | null {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function isEmailImageFolder(folder: string): boolean {
  return folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() === EMAIL_IMAGE_FOLDER;
}
