/**
 * Publishes the captured Springs Homepage as an isolated Suites document.
 *
 * Retains original document structure, CSS, scripts and scroll choreography.
 * Substitutes only editorial copy, imagery, links, palette, and footer.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const hathorFontFaces = fs.readFileSync(
  path.join(root, "app", "hathor-fonts.css"),
  "utf8",
);
const luxFooterCss = fs.readFileSync(
  path.join(root, "app", "lux-footer.css"),
  "utf8",
);
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

/** Hero-led gallery cycle — suites-hero anchors the landing marquee. */
const galleryCycle = [
  MEDIA.hero,
  MEDIA.suites,
  MEDIA.rooms,
  MEDIA.royal,
  MEDIA.hero,
  MEDIA.lux1,
  MEDIA.lux2,
  MEDIA.cabin1,
  MEDIA.hero,
  MEDIA.cabin3,
  MEDIA.royal1,
  MEDIA.royal3,
  MEDIA.lux3,
  MEDIA.lux4,
  MEDIA.cabin5,
  MEDIA.royal5,
  MEDIA.lux5,
  MEDIA.roomHero,
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
    "Luxury suites aboard Hathor Dahabiya&nbsp;&mdash; private Nile journeys shaped for stillness, craft, and panoramic river light",
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
    "Every Hathor suite is crafted for comfort and ease&nbsp;&mdash; LED screens, walk-in showers or bathtubs, safe boxes, and quiet privacy as the Nile drifts past your windows.",
  ],
  [
    "Let your thoughts flow freely as&nbsp;you immerse yourself in&nbsp;our crystal-clear spa pool that offers a&nbsp;view of&nbsp;the&nbsp;garden. Soft glare on&nbsp;the&nbsp;water, a&nbsp;cup of&nbsp;herbal tea in&nbsp;the&nbsp;fragrant warmth of&nbsp;the&nbsp;hammam&nbsp;&mdash; and just like&nbsp;that, you leave the&nbsp;day’s worries behind.",
    "Return from temple shores to a suite shower and soft river light. Bathtub or walk-in shower, quiet air, and the Nile beyond the glass&nbsp;&mdash; worries of the day dissolve into water and gold dusk.",
  ],
  [
    "Relaxing yoga session mellows the&nbsp;mind and makes your body feel light and responsive. Finding balance is&nbsp;easy.",
    "Private balcony stillness mellows the mind. Finding balance is easy when the river itself sets the tempo of your voyage.",
  ],
  [
    "Get ready to&nbsp;face the&nbsp;day guided by&nbsp;your personal trainer in&nbsp;our modern fitness center. Exercise at&nbsp;your convenience, because the&nbsp;gym is&nbsp;just a&nbsp;few steps away&nbsp;&mdash; right up&nbsp;the&nbsp;stairs",
    "Smart entertainment and suite systems wait a few steps from your bed&nbsp;&mdash; LED screens, climate, and quiet modern comfort shaped for Nile nights.",
  ],
  [
    "Do&nbsp;you sense the&nbsp;aroma of&nbsp;espresso adorned with&nbsp;creamy milk foam? Now you can experience your favorite flavors without&nbsp;leaving the&nbsp;house. Cozy up&nbsp;on&nbsp;the&nbsp;terrace of&nbsp;our wellness-caf&eacute; and relax to&nbsp;the&nbsp;sounds of&nbsp;ambient music.",
    "Tea and coffee facilities wait in your suite. Cozy up with a quiet pour as ambient river sounds replace the city&nbsp;&mdash; a private café of one aboard Hathor.",
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
    "Hathor sails the classic Luxor&ndash;Aswan corridor of the Nile, surrounded by temples and close to the riverbanks that shaped ancient Egypt&nbsp;&mdash; a private Dahabiya route of rare stillness.",
  ],
  [
    "Breathe in&nbsp;the&nbsp;air and open space. Do&nbsp;you feel like&nbsp;running? Don&rsquo;t hold back. As&nbsp;you are running along&nbsp;the&nbsp;embankment, delight in&nbsp;the&nbsp;kaleidoscope of&nbsp;shifting panoramas that will leave you impressed. Set your pace and change it&nbsp;at&nbsp;your desire.",
    "Breathe in&nbsp;the&nbsp;river air and open space. As Hathor glides, delight in&nbsp;the&nbsp;kaleidoscope of&nbsp;shifting panoramas from Luxor to Aswan. Set your pace&nbsp;&mdash; three, four, or seven nights&nbsp;&mdash; and change it&nbsp;at&nbsp;your desire.",
  ],
  [
    "Each floor reflects boundless perspectives in&nbsp;its glistening waves, inviting you to&nbsp;look farther with&nbsp;a&nbsp;fuller palette of&nbsp;possibilities.",
    "Each suite reflects boundless Nile perspectives in its panoramic windows, inviting you to look farther with a fuller palette of voyage possibilities.",
  ],
  [
    "Tabanlioglu, the&nbsp;renowned architectural bureau, emphasizes the&nbsp;bold asymmetry of&nbsp;balconies in&nbsp;a&nbsp;chessboard pattern. Three vertical partitions divide the&nbsp;translucent façade, creating the&nbsp;effect of&nbsp;weightless volume. Freedom of&nbsp;expression, elegance of&nbsp;intelligence, and visual lightness.",
    "Hathor&rsquo;s suite craft emphasizes panoramic glass, private balconies, and calm volume. Timeless Egyptian charm meets modern comfort&nbsp;&mdash; freedom of rest, elegance of detail, and visual lightness on the water.",
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
  ["62-347 m<sup>2</sup> area", "22&ndash;56 m<sup>2</sup> suites"],
  ["5 townhouses", "2 Elegant Suites"],
  ["7 penthouses", "2 Royal Suites"],
];

