import sharp from "sharp";

export type OptimizedEmailImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

const MIN_OUTPUT_BYTES = 256;

function assertValidImageBuffer(buffer: Buffer, label: string): void {
  if (!buffer?.length) {
    throw new Error(`${label} is empty.`);
  }

  if (buffer.length < MIN_OUTPUT_BYTES) {
    throw new Error(`${label} is too small to be a valid image.`);
  }

  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    throw new Error(`${label} is not a valid image file.`);
  }
}

/** Compress images for reliable display in email clients (hosted HTTPS URLs). */
export async function optimizeEmailTemplateImage(
  field: "logoUrl" | "heroImageUrl",
  buffer: Buffer,
): Promise<OptimizedEmailImage> {
  assertValidImageBuffer(buffer, "Uploaded image");

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Uploaded image could not be decoded.");
  }

  if (field === "logoUrl") {
    const optimized = await sharp(buffer)
      .rotate()
      .resize(400, 120, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    assertValidImageBuffer(optimized, "Optimized logo");

    return {
      buffer: optimized,
      contentType: "image/png",
      extension: "png",
    };
  }

  const optimized = await sharp(buffer)
    .rotate()
    .resize(1200, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  assertValidImageBuffer(optimized, "Optimized hero image");

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

/** Binary-safe body for Supabase Storage (avoids UTF-8 corruption on serverless). */
export function toStorageUploadBody(buffer: Buffer): Uint8Array {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
