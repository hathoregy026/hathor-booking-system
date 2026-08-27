import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import { HOME_CAROUSEL_ADMIN_CARDS } from "@/lib/home-carousel-images";
import { DINING_PLATE_NUMBERS, diningPlateSlotName } from "@/lib/gastronomy-dining-media";
import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";
import { resolveSiteImageLivePath } from "@/lib/site-image-preview";
import {
  SITE_IMAGE_PAGE_TITLES,
  SUITES_DASHBOARD_SLOT_NAMES,
  formatSiteImageUsedOnLabel,
  getSiteImageAdminAppearPaths,
  getSiteImageUsedOnPages,
  type SiteImageUsedOnPage,
} from "@/lib/site-image-usage";

/** Client-facing page names for tabs / accordion headers. */
const PAGE_GROUP_TITLES: Record<string, string> = {
  ...SITE_IMAGE_PAGE_TITLES,
};

/**
 * Live homepage cards in page order — only these appear under the Homepage tab.
 * Keep in sync with `lib/ex-page-content.ts` + hero poster.
 */
const HOMEPAGE_LIVE_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> =
  [
    { name: "home-hero-poster", label: "Hero — video poster / cover" },
    { name: "home-story-craft-large", label: "About — main photo" },
    { name: "home-call-to-action", label: "Call to action image" },
    {
      name: "home-wheel-stage",
      label: "Wheel stage — parchment behind the wheel (before it opens)",
    },
    {
      name: "home-wheel-image",
      label: "Wheel reveal — image the wheel opens into",
    },
  ];

/** Cruises tab — hero + homepage itinerary carousel cards (unique per cruise room). */
const CRUISES_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> = [
  { name: "cruises-hero", label: "Hero — Cruises" },
  ...HOME_CAROUSEL_ADMIN_CARDS,
];

/** Homepage amenities scroll sequence — Admin tab: Amenities Sequence (site order). */
const AMENITIES_SEQUENCE_ADMIN_CARDS: ReadonlyArray<{
  name: string;
  label: string;
}> = AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot) => ({
  name: slot.name,
  label: slot.label,
}));

const OUR_VOYAGES_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> =
  [
    {
      name: "home-voyage-3n-aswan-luxor",
      label: "Row 1 — 3 Nights / 4 Days Aswan to Luxor",
    },
    {
      name: "home-voyage-4n-luxor-aswan",
      label: "Row 2 — 4 Nights / 5 Days Luxor to Aswan",
    },
    {
      name: "home-voyage-7n-roundtrip",
      label: "Row 3 — 7 Nights / 8 Days round trip",
    },
    {
      name: "home-voyage-nile-majesty",
      label: "Row 4 — Nile Majesty",
    },
  ];

const MOVING_TILTED_ADMIN_CARDS: ReadonlyArray<{
  name: string;
  label: string;
}> = [
  { name: "moving-tilted-1", label: "Card 1 — Lounge" },
  { name: "moving-tilted-2", label: "Card 2 — Nile highlights" },
  { name: "moving-tilted-3", label: "Card 3 — Dining" },
  { name: "moving-tilted-4", label: "Card 4 — Wellness" },
  { name: "moving-tilted-5", label: "Card 5 — Suite" },
];

/**
 * Suites page — dashboard order matches on-page first appearance
 * (hero → gallery marquee DOM order → nature slides → place fallback).
 * Same linked slots as Rooms / Cabins / Royal galleries.
 */
