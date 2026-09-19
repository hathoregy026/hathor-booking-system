/**
 * Client-safe Website Text CMS defaults & helpers (no Prisma).
 * Defaults mirror live copy from homepage / page content modules.
 */

import {
  HOMEPAGE_ABOUT,
  HOMEPAGE_DINING,
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_LIFESTYLE,
  HOMEPAGE_REVIEWS,
} from "@/lib/homepage-content";
import {
  DEFAULT_GASTRONOMY_LIVE_TEXT,
  type GastronomyLiveText,
} from "@/lib/gastronomy-live-text";
import {
  ABOUT_PAGE,
  BLOG_PAGE,
  CHARTER_PAGE,
  CONTACT_PAGE,
  CRUISES_PAGE,
  HIGHLIGHTS_PAGE,
  LUXURY_CABINS_PAGE,
  LUXURY_SUITES_PAGE,
  ROYAL_SUITES_PAGE,
  WELLNESS_PAGE,
} from "@/lib/page-content";
import {
  VOYAGES_ITINERARY_CMS_DEFAULTS,
  VOYAGES_PAGE,
} from "@/lib/voyages-page-content";
import { ROOM_COLLECTION_CONFIG } from "@/lib/room-collection-editorial";
import {
  DEFAULT_SUITES_LIVE_TEXT,
  type SuitesLiveText,
} from "@/lib/suites-live-text";

export const WEBSITE_TEXT_KEY = "website-text";
/** Phone-only website copy (used on live site at max-width 767px). */
export const WEBSITE_TEXT_MOBILE_KEY = "website-text-mobile";

