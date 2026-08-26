/**
 * Lightweight WebsiteText mapping / migration checks (no test framework).
 * Run: npm run verify:website-text
 */

import {
  DEFAULT_WEBSITE_TEXT,
  migrateLegacyWebsiteTextFields,
  parseWebsiteText,
  resolveCmsText,
  resolveOverviewIntroParagraphs,
} from "../lib/website-text-shared";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  livePageFontFamily,
  resolvePageStyle,
} from "../lib/typography-settings-shared";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("ok:", message);
  }
}

assert(
  DEFAULT_WEBSITE_TEXT.pages.about.heroSupport.length > 0,
  "about.heroSupport default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.contact.heroSupport.length > 0,
  "contact.heroSupport default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.wellness.heroSupport.length > 0,
  "wellness.heroSupport default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.cruises.overviewIntro.length > 0,
  "cruises.overviewIntro default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.voyages.heroSupport.length > 0,
  "voyages.heroSupport default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.voyages.manifesto.length === 3,
  "voyages.manifesto default count",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.rooms.amenitiesIntro.length > 0,
  "rooms.amenitiesIntro default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.cabins.amenitiesTitle.length > 0,
  "cabins.amenitiesTitle default",
);
assert(
  DEFAULT_WEBSITE_TEXT.pages.royal.amenitiesIntro.length > 0,
  "royal.amenitiesIntro default",
);

const migrated = migrateLegacyWebsiteTextFields({
  pages: {
    cruises: {
      sectionTitle: "Legacy Cruises Title",
      continueTitle: "Continue",
      continueBody: "Body",
    },
  },
});
const parsed = parseWebsiteText(migrated);
assert(
  parsed.pages.cruises.overviewTitle === "Legacy Cruises Title",
  "legacy sectionTitle migrates to overviewTitle",
);
assert(
  parsed.pages.cruises.overviewIntro.length > 0,
  "overviewIntro filled from defaults after merge",
);

const soft = resolveOverviewIntroParagraphs(
  "Same as amenities",
  ["Fallback intro"],
  "Same as amenities",
);
assert(
  soft.length === 1 && soft[0] === "Fallback intro",
  "overviewIntro soft-migrates legacy amenities default",
);

assert(
  resolveCmsText("  ", "fallback") === "fallback",
  "empty CMS text uses fallback",
);
assert(
  resolveCmsText("Live", "fallback") === "Live",
  "non-empty CMS text wins",
);

const ctaParsed = parseWebsiteText({
  home: {
    cta: {
      title: "Begin your Nile escape",
      body: "Whether you are planning a private charter, selecting the perfect sailing dates, or reserving your suite, our team is here to make it effortless.",
    },
  },
});
assert(
  ctaParsed.home.cta.title === DEFAULT_WEBSITE_TEXT.home.cta.title,
  "legacy EX_CTA title soft-migrates to MarketingCtaBand default",
);

assert(
  livePageFontFamily("contact", "hero_title", "Bitho Luxury") === "Italiana",
  "contact hero uses live Italiana",
);
assert(
  livePageFontFamily("about", "body_text", "Gamgote") ===
    "Rollgates Luxury Italic",
  "about body uses live Rollgates",
);
assert(
  livePageFontFamily("cruises", "hero_title", "Gabigaile") === "Bitho Luxury",
  "cruises hero uses live Bitho",
);
assert(
  livePageFontFamily("wellness", "hero_subtitle", "Carista") === "Bitho Luxury",
  "wellness second line uses live Bitho",
);
assert(
  livePageFontFamily("gastronomy", "hero_title", "Gabigaile") === "Bitho Luxury",
  "gastronomy hero uses live Bitho",
);
assert(
  livePageFontFamily("luxury_cabins", "hero_title", "Bitho Luxury") ===
    "Gamgote",
  "luxury cabins hero uses live Gamgote",
);
assert(
  livePageFontFamily("home", "hero_title", "Bitho Luxury") === "Bitho Luxury",
  "home hero inherits site-wide face",
);
assert(
  resolvePageStyle(DEFAULT_TYPOGRAPHY_SETTINGS, "contact", "hero_title")
    .fontFamily === "Italiana",
  "resolvePageStyle maps contact to Italiana",
);

if (process.exitCode) {
  console.error("\nWebsiteText mapping verification failed.");
} else {
  console.log("\nWebsiteText mapping verification passed.");
}
