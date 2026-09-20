import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import { HOME_CAROUSEL_ADMIN_CARDS } from "@/lib/home-carousel-images";
import { DINING_PLATE_NUMBERS, diningPlateSlotName } from "@/lib/gastronomy-dining-media";
import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";
import {
  getSiteImageSourceName,
  isLegacySharedSiteImageSource,
} from "@/lib/site-image-page-scope";
import { resolveSiteImageLivePath } from "@/lib/site-image-preview";
import {
  SITE_IMAGE_PAGES,
  SITE_IMAGE_PAGE_TITLES,
  formatSiteImageUsedOnLabel,
  getSiteImageSlotNamesForPage,
  getSiteImageUsedOnPages,
  siteImagePageTitle,
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
  { name: "room-suite", label: "18. Gallery / Luxury Suite" },
  { name: "room-royal", label: "19. Gallery / Royal Suite" },
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
  "gastronomy-wine": "Dining — Wine Pairing",
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
  "booking-banner": "Booking — banner photo (Journey, Details & Payment, Request sent)",
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
  "home-3-animated-map-bg": "Animated map bg — Home 3 chart wallpaper",
};

export type SiteImageLayoutKind = "hero" | "gallery" | "standard";

const SLOT_LAYOUT_KINDS: Partial<Record<SiteImageSlot["name"], SiteImageLayoutKind>> =
  {
    "home-hero-poster": "hero",
    "home-cinematic-still": "hero",
    "home-3-animated-map-bg": "hero",
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
    "booking-banner": "hero",
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
  /** The part of the page this photo belongs to (“Gallery”, “Dining plates”…). */
  section: string;
  /** Every live page that paints this photo, in visiting order. */
  usedOnPages: SiteImageUsedOnPage[];
  /** Compact label for the card (e.g. “Used on: Suites · Luxury Cabins”). */
  usedOnLabel: string;
  /** True when more than one page shows it — editing here changes all of them. */
  sharedAcrossPages: boolean;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
  description?: string;
  /** The page a visitor can open, or null for the unused group. */
  livePath?: string | null;
};

/** The page path used for slots the live site no longer paints. */
export const SITE_IMAGE_UNUSED_GROUP = "unused";

/** Labels written for the curated sections, reused wherever a slot appears. */
const CURATED_LABELS: Record<string, string> = (() => {
  const labels: Record<string, string> = {};
  const add = (cards: ReadonlyArray<{ name: string; label: string }>) => {
    for (const card of cards) {
      /* Suites labels carry their own numbering; page order comes from the audit. */
      labels[card.name] = card.label.replace(/^\d+\.\s*/, "");
    }
  };
  add(HOMEPAGE_LIVE_ADMIN_CARDS);
  add(AMENITIES_SEQUENCE_ADMIN_CARDS);
  add(OUR_VOYAGES_ADMIN_CARDS);
  add(MOVING_TILTED_ADMIN_CARDS);
  add(CRUISES_ADMIN_CARDS);
  add(SUITES_ADMIN_CARDS);
  add(DINING_PLATES_ADMIN_CARDS);
  return labels;
})();

/** Where on the page a slot belongs, so one page's list still reads in parts. */
function sectionForSlot(slot: SiteImageSlot): string {
  const name = getSiteImageSourceName(slot.name);
  if (name === "burger-nav-image") return "Burger menu";
  if (name.startsWith("home-amenities-")) return "Amenities sequence";
  if (name.startsWith("moving-tilted-")) return "Moving tilted cards";
  if (name.startsWith("floating-ig-")) return "Floating IG bubbles";
  if (name.startsWith("dining-plate-")) return "Dining plates";
  if (name.startsWith("home-carousel-")) return "Itinerary carousel";
  if (name.startsWith("home-voyage-")) return "Our Voyages";
  if (name.startsWith("home-wheel-")) return "Wheel reveal";
  if (name.startsWith("scraped-")) return "Gallery";
  if (slot.category === "hero") return "Banner";
  return "Page photos";
}

function labelForSlot(slot: SiteImageSlot): string {
  const sourceName = getSiteImageSourceName(slot.name);
  if (SLOT_LABELS[sourceName]) return SLOT_LABELS[sourceName]!;
  if (CURATED_LABELS[sourceName]) return CURATED_LABELS[sourceName];
  if (slot.pagePath === "/gastronomy" && sourceName.startsWith("dining-")) {
    return slot.altText;
  }
  const page = PAGE_GROUP_TITLES[slot.pagePath] ?? "Site";
  return `${page} — ${sourceName.replace(/-/g, " ")}`;
}

function layoutForSlot(slot: SiteImageSlot): SiteImageLayoutKind {
  const name = getSiteImageSourceName(slot.name);
  if (SLOT_LAYOUT_KINDS[name]) return SLOT_LAYOUT_KINDS[name]!;
  if (name.startsWith("dining-plate-")) return "gallery";
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
  return `${pageTitle} Images`;
}

function toAdminItem(
  slot: SiteImageSlot,
  groupPagePath: string,
  displayOrder: number,
): SiteImageAdminItem {
  const layoutKind = layoutForSlot(slot);
  const usedOnPages = getSiteImageUsedOnPages(slot.name);
  return {
    name: slot.name,
    label: labelForSlot(slot),
    defaultAlt: slot.altText,
    category: slot.category,
    pagePath: slot.pagePath,
    livePath: resolveSiteImageLivePath(slot.name, groupPagePath),
    displayOrder,
    layoutKind,
    layoutLabel: LAYOUT_LABELS[layoutKind],
    section: sectionForSlot(slot),
    usedOnPages,
    usedOnLabel: formatSiteImageUsedOnLabel(usedOnPages),
    sharedAcrossPages: usedOnPages.length > 1,
  };
}

/**
 * One group per live page, in visiting order, holding that page's photos in
 * the order the page paints them. Slots the audit never saw are gathered at
 * the end so nothing disappears silently.
 */
export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byName = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.name, slot]));
  const groups: SiteImageAdminGroup[] = [];
  const painted = new Set<string>();

  for (const pagePath of SITE_IMAGE_PAGES) {
    const items: SiteImageAdminItem[] = [];
    getSiteImageSlotNamesForPage(pagePath).forEach((name) => {
      const slot = byName.get(name);
      if (!slot) return;
      painted.add(name);
      items.push(toAdminItem(slot, pagePath, items.length + 1));
    });
    if (!items.length) continue;

    const title = siteImagePageTitle(pagePath);
    groups.push({
      pagePath,
      title,
      livePath: pagePath,
      description: `Every photo on ${title} (${pagePath}), in the order guests meet them. Each photo belongs only to this page, so editing it cannot change another page.`,
      items,
    });
  }

  const orphans = SITE_IMAGE_SLOTS.filter(
    (slot) =>
      !painted.has(slot.name) && !isLegacySharedSiteImageSource(slot.name),
  );
  if (orphans.length) {
    groups.push({
      pagePath: SITE_IMAGE_UNUSED_GROUP,
      title: "Not on the live site",
      livePath: null,
      description:
        "The last site audit found none of these on a page. Some belong to a section that is no longer part of the site; the rest are places a page will fill once you set a photo. Nothing here is shown to guests today.",
      items: orphans.map((slot, index) =>
        toAdminItem(slot, SITE_IMAGE_UNUSED_GROUP, index + 1),
      ),
    });
  }

  return groups;
}
