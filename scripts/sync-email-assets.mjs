import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function copyAsset(fileName, publicSubdir) {
  const source = join(root, "assets", fileName);
  const targetDir = join(root, "public", publicSubdir);
  const target = join(targetDir, fileName);

  if (!existsSync(source)) {
    console.warn(`[sync-public-assets] Skipping missing file: ${source}`);
    return;
  }

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(source, target);
  console.log(`[sync-public-assets] Copied ${fileName} to public/${publicSubdir}/`);
}

const logoName = "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";
const logoSource = join(root, "assets", "LOGOS", logoName);

if (!existsSync(logoSource)) {
  const legacySource = join(root, "assets", logoName);
  if (!existsSync(legacySource)) {
    console.error(`[sync-public-assets] Missing logo: ${logoSource}`);
    process.exit(1);
  }
  copyAsset(logoName, "assets");
} else {
  const targetDir = join(root, "public", "assets");
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(logoSource, join(targetDir, logoName));
  console.log(`[sync-public-assets] Copied ${logoName} to public/assets/`);
}
copyAsset("Hathor-Luxor-Promo-nile-cruise.mp4", "videos");
