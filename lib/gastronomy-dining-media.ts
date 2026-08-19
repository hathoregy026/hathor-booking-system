/** Canonical Dining media — local optimized WebP (Vercel), not Supabase. */
const BASE = "/media/hathor/optimized";

export const DINING_PLATE_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;
export type DiningPlateNumber = (typeof DINING_PLATE_NUMBERS)[number];

export const diningPlateSlotName = (number: DiningPlateNumber | number) =>
  `dining-plate-${number}`;

export const diningPlateSrc = (number: DiningPlateNumber | number) =>
  `/media/gastronomy-dining/dining-plate-${number}.png`;

export const GASTRONOMY_DINING_MEDIA = {
  /** Live Dining intro hero (dashboard slot `dining-intro-hero`). */
  hero: `${BASE}/dining-intro-hero.webp`,
  /** Legacy coarse slot still used by Highlights / Blog / home story. */
  legacyHero: `${BASE}/gastronomy-hero.webp`,
  restaurant: `${BASE}/gastronomy-restaurant.webp`,
  experience: `${BASE}/gastronomy-restaurant.webp`,
  table: `${BASE}/gastronomy-hero.webp`,
  courses: `${BASE}/gastronomy-courses.webp`,
  wine: `${BASE}/home-story-dining.webp`,
  chef: `${BASE}/dining-gallery-right.webp`,
  service: `${BASE}/dining-gallery-left.webp`,
  celebration: `${BASE}/gastronomy-wine.webp`,
  plate1: `${BASE}/gastronomy-restaurant.webp`,
  plate2: `${BASE}/gastronomy-courses.webp`,
  plate3: `${BASE}/gastronomy-wine.webp`,
  plate4: `${BASE}/gastronomy-chef.webp`,
  plate5: `${BASE}/gastronomy-restaurant.webp`,
  plate6: `${BASE}/gastronomy-courses.webp`,
  plate7: `${BASE}/gastronomy-wine.webp`,
} as const;
