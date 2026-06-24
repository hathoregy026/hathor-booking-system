import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoName = "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";
const source = join(root, "assets", logoName);
const targetDir = join(root, "public", "assets");
const target = join(targetDir, logoName);

if (!existsSync(source)) {
  console.error(`[sync-email-assets] Missing logo: ${source}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log(`[sync-email-assets] Copied ${logoName} to public/assets/`);