for (const [from, to] of moreCopy) {
  html = html.split(from).join(to);
}

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
  ["landing\\/3\\.nature\\/nature-slider-md-1", MEDIA.royal1],
  ["landing\\/3\\.nature\\/nature-slider-xs-1", MEDIA.royal1],
  ["landing\\/3\\.nature\\/nature-slider-md-2", MEDIA.royal3],
  ["landing\\/3\\.nature\\/nature-slider-xs-2", MEDIA.royal3],
  ["landing\\/3\\.nature\\/nature-slider-md-3", MEDIA.royal5],
  ["landing\\/3\\.nature\\/nature-slider-xs-3", MEDIA.royal5],
  ["landing\\/3\\.nature\\/", MEDIA.cabin5],
  ["landing\\/4\\.place\\/place-caption-1", MEDIA.rooms],
  ["landing\\/4\\.place\\/place-caption-3", MEDIA.suites],
  ["landing\\/4\\.place\\/place-bg", MEDIA.hero],
  ["landing\\/4\\.place\\/", MEDIA.cabin1],
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

// Springs Place sticky panels + nature caption use Vimeo — replace with Hathor stills
// so the three rising full-bleed images and left caption read as Suites, not Springs green video.
const vimeoToSuite = {
  "1044257468": MEDIA.suites,
  "1044257440": MEDIA.rooms,
  "1086358928": MEDIA.royal,
  "1086359012": MEDIA.lux4,
};
html = html.replace(
  /<iframe\b([^>]*?)\bsrc="https:\/\/player\.vimeo\.com\/video\/(\d+)\?[^"]*"([^>]*)>[\s\S]*?<\/iframe>/gi,
  (_m, _pre, id) => {
    const url = vimeoToSuite[id] || MEDIA.hero;
    // Keep a sized iframe node so Springs motion code that falls back to
    // iframe.width does not throw; paint the suite still via img.
    return `<img class="img-cover" src="${url}" alt="" width="1440" height="900" draggable="false" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;" /><iframe title="" width="1440" height="900" tabindex="-1" aria-hidden="true" src="about:blank" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none;border:0;"></iframe>`;
  },
);

