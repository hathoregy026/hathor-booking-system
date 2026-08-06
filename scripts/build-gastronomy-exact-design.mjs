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

/*
 * Seed the standalone document with Dining imagery, not captured Springs
 * imagery. This runs while the static document is built, before an iframe can
 * parse or request any image. The runtime below still applies dashboard uploads
 * after this baseline has painted.
 */
function replaceInitialDiningAsset(assetPattern, url) {
  const remoteSource = String.raw`https?:\/\/[^"'\s>]*${assetPattern}[^"'\s>]*`;
  const localSource = String.raw`\/assets\/images\/media\/${assetPattern}[^"'\s>]*`;
  html = html
    .replace(new RegExp(remoteSource, "g"), url)
    .replace(new RegExp(localSource, "g"), url);
}

[
  ["design\\/1\\.intro\\/background-", "/media/gastronomy-dining/dining-hero.jpg"],
  ["landing\\/callback\\/spiral", "/media/gastronomy-dining/dining-table.jpg"],
  ["design\\/3\\.projects\\/background-", "/media/gastronomy-dining/experience-dining.jpg"],
  ["design\\/3\\.projects\\/slide-2", "/media/gastronomy-dining/dining-courses.jpg"],
  ["design\\/3\\.projects\\/slide-3", "/media/gastronomy-dining/dining-wine.jpg"],
  ["design\\/3\\.projects\\/thumb-1", "/media/gastronomy-dining/dining-plate-1.png"],
  ["design\\/3\\.projects\\/thumb-2", "/media/gastronomy-dining/dining-plate-2.png"],
  ["design\\/3\\.projects\\/thumb-3", "/media/gastronomy-dining/dining-plate-3.png"],
  ["design\\/4\\.captions\\/image-[^-]+-1", "/media/gastronomy-dining/dining-hero.jpg"],
  ["design\\/4\\.captions\\/image-[^-]+-2", "/media/gastronomy-dining/experience-dining.jpg"],
  ["design\\/5\\.balcons\\/balcon-", "/media/gastronomy-dining/dining-chef.jpg"],
  ["design\\/6\\.materials\\/material", "/media/gastronomy-dining/dining-courses.jpg"],
  ["design\\/7\\.slider\\/slider-[^/]+-1", "/media/gastronomy-dining/dining-wine.jpg"],
  ["design\\/7\\.slider\\/slider-[^/]+-2", "/media/gastronomy-dining/dining-plate-4.png"],
  ["design\\/8\\.gallery\\/image-1", "/media/gastronomy-dining/dining-plate-5.png"],
  ["design\\/8\\.gallery\\/image-2", "/media/gastronomy-dining/dining-plate-6.png"],
  ["design\\/9\\.flats\\/image-[^/]+-1", "/media/gastronomy-dining/experience-dining.jpg"],
  ["design\\/9\\.flats\\/image-[^/]+-2", "/media/gastronomy-dining/charter-service.jpg"],
  ["design\\/9\\.flats\\/image-[^/]+-3", "/media/gastronomy-dining/charter-celebration.jpg"],
  ["design\\/10\\.more\\/more-", "/media/gastronomy-dining/dining-table.jpg"],
].forEach(([assetPattern, url]) => replaceInitialDiningAsset(assetPattern, url));

