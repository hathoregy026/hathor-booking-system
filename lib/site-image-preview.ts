import { getSiteImagePagePaths } from "@/lib/site-image-usage";

/**
 * Admin “View on Live Site” preview targets.
 *
 * Prefer `?viewImage=<slot>` over URL hashes. Hash jumps fight Lenis/GSAP on
 * the homepage and can crash ScrollTrigger during boot.
 *
 * Only slots that are actually rendered on the public site get a live path.
 * Orphan CMS slots (old homepage leftovers) return null so admin does not
 * open a random shared section.
 */

export const SITE_IMAGE_ANCHOR_PREFIX = "site-image-";
export const SITE_IMAGE_VIEW_PARAM = "viewImage";

/** The Suites page mirrors a scraped document inside a frame of its own. */
const CLONED_PAGE = "/suites";

export function siteImageAnchorId(name: string): string {
  return `${SITE_IMAGE_ANCHOR_PREFIX}${name}`;
}

/**
 * Optional section id when the exact image node is not found yet.
 * Only used for slots that really appear on that page — never for orphans.
 */
const SLOT_FALLBACK_SECTION: Partial<Record<string, string>> = {
  "home-hero-poster": "top",
  "home-story-craft-large": "about",
  "home-amenities-1": "details",
  "home-amenities-2": "details",
  "home-amenities-3": "details",
  "home-amenities-4": "details",
  "home-amenities-5": "details",
  "home-amenities-6": "details",
  "home-amenities-7": "details",
  "home-amenities-8": "details",
  "home-amenities-9": "details",
  "home-amenities-10": "details",
  "home-amenities-11": "details",
  "home-amenities-13": "details",
  "home-amenities-12": "details",
  "home-amenities-14": "details",
  "home-amenities-15": "details",
  "cruises-hero": "services",
  "home-carousel-suite-3n": "services",
  "home-carousel-royal-3n": "services",
  "home-carousel-king-4n": "services",
  "home-carousel-twin-4n": "services",
  "home-carousel-suite-4n": "services",
  "home-carousel-royal-4n": "services",
  "home-carousel-king-7n": "services",
  "home-carousel-twin-7n": "services",
  "home-carousel-suite-7n": "services",
  "home-carousel-royal-7n": "services",
  "about-hero": "details",
  "gastronomy-restaurant": "escape",
  "moving-tilted-1": "gallery",
  "moving-tilted-2": "gallery",
  "moving-tilted-3": "gallery",
  "moving-tilted-4": "gallery",
  "moving-tilted-5": "gallery",
};

export function getSiteImageFallbackSectionId(name: string): string | undefined {
  return SLOT_FALLBACK_SECTION[name];
}

/** True when the last site audit found this photo painted on a page. */
export function isSiteImageOnLiveSite(name: string): boolean {
  return getSiteImagePagePaths(name).length > 0;
}

/** Public path + query, e.g. `/about?viewImage=about-dining`. */
export function buildSiteImageLivePath(pagePath: string, name: string): string {
  const base = pagePath === "/" ? "/" : pagePath;
  const params = new URLSearchParams({ [SITE_IMAGE_VIEW_PARAM]: name });
  return `${base}?${params.toString()}`;
}

/**
 * Where “View on site” should open this photo.
 *
 * The audit map decides: the admin group's own page when that page paints the
 * photo, otherwise the first page that does. Null when no page shows it, so
 * the card can say so instead of offering a dead link.
 */
export function resolveSiteImageLivePath(
  name: string,
  adminGroupPagePath: string,
): string | null {
  const pages = getSiteImagePagePaths(name);
  if (pages.length === 0) return null;
  if (pages.includes(adminGroupPagePath)) {
    /* Suites renders a cloned document that scrolls itself, so a link can open
       the page but never reach the photo. Send it to a page that can. */
    if (adminGroupPagePath === CLONED_PAGE) {
      const positionable = pages.find((page) => page !== CLONED_PAGE);
      if (positionable) return buildSiteImageLivePath(positionable, name);
    }
    return buildSiteImageLivePath(adminGroupPagePath, name);
  }
  return buildSiteImageLivePath(pages[0], name);
}

export function readSiteImagePreviewName(
  search: string,
  hash: string,
): string | null {
  try {
    const fromQuery = new URLSearchParams(search).get(SITE_IMAGE_VIEW_PARAM);
    if (fromQuery?.trim()) return fromQuery.trim();
  } catch {
    /* ignore */
  }

  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw.startsWith(SITE_IMAGE_ANCHOR_PREFIX)) {
    return raw.slice(SITE_IMAGE_ANCHOR_PREFIX.length);
  }
  return null;
}