export type WebsiteText = {
  home: {
    about: { heading: string; eyebrow: string; body: string; cta: string };
    carousel: { title: string; subtitle: string; exploreCta: string };
    stackSlides: Array<{ title: string; indication: string; body: string }>;
    textBlocks: Array<{
      title: string;
      indication: string;
      body: string;
      cta: string;
    }>;
    gallery: { title: string; indication: string; followEyebrow: string };
    testimonials: {
      title: string;
      cards: Array<{ name: string; quote: string }>;
    };
    campaign: { title: string };
    /**
     * Shared marketing CTA band (`MarketingCtaBand`) on About, Contact, Blog, etc.
     * Not a homepage-only block — homepage uses `campaign` + Book Now choreography.
     */
    cta: { title: string; body: string };
  };
  pages: {
    about: {
      intro: string[];
      /** Intro subtitle under the stacked hero title */
      heroSupport: string;
      accommodationsTitle: string;
      accommodationsIntro: string;
      diningTitle: string;
      diningIntro: string;
      diningOutro: string;
      welcomeTitle: string;
      welcomeBody: string;
    };
    cruises: {
      /** Intro / overview heading under the hero */
      overviewTitle: string;
      /** Intro / overview body (must not reuse hero subtitle) */
      overviewIntro: string;
      continueTitle: string;
      continueBody: string;
      /** Bottom reserve CTA heading */
      ctaTitle: string;
      /** Bottom reserve CTA body */
      ctaBody: string;
    };
    /** Dedicated /voyages editorial page */
    voyages: {
      /** Small label above the intro title */
      heroLabel: string;
      /** Intro lead under the stacked hero title */
      heroSupport: string;
      /** Hint under the intro lead */
      scrollHint: string;
      statementLabel: string;
      /** Stacked display title — use Enter for lines */
      statementTitle: string;
      statementBody: string;
      openingScript: string;
      /** Label above the three manifesto values */
      promiseLabel: string;
      manifesto: Array<{ title: string; body: string }>;
      itinerariesLabel: string;
      itinerariesTitle: string;
      itinerariesBody: string;
      /** Four itinerary cards (order matches homepage Our Voyages) */
      itineraries: Array<{
        slug: string;
        title: string;
        durationLabel: string;
        meta: string;
        body: string;
        cta: string;
      }>;
      charterLabel: string;
      charterTitle: string;
      charterScript: string;
      charterBody: string;
      charterCta: string;
      reserveLabel: string;
      ctaTitle: string;
      ctaBody: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    /** Copy rendered by the live `/suites` experience. */
    suites: SuitesLiveText;
    highlights: {
      intro: string[];
      landmarks: Array<{ title: string; body: string }>;
    };
    gastronomy: GastronomyLiveText;
    wellness: {
      /** Intro subtitle under the stacked hero title */
      heroSupport: string;
      spaTitle: string;
      spaParagraphs: string[];
      fitnessTitle: string;
      fitnessBody: string;
    };
    charter: {
      overviewIntro: string;
      benefitsIntro: string;
      benefits: string[];
    };
    contact: {
      /** Intro subtitle under the stacked hero title */
      heroSupport: string;
      formTitle: string;
      formIntro: string;
    };
    blog: {
      intro: string;
    };
    partners: {
      lead: string;
    };
    rooms: {
      overviewIntro: string;
      amenitiesTitle: string;
      amenitiesIntro: string;
    };
    cabins: {
      overviewIntro: string;
      amenitiesTitle: string;
      amenitiesIntro: string;
    };
    royal: {
      overviewIntro: string;
      amenitiesTitle: string;
      amenitiesIntro: string;
    };
  };
};

export type WebsiteTextNavItem = {
  id: string;
  label: string;
  href: string;
  hash?: string;
};

export const WEBSITE_TEXT_NAV: WebsiteTextNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "suites", label: "Suites", href: "/suites" },
  {
    id: "cabins",
    label: "Luxury Rooms",
    href: "/luxury-cabins-Nile-Cruise",
  },
  { id: "rooms", label: "Luxury Suites", href: "/rooms" },
  { id: "royal", label: "Royal Suites", href: "/royal-suites" },
  { id: "cruises", label: "Scheduled Voyages", href: "/cruises-list" },
  { id: "voyages", label: "Our Voyages", href: "/voyages" },
  { id: "charter", label: "Private Charter", href: "/charter" },
  { id: "highlights", label: "Highlights", href: "/highlights" },
  { id: "wellness", label: "Wellness & Spa", href: "/wellness" },
  { id: "gastronomy", label: "Dining", href: "/gastronomy" },
  { id: "about", label: "Our Story", href: "/about" },
  { id: "blog", label: "Journal", href: "/blogs" },
  { id: "partners", label: "Partners", href: "/partners" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export const DEFAULT_WEBSITE_TEXT: WebsiteText = {
  home: {
    about: {
      heading: "Exclusive Suites &\nFine Dining on Dahabiya",
      eyebrow: HOMEPAGE_ABOUT.subtitle,
      body: HOMEPAGE_ABOUT.body,
      cta: "Discover More",
    },
    carousel: {
      title: HOMEPAGE_ITINERARIES.title,
      subtitle: HOMEPAGE_ITINERARIES.subtitle,
      exploreCta: "Explore More",
    },
    stackSlides: [
      {
        title: "EVERY LANDMARK,\nA PLEASURE.",
        indication: "Sail The Nile On Hathor",
        body: "A five-star Dahabiya where Nile history, contemporary comfort and intimate sailing come together.",
      },
      {
        title: "WHERE TIME\nMOVES GENTLY.",
        indication: "Private Nile Sailing",
        body: "Glide between Luxor and Aswan, soft light on the water, Egypt unfolding at a gracious pace.",
      },
      {
        title: "WHERE HISTORY\nMEETS ELEGANCE",
        indication: "Bar Hathor",
        body: "With a limited number of cabins and suites, service remains personal, discreet and responsive throughout the journey.",
      },
      {
        title: "GOLDEN HOUR\nON THE NILE.",
        indication: "History · Comfort · Style",
        body: "As the light softens over the Nile, the decks become a quiet place for sunset drinks, conversation and uninterrupted views.",
      },
    ],
    textBlocks: [
      {
        title: HOMEPAGE_LIFESTYLE.title,
        indication: "A Way of Life",
        body: HOMEPAGE_LIFESTYLE.body,
        cta: "Discover More",
      },
      {
        title: HOMEPAGE_DINING.title,
        indication: "Gastronomy",
        body: HOMEPAGE_DINING.body,
        cta: "Explore Dining",
      },
    ],
    gallery: {
      title: "Sail with Hathor",
      indication: "@hathorcruise",
      followEyebrow: "Follow our journey",
    },
    testimonials: {
      title: HOMEPAGE_REVIEWS.title,
      cards: [
        {
          name: "Sarah Mitchell",
          quote:
            "An absolutely magical journey. The Hathor Dahabiya exceeded every expectation: impeccable service, breathtaking views, and true luxury on the Nile.",
        },
        {
          name: "James & Elena Torres",
          quote:
            "The most elegant way to experience Egypt. Every detail was curated to perfection, from gourmet dining to our beautifully appointed suite.",
        },
        {
          name: "Dr. Amira Hassan",
          quote:
            "A once-in-a-lifetime cruise. The intimate atmosphere and personalized attention made us feel like royalty sailing through ancient history.",
        },
        {
          name: "Michael Chen",
          quote:
            "From the moment we stepped aboard, Hathor felt like a floating sanctuary. The crew, the cuisine, and the Nile views were unforgettable.",
        },
      ],
    },
    campaign: {
      title: "Sail Beyond the Ordinary",
    },
    cta: {
      // Matches live MarketingCtaBand defaults so wiring does not change copy.
      title: "Ready to Embark on Your Journey?",
      body: "Reserve your place aboard Hathor Dahabiya and discover the Nile as it was meant to be experienced.",
    },
  },
  pages: {
    about: {
      intro: [...ABOUT_PAGE.intro],
      heroSupport: ABOUT_PAGE.hero.subtitle,
      accommodationsTitle: "Accommodation",
      accommodationsIntro: ABOUT_PAGE.accommodations.intro,
      diningTitle: ABOUT_PAGE.dining.title,
      diningIntro: ABOUT_PAGE.dining.intro,
      diningOutro: ABOUT_PAGE.dining.outro,
      welcomeTitle: ABOUT_PAGE.welcome.title,
      welcomeBody: ABOUT_PAGE.welcome.body,
    },
    cruises: {
      overviewTitle: CRUISES_PAGE.sectionTitle,
      overviewIntro: CRUISES_PAGE.hero.subtitle,
      continueTitle: "Continue exploring\naboard Hathor",
      continueBody:
        "Discover Luxury Rooms, Suites, Royal Suites and Dining aboard Hathor.",
      ctaTitle: "Reserve your voyage",
      ctaBody: CRUISES_PAGE.hero.subtitle,
    },
    voyages: {
      heroLabel: VOYAGES_PAGE.opening.eyebrow,
      heroSupport: VOYAGES_PAGE.hero.subtitle,
      scrollHint: "Scroll to sail",
      statementLabel: "The Hathor way",
      statementTitle: "Sail slowly\nDiscover deeply\nRemember always",
      statementBody: VOYAGES_PAGE.opening.body[0] ?? "",
      openingScript: VOYAGES_PAGE.opening.script,
      promiseLabel: "The promise",
      manifesto: VOYAGES_PAGE.manifesto.map((item) => ({
        title: item.title,
        body: item.body,
      })),
      itinerariesLabel: "Choose your passage",
      itinerariesTitle: "The Nile\nYour rhythm",
      itinerariesBody: VOYAGES_PAGE.opening.body[1] ?? "",
      itineraries: VOYAGES_ITINERARY_CMS_DEFAULTS.map((item) => ({ ...item })),
      charterLabel: VOYAGES_PAGE.charter.eyebrow,
      charterTitle: "Your river\nYour rhythm",
      charterScript: VOYAGES_PAGE.charter.script,
      charterBody: VOYAGES_PAGE.charter.body,
      charterCta: VOYAGES_PAGE.charter.cta.label,
      reserveLabel: "Begin your journey",
      ctaTitle: VOYAGES_PAGE.cta.title,
      ctaBody: VOYAGES_PAGE.cta.body,
      ctaPrimary: VOYAGES_PAGE.cta.primary,
      ctaSecondary: VOYAGES_PAGE.cta.secondary.label,
    },
    suites: { ...DEFAULT_SUITES_LIVE_TEXT },
    highlights: {
      intro: [...HIGHLIGHTS_PAGE.intro],
      landmarks: HIGHLIGHTS_PAGE.landmarks.map((l) => ({
        title: l.title,
        body: l.body,
      })),
    },
    gastronomy: {
      ...DEFAULT_GASTRONOMY_LIVE_TEXT,
      values: DEFAULT_GASTRONOMY_LIVE_TEXT.values.map((item) => ({ ...item })),
      stories: DEFAULT_GASTRONOMY_LIVE_TEXT.stories.map((item) => ({ ...item })),
    },
    wellness: {
      heroSupport:
        "The journey is designed around time: longer views, quieter mornings and fewer reasons to rush. Seneb Spa, Historia Fitness and restful suites move with you between Luxor and Aswan.",
      spaTitle: WELLNESS_PAGE.spa.title,
      spaParagraphs: [...WELLNESS_PAGE.spa.paragraphs],
      fitnessTitle: WELLNESS_PAGE.fitness.title,
      fitnessBody: WELLNESS_PAGE.fitness.body,
    },
    charter: {
      overviewIntro: CHARTER_PAGE.overview.intro,
      benefitsIntro: CHARTER_PAGE.overview.benefitsIntro,
      benefits: [...CHARTER_PAGE.overview.benefits],
    },
    contact: {
      heroSupport: CONTACT_PAGE.hero.subtitle,
      formTitle: CONTACT_PAGE.form.title,
      formIntro:
        "Share dates, guests, and how you wish to sail. Our reservations team replies within 24 hours.",
    },
    blog: {
      intro: BLOG_PAGE.intro,
    },
    partners: {
      lead: "We sail with trusted names in travel and hospitality, partners who share our care for the Nile and our guests.",
    },
    rooms: {
      // Maps to intro body (not amenities). Default matches afterHero so visuals stay stable.
      overviewIntro: LUXURY_SUITES_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: "Included for your stay",
      amenitiesIntro: ROOM_COLLECTION_CONFIG.suites.amenitiesLead,
    },
    cabins: {
      overviewIntro: LUXURY_CABINS_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: "Included for your stay",
      amenitiesIntro: ROOM_COLLECTION_CONFIG.cabins.amenitiesLead,
    },
    royal: {
      overviewIntro: ROYAL_SUITES_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: "Included for your stay",
      amenitiesIntro: ROOM_COLLECTION_CONFIG.royal.amenitiesLead,
    },
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeValue(base: unknown, patch: unknown): unknown {
  if (patch === undefined || patch === null) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(patch)) return base;

    const baseIsStringArray =
      base.length === 0 || typeof base[0] === "string";
    if (baseIsStringArray) {
      if (patch.every((item) => typeof item === "string")) {
        return patch as string[];
      }
      return base;
    }

    // Arrays of objects: merge by index; keep base length (fixed CMS slots)
    return base.map((item, index) => {
      if (index >= patch.length) return item;
      return mergeValue(item, patch[index]);
    });
  }

  if (isPlainObject(base) && isPlainObject(patch)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        out[key] = mergeValue(base[key], patch[key]);
      }
    }
    return out;
  }

  if (typeof patch === typeof base) return patch;
  return base;
}