const SUITES_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> = [
  { name: "scraped-suites-hero", label: "1. Hero" },
  { name: "scraped-royal-5", label: "2. Gallery slide" },
  { name: "scraped-luxsuite-2", label: "3. Gallery / Nature caption" },
  { name: "scraped-suites-royal", label: "4. Gallery / Royal filter card" },
  { name: "scraped-luxsuite-6", label: "5. Gallery slide" },
  { name: "scraped-luxsuite-1", label: "6. Gallery / Wellness" },
  {
    name: "scraped-suites-luxury-rooms",
    label: "7. Gallery / Luxury Rooms filter",
  },
  { name: "scraped-royal-1", label: "8. Gallery slide" },
  { name: "scraped-cabin-2", label: "9. Gallery slide" },
  { name: "scraped-cabin-3", label: "10. Gallery slide" },
  { name: "scraped-cabin-1", label: "11. Gallery slide" },
  { name: "scraped-royal-3", label: "12. Gallery slide" },
  { name: "scraped-luxsuite-3", label: "13. Gallery / Design" },
  { name: "scraped-luxsuite-4", label: "14. Gallery / Place still" },
  { name: "scraped-cabin-5", label: "15. Gallery slide" },
  {
    name: "scraped-suites-luxury-suites",
    label: "16. Gallery / Luxury Suites filter",
  },
  { name: "scraped-luxsuite-5", label: "17. Gallery / Interiors" },
  { name: "room-suite", label: "18. Gallery / shared Luxury Suite" },
  { name: "room-royal", label: "19. Gallery / shared Royal Suite" },
  { name: "scraped-royal-2", label: "20. Nature slide 1" },
  { name: "scraped-royal-4", label: "21. Nature slide 2" },
  { name: "scraped-royal-6", label: "22. Nature slide 3" },
  { name: "scraped-cabin-6", label: "23. Nature background" },
  { name: "room-luxury", label: "24. Place panel — Cabin" },
  { name: "scraped-royal-7", label: "25. Royal gallery still" },
  { name: "scraped-royal-8", label: "26. Royal gallery still" },
  { name: "scraped-cabin-4", label: "27. Cabin gallery still" },
  { name: "scraped-cabin-7", label: "28. Cabin gallery still" },
  { name: "scraped-cabin-8", label: "29. Cabin gallery still" },
  { name: "suites-nile-still", label: "30. Nile still" },
];

const DINING_PLATES_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> =
  DINING_PLATE_NUMBERS.map((number) => ({
    name: diningPlateSlotName(number),
    label: `Plate ${number}`,
  }));

