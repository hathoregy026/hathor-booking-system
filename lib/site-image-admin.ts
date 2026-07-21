import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";
import { buildSiteImageLivePath } from "@/lib/site-image-preview";

/** Client-facing page names for tabs / accordion headers. */
const PAGE_GROUP_TITLES: Record<string, string> = {
  "/": "Homepage",
  "/cruises": "Cruises",
  "/about": "About Us",
  "/gastronomy": "Gastronomy",
  "/wellness": "Wellness",
  "/highlights": "Highlights",
  "/charter": "Charter",
  "/contact": "Contact",
  "/blogs": "Blog",
  "/rooms": "Luxury Rooms",
  "/luxury-cabins-Nile-Cruise": "Luxury Cabins Gallery",
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise": "Royal Suites Gallery",
};

/**
 * Plain English card titles — always "Page - Clear section name".
 * Never expose internal slug codes.
 */
const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-story-craft-large": "Homepage - About Large Photo",
  "home-story-craft-small": "Homepage - About Detail Photo",
  "home-story-transform": "Homepage - Story Interior Photo",
  "home-story-legacy-large": "Homepage - Story Nile Photo",
  "home-story-legacy-small": "Homepage - Story Temple Photo",
  "home-cinematic-video": "Homepage - Main Video Background",
  "home-cinematic-still": "Homepage - Suite Showcase Photo",
  "home-split-courtyard": "Homepage - Landmark Full-Width Photo",
  "home-split-service": "Homepage - Scroll Hallway Photo",
  "home-split-interiors": "Homepage - Scroll Suite Photo",
  "home-split-venue": "Homepage - Scroll Temple Photo",
  "home-collage-bg": "Homepage - Collage Background",
  "home-collage-large": "Homepage - Collage Large Tile",
  "home-collage-small": "Homepage - Collage Small Tile",
  "home-collage-living": "Homepage - Collage Suite Photo",
  "home-residences-kitchen": "Homepage - Cabin Photo",
  "home-residences-lounge": "Homepage - Lounge Photo",
  "home-residences-rooftop": "Homepage - Sun Deck Photo",
  "home-sketch-boat": "Homepage - Boat Sketch Photo",
  "home-alt-dining": "Homepage - Dining Feature Photo",
  "home-alt-wellness": "Homepage - Wellness Feature Photo",
  "home-alt-highlights": "Homepage - Landmarks Feature Photo",
  "home-testimonials-bg": "Homepage - Guest Reviews Background",
  "room-luxury": "Hero — Luxury Rooms",
  "room-suite": "Luxury Rooms - Luxury Suite Photo",
  "room-royal": "Hero — Royal Suites",
  charter: "Charter - Overview Photo",
  "cruises-hero": "Hero — Cruises",
  "about-hero": "Hero — About Us",
  "about-dining": "About Us - Dining Photo",
  "gastronomy-hero": "Hero — Gastronomy",
  "gastronomy-restaurant": "Gastronomy - Restaurant Photo",
  "wellness-hero": "Hero — Wellness",
  "wellness-fitness": "Wellness - Fitness Photo",
  "highlights-hero": "Hero — Highlights",
  "highlights-lifestyle": "Highlights - Lifestyle Photo",
  "landmark-obelisk": "Highlights - Obelisk Photo",
  "landmark-hatshepsut": "Highlights - Hatshepsut Temple Photo",
  "landmark-valley-kings": "Highlights - Valley of the Kings Photo",
  "charter-hero": "Hero — Charter",
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
};

/** Shape this image takes on the live page. */
export type SiteImageLayoutKind = "hero" | "gallery" | "standard";

const SLOT_LAYOUT_KINDS: Partial<Record<SiteImageSlot["name"], SiteImageLayoutKind>> =
  {
    "home-cinematic-video": "hero",
    "home-cinematic-still": "hero",
    "home-split-courtyard": "hero",
    "home-collage-bg": "hero",
    "home-residences-rooftop": "hero",
    "home-testimonials-bg": "hero",
    "home-collage-large": "gallery",
    "home-collage-small": "gallery",
    "home-story-craft-small": "gallery",
    "cruises-hero": "hero",
    "about-hero": "hero",
    "gastronomy-hero": "hero",
    "wellness-hero": "hero",
    "highlights-hero": "hero",
    "charter-hero": "hero",
    "contact-hero": "hero",
    "blog-hero": "hero",
    "room-luxury": "hero",
    "room-royal": "hero",
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
  /** Live public URL path for this image’s page. */
  livePath: string;
  layoutKind: SiteImageLayoutKind;
  layoutLabel: string;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
};