/** Recursive merge; object arrays merge by index; string arrays replace when patch is provided. */
export function deepMergeWebsiteText(
  base: WebsiteText,
  patch: unknown,
): WebsiteText {
  return mergeValue(base, patch) as WebsiteText;
}

export type WebsiteTextLengthViolation = {
  path: string;
  actual: number;
  maximum: number;
};

/**
 * Enforce the live layout's existing copy lengths at the server boundary.
 * The shipped default is the permanent floor; a previously saved longer value
 * remains editable without an accidental truncation on its next save.
 */
export function findWebsiteTextLengthViolation(
  candidate: WebsiteText,
  current: WebsiteText,
): WebsiteTextLengthViolation | null {
  const visit = (
    defaults: unknown,
    next: unknown,
    saved: unknown,
    path: string,
  ): WebsiteTextLengthViolation | null => {
    if (typeof defaults === "string" && typeof next === "string") {
      const maximum = Math.max(
        1,
        defaults.length,
        typeof saved === "string" ? saved.length : 0,
      );
      return next.length > maximum
        ? { path, actual: next.length, maximum }
        : null;
    }

    if (Array.isArray(defaults) && Array.isArray(next)) {
      for (let index = 0; index < defaults.length; index += 1) {
        const violation = visit(
          defaults[index],
          next[index],
          Array.isArray(saved) ? saved[index] : undefined,
          `${path}[${index}]`,
        );
        if (violation) return violation;
      }
      return null;
    }

    if (isPlainObject(defaults) && isPlainObject(next)) {
      for (const key of Object.keys(defaults)) {
        const violation = visit(
          defaults[key],
          next[key],
          isPlainObject(saved) ? saved[key] : undefined,
          path ? `${path}.${key}` : key,
        );
        if (violation) return violation;
      }
    }
    return null;
  };

  return visit(DEFAULT_WEBSITE_TEXT, candidate, current, "");
}