html = html.replace(
  /https?:\/\/[^"'\s>]*uploads\/32\/image_1762521394\.webp/g,
  "/media/gastronomy-dining/dining-hero.jpg",
);
const diningMediaBase =
  "https://jgkmiettciwacrpcubil.supabase.co/storage/v1/object/public/website-images/site-images";
const initialDiningMediaUrls = {
  "dining-hero.jpg": `${diningMediaBase}/gastronomy-hero/dining-hero-mshk3jtr.jpg`,
  "dining-table.jpg": `${diningMediaBase}/gastronomy-table/dining-long-table-mshjq8sm.webp`,
  "dining-courses.jpg": `${diningMediaBase}/gastronomy-courses/dining-courses-mshj8sas.jpg`,
  "dining-wine.jpg": `${diningMediaBase}/gastronomy-wine/dining-wine-pairing-mshja14u.webp`,
  "dining-chef.jpg": `${diningMediaBase}/gastronomy-chef/dining-chef-mshk1rrx.jpg`,
  "experience-dining.jpg": `${diningMediaBase}/gastronomy-restaurant/dining-private-table-mshj7qm7.webp`,
  "charter-service.jpg": `${diningMediaBase}/gastronomy-service/dining-service-mshjqhah.webp`,
  "charter-celebration.jpg": `${diningMediaBase}/gastronomy-celebration/dining-celebration-mshk2q6u.webp`,
  "dining-plate-1.png": `${diningMediaBase}/gastronomy-restaurant/dining-private-table-mshj7qm7.webp`,
  "dining-plate-2.png": `${diningMediaBase}/gastronomy-courses/dining-courses-mshj8sas.jpg`,
  "dining-plate-3.png": `${diningMediaBase}/gastronomy-wine/dining-wine-pairing-mshja14u.webp`,
  "dining-plate-4.png": `${diningMediaBase}/gastronomy-chef/dining-chef-mshk1rrx.jpg`,
  "dining-plate-5.png": `${diningMediaBase}/gastronomy-restaurant/dining-private-table-mshj7qm7.webp`,
  "dining-plate-6.png": `${diningMediaBase}/gastronomy-courses/dining-courses-mshj8sas.jpg`,
};
for (const [filename, url] of Object.entries(initialDiningMediaUrls)) {
  html = html.replaceAll(`/media/gastronomy-dining/${filename}`, url);
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

/*
 * The captured page uses a real-estate story for its final three scroll scenes.
 * Preserve every source container and animation, replacing only that copy with
 * Hathor private-dining language.
 */
html = html
  .replace(
    /Our view flats transform[\s\S]*?the&nbsp;megapolises\./g,
    "Egyptian roots, global reach: Nile fish, Cairo spice markets, and Mediterranean technique become one private progression&mdash;served only to your party and paced to the river outside.",
  )
  .replace(
    /Our boutique townhouses embody[\s\S]*?your face\./g,
    "Global kitchens, intimate scale: mezze, grills, and late-night lounge plates move between Egyptian classics and Levantine, North African, and European accents&mdash;always at your table, never in a crowd.",
  )
  .replace(
    /When you live in this penthouse,[\s\S]*?with ease\./g,
    "Private dining as ceremony: a dedicated chef, sommelier, and service team compose an Egyptian-led tasting with global accents&mdash;for milestones, celebrations, or simply an evening the Nile will remember.",
  )
  .replaceAll("Garden of Fulfilled Expectations", "Garden of the Nile Evening")
  .replaceAll("Glowing Perspectives", "Candlelight on the Water")
  .replaceAll("Beauty at Your Fingertips", "Every detail, quietly handled")
  .replaceAll("138 view flats", "12 tasting formats")
  .replaceAll("62-347 m<sup>2</sup> area", "2&ndash;14 guests &middot; one table")
  .replaceAll("Unique transformable glazing", "Chef&rsquo;s table or salon service")
  .replaceAll("5 townhouses", "5 lounge stations")
  .replaceAll("174-378 m<sup>2</sup> area", "Sunset aperitif &rarr; midnight digestif")
  .replaceAll("Ceiling heights up to 4 meters", "Open-air upper deck or salon bar")
  .replaceAll("Private patio", "Nile-facing terrace service")
  .replaceAll("7 penthouses", "7 signature celebrations")
  .replaceAll("Luxurious terraces", "River terrace or enclosed salon")
  .replaceAll("Designer finishings", "Bespoke service &amp; tableware")
  .replaceAll(
    "The balconies of the asymmetrical facade follow a chessboard pattern. The non-linear order creates a striking, recognizable effect.",
    "Amuse-bouche one: a jewel of molokhia emulsion and crisp Nile vegetables, designed to open the palate before the first pour.",
  )
  .replaceAll(
    "The architects divided the uniform transparent facade into three vertical sections, with the terraces situated in the recesses. This is how we graft rhythmic beauty with functional elegance.",
    "Three movements&mdash;Egypt, Mediterranean, world: each course arrives in its own rhythm while the kitchen reads the room and the river light.",
  )
  .replaceAll("At&nbsp;Springs, you can dream, plan boldly, and enjoy life&nbsp;&mdash; here and now.", "A private table, a quiet river, and time entirely your own.")
  .replaceAll(
    "Our view flats transform the&nbsp;city into&nbsp;an&nbsp;element of&nbsp;your interior design; not a&nbsp;mere landscape but a&nbsp;panorama of&nbsp;seven historical parks, a&nbsp;river shifting shades, and the&nbsp;capital's iconic landmarks in&nbsp;full view. It’s the&nbsp;coziness of&nbsp;a&nbsp;country house with&nbsp;the&nbsp;expanse of&nbsp;the&nbsp;megapolises.",
    "Egyptian roots, global reach: Nile fish, Cairo spice markets, and Mediterranean technique become one private progression&mdash;served only to your party and paced to the river outside.",
  )
  .replaceAll(
    "Our boutique townhouses embody intimate coziness. The&nbsp;day’s worries fade away like&nbsp;shadows of&nbsp;butterfly wings, when you step onto&nbsp;the&nbsp;sunlit ground-floor patio. Here, you can stroll in&nbsp;light shoes, feel the&nbsp;gentle breeze, and close your eyes as&nbsp;the&nbsp;sun warmly kisses your face.",
    "Global kitchens, intimate scale: mezze, grills, and late-night lounge plates move between Egyptian classics and Levantine, North African, and European accents&mdash;always at your table, never in a crowd.",
  )
  .replaceAll(
    "When you live in&nbsp;this penthouse, you feel like&nbsp;you own a&nbsp;piece of&nbsp;the&nbsp;sky. Here, sublime feelings transform into&nbsp;higher possibilities. Declare love, dare to&nbsp;skyrocket your career, or devise a&nbsp;million-dollar idea. Here, you can do it with&nbsp;ease.",
    "Private dining as ceremony: a dedicated chef, sommelier, and service team compose an Egyptian-led tasting with global accents&mdash;for milestones, celebrations, or simply an evening the Nile will remember.",
  )
  .replaceAll("Garden of Fulfilled Expectations", "Garden of the Nile Evening")
  .replaceAll("Glowing Perspectives", "Candlelight on the Water")
  .replaceAll("138 view flats", "12 tasting formats")
  .replaceAll("5 townhouses", "5 lounge stations")
  .replaceAll("7 penthouses", "7 signature celebrations")
  .replaceAll("Designer finishings", "Bespoke service &amp; tableware")
  .replaceAll(
    "Visual representations of&nbsp;the&nbsp;property, layout plans, and other materials are for&nbsp;illustration purposes only. All information on&nbsp;this website is provided for&nbsp;general informational use and does not constitute an&nbsp;offer or any form of&nbsp;binding commitment.<br>\nAll materials on&nbsp;this website, including design elements, are the&nbsp;intellectual property of&nbsp;the&nbsp;Organization. Any copying, reproduction, distribution (including reposting to&nbsp;other websites or online resources), or other use of&nbsp;these materials is prohibited without&nbsp;the&nbsp;prior written consent of&nbsp;the&nbsp;rights holder.",
    "Menus, pairings, and imagery are curated for illustration. Availability, pricing, and dietary arrangements are confirmed directly with Hathor&rsquo;s private dining desk. All Hathor content and design remain protected.",
  );

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
  #de-projects .de-projects__text,
  #de-projects .content-animation,
  #de-projects [data-reveal="text"],
  #de-projects [data-reveal="text"] * {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }
  #de-projects .de-projects__background {
    z-index: 0 !important;
  }
  #de-projects .de-projects__text {
    position: relative !important;
    z-index: 10 !important;
  }
  #de-projects .de-projects__text > .row > .ui-light {
    clip-path: none !important;
  }
  #de-projects .ui-light .h3,
  #de-projects .ui-light .text-c2,
  #de-projects .ui-light .de-projects__slider-item__text {
    color: #b69f64 !important;
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
  /* Dining course carousel: remove the source thumbnail rail and its
     architectural studio mark, replacing it with the Hathor ring icon. */
  #de-spiral .de-spiral__uptitle,
  #de-projects .de-projects__pagination {
    display: none !important;
  }
  #de-projects .de-projects__logo {
    display: none !important;
  }
  .hathor-dining-project-logo {
    display: block;
    width: 44px;
    height: 44px;
    background: #b69f64;
    -webkit-mask: url("/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg") center / contain no-repeat;
    mask: url("/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg") center / contain no-repeat;
  }
  /*
   * Hard gate: never paint any photo until the Dining dashboard config has
   * replaced every visual. This permanently kills Springs flashbacks.
   */
  html:not(.dining-media-ready) picture,
  html:not(.dining-media-ready) img[data-src],
  html:not(.dining-media-ready) img[src*="springs."],
  html:not(.dining-media-ready) .de-captions__canvas {
    opacity: 0 !important;
    visibility: hidden !important;
  }
