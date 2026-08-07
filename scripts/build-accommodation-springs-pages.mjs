/**
 * Publishes three isolated Springs Design documents for accommodation pages:
 * Luxury Rooms, Luxury Suites, Royal Suites.
 *
 * Engine / structure / scroll choreography stay Springs Design.
 * Only editorial copy, imagery, links, palette, fonts, and footer are swapped.
 */
import fs from "node:fs";
import path from "node:path";
import { injectLuxFooterIntoHtml } from "./lux-footer-iframe-snippet.mjs";

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
const assetRoot = path.join(root, "public", "accommodation-springs");
const publicPrefix = "/accommodation-springs";

if (!fs.existsSync(source)) {
  throw new Error(`Missing Springs Design capture at ${source}`);
}

const SHARED_ASSET_REPLACES = [
  ["design\\/1\\.intro\\/background-", "intro"],
  ["landing\\/callback\\/spiral", "spiral"],
  ["design\\/3\\.projects\\/background-", "projectsBg"],
  ["design\\/3\\.projects\\/slide-2", "slide2"],
  ["design\\/3\\.projects\\/slide-3", "slide3"],
  ["design\\/3\\.projects\\/thumb-1", "thumb1"],
  ["design\\/3\\.projects\\/thumb-2", "thumb2"],
  ["design\\/3\\.projects\\/thumb-3", "thumb3"],
  ["design\\/4\\.captions\\/image-[^-]+-1", "captionStart"],
  ["design\\/4\\.captions\\/image-[^-]+-2", "captionEnd"],
  ["design\\/5\\.balcons\\/balcon-", "balcon"],
  ["design\\/6\\.materials\\/material", "materials"],
  ["design\\/7\\.slider\\/slider-[^/]+-1", "slider1"],
  ["design\\/7\\.slider\\/slider-[^/]+-2", "slider2"],
  ["design\\/8\\.gallery\\/image-1", "gallery1"],
  ["design\\/8\\.gallery\\/image-2", "gallery2"],
  ["design\\/9\\.flats\\/image-[^/]+-1", "flat1"],
  ["design\\/9\\.flats\\/image-[^/]+-2", "flat2"],
  ["design\\/9\\.flats\\/image-[^/]+-3", "flat3"],
  ["design\\/10\\.more\\/more-", "more"],
];

/** @type {Array<{
 *  id: string;
 *  outDir: string;
 *  route: string;
 *  documentTitle: string;
 *  mobileTitle: string;
 *  h1Title: string;
 *  metaDescription: string;
 *  media: Record<string, string>;
 *  copy: Array<[string, string]>;
 *  story: {
 *    overviewLead: string;
 *    course1: string;
 *    course2: string;
 *    course3: string;
 *    flatsBody: string;
 *    townhousesBody: string;
 *    penthousesBody: string;
 *    flatsLabel: string;
 *    townhousesLabel: string;
 *    penthousesLabel: string;
 *    flatsStat1: string;
 *    flatsStat2: string;
 *    flatsStat3: string;
 *    townStat1: string;
 *    townStat2: string;
 *    townStat3: string;
 *    pentStat1: string;
 *    pentStat2: string;
 *    pentStat3: string;
 *    balcon1: string;
 *    balcon2: string;
 *    legal: string;
 *  };
 * }>} */
