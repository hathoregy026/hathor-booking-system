import { SITE_IMAGE_SLOTS, type SiteImageSlot } from "@/lib/site-image-slots";
import {
  HOMEPAGE_LIVE_SLOT_NAMES,
  resolveSiteImageLivePath,
} from "@/lib/site-image-preview";

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
  "/__unused": "Unused (old homepage)",
};

/**
 * Live homepage cards in page order — only these appear under the Homepage tab.
 * Keep in sync with `lib/ex-page-content.ts` + hero poster.
 */
const HOMEPAGE_LIVE_ADMIN_CARDS: ReadonlyArray<{ name: string; label: string }> =
  [
    { name: "home-hero-poster", label: "Hero — video poster / cover" },
    { name: "home-story-craft-large", label: "About — main photo" },
    { name: "home-collage-small", label: "About — small decor tile" },
    { name: "home-collage-large", label: "About — large decor tile" },
    {
      name: "home-split-courtyard",
      label: "About decor / landmarks / lifestyle photo",
    },
    {
      name: "cruises-hero",
      label: "Itineraries carousel + landmarks — Cruises photo",
    },
    {
      name: "room-suite",
      label: "Itineraries carousel — Luxury Suite",
    },
    {
      name: "room-royal",
      label: "Itineraries carousel — Royal Suite",
    },
    {
      name: "room-luxury",
      label: "Itineraries carousel — Luxury Cabin",
    },
    { name: "about-hero", label: "Landmarks scroll — About photo" },
    {
      name: "home-story-legacy-large",
      label: "Landmarks scroll — Nile ship photo",
    },
    {
      name: "gastronomy-restaurant",
      label: "Dining section + gallery — Restaurant",
    },
    { name: "home-collage-living", label: "Gallery — lounge photo" },
    { name: "home-alt-highlights", label: "Gallery — landmarks photo" },
    { name: "wellness-hero", label: "Gallery — wellness photo" },
    { name: "home-cinematic-still", label: "Gallery — suite photo" },
  ];

/**
 * Plain English card titles for non-homepage slots.
 */
const SLOT_LABELS: Partial<Record<SiteImageSlot["name"], string>> = {
  "home-story-craft-small": "Unused — About Detail Photo",
  "home-story-transform": "Unused — Story Interior Photo",
  "home-story-legacy-small": "Unused — Story Temple Photo",
  "home-cinematic-video": "Unused — Main Video Background",
  "home-split-service": "Unused — Scroll Hallway Photo",
  "home-split-interiors": "Unused — Scroll Suite Photo",
  "home-split-venue": "Unused — Scroll Temple Photo",
  "home-collage-bg": "Unused — Collage Background",
  "home-residences-kitchen": "Unused — Cabin Photo",
  "home-residences-lounge": "Unused — Lounge Photo",
  "home-residences-rooftop": "Unused — Sun Deck Photo",
  "home-sketch-boat": "Unused — Boat Sketch Photo",
  "home-alt-dining": "Unused — Dining Feature Photo",
  "home-alt-wellness": "Unused — Wellness Feature Photo",
  "home-testimonials-bg": "Unused — Guest Reviews Background",
  "home-post-hero-media": "Unused — Photo Below Hero",
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
    "home-hero-poster": "hero",
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
  /** Live public URL path for this image’s page, or null if not on the live site. */
  livePath: string | null;
  layoutKind: SiteImageLayoutKind;
  layoutLabel: string;
};

export type SiteImageAdminGroup = {
  pagePath: string;
  title: string;
  items: SiteImageAdminItem[];
  /** Optional helper under the group title in admin. */
  description?: string;
};

function labelForSlot(slot: SiteImageSlot): string {
  if (SLOT_LABELS[slot.name]) return SLOT_LABELS[slot.name]!;
  const page = PAGE_GROUP_TITLES[slot.pagePath] ?? "Site";
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

/** e.g. "Homepage Images", "Cruises Images" */
export function getSiteImageGroupHeading(pageTitle: string): string {
  if (pageTitle === "Homepage" || pageTitle === "Home") return "Homepage Images";
  if (pageTitle === "About Us") return "About Us Images";
  if (pageTitle.startsWith("Unused")) return pageTitle;
  return `${pageTitle} Images`;
}

function toAdminItem(
  slot: SiteImageSlot,
  adminGroupPagePath: string,
  labelOverride?: string,
  displayOrderOverride?: number,
): SiteImageAdminItem {
  const layoutKind = layoutForSlot(slot);
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
  };
}

export function getSiteImageAdminGroups(): SiteImageAdminGroup[] {
  const byName = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.name, slot]));
  const claimedByHomepage = new Set(HOMEPAGE_LIVE_ADMIN_CARDS.map((c) => c.name));

  /* Homepage tab = only images that actually appear on the live `/` page */
  const homepageItems: SiteImageAdminItem[] = [];
  HOMEPAGE_LIVE_ADMIN_CARDS.forEach((card, index) => {
    const slot = byName.get(card.name);
    if (!slot) return;
    homepageItems.push(toAdminItem(slot, "/", card.label, index + 1));
  });

  /* Other page tabs — exclude slots already listed on Homepage as primary home use… 
     No: keep them on their page tabs too so Cruises/Rooms editors still find them.
     Only remove unused home-* from Homepage. */
  const byPage = new Map<string, SiteImageAdminItem[]>();
  const unusedHome: SiteImageAdminItem[] = [];

  for (const slot of SITE_IMAGE_SLOTS) {
    if (slot.pagePath === "/") {
      if (claimedByHomepage.has(slot.name) || HOMEPAGE_LIVE_SLOT_NAMES.has(slot.name)) {
        continue; /* shown under Homepage live list */
      }
      unusedHome.push(toAdminItem(slot, "/__unused"));
      continue;
    }

    const items = byPage.get(slot.pagePath) ?? [];
    items.push(toAdminItem(slot, slot.pagePath));
    byPage.set(slot.pagePath, items);
  }

  const pageOrder = [
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

  const orderedPaths = [
    ...pageOrder.filter((pagePath) => byPage.has(pagePath)),
    ...[...byPage.keys()].filter((pagePath) => !pageOrder.includes(pagePath)),
  ];

  const groups: SiteImageAdminGroup[] = [
    {
      pagePath: "/",
      title: "Homepage",
      description:
        "Only photos that appear on the live homepage. Edit here to change what guests see on /.",
      items: homepageItems,
    },
    ...orderedPaths.map((pagePath) => ({
      pagePath,
      title: PAGE_GROUP_TITLES[pagePath] ?? pagePath,
      items: (byPage.get(pagePath) ?? []).sort(
        (a, b) =>
          a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
      ),
    })),
  ];

  if (unusedHome.length > 0) {
    groups.push({
      pagePath: "/__unused",
      title: "Unused (old homepage)",
      description:
        "Leftovers from an older homepage layout. They are not shown on the live site today — safe to ignore, or replace if you plan to reuse them later.",
      items: unusedHome.sort(
        (a, b) =>
          a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
      ),
    });
  }

  return groups;
}
