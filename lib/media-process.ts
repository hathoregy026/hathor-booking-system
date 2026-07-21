import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import {
  IMAGE_SIZE_POLICY,
  compressTargetBytes,
  parseImageProcessKind,
  shouldCompressImage,
  type ImageProcessKind,
} from "@/lib/image-size-policy";

const execFileAsync = promisify(execFile);

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  /** True when lossy compression ran (source was over 3 MB). */
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

function detectOutputFormat(
  input: Buffer,
): { contentType: ProcessedImage["contentType"]; extension: ProcessedImage["extension"] } {
  if (input[0] === 0xff && input[1] === 0xd8) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (
    input[0] === 0x89 &&
    input[1] === 0x50 &&
    input[2] === 0x4e &&
    input[3] === 0x47
  ) {
    return { contentType: "image/png", extension: "png" };
  }
  return { contentType: "image/webp", extension: "webp" };
}

async function toFullQualityPassThrough(
  input: Buffer,
  kind: ImageProcessKind,
): Promise<ProcessedImage> {
  /* ≤ 3 MB: keep original bytes — no lossy re-encode. */
  const detected = detectOutputFormat(input);
  return {
    buffer: input,
    contentType: detected.contentType,
    extension: detected.extension,
    compressed: false,
    kind,
  };
}

/**
 * Compress oversized sources down to ≤ 3 MB while preserving as much quality
 * as possible: high WebP quality first, then gently reduce edge length only
 * if still over the cap.
 */
async function compressOversizeToWebp(
  input: Buffer,
  kind: ImageProcessKind,
): Promise<ProcessedImage> {
  const target = compressTargetBytes(kind);
  const { start, min, step } = IMAGE_SIZE_POLICY.compressQuality;
  const edgeSteps = IMAGE_SIZE_POLICY.compressMaxEdgeSteps;

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
 * Apply the site image size policy:
 * - ≤ 3 MB → original bytes (full quality)
 * - > 3 MB → compress to ≤ 3 MB at the highest quality that fits
 */
export async function processImageToWebp(
  input: Buffer,
  options: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  const kind = parseImageProcessKind(
    typeof options.kind === "string" ? options.kind : options.kind ?? "content",
  );

  if (!shouldCompressImage(input.byteLength)) {
    return toFullQualityPassThrough(input, kind);
  }

  return compressOversizeToWebp(input, kind);
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