function labelForSlot(slot: SiteImageSlot): string {
  if (SLOT_LABELS[slot.name]) return SLOT_LABELS[slot.name]!;
  const page = PAGE_GROUP_TITLES[slot.pagePath] ?? "Site";
  /* Never fall back to a bare "Photo" — always include the slot id so it is editable & identifiable */
  return `${page} — ${slot.name.replace(/-/g, " ")}`;
}

function layoutForSlot(slot: SiteImageSlot): SiteImageLayoutKind {
  if (SLOT_LAYOUT_KINDS[slot.name]) return SLOT_LAYOUT_KINDS[slot.name]!;
  if (slot.category === "hero") return "hero";
  if (slot.name.includes("collage") || slot.name.startsWith("scraped-")) {
    return "gallery";
  }
  return "standard";
}

/**
 * Slots that appear on the live homepage (`HomePageClient`) but live under
 * another pagePath — also listed under Homepage so every on-page photo is editable there.
 */
const HOMEPAGE_LINKED_EXTRA_NAMES = [
  "cruises-hero",
  "room-suite",
  "room-royal",
  "room-luxury",
  "about-hero",
  "gastronomy-restaurant",
  "wellness-hero",
] as const;

const HOMEPAGE_LINKED_EXTRA_LABELS: Record<
  (typeof HOMEPAGE_LINKED_EXTRA_NAMES)[number],
  string
> = {
  "cruises-hero": "Homepage — Itineraries / landmarks (Cruises photo)",
  "room-suite": "Homepage — Itineraries carousel (Luxury Suite)",
  "room-royal": "Homepage — Itineraries carousel (Royal Suite)",
  "room-luxury": "Homepage — Itineraries carousel (Luxury Cabin)",
  "about-hero": "Homepage — Landmark scroll (About photo)",
  "gastronomy-restaurant": "Homepage — Dining & gallery (Restaurant)",
  "wellness-hero": "Homepage — Gallery (Wellness)",
};

/** e.g. "Homepage Images", "Cruises Images" */
export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Homepage" || pageTitle === "Home") return "Homepage Images";
  if (pageTitle === "About Us") return "About Us Images";
  return `${pageTitle} Images`;
}

function toAdminItem(slot: SiteImageSlot, labelOverride?: string): SiteImageAdminItem {
  const layoutKind = layoutForSlot(slot);
  return {
    name: slot.name,
    label: labelOverride ?? labelForSlot(slot),
    defaultAlt: slot.altText,
    category: slot.category,
    pagePath: slot.pagePath,
    livePath: buildSiteImageLivePath("/", slot.name),
    displayOrder: slot.displayOrder,
    layoutKind,
    layoutLabel: LAYOUT_LABELS[layoutKind],
  };
}

export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byPage = new Map<string, SiteImageAdminItem[]>();
  const byName = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.name, slot]));

  for (const slot of SITE_IMAGE_SLOTS) {
    const items = byPage.get(slot.pagePath) ?? [];
    items.push({
      ...toAdminItem(slot),
      livePath: buildSiteImageLivePath(slot.pagePath, slot.name),
    });
    byPage.set(slot.pagePath, items);
  }

  /* Surface every homepage-visible cross-page slot under Homepage too */
  const homeItems = byPage.get("/") ?? [];
  const homeNames = new Set(homeItems.map((item) => item.name));
  let extraOrder = 900;
  for (const name of HOMEPAGE_LINKED_EXTRA_NAMES) {
    if (homeNames.has(name)) continue;
    const slot = byName.get(name);
    if (!slot) continue;
    homeItems.push({
      ...toAdminItem(slot, HOMEPAGE_LINKED_EXTRA_LABELS[name]),
      displayOrder: extraOrder++,
      livePath: buildSiteImageLivePath("/", slot.name),
    });
    homeNames.add(name);
  }
  byPage.set("/", homeItems);

  const pageOrder = [
    "/",
    "/cruises",
    "/rooms",
    "/luxury-cabins-Nile-Cruise",
    "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    "/about",
    "/gastronomy",
    "/wellness",
    "/highlights",
    "/charter",
    "/contact",
    "/blogs",
  ];

  /* Guarantee every slot appears — append any pagePath not listed above */
  const orderedPaths = [
    ...pageOrder.filter((pagePath) => byPage.has(pagePath)),
    ...[...byPage.keys()].filter((pagePath) => !pageOrder.includes(pagePath)),
  ];

  return orderedPaths.map((pagePath) => ({
    pagePath,
    title: PAGE_GROUP_TITLES[pagePath] ?? pagePath,
    items: (byPage.get(pagePath) ?? []).sort(
      (a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
    ),
  }));
}
