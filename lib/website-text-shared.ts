/**
 * Client-safe Website Text CMS defaults & helpers (no Prisma).
 * Defaults mirror live copy from homepage / page content modules.
 */

import {
  HOMEPAGE_ABOUT,
  HOMEPAGE_DINING,
  HOMEPAGE_HIGHLIGHTS,
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_LIFESTYLE,
  HOMEPAGE_PARTNERS,
  HOMEPAGE_REVIEWS,
} from "@/lib/homepage-content";
import {
  ABOUT_PAGE,
  BLOG_PAGE,
  CHARTER_PAGE,
  CONTACT_PAGE,
  CRUISES_PAGE,
  GASTRONOMY_PAGE,
  HIGHLIGHTS_PAGE,
  LUXURY_CABINS_PAGE,
  LUXURY_SUITES_PAGE,
  ROYAL_SUITES_PAGE,
  WELLNESS_PAGE,
} from "@/lib/page-content";

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
      accommodationsTitle: string;
      accommodationsIntro: string;
      accommodationsOutro: string;
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
    highlights: {
      intro: string[];
      landmarks: Array<{ title: string; body: string }>;
    };
    gastronomy: {
      intro: string[];
      restaurantTitle: string;
      restaurantService: string;
      atmosphereTitle: string;
      atmosphere: string;
      closing: string;
      venues: Array<{ title: string; description: string }>;
    };
    wellness: {
      spaTitle: string;
      spaParagraphs: string[];
      fitnessTitle: string;
      fitnessBody: string;
    };
    charter: {
      overviewTitle: string;
      overviewIntro: string;
      benefitsIntro: string;
      benefits: string[];
      cta: string;
    };
    contact: {
      formTitle: string;
      formIntro: string;
    };
    blog: {
      intro: string;
    };
    partners: {
      title: string;
      chapter: string;
      lead: string;
    };
    rooms: {
      overviewTitle: string;
      overviewIntro: string;
      amenitiesTitle: string;
      amenitiesIntro: string;
    };
    cabins: {
      overviewTitle: string;
      overviewIntro: string;
      amenitiesTitle: string;
      amenitiesIntro: string;
    };
    royal: {
      overviewTitle: string;
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
  { id: "home", label: "Homepage", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "cruises", label: "Cruises", href: "/cruises" },
  { id: "highlights", label: "Highlights", href: "/highlights" },
  { id: "gastronomy", label: "Gastronomy", href: "/gastronomy" },
  { id: "wellness", label: "Wellness", href: "/wellness" },
  { id: "charter", label: "Charter", href: "/charter" },
  { id: "contact", label: "Contact", href: "/contact" },
  { id: "rooms", label: "Rooms & Suites", href: "/rooms" },
  {
    id: "cabins",
    label: "Luxury Cabins",
    href: "/luxury-cabins-Nile-Cruise",
  },
  {
    id: "royal",
    label: "Royal Suites",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  },
  { id: "blog", label: "Blog", href: "/blogs" },
  { id: "partners", label: "Partners", href: "/partners" },
];