const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "room-luxury": "Place panel — Cabin",
  "cabins-hero": "Hero — Luxury Rooms",
  "room-suite": "Luxury Rooms - Luxury Suite Photo",
  "room-royal": "Hero — Royal Suites",
  charter: "Charter - Overview Photo",
  "cruises-hero": "Hero — Cruises",
  "about-hero": "Hero — About Us",
  "about-dining": "About Us - Dining Photo",
  "gastronomy-hero": "Dining — Hero",
  "gastronomy-restaurant": "Dining — Private Table",
  "gastronomy-table": "Dining — Long Table",
  "gastronomy-courses": "Dining — Courses",
  "gastronomy-wine": "Dining — Wine Pairing",
  "gastronomy-chef": "Dining — Chef",
  "gastronomy-service": "Dining — Service",
  "gastronomy-celebration": "Dining — Celebration",
  "dining-plate-1": "Plate 1",
  "dining-plate-2": "Plate 2",
  "dining-plate-3": "Plate 3",
  "dining-plate-4": "Plate 4",
  "dining-plate-5": "Plate 5",
  "dining-plate-6": "Plate 6",
  "dining-plate-7": "Plate 7",
  "home-story-way-of-life": "Way of Life — photo (home story)",
  "home-story-dining": "Fine Dining — photo (home story)",
  "home-amenities-9": "Opening cards — A Way of Life (pool deck)",
  "home-amenities-10": "Opening cards — Fine Dining",
  "home-amenities-11": "Opening cards — third photo",
  "home-amenities-13": "Opening cards — fourth photo",
  "home-amenities-14": "Nature gold band — background",
  "home-amenities-15": "Nature gold band — legacy unused",
  "wellness-hero": "Hero — Wellness",
  "wellness-fitness": "Wellness - Fitness Photo",
  "highlights-hero": "Hero — Highlights",
  "highlights-lifestyle": "Highlights - Lifestyle Photo",
  "landmark-obelisk": "Highlights - Obelisk Photo",
  "landmark-hatshepsut": "Highlights - Hatshepsut Temple Photo",
  "landmark-valley-kings": "Highlights - Valley of the Kings Photo",
  "charter-hero": "Hero — Charter",
  "charter-privacy": "Charter — Complete Privacy",
  "charter-service": "Charter — Dedicated Service",
  "charter-rhythm": "Charter — Your Own Rhythm",
  "charter-itinerary": "Charter — Voyage Around You",
  "contact-hero": "Hero — Contact",
  "blog-hero": "Hero — Blog",
  "scraped-suites-hero": "Luxury Suites - Suites Hero Photo",
  "scraped-suites-luxury-rooms": "Luxury Suites - Luxury Rooms Card",
  "scraped-suites-luxury-suites": "Luxury Suites - Luxury Suites Card",
  "scraped-suites-royal": "Luxury Suites - Royal Suites Card",
  "scraped-luxsuite-1": "Luxury Suite Gallery — Photo 1",
  "scraped-luxsuite-2": "Luxury Suite Gallery — Photo 2",
  "scraped-luxsuite-3": "Luxury Suite Gallery — Photo 3",
  "scraped-luxsuite-4": "Luxury Suite Gallery — Photo 4",
  "scraped-luxsuite-5": "Luxury Suite Gallery — Photo 5",
  "scraped-luxsuite-6": "Luxury Suite Gallery — Photo 6",
  "scraped-royal-1": "Royal Suite Gallery — Photo 1",
  "scraped-royal-2": "Royal Suite Gallery — Photo 2",
  "scraped-royal-3": "Royal Suite Gallery — Photo 3",
  "scraped-royal-4": "Royal Suite Gallery — Photo 4",
  "scraped-royal-5": "Royal Suite Gallery — Photo 5",
  "scraped-royal-6": "Royal Suite Gallery — Photo 6",
  "scraped-royal-7": "Royal Suite Gallery — Photo 7",
  "scraped-royal-8": "Royal Suite Gallery — Photo 8",
  "scraped-cabin-1": "Luxury Cabin Gallery — Photo 1",
  "scraped-cabin-2": "Luxury Cabin Gallery — Photo 2",
  "scraped-cabin-3": "Luxury Cabin Gallery — Photo 3",
  "scraped-cabin-4": "Luxury Cabin Gallery — Photo 4",
  "scraped-cabin-5": "Luxury Cabin Gallery — Photo 5",
  "scraped-cabin-6": "Luxury Cabin Gallery — Photo 6",
  "scraped-cabin-7": "Luxury Cabin Gallery — Photo 7",
  "scraped-cabin-8": "Luxury Cabin Gallery — Photo 8",
  "suites-nile-still": "Suites — Nile still",
  "burger-nav-image": "Burger menu — right panel photo",
};

export type SiteImageLayoutKind = "hero" | "gallery" | "standard";

const SLOT_LAYOUT_KINDS: Partial<Record<SiteImageSlot["name"], SiteImageLayoutKind>> =
  {
    "home-hero-poster": "hero",
    "home-cinematic-still": "hero",
    "home-call-to-action": "hero",
    "home-wheel-stage": "hero",
    "home-wheel-image": "hero",
    "home-amenities-1": "hero",
    "home-amenities-2": "hero",
    "home-amenities-3": "hero",
    "home-amenities-4": "hero",
    "home-amenities-5": "hero",
    "home-amenities-6": "hero",
    "home-amenities-7": "hero",
    "home-amenities-8": "hero",
    "cruises-hero": "hero",
    "about-hero": "hero",
    "gastronomy-hero": "hero",
    "wellness-hero": "hero",
    "highlights-hero": "hero",
    "charter-hero": "hero",
    "charter-privacy": "standard",
    "charter-service": "standard",
    "charter-rhythm": "standard",
    "charter-itinerary": "standard",
    "contact-hero": "hero",
    "blog-hero": "hero",
    "room-luxury": "hero",
    "cabins-hero": "hero",
    "room-royal": "hero",
    "burger-nav-image": "hero",
  };

const LAYOUT_LABELS: Record<SiteImageLayoutKind, string> = {
  hero: "Full-width banner",
  gallery: "Gallery tile",
  standard: "Standard photo",
};

