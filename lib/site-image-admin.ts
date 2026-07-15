import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";

/** Client-facing page names for group tabs / accordion headers. */
const PAGE_GROUP_TITLES: Record<string, string> = {
  "/": "Homepage",
  "/cruises": "Cruises",
  "/about": "About",
  "/gastronomy": "Gastronomy",
  "/wellness": "Wellness",
  "/highlights": "Highlights",
  "/charter": "Charter",
  "/contact": "Contact",
  "/blogs": "Blog",
  "/rooms": "Luxury Rooms",
};

/** Plain English titles — never show internal slug codes to the client. */
const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-hero-poster": "Homepage Hero Video Cover",
  "home-post-hero-media": "Image Below the Homepage Hero",
  "home-story-craft-large": "About Section — Large Photo",
  "home-story-craft-small": "About Section — Small Detail Photo",
  "home-story-transform": "Story Section — Grand Interior",
  "home-story-legacy-large": "Story Section — Nile Sailing Photo",
  "home-story-legacy-small": "Story Section — Temple Photo",
  "home-cinematic-video": "Main Homepage Video Background",
  "home-cinematic-still": "Homepage Suite Showcase Photo",
  "home-split-courtyard": "Landmark Full-Width Photo",
  "home-split-service": "Scroll Section — Hallway Photo",
  "home-split-interiors": "Scroll Section — Suite Interior",
  "home-split-venue": "Scroll Section — Temple Photo",
  "home-collage-bg": "Collage Section Background",
  "home-collage-large": "About Decor — Large Tile",
  "home-collage-small": "About Decor — Small Tile",
  "home-collage-living": "Collage Section — Suite Photo",
  "home-residences-kitchen": "Cabins Section — Cabin Photo",
  "home-residences-lounge": "Cabins Section — Lounge Photo",
  "home-residences-rooftop": "Cabins Section — Sun Deck Photo",
  "home-sketch-boat": "Boat Sketch Visual",
  "home-alt-dining": "Dining Feature Photo",
  "home-alt-wellness": "Wellness Feature Photo",
  "home-alt-highlights": "Landmarks Feature Photo",
  "home-testimonials-bg": "Guest Reviews Background",
  "room-luxury": "Luxury Cabin Photo",
  "room-suite": "Luxury Suite Photo",
  "room-royal": "Royal Suite Photo",
  charter: "Charter Overview Photo",
  "cruises-hero": "Cruises Page — Top Banner",
  "about-hero": "About Page — Top Banner",
  "about-dining": "About Page — Dining Photo",
  "gastronomy-hero": "Gastronomy Page — Top Banner",
  "gastronomy-restaurant": "Restaurant Section Photo",
  "wellness-hero": "Wellness Page — Top Banner",
  "wellness-fitness": "Fitness Section Photo",
  "highlights-hero": "Highlights Page — Top Banner",
  "highlights-lifestyle": "Lifestyle Section Photo",
  "landmark-obelisk": "Obelisk Landmark Photo",
  "landmark-hatshepsut": "Hatshepsut Temple Photo",
  "landmark-valley-kings": "Valley of the Kings Photo",
  "charter-hero": "Charter Page — Top Banner",
  "contact-hero": "Contact Page — Top Banner",
  "blog-hero": "Blog Page — Top Banner",
};

/**
 * Short client location line shown as a badge.
 * Format: "Homepage - Main Video Section"
 */
