const VERIFY_TIMEOUT_MS = 15_000;

export function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isPng || isJpeg || isWebp;
}

/** Ensure a public storage URL returns real image bytes (not empty/corrupted). */
export async function verifyPublicImageUrl(
  url: string,
  expectedMinBytes = 256,
): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    headers: {
      Accept: "image/*",
      Range: "bytes=0-511",
    },
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(
      `Uploaded image is not publicly accessible (${response.status}).`,
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length < Math.min(expectedMinBytes, 12)) {
    throw new Error(
      `Uploaded image is empty or too small (${bytes.length} bytes).`,
    );
  }

  if (!isValidImageMagicBytes(bytes)) {
    throw new Error(
      "Uploaded image is corrupted (invalid file header). Re-upload the file.",
    );
  }
}