const PAGES = [
  {
    id: "luxury-rooms",
    outDir: "luxury-rooms",
    route: "/luxury-cabins-Nile-Cruise",
    documentTitle: "Hathor | Luxury Rooms",
    mobileTitle: "Luxury Rooms",
    h1Title: "Luxury Rooms",
    metaDescription:
      "Small Luxury Nile Cruise Rooms | Boutique Nile Cruise Hathor Dahabiya",
    media: {
      intro: "/media/hathor/r2/room-luxury.webp",
      spiral: "/media/hathor/scraped/cabin-1.webp",
      projectsBg: "/media/hathor/scraped/cabin-2.webp",
      slide2: "/media/hathor/scraped/cabin-3.webp",
      slide3: "/media/hathor/scraped/cabin-4.webp",
      thumb1: "/media/hathor/scraped/cabin-1.webp",
      thumb2: "/media/hathor/scraped/cabin-3.webp",
      thumb3: "/media/hathor/scraped/cabin-5.webp",
      captionStart: "/media/hathor/r2/room-luxury.webp",
      captionEnd: "/media/hathor/scraped/cabin-2.webp",
      balcon: "/media/hathor/scraped/cabin-5.webp",
      materials: "/media/hathor/scraped/cabin-6.webp",
      slider1: "/media/hathor/scraped/cabin-7.webp",
      slider2: "/media/hathor/scraped/cabin-8.webp",
      gallery1: "/media/hathor/scraped/cabin-3.webp",
      gallery2: "/media/hathor/scraped/cabin-4.webp",
      flat1: "/media/hathor/r2/room-luxury.webp",
      flat2: "/media/hathor/scraped/cabin-1.webp",
      flat3: "/media/hathor/scraped/cabin-5.webp",
      more: "/media/hathor/scraped/cabin-2.webp",
    },
    copy: [
      [
        "Harmony in&nbsp;Greenery <br>\nand Glass",
        "Luxury Rooms<br>\n22 m² · Nile View",
      ],
      [
        "Springs resembles streams of&nbsp;transparent air and clear water sculpted into&nbsp;an&nbsp;asymmetrical glass tower that soars towards&nbsp;the&nbsp;sky. Wave-like&nbsp;longlines wrap around&nbsp;the&nbsp;facade and reveal verdant terraces that offer a&nbsp;vantage point for&nbsp;observation and introspection.",
        "Every cabin offers a peaceful retreat with wide-ranging Nile views&mdash;an exclusive Dahabiya-style journey without other travelers aboard.",
      ],
      ["Crystal-Clear Vision", "Panoramic Nile Calm"],
      [
        "Glowing building of&nbsp;limitless light resembles a&nbsp;lens refracting a&nbsp;kaleidoscope of&nbsp;reflections.",
        "Boutique cabins<br>shaped for stillness.",
      ],
      [
        "The&nbsp;concept of&nbsp;Springs is to&nbsp;merge architecture and nature within&nbsp;the&nbsp;optical focus of&nbsp;a&nbsp;vision reaching into&nbsp;tomorrow.",
        "Temple shores by day.<br>Cabin quiet by night.",
      ],
      [
        "Ultra-transparent panoramic windows, aluminum panels with&nbsp;restrained luster, natural oak-framed loggias, marble flooring",
        "Soft light, handcrafted detail, and panoramic glass open onto the eternal Nile.",
      ],
      ["Frozen Music", "Morning River Light"],
      [
        "Springs resembles a&nbsp;waterfall that ceased flowing, as&nbsp;if you could hear roaring cascades and the&nbsp;delicate chiming of&nbsp;scattered drops in&nbsp;a&nbsp;matter of&nbsp;seconds. How did we create this effect?",
        "Wake to temple banks and soft water. Return to elegant decor, dedicated staff, and a cabin made for quiet recovery.",
      ],
      ["Aristocratic Quartet", "Cabin Comfort Details"],
      [
        "Glass, metal, stone, and wood&nbsp;&mdash; the&nbsp;four elements that define the&nbsp;essence of&nbsp;Springs, an&nbsp;airy yet durable structure.",
        "LED screens, walk-in shower or bathtub, safe box, tea facilities&mdash;crafted for Nile nights.",
      ],
      [
        "High-clarity glass makes our building appear levitating, while stone and wood allow you to&nbsp;feel the&nbsp;essence of&nbsp;time&nbsp;&mdash; time that you'll wish to&nbsp;halt again and again to&nbsp;admire the&nbsp;elegance that adorns your life.",
        "Air-conditioned cool, handcrafted finishes, and private space to sail the Timeless Nile without compromise.",
      ],
      ["Rich<br>\nInterior<br>\nLife", "Quiet<br>Cabin<br>Sanctuary"],
      [
        "Imagine bathing in&nbsp;the&nbsp;crystal-clear pool, your whole body feeling light and energized. The&nbsp;splashing water carrying all superficial thoughts away. You emerge, feeling pleasant coolness on&nbsp;your skin.",
        "Bathtub or walk-in shower, soft river light, and the hush of a private Dahabiya cabin after shore excursions.",
      ],
      [
        "Our fitness center, offering state-of-the-art equipment, supports your health and well-being. Panoramic windows and comfortable environment guarantee your full satisfaction.",
        "Hathor fine dining showcases regional dishes in a close-knit setting&mdash;an Exclusive Private Small Luxury Nile Cruise.",
      ],
      ["Art Gallery<br>\nof&nbsp;Your Life", "Cabins for<br>Timeless Journeys"],
      [
        "Our viewing terraces will surround you with&nbsp;beauty of&nbsp;botanical sculptures.",
        "Luxor to Aswan. Three, four, or seven nights. Your cabin remains the constant.",
      ],
      [
        "Our Wellness center will greet you with&nbsp;beauty chiseled in&nbsp;marble and dissolved in&nbsp;water.",
        "Request cabin availability with Hathor Concierge.",
      ],
      ["Limitless vision", "Boutique Nile Cabins"],
      ["Continue exploring", "Explore Voyages"],
      ["Townhouses", "Elegant Suites"],
      ["Penthouses", "Royal Suites"],
      ["Amenities", "Cabin Comforts"],
      [
        "At&nbsp;Springs, you can dream, plan boldly, and enjoy life&nbsp;&mdash; here and now.",
        "A private cabin, a quiet river, and time entirely your own.",
      ],
    ],
    story: {
      overviewLead:
        "The Hathor Dahabiya provides an Elegant, Private Dahabiya Cruise&mdash;Dive into the Authentic Boutique Nile Cruise experience tailored for travelers who want the Timeless Nile River.",
      course1: "Luxury King Bed<br>Luxor / Aswan / Luxor",
      course2: "Luxury Cabin<br>Aswan to Luxor",
      course3: "Luxury Cabin<br>Luxor to Aswan",
      flatsBody:
        "Every cabin offers a peaceful and relaxing space with wide-ranging Nile views in complete comfort&mdash;an exclusive Dahabiya-style journey without other travelers aboard.",
      townhousesBody:
        "Visit majestic temples and ancient sites, then return to elegant decor and dedicated staff. Hathor fine dining showcases traditional regional dishes in a close-knit setting.",
      penthousesBody:
        "The Hathor Dahabiya Nile cruise experience delivers exceptional comfort and exclusive experiences that create enduring memories for all visitors to Egypt.",
      flatsLabel: "Luxury Rooms",
      townhousesLabel: "Luxury Suites",
      penthousesLabel: "Royal Suites",
      flatsStat1: "8 Luxury Cabins",
      flatsStat2: "22 m<sup>2</sup> · Nile view",
      flatsStat3: "Maximum 2 Persons",
      townStat1: "2 Elegant Suites",
      townStat2: "Spacious suite living",
      townStat3: "Panoramic windows",
      pentStat1: "2 Royal Suites",
      pentStat2: "56 m<sup>2</sup> · Nile view",
      pentStat3: "Private balcony",
      balcon1:
        "Panoramic cabin windows open onto river light&mdash;temple banks and soft water become the backdrop to morning coffee and evening stillness.",
      balcon2:
        "Thoughtful cabin systems wait a few steps from your bed&mdash;LED screens, climate, tea facilities, and quiet modern comfort shaped for Nile nights.",
      legal:
        "Cabin imagery and descriptions are curated for illustration. Availability, itineraries, and pricing are confirmed with Hathor&rsquo;s reservations desk. All Hathor content and design remain protected.",
    },
  },
  {
    id: "luxury-suites",
    outDir: "luxury-suites",
    route: "/rooms",
    documentTitle: "Hathor | Luxury Suites",
    mobileTitle: "Luxury Suites",
    h1Title: "Luxury Suites",
    metaDescription: "Luxury suites on Nile cruise | Hathor Dahabiya Cruise",
    media: {
      intro: "/media/hathor/r2/room-suite.webp",
      spiral: "/media/hathor/scraped/luxsuite-1.webp",
      projectsBg: "/media/hathor/scraped/luxsuite-2.webp",
      slide2: "/media/hathor/scraped/luxsuite-3.webp",
      slide3: "/media/hathor/scraped/luxsuite-4.webp",
      thumb1: "/media/hathor/scraped/luxsuite-1.webp",
      thumb2: "/media/hathor/scraped/luxsuite-3.webp",
      thumb3: "/media/hathor/scraped/luxsuite-5.webp",
      captionStart: "/media/hathor/r2/room-suite.webp",
      captionEnd: "/media/hathor/scraped/luxsuite-2.webp",
      balcon: "/media/hathor/scraped/luxsuite-5.webp",
      materials: "/media/hathor/scraped/luxsuite-6.webp",
      slider1: "/media/hathor/scraped/luxsuite-4.webp",
      slider2: "/media/hathor/scraped/luxsuite-6.webp",
      gallery1: "/media/hathor/scraped/luxsuite-1.webp",
      gallery2: "/media/hathor/scraped/luxsuite-3.webp",
      flat1: "/media/hathor/r2/room-suite.webp",
      flat2: "/media/hathor/scraped/luxsuite-2.webp",
      flat3: "/media/hathor/scraped/luxsuite-5.webp",
      more: "/media/hathor/scraped/luxsuite-4.webp",
    },
    copy: [
      [
        "Harmony in&nbsp;Greenery <br>\nand Glass",
        "Luxury Suites<br>\nRiver Sanctuaries",
      ],
      [
        "Springs resembles streams of&nbsp;transparent air and clear water sculpted into&nbsp;an&nbsp;asymmetrical glass tower that soars towards&nbsp;the&nbsp;sky. Wave-like&nbsp;longlines wrap around&nbsp;the&nbsp;facade and reveal verdant terraces that offer a&nbsp;vantage point for&nbsp;observation and introspection.",
        "Discover effortless luxury in the Accessible Hathor Suite&mdash;a spacious, elegantly designed retreat crafted for comfort, ease, and refined living.",
      ],
      ["Crystal-Clear Vision", "Suite Light · Nile Horizon"],
      [
        "Glowing building of&nbsp;limitless light resembles a&nbsp;lens refracting a&nbsp;kaleidoscope of&nbsp;reflections.",
        "Elegant suites<br>for unmatched privacy.",
      ],
      [
        "The&nbsp;concept of&nbsp;Springs is to&nbsp;merge architecture and nature within&nbsp;the&nbsp;optical focus of&nbsp;a&nbsp;vision reaching into&nbsp;tomorrow.",
        "Authenticity with luxury.<br>Stillness with craft.",
      ],
      [
        "Ultra-transparent panoramic windows, aluminum panels with&nbsp;restrained luster, natural oak-framed loggias, marble flooring",
        "Timeless sophistication with modern amenities&mdash;a private Dahabiya suite experience for each voyage choice.",
      ],
      ["Frozen Music", "Accessible Hathor Suite"],
      [
        "Springs resembles a&nbsp;waterfall that ceased flowing, as&nbsp;if you could hear roaring cascades and the&nbsp;delicate chiming of&nbsp;scattered drops in&nbsp;a&nbsp;matter of&nbsp;seconds. How did we create this effect?",
        "Thoughtfully tailored so every guest feels perfectly at home, without compromise&mdash;cool air, handcrafted design, serene unwind.",
      ],
      ["Aristocratic Quartet", "Suite Living Details"],
      [
        "Glass, metal, stone, and wood&nbsp;&mdash; the&nbsp;four elements that define the&nbsp;essence of&nbsp;Springs, an&nbsp;airy yet durable structure.",
        "Warm woods, soft textiles, LED screens, walk-in showers or bathtubs&mdash;suite systems shaped for Nile nights.",
      ],
      [
        "High-clarity glass makes our building appear levitating, while stone and wood allow you to&nbsp;feel the&nbsp;essence of&nbsp;time&nbsp;&mdash; time that you'll wish to&nbsp;halt again and again to&nbsp;admire the&nbsp;elegance that adorns your life.",
        "Whether you stay in Elegant Dahabiya Suites or enjoy Royal Suites with Panoramic Nile View, you receive unmatched comfort and exclusive privacy.",
      ],
      ["Rich<br>\nInterior<br>\nLife", "Private<br>Suite<br>Horizon"],
      [
        "Imagine bathing in&nbsp;the&nbsp;crystal-clear pool, your whole body feeling light and energized. The&nbsp;splashing water carrying all superficial thoughts away. You emerge, feeling pleasant coolness on&nbsp;your skin.",
        "Bathtub or walk-in shower, soft suite light, and the hush of a private Dahabiya after temple shores.",
      ],
      [
        "Our fitness center, offering state-of-the-art equipment, supports your health and well-being. Panoramic windows and comfortable environment guarantee your full satisfaction.",
        "Each elegant cabin is a refined haven, combining modern comforts with authentic Egyptian artistry along the majestic Nile.",
      ],
      ["Art Gallery<br>\nof&nbsp;Your Life", "Suites for<br>Private Voyages"],
      [
        "Our viewing terraces will surround you with&nbsp;beauty of&nbsp;botanical sculptures.",
        "Luxury Rooms, Elegant Suites, and Royal Suites&mdash;choose your sanctuary aboard Hathor.",
      ],
      [
        "Our Wellness center will greet you with&nbsp;beauty chiseled in&nbsp;marble and dissolved in&nbsp;water.",
        "Request suite availability with Hathor Concierge.",
      ],
      ["Limitless vision", "Elegant Nile Suites"],
      ["Continue exploring", "Explore Voyages"],
      ["Townhouses", "Elegant Suites"],
      ["Penthouses", "Royal Suites"],
      ["Amenities", "Suite Comforts"],
      [
        "At&nbsp;Springs, you can dream, plan boldly, and enjoy life&nbsp;&mdash; here and now.",
        "A private suite, a quiet river, and time entirely your own.",
      ],
    ],
    story: {
      overviewLead:
        "Experience Hathor Dahabiya Cruise that blends authenticity with luxury, offering an unforgettable journey by the timeless Nile.",
      course1: "Luxury Rooms<br>Panoramic Cabins",
      course2: "Elegant Suites<br>Accessible Comfort",
      course3: "Royal Suites<br>Nile Panorama",
      flatsBody:
        "Our Small Luxury Nile Cruise Rooms offer everything you expect from a Nile View luxury cabin and more&mdash;cool retreats with handcrafted design.",
      townhousesBody:
        "The Elegant Nile Cruise Cabins provide a cool retreat through air-conditioned spaces which show off their handcrafted designs. Luxury Nile Cruise Rooms provide a serene, stylish environment to unwind.",
      penthousesBody:
        "The Royal Suite with Panoramic Nile View delivers the highest level of luxury through exceptional views and ultimate relaxation aboard Hathor Dahabiya.",
      flatsLabel: "Luxury Rooms",
      townhousesLabel: "Luxury Suites",
      penthousesLabel: "Royal Suites",
      flatsStat1: "8 Luxury Cabins",
      flatsStat2: "22 m<sup>2</sup> · Nile view",
      flatsStat3: "Maximum 2 Persons",
      townStat1: "2 Elegant Suites",
      townStat2: "Accessible Hathor Suite",
      townStat3: "Refined suite living",
      pentStat1: "2 Royal Suites",
      pentStat2: "56 m<sup>2</sup> · Nile view",
      pentStat3: "Private balcony",
      balcon1:
        "Here, the Nile becomes part of your suite. River light fills panoramic windows; temple banks become the backdrop to morning coffee and quiet conversation.",
      balcon2:
        "Hathor suite craft emphasizes panoramic glass, private calm, and modern comfort&mdash;freedom of rest, elegance of detail, and visual lightness on the water.",
      legal:
        "Suite imagery and descriptions are curated for illustration. Availability, itineraries, and pricing are confirmed with Hathor&rsquo;s reservations desk. All Hathor content and design remain protected.",
    },
  },
  {
    id: "royal-suites",
    outDir: "royal-suites",
    route: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    documentTitle: "Hathor | Luxury Royal Suites",
    mobileTitle: "Royal Suites",
    h1Title: "Royal Suites",
    metaDescription:
      "Luxury Dahabiya Royal Suite | Private Dahabiya Nile cruise",
    media: {
      intro: "/media/hathor/r2/room-royal.webp",
      spiral: "/media/hathor/scraped/royal-1.webp",
      projectsBg: "/media/hathor/scraped/royal-2.webp",
      slide2: "/media/hathor/scraped/royal-3.webp",
      slide3: "/media/hathor/scraped/royal-4.webp",
      thumb1: "/media/hathor/scraped/royal-1.webp",
      thumb2: "/media/hathor/scraped/royal-3.webp",
      thumb3: "/media/hathor/scraped/royal-5.webp",
      captionStart: "/media/hathor/r2/room-royal.webp",
      captionEnd: "/media/hathor/scraped/royal-2.webp",
      balcon: "/media/hathor/scraped/royal-5.webp",
      materials: "/media/hathor/scraped/royal-6.webp",
      slider1: "/media/hathor/scraped/royal-7.webp",
      slider2: "/media/hathor/scraped/royal-8.webp",
      gallery1: "/media/hathor/scraped/royal-3.webp",
      gallery2: "/media/hathor/scraped/royal-4.webp",
      flat1: "/media/hathor/r2/room-royal.webp",
      flat2: "/media/hathor/scraped/royal-1.webp",
      flat3: "/media/hathor/scraped/royal-5.webp",
      more: "/media/hathor/scraped/royal-2.webp",
    },
    copy: [
      [
        "Harmony in&nbsp;Greenery <br>\nand Glass",
        "Royal Suites<br>\n56 m² · Nile Whisper",
      ],
      [
        "Springs resembles streams of&nbsp;transparent air and clear water sculpted into&nbsp;an&nbsp;asymmetrical glass tower that soars towards&nbsp;the&nbsp;sky. Wave-like&nbsp;longlines wrap around&nbsp;the&nbsp;facade and reveal verdant terraces that offer a&nbsp;vantage point for&nbsp;observation and introspection.",
        "Luxury Royal Suites and Nile whisper stories of kings&mdash;designed for privacy, historic decoration, and modern conveniences aboard Hathor Dahabiya.",
      ],
      ["Crystal-Clear Vision", "Royal Panorama"],
      [
        "Glowing building of&nbsp;limitless light resembles a&nbsp;lens refracting a&nbsp;kaleidoscope of&nbsp;reflections.",
        "Signature Royal Suite<br>on a private Dahabiya.",
      ],
      [
        "The&nbsp;concept of&nbsp;Springs is to&nbsp;merge architecture and nature within&nbsp;the&nbsp;optical focus of&nbsp;a&nbsp;vision reaching into&nbsp;tomorrow.",
        "Authenticity, royalty,<br>and forever luxury.",
      ],
      [
        "Ultra-transparent panoramic windows, aluminum panels with&nbsp;restrained luster, natural oak-framed loggias, marble flooring",
        "Panoramic windows and a private balcony&mdash;unforgettable Nile views as you sail Luxor and Aswan.",
      ],
      ["Frozen Music", "Stories of Kings"],
      [
        "Springs resembles a&nbsp;waterfall that ceased flowing, as&nbsp;if you could hear roaring cascades and the&nbsp;delicate chiming of&nbsp;scattered drops in&nbsp;a&nbsp;matter of&nbsp;seconds. How did we create this effect?",
        "Lose yourself in the heart of the Nile with Royal Suites tailored for those who appreciate authenticity, royalty, and comfort.",
      ],
      ["Aristocratic Quartet", "Royal Suite Details"],
      [
        "Glass, metal, stone, and wood&nbsp;&mdash; the&nbsp;four elements that define the&nbsp;essence of&nbsp;Springs, an&nbsp;airy yet durable structure.",
        "Jacuzzi, smart systems, panoramic Nile view, and 56 square meters of private sanctuary.",
      ],
      [
        "High-clarity glass makes our building appear levitating, while stone and wood allow you to&nbsp;feel the&nbsp;essence of&nbsp;time&nbsp;&mdash; time that you'll wish to&nbsp;halt again and again to&nbsp;admire the&nbsp;elegance that adorns your life.",
        "Traditional craftsmanship blends seamlessly with modern luxury&mdash;the perfect setting for an unforgettable private Dahabiya Nile cruise.",
      ],
      ["Rich<br>\nInterior<br>\nLife", "Private<br>Royal<br>Retreat"],
      [
        "Imagine bathing in&nbsp;the&nbsp;crystal-clear pool, your whole body feeling light and energized. The&nbsp;splashing water carrying all superficial thoughts away. You emerge, feeling pleasant coolness on&nbsp;your skin.",
        "Bathtub or walk-in shower, Jacuzzi calm, and the hush of a Private Royal Suite with Nile View after temple shores.",
      ],
      [
        "Our fitness center, offering state-of-the-art equipment, supports your health and well-being. Panoramic windows and comfortable environment guarantee your full satisfaction.",
        "Step into the Signature Royal Suite and lose yourself in forever luxury aboard a private Dahabiya Nile cruise.",
      ],
      ["Art Gallery<br>\nof&nbsp;Your Life", "Royal Suites<br>for Rare Voyages"],
      [
        "Our viewing terraces will surround you with&nbsp;beauty of&nbsp;botanical sculptures.",
        "7 nights Luxor–Aswan–Luxor. 3 nights Aswan to Luxor. 4 nights Luxor to Aswan.",
      ],
      [
        "Our Wellness center will greet you with&nbsp;beauty chiseled in&nbsp;marble and dissolved in&nbsp;water.",
        "Request Royal Suite availability with Hathor Concierge.",
      ],
      ["Limitless vision", "Luxury Royal Suites"],
      ["Continue exploring", "Explore Voyages"],
      ["Townhouses", "Elegant Suites"],
      ["Penthouses", "Royal Suites"],
      ["Amenities", "Royal Comforts"],
      [
        "At&nbsp;Springs, you can dream, plan boldly, and enjoy life&nbsp;&mdash; here and now.",
        "A Royal Suite, a quiet river, and time entirely your own.",
      ],
    ],
    story: {
      overviewLead:
        "Experience a luxury authentic journey in our Royal Suite Nile Cruise aboard the Hathor Dahabiya Cruise Egypt&mdash;a memorable Luxury Nile Sailing Boat on a private Dahabiya Nile cruise.",
      course1: "Royal Suite<br>Luxor / Aswan / Luxor",
      course2: "Royal Suite<br>Aswan / Luxor",
      course3: "Royal Suite<br>Luxor / Aswan",
      flatsBody:
        "They are designed for privacy and luxury, featuring Hathor elegant interior, historic decorations, and modern conveniences that comprise a luxurious fine stay.",
      townhousesBody:
        "The Royal Suite with Panoramic Nile View features panoramic windows and a private balcony, allowing unforgettable views of the Nile as you sail through Luxor and Aswan.",
      penthousesBody:
        "For visitors who seek added exclusivity, the Private Royal Suite with Nile View provides a peaceful retreat and luxury furniture with personalized comfort aboard Hathor Luxury Dahabiya.",
      flatsLabel: "Luxury Rooms",
      townhousesLabel: "Luxury Suites",
      penthousesLabel: "Royal Suites",
      flatsStat1: "8 Luxury Cabins",
      flatsStat2: "22 m<sup>2</sup> · Nile view",
      flatsStat3: "Maximum 2 Persons",
      townStat1: "2 Elegant Suites",
      townStat2: "Spacious suite living",
      townStat3: "Panoramic windows",
      pentStat1: "2 Royal Suites",
      pentStat2: "56 m<sup>2</sup> · Nile view",
      pentStat3: "Maximum 4 Persons",
      balcon1:
        "Panoramic glass and a private balcony follow the river&mdash;rhythmic beauty with functional elegance for a Royal Suite voyage.",
      balcon2:
        "Three movements of the journey&mdash;Luxor, the river, Aswan&mdash;each evening arrives in its own rhythm while the suite reads the light outside.",
      legal:
        "Royal Suite imagery and descriptions are curated for illustration. Availability, itineraries, and pricing are confirmed with Hathor&rsquo;s reservations desk. All Hathor content and design remain protected.",
    },
  },
];

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

