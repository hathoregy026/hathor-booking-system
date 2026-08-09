/**
 * Publishes the captured Springs Homepage as an isolated Suites document.
 *
 * Retains original document structure, CSS, scripts and scroll choreography.
 * Substitutes only editorial copy, imagery, links, palette, and footer.
 */
import fs from "node:fs";
import path from "node:path";
import {
  getLuxFooterCss,
  getLuxFooterScrollSectionHtml,
} from "./lux-footer-iframe-snippet.mjs";

const root = process.cwd();
const hathorFontFaces = fs.readFileSync(
  path.join(root, "app", "hathor-fonts.css"),
  "utf8",
);
/** Canonical cream/ink/gold — same tokens as PublicLayout Footer. */
const luxFooterCss = getLuxFooterCss();
const source = path.join(
  root,
  "assets",
  "CLONE. httpssprings.estate",
  "index.html",
);
const destinationDir = path.join(root, "public", "suites-springs");
const destination = path.join(destinationDir, "index.html");

let html = fs.readFileSync(source, "utf8");

const MEDIA = {
  hero: "/media/hathor/scraped/suites-hero.webp",
  rooms: "/media/hathor/scraped/suites-luxury-rooms.webp",
  suites: "/media/hathor/scraped/suites-luxury-suites.webp",
  royal: "/media/hathor/scraped/suites-royal.webp",
  roomHero: "/media/hathor/r2/room-suite.webp",
  luxury: "/media/hathor/r2/room-luxury.webp",
  royalHero: "/media/hathor/r2/room-royal.webp",
  cabin1: "/media/hathor/scraped/cabin-1.webp",
  cabin2: "/media/hathor/scraped/cabin-2.webp",
  cabin3: "/media/hathor/scraped/cabin-3.webp",
  cabin4: "/media/hathor/scraped/cabin-4.webp",
  cabin5: "/media/hathor/scraped/cabin-5.webp",
  cabin6: "/media/hathor/scraped/cabin-6.webp",
  lux1: "/media/hathor/scraped/luxsuite-1.webp",
  lux2: "/media/hathor/scraped/luxsuite-2.webp",
  lux3: "/media/hathor/scraped/luxsuite-3.webp",
  lux4: "/media/hathor/scraped/luxsuite-4.webp",
  lux5: "/media/hathor/scraped/luxsuite-5.webp",
  lux6: "/media/hathor/scraped/luxsuite-6.webp",
  royal1: "/media/hathor/scraped/royal-1.webp",
  royal2: "/media/hathor/scraped/royal-2.webp",
  royal3: "/media/hathor/scraped/royal-3.webp",
  royal4: "/media/hathor/scraped/royal-4.webp",
  royal5: "/media/hathor/scraped/royal-5.webp",
  royal6: "/media/hathor/scraped/royal-6.webp",
  royal7: "/media/hathor/scraped/royal-7.webp",
  royal8: "/media/hathor/scraped/royal-8.webp",
};

/**
 * Gallery cards gallery-1…gallery-19 — one distinct Hathor image each.
 * (Previously hero repeated on cards 1/5/9/19 via wrap.)
 */
const galleryCycle = [
  MEDIA.hero, // 1
  MEDIA.suites, // 2
  MEDIA.rooms, // 3
  MEDIA.royal, // 4
  MEDIA.lux6, // 5
  MEDIA.lux1, // 6
  MEDIA.lux2, // 7
  MEDIA.cabin1, // 8
  MEDIA.cabin2, // 9
  MEDIA.cabin3, // 10
  MEDIA.royal1, // 11
  MEDIA.royal3, // 12
  MEDIA.lux3, // 13
  MEDIA.lux4, // 14
  MEDIA.cabin5, // 15
  MEDIA.royal5, // 16
  MEDIA.lux5, // 17
  MEDIA.roomHero, // 18
  MEDIA.royalHero, // 19
];

/*
 * Content-only substitutions. Structure, attributes, timing and scroll hooks
 * stay identical to the Springs homepage capture.
 */
/** Visible editorial strings only — never short tokens that appear in classes/plugins. */
const suitesCopy = [
  ["Springs | Homepage", "Hathor | Suites"],
  ["Wellness-residences", "Luxury suites on a private Dahabiya Nile cruise"],
  [
    "Exclusive residence with&nbsp;a&nbsp;rich wellness infrastructure next to&nbsp;Nature Park",
    "Luxury suites aboard Hathor Dahabiya: private Nile journeys shaped for stillness, craft, and panoramic river light",
  ],
  ["Splendor <br>\nof&nbsp;Renewal", "River <br>\nSuites"],
  ["Splendor <br>of&nbsp;Renewal", "River <br>Suites"],
  ["Premium Living<br>", "Luxury Suites<br>"],
  ["Premium Living", "Luxury Suites"],
  [
    "Open the&nbsp;doors of&nbsp;Springs and step into&nbsp;your true self",
    "Step aboard Hathor and settle into&nbsp;your Nile sanctuary",
  ],
  [
    "Apartments, terraced townhouses, and duplex penthouses in&nbsp;a&nbsp;quiet, green neighborhood.",
    "Luxury Rooms, Elegant Suites, and Royal Suites with panoramic Nile views aboard Hathor Dahabiya.",
  ],
  [
    "Enclave of&nbsp;peace and quiet, your personal happy place, where deep relaxation helps you connect to&nbsp;your thoughts and feelings. Here, you will unveil hidden possibilities that the&nbsp;future holds just for&nbsp;you.",
    "Experience Hathor Dahabiya Cruise that blends authenticity with luxury, offering an unforgettable journey by&nbsp;the timeless Nile. Whether you stay in our Elegant Suites or Royal Suites with panoramic Nile view, you enjoy unmatched comfort and exclusive privacy.",
  ],
  [
    "Springs brings wellness right into&nbsp;your home. With&nbsp;a&nbsp;thoughtfully designed infrastructure for&nbsp;relaxation, it&nbsp;rejuvenates your body and mind, leaving you refreshed and perfectly balanced.",
    "Every Hathor suite is crafted for comfort and ease: LED screens, walk-in showers or bathtubs, safe boxes, and quiet privacy as the Nile drifts past your windows.",
  ],
  [
    "Let your thoughts flow freely as&nbsp;you immerse yourself in&nbsp;our crystal-clear spa pool that offers a&nbsp;view of&nbsp;the&nbsp;garden. Soft glare on&nbsp;the&nbsp;water, a&nbsp;cup of&nbsp;herbal tea in&nbsp;the&nbsp;fragrant warmth of&nbsp;the&nbsp;hammam, and just like&nbsp;that, you leave the&nbsp;day’s worries behind.",
    "Return from temple shores to a suite shower and soft river light. Bathtub or walk-in shower, quiet air, and the Nile beyond the glass. Worries of the day dissolve into water and gold dusk.",
  ],
  [
    "Relaxing yoga session mellows the&nbsp;mind and makes your body feel light and responsive. Finding balance is&nbsp;easy.",
    "Private balcony stillness mellows the mind. Finding balance is easy when the river itself sets the tempo of your voyage.",
  ],
  [
    "Get ready to&nbsp;face the&nbsp;day guided by&nbsp;your personal trainer in&nbsp;our modern fitness center. Exercise at&nbsp;your convenience, because the&nbsp;gym is&nbsp;just a&nbsp;few steps away, right up&nbsp;the&nbsp;stairs",
    "Smart entertainment and suite systems wait a few steps from your bed: LED screens, climate, and quiet modern comfort shaped for Nile nights.",
  ],
  [
    "Do&nbsp;you sense the&nbsp;aroma of&nbsp;espresso adorned with&nbsp;creamy milk foam? Now you can experience your favorite flavors without&nbsp;leaving the&nbsp;house. Cozy up&nbsp;on&nbsp;the&nbsp;terrace of&nbsp;our wellness-caf&eacute; and relax to&nbsp;the&nbsp;sounds of&nbsp;ambient music.",
    "Tea and coffee facilities wait in your suite. Cozy up with a quiet pour as ambient river sounds replace the city: a private café of one aboard Hathor.",
  ],
  ["Essence of&nbsp;Self-Care", "Essence of&nbsp;Suite Comfort"],
  [
    "Here, nature merges with&nbsp;architecture and becomes an&nbsp;integral part of&nbsp;your home. Nature takes the&nbsp;spotlight, embodied in&nbsp;the&nbsp;painterly curves of&nbsp;our gardens and the&nbsp;green silhouettes of&nbsp;the&nbsp;fa&ccedil;ade terraces. Nature becomes your companion on&nbsp;meditative walks and at&nbsp;family gatherings, providing a&nbsp;soothing backdrop.",
    "Here, the Nile becomes part of&nbsp;your suite. River light fills panoramic windows; temple banks and soft water become the&nbsp;backdrop to morning coffee, afternoon stillness, and evenings of&nbsp;quiet conversation.",
  ],
  ["Lightness of&nbsp;Breathing", "Lightness of&nbsp;the Nile"],
  ["Essence of&nbsp;Contemplation", "Essence of&nbsp;River Light"],
  [
    "3 minute walk to&nbsp;Nature Park",
    "8 Luxury Cabins &amp; Suites",
  ],
  [
    "9 minute walk to&nbsp;the embankment",
    "2 Elegant Suites",
  ],
  [
    "16 minutes by car to&nbsp;the MIBC",
    "2 Magnificent Royal Suites",
  ],
  [
    "Easy access to&nbsp;Nature Park. Landscapes of&nbsp;watercolor tenderness that belong only to&nbsp;you.",
    "Sail between Luxor and Aswan. Landscapes of river light and temple banks that belong only to&nbsp;your voyage.",
  ],
  ["Inspired Architecture", "Inspired Nile Craft"],
  [
    "A&nbsp;standalone crystal building soaring above&nbsp;the&nbsp;treetops. Secluded tower resembling a&nbsp;glassy waterfall with&nbsp;flowing cascades of&nbsp;greenery-framed loggia.",
    "Handcrafted Dahabiya elegance on&nbsp;the&nbsp;water. Suites shaped with Egyptian artistry, modern comfort, and windows that open onto the eternal Nile.",
  ],
  ["Collection of&nbsp;premium living spaces", "Collection of&nbsp;Nile sanctuaries"],
  ["Search flats", "Explore rooms"],
  ["Available soon", "View suites"],
  ["Beauty in&nbsp;the Essence of&nbsp;Things", "Beauty in&nbsp;the Essence of&nbsp;Suite Life"],
  ["Beauty in the Essence of Things", "Beauty in the Essence of Suite Life"],
  ["Contact us", "Book Now"],
  ["Submit a request", "Request availability"],
  ["Request a callback", "Request availability"],
  ["резиденции", "Suites"],
];

