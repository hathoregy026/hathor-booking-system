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

export function siteImageAnchorId(name: string): string {
  return `${SITE_IMAGE_ANCHOR_PREFIX}${name}`;
}

/**
 * Slots currently rendered on the live homepage (`HomePageClient` / `/`).
 * Keep in sync with `lib/ex-page-content.ts` + hero poster.
 */
export const HOMEPAGE_LIVE_SLOT_NAMES = new Set<string>([
  "home-hero-poster",
  "burger-nav-image",
  "home-story-craft-large",
  "home-carousel-suite-3n",
  "home-carousel-royal-3n",
  "home-carousel-king-4n",
  "home-carousel-twin-4n",
  "home-carousel-suite-4n",
  "home-carousel-royal-4n",
  "home-carousel-king-7n",
  "home-carousel-twin-7n",
  "home-carousel-suite-7n",
  "home-carousel-royal-7n",
  "home-amenities-1",
  "home-amenities-2",
  "home-amenities-3",
  "home-amenities-4",
  "home-amenities-5",
  "home-amenities-6",
  "home-amenities-7",
  "home-amenities-8",
  "home-amenities-9",
  "home-amenities-10",
  "home-amenities-11",
  "home-amenities-13",
  "home-amenities-12",
  "home-amenities-14",
  "home-amenities-15",
  "moving-tilted-1",
  "moving-tilted-2",
  "moving-tilted-3",
  "moving-tilted-4",
  "moving-tilted-5",
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
  "home-voyage-nile-majesty",
  "home-wheel-stage",
  "home-wheel-image",
  "floating-ig-1",
  "floating-ig-2",
  "floating-ig-3",
  "floating-ig-4",
]);

/**
 * Primary public page where a slot is rendered.
 * Missing entries = not shown on the live site (still editable in CMS).
 */
const SITE_IMAGE_PRIMARY_PAGE: Partial<Record<string, string>> = {
  "home-hero-poster": "/",
  "home-story-craft-large": "/",
  "home-amenities-1": "/",
  "home-amenities-2": "/",
  "home-amenities-3": "/",
  "home-amenities-4": "/",
  "home-amenities-5": "/",
  "home-amenities-6": "/",
  "home-amenities-7": "/",
  "home-amenities-8": "/",
  "home-amenities-9": "/",
  "home-amenities-10": "/",
  "home-amenities-11": "/",
  "home-amenities-13": "/",
  "home-amenities-12": "/",
  "home-amenities-14": "/",
  "home-amenities-15": "/",
  "home-wheel-stage": "/",
  "home-wheel-image": "/",
  "home-voyage-3n-aswan-luxor": "/",
  "home-voyage-4n-luxor-aswan": "/",
  "home-voyage-7n-roundtrip": "/",
  "home-voyage-nile-majesty": "/",
  "home-carousel-suite-3n": "/",
  "home-carousel-royal-3n": "/",
  "home-carousel-king-4n": "/",
  "home-carousel-twin-4n": "/",
  "home-carousel-suite-4n": "/",
  "home-carousel-royal-4n": "/",
  "home-carousel-king-7n": "/",
  "home-carousel-twin-7n": "/",
  "home-carousel-suite-7n": "/",
  "home-carousel-royal-7n": "/",

  "floating-ig-1": "/",
  "floating-ig-2": "/",
  "floating-ig-3": "/",
  "floating-ig-4": "/",

  "moving-tilted-1": "/",
  "moving-tilted-2": "/",
  "moving-tilted-3": "/",
  "moving-tilted-4": "/",
  "moving-tilted-5": "/",

  "cruises-hero": "/cruises-list",
  "cabins-hero": "/luxury-cabins-Nile-Cruise",
  "room-luxury": "/suites",
  "room-suite": "/rooms",
  "room-royal": "/royal-suites",
  charter: "/charter",
  "charter-hero": "/charter",
  "charter-privacy": "/charter",
  "charter-service": "/charter",
  "charter-rhythm": "/charter",
  "charter-itinerary": "/charter",
  "about-hero": "/about",
  "about-dining": "/about",
  "gastronomy-hero": "/gastronomy",
  "gastronomy-restaurant": "/gastronomy",
  "gastronomy-table": "/gastronomy",
  "gastronomy-courses": "/gastronomy",
  "gastronomy-wine": "/gastronomy",
  "gastronomy-chef": "/gastronomy",
  "gastronomy-service": "/gastronomy",
  "gastronomy-celebration": "/gastronomy",
  "gastronomy-plate-1": "/gastronomy",
  "gastronomy-plate-2": "/gastronomy",
  "gastronomy-plate-3": "/gastronomy",
  "gastronomy-plate-4": "/gastronomy",
  "gastronomy-plate-5": "/gastronomy",
  "gastronomy-plate-6": "/gastronomy",
  "gastronomy-plate-7": "/gastronomy",
  "dining-plate-1": "/gastronomy",
  "dining-plate-2": "/gastronomy",
  "dining-plate-3": "/gastronomy",
  "dining-plate-4": "/gastronomy",
  "dining-plate-5": "/gastronomy",
  "dining-plate-6": "/gastronomy",
  "dining-plate-7": "/gastronomy",
  "wellness-hero": "/wellness",
  "wellness-fitness": "/wellness",
  "highlights-hero": "/highlights",
  "highlights-lifestyle": "/highlights",
  "landmark-obelisk": "/highlights",
  "landmark-hatshepsut": "/highlights",
  "landmark-valley-kings": "/highlights",
  "contact-hero": "/contact",
  "blog-hero": "/blogs",

  "scraped-suites-hero": "/suites",
  "scraped-suites-luxury-rooms": "/suites",
  "scraped-suites-luxury-suites": "/suites",
  "scraped-suites-royal": "/suites",
  "scraped-luxsuite-1": "/suites",
  "scraped-luxsuite-2": "/suites",
  "scraped-luxsuite-3": "/suites",
  "scraped-luxsuite-4": "/suites",
  "scraped-luxsuite-5": "/suites",
  "scraped-luxsuite-6": "/suites",
  "scraped-cabin-1": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-2": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-3": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-4": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-5": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-6": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-7": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-8": "/luxury-cabins-Nile-Cruise",
  "scraped-royal-1": "/royal-suites",
  "scraped-royal-2": "/royal-suites",
  "scraped-royal-3": "/royal-suites",
  "scraped-royal-4": "/royal-suites",
  "scraped-royal-5": "/royal-suites",
  "scraped-royal-6": "/royal-suites",
  "scraped-royal-7": "/royal-suites",
  "scraped-royal-8": "/royal-suites",
  "suites-nile-still": "/suites",
  "burger-nav-image": "/",
};

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

