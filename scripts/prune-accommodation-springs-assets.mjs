/**
 * Keep only the Design-page runtime assets needed by accommodation Springs
 * iframes. Photo media is Hathor-hosted; Springs photos are not required.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public", "accommodation-springs", "assets");

const keepExact = new Set([
  "fonts/TTCommonsPro-Md.woff",
  "fonts/TTCommonsPro-Md.woff2",
  "fonts/TT_Commons_Pro_Bold.otf",
  "fonts/TT_Commons_Pro_Regular.woff",
  "fonts/TT_Commons_Pro_Regular.woff2",
  "fonts/VictorSerif-40Regular.woff",
  "fonts/VictorSerif-40Regular.woff2",
  "fonts/VictorSerif-45RegularItalic.woff",
  "fonts/VictorSerif-45RegularItalic.woff2",
  "images/icons.svg",
  "images/px.gif",
  "images/px-2x1.gif",
  "images/media/design/1.intro/mask-xs.webp",
  "images/media/design/1.intro/title-en.svg",
  "images/media/design/10.more/title-en.svg",
  "images/media/design/3.projects/logo.webp",
  "images/media/design/4.captions/4.png",
  "javascripts/1.js",
  "javascripts/31.js",
  "javascripts/design.js",
  "javascripts/plan-lazy.js",
  "javascripts/popover-lazy.js",
  "javascripts/shared.js",
  "stylesheets/design.css",
  "stylesheets/global.css",
]);

function walk(dir, base = "") {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.join(base, name).replaceAll("\\", "/");
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walk(full, rel);
      // remove empty dirs after pruning children
      if (fs.existsSync(full) && fs.readdirSync(full).length === 0) {
        fs.rmSync(full, { recursive: true, force: true });
      }
      continue;
    }
    if (!keepExact.has(rel)) {
      fs.rmSync(full, { force: true });
    }
  }
}

walk(root);
console.log("prune complete — Design runtime assets kept");