function applyStory(html, page) {
  const { story } = page;
  return html
    .replace(
      /The&nbsp;architects of&nbsp;the&nbsp;acclaimed Istanbul-based bureau Tabanlioglu masterfully frame the&nbsp;world’s leading megapolises with&nbsp;the&nbsp;silhouettes of&nbsp;their glistening buildings\./g,
      story.overviewLead,
    )
    .replaceAll("Bureau’s signature projects:", "Voyage signatures aboard:")
    .replaceAll(
      "Dakar<br>International Conference Centre, Senegal",
      story.course1,
    )
    .replaceAll("Astana <br>Arena Stadium, Kazakhstan", story.course2)
    .replaceAll("Istanbul<br>Sapphire Skyscraper, Turkey", story.course3)
    .replace(
      /Our view flats transform[\s\S]*?the&nbsp;megapolises\./g,
      story.flatsBody,
    )
    .replace(
      /Our boutique townhouses embody[\s\S]*?your face\./g,
      story.townhousesBody,
    )
    .replace(
      /When you live in this penthouse,[\s\S]*?with ease\./g,
      story.penthousesBody,
    )
    .replaceAll("Garden of Fulfilled Expectations", "Garden of Nile Light")
    .replaceAll("Glowing Perspectives", "Riverlight Perspectives")
    .replaceAll("Beauty at Your Fingertips", "Every detail, quietly handled")
    .replaceAll("138 view flats", story.flatsStat1)
    .replaceAll("138 view Flats", story.flatsStat1)
    .replaceAll("62-347 m<sup>2</sup> area", story.flatsStat2)
    .replaceAll("Unique transformable glazing", story.flatsStat3)
    .replaceAll("5 townhouses", story.townStat1)
    .replaceAll("174-378 m<sup>2</sup> area", story.townStat2)
    .replaceAll("Ceiling heights up to 4 meters", story.townStat3)
    .replaceAll("Private patio", "Nile-facing stillness")
    .replaceAll("7 penthouses", story.pentStat1)
    .replaceAll("Luxurious terraces", story.pentStat2)
    .replaceAll("Designer finishings", story.pentStat3)
    .replaceAll(
      "The balconies of the asymmetrical facade follow a chessboard pattern. The non-linear order creates a striking, recognizable effect.",
      story.balcon1,
    )
    .replaceAll(
      "The architects divided the uniform transparent facade into three vertical sections, with the terraces situated in the recesses. This is how we graft rhythmic beauty with functional elegance.",
      story.balcon2,
    )
    .replaceAll(
      "Our view flats transform the&nbsp;city into&nbsp;an&nbsp;element of&nbsp;your interior design; not a&nbsp;mere landscape but a&nbsp;panorama of&nbsp;seven historical parks, a&nbsp;river shifting shades, and the&nbsp;capital's iconic landmarks in&nbsp;full view. It’s the&nbsp;coziness of&nbsp;a&nbsp;country house with&nbsp;the&nbsp;expanse of&nbsp;the&nbsp;megapolises.",
      story.flatsBody,
    )
    .replaceAll(
      "Our boutique townhouses embody intimate coziness. The&nbsp;day’s worries fade away like&nbsp;shadows of&nbsp;butterfly wings, when you step onto&nbsp;the&nbsp;sunlit ground-floor patio. Here, you can stroll in&nbsp;light shoes, feel the&nbsp;gentle breeze, and close your eyes as&nbsp;the&nbsp;sun warmly kisses your face.",
      story.townhousesBody,
    )
    .replaceAll(
      "When you live in&nbsp;this penthouse, you feel like&nbsp;you own a&nbsp;piece of&nbsp;the&nbsp;sky. Here, sublime feelings transform into&nbsp;higher possibilities. Declare love, dare to&nbsp;skyrocket your career, or devise a&nbsp;million-dollar idea. Here, you can do it with&nbsp;ease.",
      story.penthousesBody,
    )
    .replace(
      /Visual representations of&nbsp;the&nbsp;property[\s\S]*?rights holder\./g,
      story.legal,
    )
    .replace(
      /(<h2 class="g1[^"]*"[^>]*>\s*)Flats(\s*<\/h2>)/,
      `$1${story.flatsLabel}$2`,
    )
    .replaceAll(">Townhouses<", `>${story.townhousesLabel}<`)
    .replaceAll(">Penthouses<", `>${story.penthousesLabel}<`)
    .replaceAll(">Flats<", `>${story.flatsLabel}<`);
}