export function isSiteImageOnLiveSite(name: string): boolean {
  return (
    HOMEPAGE_LIVE_SLOT_NAMES.has(name) ||
    Boolean(SITE_IMAGE_PRIMARY_PAGE[name])
  );
}

/** Public path + query, e.g. `/about?viewImage=about-dining`. */
export function buildSiteImageLivePath(pagePath: string, name: string): string {
  const base = pagePath === "/" ? "/" : pagePath;
  const params = new URLSearchParams({ [SITE_IMAGE_VIEW_PARAM]: name });
  return `${base}?${params.toString()}`;
}

/**
 * Live preview URL for an admin card.
 * - Homepage tab: prefer `/` when the image is actually on the homepage.
 * - Other tabs: primary page for that slot.
 * - Returns null when the slot is not rendered anywhere on the live site.
 */
export function resolveSiteImageLivePath(
  name: string,
  adminGroupPagePath: string,
): string | null {
  if (
    adminGroupPagePath === "/#floating-ig" ||
    adminGroupPagePath === "/#moving-tilted-cards" ||
    adminGroupPagePath === "/#amenities-sequence" ||
    adminGroupPagePath === "/#our-voyages"
  ) {
    return buildSiteImageLivePath("/", name);
  }

  if (adminGroupPagePath === "/#burger-nav") {
    return buildSiteImageLivePath("/suites", name);
  }

  if (adminGroupPagePath === "/#dining-plates") {
    return buildSiteImageLivePath("/gastronomy", name);
  }

  /* Cruises-tab itinerary cards still render on the homepage slider. */
  if (adminGroupPagePath === "/cruises-list" && HOMEPAGE_LIVE_SLOT_NAMES.has(name)) {
    return buildSiteImageLivePath("/", name);
  }

  if (adminGroupPagePath === "/suites") {
    return buildSiteImageLivePath("/suites", name);
  }

  if (adminGroupPagePath === "/" && HOMEPAGE_LIVE_SLOT_NAMES.has(name)) {
    return buildSiteImageLivePath("/", name);
  }

  const primary = SITE_IMAGE_PRIMARY_PAGE[name];
  if (!primary) return null;

  /* Prefer the admin tab’s own page when this slot’s primary page matches it */
  if (adminGroupPagePath === primary) {
    return buildSiteImageLivePath(primary, name);
  }

  return buildSiteImageLivePath(primary, name);
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
