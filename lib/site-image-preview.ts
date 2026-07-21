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
  "home-story-craft-large",
  "home-collage-small",
  "home-collage-large",
  "home-split-courtyard",
  "cruises-hero",
  "room-suite",
  "room-royal",
  "room-luxury",
  "about-hero",
  "home-story-legacy-large",
  "gastronomy-restaurant",
  "home-collage-living",
  "home-alt-highlights",
  "wellness-hero",
  "home-cinematic-still",
]);

/**
 * Primary public page where a slot is rendered.
 * Missing entries = not shown on the live site (still editable in CMS).
 */
const SITE_IMAGE_PRIMARY_PAGE: Partial<Record<string, string>> = {
  "home-hero-poster": "/",
  "home-story-craft-large": "/",
  "home-collage-small": "/",
  "home-collage-large": "/",
  "home-split-courtyard": "/",
  "home-story-legacy-large": "/",
  "home-collage-living": "/",
  "home-alt-highlights": "/",
  "home-cinematic-still": "/",

  "cruises-hero": "/cruises",
  "room-luxury": "/luxury-cabins-Nile-Cruise",
  "room-suite": "/rooms",
  "room-royal": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  charter: "/charter",
  "charter-hero": "/charter",
  "about-hero": "/about",
  "about-dining": "/about",
  "gastronomy-hero": "/gastronomy",
  "gastronomy-restaurant": "/gastronomy",
  "wellness-hero": "/wellness",
  "wellness-fitness": "/wellness",
  "highlights-hero": "/highlights",
  "highlights-lifestyle": "/highlights",
  "landmark-obelisk": "/highlights",
  "landmark-hatshepsut": "/highlights",
  "landmark-valley-kings": "/highlights",
  "contact-hero": "/contact",
  "blog-hero": "/blogs",

  "scraped-suites-hero": "/rooms",
  "scraped-suites-luxury-rooms": "/rooms",
  "scraped-suites-luxury-suites": "/rooms",
  "scraped-suites-royal": "/rooms",
  "scraped-luxsuite-1": "/rooms",
  "scraped-luxsuite-2": "/rooms",
  "scraped-luxsuite-3": "/rooms",
  "scraped-luxsuite-4": "/rooms",
  "scraped-luxsuite-5": "/rooms",
  "scraped-luxsuite-6": "/rooms",
  "scraped-cabin-1": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-2": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-3": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-4": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-5": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-6": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-7": "/luxury-cabins-Nile-Cruise",
  "scraped-cabin-8": "/luxury-cabins-Nile-Cruise",
  "scraped-royal-1": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-2": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-3": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-4": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-5": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-6": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-7": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "scraped-royal-8": "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
};

/**
 * Optional section id when the exact image node is not found yet.
 * Only used for slots that really appear on that page — never for orphans.
 */
const SLOT_FALLBACK_SECTION: Partial<Record<string, string>> = {
  "home-hero-poster": "top",
  "home-story-craft-large": "about",
  "home-collage-small": "about",
  "home-collage-large": "about",
  "home-split-courtyard": "details",
  "home-story-legacy-large": "details",
  "cruises-hero": "services",
  "room-suite": "services",
  "room-royal": "services",
  "room-luxury": "services",
  "about-hero": "details",
  "gastronomy-restaurant": "escape",
  "home-collage-living": "gallery",
  "home-alt-highlights": "gallery",
  "wellness-hero": "gallery",
  "home-cinematic-still": "gallery",
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
