/**
 * Admin “View on Live Site” preview targets.
 *
 * Prefer `?viewImage=<slot>` over URL hashes. Hash jumps fight Lenis/GSAP on
 * the homepage and can crash ScrollTrigger during boot.
 */

export const SITE_IMAGE_ANCHOR_PREFIX = "site-image-";
export const SITE_IMAGE_VIEW_PARAM = "viewImage";

export function siteImageAnchorId(name: string): string {
  return `${SITE_IMAGE_ANCHOR_PREFIX}${name}`;
}

/**
 * When a slot isn’t rendered with its own anchor, scroll to this section so
 * the link still lands near the right place on the live page.
 */
const SLOT_FALLBACK_SECTION: Partial<Record<string, string>> = {
  "home-story-craft-large": "about",
  "home-story-craft-small": "about",
  "home-story-transform": "about",
  "home-story-legacy-large": "details",
  "home-story-legacy-small": "details",
  "home-cinematic-video": "gallery",
  "home-cinematic-still": "gallery",
  "home-split-courtyard": "details",
  "home-split-service": "services",
  "home-split-interiors": "services",
  "home-split-venue": "details",
  "home-collage-bg": "gallery",
  "home-collage-large": "about",
  "home-collage-small": "about",
  "home-collage-living": "gallery",
  "home-residences-kitchen": "escape",
  "home-residences-lounge": "escape",
  "home-residences-rooftop": "escape",
  "home-sketch-boat": "escape",
  "home-alt-dining": "escape",
  "home-alt-wellness": "escape",
  "home-alt-highlights": "gallery",
  "home-testimonials-bg": "reviews",
  charter: "site-image-charter",
  "highlights-lifestyle": "site-image-highlights-lifestyle",
};

export function getSiteImageFallbackSectionId(name: string): string | undefined {
  return SLOT_FALLBACK_SECTION[name];
}

/** Public path + query, e.g. `/about?viewImage=about-dining`. */
export function buildSiteImageLivePath(pagePath: string, name: string): string {
  const base = pagePath === "/" ? "/" : pagePath;
  const params = new URLSearchParams({ [SITE_IMAGE_VIEW_PARAM]: name });
  return `${base}?${params.toString()}`;
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