export const DEFAULT_WEBSITE_TEXT: WebsiteText = {
  home: {
    about: {
      heading: "Elegance is\na way of life.",
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
        body: "A five-star dahabiya on the ancient Nile: history, comfort, and style in one intimate voyage.",
      },
      {
        title: "WHERE TIME\nMOVES GENTLY.",
        indication: "Private Nile Sailing",
        body: "Glide between Luxor and Aswan, soft light on the water, Egypt unfolding at a gracious pace.",
      },
      {
        title: "WHERE HISTORY\nMEETS HISTORY",
        indication: "Bar Hathor",
        body: "Refined evenings aboard Hathor: history, comfort, and style where the Nile meets luxury.",
      },
      {
        title: "GOLDEN HOUR\nON THE NILE.",
        indication: "History · Comfort · Style",
        body: "From ancient shores to quiet decks at dusk. Every moment aboard Hathor is composed for wonder.",
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
      accommodationsTitle: ABOUT_PAGE.accommodations.title,
      accommodationsIntro: ABOUT_PAGE.accommodations.intro,
      accommodationsOutro: ABOUT_PAGE.accommodations.outro,
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
        "Discover Luxury Rooms, Suites, Royal Suites, and Dining, Hathor Flavors.",
      ctaTitle: "Reserve your voyage",
      ctaBody: CRUISES_PAGE.hero.subtitle,
    },
    highlights: {
      intro: [...HIGHLIGHTS_PAGE.intro],
      landmarks: HIGHLIGHTS_PAGE.landmarks.map((l) => ({
        title: l.title,
        body: l.body,
      })),
    },
    gastronomy: {
      intro: [...GASTRONOMY_PAGE.intro],
      restaurantTitle: GASTRONOMY_PAGE.restaurant.title,
      restaurantService: GASTRONOMY_PAGE.restaurant.service,
      atmosphereTitle: GASTRONOMY_PAGE.restaurant.atmosphereTitle,
      atmosphere: GASTRONOMY_PAGE.restaurant.atmosphere,
      closing: GASTRONOMY_PAGE.restaurant.closing,
      venues: GASTRONOMY_PAGE.venues.map((v) => ({
        title: v.title,
        description: v.description,
      })),
    },
    wellness: {
      spaTitle: WELLNESS_PAGE.spa.title,
      spaParagraphs: [...WELLNESS_PAGE.spa.paragraphs],
      fitnessTitle: WELLNESS_PAGE.fitness.title,
      fitnessBody: WELLNESS_PAGE.fitness.body,
    },
    charter: {
      overviewTitle: CHARTER_PAGE.overview.title,
      overviewIntro: CHARTER_PAGE.overview.intro,
      benefitsIntro: CHARTER_PAGE.overview.benefitsIntro,
      benefits: [...CHARTER_PAGE.overview.benefits],
      cta: CHARTER_PAGE.overview.cta,
    },
    contact: {
      formTitle: CONTACT_PAGE.form.title,
      formIntro: CONTACT_PAGE.form.intro,
    },
    blog: {
      intro: BLOG_PAGE.intro,
    },
    partners: {
      title: HOMEPAGE_PARTNERS.title,
      chapter: HOMEPAGE_PARTNERS.chapter,
      lead: "We sail with trusted names in travel and hospitality, partners who share our care for the Nile and our guests.",
    },
    rooms: {
      overviewTitle: LUXURY_SUITES_PAGE.overview.title,
      // Maps to intro body (not amenities). Default matches afterHero so visuals stay stable.
      overviewIntro: LUXURY_SUITES_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: LUXURY_SUITES_PAGE.amenities.title,
      amenitiesIntro: LUXURY_SUITES_PAGE.overview.body,
    },
    cabins: {
      overviewTitle: LUXURY_CABINS_PAGE.overview.title,
      overviewIntro: LUXURY_CABINS_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: LUXURY_CABINS_PAGE.amenities.title,
      amenitiesIntro: LUXURY_CABINS_PAGE.overview.body,
    },
    royal: {
      overviewTitle: ROYAL_SUITES_PAGE.overview.title,
      overviewIntro: ROYAL_SUITES_PAGE.copyPlacement.afterHero.join("\n\n"),
      amenitiesTitle: ROYAL_SUITES_PAGE.amenities.title,
      amenitiesIntro: ROYAL_SUITES_PAGE.overview.body,
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

/**
 * One-shot shape migration before deep-merge.
 * Does not overwrite already-populated canonical fields.
 *
 * Legacy → destination:
 * - pages.cruises.sectionTitle → pages.cruises.overviewTitle
 * - home.cta EX_CTA copy → MarketingCtaBand defaults (only when still the old EX_CTA strings)
 */
const LEGACY_EX_CTA_TITLE = "Begin your Nile escape";

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

  /* Bar / slide 3 title: lock two-line WHERE HISTORY / MEETS HISTORY phrasing. */
  if (home && Array.isArray(home.stackSlides)) {
    const slides = home.stackSlides.map((slide, index) => {
      if (index !== 2 || !isPlainObject(slide)) return slide;
      const title = typeof slide.title === "string" ? slide.title : "";
      const normalized = title.replace(/\s+/g, " ").trim().replace(/\.$/, "");
      if (
        /^WHERE HISTORY\s+MEETS (LUXURY|ELEGANCE)$/i.test(normalized) ||
        /^WHERE\s+HISTORY\s+MEETS\s+(LUXURY|ELEGANCE)$/i.test(normalized)
      ) {
        return { ...slide, title: "WHERE HISTORY\nMEETS HISTORY" };
      }
      return slide;
    });
    home.stackSlides = slides;
    next.home = home;
  }

  const pages = isPlainObject(next.pages) ? { ...next.pages } : null;
  if (!pages) return next;

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
