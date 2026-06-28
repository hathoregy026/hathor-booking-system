import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";

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
  "/rooms": "Accommodations",
};

const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-hero-poster": "Hero Section",
  "home-post-hero-media": "Post-Hero Full Bleed",
  "home-story-craft-large": "Story — Craftsmanship (Large)",
  "home-story-craft-small": "Story — Craftsmanship (Small)",
  "home-story-transform": "Story — Transformation",
  "home-story-legacy-large": "Story — Legacy (Large)",
  "home-story-legacy-small": "Story — Legacy (Small)",
  "home-cinematic-video": "Cinematic Video Still",
  "home-cinematic-still": "Cinematic Suite Still",
  "home-split-courtyard": "Landmark Full Bleed",
  "home-split-service": "Split Scroll — Service",
  "home-split-interiors": "Split Scroll — Interiors",
  "home-split-venue": "Split Scroll — Journey",
  "home-collage-bg": "Collage Background",
  "home-collage-large": "Collage — Large Image",
  "home-collage-small": "Collage — Small Image",
  "home-collage-living": "Suite Full Bleed",
  "home-residences-kitchen": "Residences — Cabin",
  "home-residences-lounge": "Residences — Lounge",
  "home-residences-rooftop": "Sun Deck Full Bleed",
  "home-sketch-boat": "Sketch / Boat Visual",
  "home-alt-dining": "Alternating — Dining",
  "home-alt-wellness": "Alternating — Wellness",
  "home-alt-highlights": "Alternating — Highlights",
  "home-testimonials-bg": "Testimonials Background",
  "room-luxury": "Luxury Cabin",
  "room-suite": "Luxury Suite",
  "room-royal": "Royal Suite",
  charter: "Charter Card",
  "cruises-hero": "Cruises Hero",
  "about-hero": "About Hero",
  "about-dining": "About — Dining",
  "gastronomy-hero": "Gastronomy Hero",
  "gastronomy-restaurant": "Restaurant Section",
  "wellness-hero": "Wellness Hero",
  "wellness-fitness": "Fitness Section",
  "highlights-hero": "Highlights Hero",
  "highlights-lifestyle": "Lifestyle Section",
  "landmark-obelisk": "Landmark — Obelisk",
  "landmark-hatshepsut": "Landmark — Hatshepsut",
  "landmark-valley-kings": "Landmark — Valley of Kings",
  "charter-hero": "Charter Hero",
  "contact-hero": "Contact Hero",
  "blog-hero": "Blog Hero",
};

export type SiteImageAdminItem = {
  name: string;
  label: string;
  defaultAlt: string;
  category: SiteImageSlot["category"];
  pagePath: string;
  displayOrder: number;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
};

function labelForSlot(slot: SiteImageSlot): string {
  return SLOT_LABELS[slot.name] ?? slot.name.replace(/-/g, " ");
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
