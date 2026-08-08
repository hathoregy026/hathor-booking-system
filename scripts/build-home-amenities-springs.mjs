/**
 * Build a literal Springs infrastructure clone for homepage amenities
 * (i-intro → i-nature only). Layout/CSS/scroll attrs stay Springs.
 * Hathor only swaps theme gold + runtime CMS text/images via bridge.
 *
 * Source of truth: public/springs-layout (same as /test-slide)
 * Output: public/home-amenities-springs/index.html
 *
 * Run: node scripts/build-home-amenities-springs.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcHtml = path.join(root, "public", "springs-layout", "index.html");
const outDir = path.join(root, "public", "home-amenities-springs");
const outHtml = path.join(outDir, "index.html");

const GOLD = "#b69f64";
const GOLD_RGB = "182, 159, 100";
const CREAM = "#ece8df";

let html = fs.readFileSync(srcHtml, "utf8");

const introMarker = 'id="i-intro"';
const interiorsMarker = 'id="i-interiors"';
const introAttr = html.indexOf(introMarker);
const interiorsAttr = html.indexOf(interiorsMarker);
if (introAttr < 0 || interiorsAttr < 0) {
  throw new Error("Could not find i-intro / i-interiors markers in springs-layout");
}

const introStart = html.lastIndexOf("<div", introAttr);
const interiorsStart = html.lastIndexOf("<div", interiorsAttr);
if (introStart < 0 || interiorsStart < 0 || interiorsStart <= introStart) {
  throw new Error("Failed to bound i-intro → i-nature slice");
}

const amenitiesSlice = html.slice(introStart, interiorsStart);

/* Keep the Springs document shell; replace <main> contents with amenities only. */
const mainOpen = html.indexOf("<main");
const mainOpenEnd = html.indexOf(">", mainOpen) + 1;
const mainClose = html.indexOf("</main>");
if (mainOpen < 0 || mainClose < 0) {
  throw new Error("Could not find <main> in springs-layout");
}

const beforeMain = html.slice(0, mainOpenEnd);
const afterMain = html.slice(mainClose);

/* Trim chrome after nature: drop footer/modals noise later in body by
 * cutting scripts that require full-page sections — keep Springs CSS/JS. */

let doc =
  beforeMain +
  `\n<section class="section ui-dark-background" data-scroll-section data-plugin="reveal" data-hathor-amenities-root>\n` +
  amenitiesSlice +
  `\n</section>\n` +
  afterMain;

doc = doc
  .replace(
    /<title>[\s\S]*?<\/title>/,
    "<title>Hathor | Nile Amenities</title>",
  )
  .replace(
    /content="#162D24"/g,
    `content="${GOLD}"`,
  )
  .replace(
    /body \{ background: #F5E8D1; color: #F5E8D1; \}/,
    `body { background: ${CREAM}; color: ${CREAM}; }`,
  );

/* Hathor gold theme overrides — Springs layout untouched, colour tokens only. */
const themeOverride = `
<style id="hathor-amenities-theme">
  :root {
    --c-dark-green: ${GOLD} !important;
    --c-dark-green-rgb: ${GOLD_RGB} !important;
    --c-green: ${GOLD} !important;
    --c-green-rgb: ${GOLD_RGB} !important;
  }
  .ui-dark-background,
  .ui-background,
  .ui-dark.ui-background {
    background-color: ${GOLD} !important;
  }
  /* Match Springs dark section — hairlines show gold, not cream */
  html, body {
    background: ${GOLD} !important;
  }
  /* Homepage embed: hide Springs chrome; keep amenities chapters only.
   * Do NOT hide .preloader — Springs stays on html.not-ready / is-invisible--js
   * until preloader completes (that was the cream void). Bridge force-ready. */
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
</style>
<script src="/home-amenities-springs/bridge.js" defer></script>
`;

doc = doc.replace("</head>", `${themeOverride}\n</head>`);
doc = doc.replace(
  '<html data-springs-test-slide="true"',
  '<html data-springs-test-slide="true" data-hathor-amenities-springs="true"',
);

/* Tag imgs only inside the amenities root (not Springs header chrome). */
const imgSlotOrder = [
  "home-amenities-1", // intro
  "home-amenities-2", // video hero
  "home-amenities-3", // video cover image
  "home-amenities-4",
  "home-amenities-5",
  "home-amenities-6",
  "home-amenities-7",
  "home-amenities-8", // opening left
  "home-amenities-9",
  "home-amenities-10",
  "home-amenities-11",
  "home-amenities-12", // nature
];

const rootOpen = doc.indexOf("data-hathor-amenities-root");
const rootClose = doc.indexOf("</section>", rootOpen);
if (rootOpen >= 0 && rootClose > rootOpen) {
  const before = doc.slice(0, rootOpen);
  let mid = doc.slice(rootOpen, rootClose);
  const after = doc.slice(rootClose);
  let slotIdx = 0;
  mid = mid.replace(/<img\b/g, (match) => {
    if (slotIdx >= imgSlotOrder.length) return match;
    const slot = imgSlotOrder[slotIdx++];
    return `<img data-hathor-img-slot="${slot}"`;
  });
  doc = before + mid + after;
  console.log(`Tagged ${slotIdx} amenity image slots`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outHtml, doc, "utf8");
console.log(`Wrote ${outHtml} (${doc.length} bytes)`);
