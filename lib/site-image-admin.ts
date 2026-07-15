import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";

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
};

/**
 * Plain English card titles — always "Page - Clear section name".
 * Never expose internal slug codes.
 */
const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-hero-poster": "Homepage - Hero Video Cover",
  "home-post-hero-media": "Homepage - Photo Below Hero",
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
  "room-luxury": "Luxury Rooms - Luxury Cabin Photo",
  "room-suite": "Luxury Rooms - Luxury Suite Photo",
  "room-royal": "Luxury Rooms - Royal Suite Photo",
  charter: "Charter - Overview Photo",
  "cruises-hero": "Cruises - Hero Background",
  "about-hero": "About Us - Hero Background",
  "about-dining": "About Us - Dining Photo",
  "gastronomy-hero": "Gastronomy - Hero Background",
  "gastronomy-restaurant": "Gastronomy - Restaurant Photo",
  "wellness-hero": "Wellness - Hero Background",
  "wellness-fitness": "Wellness - Fitness Photo",
  "highlights-hero": "Highlights - Hero Background",
  "highlights-lifestyle": "Highlights - Lifestyle Photo",
  "landmark-obelisk": "Highlights - Obelisk Photo",
  "landmark-hatshepsut": "Highlights - Hatshepsut Temple Photo",
  "landmark-valley-kings": "Highlights - Valley of the Kings Photo",
  "charter-hero": "Charter - Hero Background",
  "contact-hero": "Contact - Hero Background",
  "blog-hero": "Blog - Hero Background",
};

/** Shape this image takes on the live page. */
export type SiteImageLayoutKind = "hero" | "gallery" | "standard";

const SLOT_LAYOUT_KINDS: Partial<Record<SiteImageSlot["name"], SiteImageLayoutKind>> =
  {
    "home-hero-poster": "hero",
    "home-post-hero-media": "hero",
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
  return (
    SLOT_LABELS[slot.name] ??
    `${PAGE_GROUP_TITLES[slot.pagePath] ?? "Site"} - Photo`
  );
}

function layoutForSlot(slot: SiteImageSlot): SiteImageLayoutKind {
  if (SLOT_LAYOUT_KINDS[slot.name]) return SLOT_LAYOUT_KINDS[slot.name]!;
  if (slot.category === "hero") return "hero";
  return "standard";
}

/** e.g. "Homepage Images", "Cruises Images" */
export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Homepage" || pageTitle === "Home") return "Homepage Images";
  if (pageTitle === "About Us") return "About Us Images";
  return `${pageTitle} Images`;
}

export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byPage = new Map<string, SiteImageAdminItem[]>();

  for (const slot of SITE_IMAGE_SLOTS) {
    const layoutKind = layoutForSlot(slot);
    const items = byPage.get(slot.pagePath) ?? [];
    items.push({
      name: slot.name,
      label: labelForSlot(slot),
      defaultAlt: slot.altText,
      category: slot.category,
      pagePath: slot.pagePath,
      livePath: slot.pagePath === "/" ? "/" : slot.pagePath,
      displayOrder: slot.displayOrder,
      layoutKind,
      layoutLabel: LAYOUT_LABELS[layoutKind],
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
