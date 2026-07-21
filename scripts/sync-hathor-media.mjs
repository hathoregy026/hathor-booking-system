import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "lib", "hathor-media-manifest.json"), "utf8"),
);

const assetsDir = join(root, "assets");
const tempRoot = join(assetsDir, manifest.sourceRoot);
const outDir = join(root, "public", "media", "hathor");
const videoOutDir = join(outDir, "videos");

async function findFfmpeg() {
  const candidates =
    process.platform === "win32"
      ? ["ffmpeg", "ffmpeg.exe"]
      : ["ffmpeg", "/usr/bin/ffmpeg"];
  for (const cmd of candidates) {
    try {
      await execFileAsync(cmd, ["-version"], { timeout: 5000 });
      return cmd;
    } catch {
      // continue
    }
  }
  return null;
}

async function toWebp(sourcePath, targetPath, maxWidth = 4096) {
  const input = readFileSync(sourcePath);
  const COMPRESS_ABOVE = 3 * 1024 * 1024;
  const TARGET = 3 * 1024 * 1024;

  /* Under 3 MB: full-quality WebP (no downscale). */
  if (input.byteLength <= COMPRESS_ABOVE) {
    const output = await sharp(input, { failOn: "none" })
      .rotate()
      .webp({ quality: 100, effort: 4 })
      .toBuffer();
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, output);
    console.log(
      `[sync-hathor-media] ${targetPath.replace(root + "\\", "").replace(root + "/", "")} (full-q ${(output.length / 1024).toFixed(0)} KB)`,
    );
    return;
  }

  let best = null;
  const edgeSteps = [maxWidth, 2560, 1920, 1600];
  for (const maxEdge of edgeSteps) {
    const base = sharp(input, { failOn: "none" })
      .rotate()
      .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true });
    for (let quality = 95; quality >= 72; quality -= 3) {
      const output = await base.clone().webp({ quality, effort: 4 }).toBuffer();
      best = output;
      if (output.byteLength <= TARGET) {
        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, best);
        console.log(
          `[sync-hathor-media] ${targetPath.replace(root + "\\", "").replace(root + "/", "")} (${(best.length / 1024).toFixed(0)} KB)`,
        );
        return;
      }
    }
  }
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, best);
  console.log(
    `[sync-hathor-media] ${targetPath.replace(root + "\\", "").replace(root + "/", "")} (${(best.length / 1024).toFixed(0)} KB)`,
  );
}

async function compressVideo(sourcePath, targetPath) {
  mkdirSync(dirname(targetPath), { recursive: true });
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    copyFileSync(sourcePath, targetPath);
    console.warn(`[sync-hathor-media] ffmpeg not found — copied ${targetPath}`);
    return;
  }
  await execFileAsync(
    ffmpeg,
    [
      "-y",
      "-i",
      sourcePath,
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
      targetPath,
    ],
    { timeout: 300_000 },
  );
  console.log(`[sync-hathor-media] ${targetPath.replace(root, "")}`);
}

async function main() {
  if (!existsSync(tempRoot)) {
    console.warn(`[sync-hathor-media] Skipping — folder not found: ${tempRoot}`);
    return;
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(videoOutDir, { recursive: true });

  let imageCount = 0;
  for (const [key, relativePath] of Object.entries(manifest.images)) {
    const source = join(tempRoot, relativePath);
    if (!existsSync(source)) {
      console.warn(`[sync-hathor-media] Missing: ${relativePath}`);
      continue;
    }
    await toWebp(source, join(outDir, `${key}.webp`));
    imageCount += 1;
  }

  for (const [key, relativePath] of Object.entries(manifest.videos ?? {})) {
    const source = join(tempRoot, relativePath);
    if (!existsSync(source)) {
      console.warn(`[sync-hathor-media] Missing video: ${relativePath}`);
      continue;
    }
    await compressVideo(source, join(videoOutDir, `${key}.mp4`));
  }

  // Hero promo symlink path for existing branding constant
  const heroReel = join(videoOutDir, "hero-reel.mp4");
  const heroPublic = join(root, "public", "videos", "Hathor-Luxor-Promo-nile-cruise.mp4");
  if (existsSync(heroReel)) {
    mkdirSync(join(root, "public", "videos"), { recursive: true });
    copyFileSync(heroReel, heroPublic);
    console.log("[sync-hathor-media] hero video → public/videos/");
  }

  console.log(`[sync-hathor-media] Done — ${imageCount} images synced.`);
}

main().catch((error) => {
  console.error("[sync-hathor-media] Failed:", error);
  process.exit(1);
});
