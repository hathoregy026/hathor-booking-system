/**
 * Drop Springs media we no longer reference (Hathor images replace them).
 * Keeps JS/CSS/fonts/webgl/menu chrome required by the homepage runtime.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public", "suites-springs", "assets");

const removeDirs = [
  path.join(root, "images", "media", "landing"),
  path.join(root, "images", "media", "design"),
  path.join(root, "images", "media", "gallery"),
  path.join(root, "images", "media", "infrastructure"),
  path.join(root, "images", "media", "location"),
  path.join(root, "images", "media", "plans"),
  path.join(root, "pano"),
];

const keepJs = new Set([
  "shared.js",
  "landing.js",
  "webgl-wellness.js",
  "webgl-nature.js",
  "1.js",
  "31.js",
  "plan-lazy.js",
  "popover-lazy.js",
  "recaptcha-yandex.js",
]);

for (const dir of removeDirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("removed", path.relative(process.cwd(), dir));
  }
}

const jsDir = path.join(root, "javascripts");
if (fs.existsSync(jsDir)) {
  for (const name of fs.readdirSync(jsDir)) {
    const full = path.join(jsDir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === "browser-message") {
        fs.rmSync(full, { recursive: true, force: true });
        console.log("removed", path.relative(process.cwd(), full));
      }
      continue;
    }
    if (!keepJs.has(name)) {
      fs.unlinkSync(full);
      console.log("removed", path.relative(process.cwd(), full));
    }
  }
}

const cssDir = path.join(root, "stylesheets");
const keepCss = new Set(["global.css", "landing.css"]);
if (fs.existsSync(cssDir)) {
  for (const name of fs.readdirSync(cssDir)) {
    if (!keepCss.has(name) && name.endsWith(".css")) {
      fs.unlinkSync(path.join(cssDir, name));
      console.log("removed css", name);
    }
  }
}

console.log("prune complete");
