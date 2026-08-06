import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import {
  IMAGE_SIZE_POLICY,
  compressTargetBytes,
  parseImageProcessKind,
  type ImageProcessKind,
} from "@/lib/image-size-policy";

const execFileAsync = promisify(execFile);

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  /** True when the WebP pipeline ran (always for site uploads). */
  compressed: boolean;
  kind: ImageProcessKind;
};

export type ProcessedVideo = {
  buffer: Buffer;
  contentType: "video/mp4";
  extension: "mp4";
};

export type ProcessImageOptions = {
  kind?: ImageProcessKind | string | null;
};

function isWebpBuffer(input: Buffer): boolean {
  return (
    input.toString("ascii", 0, 4) === "RIFF" &&
    input.toString("ascii", 8, 12) === "WEBP"
  );
}

/**
 * Compress to WebP at the kind target. Prefer high quality first, then reduce
 * edge length only if still over the cap.
 */
async function compressToWebp(
  input: Buffer,
  kind: ImageProcessKind,
): Promise<ProcessedImage> {
  const target = compressTargetBytes(kind);
  const { start, min, step } = IMAGE_SIZE_POLICY.compressQuality;
  const edgeSteps = IMAGE_SIZE_POLICY.compressMaxEdgeSteps;

  /* Already a lean WebP under the kind target — keep bytes (no double encode). */
  if (isWebpBuffer(input) && input.byteLength <= target) {
    return {
      buffer: input,
      contentType: "image/webp",
      extension: "webp",
      compressed: false,
      kind,
    };
  }

  let best: Buffer | null = null;

  for (const maxEdge of edgeSteps) {
    const base = sharp(input, { failOn: "none" })
      .rotate()
      .resize(maxEdge, maxEdge, {
        fit: "inside",
        withoutEnlargement: true,
      });

    for (let quality = start; quality >= min; quality -= step) {
      const buffer = await base
        .clone()
        .webp({ quality, effort: 4 })
        .toBuffer();
      best = buffer;
      if (buffer.byteLength <= target) {
        return {
          buffer,
          contentType: "image/webp",
          extension: "webp",
          compressed: true,
          kind,
        };
      }
    }
  }

  return {
    buffer: best!,
    contentType: "image/webp",
    extension: "webp",
    compressed: true,
    kind,
  };
}

/**
 * Apply the site image size policy for future uploads:
 * - Always store WebP
 * - Cap by kind (hero ≤800KB, gallery/content ≤400KB)
 * - Skip re-encode only when input is already WebP under the kind target
 */
export async function processImageToWebp(
  input: Buffer,
  options: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  const kind = parseImageProcessKind(
    typeof options.kind === "string" ? options.kind : options.kind ?? "content",
  );

  return compressToWebp(input, kind);
}

/** @deprecated Prefer processImageToWebp — kept name for call sites. */
export async function processSiteImage(
  input: Buffer,
  options: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  return processImageToWebp(input, options);
}

async function findFfmpeg(): Promise<string | null> {
  const candidates =
    process.platform === "win32"
      ? ["ffmpeg", "ffmpeg.exe"]
      : ["ffmpeg", "/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg"];

  for (const cmd of candidates) {
    try {
      await execFileAsync(cmd, ["-version"], { timeout: 5000 });
      return cmd;
    } catch {
      // try next
    }
  }
  return null;
}

/** Compress video to H.264 MP4 when ffmpeg is available; otherwise returns input unchanged. */
export async function processVideoToMp4(
  input: Buffer,
  originalName: string,
): Promise<ProcessedVideo> {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    return {
      buffer: input,
      contentType: "video/mp4",
      extension: "mp4",
    };
  }

  const fs = await import("node:fs/promises");
  const os = await import("node:os");
  const path = await import("node:path");
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "hathor-video-"));
  const inputPath = path.join(tmpDir, originalName.replace(/[^\w.-]/g, "_"));
  const outputPath = path.join(tmpDir, "output.mp4");

  try {
    await fs.writeFile(inputPath, input);
    await execFileAsync(
      ffmpeg,
      [
        "-y",
        "-i",
        inputPath,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "28",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outputPath,
      ],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );
    const buffer = await fs.readFile(outputPath);
    return { buffer, contentType: "video/mp4", extension: "mp4" };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
