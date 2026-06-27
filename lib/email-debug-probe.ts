import { isReliableHostedEmailImageUrl } from "@/lib/email-branding-shared";
import { isValidImageMagicBytes } from "@/lib/email-image-verify";

const PROBE_TIMEOUT_MS = 15_000;

export type ImageUrlProbe = {
  label: string;
  url: string | null;
  isReliableHostedUrl: boolean;
  head: {
    ok: boolean;
    status: number | null;
    contentType: string | null;
    contentLength: number | null;
    error: string | null;
  };
  bytes: {
    ok: boolean;
    sampleSize: number;
    magicHex: string | null;
    validMagic: boolean;
    error: string | null;
  };
};

function parseContentLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function probeImageUrl(
  label: string,
  url: string | null | undefined,
): Promise<ImageUrlProbe> {
  const trimmed = url?.trim() || null;

  if (!trimmed) {
    return {
      label,
      url: null,
      isReliableHostedUrl: false,
      head: {
        ok: false,
        status: null,
        contentType: null,
        contentLength: null,
        error: "URL is empty or missing",
      },
      bytes: {
        ok: false,
        sampleSize: 0,
        magicHex: null,
        validMagic: false,
        error: "URL is empty or missing",
      },
    };
  }

  let headOk = false;
  let headStatus: number | null = null;
  let contentType: string | null = null;
  let contentLength: number | null = null;
  let headError: string | null = null;

  try {
    const head = await fetch(trimmed, {
      method: "HEAD",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { Accept: "image/*" },
    });

    headStatus = head.status;
    headOk = head.ok;
    contentType = head.headers.get("content-type");
    contentLength = parseContentLength(head.headers.get("content-length"));

    if (!head.ok) {
      headError = `HEAD returned ${head.status}`;
    }
  } catch (error) {
    headError =
      error instanceof Error ? error.message : "HEAD request failed";
  }

  let sampleSize = 0;
  let magicHex: string | null = null;
  let validMagic = false;
  let bytesError: string | null = null;
  let bytesOk = false;

  try {
    const sample = await fetch(trimmed, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: {
        Accept: "image/*",
        Range: "bytes=0-511",
      },
    });

    if (!sample.ok && sample.status !== 206) {
      bytesError = `Byte sample fetch returned ${sample.status}`;
    } else {
      const buffer = Buffer.from(await sample.arrayBuffer());
      sampleSize = buffer.length;
      magicHex = buffer.subarray(0, Math.min(8, buffer.length)).toString("hex");
      validMagic = isValidImageMagicBytes(buffer);
      bytesOk = sampleSize > 0 && validMagic;

      if (!validMagic && sampleSize > 0) {
        bytesError = "Invalid image magic bytes (file may be corrupt)";
      } else if (sampleSize === 0) {
        bytesError = "Byte sample is empty";
      }
    }
  } catch (error) {
    bytesError =
      error instanceof Error ? error.message : "Byte sample fetch failed";
  }

  return {
    label,
    url: trimmed,
    isReliableHostedUrl: isReliableHostedEmailImageUrl(trimmed),
    head: {
      ok: headOk,
      status: headStatus,
      contentType,
      contentLength,
      error: headError,
    },
    bytes: {
      ok: bytesOk,
      sampleSize,
      magicHex,
      validMagic,
      error: bytesError,
    },
  };
}

export function extractImageSrcUrls(html: string): string[] {
  const urls = new Set<string>();
  const pattern = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    urls.add(match[1].trim());
  }

  return [...urls];
}

export function urlsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  return (a?.trim() || "") === (b?.trim() || "");
}
