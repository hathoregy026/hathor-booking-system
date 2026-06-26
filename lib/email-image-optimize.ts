import sharp from "sharp";

export type OptimizedEmailImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

/** Compress images for reliable display in email clients (hosted HTTPS URLs). */
export async function optimizeEmailTemplateImage(
  field: "logoUrl" | "heroImageUrl",
  buffer: Buffer,
): Promise<OptimizedEmailImage> {
  const image = sharp(buffer, { failOn: "none" }).rotate();

  if (field === "logoUrl") {
    const optimized = await image
      .resize(400, 120, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();

    return {
      buffer: optimized,
      contentType: "image/png",
      extension: "png",
    };
  }

  const optimized = await image
    .resize(1200, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return {
    buffer: optimized,
    contentType: "image/jpeg",
    extension: "jpg",
  };
}

export function buildStableEmailImagePath(
  field: "logoUrl" | "heroImageUrl",
): string {
  return field === "logoUrl" ? "hathor-email-logo.png" : "hathor-email-hero.jpg";
}
