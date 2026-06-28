import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const IMAGE_MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
};

export type ProcessedVideo = {
  buffer: Buffer;
  contentType: "video/mp4";
  extension: "mp4";
};

export async function processImageToWebp(input: Buffer): Promise<ProcessedImage> {
  const buffer = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", extension: "webp" };
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
