export type BookingRoomVisuals = {
  cover: string;
  gallery: readonly string[];
  sizeSqm: number;
  childrenAllowed: boolean;
};

const CABIN_KING_GALLERY = [
  "/media/hathor/scraped/cabin-1.webp",
  "/media/hathor/scraped/cabin-3.webp",
  "/media/hathor/scraped/cabin-7.webp",
  "/media/hathor/scraped/cabin-8.webp",
] as const;

const CABIN_TWIN_GALLERY = [
  "/media/hathor/scraped/cabin-5.webp",
  "/media/hathor/scraped/cabin-6.webp",
  "/media/hathor/scraped/cabin-4.webp",
  "/media/hathor/scraped/cabin-8.webp",
] as const;

const SUITE_GALLERY = [
  "/media/hathor/scraped/luxsuite-1.webp",
  "/media/hathor/scraped/luxsuite-2.webp",
  "/media/hathor/scraped/luxsuite-3.webp",
  "/media/hathor/scraped/luxsuite-4.webp",
  "/media/hathor/scraped/luxsuite-5.webp",
  "/media/hathor/scraped/luxsuite-6.webp",
] as const;

const ROYAL_GALLERY = [
  "/media/hathor/scraped/royal-1.webp",
  "/media/hathor/scraped/royal-2.webp",
  "/media/hathor/scraped/royal-3.webp",
  "/media/hathor/scraped/royal-4.webp",
  "/media/hathor/scraped/royal-5.webp",
  "/media/hathor/scraped/royal-6.webp",
] as const;

export function getBookingRoomVisuals(
  roomName: string,
  roomType?: string | null,
): BookingRoomVisuals {
  const identity = `${roomName} ${roomType ?? ""}`.toLowerCase();

  if (identity.includes("royal") || identity.includes("presidential")) {
    return { cover: ROYAL_GALLERY[0], gallery: ROYAL_GALLERY, sizeSqm: 56, childrenAllowed: true };
  }

  if (identity.includes("suite") || identity.includes("deluxe")) {
    return { cover: SUITE_GALLERY[0], gallery: SUITE_GALLERY, sizeSqm: 46, childrenAllowed: true };
  }

  if (identity.includes("twin")) {
    return { cover: CABIN_TWIN_GALLERY[0], gallery: CABIN_TWIN_GALLERY, sizeSqm: 22, childrenAllowed: false };
  }

  return { cover: CABIN_KING_GALLERY[0], gallery: CABIN_KING_GALLERY, sizeSqm: 22, childrenAllowed: false };
}

export const HATHOR_BOOKING_INCLUSIONS = [
  "Round-trip transfers from Aswan or Luxor airports",
  "VAT and service charges",
  "Welcome drink upon arrival",
  "Soft all-inclusive meals and soft drinks",
  "Sightseeing entrance tickets according to the itinerary",
  "Professional Egyptologist guide",
  "Laundry service and daily minibar refill",
  "Wi-Fi, room service, coffee and tea facilities",
] as const;
