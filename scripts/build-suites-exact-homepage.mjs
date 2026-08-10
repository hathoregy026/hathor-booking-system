/**
 * Publishes the captured Springs Homepage as an isolated Suites document.
 *
 * Springs sticky/scroll/media architecture is preserved.
 * Art direction (typography roles, text compositions, CTAs, contrast) is
 * applied via scripts/suites-art-direction.css + controlled HTML injections.
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
const suitesArtDirectionCss = fs.readFileSync(
  path.join(root, "scripts", "suites-art-direction.css"),
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

// LAYOUT LOCK — do not delete/reorder gallery caption columns. Springs owns
// the two-column hero caption (lead + title). Copy swaps handle editorial text.

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


// ——— SUITES ART DIRECTION HTML (compositions + CTAs) ———
const ctaPrimary = (href, label, extraClass = "") =>
  `<a class="suites-cta-primary ${extraClass}" href="${href}" target="_top" data-ajax-page-ignore>${label}</a>`;
const ctaSecondary = (href, label, extraClass = "") =>
  `<a class="suites-cta-secondary ${extraClass}" href="${href}" target="_top" data-ajax-page-ignore>${label}</a>`;
const ctaLink = (href, label, extraClass = "") =>
  `<a class="suites-cta-link ${extraClass}" href="${href}" target="_top" data-ajax-page-ignore>${label}</a>`;
/** In-iframe scroll CTA (no target=_top) — used for Compare Suites → collection section */
const ctaScroll = (hash, label, extraClass = "") =>
  `<a class="suites-cta-link ${extraClass}" href="${hash}" data-suites-scroll-target="${hash}" data-ajax-page-ignore>${label}</a>`;

// Hero: unify title + supporting copy + CTAs into one lower-left lockup
html = html.replace(
  /<div class="l-gallery__caption pr-layout">[\s\S]*?<div class="l-gallery__title col col--md-6 text-right">[\s\S]*?<h1 class="h0 leading-trim"[^>]*>[\s\S]*?<\/h1>[\s\S]*?<\/div>[\s\S]*?(<a[\s\S]*?l-gallery-next[\s\S]*?<\/a>[\s\S]*?<a[\s\S]*?l-gallery-next[\s\S]*?<\/a>)[\s\S]*?<\/div>/i,
  (_m, nextBtns) => {
    return `<div class="l-gallery__caption pr-layout">
                <div class="suites-hero-lockup">
                    <span class="suites-eyebrow">The Private Nile</span>
                    <h1 class="h0 leading-trim" data-reveal="title" data-reveal-delay="1000">
                        River <br>Suites
                    </h1>
                    <p class="suites-hero-support text-t1 leading-trim" data-reveal="text" data-reveal-delay="1000">
                        Luxury suites aboard Hathor Dahabiya: private Nile journeys shaped for stillness, craft, and panoramic river light
                    </p>
                    <div class="suites-cta-row">
                        ${ctaPrimary("/rooms", "Explore the Suites", "suites-cta-primary--on-dark")}
                        ${ctaSecondary("/contact", "Speak with Concierge")}
                    </div>
                </div>
                ${nextBtns}
            </div>`;
  },
);

// Intro opening — editorial CTA
html = html.replace(
  /(<p class="l-intro__opening-subtitle text-c1 leading-trim text-color-primary"[^>]*>[\s\S]*?<\/p>)(\s*<\/div>\s*<\/div>)/i,
  `$1
                    ${ctaLink("/luxury-cabins-Nile-Cruise", "Discover the Collection &rarr;", "suites-cta-link--ink")}
                $2`,
);

// Gold intro — Compare Suites scrolls to on-page suite collection (residences)
html = html.replace(
  /(<div class="l-intro__content-text mt-2 ml-layout"[^>]*>\s*<p class="leading-trim">[\s\S]*?<\/p>)(\s*<\/div>)/i,
  `$1
            ${ctaScroll("#l-residences-sticky-1", "Compare Suites &rarr;", "suites-cta-link--ivory")}
        $2`,
);

