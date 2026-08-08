/**
 * Optional static fallback for the PURE Springs amenities embed.
 *
 * Canonical homepage mount uses the Next route:
 *   app/home-amenities-springs/route.ts  →  /home-amenities-springs
 * (same serving path as /test-slide).
 *
 * This script only refreshes public/home-amenities-springs/index.html
 * for local file inspection — do not point the iframe at it.
 *
 * Run: node scripts/build-home-amenities-springs.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcHtml = path.join(root, "public", "springs-layout", "index.html");
const outDir = path.join(root, "public", "home-amenities-springs");
const outHtml = path.join(outDir, "index.html");

let doc = fs.readFileSync(srcHtml, "utf8");

doc = doc.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Springs Amenities Clone (homepage)</title>",
);

doc = doc.replace(
  '<html data-springs-test-slide="true"',
  '<html data-springs-test-slide="true" data-hathor-amenities-springs="true"',
);

const embedCss = `
<style id="hathor-amenities-pure-embed">
  header,
  .header,
  .menu,
  .menu-picker,
  .cookie-consent,
  #cookie-consent,
  .turn-message,
  .browser-message,
  .favourite-btn,
  .l-callback,
  .modal,
  footer.footer {
    display: none !important;
  }
  #i-interiors,
  #i-interiors ~ * {
    display: none !important;
  }
</style>
<script src="/home-amenities-springs/bridge.js" defer></script>
`;

doc = doc.replace("</head>", `${embedCss}\n</head>`);

doc = doc.replace(
  'id="i-intro"',
  'id="i-intro" data-hathor-amenities-root="true"',
);

fs.mkdirSync(outDir, { recursive: true });
/* Never write public/.../index.html — it shadows app/home-amenities-springs/route.ts */
const fallback = path.join(outDir, "_static-fallback.html");
fs.writeFileSync(fallback, doc, "utf8");
console.log(
  `Wrote ${fallback} (${doc.length} bytes). Canonical URL: /home-amenities-springs (route).`,
);