for (const [from, to] of suitesCopy) {
  html = html.split(from).join(to);
}

/** Heading-only swaps — match visible g1/h2 text nodes, not class/plugin names. */
const headingSwaps = [
  [/(<(?:h1|h2|p)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Wellness(\s*<\/)/gi, "$1Comfort$2"],
  [/(<(?:h1|h2|p)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Nature(\s*<\/)/gi, "$1The Nile$2"],
  [/(<(?:h1|h2|p)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Place(\s*<\/)/gi, "$1Voyage$2"],
  [/(<(?:h1|h2)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Design(\s*<\/)/gi, "$1Craft$2"],
  [/(<(?:h1|h2|p)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Residences(\s*<\/)/gi, "$1Suites$2"],
  [/(<(?:h1|h2|p)[^>]*class="[^"]*g1[^"]*"[^>]*>\s*)Interiors(\s*<\/)/gi, "$1Interiors$2"],
  [/(<(?:h2|p)[^>]*class="[^"]*(?:h2|g1)[^"]*"[^>]*>\s*)Flats(\s*<\/)/gi, "$1Luxury Rooms$2"],
  [/(<(?:h2|p)[^>]*>\s*)Townhouses(\s*<\/)/gi, "$1Luxury Suites$2"],
  [/(<(?:h2|p)[^>]*>\s*)Penthouses(\s*<\/)/gi, "$1Royal Suites$2"],
];

for (const [re, to] of headingSwaps) {
  html = html.replace(re, to);
}

// Wellness tab labels (visible button text only)
html = html
  .replace(/(>\s*)Spa(\s*<)/g, "$1Shower$2")
  .replace(/(>\s*)Yoga(\s*<)/g, "$1Balcony$2")
  .replace(/(>\s*)Fitness(\s*<)/g, "$1Smart TV$2")
  .replace(/(>\s*)Café(\s*<)/g, "$1Minibar$2")
  .replace(/(>\s*)Cafe(\s*<)/g, "$1Minibar$2");

// Nav / CTA labels that are whole button texts
html = html
  .replace(/(class="btn__text[^"]*"[^>]*>\s*)Residences(\s*<)/gi, "$1Suites$2")
  .replace(/(class="btn__text[^"]*"[^>]*>\s*)Menu(\s*<)/gi, "$1Explore$2");

const moreCopy = [
  [
    "Enjoy nature&rsquo;s embrace that shields you from&nbsp;the&nbsp;world outside. Climbing rooftop plants, winding layouts of&nbsp;flowerbeds, emerald lawns. Springs lets you learn the&nbsp;art of&nbsp;leisure.",
    "Enjoy the Nile&rsquo;s embrace that shields you from&nbsp;the&nbsp;world outside. Soft banks, temple silhouettes, gold water at dusk. Hathor lets you learn the&nbsp;art of&nbsp;leisure afloat.",
  ],
  [
    "Landscaped terraces with&nbsp;topiary trees, framed with&nbsp;glass, create the&nbsp;atmosphere of&nbsp;a&nbsp;miniature park floating above&nbsp;the&nbsp;City.",
    "Panoramic suite windows, framed with river light, create the atmosphere of a private horizon floating above the Nile.",
  ],
  [
    "Shady leafy-coniferous garden that evokes winding paths, branchy trees, and sunlit glades of&nbsp;forests surrounding the&nbsp;City.",
    "Quiet suite interiors that evoke cool retreats, handcrafted detail, and sunlit Nile glades beyond the glass.",
  ],
  [
    "Artfully designed recreation areas that delight you with&nbsp;diverse botanical decor: cascading garlands of&nbsp;runners, asymmetrical lawns, and exotic flowers.",
    "Artfully designed suite spaces that delight you with Egyptian craft, soft textiles, and the living panorama of the river outside.",
  ],
  [
    "Springs is&nbsp;situated in&nbsp;the&nbsp;prestigious Western District of&nbsp;the&nbsp;capital, surrounded by&nbsp;parks and close to&nbsp;the&nbsp;embankment. It&nbsp;is&nbsp;adjacent to&nbsp;the&nbsp;highway, one of&nbsp;the&nbsp;most ecological areas of&nbsp;the&nbsp;City.",
    "Hathor sails the classic Luxor to Aswan corridor of the Nile, surrounded by temples and close to the riverbanks that shaped ancient Egypt: a private Dahabiya route of rare stillness.",
  ],
  [
    "Breathe in&nbsp;the&nbsp;air and open space. Do&nbsp;you feel like&nbsp;running? Don&rsquo;t hold back. As&nbsp;you are running along&nbsp;the&nbsp;embankment, delight in&nbsp;the&nbsp;kaleidoscope of&nbsp;shifting panoramas that will leave you impressed. Set your pace and change it&nbsp;at&nbsp;your desire.",
    "Breathe in&nbsp;the&nbsp;river air and open space. As Hathor glides, delight in&nbsp;the&nbsp;kaleidoscope of&nbsp;shifting panoramas from Luxor to Aswan. Set your pace to three, four, or seven nights, and change it&nbsp;at&nbsp;your desire.",
  ],
  [
    "Each floor reflects boundless perspectives in&nbsp;its glistening waves, inviting you to&nbsp;look farther with&nbsp;a&nbsp;fuller palette of&nbsp;possibilities.",
    "Each suite reflects boundless Nile perspectives in its panoramic windows, inviting you to look farther with a fuller palette of voyage possibilities.",
  ],
  [
    "Tabanlioglu, the&nbsp;renowned architectural bureau, emphasizes the&nbsp;bold asymmetry of&nbsp;balconies in&nbsp;a&nbsp;chessboard pattern. Three vertical partitions divide the&nbsp;translucent façade, creating the&nbsp;effect of&nbsp;weightless volume. Freedom of&nbsp;expression, elegance of&nbsp;intelligence, and visual lightness.",
    "Hathor&rsquo;s suite craft emphasizes panoramic glass, private balconies, and calm volume. Timeless Egyptian charm meets modern comfort: freedom of rest, elegance of detail, and visual lightness on the water.",
  ],
  [
    "Our designs are chosen with&nbsp;a&nbsp;delicate treatment of&nbsp;materials and time; time that will soon become history, a&nbsp;story of&nbsp;family generations. Natural stone, warm wood, aged metal, and textured textiles. This is how we create a&nbsp;visual and tactile space for&nbsp;authentically high-class comfort.",
    "Our suites are chosen with a delicate treatment of materials and time; time that becomes a Nile memory. Warm woods, soft textiles, and modern suite systems. This is how we create a visual and tactile space for authentically high-class comfort afloat.",
  ],
  [
    "The&nbsp;acclaimed Quadro Room studio collaborated with&nbsp;UNIQ Development to&nbsp;create exquisitely refined finishing style, in&nbsp;which natural beauty seamlessly flows from&nbsp;today to&nbsp;tomorrow and remains timeless. Each residence offers a&nbsp;complete turnkey experience, so that you can enjoy the&nbsp;beauty of&nbsp;your new life from&nbsp;the&nbsp;very first moments. Muted palette, arched portals, smooth curves. Refinement is the&nbsp;new luxury.",
    "Each Hathor suite offers a complete turnkey sanctuary, so you can enjoy refined Nile living from the very first moments aboard. Muted palette, soft curves, panoramic glass. Refinement is the new luxury on the Dahabiya.",
  ],
  [
    "Here you can save your favorite residences.",
    "Here you can save your favorite suites.",
  ],
  ["138 view flats", "12 Luxury Cabins &amp; Suites"],
  ["138 view Flats", "12 Luxury Cabins &amp; Suites"],
  ["up to 3.1 m", "up to 56 m²"],
  ["62-347 m<sup>2</sup> area", "22 to 56 m<sup>2</sup> suites"],
  ["5 townhouses", "2 Elegant Suites"],
  ["7 penthouses", "2 Royal Suites"],
];

for (const [from, to] of moreCopy) {
  html = html.split(from).join(to);
}

// Hero gallery: keep Springs bottom-right title slot; drop only the small lead copy.
html = html.replace(
  /(<div class="l-gallery__caption pr-layout">)\s*<div class="col col--xs-3 col--md-3 col--xxxl-2 offset--md-2 pl-layout pl-0:md pt-7:md">[\s\S]*?<\/div>\s*(<div class="l-gallery__title col col--md-6 text-right">[\s\S]*?<\/div>)/i,
  `$1
                $2`,
);
// If a prior build parked the title left, restore Springs right placement.
html = html.replace(
  /<div class="l-gallery__title col col--xs-3 col--md-3 col--xxxl-2 offset--md-2 pl-layout pl-0:md pt-7:md text-left">/i,
  `<div class="l-gallery__title col col--md-6 text-right">`,
);

html = html.replace(
  /Visual representations of&nbsp;the&nbsp;property[\s\S]*?rights holder\./g,
  "Suite imagery and descriptions are curated for illustration. Availability, itineraries, and pricing are confirmed with Hathor&rsquo;s reservations desk. All Hathor content and design remain protected.",
);

function replaceAssetPattern(assetPattern, url) {
  const remoteSource = String.raw`(?:https?:)?\/\/[^"'\s>]*${assetPattern}[^"'\s>]*`;
  const localSource = String.raw`\/assets\/images\/media\/${assetPattern}[^"'\s>]*`;
  html = html
    .replace(new RegExp(remoteSource, "g"), url)
    .replace(new RegExp(localSource, "g"), url);
}

[
  // Preloader + scroll intro hero must be the Suites hero (not a secondary suite still).
  ["landing\\/0\\.preloader\\/", MEDIA.hero],
  ["landing\\/1\\.intro\\/intro-image", MEDIA.hero],
  ["landing\\/1\\.intro\\/opening-1", MEDIA.suites],
  ["landing\\/1\\.intro\\/opening-2", MEDIA.rooms],
  ["landing\\/1\\.intro\\/opening-3", MEDIA.royal],
  ["landing\\/1\\.intro\\/", MEDIA.hero],
  ["landing\\/2\\.wellness\\/", MEDIA.lux1],
  ["landing\\/3\\.nature\\/nature-caption", MEDIA.lux2],
  ["landing\\/3\\.nature\\/nature-slider-md-1", MEDIA.royal2],
  ["landing\\/3\\.nature\\/nature-slider-xs-1", MEDIA.royal2],
  ["landing\\/3\\.nature\\/nature-slider-md-2", MEDIA.royal4],
  ["landing\\/3\\.nature\\/nature-slider-xs-2", MEDIA.royal4],
  ["landing\\/3\\.nature\\/nature-slider-md-3", MEDIA.royal6],
  ["landing\\/3\\.nature\\/nature-slider-xs-3", MEDIA.royal6],
  ["landing\\/3\\.nature\\/", MEDIA.cabin6],
  ["landing\\/4\\.place\\/place-caption-1", MEDIA.rooms],
  ["landing\\/4\\.place\\/place-caption-3", MEDIA.suites],
  ["landing\\/4\\.place\\/place-bg", MEDIA.hero],
  ["landing\\/4\\.place\\/", MEDIA.luxury],
  ["landing\\/5\\.map\\/", MEDIA.suites],
  ["landing\\/6\\.design\\/", MEDIA.lux3],
  ["landing\\/7\\.residence\\/residence-1", MEDIA.rooms],
  ["landing\\/7\\.residence\\/residence-xs-1", MEDIA.rooms],
  ["landing\\/7\\.residence\\/residence-2", MEDIA.suites],
  ["landing\\/7\\.residence\\/residence-xs-2", MEDIA.suites],
  ["landing\\/7\\.residence\\/residence-3", MEDIA.royal],
  ["landing\\/7\\.residence\\/residence-xs-3", MEDIA.royal],
  ["landing\\/7\\.residence\\/", MEDIA.suites],
  ["landing\\/8\\.interiors\\/", MEDIA.lux5],
  ["landing\\/callback\\/", MEDIA.lux2],
].forEach(([pattern, url]) => replaceAssetPattern(pattern, url));

// Springs Place sticky panels + nature caption use Vimeo. Preserve the exact
// iframe node/attributes expected by Springs motion code and swap only the
// frame document's media for a Hathor still.
const vimeoToSuite = {
  "1044257468": MEDIA.suites,
  "1044257440": MEDIA.rooms,
  "1086358928": MEDIA.royal,
  "1086359012": MEDIA.lux4,
};
html = html.replace(
  /<iframe\b([^>]*?)\bsrc="https:\/\/player\.vimeo\.com\/video\/(\d+)\?[^"]*"([^>]*)>[\s\S]*?<\/iframe>/gi,
  (_match, beforeSrc, id, afterSrc) => {
    const url = vimeoToSuite[id] || MEDIA.hero;
    const frameDocument =
      `<!doctype html><html><head><style>` +
      `html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#f5eacf}` +
      `img{display:block;width:100%;height:100%;object-fit:cover}` +
      `</style></head><body><img src="${url}" alt=""></body></html>`;
    const srcdoc = frameDocument
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;");
    return `<iframe${beforeSrc} src="about:blank" srcdoc="${srcdoc}"${afterSrc}></iframe>`;
  },
);

// Gallery cards: keep every responsive source for a Springs card on the same
// Hathor image. Cycling per URL occurrence makes adjacent cards repeat and lets
// media-query changes swap their composition.
html = html.replace(
  /(?:(?:https?:)?\/\/[^"'\s>]*\/)?(?:assets\/images\/media\/)?landing\/0\.gallery\/gallery-(\d+)[^"'\s>]*/gi,
  (_match, sourceIndex) =>
    galleryCycle[(Math.max(1, Number(sourceIndex)) - 1) % galleryCycle.length],
);

// Any remaining springs media URLs → suite hero (absolute + protocol-relative)
html = html.replace(
  /(?:https?:)?\/\/springs\.(?:estate|house)\/(?:media|assets\/images\/media)\/[^"'\\\s>]+/gi,
  MEDIA.hero,
);

// Critical: broken protocol-relative media hosts (//media/hathor → /media/hathor)
// Must run BEFORE the runtime script is injected so script literals stay intact.
html = html
  .replaceAll("//media/hathor/", "/media/hathor/")
  .replaceAll("https://media/hathor/", "/media/hathor/")
  .replaceAll("http://media/hathor/", "/media/hathor/");

const suitesPalette = `
<style data-hathor-suites-palette>

  /*
   * TYPOGRAPHY ONLY — Suites editorial refinement.
   * Display = Gamgote · Script = Quiet Luxury · Body/Labels/UI = Plus Jakarta Sans
   * Gold (#B69F64) is accent. Body on cream uses warm ink. No layout/motion changes.
   */
${hathorFontFaces}
  :root {
    --suites-serif: "Gamgote", Georgia, serif;
    --suites-script: "Quiet Luxury", cursive;
    --suites-sans: "Plus Jakarta Sans", system-ui, sans-serif;
    --suites-gold: #b69f64;
    --suites-gold-soft: #d4bf86;
    --suites-gold-deep: #8b6914;
    --suites-cream: #f5eacf;
    --suites-cream-soft: #ece8df;
    --suites-cream-bright: #f7f1e6;
    --suites-ink: #1c1917;
    --suites-body: #1c1917;
    --suites-muted: #5c5348;
    --suites-on-media: #f7f1e6;
    --suites-on-media-body: rgba(247, 241, 230, 0.94);
    --suites-title-on-media: #f7f1e6;
    --suites-ink-soft: rgba(28, 25, 23, 0.78);
    /* Pass 02 — visually tuned (not max of the original range) */
    --type-display-hero: clamp(3.25rem, 5.8vw, 7rem);
    --type-display-section: clamp(2.4rem, 4.1vw, 4.5rem);
    --type-display-secondary: clamp(1.6rem, 2.45vw, 2.7rem);
    --type-script-lg: clamp(1.15rem, 1.45vw, 1.85rem);
    --type-lead: clamp(1.125rem, 1.3vw, 1.3rem);
    --type-body: clamp(1.0625rem, 1.15vw, 1.175rem);
    --type-label: clamp(0.68rem, 0.76vw, 0.78rem);
    --type-button: clamp(0.74rem, 0.8vw, 0.82rem);
    --tracking-label: 0.16em;
    --tracking-button: 0.14em;
    --leading-display: 0.93;
    --leading-section: 0.98;
    --leading-body: 1.72;
    --lux-gold: #b69f64;
    --lux-gold-rgb: 182, 159, 100;
    --lux-cream: #f5eacf;
    --lux-cream-rgb: 245, 234, 207;
    --lux-beige: #ece8df;
    --lux-beige-rgb: 236, 232, 223;
    --c-beige-background: #f5eacf;
    --c-beige-background-rgb: 245, 234, 207;
    --c-beige: #f5eacf;
    --c-beige-rgb: 245, 234, 207;
    --c-dark-green: #8b6914;
    --c-dark-green-rgb: 139, 105, 20;
    --c-green: #b69f64;
    --c-green-rgb: 182, 159, 100;
    --c-light-green: #d4bf86;
    --c-light-green-rgb: 212, 191, 134;
    --c-olive: #b69f64;
    --c-olive-rgb: 182, 159, 100;
    --c-dark-blue: #8b6914;
    --c-dark-blue-rgb: 139, 105, 20;
    --c-blue: #b69f64;
    --c-blue-rgb: 182, 159, 100;
    --c-light-blue: #f5eacf;
    --c-light-blue-rgb: 245, 234, 207;
    --c-sky: #f5eacf;
    --c-sky-rgb: 245, 234, 207;
    --c-white: #f5eacf;
    --c-white-rgb: 245, 234, 207;
    --c-black: #8b6914;
    --c-black-rgb: 139, 105, 20;
    --cookie-height: 0px;
    --tooltip-shadow: 0 18px 48px rgba(182, 159, 100, 0.28);
    --c-button-hover-gradient: linear-gradient(101.51deg, rgba(182, 159, 100, 0) 37.02%, #b69f64 308.4%);
    --c-button-hover-gradient-dark: linear-gradient(91.82deg, rgba(245, 234, 207, 0) 0%, #b69f64 100%);
  }
  html, body {
    background: var(--suites-cream);
    color: var(--suites-ink);
    font-family: var(--suites-sans);
    font-size: 17px;
    line-height: var(--leading-body);
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* 01 — Hero display (Gamgote) */
  .h0,
  .l-gallery__title .h0 {
    font-family: var(--suites-serif) !important;
    font-weight: 400 !important;
    font-size: var(--type-display-hero) !important;
    line-height: var(--leading-display) !important;
    letter-spacing: -0.02em !important;
    text-wrap: balance;
  }

  /* 02 — Section display (Gamgote) */
  .g1,
  .g2,
  [class*="__title"] .g1,
  .l-nature-bg-caption .g1,
  .l-nature__caption .g1,
  .l-wellness__caption .g1,
  .l-place__caption .g1,
  .l-intro .g1,
  .l-residence .g1,
  .l-design .g1,
  .l-interiors .g1 {
    font-family: var(--suites-serif) !important;
    font-weight: 400 !important;
    font-size: var(--type-display-section) !important;
    line-height: var(--leading-section) !important;
    letter-spacing: -0.02em !important;
    text-wrap: balance;
  }

  /* Secondary Gamgote titles */
  .h1,
  .h2,
  h1:not(.h0),
  h2,
  [class*="__title"] .h1,
  [class*="__title"] .h2,
  [class*="__title"] h1:not(.h0),
  [class*="__title"] h2 {
    font-family: var(--suites-serif) !important;
    font-weight: 400 !important;
    font-size: var(--type-display-secondary) !important;
    line-height: 1.04 !important;
    letter-spacing: -0.018em !important;
    text-wrap: balance;
  }

  /* 04 — Editorial lead (long h3 blocks are lead copy, not display) */
  .h3,
  h3,
  .l-intro__opening-subtitle {
    font-family: var(--suites-sans) !important;
    font-weight: 400 !important;
    font-size: var(--type-lead) !important;
    line-height: 1.68 !important;
    letter-spacing: 0.005em !important;
    text-transform: none !important;
    max-width: 36em;
  }

  /*
   * ============================================================
   * PASS 03 — SECTION TEXT COMPOSITIONS (art direction)
   * Photography / section geometry locked. Text groups only.
   * ============================================================
   */

  /* HERO — COMPOSITION C: lower-left editorial stack
     Pass 04: optically lift + nudge right; tighter wrap for River/Suites. */
  .l-gallery__caption {
    pointer-events: none;
  }
  .l-gallery__caption .l-gallery__title {
    left: clamp(1.65rem, 6.8vw, 5.75rem) !important;
    right: auto !important;
    bottom: clamp(2.75rem, 13.5vh, 6.75rem) !important;
    top: auto !important;
    text-align: left !important;
    max-width: min(42vw, 9.25em);
    z-index: 4;
    transform: translate(10px, -18px) !important;
  }
  .l-gallery__caption .l-gallery__title .h0 {
    text-align: left !important;
    font-size: clamp(2.75rem, 4.35vw, 5.25rem) !important;
    line-height: 0.93 !important;
    letter-spacing: -0.02em !important;
  }

  /* INTRO OPENING — COMPOSITION A: unified upper-left title + body
     Pass 04: controlled title→lead air; lead ≤ title visual width. */
  .l-intro.is-hidden--md-down .l-intro__opening {
    position: absolute !important;
    left: clamp(1.5rem, 6vw, 5rem) !important;
    top: clamp(5.25rem, 13vh, 8rem) !important;
    right: auto !important;
    bottom: auto !important;
    width: min(36vw, 30rem) !important;
    max-width: 30rem !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: 0 !important;
    z-index: 5;
    margin: 0 !important;
    padding: 0 !important;
    transform: translateX(8px) !important;
  }
  .l-intro.is-hidden--md-down .l-intro__opening > .col {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    float: none !important;
    flex: 0 0 auto !important;
    min-height: 0 !important;
    height: auto !important;
  }
  .l-intro.is-hidden--md-down .l-intro__opening > .col:first-child {
    position: relative !important;
  }
  /* Pin lead under title so row/col geometry cannot invent a giant gap */
  .l-intro.is-hidden--md-down .l-intro__opening > .col:last-child {
    position: absolute !important;
    left: 0 !important;
    top: 5.1rem !important;
    right: auto !important;
    bottom: auto !important;
  }
  .l-intro.is-hidden--md-down .l-intro__opening .h1 {
    max-width: 11.5em;
  }
  .l-intro.is-hidden--md-down .l-intro__opening-subtitle {
    margin-top: 0 !important;
    max-width: 22em !important;
    width: 100% !important;
    line-height: 1.62 !important;
  }

  /* INTRO CONTENT — COMPOSITION E: title high-left / body low-left
     Pass 04: reduce vertical disconnect; keep intentional separation. */
  .l-intro.is-hidden--md-down .l-intro__content .l-intro__content-title {
    position: absolute !important;
    left: clamp(1.5rem, 6vw, 5rem) !important;
    top: clamp(4.5rem, 13vh, 7.5rem) !important;
    bottom: auto !important;
    right: auto !important;
    width: min(36vw, 26rem) !important;
    max-width: 26rem !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: translateX(8px) !important;
    z-index: 4;
  }
  .l-intro.is-hidden--md-down .l-intro__content .l-intro__content-text {
    position: absolute !important;
    left: clamp(1.5rem, 6vw, 5rem) !important;
    /* Keep intentional air under the title, but stay on-canvas when pinned */
    bottom: clamp(4rem, 34vh, 15rem) !important;
    top: auto !important;
    right: auto !important;
    width: min(32vw, 24rem) !important;
    max-width: 24rem !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: translateX(8px) !important;
    z-index: 4;
  }
  .l-intro.is-hidden--md-down .l-intro__content .l-intro__content-text p,
  .l-intro.is-hidden--md-down .l-intro__content .l-intro__content-text .text-t1 {
    line-height: 1.62 !important;
    max-width: 34em !important;
  }

  /* WELLNESS / COMFORT — COMPOSITION B: body upper-left + title lower-right
     Pass 04: lockup script+title; ivory script on gold stage for contrast. */
  #wellness .l-wellness__webgl-caption > p.text-t1 {
    position: absolute !important;
    left: clamp(1.5rem, 6vw, 5rem) !important;
    top: clamp(5.5rem, 16vh, 9rem) !important;
    right: auto !important;
    bottom: auto !important;
    width: min(26vw, 20rem) !important;
    max-width: 20rem !important;
    margin: 0 !important;
    transform: translateX(8px) !important;
    z-index: 4;
    line-height: 1.62 !important;
  }
  #wellness .l-wellness__webgl-title {
    position: absolute !important;
    left: auto !important;
    right: clamp(1.5rem, 6vw, 5rem) !important;
    bottom: clamp(2.5rem, 10vh, 5.25rem) !important;
    top: auto !important;
    width: max-content !important;
    max-width: min(42vw, 16rem) !important;
    margin: 0 !important;
    text-align: right !important;
    transform: translate(-6px, -12px) !important;
    z-index: 4;
  }
  #wellness .l-wellness__webgl-title .text-c1 {
    font-family: "Quiet Luxury", cursive !important;
    font-size: clamp(1.2rem, 1.55vw, 1.95rem) !important;
    font-weight: 400 !important;
    letter-spacing: 0.02em !important;
    text-transform: none !important;
    line-height: 1.2 !important;
    /* Gold field: ivory signature reads; antique gold would vanish */
    color: #f7f1e6 !important;
    -webkit-text-fill-color: #f7f1e6 !important;
    opacity: 0.92;
    margin-bottom: 0.18rem !important;
    --fos: 0.22em;
    --foe: 0.28em;
    display: block !important;
  }
  #wellness .l-wellness__webgl-title .g1 {
    margin: 0 !important;
    font-size: clamp(2.35rem, 3.6vw, 3.85rem) !important;
  }

  /* WELLNESS SLIDER — titles stay right; body sits lower-left of caption
     Pass 04: editorial rail spacing; body quieter. */
  .l-wellness__slider__caption-titles {
    padding-top: clamp(1.75rem, 5vh, 3rem) !important;
  }
  .l-wellness__slider__caption-titles .g1,
  .l-wellness__slider__caption-titles h2,
  .l-wellness__slider__caption-titles h3 {
    letter-spacing: -0.01em !important;
    line-height: 1.15 !important;
  }
  .l-wellness__slider__caption-text {
    left: clamp(1.5rem, 5vw, 4rem) !important;
    right: auto !important;
    bottom: clamp(1.85rem, 7vh, 3.75rem) !important;
    width: min(34vw, 24rem) !important;
    max-width: 24rem !important;
    transform: translateX(8px) !important;
  }
  .l-wellness__slider__caption-text p,
  .l-wellness__slider__caption-text .text-t1 {
    line-height: 1.6 !important;
  }

  /* NATURE / THE NILE — COMPOSITION C: lower-left connected stack
     Pass 04: fix script overlapping Gamgote; calm magazine cover rhythm. */
  #nature .l-nature-bg-caption,
  .l-nature-bg-item .l-nature-bg-caption {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-end !important;
    align-items: flex-start !important;
    padding: 0 0 clamp(2.5rem, 9vh, 5rem) clamp(1.65rem, 6.5vw, 5.25rem) !important;
    box-sizing: border-box !important;
    transform: translateX(8px) !important;
  }
  #nature .l-nature-bg-caption .g1,
  .l-nature-bg-item .l-nature-bg-caption .g1 {
    position: relative !important;
    margin: 0 !important;
    font-size: clamp(2.2rem, 3.5vw, 3.85rem) !important;
    max-width: 10em;
  }
  #nature .l-nature-bg-caption .mt-1,
  .l-nature-bg-item .l-nature-bg-caption .mt-1 {
    margin-top: 0.7rem !important;
    margin-bottom: 0 !important;
  }
  #nature .l-nature-bg-caption__subtitle,
  .l-nature-bg-item .l-nature-bg-caption__subtitle {
    font-size: clamp(1.15rem, 1.4vw, 1.75rem) !important;
  }
  #nature .l-nature-bg-caption__text,
  .l-nature-bg-item .l-nature-bg-caption__text {
    position: relative !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
    margin: 1.35rem 0 0 !important;
    width: min(30vw, 24rem) !important;
    max-width: 24rem !important;
    transform: none !important;
  }
  #nature .l-nature-bg-caption__text p,
  #nature .l-nature-bg-caption__text .text-t1,
  .l-nature-bg-item .l-nature-bg-caption__text p {
    line-height: 1.62 !important;
  }

  /* PLACE / VOYAGE — COMPOSITION B variant: right-anchored title/script/body
     Pass 04: optical right edge; closer title↔body relationship. */
  .l-place-webgl-caption {
    position: absolute !important;
    top: clamp(4.25rem, 11vh, 7rem) !important;
    right: clamp(1.65rem, 5.75vw, 4.75rem) !important;
    left: auto !important;
    bottom: auto !important;
    width: min(34vw, 20rem) !important;
    max-width: 20rem !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: right !important;
    z-index: 4;
    transform: translateX(-8px) !important;
  }
  .l-place-webgl-caption .g1 {
    margin-left: auto !important;
    text-align: right !important;
    font-size: clamp(2.2rem, 3.5vw, 3.85rem) !important;
  }
  .l-place-webgl-caption__subtitle {
    margin-left: auto !important;
    margin-top: 0.55rem !important;
    text-align: right !important;
    font-size: clamp(1.15rem, 1.4vw, 1.75rem) !important;
  }
  .l-place-webgl__text {
    position: absolute !important;
    right: clamp(1.65rem, 5.75vw, 4.75rem) !important;
    left: auto !important;
    bottom: clamp(2.75rem, 12vh, 6rem) !important;
    top: auto !important;
    width: min(30vw, 22rem) !important;
    max-width: 22rem !important;
    margin: 0 !important;
    text-align: right !important;
    z-index: 4;
    transform: translateX(-8px) !important;
  }
  .l-place-webgl__text p {
    margin-left: auto !important;
    max-width: 22em !important;
    line-height: 1.62 !important;
  }

  /* NATURE SLIDER CAPTION — lower-right safe area, optical tuck */
  .l-nature__slider-caption {
    right: clamp(1.65rem, 5.25vw, 4.25rem) !important;
    bottom: clamp(3.25rem, 13vh, 7.25rem) !important;
    left: auto !important;
    width: min(30vw, 22rem) !important;
    max-width: 22rem !important;
    transform: translateX(-6px) !important;
  }

  /* FOOTER CTA — left editorial closing statement
     Pass 04: more authority via type scale + rhythm, not layout. */
  .hathor-suites-footer-host .lux-footer__top,
  .hathor-lux-footer-host .lux-footer__top {
    text-align: left !important;
    padding-left: clamp(1.5rem, 6vw, 5rem) !important;
    padding-right: clamp(1.5rem, 6vw, 5rem) !important;
    max-width: 36rem;
  }
  .hathor-suites-footer-host .lux-footer__headline,
  .hathor-lux-footer-host .lux-footer__headline {
    font-size: clamp(2.1rem, 3.4vw, 3.35rem) !important;
    letter-spacing: -0.02em !important;
    line-height: 0.98 !important;
    max-width: 14em;
  }
  .hathor-suites-footer-host .lux-footer__subhead,
  .hathor-lux-footer-host .lux-footer__subhead {
    margin-top: 1.1rem !important;
    max-width: 28em !important;
    line-height: 1.62 !important;
  }
  .hathor-suites-footer-host .lux-footer__subscribe,
  .hathor-lux-footer-host .lux-footer__subscribe {
    margin-top: 1.75rem !important;
  }

  body,
  p:not(.g1):not(.g2):not(.h0):not(.h1):not(.h2):not(.h3):not([class*="__subtitle"]),
  .text-t1,
  .text-t2,
  .text-p1,
  .text-p2,
  .btn__text,
  .btn,
  li,
  label,
  input,
  textarea,
  select,
  [class*="__text"]:not(.g1):not(.h0):not(.h1),
  [class*="__caption"] p:not([class*="__subtitle"]),
  [class*="-caption__"] p:not([class*="__subtitle"]) {
    font-family: var(--suites-sans) !important;
  }

  /* 05 — Body copy */
  .text-t1,
  .text-t2,
  p:not(.g1):not(.g2):not(.h0):not(.h1):not(.h2):not(.h3):not(.text-c1):not(.text-c2):not(.l-intro__opening-subtitle):not([class*="__subtitle"]),
  [class*="__text"]:not(.g1):not(.h0):not(.h1),
  [class*="__caption"] p:not(.g1):not([class*="__subtitle"]),
  [class*="-caption__text"],
  [class*="-caption__"] p:not(.g1):not([class*="__subtitle"]) {
    font-size: var(--type-body) !important;
    line-height: var(--leading-body) !important;
    font-weight: 400 !important;
    letter-spacing: 0.01em;
    text-wrap: pretty;
    max-width: 38em;
  }

  /* 06 — Eyebrow / label (Plus Jakarta) — exclude script subtitles */
  .text-c1:not([class*="__subtitle"]),
  .text-c2:not([class*="__subtitle"]),
  .carousel__thumb__item.text-c1 {
    font-family: var(--suites-sans) !important;
    font-size: var(--type-label) !important;
    font-weight: 500 !important;
    letter-spacing: var(--tracking-label) !important;
    text-transform: uppercase !important;
    line-height: 1.35 !important;
  }

  /*
   * 03 — Quiet Luxury script (signature, never equal to Gamgote).
   * Must outrank body p:not(...) chains — those accumulate :not() class weight.
   */
  p.l-nature-bg-caption__subtitle.text-c1.leading-trim,
  p.l-wellness__caption__subtitle.text-c1.leading-trim,
  p.l-place__caption__subtitle.text-c1.leading-trim,
  p.l-place-webgl-caption__subtitle.text-c1.leading-trim,
  p.l-nature-bg-caption__subtitle.text-c1,
  p.l-wellness__caption__subtitle.text-c1,
  p.l-place__caption__subtitle.text-c1,
  p.l-place-webgl-caption__subtitle.text-c1,
  p.l-nature-bg-caption__subtitle,
  p.l-wellness__caption__subtitle,
  p.l-place__caption__subtitle,
  p.l-place-webgl-caption__subtitle {
    font-family: "Quiet Luxury", cursive !important;
    font-size: var(--type-script-lg) !important;
    font-weight: 400 !important;
    letter-spacing: 0.015em !important;
    text-transform: none !important;
    line-height: 1.15 !important;
    color: var(--suites-gold) !important;
    -webkit-text-fill-color: var(--suites-gold) !important;
    /* Signature line — never a full-bleed wedding banner */
    max-width: 16em;
    width: max-content;
    /* leading-trim collapses script metrics — neutralize on script only */
    --fos: 0.18em;
    --foe: 0.22em;
    margin-bottom: 0.15em !important;
  }
  p.l-nature-bg-caption__subtitle.leading-trim:before,
  p.l-wellness__caption__subtitle.leading-trim:before,
  p.l-place__caption__subtitle.leading-trim:before,
  p.l-place-webgl-caption__subtitle.leading-trim:before,
  p.l-nature-bg-caption__subtitle.leading-trim:after,
  p.l-wellness__caption__subtitle.leading-trim:after,
  p.l-place__caption__subtitle.leading-trim:after,
  p.l-place-webgl-caption__subtitle.leading-trim:after {
    margin-bottom: 0 !important;
    margin-top: 0 !important;
  }

  /* Opening subtitle is lead copy — never gold jewellery paragraphs */
  .l-intro__opening-subtitle.text-c1,
  .l-intro__opening-subtitle.text-color-primary,
  .l-intro__opening-subtitle {
    font-family: var(--suites-sans) !important;
    font-size: var(--type-lead) !important;
    font-weight: 400 !important;
    letter-spacing: 0.005em !important;
    text-transform: none !important;
    line-height: 1.68 !important;
    margin-top: 0.9rem;
    max-width: 34em;
  }

  /* 07 — Button typography only */
  .btn__text,
  .btn {
    font-family: var(--suites-sans) !important;
    font-size: var(--type-button) !important;
    font-weight: 500 !important;
    letter-spacing: var(--tracking-button) !important;
    text-transform: uppercase !important;
  }

  /* Stage tokens — keep existing stage surfaces; refine text roles only */
  .ui-dark {
    --t-background: #8b6914;
    --t-background-rgb: 139, 105, 20;
    --t-text: #f7f1e6;
    --t-text-rgb: 247, 241, 230;
    --t-heading: #f7f1e6;
    --t-heading-rgb: 247, 241, 230;
    --t-primary: #b69f64;
    --t-primary-rgb: 182, 159, 100;
    --t-secondary: #f5eacf;
    --t-secondary-rgb: 245, 234, 207;
    --t-line: rgba(245, 234, 207, 0.4);
    background-color: #8b6914 !important;
    color: #f7f1e6 !important;
  }
  .ui-light,
  .ui-light-background {
    --t-background: #f5eacf;
    --t-background-rgb: 245, 234, 207;
    --t-text: #1c1917;
    --t-text-rgb: 28, 25, 23;
    --t-heading: #1c1917;
    --t-heading-rgb: 28, 25, 23;
    --t-primary: #b69f64;
    --t-primary-rgb: 182, 159, 100;
    --t-secondary: #5c5348;
    --t-secondary-rgb: 92, 83, 72;
    --t-line: rgba(182, 159, 100, 0.35);
    background-color: #f5eacf !important;
    color: #1c1917 !important;
  }
  .ui-background.ui-dark,
  .ui-dark.ui-background {
    background-color: #8b6914 !important;
  }

  /* Dark / media: ivory titles, warm ivory body, gold accents */
  .ui-dark .h0,
  .ui-dark .h1,
  .ui-dark .h2,
  .ui-dark .g1,
  .ui-dark .g2,
  .ui-dark h1,
  .ui-dark h2,
  .ui-dark [class*="__title"],
  .ui-dark [class*="__title"] .h0,
  .ui-dark [class*="__title"] .g1 {
    color: #f7f1e6 !important;
    -webkit-text-fill-color: #f7f1e6 !important;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.22) !important;
  }
  .ui-dark .h3,
  .ui-dark h3,
  .ui-dark p,
  .ui-dark .text-t1,
  .ui-dark .text-t2,
  .ui-dark .text-p1,
  .ui-dark .text-p2,
  .ui-dark [class*="__text"],
  .ui-dark [class*="__caption"] p,
  .ui-dark [class*="-caption__"] p,
  .ui-dark .btn__text,
  .ui-dark .l-intro__opening-subtitle {
    color: rgba(247, 241, 230, 0.94) !important;
    -webkit-text-fill-color: rgba(247, 241, 230, 0.94) !important;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18) !important;
  }
  .ui-dark .text-c1,
  .ui-dark .text-c2,
  .ui-dark .btn,
  .ui-dark .text-color-primary {
    color: #b69f64 !important;
    -webkit-text-fill-color: #b69f64 !important;
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.16) !important;
  }

  /* Cream: warm ink body/titles; gold for labels + script only */
  .ui-light .h0,
  .ui-light .h1,
  .ui-light .h2,
  .ui-light .g1,
  .ui-light .g2,
  .ui-light h1,
  .ui-light h2,
  .ui-light [class*="__title"] {
    color: #1c1917 !important;
    -webkit-text-fill-color: #1c1917 !important;
    text-shadow: none !important;
  }
  .ui-light .h3,
  .ui-light h3,
  .ui-light p,
  .ui-light .text-t1,
  .ui-light .text-t2,
  .ui-light .text-p1,
  .ui-light .text-p2,
  .ui-light [class*="__text"],
  .ui-light [class*="__caption"],
  .ui-light .l-intro__opening-subtitle {
    color: #1c1917 !important;
    -webkit-text-fill-color: #1c1917 !important;
    text-shadow: none !important;
  }
  .ui-light .text-c1,
  .ui-light .text-c2,
  .ui-light .text-color-primary {
    color: #b69f64 !important;
    -webkit-text-fill-color: #b69f64 !important;
    text-shadow: none !important;
  }

  /* Photography captions */
  .l-nature-bg-caption .g1,
  .l-nature__caption .g1,
  .l-nature__slider-caption .g1,
  .l-wellness__caption .g1,
  .l-place__caption .g1,
  .preloader__content .g1,
  .preloader__content .h1,
  .l-gallery__title .h0 {
    color: #f7f1e6 !important;
    -webkit-text-fill-color: #f7f1e6 !important;
    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.24) !important;
  }
  .l-nature-bg-caption p:not([class*="__subtitle"]),
  .l-nature-bg-caption__text,
  .l-nature__caption p:not([class*="__subtitle"]),
  .l-nature__caption__text,
  .l-nature__slider-caption p:not([class*="__subtitle"]),
  .l-wellness__caption p:not([class*="__subtitle"]),
  .l-place__caption p:not([class*="__subtitle"]),
  .preloader__content p:not(.g1):not([class*="__subtitle"]) {
    color: rgba(247, 241, 230, 0.94) !important;
    -webkit-text-fill-color: rgba(247, 241, 230, 0.94) !important;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.18) !important;
  }
  .l-nature-bg-caption__subtitle,
  .l-wellness__caption__subtitle,
  .l-place__caption__subtitle,
  .l-place-webgl-caption__subtitle {
    color: #b69f64 !important;
    -webkit-text-fill-color: #b69f64 !important;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.18) !important;
  }
  .text-color-primary,
  .text-color-secondary,
  .color-primary {
    color: #b69f64 !important;
  }
  /*
   * Intro opening sits on light suite photography (cream walls).
   * Warm ink for title + lead — gold jewellery only for true accents.
   */
  .l-intro__opening .h1,
  .l-intro__opening .h1.text-color-primary,
  .l-intro__opening [data-reveal="title"],
  .ui-dark .l-intro__opening .h1,
  .ui-dark .l-intro__opening .h1.text-color-primary,
  .ui-light .l-intro__opening .h1,
  .ui-light .l-intro__opening .h1.text-color-primary {
    color: #1c1917 !important;
    -webkit-text-fill-color: #1c1917 !important;
    text-shadow: none !important;
  }
  .l-intro__opening-subtitle,
  .l-intro__opening-subtitle.text-color-primary,
  .l-intro__opening-subtitle.text-c1,
  .ui-dark .l-intro__opening-subtitle,
  .ui-dark .l-intro__opening-subtitle.text-color-primary,
  .ui-light .l-intro__opening-subtitle,
  .ui-light .l-intro__opening-subtitle.text-color-primary {
    color: rgba(28, 25, 23, 0.88) !important;
    -webkit-text-fill-color: rgba(28, 25, 23, 0.88) !important;
    text-shadow: none !important;
  }

  /* Title ↔ script rhythm — signature sits close under architecture */
  .l-nature-bg-caption .g1 + .l-nature-bg-caption__subtitle,
  .l-wellness__caption .g1 + .l-wellness__caption__subtitle,
  .l-place__caption .g1 + .l-place__caption__subtitle {
    margin-top: 0.35rem;
  }
  .l-intro__opening .h1 + .l-intro__opening-subtitle,
  .l-intro__opening .h2 + .l-intro__opening-subtitle,
  .l-intro__opening h2 + .l-intro__opening-subtitle {
    margin-top: 0.85rem;
  }

  /* Short section words (Comfort / The Nile) — keep breathable, not billboard */
  .l-wellness__caption .g1,
  .l-nature-bg-caption .g1,
  .l-nature__caption .g1,
  .l-place__caption .g1 {
    font-size: clamp(2.25rem, 3.8vw, 4.1rem) !important;
    letter-spacing: -0.015em !important;
    width: max-content;
    max-width: 12em;
  }

  @media (max-width: 1024px) and (min-width: 481px) {
    :root {
      --type-display-hero: clamp(2.9rem, 5.6vw, 5.4rem);
      --type-display-section: clamp(2.15rem, 4vw, 3.6rem);
      --type-display-secondary: clamp(1.5rem, 2.5vw, 2.35rem);
      --type-script-lg: clamp(1.15rem, 1.9vw, 1.85rem);
      --type-lead: clamp(1.1rem, 1.45vw, 1.25rem);
      --type-body: clamp(1.05rem, 1.3vw, 1.14rem);
    }
    /* Tablet: keep left hero; tighten opening width */
    .l-gallery__caption .l-gallery__title {
      left: clamp(1.25rem, 5.5vw, 3rem) !important;
      right: auto !important;
      bottom: clamp(1.75rem, 8vh, 3.5rem) !important;
      max-width: min(58vw, 11em);
    }
    .l-gallery__caption .l-gallery__title .h0 {
      font-size: clamp(2.75rem, 5.4vw, 4.75rem) !important;
      text-align: left !important;
    }
    .l-intro.is-hidden--md-down .l-intro__opening {
      width: min(52vw, 28rem) !important;
      top: clamp(5rem, 12vh, 7rem) !important;
    }
    #nature .l-nature-bg-caption__text,
    .l-nature-bg-item .l-nature-bg-caption__text {
      width: min(48vw, 26rem) !important;
    }
    .l-place-webgl-caption,
    .l-place-webgl__text {
      width: min(42vw, 22rem) !important;
    }
  }
  @media (max-width: 480px) {
    :root {
      --type-display-hero: clamp(2.9rem, 10.5vw, 3.55rem);
      --type-display-section: clamp(2.2rem, 7.4vw, 2.85rem);
      --type-display-secondary: clamp(1.45rem, 5.8vw, 1.95rem);
      --type-script-lg: clamp(1.2rem, 5.2vw, 1.7rem);
      --type-lead: 1.125rem;
      --type-body: 1.0625rem;
      --type-label: 0.7rem;
      --type-button: 0.75rem;
      --leading-display: 0.95;
      --leading-section: 1;
    }
    .l-gallery__caption .l-gallery__title .h0 {
      font-size: clamp(2.75rem, 10vw, 3.35rem) !important;
    }
    .l-wellness__caption .g1,
    .l-nature-bg-caption .g1,
    .l-nature__caption .g1,
    .l-place__caption .g1 {
      font-size: clamp(2.1rem, 7vw, 2.65rem) !important;
    }
    /* Phone: lower-left hero — art-directed, not raw 22px dump */
    .l-gallery__caption .l-gallery__title {
      position: absolute !important;
      left: 24px !important;
      right: auto !important;
      bottom: 36px !important;
      top: auto !important;
      max-width: min(78vw, 11em);
      margin: 0 !important;
      text-align: left !important;
      transform: none !important;
    }
    .l-gallery__caption .l-gallery__title .h0 {
      text-align: left !important;
      font-size: clamp(2.65rem, 9.5vw, 3.25rem) !important;
    }
    /* Phone intro mobile block — left stack */
    .l-intro.is-hidden--lg-up .l-intro__opening {
      padding-left: 24px !important;
      padding-right: 24px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .l-intro.is-hidden--lg-up .l-intro__opening > .col {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .l-intro.is-hidden--lg-up .l-intro__opening-subtitle {
      margin-top: 0.85rem !important;
      max-width: 22em !important;
      line-height: 1.6 !important;
    }
    /* Phone nature — left stack, body under title */
    .l-nature-bg-caption {
      align-items: flex-start !important;
      transform: none !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
      padding-bottom: 32px !important;
    }
    .l-nature-bg-caption .mt-1 {
      margin-top: 0.65rem !important;
    }
    .l-nature-bg-caption .g1,
    .l-nature-bg-caption__subtitle {
      text-align: left !important;
      margin-left: 0 !important;
      margin-right: auto !important;
    }
    .l-nature-bg-caption__text {
      position: relative !important;
      left: auto !important;
      right: auto !important;
      width: 100% !important;
      max-width: 34em !important;
      margin-top: 1.25rem !important;
    }
    /* Phone voyage — flip to left (desktop was right) */
    .l-place-webgl-caption {
      position: relative !important;
      top: auto !important;
      right: auto !important;
      left: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      text-align: left !important;
      padding: 0 22px !important;
    }
    .l-place-webgl-caption .g1,
    .l-place-webgl-caption__subtitle {
      text-align: left !important;
      margin-left: 0 !important;
      margin-right: auto !important;
    }
    .l-place-webgl__text {
      position: relative !important;
      right: auto !important;
      left: auto !important;
      bottom: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      text-align: left !important;
      padding: 0 22px 1.5rem !important;
      margin-top: 1.25rem !important;
    }
    .l-place-webgl__text p {
      margin-left: 0 !important;
    }
    #wellness-mobile .l-wellness__webgl-title,
    .l-wellness.is-hidden--lg-up .l-wellness__webgl-title {
      right: 22px !important;
      bottom: 24px !important;
      left: auto !important;
    }
    .hathor-suites-footer-host .lux-footer__top,
    .hathor-lux-footer-host .lux-footer__top {
      padding-left: 22px !important;
      padding-right: 22px !important;
    }
  }
/*
   * The shared Hathor navbar replaces Springs navigation. No other Springs
   * element is hidden or geometrically overridden.
   */
  .header, .cookie-consent {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  /* Keep Springs' responsive page usable in portrait tablet; the captured
     site otherwise covers it with a branded rotate-device interstitial. */
  .turn-message {
    display: none !important;
  }
  /*
   * Springs gallery sources are physically 3:4. Hathor replacements are
   * landscape, so pin the image itself to the source slot ratio; otherwise
   * intrinsic dimensions collapse every card and change all three lanes.
   */
  .l-gallery__item picture.img-full img {
    aspect-ratio: 3 / 4;
    object-fit: cover;
  }
  /*
   * Nature / wellness WebGL still paints Springs forest greens from baked
   * textures + shaders. Retint the canvases only — no layout/position change.
   */
  .js-nature-canvas,
  .js-wellness-canvas,
  .js-tree-canvas {
    filter: sepia(0.92) saturate(1.45) hue-rotate(-18deg) brightness(1.04)
      contrast(1.05);
  }
  .l-nature__gradient div,
  .l-wellness__gradient div,
  .l-gallery__gradient div,
  .l-nature-bg-gradient,
  .preloader__gradient div,
  .preloader__gradient-animation div,
  .footer__gradient div {
    background: radial-gradient(
      circle,
      rgba(182, 159, 100, 0.72) 0%,
      rgba(236, 232, 223, 0.42) 40%,
      rgba(245, 234, 207, 0) 74%
    ) !important;
  }
  /* Preloader: no logos — avoid flash on landing */
  .preloader__logo,
  .preloader__logo-mobile,
  .preloader .hathor-preloader-icon,
  .preloader__logo .header__logo__inner,
  .preloader__logo-mobile__item {
    display: none !important;
  }
  footer.footer {
    display: none !important;
  }
  /* Same cream host as PublicLayout / other iframe pages — no gold retint. */
  .hathor-suites-footer-scroll {
    display: block !important;
    background: #ece8df !important;
  }
  .hathor-lux-footer-host,
  .hathor-suites-footer-host {
    position: relative;
    z-index: 5;
    background: #ece8df;
  }
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__headline,
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__subhead,
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__subscribe,
  .hathor-lux-footer-host .lux-footer__col,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__headline,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__subhead,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__subscribe,
  .hathor-suites-footer-host .lux-footer__col {
    opacity: 1 !important;
    transform: none !important;
  }
</style>
<style data-hathor-lux-footer>
${luxFooterCss}
</style>`;

const hathorFooterHtml = getLuxFooterScrollSectionHtml();

const suitesRuntime = `
<script data-suites-media-runtime>
(() => {
  const FILE_TO_SLOT = {
    "suites-hero.webp": "scraped-suites-hero",
    "suites-hero.jpg": "scraped-suites-hero",
    "suites-luxury-rooms.webp": "scraped-suites-luxury-rooms",
    "suites-luxury-suites.webp": "scraped-suites-luxury-suites",
    "suites-royal.webp": "scraped-suites-royal",
    "luxsuite-1.webp": "scraped-luxsuite-1",
    "luxsuite-2.webp": "scraped-luxsuite-2",
    "luxsuite-3.webp": "scraped-luxsuite-3",
    "luxsuite-4.webp": "scraped-luxsuite-4",
    "luxsuite-5.webp": "scraped-luxsuite-5",
    "luxsuite-6.webp": "scraped-luxsuite-6",
    "cabin-1.webp": "scraped-cabin-1",
    "cabin-2.webp": "scraped-cabin-2",
    "cabin-3.webp": "scraped-cabin-3",
    "cabin-4.webp": "scraped-cabin-4",
    "cabin-5.webp": "scraped-cabin-5",
    "cabin-6.webp": "scraped-cabin-6",
    "royal-1.webp": "scraped-royal-1",
    "royal-2.webp": "scraped-royal-2",
    "royal-3.webp": "scraped-royal-3",
    "royal-4.webp": "scraped-royal-4",
    "royal-5.webp": "scraped-royal-5",
    "royal-6.webp": "scraped-royal-6",
    "royal-7.webp": "scraped-royal-7",
    "royal-8.webp": "scraped-royal-8",
    "room-suite.webp": "room-suite",
    "room-royal.webp": "room-royal",
    "room-luxury.webp": "room-luxury",
  };
  function normalizeMediaUrl(value) {
    if (typeof value !== "string") return value;
    return value.split(",").map(function (part) {
      var bits = part.trim().split(/\\s+/);
      var url = bits[0] || "";
      var marker = "media/hathor/";
      var idx = url.indexOf(marker);
      if (idx >= 0) bits[0] = "/" + url.slice(idx);
      return bits.join(" ");
    }).join(", ");
  }
  function isSpringsUrl(value) {
    return typeof value === "string" && /springs\\.(estate|house)/i.test(value);
  }
  function fileNameFromUrl(url) {
    if (typeof url !== "string") return "";
    try {
      var clean = url.split("?")[0].split("#")[0];
      var parts = clean.split("/");
      return (parts[parts.length - 1] || "").toLowerCase();
    } catch (e) {
      return "";
    }
  }
  function scrubUrls(root) {
    root.querySelectorAll("img, source").forEach((node) => {
      ["src", "srcset", "data-src", "data-srcset"].forEach((attr) => {
        const value = node.getAttribute(attr);
        if (!value) return;
        if (isSpringsUrl(value)) {
          node.removeAttribute(attr);
          return;
        }
        const next = normalizeMediaUrl(value);
        if (next !== value) node.setAttribute(attr, next);
      });
    });
  }
  function replaceAttrValue(value, images) {
    if (!value) return value;
    return value.split(",").map(function (part) {
      var bits = part.trim().split(/\\s+/);
      var url = bits[0] || "";
      var slot = FILE_TO_SLOT[fileNameFromUrl(url)];
      if (slot && images[slot]) bits[0] = images[slot];
      return bits.join(" ");
    }).join(", ");
  }
  function applyDashboardImages(images) {
    if (!images || typeof images !== "object") return;
    document.querySelectorAll("img, source").forEach((node) => {
      ["src", "srcset", "data-src", "data-srcset"].forEach((attr) => {
        const value = node.getAttribute(attr);
        if (!value) return;
        const next = replaceAttrValue(value, images);
        if (next && next !== value) {
          node.setAttribute(attr, next);
          const slot = FILE_TO_SLOT[fileNameFromUrl(value.split(",")[0])];
          if (slot) node.setAttribute("data-suites-slot", slot);
        }
      });
    });
    // Sticky video panels bake stills into iframe srcdoc — swap those too.
    document.querySelectorAll("iframe[srcdoc]").forEach((iframe) => {
      var doc = iframe.getAttribute("srcdoc");
      if (!doc) return;
      var next = doc;
      Object.keys(FILE_TO_SLOT).forEach(function (file) {
        var slot = FILE_TO_SLOT[file];
        var url = images[slot];
        if (!url) return;
        var escaped = file.replace(/\\./g, "\\\\.");
        var re = new RegExp(
          "(?:(?:https?:)?//[^\\\"&\\\\s]+)?/media/hathor/[^\\\"&\\\\s]*/" +
            escaped,
          "gi",
        );
        next = next.replace(re, url);
      });
      if (next !== doc) iframe.setAttribute("srcdoc", next);
    });
  }
  function revealSuitesMedia() {
    document.documentElement.classList.add("suites-media-ready", "js");
    document.documentElement.classList.remove("no-js");
  }
  function boot() {
    scrubUrls(document);
    fetch("/api/suites-config", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.images) applyDashboardImages(data.images);
      })
      .catch(function () {})
      .finally(revealSuitesMedia);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  window.addEventListener("load", () => scrubUrls(document), { once: true });
  setTimeout(() => scrubUrls(document), 1200);
})();
</script>`;

const suitesFontLinks = `
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
`;
html = html.replace(
  "</head>",
  `${suitesFontLinks}${suitesPalette}${suitesRuntime}</head>`,
);

// Preloader: strip logo markup so nothing flashes on landing.
html = html.replace(
  /(<div class="header__logo preloader__logo(?:\s+hathor-preloader-logo)?")[^>]*>[\s\S]*?(<\/div>\s*<\/div>\s*<div class="header__right)/i,
  '$1 aria-hidden="true"></div>\n\n            </div>\n\n            <div class="header__right',
);
html = html.replace(
  /(<div class="header__left preloader__logo-mobile(?:\s+hathor-preloader-logo)?")[^>]*>[\s\S]*?(<\/div>\s*<div class="header__center)/i,
  '$1 aria-hidden="true"></div>\n\n            <div class="header__center',
);

// Serve captured scripts/styles from this app
html = html.replaceAll('href="/assets/', 'href="/suites-springs/assets/');
html = html.replaceAll('src="/assets/', 'src="/suites-springs/assets/');
html = html.replaceAll('data-src="/assets/', 'data-src="/suites-springs/assets/');
html = html.replaceAll('srcset="/assets/', 'srcset="/suites-springs/assets/');
html = html.replaceAll('data-srcset="/assets/', 'data-srcset="/suites-springs/assets/');
html = html.replaceAll(
  "xlink:href=\"&#x2F;assets&#x2F;",
  'xlink:href="&#x2F;suites-springs&#x2F;assets&#x2F;',
);
html = html.replaceAll(
  'href="&#x2F;assets&#x2F;',
  'href="&#x2F;suites-springs&#x2F;assets&#x2F;',
);

function rewriteHref(documentHtml, fromHref, toHref) {
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

const siteLinks = [
  ["https://springs.estate/infrastructure", "/wellness"],
  ["https://springs.estate/privacy-policy", "/contact"],
  ["https://springs.estate/agreement", "/contact"],
  ["https://springs.estate/location", "/highlights"],
  ["https://springs.estate/gallery", "/highlights"],
  ["https://springs.estate/about", "/about"],
  ["https://springs.estate/design", "/gastronomy"],
  ["https://springs.estate/visual-search", "/cruises"],
  ["https://springs.house/infrastructure", "/wellness"],
  ["https://springs.house/privacy-policy", "/contact"],
  ["https://springs.house/agreement", "/contact"],
  ["https://springs.house/location", "/highlights"],
  ["https://springs.house/gallery", "/highlights"],
  ["https://springs.house/about", "/about"],
  ["https://springs.house/design", "/gastronomy"],
  ["https://springs.house/visual-search", "/cruises"],
  ["/flats", "/luxury-cabins-Nile-Cruise"],
  ["/design", "/gastronomy"],
  ["/infrastructure", "/wellness"],
  ["/location", "/highlights"],
  ["/gallery", "/highlights"],
  ["/", "/"],
];

for (const [fromHref, toHref] of siteLinks) {
  html = rewriteHref(html, fromHref, toHref);
}

// Residences product CTAs with query strings → suite category pages
html = html.replace(
  /href="\/flats\?types(?:%5B%5D|\[\])=flat[^"]*"/gi,
  'href="/luxury-cabins-Nile-Cruise" target="_top" data-ajax-page-ignore',
);
html = html.replace(
  /href="\/flats\?types(?:%5B%5D|\[\])=townhouse[^"]*"/gi,
  'href="/rooms" target="_top" data-ajax-page-ignore',
);
html = html.replace(
  /href="\/flats\?types(?:%5B%5D|\[\])=penthouse[^"]*"/gi,
  'href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise" target="_top" data-ajax-page-ignore',
);
html = html.replace(
  /href="\/flats[^"]*"/gi,
  'href="/luxury-cabins-Nile-Cruise" target="_top" data-ajax-page-ignore',
);
html = html.replaceAll(">Townhouses<", ">Luxury Suites<");
html = html.replaceAll(">Penthouses<", ">Royal Suites<");
html = html.replaceAll(">Flats<", ">Luxury Rooms<");

html = html.replace(
  /<a\b[^>]*href="https:\/\/videinfra\.com\/"[^>]*>[\s\S]*?<\/a>/gi,
  '<span class="text-c2-small leading-trim text-color-small text-right">Hathor Dahabiya</span>',
);

html = html
  .replaceAll('href="https://springs.estate/"', 'href="/suites"')
  .replaceAll('content="https://springs.estate/"', 'content="/suites"')
  .replaceAll(
    'content="https://springs.estate/assets/manifest/og.jpg"',
    `content="${MEDIA.hero}"`,
  )
  .replace(
    /href="https:\/\/springs\.estate\/favicon-light\.png[^"]*"/g,
    'href="/favicon.ico"',
  );

html = html.replace(
  /(<a\b[^>]*?)\s+href="https:\/\/springs\.(?:estate|house)\/[^"]*"/gi,
  '$1 href="/contact" target="_top" data-ajax-page-ignore',
);

// Entity-encoded leftover Springs media
html = html.replace(
  /https&#x3A;(?:&#x5C;&#x2F;){2}springs\.(?:estate|house)(?:&#x5C;&#x2F;(?:[A-Za-z0-9._@%-]|&#x25;[0-9A-Fa-f]{2})+)+/gi,
  MEDIA.hero.replaceAll(":", "&#x3A;").replaceAll("/", "&#x5C;&#x2F;"),
);

// Baked Springs brand greens/blues that appear as literals in markup/JSON attrs.
// Dark surfaces → cream #ece8df; accents → gold; skies → cream #f5eacf.
for (const [from, to] of [
  ["#162d24", "#ece8df"],
  ["#1b4732", "#ece8df"],
  ["#274c19", "#b69f64"],
  ["#a7b431", "#b69f64"],
  ["#758535", "#b69f64"],
  ["#101e27", "#ece8df"],
  ["#005160", "#b69f64"],
  ["#67bfda", "#f5eacf"],
  ["#bee5ee", "#f5eacf"],
  ["#8b6914", "#b69f64"],
]) {
  html = html.replaceAll(from, to);
  html = html.replaceAll(from.toUpperCase(), to);
}

// Insert Hathor lux-footer IN PLACE of the Springs footer (data-scroll-section),
// so it participates in the page scroll — appending after scripts never appears.
const footerReplaced = html.replace(
  /<footer\s+class="section section--no-overflow[\s\S]*?<\/footer>/i,
  hathorFooterHtml,
);
if (footerReplaced === html) {
  throw new Error(
    "Suites rebuild failed: Springs <footer data-scroll-section> not found",
  );
}
html = footerReplaced;

// Rewrite stylesheet URLs + retint only Springs' named brand colours.
// Never rewrite neutral/black literals: those include shadows, masks and
// browser-normalization rules and changing them alters the source rendering.
const cssColorPatches = [
  ["#162d24", "#ece8df"],
  ["#1b4732", "#ece8df"],
  ["#274c19", "#b69f64"],
  ["#a7b431", "#b69f64"],
  ["#758535", "#b69f64"],
  ["#101e27", "#ece8df"],
  ["#005160", "#b69f64"],
  ["#67bfda", "#f5eacf"],
  ["#bee5ee", "#f5eacf"],
  ["#e0d1b6", "#ece8df"],
  ["#f5e8d1", "#f5eacf"],
  ["22,45,36", "205,191,166"],
  ["22, 45, 36", "236, 232, 223"],
  ["27,71,50", "205,191,166"],
  ["27, 71, 50", "236, 232, 223"],
  ["39,76,25", "182,159,100"],
  ["39, 76, 25", "182, 159, 100"],
  ["167,180,49", "182,159,100"],
  ["167, 180, 49", "182, 159, 100"],
  ["117,133,53", "182,159,100"],
  ["117, 133, 53", "182, 159, 100"],
  ["16,30,39", "205,191,166"],
  ["16, 30, 39", "236, 232, 223"],
  ["0,81,96", "182,159,100"],
  ["0, 81, 96", "182, 159, 100"],
  ["103,191,218", "245,234,207"],
  ["103, 191, 218", "245, 234, 207"],
  ["190,229,238", "245,234,207"],
  ["190, 229, 238", "245, 234, 207"],
  ["224,209,182", "205,191,166"],
  ["224, 209, 182", "236, 232, 223"],
  ["245,232,209", "245,234,207"],
  ["245, 232, 209", "245, 234, 207"],
];

// Retint only the homepage stylesheets. Leave unused page CSS untouched so a
// future accidental import cannot inherit mutated layout tokens.
const cssDir = path.join(destinationDir, "assets", "stylesheets");
for (const name of ["global.css", "landing.css", "browser-message.css"]) {
  const cssPath = path.join(cssDir, name);
  if (!fs.existsSync(cssPath)) continue;
  let css = fs.readFileSync(cssPath, "utf8");
  css = css.replaceAll("url(/assets/", "url(/suites-springs/assets/");
  css = css.replaceAll("url('/assets/", "url('/suites-springs/assets/");
  css = css.replaceAll('url("/assets/', 'url("/suites-springs/assets/');
  for (const [from, to] of cssColorPatches) {
    css = css.replaceAll(from, to);
    css = css.replaceAll(from.toUpperCase(), to);
  }
  fs.writeFileSync(cssPath, css);
}

// Keep both original WebGL engines. Rewrite every absolute /assets/ path so
// textures, icons and lazy chunks resolve under /suites-springs/, then swap
// only the colour plates for Hathor imagery (depth/alpha masks stay Springs).
const jsDir = path.join(destinationDir, "assets", "javascripts");
function rewriteJsTree(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const jsPath = path.join(dir, name);
    const st = fs.statSync(jsPath);
    if (st.isDirectory()) {
      rewriteJsTree(jsPath);
      continue;
    }
    if (!name.endsWith(".js")) continue;
    let js = fs.readFileSync(jsPath, "utf8");
    js = js.replaceAll('"/assets/', '"/suites-springs/assets/');
    js = js.replaceAll("'/assets/", "'/suites-springs/assets/");
    js = js.replaceAll("(/assets/", "(/suites-springs/assets/");
    if (name === "webgl-nature.js") {
      js = js.replaceAll(
        "/suites-springs/assets/images/media/landing/3.nature/color@md.avif",
        "/media/hathor/scraped/luxsuite-2.webp",
      );
    }
    if (name === "webgl-wellness.js") {
      js = js.replaceAll(
        "/suites-springs/assets/images/media/landing/2.wellness/color-unc@md.avif",
        "/media/hathor/scraped/luxsuite-1.webp",
      );
    }
    fs.writeFileSync(jsPath, js);
  }
}
rewriteJsTree(jsDir);

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote exact standalone Suites homepage: ${destination}`);
