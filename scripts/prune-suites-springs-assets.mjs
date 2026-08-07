/**
 * Drop only non-homepage Springs page media (design / flats / tour, etc.).
 * Keep the full homepage landing media tree + WebGL textures so the original
 * scroll engine, masks, sticky stages and plugins remain byte-faithful even
 * when a rare URL is not remapped to Hathor imagery.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public", "suites-springs", "assets");

const removeDirs = [
  path.join(root, "images", "media", "design"),
  path.join(root, "images", "media", "gallery"),
  path.join(root, "images", "media", "infrastructure"),
  path.join(root, "images", "media", "location"),
  path.join(root, "images", "media", "plans"),
  path.join(root, "pano"),
];

for (const dir of removeDirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("removed", path.relative(process.cwd(), dir));
  }
}

console.log("prune complete — homepage landing media + WebGL kept");