export type SiteImageAdminItem = {
  name: string;
  label: string;
  defaultAlt: string;
  category: SiteImageSlot["category"];
  pagePath: string;
  displayOrder: number;
  livePath: string | null;
  layoutKind: SiteImageLayoutKind;
  layoutLabel: string;
  /** Every live page that uses this linked image. */
  usedOnPages: SiteImageUsedOnPage[];
  /** Compact label for the card (e.g. “Used on: Suites · Luxury Rooms”). */
  usedOnLabel: string;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
  description?: string;
};

function labelForSlot(slot: SiteImageSlot): string {
  if (SLOT_LABELS[slot.name]) return SLOT_LABELS[slot.name]!;
  if (slot.pagePath === "/gastronomy" && slot.name.startsWith("dining-")) {
    return slot.altText;
  }
  const page = PAGE_GROUP_TITLES[slot.pagePath] ?? "Site";
  return `${page} — ${slot.name.replace(/-/g, " ")}`;
}

function layoutForSlot(slot: SiteImageSlot): SiteImageLayoutKind {
  if (SLOT_LAYOUT_KINDS[slot.name]) return SLOT_LAYOUT_KINDS[slot.name]!;
  if (slot.name.startsWith("dining-plate-")) return "gallery";
  if (slot.category === "hero") return "hero";
  if (
    slot.name.includes("collage") ||
    slot.name.startsWith("scraped-") ||
    slot.name.startsWith("moving-tilted-")
  ) {
    return "gallery";
  }
  return "standard";
}

export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Homepage" || pageTitle === "Home") return "Homepage Images";
  if (pageTitle === "About Us") return "About Us Images";
  if (pageTitle === "Amenities Sequence") return "Amenities Sequence Images";
  if (pageTitle === "Our Voyages") return "Our Voyages Accordion Images";
  if (pageTitle === "Floating IG" || pageTitle === "Floating IG images") {
    return "Floating IG Bubble Images";
  }
  if (pageTitle === "Burger Nav Image") return "Burger Nav Image";
  if (pageTitle === "Moving Tilted Cards") return "Moving Tilted Cards Images";
  if (pageTitle === "Suites") return "Suites Images";
  if (pageTitle === "Dining") return "Dining Images";
  if (pageTitle === "Dining Plates") return "Dining Plates Images";
  return `${pageTitle} Images`;
}

function toAdminItem(
  slot: SiteImageSlot,
  adminGroupPagePath: string,
  labelOverride?: string,
  displayOrderOverride?: number,
): SiteImageAdminItem {
  const layoutKind = layoutForSlot(slot);
  const usedOnPages = getSiteImageUsedOnPages(slot.name, slot.pagePath);
  return {
    name: slot.name,
    label: labelOverride ?? labelForSlot(slot),
    defaultAlt: slot.altText,
    category: slot.category,
    pagePath: slot.pagePath,
    livePath: resolveSiteImageLivePath(slot.name, adminGroupPagePath),
    displayOrder: displayOrderOverride ?? slot.displayOrder,
    layoutKind,
    layoutLabel: LAYOUT_LABELS[layoutKind],
    usedOnPages,
    usedOnLabel: formatSiteImageUsedOnLabel(usedOnPages),
  };
}

function pushUniqueItem(
  items: SiteImageAdminItem[],
  seen: Set<string>,
  item: SiteImageAdminItem,
) {
  if (seen.has(item.name)) return;
  seen.add(item.name);
  items.push(item);
}

