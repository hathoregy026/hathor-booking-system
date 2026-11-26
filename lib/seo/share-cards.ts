/**
 * Page photo → branded link-preview card (1200×630 JPEG with the translucent
 * Hathor mark), built by scripts/generate-share-assets.mjs.
 *
 * Pages keep naming their own photo; buildPageMetadata swaps in the card, so
 * a link sent on WhatsApp or Telegram shows the logo and a JPEG WhatsApp can
 * render (it drops WebP previews). A photo without a card is used as is.
 */

const SHARE_DIR = "/media/hathor/share";

export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const;

const SHARE_CARD_BY_PHOTO: Readonly<Record<string, string>> = {
  /* Flat gold CMS still: never a preview on its own. */
  "/media/hathor/home-hero-poster.webp": "hathor-dahabiya-nile-cruise.jpg",
  "/media/hathor/r2/blog-hero.webp": "journal.jpg",
  "/media/hathor/r2/charter-hero.webp": "charter.jpg",
  "/media/hathor/r2/cabins-hero.webp": "cabins.jpg",
  "/media/hathor/r2/highlights-hero.webp": "highlights.jpg",
  "/media/hathor/r2/room-royal.webp": "royal-suite.jpg",
  "/media/hathor/optimized/scraped-suites-hero.webp": "suites.jpg",
  "/media/hathor/scraped/suites-hero.webp": "suites-collection.jpg",
  "/media/hathor/scraped/royal-1.webp": "room-royal-suite.jpg",
  "/media/hathor/scraped/luxsuite-1.webp": "room-luxury-suite.jpg",
  "/media/hathor/scraped/cabin-1.webp": "room-luxury-king.jpg",
  "/media/hathor/scraped/cabin-5.webp": "room-luxury-twin.jpg",
};

export type ShareCard = { url: string; width: number; height: number; type: "image/jpeg" };

/** The branded card for a page photo, or null when that photo has none. */
export function shareCardFor(photoUrl: string): ShareCard | null {
  const file = SHARE_CARD_BY_PHOTO[photoUrl.trim()];
  return file ? { url: `${SHARE_DIR}/${file}`, ...SHARE_CARD_SIZE, type: "image/jpeg" } : null;
}