/**
 * One-shot shape migration before deep-merge.
 * Does not overwrite already-populated canonical fields.
 *
 * Legacy → destination:
 * - pages.cruises.sectionTitle → pages.cruises.overviewTitle
 * - home.cta EX_CTA copy → MarketingCtaBand defaults (only when still the old EX_CTA strings)
 */
const LEGACY_EX_CTA_TITLE = "Begin your Nile escape";

const LEGACY_STACK_SLIDE_BODIES: ReadonlyArray<{
  match: string;
  next: string;
}> = [
  {
    match:
      "A five-star dahabiya on the ancient Nile: history, comfort, and style in one intimate voyage.",
    next: "A five-star Dahabiya where Nile history, contemporary comfort and intimate sailing come together.",
  },
  {
    match:
      "Refined evenings aboard Hathor: history, comfort, and style where the Nile meets luxury.",
    next: "With a limited number of cabins and suites, service remains personal, discreet and responsive throughout the journey.",
  },
  {
    match:
      "From ancient shores to quiet decks at dusk. Every moment aboard Hathor is composed for wonder.",
    next: "As the light softens over the Nile, the decks become a quiet place for sunset drinks, conversation and uninterrupted views.",
  },
];

const LEGACY_INDULGE_BODY =
  "Indulge yourself in a timeless luxury on the Hathor Dahabiya Nile Cruise. Enjoy the luxurious cabins that blend modern comfort with timeless Egyptian charm. From panoramic Nile view suites to gourmet fine dining and tranquil spa moments, every detail of your journey is crafted for relaxation, exclusivity, and authentic cultural elegance. Enjoy the ultimate Luxury Dahabiya Nile Cruise and feel the charm of a Private Nile cruise Egypt.";