function buildPalette(page) {
  const title = page.mobileTitle.replaceAll('"', '\\"');
  return `
<style data-hathor-accommodation-palette>
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
  :root {
    --c-beige-background: #f5eacf;
    --c-beige-background-rgb: 245, 234, 207;
    --c-beige: #f5eacf;
    --c-beige-rgb: 245, 234, 207;
    --c-dark-green: #b69f64;
    --c-dark-green-rgb: 182, 159, 100;
    --c-green: #b69f64;
    --c-green-rgb: 182, 159, 100;
    --c-light-green: #b69f64;
    --c-light-green-rgb: 182, 159, 100;
    --c-olive: #b69f64;
    --c-olive-rgb: 182, 159, 100;
    --c-dark-blue: #cdbfa6;
    --c-dark-blue-rgb: 205, 191, 166;
    --c-blue: #b69f64;
    --c-blue-rgb: 182, 159, 100;
    --c-light-blue: #f5eacf;
    --c-light-blue-rgb: 245, 234, 207;
    --c-sky: #f5eacf;
    --c-sky-rgb: 245, 234, 207;
    --cookie-height: 0px;
  }
  body {
    background: #f5eacf !important;
    color: #b69f64;
    font-family: "Hathor Body", "TT Commons", sans-serif;
  }
  .ui-dark, .ui-dark-background, .ui-dark.ui-background {
    --t-background: #b69f64;
    --t-background-rgb: 182, 159, 100;
    --t-text: #f5eacf;
    --t-text-rgb: 245, 234, 207;
    --t-heading: #f5eacf;
    --t-heading-rgb: 245, 234, 207;
    --t-primary: #b69f64;
    background-color: #b69f64 !important;
    color: #f5eacf !important;
  }
  .ui-light, .ui-light-background, .ui-light.ui-background {
    --t-background: #f5eacf;
    --t-background-rgb: 245, 234, 207;
    --t-text: #b69f64;
    --t-text-rgb: 182, 159, 100;
    --t-heading: #b69f64;
    --t-heading-rgb: 182, 159, 100;
    --t-primary: #b69f64;
    background-color: #f5eacf !important;
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
  .ui-dark .text-c1, .ui-dark .text-c2 { color: #f5eacf; }
  #de-intro .de-intro__caption,
  #de-projects .de-projects__caption,
  .more-block__caption { color: #f5eacf; }
  #de-intro .de-intro__caption .g1,
  #de-intro .de-intro__caption .h3,
  #de-projects .de-projects__caption .g1,
  #de-projects .de-projects__caption .h3,
  .more-block__caption .h0 { color: #f5eacf; }
  #de-intro .de-intro__caption-title.is-hidden--lg-up img { opacity: 0; }
  #de-intro .de-intro__caption-title.is-hidden--lg-up::after {
    color: #f5eacf;
    content: "${title}";
    font-family: "Hathor Display", "Gamgote", Georgia, serif;
    font-size: clamp(2.6rem, 12vw, 5.5rem);
    line-height: 0.9;
  }
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
  #de-projects .de-projects__background { z-index: 0 !important; }
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
  .header, .cookie-consent, .turn-message,
  .de-balcons__pin, .de-balcons__pin-tooltip {
    display: none !important;
  }
  .de-intro__gradient div,
  .de-spiral__gradient div,
  .de-gallery__gradient div,
  .de-slider__mobile-scrollable-gradient div {
    background: radial-gradient(circle, rgba(182, 159, 100, 0.86) 0%, rgba(182, 159, 100, 0.38) 45%, rgba(182, 159, 100, 0) 74%) !important;
  }
  #de-spiral .de-spiral__uptitle,
  #de-projects .de-projects__pagination,
  #de-projects .de-projects__logo {
    display: none !important;
  }
  .hathor-accommodation-project-logo {
    display: block;
    width: 44px;
    height: 44px;
    background: #b69f64;
    -webkit-mask: url("/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg") center / contain no-repeat;
    mask: url("/branding/hathor-logo-nile-cruise-panorama-on-nile-visit-egypt-HATHOR-ICON-dark.svg") center / contain no-repeat;
  }
  html:not(.accommodation-media-ready) picture,
  html:not(.accommodation-media-ready) img[data-src],
  html:not(.accommodation-media-ready) img[src*="springs."],
  html:not(.accommodation-media-ready) .de-captions__canvas {
    opacity: 0 !important;
    visibility: hidden !important;
  }
</style>`;
}

