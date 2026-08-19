/**
 * Map photographs inside /suites-normal to dashboard Site Image slots.
 * Filename only — works for default media paths and later CMS URLs via data-hathor-slot.
 */
const FILE_TO_SLOT: Record<string, string> = {
  "suites-hero": "scraped-suites-hero",
  "suites-luxury-rooms": "scraped-suites-luxury-rooms",
  "suites-luxury-suites": "scraped-suites-luxury-suites",
  "suites-royal": "scraped-suites-royal",
  "luxsuite-1": "scraped-luxsuite-1",
  "luxsuite-2": "scraped-luxsuite-2",
  "luxsuite-3": "scraped-luxsuite-3",
  "luxsuite-4": "scraped-luxsuite-4",
  "luxsuite-5": "scraped-luxsuite-5",
  "luxsuite-6": "scraped-luxsuite-6",
  "royal-1": "scraped-royal-1",
  "royal-2": "scraped-royal-2",
  "royal-3": "scraped-royal-3",
  "royal-4": "scraped-royal-4",
  "royal-5": "scraped-royal-5",
  "royal-6": "scraped-royal-6",
  "royal-7": "scraped-royal-7",
  "royal-8": "scraped-royal-8",
  "cabin-1": "scraped-cabin-1",
  "cabin-2": "scraped-cabin-2",
  "cabin-3": "scraped-cabin-3",
  "cabin-4": "scraped-cabin-4",
  "cabin-5": "scraped-cabin-5",
  "cabin-6": "scraped-cabin-6",
  "cabin-7": "scraped-cabin-7",
  "cabin-8": "scraped-cabin-8",
  "room-luxury": "room-luxury",
  "room-royal": "room-royal",
  "room-suite": "room-suite",
  "home-call-to-action": "suites-nile-still",
};

export function slotNameFromSuitesImageUrl(url: string): string | null {
  if (!url) return null;
  const file = url.split("?")[0]?.split("/").pop() ?? "";
  const base = file.replace(/\.(?:webp|jpe?g|png|avif)$/i, "");
  return FILE_TO_SLOT[base] ?? null;
}