// Gallery cards: cycle Hathor suite imagery across gallery-* assets
let galleryIndex = 0;
html = html.replace(
  /(?:(?:https?:)?\/\/[^"'\s>]*\/)?(?:assets\/images\/media\/)?landing\/0\.gallery\/[^"'\s>]*/gi,
  () => galleryCycle[galleryIndex++ % galleryCycle.length],
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
  /*
   * Springs contrast model (keep mosaic readable):
   * - Dark gutters/panels (was forest green) → warm ink #2c2824
   * - Accent / glows / shadows → gold #b69f64
   * - Titles on dark → cream #ece8df
   * Mid-gold as the dark surface washes photos (gold-on-gold) and breaks the clone.
   */
  :root {
    --c-beige-background: #ece8df;
    --c-beige-background-rgb: 236, 232, 223;
    --c-beige: #f5f0e8;
    --c-beige-rgb: 245, 240, 232;
    --c-dark-green: #2c2824;
    --c-dark-green-rgb: 44, 40, 36;
    --c-green: #2c2824;
    --c-green-rgb: 44, 40, 36;
    --c-light-green: #b69f64;
    --c-light-green-rgb: 182, 159, 100;
    --c-olive: #b69f64;
    --c-olive-rgb: 182, 159, 100;
    --c-dark-blue: #2c2824;
    --c-dark-blue-rgb: 44, 40, 36;
    --c-blue: #b69f64;
    --c-blue-rgb: 182, 159, 100;
    --c-light-blue: #ece8df;
    --c-light-blue-rgb: 236, 232, 223;
    --c-sky: #ece8df;
    --c-sky-rgb: 236, 232, 223;
    --cookie-height: 0px;
    --lux-gold: #b69f64;
    --lux-cream: #ece8df;
    --tooltip-shadow: 0 18px 48px rgba(182, 159, 100, 0.28);
    --c-button-hover-gradient: linear-gradient(101.51deg, rgba(182, 159, 100, 0) 37.02%, #b69f64 308.4%);
    --c-button-hover-gradient-dark: linear-gradient(91.82deg, hsla(39, 32%, 51%, 0) 0%, #b69f64 100%);
  }
  body {
    background: #ece8df !important;
    color: #2c2824;
    font-family: "Hathor Body", "TT Commons", sans-serif;
  }
  .ui-dark, .ui-dark-background, .ui-dark.ui-background {
    --t-background: #2c2824;
    --t-background-rgb: 44, 40, 36;
    --t-text: #ece8df;
    --t-text-rgb: 236, 232, 223;
    --t-heading: #ece8df;
    --t-heading-rgb: 236, 232, 223;
    --t-primary: #b69f64;
    --t-line: rgba(236, 232, 223, 0.35);
    background-color: #2c2824 !important;
    color: #ece8df !important;
  }
  .ui-light, .ui-light-background, .ui-light.ui-background {
    --t-background: #ece8df;
    --t-background-rgb: 236, 232, 223;
    --t-text: #2c2824;
    --t-text-rgb: 44, 40, 36;
    --t-heading: #b69f64;
    --t-heading-rgb: 182, 159, 100;
    --t-primary: #b69f64;
    --t-line: rgba(182, 159, 100, 0.28);
    background-color: #ece8df !important;
    color: #2c2824 !important;
  }
  .g1, .h0, .h1, .h2, .h3 {
    font-family: "Hathor Display", "Gamgote", Georgia, serif !important;
  }
  .text-c1, .text-c2, p, .btn__text, .text-t1 {
    font-family: "Hathor Body", "Agraham", sans-serif;
  }
  /*
   * Do NOT blanket-force heading colors on .ui-light / .ui-dark.
   * Springs themes sections dynamically; forcing cream on .ui-dark .h1 made the
   * intro opening (cream stage) render cream-on-cream — “invisible” left text.
   * Keep token-driven colors from --t-* above.
   */
  /* Keep Springs chrome out; Hathor public nav + site footer replace them. */
  .header, .cookie-consent {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  /* Gold accent glows (Springs used green radials). Keep modest so photos stay readable. */
  .l-gallery__gradient div,
  .l-wellness__gradient div,
  .l-nature__gradient div,
  .footer__gradient div,
  .preloader__gradient div,
  .preloader__gradient-animation div,
  .l-nature-bg-gradient {
    background: radial-gradient(circle, rgba(182, 159, 100, 0.55) 0%, rgba(182, 159, 100, 0.22) 45%, rgba(182, 159, 100, 0) 74%) !important;
  }
  /* Title/lede sit on dark gutters like Springs — cream, never mid-gold on gold.
     Caption must stack above the gallery split masks (z-index 44) or left text vanishes. */
  .l-gallery__caption {
    z-index: 50 !important;
  }
  .l-gallery__caption,
  .l-gallery__caption .text-t1,
  .l-gallery__caption .h0 {
    color: #ece8df !important;
  }
  /*
   * Hero mosaic: Springs-style floating depth via drop-shadow, gold (#B69F64) base
   * instead of forest-green ambient shadow. Keep transform animation on the item;
   * filter sits on the picture so drift stays GPU-friendly.
   */
  .l-gallery__item picture,
  .l-gallery__item__mask-list__item picture {
    filter:
      drop-shadow(0 18px 42px rgba(182, 159, 100, 0.45))
      drop-shadow(0 6px 16px rgba(44, 40, 36, 0.38));
  }
  @media (max-width: 1024px) {
    .l-gallery__item picture,
    .l-gallery__item__mask-list__item picture {
      filter:
        drop-shadow(0 14px 32px rgba(182, 159, 100, 0.38))
        drop-shadow(0 5px 12px rgba(44, 40, 36, 0.32));
    }
  }
  @media (max-width: 480px) {
    .l-gallery__item picture,
    .l-gallery__item__mask-list__item picture {
      filter:
        drop-shadow(0 10px 22px rgba(182, 159, 100, 0.32))
        drop-shadow(0 3px 8px rgba(44, 40, 36, 0.28));
    }
  }
  /*
   * Intro “bottom 3 images + left text” stage (Springs cream panel):
   * Keep ink copy on cream. Rising second images must stack above the first mask.
   */
  .l-intro.ui-background,
  .l-intro {
    --t-background: #ece8df;
    --t-background-rgb: 236, 232, 223;
    --t-text: #2c2824;
    --t-text-rgb: 44, 40, 36;
    --t-heading: #2c2824;
    --t-heading-rgb: 44, 40, 36;
    --t-primary: #2c2824;
    --t-primary-rgb: 44, 40, 36;
    background-color: #ece8df !important;
    color: #2c2824 !important;
  }
  .l-intro__opening .h1,
  .l-intro__opening .text-c1,
  .l-intro__opening .text-color-primary,
  .l-intro__opening-subtitle {
    color: #2c2824 !important;
  }
  .l-intro__content.ui-dark {
    --t-background: #2c2824;
    --t-background-rgb: 44, 40, 36;
    --t-text: #ece8df;
    --t-heading: #ece8df;
    --t-primary: #b69f64;
    background-color: #2c2824 !important;
    color: #ece8df !important;
  }
  .l-intro__image--second {
    position: relative;
    z-index: 4;
  }
  .l-intro__image--first {
    z-index: 1;
  }
  /*
   * Only force media pictures visible — NEVER .is-invisible--js on text/reveal
   * splits (that collapsed overlapping lines and hid rising choreography).
   */
  picture.is-invisible--js.img-full,
  picture.is-invisible--js.img-cover,
  img.is-invisible--js[data-src],
  img.is-invisible--js[data-plugin] {
    opacity: 1 !important;
    visibility: visible !important;
  }
  /* Place rising panels: keep full-bleed image cover after Vimeo → still swap */
  #l-place-sticky-1 .background--cover,
  #l-place-sticky-2 .background--cover,
  #l-place-sticky-3 .background--cover,
  .l-nature__caption .background--cover,
  .l-nature__caption .vimeo-background {
    position: relative;
    overflow: hidden;
  }
  #l-place-sticky-1 img.img-cover,
  #l-place-sticky-2 img.img-cover,
  #l-place-sticky-3 img.img-cover,
  .l-nature__caption img.img-cover {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  footer.footer {
    display: none !important;
  }
  .hathor-suites-footer-host {
    position: relative;
    z-index: 5;
    background: #0c0a08;
  }
</style>
<style data-hathor-suites-footer>
${luxFooterCss}
</style>`;

const hathorFooterHtml = `
<div class="hathor-suites-footer-host public-site">
  <footer class="lux-footer is-copy-ready">
    <div class="lux-footer__noise" aria-hidden="true"></div>
    <div class="lux-footer__glow" aria-hidden="true"></div>
    <div class="lux-footer__inner">
      <div class="lux-footer__top">
        <h2 class="lux-footer__headline typo-page-title">BEGIN YOUR JOURNEY</h2>
        <p class="lux-footer__subhead typo-body-text">
          Join our exclusive circle for private itineraries and early access to rare voyages.
        </p>
        <div class="lux-footer__subscribe">
          <a class="lux-footer__meta-link" href="mailto:reservations@hathorcruise.com?subject=Suites%20Availability" target="_top" data-ajax-page-ignore>
            Request suite availability →
          </a>
        </div>
      </div>
      <div class="lux-footer__main">
        <div class="lux-footer__grid">
          <div class="lux-footer__col lux-footer__col--brand">
            <p class="lux-footer__col-title">The Vessel</p>
            <p class="lux-footer__tagline">
              Navigating the eternal Nile with unparalleled elegance since 2024.
              A private dahabiya for travellers who prefer stillness, craft, and rare itineraries.
            </p>
            <p class="lux-footer__brand-meta">
              <a href="mailto:reservations@hathorcruise.com" class="lux-footer__meta-link" target="_top" data-ajax-page-ignore>reservations@hathorcruise.com</a>
            </p>
            <p class="lux-footer__brand-meta">
              <a href="tel:+201270496896" class="lux-footer__meta-link" target="_top" data-ajax-page-ignore>+20 127 049 6896</a>
            </p>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Suites</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/luxury-cabins-Nile-Cruise" target="_top" data-ajax-page-ignore>Luxury Rooms</a></li>
              <li><a class="lux-footer__link" href="/rooms" target="_top" data-ajax-page-ignore>Luxury Suites</a></li>
              <li><a class="lux-footer__link" href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise" target="_top" data-ajax-page-ignore>Royal Suites</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Voyages</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/cruises" target="_top" data-ajax-page-ignore>Scheduled Voyages</a></li>
              <li><a class="lux-footer__link" href="/charter" target="_top" data-ajax-page-ignore>Private Charter</a></li>
              <li><a class="lux-footer__link" href="/highlights" target="_top" data-ajax-page-ignore>Highlights</a></li>
              <li><a class="lux-footer__link" href="/about" target="_top" data-ajax-page-ignore>Our Story</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Experiences</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/wellness" target="_top" data-ajax-page-ignore>Wellness &amp; Spa</a></li>
              <li><a class="lux-footer__link" href="/gastronomy" target="_top" data-ajax-page-ignore>Dining</a></li>
              <li><a class="lux-footer__link" href="/blog" target="_top" data-ajax-page-ignore>Journal</a></li>
              <li><a class="lux-footer__link" href="/partners" target="_top" data-ajax-page-ignore>Partners</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Concierge</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/contact" target="_top" data-ajax-page-ignore>Contact Concierge</a></li>
              <li><a class="lux-footer__link" href="/contact" target="_top" data-ajax-page-ignore>FAQ</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Follow the Voyage</p>
            <ul class="lux-footer__social">
              <li><a class="lux-footer__social-link" href="https://www.instagram.com/hathorcruise/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a></li>
              <li><a class="lux-footer__social-link" href="https://www.linkedin.com/company/hathor-dahabiya-cruise" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">IN</a></li>
              <li><a class="lux-footer__social-link" href="https://www.facebook.com/Hathorcruise" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="lux-footer__bottom">
        <div class="lux-footer__bottom-row">
          <p class="lux-footer__legal">© ${new Date().getFullYear()} Hathor Cruise. All rights reserved.</p>
          <p class="lux-footer__crafted">Crafted with precision in Egypt.</p>
        </div>
      </div>
    </div>
  </footer>
</div>
`;

const suitesRuntime = `
<script data-suites-media-runtime>
(() => {
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
  function boot() {
    scrubUrls(document);
    // Do not force is-intro-seen / kill the landing preloader — that changes
    // Springs gallery mask + reveal choreography. Only mark media readiness.
    document.documentElement.classList.add("suites-media-ready", "js");
    document.documentElement.classList.remove("no-js");
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

html = html.replace("</head>", `${suitesPalette}${suitesRuntime}</head>`);

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

html = html.replace(
  /<script[^>]*browser-message\/browser-message\.js[^>]*><\/script>/g,
  "",
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
// Dark surfaces → ink; accent greens → gold; skies → cream.
for (const [from, to] of [
  ["#162d24", "#2c2824"],
  ["#1b4732", "#2c2824"],
  ["#274c19", "#b69f64"],
  ["#a7b431", "#b69f64"],
  ["#758535", "#b69f64"],
  ["#101e27", "#2c2824"],
  ["#005160", "#b69f64"],
  ["#67bfda", "#ece8df"],
  ["#bee5ee", "#ece8df"],
  ["#8b6914", "#b69f64"],
]) {
  html = html.replaceAll(from, to);
  html = html.replaceAll(from.toUpperCase(), to);
}

// Insert Hathor footer after link rewrites so it is not mutated twice
html = html.replace(/<\/body>/i, `${hathorFooterHtml}</body>`);

// Rewrite stylesheet URLs + retint baked Springs colors.
// Dark forest/teal panels → warm ink (keeps Springs mosaic contrast).
// Lime/olive accents → gold #b69f64. Sky/teal fills → cream.
const cssColorPatches = [
  ["#162d24", "#2c2824"],
  ["#1b4732", "#2c2824"],
  ["#274c19", "#b69f64"],
  ["#a7b431", "#b69f64"],
  ["#758535", "#b69f64"],
  ["#101e27", "#2c2824"],
  ["#005160", "#b69f64"],
  ["#67bfda", "#ece8df"],
  ["#bee5ee", "#ece8df"],
  ["#e0d1b6", "#f5f0e8"],
  ["#f5e8d1", "#ece8df"],
  ["22,45,36", "44,40,36"],
  ["22, 45, 36", "44, 40, 36"],
  ["27,71,50", "44,40,36"],
  ["27, 71, 50", "44, 40, 36"],
  ["39,76,25", "182,159,100"],
  ["39, 76, 25", "182, 159, 100"],
  ["167,180,49", "182,159,100"],
  ["167, 180, 49", "182, 159, 100"],
  ["117,133,53", "182,159,100"],
  ["117, 133, 53", "182, 159, 100"],
  ["16,30,39", "44,40,36"],
  ["16, 30, 39", "44, 40, 36"],
  ["0,81,96", "182,159,100"],
  ["0, 81, 96", "182, 159, 100"],
  ["103,191,218", "236,232,223"],
  ["103, 191, 218", "236, 232, 223"],
  ["190,229,238", "236,232,223"],
  ["190, 229, 238", "236, 232, 223"],
  ["224,209,182", "245,240,232"],
  ["224, 209, 182", "245, 240, 232"],
  ["245,232,209", "236,232,223"],
  ["245, 232, 209", "236, 232, 223"],
];

const cssDir = path.join(destinationDir, "assets", "stylesheets");
if (fs.existsSync(cssDir)) {
  for (const name of fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
    const cssPath = path.join(cssDir, name);
    let css = fs.readFileSync(cssPath, "utf8");
    css = css.replaceAll("url(/assets/", "url(/suites-springs/assets/");
    css = css.replaceAll("url('/assets/", "url('/suites-springs/assets/");
    css = css.replaceAll('url("/assets/', 'url("/suites-springs/assets/');
    for (const [from, to] of cssColorPatches) {
      css = css.replaceAll(from, to);
      css = css.replaceAll(from.toUpperCase(), to);
    }
    // Soft black elevation → gold-tinted (same blur radii, Hathor #B69F64)
    css = css.replace(
      /rgba\(\s*var\(--t-pure-black-rgb\)\s*,\s*([0-9.]+)\)/g,
      "rgba(182, 159, 100, $1)",
    );
    css = css.replace(
      /rgba\(\s*3\s*,\s*3\s*,\s*3\s*,\s*([0-9.]+)\)/g,
      "rgba(182, 159, 100, $1)",
    );
    fs.writeFileSync(cssPath, css);
  }
}

// Retint WebGL accent greens → gold (keeps shader math, swaps leaf/glow hue).
const jsDir = path.join(destinationDir, "assets", "javascripts");
if (fs.existsSync(jsDir)) {
  for (const name of ["webgl-wellness.js", "webgl-nature.js", "shared.js"]) {
    const jsPath = path.join(jsDir, name);
    if (!fs.existsSync(jsPath)) continue;
    let js = fs.readFileSync(jsPath, "utf8");
    js = js.replaceAll(
      "0.0951212405381588,0.761241990602591,0.0767994186031903",
      "0.7137254901960784,0.6235294117647059,0.39215686274509803",
    );
    fs.writeFileSync(jsPath, js);
  }
}

fs.mkdirSync(destinationDir, { recursive: true });
fs.writeFileSync(destination, html);
console.log(`Wrote exact standalone Suites homepage: ${destination}`);
