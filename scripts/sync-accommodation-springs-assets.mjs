/**
 * Sync Springs clone runtime assets into public/accommodation-springs/assets.
 * Source: assets/CLONE. httpssprings.estate/assets
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "assets", "CLONE. httpssprings.estate", "assets");
const dest = path.join(root, "public", "accommodation-springs", "assets");

if (!fs.existsSync(src)) {
  throw new Error(`Missing Springs clone assets at ${src}`);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true, force: true });

console.log(`Synced Springs assets → ${dest}`);
