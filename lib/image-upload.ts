export const IMAGE_BUCKET = "website-images";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function validateImageFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || mimeFromExtension(extension);

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Invalid file extension. Use .jpg, .png, or .webp.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
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

export function getPublicImageUrl(path: string): string | null {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
