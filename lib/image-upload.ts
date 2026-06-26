export const IMAGE_BUCKET = "website-images";

/** Dedicated public bucket for email template images (logos, hero banners). */
export const EMAIL_IMAGE_BUCKET = "email-images";

export const EMAIL_IMAGE_FOLDER = "email-templates";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_EMAIL_LOGO_BYTES = MAX_IMAGE_BYTES;

/** Hero banners in email templates may be larger than logos. */
export const MAX_EMAIL_HERO_BYTES = 15 * 1024 * 1024;

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

export function validateEmailTemplateImageFile(
  file: File,
  field: "logoUrl" | "heroImageUrl",
): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = file.type || mimeFromExtension(extension);

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "Invalid file extension. Use .jpg, .png, or .webp.";
  }

  const maxBytes =
    field === "heroImageUrl" ? MAX_EMAIL_HERO_BYTES : MAX_EMAIL_LOGO_BYTES;

  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return field === "heroImageUrl"
      ? `Hero image must be ${maxMb} MB or smaller.`
      : `Logo must be ${maxMb} MB or smaller.`;
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
