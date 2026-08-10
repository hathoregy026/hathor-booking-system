import { HOMEPAGE_LIVE_SLOT_NAMES } from "@/lib/site-image-preview";
import type { SiteImageSlot } from "@/lib/site-image-slots";

/** Human titles for page paths shown on admin image cards. */
export const SITE_IMAGE_PAGE_TITLES: Record<string, string> = {
  "/": "Homepage",
  "/#amenities-sequence": "Amenities Sequence",
  "/#moving-tilted-cards": "Moving Tilted Cards",
  "/#floating-ig": "Floating IG",
  "/#our-voyages": "Our Voyages",
  "/cruises": "Cruises",
  "/about": "About Us",
  "/gastronomy": "Dining",
  "/wellness": "Wellness",
  "/highlights": "Highlights",
  "/charter": "Charter",
  "/contact": "Contact",
  "/blogs": "Blog",
  "/suites": "Suites",
  "/rooms": "Luxury Rooms",
  "/luxury-cabins-Nile-Cruise": "Luxury Cabins Gallery",
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise": "Royal Suites Gallery",
};

/**
 * Extra live pages beyond a slot’s primary `pagePath`.
 * Keep linked images shared — do not duplicate slots.
 */
const EXTRA_USAGE_BY_SLOT: Partial<Record<string, readonly string[]>> = {
  "room-suite": ["/suites", "/rooms"],
  "room-royal": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "room-luxury": ["/suites", "/luxury-cabins-Nile-Cruise"],

  "scraped-suites-hero": ["/suites"],
  "scraped-suites-luxury-rooms": ["/suites"],
  "scraped-suites-luxury-suites": ["/suites"],
  "scraped-suites-royal": ["/suites"],
  "scraped-luxsuite-1": ["/suites", "/rooms"],
  "scraped-luxsuite-2": ["/suites", "/rooms"],
  "scraped-luxsuite-3": ["/suites", "/rooms"],
  "scraped-luxsuite-4": ["/suites", "/rooms"],
  "scraped-luxsuite-5": ["/suites", "/rooms"],
  "scraped-luxsuite-6": ["/suites", "/rooms"],
  "scraped-cabin-1": ["/suites", "/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-2": ["/suites", "/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-3": ["/suites", "/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-4": ["/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-5": ["/suites", "/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-6": ["/suites", "/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-7": ["/luxury-cabins-Nile-Cruise"],
  "scraped-cabin-8": ["/luxury-cabins-Nile-Cruise"],
  "scraped-royal-1": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-2": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-3": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-4": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-5": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-6": ["/suites", "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-7": ["/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
  "scraped-royal-8": ["/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
};

/** Slot names the Suites iframe reads from the dashboard (shared with Rooms / galleries). */
export const SUITES_DASHBOARD_SLOT_NAMES = [
  "scraped-suites-hero",
  "scraped-royal-5",
  "scraped-luxsuite-2",
  "scraped-suites-royal",
  "scraped-luxsuite-6",
  "scraped-luxsuite-1",
  "scraped-suites-luxury-rooms",
  "scraped-royal-1",
  "scraped-cabin-2",
  "scraped-cabin-3",
  "scraped-cabin-1",
  "scraped-royal-3",
  "scraped-luxsuite-3",
  "scraped-luxsuite-4",
  "scraped-cabin-5",
  "scraped-suites-luxury-suites",
  "scraped-luxsuite-5",
  "room-suite",
  "room-royal",
  "scraped-royal-2",
  "scraped-royal-4",
  "scraped-royal-6",
  "scraped-cabin-6",
  "room-luxury",
] as const;

export type SiteImageUsedOnPage = {
  path: string;
  title: string;
};

function pageTitle(path: string): string {
  return SITE_IMAGE_PAGE_TITLES[path] ?? path;
}

/** Ordered unique pages where this slot appears live. */
export function getSiteImageUsedOnPages(
  slotName: string,
  primaryPagePath: string,
): SiteImageUsedOnPage[] {
  const paths = new Set<string>([primaryPagePath]);
  for (const path of EXTRA_USAGE_BY_SLOT[slotName] ?? []) {
    paths.add(path);
  }
  if (HOMEPAGE_LIVE_SLOT_NAMES.has(slotName)) {
    paths.add("/");
  }

  const preferredOrder = [
    "/",
    "/#amenities-sequence",
    "/#our-voyages",
    "/#moving-tilted-cards",
    "/#floating-ig",
    "/suites",
    "/rooms",
    "/luxury-cabins-Nile-Cruise",
    "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    "/cruises",
    "/about",
    "/gastronomy",
    "/wellness",
    "/highlights",
    "/charter",
    "/contact",
    "/blogs",
  ];

  const ordered = [
    ...preferredOrder.filter((path) => paths.has(path)),
    ...[...paths].filter((path) => !preferredOrder.includes(path)),
  ];

  return ordered.map((path) => ({ path, title: pageTitle(path) }));
}

/** Every admin page tab that should list this slot (primary + shared usages). */
export function getSiteImageAdminAppearPaths(slot: SiteImageSlot): string[] {
  return getSiteImageUsedOnPages(slot.name, slot.pagePath).map((page) => page.path);
}

export function formatSiteImageUsedOnLabel(pages: SiteImageUsedOnPage[]): string {
  if (pages.length === 0) return "Not linked to a live page";
  if (pages.length === 1) return `Used on: ${pages[0].title}`;
  return `Used on: ${pages.map((page) => page.title).join(" · ")}`;
}