const LEGACY_ABOUT_MEDITATIVE =
  "Dahabiya Nile Cruise Egypt is one of the ways to experience the Nile, a trip of a peaceful and meditative nature which was once revered by pharaohs and other explorers. It is now also a special and personal way of seeing Egypt and all its awesome scenery.";

function replaceLegacyPlainText(value: string): string {
  const trimmed = value.trim();
  for (const entry of LEGACY_STACK_SLIDE_BODIES) {
    if (trimmed === entry.match) return entry.next;
  }
  if (trimmed === LEGACY_INDULGE_BODY) {
    return "Experience a quieter expression of luxury, shaped by space, privacy and attentive service.";
  }
  if (trimmed === LEGACY_ABOUT_MEDITATIVE) {
    return "A Dahabiya journey offers one of the most intimate ways to experience the Nile. Its slower pace, smaller scale and quieter anchorages create a more personal connection with the river and the places along its banks.";
  }
  return value;
}

export function migrateLegacyWebsiteTextFields(raw: unknown): unknown {
  if (!isPlainObject(raw)) return raw;
  const next: Record<string, unknown> = { ...raw };

  const home = isPlainObject(next.home) ? { ...next.home } : null;
  if (home && isPlainObject(home.cta)) {
    const cta = { ...home.cta };
    if (
      typeof cta.title === "string" &&
      cta.title.trim() === LEGACY_EX_CTA_TITLE
    ) {
      // Drop legacy orphan EX_CTA strings so MarketingCtaBand defaults apply.
      delete cta.title;
      delete cta.body;
    }
    home.cta = cta;
    next.home = home;
  }

  if (home && isPlainObject(home.about) && typeof home.about.body === "string") {
    const about = { ...home.about };
    const aboutBody = about.body as string;
    const oldAbout =
      "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you. Experience the finest Luxurious Dahabiya in Egypt, where every moment is crafted to inspire wonder and serenity.";
    if (aboutBody.trim() === oldAbout || aboutBody.trim() === LEGACY_INDULGE_BODY) {
      about.body =
        "Hathor is an intimate luxury Dahabiya for travellers who prefer space, privacy and an unhurried pace between Luxor and Aswan.";
    }
    const legacyWelcomeAsAbout =
      "Welcome aboard Hathor, an intimate luxury Dahabiya created for unhurried journeys between Luxor and Aswan. Thoughtful service, refined accommodation and the quiet rhythm of the Nile define every voyage.";
    if (aboutBody.trim() === legacyWelcomeAsAbout) {
      about.body =
        "Hathor is an intimate luxury Dahabiya for travellers who prefer space, privacy and an unhurried pace between Luxor and Aswan.";
    }
    home.about = about;
    next.home = home;
  }

  /* Bar / slide 3 title: keep two-line WHERE HISTORY / MEETS ELEGANCE phrasing. */
  if (home && Array.isArray(home.stackSlides)) {
    const slides = home.stackSlides.map((slide, index) => {
      if (!isPlainObject(slide)) return slide;
      let nextSlide: Record<string, unknown> = { ...slide };
      if (index === 2) {
        const title = typeof slide.title === "string" ? slide.title : "";
        const normalized = title.replace(/\s+/g, " ").trim().replace(/\.$/, "");
        if (/^WHERE HISTORY\s+MEETS (LUXURY|HISTORY)$/i.test(normalized)) {
          nextSlide = { ...nextSlide, title: "WHERE HISTORY\nMEETS ELEGANCE" };
        }
      }
      if (typeof slide.body === "string") {
        nextSlide = { ...nextSlide, body: replaceLegacyPlainText(slide.body) };
      }
      return nextSlide;
    });
    home.stackSlides = slides;
    next.home = home;
  }

  if (home && Array.isArray(home.textBlocks)) {
    home.textBlocks = home.textBlocks.map((block) => {
      if (!isPlainObject(block) || typeof block.body !== "string") return block;
      const diningLegacy =
        "Restaurant craft meets warm hospitality: fresh local ingredients, Egyptian and international flavours, each meal a quiet celebration on the Nile.";
      if (block.body.trim() === diningLegacy) {
        return {
          ...block,
          body: "Seasonal menus bring together Egyptian flavours, fresh ingredients and attentive service, served in settings shaped by the river.",
        };
      }
      return block;
    });
    next.home = home;
  }

  const pages = isPlainObject(next.pages) ? { ...next.pages } : null;
  if (!pages) return next;

  const aboutPage = isPlainObject(pages.about) ? { ...pages.about } : null;
  if (aboutPage) {
    if (aboutPage.accommodationsTitle === ABOUT_PAGE.accommodations.title) {
      delete aboutPage.accommodationsTitle;
    }
    if (typeof aboutPage.welcomeBody === "string") {
      aboutPage.welcomeBody = replaceLegacyPlainText(aboutPage.welcomeBody);
    }
    if (Array.isArray(aboutPage.intro)) {
      aboutPage.intro = aboutPage.intro.map((p) =>
        typeof p === "string" ? replaceLegacyPlainText(p) : p,
      );
    }
    pages.about = aboutPage;
  }

  const contactPage = isPlainObject(pages.contact) ? { ...pages.contact } : null;
  if (contactPage) {
    if (contactPage.formIntro === CONTACT_PAGE.form.intro) {
      delete contactPage.formIntro;
    }
    pages.contact = contactPage;
  }

  const roomMappings = [
    ["rooms", LUXURY_SUITES_PAGE],
    ["cabins", LUXURY_CABINS_PAGE],
    ["royal", ROYAL_SUITES_PAGE],
  ] as const;
  for (const [key, legacy] of roomMappings) {
    const roomPage = isPlainObject(pages[key]) ? { ...pages[key] } : null;
    if (!roomPage) continue;
    if (roomPage.amenitiesTitle === legacy.amenities.title) {
      delete roomPage.amenitiesTitle;
    }
    if (roomPage.amenitiesIntro === legacy.overview.body) {
      delete roomPage.amenitiesIntro;
    }
    pages[key] = roomPage;
  }

  const cruises = isPlainObject(pages.cruises) ? { ...pages.cruises } : null;
  if (cruises) {
    const overviewTitle = cruises.overviewTitle;
    const sectionTitle = cruises.sectionTitle;
    if (
      (typeof overviewTitle !== "string" || !overviewTitle.trim()) &&
      typeof sectionTitle === "string" &&
      sectionTitle.trim()
    ) {
      cruises.overviewTitle = sectionTitle;
    }
    pages.cruises = cruises;
  }

  next.pages = pages;
  return next;
}

