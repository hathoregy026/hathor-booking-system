import {
  SITE_IMAGE_PAGE_ORDER,
  SITE_IMAGE_PAGE_SLOTS,
  SITE_IMAGE_USAGE_CRAWLED_AT,
} from "@/lib/site-image-usage-map.generated";

/**
 * Where each photo really appears.
 *
 * The map under `site-image-usage-map.generated` is written by
 * `scripts/audit-site-images.mjs`, which walks the deployed site and records
 * the slot behind every image it paints. Nothing here is hand-maintained, so
 * the dashboard's page filters, the "also used on" note and the "View on site"
 * link all describe the site as it actually is.
 */

/** Human titles for page paths shown across the images dashboard. */
export const SITE_IMAGE_PAGE_TITLES: Record<string, string> = {
  "/": "Homepage",
  "/voyages": "Voyages",
  "/voyages/luxor-to-aswan": "Voyage — Luxor to Aswan",
  "/voyages/aswan-to-luxor": "Voyage — Aswan to Luxor",
  "/cruises-list": "Cruises",
  "/suites": "Suites",
  "/rooms": "Luxury Suite",
  "/rooms/luxury-suite": "Luxury Suite — detail",
  "/luxury-cabins-Nile-Cruise": "Luxury Cabins",
  "/rooms/luxury-king-room": "Luxury King — detail",
  "/rooms/luxury-twin-room": "Luxury Twin — detail",
  "/royal-suites": "Royal Suites",
  "/rooms/royal-suite": "Royal Suite — detail",
  "/gastronomy": "Dining",
  "/wellness": "Wellness",
  "/highlights": "Highlights",
  "/charter": "Charter",
  "/about": "About Us",
  "/blogs": "Blog",
  "/partners": "Partners",
  "/contact": "Contact",
  "/terms-and-conditions": "Terms & Conditions",
  "/booking": "Booking",
  "/booking/lookup": "Booking — find a request",
};

export const SITE_IMAGE_USAGE_DATE = SITE_IMAGE_USAGE_CRAWLED_AT;

export type SiteImageUsedOnPage = {
  path: string;
  title: string;
};

export function siteImagePageTitle(path: string): string {
  return SITE_IMAGE_PAGE_TITLES[path] ?? path;
}

/** Page order from the audit, so every list reads in visiting order. */
export const SITE_IMAGE_PAGES: readonly string[] = SITE_IMAGE_PAGE_ORDER;

/** slot → the pages that paint it, in page order. */
const PAGES_BY_SLOT: ReadonlyMap<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const path of SITE_IMAGE_PAGE_ORDER) {
    for (const name of SITE_IMAGE_PAGE_SLOTS[path] ?? []) {
      const pages = map.get(name);
      if (pages) pages.push(path);
      else map.set(name, [path]);
    }
  }
  return map;
})();

/** The pages that show this photo. Empty when the live site never paints it. */
export function getSiteImagePagePaths(slotName: string): readonly string[] {
  return PAGES_BY_SLOT.get(slotName) ?? [];
}

export function getSiteImageUsedOnPages(slotName: string): SiteImageUsedOnPage[] {
  return getSiteImagePagePaths(slotName).map((path) => ({
    path,
    title: siteImagePageTitle(path),
  }));
}

/** The slots a page paints, in the order the page paints them. */
export function getSiteImageSlotNamesForPage(path: string): readonly string[] {
  return SITE_IMAGE_PAGE_SLOTS[path] ?? [];
}

export function formatSiteImageUsedOnLabel(pages: SiteImageUsedOnPage[]): string {
  if (pages.length === 0) return "Not on the live site";
  if (pages.length === 1) return `Used on: ${pages[0].title}`;
  return `Used on: ${pages.map((page) => page.title).join(" · ")}`;
}

/** Slot names the Suites clone reads from the dashboard (shared with the room pages). */
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
  "scraped-royal-7",
  "scraped-royal-8",
  "scraped-cabin-4",
  "scraped-cabin-7",
  "scraped-cabin-8",
  "suites-nile-still",
] as const;
