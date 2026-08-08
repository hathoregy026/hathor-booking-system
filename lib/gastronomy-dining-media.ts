/** Canonical Dining media — local optimized WebP (Vercel), not Supabase. */
const BASE = "/media/hathor/optimized";

export const GASTRONOMY_DINING_MEDIA = {
  /** Live Dining intro hero (dashboard slot `dining-intro-hero`). */
  hero: `${BASE}/dining-intro-hero.webp`,
  /** Legacy coarse slot still used by Highlights / Blog / home story. */
  legacyHero: `${BASE}/gastronomy-hero.webp`,
  restaurant: `${BASE}/gastronomy-restaurant.webp`,
  experience: `${BASE}/gastronomy-restaurant.webp`,
  table: `${BASE}/gastronomy-table.webp`,
  courses: `${BASE}/gastronomy-courses.webp`,
  wine: `${BASE}/gastronomy-wine.webp`,
  chef: `${BASE}/gastronomy-chef.webp`,
  service: `${BASE}/gastronomy-service.webp`,
  celebration: `${BASE}/gastronomy-celebration.webp`,
  plate1: `${BASE}/gastronomy-restaurant.webp`,
  plate2: `${BASE}/gastronomy-courses.webp`,
  plate3: `${BASE}/gastronomy-wine.webp`,
  plate4: `${BASE}/gastronomy-chef.webp`,
  plate5: `${BASE}/gastronomy-restaurant.webp`,
  plate6: `${BASE}/gastronomy-courses.webp`,
  plate7: `${BASE}/gastronomy-wine.webp`,
} as const;