/** Merge over defaults; never throws. Applies legacy field migration first. */
export function parseWebsiteText(raw: unknown): WebsiteText {
  try {
    let value = raw;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value) as unknown;
      } catch {
        return structuredClone(DEFAULT_WEBSITE_TEXT);
      }
    }
    if (value === null || value === undefined) {
      return structuredClone(DEFAULT_WEBSITE_TEXT);
    }
    const migrated = migrateLegacyWebsiteTextFields(value);
    return deepMergeWebsiteText(
      structuredClone(DEFAULT_WEBSITE_TEXT),
      migrated,
    );
  } catch {
    return structuredClone(DEFAULT_WEBSITE_TEXT);
  }
}

/** Split hero first/second lines into stacked display lines. */
export function stackedHeroLines(main: string, second: string): string[] {
  return [
    ...main.split(/\n/).map((line) => line.trim()).filter(Boolean),
    second.trim(),
  ].filter(Boolean);
}

export function paragraphsToText(arr: string[]): string {
  return arr.join("\n\n");
}

export function textToParagraphs(s: string): string[] {
  return s
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Trim; empty / whitespace-only → undefined (skip empty wrappers). */
export function normalizeOptionalText(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * CMS overview intro → paragraph list for section bodies.
 * Falls back to static paragraphs when CMS value is empty.
 * Soft-migrates legacy values that were the old amenities default (`overview.body`).
 */
export function resolveOverviewIntroParagraphs(
  cmsIntro: string | null | undefined,
  fallback: readonly string[],
  legacyAmenitiesDefault?: string,
): string[] {
  const normalized = normalizeOptionalText(cmsIntro);
  if (!normalized) return [...fallback];
  const legacy = normalizeOptionalText(legacyAmenitiesDefault);
  if (legacy && normalized === legacy) return [...fallback];
  const paragraphs = textToParagraphs(normalized);
  return paragraphs.length > 0 ? paragraphs : [...fallback];
}

/** Resolve a CMS string with a static fallback (empty-safe). */
export function resolveCmsText(
  cmsValue: string | null | undefined,
  fallback: string,
): string {
  return normalizeOptionalText(cmsValue) ?? fallback;
}
