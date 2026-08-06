/**
 * Publishes the captured Springs Design document as an isolated static page.
 *
 * It intentionally retains the original document, body shell, CSS and script
 * order. The React public shell must not own this experience because it alters
 * the original smooth-scroll / Barba lifecycle.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hathorFontFaces = fs.readFileSync(
  path.join(root, "app", "hathor-fonts.css"),
  "utf8",
);
const source = path.join(
  root,
  "assets",
  "CLONE. httpssprings.estate",
  "design",
  "index.html",
);
const destinationDir = path.join(
  root,
  "public",
  "gastronomy-springs",
  "design",
);
const destination = path.join(destinationDir, "index.html");

let html = fs.readFileSync(source, "utf8");

/*
 * Preserve the Design document's structure and runtime verbatim, but substitute
 * only the existing dining page's editorial copy. These strings are intentionally
 * content-only: no section, attribute, timing or scroll hook is changed.
 */
const diningCopy = [
  [
    "Harmony in&nbsp;Greenery <br>\nand Glass",
    "Private Table<br>\nOne Kitchen · Your Hours",
  ],
  [
    "Springs resembles streams of&nbsp;transparent air and clear water sculpted into&nbsp;an&nbsp;asymmetrical glass tower that soars towards&nbsp;the&nbsp;sky. Wave-like&nbsp;longlines wrap around&nbsp;the&nbsp;facade and reveal verdant terraces that offer a&nbsp;vantage point for&nbsp;observation and introspection.",
    "Not a restaurant. A residence of taste&mdash;composed course by course for the only guests aboard.",
  ],
  ["Crystal-Clear Vision", "Silence · Silver · Riverlight"],
  [
    "Glowing building of&nbsp;limitless light resembles a&nbsp;lens refracting a&nbsp;kaleidoscope of&nbsp;reflections.",
    "The table<br>is the voyage.",
  ],
  [
    "The&nbsp;concept of&nbsp;Springs is to&nbsp;merge architecture and nature within&nbsp;the&nbsp;optical focus of&nbsp;a&nbsp;vision reaching into&nbsp;tomorrow.",
    "Image upon<br>image of appetite.",
  ],
  [
    "Ultra-transparent panoramic windows, aluminum panels with&nbsp;restrained luster, natural oak-framed loggias, marble flooring",
    "Cut from the dark like jewels&mdash;each dish arrives as its own world, then yields to the next.",
  ],
  ["Frozen Music", "First Light on Porcelain"],
  [
    "Springs resembles a&nbsp;waterfall that ceased flowing, as&nbsp;if you could hear roaring cascades and the&nbsp;delicate chiming of&nbsp;scattered drops in&nbsp;a&nbsp;matter of&nbsp;seconds. How did we create this effect?",
    "A single bite to wake the palate&mdash;then the river, and the night, do the rest.",
  ],
  ["Aristocratic Quartet", "The Passage of Courses"],
  [
    "Glass, metal, stone, and wood&nbsp;&mdash; the&nbsp;four elements that define the&nbsp;essence of&nbsp;Springs, an&nbsp;airy yet durable structure.",
    "Layer after<br>luminous layer.",
  ],
  [
    "High-clarity glass makes our building appear levitating, while stone and wood allow you to&nbsp;feel the&nbsp;essence of&nbsp;time&nbsp;&mdash; time that you'll wish to&nbsp;halt again and again to&nbsp;admire the&nbsp;elegance that adorns your life.",
    "Everything appears. Nothing interrupts. Preferences known once; timing written around conversation.",
  ],
  ["Rich<br>\nInterior<br>\nLife", "Cellar<br>Pairing<br>Discretion"],
  [
    "Imagine bathing in&nbsp;the&nbsp;crystal-clear pool, your whole body feeling light and energized. The&nbsp;splashing water carrying all superficial thoughts away. You emerge, feeling pleasant coolness on&nbsp;your skin.",
    "The pour is part of the plot. Old world, new world, or something held only for you&mdash;announced quietly, never performed.",
  ],
  [
    "Our fitness center, offering state-of-the-art equipment, supports your health and well-being. Panoramic windows and comfortable environment guarantee your full satisfaction.",
    "Sweetness that does not hurry. Dessert is not an ending&mdash;it is the hour the river keeps for itself.",
  ],
  ["Art Gallery<br>\nof&nbsp;Your Life", "Every Plate a<br>Private Horizon"],
  [
    "Our viewing terraces will surround you with&nbsp;beauty of&nbsp;botanical sculptures.",
    "Gold leaf. River salt. Candle smoke. The memory arrives before the bill.",
  ],
  [
    "Our Wellness center will greet you with&nbsp;beauty chiseled in&nbsp;marble and dissolved in&nbsp;water.",
    "Tell us what the evening must become.",
  ],
  ["Limitless vision", "The Invisible Kitchen"],
  ["Continue exploring", "Private Dining Desk"],
  ["Townhouses", "Lounge Bars"],
  ["Penthouses", "Private Dining"],
  ["Amenities", "Experiences"],
  [
    "At&nbsp;Springs, you can dream, plan boldly, and enjoy life&nbsp;&mdash; here and now.",
    "A private table, a quiet river, and time entirely your own.",
  ],
];