function buildRuntime(page) {
  return `
<script data-accommodation-media-runtime>
(() => {
  const PAGE_ID = ${JSON.stringify(page.id)};
  const FILE_TO_SLOT = {
    "room-luxury.webp": "room-luxury",
    "room-suite.webp": "room-suite",
    "room-royal.webp": "room-royal",
    "cabin-1.webp": "scraped-cabin-1",
    "cabin-2.webp": "scraped-cabin-2",
    "cabin-3.webp": "scraped-cabin-3",
    "cabin-4.webp": "scraped-cabin-4",
    "cabin-5.webp": "scraped-cabin-5",
    "cabin-6.webp": "scraped-cabin-6",
    "cabin-7.webp": "scraped-cabin-7",
    "cabin-8.webp": "scraped-cabin-8",
    "luxsuite-1.webp": "scraped-luxsuite-1",
    "luxsuite-2.webp": "scraped-luxsuite-2",
    "luxsuite-3.webp": "scraped-luxsuite-3",
    "luxsuite-4.webp": "scraped-luxsuite-4",
    "luxsuite-5.webp": "scraped-luxsuite-5",
    "luxsuite-6.webp": "scraped-luxsuite-6",
    "royal-1.webp": "scraped-royal-1",
    "royal-2.webp": "scraped-royal-2",
    "royal-3.webp": "scraped-royal-3",
    "royal-4.webp": "scraped-royal-4",
    "royal-5.webp": "scraped-royal-5",
    "royal-6.webp": "scraped-royal-6",
    "royal-7.webp": "scraped-royal-7",
    "royal-8.webp": "scraped-royal-8",
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
          if (slot) node.setAttribute("data-accommodation-slot", slot);
        }
      });
    });
    const canvas = document.querySelector("#de-captions .de-captions__canvas");
    if (canvas) {
      ["data-image-scroll-image-start", "data-image-scroll-image-end"].forEach((attribute) => {
        const raw = canvas.getAttribute(attribute);
        if (!raw) return;
        try {
          const value = JSON.parse(raw);
          const walk = (entry) => {
            if (typeof entry === "string") {
              const slot = FILE_TO_SLOT[fileNameFromUrl(entry)];
              return slot && images[slot] ? images[slot] : entry;
            }
            if (Array.isArray(entry)) return entry.map(walk);
            if (entry && typeof entry === "object") {
              Object.keys(entry).forEach((key) => { entry[key] = walk(entry[key]); });
            }
            return entry;
          };
          canvas.setAttribute(attribute, JSON.stringify(walk(value)));
        } catch (e) {}
      });
    }
  }
  function revealMedia() {
    document.documentElement.classList.add("accommodation-media-ready", "js");
    document.documentElement.classList.remove("no-js");
  }
  function boot() {
    scrubUrls(document);
    fetch("/api/accommodation-config?page=" + encodeURIComponent(PAGE_ID), { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.images) applyDashboardImages(data.images);
      })
      .catch(function () {})
      .finally(revealMedia);
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
}

function replaceAssetPattern(html, assetPattern, url) {
  const remoteSource = String.raw`(?:https?:)?\/\/[^"'\s>]*${assetPattern}[^"'\s>]*`;
  const localSource = String.raw`\/assets\/images\/media\/${assetPattern}[^"'\s>]*`;
  return html
    .replace(new RegExp(remoteSource, "g"), url)
    .replace(new RegExp(localSource, "g"), url);
}

function buildPage(page) {
  let html = fs.readFileSync(source, "utf8");

  for (const [from, to] of page.copy) {
    html = html.split(from).join(to);
  }

  for (const [pattern, key] of SHARED_ASSET_REPLACES) {
    html = replaceAssetPattern(html, pattern, page.media[key]);
  }

  html = html.replace(
    /https?:\/\/[^"'\s>]*uploads\/32\/image_1762521394\.webp/g,
    page.media.intro,
  );

  html = applyStory(html, page);

  html = html.replace(
    /(<h1 class="g1[^"]*"[^>]*>\s*)Design(\s*<\/h1>)/,
    `$1${page.h1Title}$2`,
  );

  html = html
    .replaceAll(
      "Springs | Design and architecture of&nbsp;Springs residential complex",
      page.documentTitle,
    )
    .replaceAll(
      "Apartments in&amp;nbsp;a&amp;nbsp;premium-class residential complex",
      page.metaDescription,
    )
    .replaceAll(
      "Springs | Design and architecture of&amp;nbsp;Springs residential complex",
      page.documentTitle,
    );

  html = html.replace(
    "</head>",
    `${buildPalette(page)}${buildRuntime(page)}</head>`,
  );

  html = html.replaceAll('href="/assets/', `href="${publicPrefix}/assets/`);
  html = html.replaceAll('src="/assets/', `src="${publicPrefix}/assets/`);
  html = html.replaceAll(
    'data-src="/assets/',
    `data-src="${publicPrefix}/assets/`,
  );
  html = html.replaceAll(
    'srcset="/assets/',
    `srcset="${publicPrefix}/assets/`,
  );
  html = html.replaceAll(
    'data-srcset="/assets/',
    `data-srcset="${publicPrefix}/assets/`,
  );
  html = html.replaceAll(
    "xlink:href=\"&#x2F;assets&#x2F;",
    `xlink:href="&#x2F;accommodation-springs&#x2F;assets&#x2F;`,
  );
  html = html.replaceAll(
    'href="&#x2F;assets&#x2F;',
    'href="&#x2F;accommodation-springs&#x2F;assets&#x2F;',
  );

  const fallback = page.media.intro;
  const fallbackEncoded = fallback
    .replaceAll(":", "&#x3A;")
    .replaceAll("/", "&#x5C;&#x2F;");

  html = html.replace(
    /(?:https?:)?\/\/springs\.(?:estate|house)\/(?:media|assets\/images\/media)\/[^"'\\\s>]+/gi,
    fallback,
  );

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
    `data-image-scroll-image-start="${captionFrame(page.media.captionStart)}"`,
  );
  html = html.replace(
    /data-image-scroll-image-end="[^"]*"/,
    `data-image-scroll-image-end="${captionFrame(page.media.captionEnd)}"`,
  );

  html = html.replace(
    /https&#x3A;(?:&#x5C;&#x2F;){2}springs\.(?:estate|house)(?:&#x5C;&#x2F;(?:[A-Za-z0-9._@%-]|&#x25;[0-9A-Fa-f]{2})+)+/gi,
    fallbackEncoded,
  );
  html = html.replaceAll("https://springs.estate/", "https://springs.house/");

  html = html.replace(
    /<script[^>]*browser-message\/browser-message\.js[^>]*><\/script>/g,
    "",
  );

  html = html
    .replace(
      /Our view flats[\s\S]*?megapolises\./g,
      page.story.flatsBody,
    )
    .replace(
      /Our boutique townhouses[\s\S]*?your face\./g,
      page.story.townhousesBody,
    )
    .replace(
      /When you live in&nbsp;this penthouse,[\s\S]*?ease\./g,
      page.story.penthousesBody,
    )
    .replace(
      /Visual representations of&nbsp;the&nbsp;property,[\s\S]*?rights holder\./g,
      page.story.legal,
    );

  html = html.replace(
    /(<img class="de-projects__logo[\s\S]*?>)/,
    '$1<span class="hathor-accommodation-project-logo" aria-hidden="true"></span>',
  );

  const siteLinks = [
    ["https://springs.house/infrastructure", "/wellness"],
    ["https://springs.house/privacy-policy", "/contact"],
    ["https://springs.house/agreement", "/contact"],
    ["https://springs.house/location", "/highlights"],
    ["https://springs.house/gallery", "/highlights"],
    ["https://springs.house/about", "/about"],
    ["https://springs.house/visual-search", "/cruises"],
    ["https://springs.house/design", page.route],
    ["https://springs.estate/infrastructure", "/wellness"],
    ["https://springs.estate/privacy-policy", "/contact"],
    ["https://springs.estate/agreement", "/contact"],
    ["https://springs.estate/location", "/highlights"],
    ["https://springs.estate/gallery", "/highlights"],
    ["https://springs.estate/about", "/about"],
    ["https://springs.estate/visual-search", "/cruises"],
    ["https://springs.estate/design", page.route],
    ["/flats", "/luxury-cabins-Nile-Cruise"],
    ["/design", page.route],
    ["/infrastructure", "/wellness"],
    ["/location", "/highlights"],
    ["/gallery", "/highlights"],
    ["/", "/"],
  ];

  for (const [fromHref, toHref] of siteLinks) {
    html = rewriteHref(html, fromHref, toHref);
  }

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
    /<a\b[^>]*href="https:\/\/videinfra\.com\/"[^>]*>[\s\S]*?<\/a>/gi,
    '<span class="text-c2-small leading-trim text-color-small text-right">Hathor Dahabiya</span>',
  );

  html = html
    .replaceAll('href="https://springs.house/design"', `href="${page.route}"`)
    .replaceAll(
      'content="https://springs.house/design"',
      `content="${page.route}"`,
    )
    .replaceAll(
      'content="https://springs.house/assets/manifest/og.jpg"',
      `content="${page.media.intro}"`,
    )
    .replace(
      /href="https:\/\/springs\.house\/favicon-light\.png[^"]*"/g,
      'href="/favicon.ico"',
    );

  html = html.replace(
    /(<a\b[^>]*?)\s+href="https:\/\/springs\.(?:estate|house)\/[^"]*"/gi,
    '$1 href="/contact" target="_top" data-ajax-page-ignore',
  );

  html = html
    .replaceAll("//media/hathor/", "/media/hathor/")
    .replaceAll("https://media/hathor/", "/media/hathor/")
    .replaceAll("http://media/hathor/", "/media/hathor/");

  html = injectLuxFooterIntoHtml(html);

  const destinationDir = path.join(assetRoot, page.outDir);
  const destination = path.join(destinationDir, "index.html");
  fs.mkdirSync(destinationDir, { recursive: true });
  fs.writeFileSync(destination, html);
  console.log(`Wrote accommodation Springs Design: ${destination}`);
}

