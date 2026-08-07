/**
 * Sync Springs clone runtime assets into public/suites-springs/assets.
 * Source: assets/CLONE. httpssprings.estate/assets
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "assets", "CLONE. httpssprings.estate", "assets");
const dest = path.join(root, "public", "suites-springs", "assets");

if (!fs.existsSync(src)) {
  throw new Error(`Missing Springs clone assets at ${src}`);
}

// Always start from the immutable capture. This prevents stale patched or
// previously-pruned files from surviving between rebuilds on Windows.
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true, force: true });

console.log(`Synced Springs assets → ${dest}`);
