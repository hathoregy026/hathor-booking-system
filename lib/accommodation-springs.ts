/** Dashboard image slots consumed by accommodation Springs Design iframes. */

export const ACCOMMODATION_PAGE_IDS = [
  "luxury-rooms",
  "luxury-suites",
  "royal-suites",
] as const;

export type AccommodationPageId = (typeof ACCOMMODATION_PAGE_IDS)[number];

export const ACCOMMODATION_SLOTS_BY_PAGE: Record<
  AccommodationPageId,
  readonly string[]
> = {
  "luxury-rooms": [
    "room-luxury",
    "scraped-cabin-1",
    "scraped-cabin-2",
    "scraped-cabin-3",
    "scraped-cabin-4",
    "scraped-cabin-5",
    "scraped-cabin-6",
    "scraped-cabin-7",
    "scraped-cabin-8",
  ],
  "luxury-suites": [
    "room-suite",
    "scraped-luxsuite-1",
    "scraped-luxsuite-2",
    "scraped-luxsuite-3",
    "scraped-luxsuite-4",
    "scraped-luxsuite-5",
    "scraped-luxsuite-6",
  ],
  "royal-suites": [
    "room-royal",
    "scraped-royal-1",
    "scraped-royal-2",
    "scraped-royal-3",
    "scraped-royal-4",
    "scraped-royal-5",
    "scraped-royal-6",
    "scraped-royal-7",
    "scraped-royal-8",
  ],
};

export function isAccommodationPageId(
  value: string,
): value is AccommodationPageId {
  return (ACCOMMODATION_PAGE_IDS as readonly string[]).includes(value);
}