</style>`;

const gastronomyRuntime = `
<script data-gastronomy-dashboard-runtime>
(() => {
  const slotTargets = {
    "dining-intro-hero": "#de-intro .de-intro__background picture",
    "dining-spiral-bridge": "#de-spiral .de-spiral__background picture",
    "dining-projects-backdrop": "#de-projects .de-projects__background picture",
    "dining-projects-course-1": "#de-projects [data-content-animation-item='1'] img",
    "dining-projects-course-2": "#de-projects [data-content-animation-item='2'] img",
    "dining-projects-course-3": "#de-projects [data-content-animation-item='3'] img",
    "dining-projects-thumb-1": "#de-projects [data-content-animation-id='1'] img",
    "dining-projects-thumb-2": "#de-projects [data-content-animation-id='2'] img",
    "dining-projects-thumb-3": "#de-projects [data-content-animation-id='3'] img",
    "dining-first-light": "#de-balcons .de-balcons__content picture",
    "dining-course-layers": "#de-materials .de-materials__image picture",
    "dining-wine-pairing": "#de-slider .de-slider__images > div:first-child picture, #de-slider .de-slider__mobile-scrollable__item:first-child picture",
    "dining-dessert-hour": "#de-slider .de-slider__images > div:nth-child(2) picture, #de-slider .de-slider__mobile-scrollable__item:nth-child(2) picture",
    "dining-gallery-left": "#de-gallery .de-gallery__image:first-child picture",
    "dining-gallery-right": "#de-gallery .de-gallery__image:nth-child(2) picture",
    "dining-private-menu": "#de-flats-80691 .background picture",
    "dining-lounge": "#de-flats-251302 .background picture",
    "dining-celebration": "#de-flats-644069 .background picture",
    "dining-closing": "#i-more .more-block__content .background picture",
  };
  function isSpringsUrl(value) {
    return typeof value === "string" && /springs\\.(estate|house)/i.test(value);
  }
  function scrubSpringsUrls(root) {
    root.querySelectorAll("img, source").forEach((node) => {
      ["src", "srcset", "data-src", "data-srcset"].forEach((attr) => {
        const value = node.getAttribute(attr);
        if (value && isSpringsUrl(value)) node.removeAttribute(attr);
      });
    });
  }
  function replaceVisual(target, url, slot) {
    if (!url) return;
    document.querySelectorAll(target).forEach((root) => {
      root.setAttribute("data-dining-slot", slot);
      const images = root.matches("img") ? [root] : [...root.querySelectorAll("img")];
      images.forEach((image) => {
        image.setAttribute("data-dining-slot", slot);
        image.src = url;
        image.removeAttribute("srcset");
        image.setAttribute("data-src", url);
        image.removeAttribute("data-srcset");
      });
      root.querySelectorAll("source").forEach((source) => {
        source.srcset = url;
        source.setAttribute("data-srcset", url);
        source.setAttribute("data-dining-slot", slot);
      });
    });
  }
  function replaceCaptionFrame(attribute, url, slot) {
    const canvas = document.querySelector("#de-captions .de-captions__canvas");
    if (!canvas || !url) return;
    const raw = canvas.getAttribute(attribute);
    if (!raw) return;
    try {
      const value = JSON.parse(raw);
      const replaceUrls = (entry) => {
        if (typeof entry === "string") {
          return entry.startsWith("http") || isSpringsUrl(entry) ? url : entry;
        }
        if (Array.isArray(entry)) return entry.map(replaceUrls);
        if (entry && typeof entry === "object") {
          Object.keys(entry).forEach((key) => { entry[key] = replaceUrls(entry[key]); });
        }
        return entry;
      };
      canvas.setAttribute(attribute, JSON.stringify(replaceUrls(value)));
      canvas.setAttribute("data-dining-slot", slot);
    } catch {}
  }
  function revealDiningMedia() {
    document.documentElement.classList.add("dining-media-ready");
  }
  const configPromise = fetch("/api/gastronomy-config", { cache: "no-store" })
    .then((response) => response.ok ? response.json() : null)
    .catch(() => null);
  const applyDashboardConfig = () => {
    scrubSpringsUrls(document);
    configPromise.then((config) => {
      if (config && config.images) {
        Object.entries(slotTargets).forEach(([slot, target]) =>
          replaceVisual(target, config.images[slot], slot)
        );
        replaceCaptionFrame("data-image-scroll-image-start", config.images["dining-captions-start"], "dining-captions-start");
        replaceCaptionFrame("data-image-scroll-image-end", config.images["dining-captions-end"], "dining-captions-end");
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
      }
      scrubSpringsUrls(document);
      revealDiningMedia();
      window.dispatchEvent(new Event("resize"));
    });
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

/*
 * HARD DELETE of Springs photo flashbacks.
 * Keep local CSS/JS under /gastronomy-springs/assets/, but never leave a
 * springs.estate / springs.house content photo URL in the Dining document.
 */
const diningFallback = initialDiningMediaUrls["dining-hero.jpg"];
const diningFallbackEncoded = diningFallback
  .replaceAll(":", "&#x3A;")
  .replaceAll("/", "&#x5C;&#x2F;");

html = html.replace(
  /https?:\/\/springs\.(?:estate|house)\/(?:media|assets\/images\/media)\/[^"'\\\s>]+/gi,
  diningFallback,
);

const captionStartUrl = initialDiningMediaUrls["dining-hero.jpg"];
const captionEndUrl = initialDiningMediaUrls["experience-dining.jpg"];
const captionFrame = (url) =>
  JSON.stringify({
    xs: { src: url, width: 720, height: 1280 },
    md: { src: url, width: 720, height: 1280 },
    xxl: { src: url, width: 1440, height: 900 },
    xxxl: { src: url, width: 1440, height: 900 },
  })
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");

html = html.replace(
  /data-image-scroll-image-start="[^"]*"/,
  `data-image-scroll-image-start="${captionFrame(captionStartUrl)}"`,
);
html = html.replace(
  /data-image-scroll-image-end="[^"]*"/,
  `data-image-scroll-image-end="${captionFrame(captionEndUrl)}"`,
);

// Any leftover entity-encoded Springs media URLs become Dining defaults.
html = html.replace(
  /https&#x3A;(?:&#x5C;&#x2F;){2}springs\.(?:estate|house)(?:&#x5C;&#x2F;(?:[A-Za-z0-9._@%-]|&#x25;[0-9A-Fa-f]{2})+)+/gi,
  diningFallbackEncoded,
);
html = html.replaceAll("https://springs.estate/", "https://springs.house/");

// Browser-message was not included in the capture and is nonessential to the
// page itself. Omitting only that optional helper prevents a 404.
html = html.replace(
  /<script[^>]*browser-message\/browser-message\.js[^>]*><\/script>/g,
  "",
);

// Final copy pass runs after all capture rewrites so no source editorial text
// can be restored by a later document transformation.
html = html
  .replace(
    /Our view flats[\s\S]*?megapolises\./g,
    "Egyptian roots, global reach: Nile fish, Cairo spice markets, and Mediterranean technique become one private progression&mdash;served only to your party and paced to the river outside.",
  )
  .replace(
    /Our boutique townhouses[\s\S]*?your face\./g,
    "Global kitchens, intimate scale: mezze, grills, and late-night lounge plates move between Egyptian classics and Levantine, North African, and European accents&mdash;always at your table, never in a crowd.",
  )
  .replace(
    /When you live in&nbsp;this penthouse,[\s\S]*?ease\./g,
    "Private dining as ceremony: a dedicated chef, sommelier, and service team compose an Egyptian-led tasting with global accents&mdash;for milestones, celebrations, or simply an evening the Nile will remember.",
  )
  .replace(
    /Visual representations of&nbsp;the&nbsp;property,[\s\S]*?rights holder\./g,
    "Menus, pairings, and imagery are curated for illustration. Availability, pricing, and dietary arrangements are confirmed directly with Hathor&rsquo;s private dining desk. All Hathor content and design remain protected.",
  );
html = html.replace(
  /(<img class="de-projects__logo[\s\S]*?>)/,
  '$1<span class="hathor-dining-project-logo" aria-hidden="true"></span>',
);

/*
 * Keep visitors on Hathor. The Dining page runs in an iframe, so every site
 * navigation link must break out with target="_top" and never point at Springs.
 */
function rewriteDiningHref(documentHtml, fromHref, toHref) {
  const escaped = fromHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return documentHtml.replace(
    new RegExp(`(<a\\b)([^>]*?)\\shref="${escaped}"([^>]*>)`, "gi"),
    (_match, open, before, after) => {
      const beforeAttrs = before
        .replace(/\s+target="[^"]*"/gi, "")
        .replace(/\s+rel="[^"]*"/gi, "");
      const afterAttrs = after
        .replace(/\s+target="[^"]*"/gi, "")
        .replace(/\s+rel="[^"]*"/gi, "");
      const combined = `${beforeAttrs}${afterAttrs}`;
      const hasIgnore = /(?:^|\s)data-ajax-page-ignore(?:\s|=|>|$)/i.test(
        combined,
      );
      const ignore = hasIgnore ? "" : " data-ajax-page-ignore";
      return `${open}${beforeAttrs} href="${toHref}" target="_top"${ignore}${afterAttrs}`;
    },
  );
}

const diningSiteLinks = [
  ["https://springs.house/infrastructure", "/highlights"],
  ["https://springs.house/privacy-policy", "/contact"],
  ["https://springs.house/agreement", "/contact"],
  ["https://springs.house/location", "/about"],
  ["https://springs.house/gallery", "/highlights"],
  ["https://springs.house/about", "/about"],
  ["https://springs.house/visual-search", "/cruises"],
  ["https://springs.estate/infrastructure", "/highlights"],
  ["https://springs.estate/privacy-policy", "/contact"],
  ["https://springs.estate/agreement", "/contact"],
  ["https://springs.estate/location", "/about"],
  ["https://springs.estate/gallery", "/highlights"],
  ["https://springs.estate/about", "/about"],
  ["https://springs.estate/visual-search", "/cruises"],
  ["/flats", "/rooms"],
  ["/design", "/gastronomy"],
  ["/", "/"],
];

for (const [fromHref, toHref] of diningSiteLinks) {
  html = rewriteDiningHref(html, fromHref, toHref);
}

// Remove the clone agency credit so it cannot send guests off-site.
html = html.replace(
  /<a\b[^>]*href="https:\/\/videinfra\.com\/"[^>]*>[\s\S]*?<\/a>/gi,
  '<span class="text-c2-small leading-trim text-color-small text-right">Hathor Dahabiya</span>',
);

// Meta / share tags should not advertise the Springs clone source.
html = html
  .replaceAll('href="https://springs.house/design"', 'href="/gastronomy"')
  .replaceAll(
    'content="https://springs.house/design"',
    'content="/gastronomy"',
  )
  .replaceAll(
    'content="https://springs.house/assets/manifest/og.jpg"',
    `content="${initialDiningMediaUrls["dining-hero.jpg"]}"`,
  )
  .replace(
    /href="https:\/\/springs\.house\/favicon-light\.png[^"]*"/g,
    'href="/favicon.ico"',
  );

// Final safety: no remaining Springs navigation hrefs.
html = html.replace(
  /(<a\b[^>]*?)\s+href="https:\/\/springs\.(?:estate|house)\/[^"]*"/gi,
  '$1 href="/contact" target="_top" data-ajax-page-ignore',
);

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote exact standalone Design document: ${destination}`);
