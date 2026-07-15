/**
 * Stable preview anchors for admin “View on Live Site”.
 * Public pages mark images with id={siteImageAnchorId(name)}.
 */

export const SITE_IMAGE_ANCHOR_PREFIX = "site-image-";

export function siteImageAnchorId(name: string): string {
  return `${SITE_IMAGE_ANCHOR_PREFIX}${name}`;
}

/**
 * When a slot isn’t rendered with its own anchor (or isn’t on the live page),
 * scroll to this section instead so the link still lands near the right place.
 */
const SLOT_FALLBACK_SECTION: Partial<Record<string, string>> = {
  "home-hero-poster": "top",
  "home-post-hero-media": "about",
  "home-story-craft-large": "about",
  "home-story-craft-small": "about",
  "home-story-transform": "about",
  "home-story-legacy-large": "details",
  "home-story-legacy-small": "details",
  "home-cinematic-video": "escape",
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
};

export function getSiteImageFallbackSectionId(name: string): string | undefined {
  return SLOT_FALLBACK_SECTION[name];
}

/** Public path + hash, e.g. `/about#site-image-about-dining`. */
export function buildSiteImageLivePath(pagePath: string, name: string): string {
  const base = pagePath === "/" ? "/" : pagePath;
  return `${base}#${siteImageAnchorId(name)}`;
}
