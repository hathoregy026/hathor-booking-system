/**
 * Build a 100% Springs /design HTML clone with Hathor gastronomy text + images.
 * Source: assets/CLONE. httpssprings.estate/design/index.html
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcHtml = path.join(
  root,
  "assets",
  "CLONE. httpssprings.estate",
  "design",
  "index.html",
);

const MEDIA = {
  hero: "/media/gastronomy-dining/dining-hero.jpg",
  table: "/media/gastronomy-dining/dining-table.jpg",
  courses: "/media/gastronomy-dining/dining-courses.jpg",
  wine: "/media/gastronomy-dining/dining-wine.jpg",
  chef: "/media/gastronomy-dining/dining-chef.jpg",
  restaurant: "/media/gastronomy-dining/experience-dining.jpg",
  service: "/media/gastronomy-dining/charter-service.jpg",
  celebration: "/media/gastronomy-dining/charter-celebration.jpg",
  plate1: "/media/gastronomy-dining/dining-plate-1.png",
  plate2: "/media/gastronomy-dining/dining-plate-2.png",
  plate3: "/media/gastronomy-dining/dining-plate-3.png",
  plate4: "/media/gastronomy-dining/dining-plate-4.png",
  plate5: "/media/gastronomy-dining/dining-plate-5.png",
  plate6: "/media/gastronomy-dining/dining-plate-6.png",
  plate7: "/media/gastronomy-dining/dining-plate-7.png",
};

const TEXT = {
  Design: "Hathor Flavors",
  "Harmony in&nbsp;Greenery <br>\nand Glass":
    "Fine Dining<br>\nLuxury Dining on Egypt&rsquo;s Finest Dahabiya",
  "Harmony in Greenery and Glass":
    "Fine Dining<br>Luxury Dining on Egypt&rsquo;s Finest Dahabiya",
  "Crystal-Clear Vision": "Atmosphere of Grace",
  "Frozen Music": "Hathor Dahabiya Restaurant",
  "Aristocratic Quartet": "Luxury Dining on Egypt&rsquo;s Finest Dahabiya",
  "Rich<br>\nInterior<br>\nLife": "Hathor<br>\nFlavors<br>\nFine Dining",
  "Art Gallery<br>\nof&nbsp;Your Life":
    "Meals are more than meals&nbsp;&mdash;<br>\nthey&rsquo;re memories",
  Flats: "Venues",
  "Limitless vision": "Indoor &amp; Outdoor",
  "Continue exploring": "Continue exploring",
};

let html = fs.readFileSync(srcHtml, "utf8");

// Extract only the design page main content (de-section)
const mainStart = html.indexOf('<section class="de-section');
const mainEnd = html.indexOf("</main>");
if (mainStart < 0 || mainEnd < 0) {
  throw new Error("Could not find de-section / </main> in design/index.html");
}
html = html.slice(mainStart, mainEnd);

// Drop cookie/footer-ish leftovers if any slipped in — keep only de-* sections
// (already inside main)

// Rewrite local asset roots to our public clone path
html = html.replaceAll('href="/assets/', 'href="/gastronomy-springs/assets/');
html = html.replaceAll('src="/assets/', 'src="/gastronomy-springs/assets/');
html = html.replaceAll("srcset=\"/assets/", 'srcset="/gastronomy-springs/assets/');
html = html.replaceAll('data-src="/assets/', 'data-src="/gastronomy-springs/assets/');
html = html.replaceAll("data-srcset=\"/assets/", 'data-srcset="/gastronomy-springs/assets/');
html = html.replaceAll(
  'href="&#x2F;assets&#x2F;',
  'href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);
html = html.replaceAll(
  "xlink:href=\"&#x2F;assets&#x2F;",
  'xlink:href="&#x2F;gastronomy-springs&#x2F;assets&#x2F;',
);
html = html.replaceAll(
  'data-image-scroll-displacement-image="/assets/',
  'data-image-scroll-displacement-image="/gastronomy-springs/assets/',
);

// Map Springs CDN / cache images → gastronomy JPGs (never PNG as cover backgrounds)
const imageMap = [
  [/design_intro_bg[^"'\s]*/gi, MEDIA.hero],
  [/design\/1\.intro\/background[^"'\s]*/gi, MEDIA.hero],
  [/design_projects_img[^"'\s]*/gi, MEDIA.restaurant],
  [/design\/3\.projects\/background[^"'\s]*/gi, MEDIA.restaurant],
  [/design_captions_img[^"'\s]*image-(?:md|xs)-1[^"'\s]*/gi, MEDIA.hero],
  [/design_captions_img[^"'\s]*image-(?:md|xs)-2[^"'\s]*/gi, MEDIA.restaurant],
  [/design\/4\.captions\/image-(?:md|xs)-1[^"'\s]*/gi, MEDIA.hero],
  [/design\/4\.captions\/image-(?:md|xs)-2[^"'\s]*/gi, MEDIA.restaurant],
  [/design_balcons_img[^"'\s]*/gi, MEDIA.courses],
  [/design\/5\.balcons\/[^"'\s]*/gi, MEDIA.courses],
  [/design_materials_img[^"'\s]*/gi, MEDIA.chef],
  [/design\/6\.materials\/[^"'\s]*/gi, MEDIA.chef],
  [/design_slider_img[^"'\s]*slider-(?:md|xs)-1[^"'\s]*/gi, MEDIA.table],
  [/design_slider_img[^"'\s]*slider-(?:md|xs)-2[^"'\s]*/gi, MEDIA.service],
  [/design\/7\.slider\/slider-(?:md|xs)-1[^"'\s]*/gi, MEDIA.table],
  [/design\/7\.slider\/slider-(?:md|xs)-2[^"'\s]*/gi, MEDIA.service],
  [/design_gallery_img[^"'\s]*image-1[^"'\s]*/gi, MEDIA.celebration],
  [/design_gallery_img[^"'\s]*image-2[^"'\s]*/gi, MEDIA.wine],
  [/design\/8\.gallery\/image-1[^"'\s]*/gi, MEDIA.celebration],
  [/design\/8\.gallery\/image-2[^"'\s]*/gi, MEDIA.wine],
  [/design_flats_img[^"'\s]*image-(?:md|xs)-1[^"'\s]*/gi, MEDIA.courses],
  [/design_flats_img[^"'\s]*image-(?:md|xs)-2[^"'\s]*/gi, MEDIA.hero],
  [/design_flats_img[^"'\s]*image-(?:md|xs)-3[^"'\s]*/gi, MEDIA.wine],
  [/design\/9\.flats\/image-(?:md|xs)-1[^"'\s]*/gi, MEDIA.courses],
  [/design\/9\.flats\/image-(?:md|xs)-2[^"'\s]*/gi, MEDIA.hero],
  [/design\/9\.flats\/image-(?:md|xs)-3[^"'\s]*/gi, MEDIA.wine],
  [/design_more[^"'\s]*/gi, MEDIA.celebration],
  [/design\/10\.more\/[^"'\s]*/gi, MEDIA.celebration],
  [/design_projects_list_img[^"'\s]*slide-2[^"'\s]*/gi, MEDIA.table],
  [/design_projects_list_img[^"'\s]*slide-3[^"'\s]*/gi, MEDIA.wine],
  [/design_projects_list_img[^"'\s]*image_1762521394[^"'\s]*/gi, MEDIA.restaurant],
  [/design\/3\.projects\/slide-2[^"'\s]*/gi, MEDIA.table],
  [/design\/3\.projects\/slide-3[^"'\s]*/gi, MEDIA.wine],
  [/design_projects_list_tmb[^"'\s]*thumb-1[^"'\s]*/gi, MEDIA.restaurant],
  [/design_projects_list_tmb[^"'\s]*thumb-2[^"'\s]*/gi, MEDIA.table],
  [/design_projects_list_tmb[^"'\s]*thumb-3[^"'\s]*/gi, MEDIA.wine],
  [/design\/3\.projects\/thumb-1[^"'\s]*/gi, MEDIA.restaurant],
  [/design\/3\.projects\/thumb-2[^"'\s]*/gi, MEDIA.table],
  [/design\/3\.projects\/thumb-3[^"'\s]*/gi, MEDIA.wine],
  [/landing\/callback\/spiral[^"'\s]*/gi, MEDIA.table],
];

// Replace full https://springs.estate/... URLs and relative media/cache paths
html = html.replace(
  /https:\/\/springs\.estate\/[^"'\s>]+/gi,
  (url) => {
    for (const [re, dest] of imageMap) {
      if (re.test(url)) return dest;
    }
    // keep title SVGs / local assets already rewritten
    if (url.includes("/assets/images/media/design/")) {
      return url.replace(
        "https://springs.estate",
        "/gastronomy-springs",
      );
    }
    return MEDIA.hero;
  },
);

// HTML-entity / JSON-escaped springs.estate media URLs inside data-* attributes
html = html.replace(
  /https(?:&#x3A;|:)(?:&#x5C;&#x2F;&#x5C;&#x2F;|\\\/\\\/|\/\/)springs\.estate(?:&#x5C;&#x2F;|\\\/|\/)[^"'<\s]+/gi,
  (raw) => {
    const decoded = raw
      .replace(/&#x3A;/gi, ":")
      .replace(/&#x5C;&#x2F;/gi, "/")
      .replace(/\\\//g, "/")
      .replace(/%40/gi, "@");
    for (const [re, dest] of imageMap) {
      if (re.test(decoded)) return dest;
    }
    return MEDIA.hero;
  },
);

// Also replace bare media/cache paths that appear without domain in data attrs
html = html.replace(
  /(?:https:\\\\\/\\\\\/springs\.estate\\\\\/)?media\\\\\/cache\\\\\/[^"\\]+/gi,
  (esc) => {
    const decoded = esc
      .replace(/\\\\\//g, "/")
      .replace(/^https:\/\/springs\.estate\//, "");
    for (const [re, dest] of imageMap) {
      if (re.test(decoded)) return dest.replace(/\//g, "\\/");
    }
    return MEDIA.hero.replace(/\//g, "\\/");
  },
);

// Text replacements (order matters — longer first)
const bodyReplacements = [
  [
    /Springs resembles streams of&nbsp;transparent air and clear water sculpted into&nbsp;an&nbsp;asymmetrical glass tower that soars towards&nbsp;the&nbsp;sky\. Wave-like&nbsp;longlines wrap around&nbsp;the&nbsp;facade and reveal verdant terraces that offer a&nbsp;vantage point for&nbsp;observation and introspection\./g,
    "Nile cruising on the luxurious Hathor Dahabiya is unique. It&rsquo;s a whole luxury experience you will keep in your heart and soul forever. Hathor Cruise Egypt offers more than scenery &mdash; it offers a sensory journey through Egypt&rsquo;s culinary heritage.",
  ],
  [
    /Glowing building of&nbsp;limitless light resembles a&nbsp;lens refracting a&nbsp;kaleidoscope of&nbsp;reflections\./g,
    "Our dining spaces are designed to soothe the senses with elegant d&eacute;cor, natural light, and a peaceful ambiance that invites you to slow down and savor.",
  ],
  [
    /The&nbsp;concept of&nbsp;Springs is to&nbsp;merge architecture and nature within&nbsp;the&nbsp;optical focus of&nbsp;a&nbsp;vision reaching into&nbsp;tomorrow\./g,
    "Hathor Dahabiya Restaurant &mdash; gourmet lunches and candlelit dinners shaped by tradition and innovation.",
  ],
  [
    /Ultra-transparent panoramic windows, aluminum panels with&nbsp;restrained luster, natural oak-framed loggias, marble flooring/g,
    "From the first glass to the last bite, our handpicked team delivers your dining experience with thoughtful warmth and timeless grace.",
  ],
  [
    /Springs resembles a&nbsp;waterfall that ceased flowing, as&nbsp;if you could hear roaring cascades and the&nbsp;delicate chiming of&nbsp;scattered drops in&nbsp;a&nbsp;matter of&nbsp;seconds\. How did we create this effect\?/g,
    "Enjoy your breakfast and delight your taste buds, with an extra magical Nile river views, indulge in gourmet lunches, and dine by candlelight under the stars.",
  ],
  [
    /The&nbsp;balconies of&nbsp;the&nbsp;asymmetrical facade follow a&nbsp;chessboard pattern\. The&nbsp;non-linear order creates a&nbsp;striking, recognizable effect\./g,
    "Indoor Restaurant &mdash; a refined setting for elegant dining with Nile-inspired d&eacute;cor.",
  ],
  [
    /Glass, metal, stone, and wood&nbsp;&mdash; the&nbsp;four elements that define the&nbsp;essence of&nbsp;Springs, an&nbsp;airy yet durable structure\./g,
    "From the first glass to the last bite, our handpicked team delivers your dining experience with thoughtful warmth and timeless grace. Whether our buffet spreads or our &agrave; la carte dishes, we add magic to every bite.",
  ],
  [
    /High-clarity glass makes our building appear levitating, while stone and wood allow you to&nbsp;feel the&nbsp;essence of&nbsp;time&nbsp;&mdash; time that you'll wish to&nbsp;halt again and again to&nbsp;admire the&nbsp;elegance that adorns your life\./g,
    "Hathor Dahabiya Restaurant, where gourmet lunches turn into unforgettable moments, and meals are more than meals &mdash; they&rsquo;re memories.",
  ],
  [
    /Imagine bathing in&nbsp;the&nbsp;crystal-clear pool, your whole body feeling light and energized\. The&nbsp;splashing water carrying all superficial thoughts away\. You emerge, feeling pleasant coolness on&nbsp;your skin\./g,
    "Nile cruising on the luxurious Hathor Dahabiya is unique. Skilled chefs craft each dish using seasonal, locally sourced ingredients, honoring both tradition and innovation.",
  ],
  [
    /Our fitness center, offering state-of-the-art equipment, supports your health and well-being\. Panoramic windows and comfortable environment guarantee your full satisfaction\./g,
    "With two elegant restaurants and relaxing lounge bars, every moment becomes a celebration of taste and tranquility.",
  ],
  [
    /Our viewing terraces will surround you with&nbsp;beauty of&nbsp;botanical sculptures\./g,
    "Savor every bite with breathtaking Nile-front views.",
  ],
  [
    /Our Wellness center will greet you with&nbsp;beauty chiseled in&nbsp;marble and dissolved in&nbsp;water\./g,
    "A refined setting for elegant dining with Nile-inspired d&eacute;cor.",
  ],
  [
    /Our view flats transform the&nbsp;city into&nbsp;an&nbsp;element of&nbsp;your interior design; not a&nbsp;mere landscape but a&nbsp;panorama of&nbsp;seven historical parks, a&nbsp;river shifting shades, and the&nbsp;capital's iconic landmarks in&nbsp;full view\. It(?:'|’)s the&nbsp;coziness of&nbsp;a&nbsp;country house with&nbsp;the&nbsp;expanse of&nbsp;the&nbsp;megapolises\./g,
    "Our dining spaces are designed to soothe the senses with elegant d&eacute;cor, natural light, and a peaceful ambiance that invites you to slow down and savor.",
  ],
  [/138 view flats/g, "Indoor Restaurant"],
  [/62-347 m<sup>2<\/sup> area/g, "Outdoor Restaurant"],
  [/Unique transformable glazing/g, "Indoor Bar"],
  [/Designer finishings/g, "Outdoor Bar"],
];

for (const [re, to] of bodyReplacements) {
  html = html.replace(re, to);
}

for (const [from, to] of Object.entries(TEXT)) {
  html = html.split(from).join(to);
}

// Title SVG → real text heading for Hathor (keep structure, swap visible title)
html = html.replace(
  /(<h1 class="g1 leading-trim[^"]*"[^>]*>)\s*Hathor Flavors\s*(<\/h1>)/,
  "$1Hathor Flavors$2",
);

// Match Springs design shell (barba container + page content wrappers)
html = `
<div
  class="page-content-wrapper ui-light-background gastronomy-springs-clone"
  data-gastronomy-springs-clone
  data-barba="container"
  data-barba-namespace="page"
>
  <div class="page-content-wrapper__inner js-page-content-wrapper">
    <div class="page-content js-page-content">
      <main id="top">
${html}
      </main>
    </div>
  </div>
</div>
`;

const outDir = path.join(root, "public", "gastronomy-springs");
fs.writeFileSync(path.join(outDir, "design-body.html"), html);

const ts = `/* Auto-generated by scripts/build-gastronomy-springs-clone.mjs — do not edit by hand */\nexport const GASTRONOMY_SPRINGS_HTML = ${JSON.stringify(html)};\n`;
fs.writeFileSync(
  path.join(root, "lib", "gastronomy-springs-html.ts"),
  ts,
);

console.log("Wrote design-body.html bytes", html.length);
console.log("Wrote lib/gastronomy-springs-html.ts");