function rewriteSharedCss() {
  const cssDir = path.join(assetRoot, "assets", "stylesheets");
  for (const name of ["global.css", "design.css", "browser-message.css"]) {
    const cssPath = path.join(cssDir, name);
    if (!fs.existsSync(cssPath)) continue;
    let css = fs.readFileSync(cssPath, "utf8");
    css = css.replaceAll("url(/assets/", `url(${publicPrefix}/assets/`);
    css = css.replaceAll("url('/assets/", `url('${publicPrefix}/assets/`);
    css = css.replaceAll('url("/assets/', `url("${publicPrefix}/assets/`);
    for (const [from, to] of [
      ["#162d24", "#cdbfa6"],
      ["#1b4732", "#cdbfa6"],
      ["#274c19", "#b69f64"],
      ["#a7b431", "#b69f64"],
      ["#758535", "#b69f64"],
      ["#101e27", "#cdbfa6"],
      ["#005160", "#b69f64"],
      ["#67bfda", "#f5eacf"],
      ["#bee5ee", "#f5eacf"],
      ["#e0d1b6", "#cdbfa6"],
      ["#f5e8d1", "#f5eacf"],
    ]) {
      css = css.replaceAll(from, to);
      css = css.replaceAll(from.toUpperCase(), to);
    }
    fs.writeFileSync(cssPath, css);
  }
}

function rewriteSharedJs() {
  const jsDir = path.join(assetRoot, "assets", "javascripts");
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      if (!name.endsWith(".js")) continue;
      let js = fs.readFileSync(full, "utf8");
      js = js.replaceAll('"/assets/', `"${publicPrefix}/assets/`);
      js = js.replaceAll("'/assets/", `'${publicPrefix}/assets/`);
      js = js.replaceAll("(/assets/", `(${publicPrefix}/assets/`);
      fs.writeFileSync(full, js);
    }
  }
  walk(jsDir);
}

if (!fs.existsSync(path.join(assetRoot, "assets"))) {
  throw new Error(
    "Missing public/accommodation-springs/assets — run sync-accommodation-springs-assets first",
  );
}

rewriteSharedCss();
rewriteSharedJs();
for (const page of PAGES) buildPage(page);
console.log(`Built ${PAGES.length} accommodation Springs Design pages`);
