import type { ImageCategory } from "@/lib/image-categories";
import type { ShipDeckId } from "@/lib/ship-experience-shared";

/**
 * The photographs that open when a guest selects a space on the ship's deck
 * plan. Each is its own dashboard slot (Website Images → Ship deck plan), so
 * replacing one changes that space only — never another page or section, even
 * where its starting photo is a file some other slot also starts from.
 *
 * Stairs, entrances, the restroom and crew areas are named on the plan without
 * a photograph, so they have no slot.
 */
export type ShipSpaceImageSlot = {
  name: string;
  deck: ShipDeckId;
  /** The space's name as the plan shows it. */
  space: string;
  url: string;
  altText: string;
  category: ImageCategory;
};

export const SHIP_SPACE_IMAGE_SLOTS = [
  /* Lower deck */
  { name: "ship-space-reception", deck: "lower", space: "Reception", category: "general",
    url: "/media/hathor/optimized/about-hero.webp", altText: "Guests welcomed at the reception desk aboard Hathor" },
  { name: "ship-space-massage", deck: "lower", space: "Massage room", category: "spa",
    url: "/media/hathor/r2/home-split-service.webp", altText: "A guest in a robe by the window, unwinding aboard Hathor" },
  { name: "ship-space-kitchen", deck: "lower", space: "Kitchen", category: "dining",
    url: "/media/hathor/optimized/home-amenities-10.webp", altText: "The chef at work in the galley aboard Hathor" },

  /* Main deck */
  { name: "ship-space-library", deck: "main", space: "Library", category: "general",
    url: "/media/hathor/optimized/scraped-royal-6.webp", altText: "A guest reading in an armchair beside the Nile window" },
  { name: "ship-space-gym", deck: "main", space: "Gym", category: "spa",
    url: "/media/hathor/r2/wellness-fitness.webp", altText: "Treadmill, elliptical trainer and bike aboard Hathor, beside the Nile" },
  { name: "ship-space-lounge", deck: "main", space: "Lounge", category: "general",
    url: "/media/hathor/r2/about-dining.webp", altText: "The lounge aboard Hathor, sofas and bar counter beside the windows" },
  { name: "ship-space-restaurant", deck: "main", space: "Restaurant", category: "dining",
    url: "/media/hathor/optimized/home-amenities-7.webp", altText: "Guests served at breakfast in the Hathor restaurant" },
  { name: "ship-space-main-terrace", deck: "main", space: "Outdoor terrace", category: "dining",
    url: "/media/hathor/optimized/home-amenities-2.webp", altText: "Dinner on the open deck of Hathor at dusk" },

  /* Sun deck */
  { name: "ship-space-shaded-lounge", deck: "sun", space: "Shaded lounge", category: "general",
    url: "/media/hathor/optimized/home-amenities-13.webp", altText: "Guests under the woven pergola on the Hathor sun deck" },
  { name: "ship-space-bar", deck: "sun", space: "Circular bar", category: "dining",
    url: "/media/hathor/optimized/home-amenities-5.webp", altText: "Guests at the circular bar on the Hathor sun deck at sunset" },
  { name: "ship-space-pools", deck: "sun", space: "Two pools", category: "general",
    url: "/media/hathor/optimized/home-amenities-9.webp", altText: "The two pools on the Hathor sun deck at golden hour" },
  { name: "ship-space-sun-loungers", deck: "sun", space: "Sun loungers", category: "general",
    url: "/media/hathor/r2/about-hero.webp", altText: "Sun loungers and parasols on the Hathor deck at sunset" },
  { name: "ship-space-sun-terrace", deck: "sun", space: "Outdoor terrace", category: "general",
    url: "/media/hathor/optimized/home-amenities-12.webp", altText: "A table for two on the open deck of Hathor at sunset" },
] as const satisfies readonly ShipSpaceImageSlot[];

export type ShipSpaceImageName = (typeof SHIP_SPACE_IMAGE_SLOTS)[number]["name"];

export const SHIP_SPACE_IMAGE_PREFIX = "ship-space-";
export const isShipSpaceImageName = (name: string) => name.startsWith(SHIP_SPACE_IMAGE_PREFIX);
