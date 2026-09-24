/** Pre-size large, checked-in public photos without changing their originals. */
import { readdir, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaRoot = path.join(root, "public", "media", "hathor");
const outputRoot = path.join(mediaRoot, "responsive");
const manifestPath = path.join(root, "lib", "responsive-media-manifest.json");
const sourceFolders = ["optimized", "r2", "scraped"];
const widths = [384, 768, 1280];
const manifest = {};
let originalBytes = 0;
let variantBytes = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    if (!/\.(?:webp|jpe?g|png)$/i.test(entry.name)) continue;
    const sourceSize = (await stat(absolute)).size;
    if (sourceSize < 180_000) continue;
    const { width: sourceWidth } = await sharp(absolute).metadata();
    if (!sourceWidth) continue;
    const relative = path.relative(mediaRoot, absolute).replaceAll("\\", "/");
    const selected = widths.filter((width) => width < sourceWidth);
    if (!selected.length) continue;

    const sourceBuffer = await readFile(absolute);
    const available = [];
    for (const width of selected) {
      const target = path.join(outputRoot, `${relative.replace(/\.[^.]+$/, "")}-${width}.webp`);
      const output = await sharp(sourceBuffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 90, effort: 5 })
        .toBuffer();
      // Only add a derivative if it actually saves bytes. The original stays
      // available for full-size viewing and for every dashboard override.
      if (output.length >= sourceSize) continue;
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, output);
      variantBytes += output.length;
      available.push(width);
    }
    if (available.length) {
      manifest[`/media/hathor/${relative}`] = available;
      originalBytes += sourceSize;
    }
  }
}

for (const folder of sourceFolders) await walk(path.join(mediaRoot, folder));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Responsive media: ${Object.keys(manifest).length} originals, ${Math.round(originalBytes / 1024)} KB originals, ${Math.round(variantBytes / 1024)} KB of all derivatives.`,
);