const SLOT_LOCATIONS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-hero-poster": "Homepage - Hero Video Cover",
  "home-post-hero-media": "Homepage - Below Hero",
  "home-story-craft-large": "Homepage - About (Large Photo)",
  "home-story-craft-small": "Homepage - About (Detail Photo)",
  "home-story-transform": "Homepage - Story Interior",
  "home-story-legacy-large": "Homepage - Story Nile Photo",
  "home-story-legacy-small": "Homepage - Story Temple Photo",
  "home-cinematic-video": "Homepage - Main Video Section",
  "home-cinematic-still": "Homepage - Suite Showcase",
  "home-split-courtyard": "Homepage - Landmark Full Width",
  "home-split-service": "Homepage - Scroll Hallway",
  "home-split-interiors": "Homepage - Scroll Suite",
  "home-split-venue": "Homepage - Scroll Temple",
  "home-collage-bg": "Homepage - Collage Background",
  "home-collage-large": "Homepage - About Decor (Large)",
  "home-collage-small": "Homepage - About Decor (Small)",
  "home-collage-living": "Homepage - Collage Suite",
  "home-residences-kitchen": "Homepage - Cabins Cabin",
  "home-residences-lounge": "Homepage - Cabins Lounge",
  "home-residences-rooftop": "Homepage - Cabins Sun Deck",
  "home-sketch-boat": "Homepage - Boat Sketch",
  "home-alt-dining": "Homepage - Dining Feature",
  "home-alt-wellness": "Homepage - Wellness Feature",
  "home-alt-highlights": "Homepage - Landmarks Feature",
  "home-testimonials-bg": "Homepage - Guest Reviews Background",
  "room-luxury": "Luxury Rooms - Luxury Cabin",
  "room-suite": "Luxury Rooms - Luxury Suite",
  "room-royal": "Luxury Rooms - Royal Suite",
  charter: "Charter - Overview Card",
  "cruises-hero": "Cruises - Top Banner",
  "about-hero": "About - Top Banner",
  "about-dining": "About - Dining Section",
  "gastronomy-hero": "Gastronomy - Top Banner",
  "gastronomy-restaurant": "Gastronomy - Restaurant",
  "wellness-hero": "Wellness - Top Banner",
  "wellness-fitness": "Wellness - Fitness Section",
  "highlights-hero": "Highlights - Top Banner",
  "highlights-lifestyle": "Highlights - Lifestyle Section",
  "landmark-obelisk": "Highlights - Obelisk",
  "landmark-hatshepsut": "Highlights - Hatshepsut Temple",
  "landmark-valley-kings": "Highlights - Valley of the Kings",
  "charter-hero": "Charter - Top Banner",
  "contact-hero": "Contact - Top Banner",
  "blog-hero": "Blog - Top Banner",
};

export type SiteImageAdminItem = {
  name: string;
  label: string;
  defaultAlt: string;
  category: SiteImageSlot["category"];
  pagePath: string;
  displayOrder: number;
  /** Client location badge text, e.g. "Homepage - Main Video Section". */
  locationHint: string;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
};

function labelForSlot(slot: SiteImageSlot): string {
  return SLOT_LABELS[slot.name] ?? slot.name.replace(/-/g, " ");
}

function locationHintForSlot(slot: SiteImageSlot): string {
  const explicit = SLOT_LOCATIONS[slot.name];
  if (explicit) return explicit;

  const pageTitle = PAGE_GROUP_TITLES[slot.pagePath] ?? "Site";
  return `${pageTitle} - ${labelForSlot(slot)}`;
}

/** e.g. "Homepage Images", "Cruises Images" */
export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Homepage" || pageTitle === "Home") return "Homepage Images";
  return `${pageTitle} Images`;
}

export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byPage = new Map<string, SiteImageAdminItem[]>();

  for (const slot of SITE_IMAGE_SLOTS) {
    const items = byPage.get(slot.pagePath) ?? [];
    items.push({
      name: slot.name,
      label: labelForSlot(slot),
      defaultAlt: slot.altText,
      category: slot.category,
      pagePath: slot.pagePath,
      displayOrder: slot.displayOrder,
      locationHint: locationHintForSlot(slot),
    });
    byPage.set(slot.pagePath, items);
  }

  const pageOrder = [
    "/",
    "/cruises",
    "/rooms",
    "/about",
    "/gastronomy",
    "/wellness",
    "/highlights",
    "/charter",
    "/contact",
    "/blogs",
  ];

  return pageOrder
    .filter((pagePath) => byPage.has(pagePath))
    .map((pagePath) => ({
      pagePath,
      title: PAGE_GROUP_TITLES[pagePath] ?? pagePath,
      items: (byPage.get(pagePath) ?? []).sort(
        (a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
      ),
    }));
}
