/** Slugify a human label for SEO-friendly storage paths. */
export function slugifyForFilename(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sanitizeStorageFolder(folder: string | null | undefined): string {
  const cleaned =
    folder
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9/_-]+/gi, "")
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "") ?? "";
  return cleaned || "general";
}

export function sanitizeFileExtension(
  fileName: string | undefined,
  contentType: string,
): string {
  return (
    fileName?.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
    contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
    "jpg"
  );
}

/**
 * Pick the user-facing image title from dashboard fields (priority: title → name → label).
 */
export function resolveImageTitle(fields: {
  title?: string | null;
  name?: string | null;
  label?: string | null;
}): string {
  const candidate =
    fields.title?.trim() ||
    fields.name?.trim() ||
    fields.label?.trim() ||
    "";

  return candidate || "image";
}

export type SeoImageStorageName = {
  /** Full filename including extension and timestamp, e.g. cruises-sunset-deck-k9p2x7m1.jpg */
  filename: string;
  /** Slug without timestamp — used for alt text, e.g. cruises-sunset-deck */
  slugBase: string;
  /** Suggested alt text (same as slugBase) */
  suggestedAltText: string;
  /** Full object path inside the bucket */
  objectPath: string;
};

/**
 * Build a unique, descriptive storage filename:
 * `{page-slug}-{image-title-slug}-{short-timestamp}.{ext}`
 */
export function buildSeoImageStorageName(options: {
  pageName: string;
  imageTitle: string;
  extension: string;
  folder?: string;
  now?: number;
}): SeoImageStorageName {
  const pageSlug = slugifyForFilename(options.pageName);
  const titleSlug = slugifyForFilename(options.imageTitle);
  const slugParts = [pageSlug, titleSlug].filter(Boolean);
  const slugBase = slugParts.join("-") || "image";

  const extension =
    options.extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";

  const shortTimestamp = (options.now ?? Date.now()).toString(36);
  const filename = `${slugBase}-${shortTimestamp}.${extension}`;

  const safeFolder = sanitizeStorageFolder(options.folder);
  const objectPath = `${safeFolder}/${filename}`;

  return {
    filename,
    slugBase,
    suggestedAltText: slugBase,
    objectPath,
  };
}