for (const [from, to] of diningCopy) {
  html = html.split(from).join(to);
}

// Source Design project overview: retain its original DOM container and
// choreography, replacing only the editorial content displayed in that place.
html = html
  .replace(
    /The&nbsp;architects of&nbsp;the&nbsp;acclaimed Istanbul-based bureau Tabanlioglu masterfully frame the&nbsp;world’s leading megapolises with&nbsp;the&nbsp;silhouettes of&nbsp;their glistening buildings\./g,
    "The table is composed around your party&mdash;from the first pour to the last quiet course on the Nile.",
  )
  .replaceAll("Bureau’s signature projects:", "Tonight’s private courses:")
  .replaceAll("Dakar<br>International Conference Centre, Senegal", "Welcome<br>First course")
  .replaceAll("Astana <br>Arena Stadium, Kazakhstan", "Main course<br>At your pace")
  .replaceAll("Istanbul<br>Sapphire Skyscraper, Turkey", "Dessert<br>By candlelight");

// Limit the wordmark substitution to the visual Design title: do not alter
// unrelated words such as “Designer finishings”.
html = html.replace(
  /(<h1 class="g1[^"]*"[^>]*>\s*)Design(\s*<\/h1>)/,
  "$1Private Dining$2",
);
html = html.replace(
  /(<h2 class="g1[^"]*"[^>]*>\s*)Flats(\s*<\/h2>)/,
  "$1Private Menu$2",
);
html = html
  .replaceAll(
    "Springs | Design and architecture of&nbsp;Springs residential complex",
    "Hathor | Private Dining",
  )
  .replaceAll(
    "Apartments in&amp;nbsp;a&amp;nbsp;premium-class residential complex",
    "A private table on the Nile&mdash;courses, wine and silence composed entirely around your party.",
  )
  .replaceAll(
    "Springs | Design and architecture of&amp;nbsp;Springs residential complex",
    "Hathor | Private Dining",
  );