export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byName = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.name, slot]));

  const homepageItems: SiteImageAdminItem[] = [];
  const homepageSeen = new Set<string>();
  HOMEPAGE_LIVE_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      homepageItems,
      homepageSeen,
      toAdminItem(slot, "/", card.label, index + 1),
    );
  });

  const amenitiesItems: SiteImageAdminItem[] = [];
  const amenitiesSeen = new Set<string>();
  AMENITIES_SEQUENCE_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      amenitiesItems,
      amenitiesSeen,
      toAdminItem(slot, "/#amenities-sequence", card.label, index + 1),
    );
  });

  const movingTiltedItems: SiteImageAdminItem[] = [];
  const movingTiltedSeen = new Set<string>();
  MOVING_TILTED_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      movingTiltedItems,
      movingTiltedSeen,
      toAdminItem(slot, "/#moving-tilted-cards", card.label, index + 1),
    );
  });

  const floatingIgCards: ReadonlyArray<{ name: string; label: string }> = [
    { name: "floating-ig-1", label: "Bubble 1 — Lounge" },
    { name: "floating-ig-2", label: "Bubble 2 — Nile highlights" },
    { name: "floating-ig-3", label: "Bubble 3 — Dining" },
    { name: "floating-ig-4", label: "Bubble 4 — Suite" },
  ];
  const floatingIgItems: SiteImageAdminItem[] = [];
  const floatingIgSeen = new Set<string>();
  floatingIgCards.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      floatingIgItems,
      floatingIgSeen,
      toAdminItem(slot, "/#floating-ig", card.label, index + 1),
    );
  });

  const burgerNavItems: SiteImageAdminItem[] = [];
  const burgerNavSeen = new Set<string>();
  const burgerNavSlot = byName.get("burger-nav-image");
  if (burgerNavSlot) {
    pushUniqueItem(
      burgerNavItems,
      burgerNavSeen,
      toAdminItem(
        burgerNavSlot,
        "/#burger-nav",
        "Burger menu — right panel photo",
        1,
      ),
    );
  }

  const ourVoyagesItems: SiteImageAdminItem[] = [];
  const ourVoyagesSeen = new Set<string>();
  OUR_VOYAGES_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      ourVoyagesItems,
      ourVoyagesSeen,
      toAdminItem(slot, "/#our-voyages", card.label, index + 1),
    );
  });

  const diningPlatesItems: SiteImageAdminItem[] = [];
  const diningPlatesSeen = new Set<string>();
  DINING_PLATES_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      diningPlatesItems,
      diningPlatesSeen,
      toAdminItem(slot, "/#dining-plates", card.label, index + 1),
    );
  });

  const cruisesItems: SiteImageAdminItem[] = [];
  const cruisesSeen = new Set<string>();
  CRUISES_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      cruisesItems,
      cruisesSeen,
      toAdminItem(slot, "/cruises-list", card.label, index + 1),
    );
  });

  const suitesItems: SiteImageAdminItem[] = [];
  const suitesSeen = new Set<string>();
  SUITES_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    pushUniqueItem(
      suitesItems,
      suitesSeen,
      toAdminItem(slot, "/suites", card.label, index + 1),
    );
  });
  // Safety: any other shared Suites slot from the usage map
  for (const name of SUITES_DASHBOARD_SLOT_NAMES) {
    const slot = byName.get(name);
    if (!slot) continue;
    pushUniqueItem(
      suitesItems,
      suitesSeen,
      toAdminItem(slot, "/suites"),
    );
  }

  const byPage = new Map<string, SiteImageAdminItem[]>();
  const seenByPage = new Map<string, Set<string>>();

  for (const slot of SITE_IMAGE_SLOTS) {
    // Legacy coarse Gastronomy slots are retained for older cross-page content,
    // but the Dining dashboard exposes only source-scene image controls.
    if (slot.pagePath === "/gastronomy" && slot.name.startsWith("gastronomy-")) {
      continue;
    }
    if (slot.name.startsWith("dining-plate-")) {
      continue;
    }
    if (
      slot.pagePath === "/" ||
      slot.pagePath === "/#amenities-sequence" ||
      slot.pagePath === "/#moving-tilted-cards" ||
      slot.pagePath === "/#floating-ig" ||
      slot.pagePath === "/#burger-nav" ||
      slot.pagePath === "/#our-voyages"
    ) {
      continue;
    }

    for (const appearPath of getSiteImageAdminAppearPaths(slot)) {
      if (
        appearPath === "/" ||
        appearPath === "/#amenities-sequence" ||
        appearPath === "/#moving-tilted-cards" ||
        appearPath === "/#floating-ig" ||
        appearPath === "/#burger-nav" ||
        appearPath === "/#our-voyages" ||
        appearPath === "/cruises-list" ||
        appearPath === "/suites"
      ) {
        // Handled by dedicated curated groups above.
        continue;
      }
      const items = byPage.get(appearPath) ?? [];
      const seen = seenByPage.get(appearPath) ?? new Set<string>();
      pushUniqueItem(items, seen, toAdminItem(slot, appearPath));
      byPage.set(appearPath, items);
      seenByPage.set(appearPath, seen);
    }
  }

  const pageOrder = [
    "/rooms",
    "/luxury-cabins-Nile-Cruise",
    "/royal-suites",
    "/about",
    "/gastronomy",
    "/wellness",
    "/highlights",
    "/charter",
    "/contact",
    "/blogs",
  ];

  const orderedPaths = [
    ...pageOrder.filter((pagePath) => byPage.has(pagePath)),
    ...[...byPage.keys()].filter((pagePath) => !pageOrder.includes(pagePath)),
  ];

  return [
    {
      pagePath: "/",
      title: "Homepage",
      description:
        "Only photos that appear on the live homepage. Shared photos also list every other page that uses them.",
      items: homepageItems,
    },
    {
      pagePath: "/#amenities-sequence",
      title: "Amenities Sequence",
      description:
        "Eleven unique photos for the homepage amenities scroll only, listed in the order guests see them (1 first → 11 last). Never shared with Cruises, About, Homepage, or any other page.",
      items: amenitiesItems,
    },
    {
      pagePath: "/#our-voyages",
      title: "Our Voyages",
      description:
        "Background photos for the homepage Our Voyages accordion only. These four images are independent from every other page.",
      items: ourVoyagesItems,
    },
    {
      pagePath: "/#moving-tilted-cards",
      title: "Moving Tilted Cards",
      description:
        "Photos for the homepage moving tilted gallery cards only. Each card has its own upload and is independent from Homepage, Dining, Wellness, and every other page.",
      items: movingTiltedItems,
    },
    {
      pagePath: "/#floating-ig",
      title: "Floating IG",
      description:
        "Photos for the Sail with Hathor floating Instagram bubbles only. Each bubble has its own upload — independent from Homepage, Our Voyages, and every other page.",
      items: floatingIgItems,
    },
    {
      pagePath: "/#burger-nav",
      title: "Burger Nav Image",
      description:
        "Right-panel photo in the open burger menu on Suites, Cruises, and other inner pages. Filter this tab to replace it without touching any other page photos.",
      items: burgerNavItems,
    },
    {
      pagePath: "/cruises-list",
      title: "Cruises",
      description:
        "Cruises page hero plus the homepage itinerary carousel cards. Each cruise room card has its own upload — edit here, shown on the homepage itineraries slider.",
      items: cruisesItems,
    },
    {
      pagePath: "/suites",
      title: "Suites",
      description:
        "Images used on the Suites page (including the residence filter cards). These are the same linked uploads as Luxury Rooms / Cabins / Royal — edit once, updates every page that uses them.",
      items: suitesItems,
    },
    ...orderedPaths.flatMap((pagePath) => {
      const group = {
        pagePath,
        title: PAGE_GROUP_TITLES[pagePath] ?? pagePath,
        description:
          pagePath === "/rooms"
            ? "Luxury Rooms images. Shared Suites / Homepage photos also appear here and show every page that uses them."
            : pagePath === "/gastronomy"
              ? "Dining page scenes. Cut-out course plates are under the Dining Plates filter."
              : undefined,
        items: (byPage.get(pagePath) ?? []).sort(
          (a, b) =>
            a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
        ),
      };
      if (pagePath !== "/gastronomy") return [group];
      return [
        group,
        {
          pagePath: "/#dining-plates",
          title: "Dining Plates",
          description:
            "The seven plated-course cutouts on Dining. Filter this tab to replace each plate without touching the other Dining photos.",
          items: diningPlatesItems,
        },
      ];
    }),
  ];
}