// Comfort — suite detail destination (Royal Suites page; distinct from /rooms collection)
html = html.replace(
  /(class="l-wellness__slider__caption-text content-animation col col--md-4"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<div class="l-wellness__slider-gradient)/i,
  `$1$2
                        ${ctaLink("/Luxury-Royal-Suites-Nile-Dahabiya-Cruise", "View Suite Details &rarr;", "suites-cta-link--ivory")}
                    $3`,
);

// Discover the Voyage intentionally omitted (acceptance lock)

// Book Now / callback → real booking deep link
html = html.replaceAll(
  'href="#callback-modal"',
  'href="/suites?book=1" target="_top" data-ajax-page-ignore',
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
${suitesArtDirectionCss}
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

  /* Suites → parent navbar tone (ink over cream/gold, ivory over photography) */
  (function suitesNavToneBridge() {
    var last = "";
    function sample() {
      try {
        var y = 12;
        var x = Math.round(window.innerWidth * 0.5);
        var el = document.elementFromPoint(x, y);
        var tone = "ivory";
        while (el && el !== document.documentElement) {
          var cs = getComputedStyle(el);
          var bg = cs.backgroundColor || "";
          var m = bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/i);
          if (m) {
            var r = +m[1], g = +m[2], b = +m[3];
            var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            if (lum > 0.55) tone = "ink";
            else if (lum < 0.45) tone = "ivory";
            break;
          }
          if (el.classList && (el.classList.contains("ui-light") || el.classList.contains("ui-background"))) {
            tone = "ink";
            break;
          }
          if (el.classList && el.classList.contains("ui-dark")) {
            tone = "ivory";
            break;
          }
          el = el.parentElement;
        }
        /* Hero / gallery photography → ivory; cream/gold panels → ink */
        var gallery = document.querySelector(".l-gallery");
        if (gallery) {
          var gr = gallery.getBoundingClientRect();
          if (gr.top <= 80 && gr.bottom > 120) tone = "ivory";
        }
        var gold = document.querySelector(".l-intro__content.ui-dark, .ui-dark.ui-background");
        if (gold) {
          var rr = gold.getBoundingClientRect();
          if (rr.top <= 60 && rr.bottom > 100) tone = "ink";
        }
        if (tone !== last) {
          last = tone;
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "hathor-suites-nav-tone", tone: tone }, "*");
          }
        }
      } catch (e) {}
    }
    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", sample);
    setTimeout(sample, 800);
    setInterval(sample, 900);
  })();

  /* Compare Suites: scroll to on-page suite collection */
  (function suitesInPageScroll() {
    function locoY() {
      var sec = document.querySelector("[data-scroll-section]");
      if (!sec) return window.pageYOffset || 0;
      var st = sec.getAttribute("style") || "";
      var m = st.match(/translate\(([^)]+)\)/);
      if (!m) return 0;
      return Math.abs(parseFloat((m[1].split(",")[1] || "0").trim()) || 0);
    }
    function scrollToEl(el) {
      if (!el) return;
      var $ = window.jQuery || window.$;
      var dest = locoY() + el.getBoundingClientRect().top - 24;
      try {
        var smooth = $ && $(window).data("smooth-scroll");
        if (smooth && smooth.scroller && typeof smooth.scroller.scrollTo === "function") {
          smooth.scroller.scrollTo(dest);
          return;
        }
      } catch (e) {}
      try {
        if ($ && typeof $.fn.scrollTo === "function") {
          $(window).scrollTo(dest, 0);
          return;
        }
      } catch (e) {}
    }
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target.closest("a[data-suites-scroll-target]");
        if (!a) return;
        e.preventDefault();
        var sel = a.getAttribute("data-suites-scroll-target");
        if (!sel) return;
        var el = document.querySelector(sel);
        if (!el && sel.charAt(0) === "#") {
          el = document.getElementById(sel.slice(1));
        }
        scrollToEl(el);
      },
      true,
    );
  })();
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
html = html.replace(
  'id="l-residences-sticky-1"',
  'id="l-residences-sticky-1" data-suites-collection',
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