const diningPalette = `
<style data-hathor-dining-palette>
  ${hathorFontFaces}
  @font-face {
    font-family: "Hathor Display";
    src: url("/fonts/Gamgote-Regular.otf") format("opentype");
    font-display: swap;
  }
  @font-face {
    font-family: "Hathor Body";
    src: url("/fonts/agraham-regular.ttf") format("truetype");
    font-display: swap;
  }
  @font-face {
    font-family: "Hathor Accent";
    src: url("/fonts/Gabigaile.otf") format("opentype");
    font-display: swap;
  }
  :root {
    --c-beige-background: #f5e8d1;
    --c-beige-background-rgb: 245, 232, 209;
    --c-beige: #f5e8d1;
    --c-beige-rgb: 245, 232, 209;
    --c-dark-green: #b69f64;
    --c-dark-green-rgb: 182, 159, 100;
    --c-green: #b69f64;
    --c-green-rgb: 182, 159, 100;
    --c-light-green: #b69f64;
    --c-light-green-rgb: 182, 159, 100;
    --c-olive: #b69f64;
    --c-olive-rgb: 182, 159, 100;
    --c-dark-blue: #b69f64;
    --c-dark-blue-rgb: 182, 159, 100;
    --c-blue: #b69f64;
    --c-blue-rgb: 182, 159, 100;
    --c-light-blue: #f5e8d1;
    --c-light-blue-rgb: 245, 232, 209;
    --c-sky: #f5e8d1;
    --c-sky-rgb: 245, 232, 209;
    --cookie-height: 0px;
  }
  body {
    background: #f5e8d1 !important;
    color: #b69f64;
    font-family: "Hathor Body", "TT Commons", sans-serif;
  }
  .ui-dark, .ui-dark-background, .ui-dark.ui-background {
    --t-background: #b69f64;
    --t-background-rgb: 182, 159, 100;
    --t-text: #f5e8d1;
    --t-text-rgb: 245, 232, 209;
    --t-heading: #f5e8d1;
    --t-heading-rgb: 245, 232, 209;
    --t-primary: #b69f64;
    background-color: #b69f64 !important;
    color: #f5e8d1 !important;
  }
  .ui-light, .ui-light-background, .ui-light.ui-background {
    --t-background: #f5e8d1;
    --t-background-rgb: 245, 232, 209;
    --t-text: #b69f64;
    --t-text-rgb: 182, 159, 100;
    --t-heading: #b69f64;
    --t-heading-rgb: 182, 159, 100;
    --t-primary: #b69f64;
    background-color: #f5e8d1 !important;
    color: #b69f64 !important;
  }
  .g1, .h0, .h1, .h2, .h3 {
    font-family: "Hathor Display", "Gamgote", Georgia, serif !important;
  }
  .text-c1, .text-c2, p, .btn__text {
    font-family: "Hathor Body", "Agraham", sans-serif;
  }
  .ui-light .g1, .ui-light .h0, .ui-light .h1, .ui-light .h2, .ui-light .h3,
  .ui-light .text-c1, .ui-light .text-c2 { color: #b69f64; }
  .ui-dark .g1, .ui-dark .h0, .ui-dark .h1, .ui-dark .h2, .ui-dark .h3,
  .ui-dark .text-c1, .ui-dark .text-c2 { color: #f5e8d1; }
  #de-intro .de-intro__caption,
  #de-projects .de-projects__caption,
  .more-block__caption { color: #f5e8d1; }
  #de-intro .de-intro__caption .g1,
  #de-intro .de-intro__caption .h3,
  #de-projects .de-projects__caption .g1,
  #de-projects .de-projects__caption .h3,
  .more-block__caption .h0 { color: #f5e8d1; }
  #de-intro .de-intro__caption-title.is-hidden--lg-up img { opacity: 0; }
  #de-intro .de-intro__caption-title.is-hidden--lg-up::after {
    color: #f5e8d1;
    content: "Private Dining";
    font-family: "Hathor Display", "Gamgote", Georgia, serif;
    font-size: clamp(3rem, 13vw, 6rem);
    line-height: 0.9;
  }
  /* The source project overview is the active desktop item. Keep its original
     left-column position visible after the standalone document boots. */
  #de-projects .de-projects__slider-item[data-content-animation-item="4"] {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  .header, .cookie-consent, .de-balcons__pin, .de-balcons__pin-tooltip {
    display: none !important;
  }
  .de-intro__gradient div,
  .de-spiral__gradient div,
  .de-gallery__gradient div,
  .de-slider__mobile-scrollable-gradient div {
    background: radial-gradient(circle, rgba(182, 159, 100, 0.86) 0%, rgba(182, 159, 100, 0.38) 45%, rgba(182, 159, 100, 0) 74%) !important;
  }
</style>`;

