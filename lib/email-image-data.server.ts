import "server-only";

import { readFileSync } from "fs";
import path from "path";
import {
  FALLBACK_LOGO_SVG_DATA_URL,
  isEmailImageDataUrl,
} from "@/lib/email-image-shared";

const MAX_EMAIL_IMAGE_BYTES = 2 * 1024 * 1024;

let cachedDefaultLogoDataUrl: string | null = null;

export function bufferToDataUrl(buffer: Buffer, contentType: string): string {
  const mime = contentType.split(";")[0]?.trim() || "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

/**
 * Built-in Hathor logo embedded for email — no external URL required.
 */
export function getBuiltinDefaultLogoDataUrl(): string {
  if (cachedDefaultLogoDataUrl) return cachedDefaultLogoDataUrl;

  const logoName = "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";
  const candidates = [
    path.join(process.cwd(), "public", "assets", logoName),
    path.join(process.cwd(), "assets", logoName),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = readFileSync(filePath);
      if (buffer.length > MAX_EMAIL_IMAGE_BYTES) break;
      cachedDefaultLogoDataUrl = bufferToDataUrl(buffer, "image/png");
      return cachedDefaultLogoDataUrl;
    } catch {
      // try next path
    }
  }

  cachedDefaultLogoDataUrl = FALLBACK_LOGO_SVG_DATA_URL;
  return cachedDefaultLogoDataUrl;
}

/** Resolve logo for outbound email — always embeds when no DB image exists. */
export function resolveEmailLogoSrcForSend(
  dataUrl: string | null | undefined,
  url: string | null | undefined,
): string {
  if (isEmailImageDataUrl(dataUrl)) {
    return dataUrl!.trim();
  }

  if (isEmailImageDataUrl(url)) {
    return url!.trim();
  }

  return getBuiltinDefaultLogoDataUrl();
}

export function resolveEmailImageSrcForSend(
  dataUrl: string | null | undefined,
  url: string | null | undefined,
  options?: { useDefaultLogo?: boolean },
): string | null {
  if (isEmailImageDataUrl(dataUrl)) {
    return dataUrl!.trim();
  }

  if (url?.trim()) {
    return url.trim();
  }

  if (options?.useDefaultLogo) {
    return getBuiltinDefaultLogoDataUrl();
  }

  return null;
}

export async function urlToEmailImageDataUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  if (isEmailImageDataUrl(trimmed)) {
    return trimmed;
  }

  try {
    if (trimmed.startsWith("/")) {
      const localPath = path.join(
        process.cwd(),
        "public",
        trimmed.replace(/^\//, ""),
      );
      const buffer = readFileSync(localPath);
      if (buffer.length > MAX_EMAIL_IMAGE_BYTES) return null;
      const ext = path.extname(localPath).toLowerCase();
      const mime =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : "image/png";
      return bufferToDataUrl(buffer, mime);
    }

    if (/^https?:\/\//i.test(trimmed)) {
      const response = await fetch(trimmed, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type") ?? "image/png";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > MAX_EMAIL_IMAGE_BYTES) return null;

      return bufferToDataUrl(buffer, contentType);
    }
  } catch (error) {
    console.warn(
      "[email-image-data.server] failed to convert URL to data URL:",
      error,
    );
  }

  return null;
}

export function dataUrlForEmailSend(
  dataUrl: string | null | undefined,
  url: string | null | undefined,
  options?: { useDefaultLogo?: boolean },
): string | null {
  if (isEmailImageDataUrl(dataUrl)) {
    return dataUrl!.trim();
  }

  if (options?.useDefaultLogo && !url?.trim()) {
    return getBuiltinDefaultLogoDataUrl();
  }

  return null;
}
