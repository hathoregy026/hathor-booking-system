/**
 * Sync Springs clone runtime assets into public/suites-springs/assets.
 * Source: assets/CLONE. httpssprings.estate/assets
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const src = path.join(root, "assets", "CLONE. httpssprings.estate", "assets");
const dest = path.join(root, "public", "suites-springs", "assets");

if (!fs.existsSync(src)) {
  throw new Error(`Missing Springs clone assets at ${src}`);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });

if (process.platform === "win32") {
  try {
    execFileSync(
      "robocopy",
      [src, dest, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np"],
      { stdio: "inherit" },
    );
  } catch (error) {
    // Robocopy uses bit flags: 0–7 mean success with optional copies/extras.
    const status = error && typeof error === "object" && "status" in error
      ? Number(error.status)
      : 1;
    if (status >= 8) throw error;
  }
} else {
  execFileSync("rsync", ["-a", "--delete", `${src}/`, `${dest}/`], {
    stdio: "inherit",
  });
}

console.log(`Synced Springs assets → ${dest}`);