const gastronomyRuntime = `
<script data-gastronomy-dashboard-runtime>
(() => {
  const applyDashboardConfig = () => {
  const slotTargets = {
    "gastronomy-hero": "#de-intro",
    "gastronomy-restaurant": "#de-projects",
    "gastronomy-table": "#de-spiral",
    "gastronomy-courses": "#de-captions",
    "gastronomy-wine": "#de-gallery",
    "gastronomy-chef": "#de-balcons",
    "gastronomy-service": "#de-slider",
    "gastronomy-celebration": "#de-more",
  };
  function replaceVisual(target, url, slot) {
    const root = document.querySelector(target);
    if (!root || !url) return;
    root.setAttribute("data-gastronomy-slot", slot);
    root.querySelectorAll("img").forEach((image) => {
      image.setAttribute("data-gastronomy-slot", slot);
      image.src = url;
      image.removeAttribute("srcset");
      image.setAttribute("data-src", url);
    });
    root.querySelectorAll("source").forEach((source) => {
      source.srcset = url;
      source.setAttribute("data-gastronomy-slot", slot);
    });
  }
  fetch("/api/gastronomy-config", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : null)
    .then((config) => {
      if (!config) return;
      Object.entries(slotTargets).forEach(([slot, target]) =>
        replaceVisual(target, config.images && config.images[slot], slot)
      );
      const style = document.createElement("style");
      style.dataset.gastronomyTypography = "true";
      style.textContent = config.css || "";
      document.head.appendChild(style);
      if (config.phoneCss) {
        const phone = document.createElement("style");
        phone.dataset.gastronomyTypographyPhone = "true";
        phone.textContent = "@media (max-width:480px){" + config.phoneCss + "}";
        document.head.appendChild(phone);
      }
      window.dispatchEvent(new Event("resize"));
    })
    .catch(() => {});
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDashboardConfig, { once: true });
  } else {
    applyDashboardConfig();
  }
})();
</script>`;

html = html.replace("</head>", `${diningPalette}${gastronomyRuntime}</head>`);

// Serve captured scripts and styles from this app. They run in the standalone
// document at parse time, exactly as in the captured Springs page.
html = html.replaceAll(
  'href="/assets/',
  'href="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'src="/assets/',
  'src="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'data-src="/assets/',
  'data-src="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'srcset="/assets/',
  'srcset="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  'data-srcset="/assets/',
  'data-srcset="/gastronomy-springs/assets/',
);
html = html.replaceAll(
  "xlink:href=\"&#x2F;assets&#x2F;",
  'xlink:href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);
html = html.replaceAll(
  'href="&#x2F;assets&#x2F;',
  'href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);

// The HAR capture keeps all content images at their original public source.
// Preserve them as absolute assets rather than replacing them with unrelated
// dining images or broken local cache paths.
html = html.replaceAll("https://springs.estate/", "https://springs.house/");
html = html.replace(
  /(["'(])\/media\//g,
  "$1https://springs.house/media/",
);
html = html.replaceAll(
  "/gastronomy-springs/assets/images/",
  "https://springs.house/assets/images/",
);
html = html.replaceAll(
  "&#x2F;gastronomy-springs&#x2F;assets&#x2F;images&#x2F;",
  "https:&#x2F;&#x2F;springs.house&#x2F;assets&#x2F;images&#x2F;",
);

// Browser-message was not included in the capture and is nonessential to the
// page itself. Omitting only that optional helper prevents a 404.
html = html.replace(
  /<script[^>]*browser-message\/browser-message\.js[^>]*><\/script>/g,
  "",
);

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote exact standalone Design document: ${destination}`);
