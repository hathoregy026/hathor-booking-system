import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";

const PAGE_GROUP_TITLES: Record<string, string> = {
  "/": "Home",
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

const SLOT_LOCATION_HINTS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-hero-poster": "Homepage > Hero video poster (shown while video loads)",
  "home-post-hero-media": "Homepage > Full-width image directly below the hero",
  "home-story-craft-large": "Homepage > About section — large craftsmanship photo",
  "home-story-craft-small": "Homepage > About section — small detail photo",
  "home-story-transform": "Homepage > Story section — grand interior photo",
  "home-story-legacy-large": "Homepage > Story section — Nile sailing photo",
  "home-story-legacy-small": "Homepage > Story section — temple photo",
  "home-cinematic-video": "Homepage > Cinematic video section — video still",
  "home-cinematic-still": "Homepage > Cinematic section — suite still",
  "home-split-courtyard": "Homepage > Landmark full-bleed scroll section",
  "home-split-service": "Homepage > Split scroll — service hallway",
  "home-split-interiors": "Homepage > Split scroll — suite interior",
  "home-split-venue": "Homepage > Split scroll — Hatshepsut temple",
  "home-collage-bg": "Homepage > Collage section — background image",
  "home-collage-large": "Homepage > About decor — large collage tile",
  "home-collage-small": "Homepage > About decor — small collage tile",
  "home-collage-living": "Homepage > Collage section — suite photo",
  "home-residences-kitchen": "Homepage > Residences section — cabin interior",
  "home-residences-lounge": "Homepage > Residences section — lounge",
  "home-residences-rooftop": "Homepage > Residences section — sun deck",
  "home-sketch-boat": "Homepage > Boat sketch / deck plan visual",
  "home-alt-dining": "Homepage > Alternating blocks — dining photo",
  "home-alt-wellness": "Homepage > Alternating blocks — wellness / spa",
  "home-alt-highlights": "Homepage > Alternating blocks — Nile landmarks",
  "home-testimonials-bg": "Homepage > Testimonials section background",
  "room-luxury": "Luxury Rooms > Luxury Cabin chapter image",
  "room-suite": "Luxury Rooms > Luxury Suite chapter image",
  "room-royal": "Luxury Rooms > Royal Suite chapter image",
  charter: "Charter page > Charter overview card image",
  "cruises-hero": "Cruises > Hero background (top of page)",
  "about-hero": "About > Hero background (top of page)",
  "about-dining": "About > Dining section image",
  "gastronomy-hero": "Gastronomy > Hero background (top of page)",
  "gastronomy-restaurant": "Gastronomy > Restaurant section image",
  "wellness-hero": "Wellness > Hero background (top of page)",
  "wellness-fitness": "Wellness > Fitness section image",
  "highlights-hero": "Highlights > Hero background (top of page)",
  "highlights-lifestyle": "Highlights > Lifestyle section image",
  "landmark-obelisk": "Highlights > Obelisk landmark chapter",
  "landmark-hatshepsut": "Highlights > Hatshepsut temple chapter",
  "landmark-valley-kings": "Highlights > Valley of the Kings chapter",
  "charter-hero": "Charter > Hero background (top of page)",
  "contact-hero": "Contact > Hero background (top of page)",
  "blog-hero": "Blog > Hero background (top of page)",
};

export type SiteImageAdminItem = {
  name: string;
  label: string;
  defaultAlt: string;
  category: SiteImageSlot["category"];
  pagePath: string;
  displayOrder: number;
  /** Where this image appears on the live site. */
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
  const explicit = SLOT_LOCATION_HINTS[slot.name];
  if (explicit) return `Displays on: ${explicit}`;

  const pageTitle = PAGE_GROUP_TITLES[slot.pagePath] ?? slot.pagePath;
  const sectionLabel = labelForSlot(slot);
  return `Displays on: ${pageTitle} > ${sectionLabel}`;
}

/** e.g. "Homepage Images", "Cruises Images" */
export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Home") return "Homepage Images";
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
