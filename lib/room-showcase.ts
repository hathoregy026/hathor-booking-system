import { HATHOR_AMENITIES } from "@/lib/hathor-catalog";

export type RoomShowcase = {
  slug: string;
  name: string;
  eyebrow: string;
  sizeSqm: number;
  capacity: number;
  childrenAllowed: boolean;
  description: string;
  images: readonly string[];
  amenities: readonly string[];
};

export const ROOM_SHOWCASES: readonly RoomShowcase[] = [
  {
    slug: "luxury-king-room",
    name: "Luxury King Bed",
    eyebrow: "A quiet Nile-facing retreat",
    sizeSqm: 22,
    capacity: 2,
    childrenAllowed: false,
    description:
      "A generous king bed, warm Egyptian detail and a wide river view shape a calm private cabin for two.",
    images: [
      "/media/hathor/scraped/cabin-1.webp",
      "/media/hathor/scraped/cabin-3.webp",
      "/media/hathor/scraped/cabin-7.webp",
      "/media/hathor/scraped/cabin-8.webp",
      "/media/hathor/scraped/cabin-2.webp",
    ],
    amenities: HATHOR_AMENITIES.luxuryRooms,
  },
  {
    slug: "luxury-twin-room",
    name: "Luxury Twin Bed",
    eyebrow: "Refined comfort, shared beautifully",
    sizeSqm: 22,
    capacity: 2,
    childrenAllowed: false,
    description:
      "Two individual beds and the same attentive cabin comforts create an elegant base for travelling companions.",
    images: [
      "/media/hathor/scraped/cabin-5.webp",
      "/media/hathor/scraped/cabin-6.webp",
      "/media/hathor/scraped/cabin-4.webp",
      "/media/hathor/scraped/cabin-8.webp",
      "/media/hathor/scraped/cabin-1.webp",
    ],
    amenities: HATHOR_AMENITIES.luxuryRooms,
  },
  {
    slug: "luxury-suite",
    name: "Luxury Suite",
    eyebrow: "More room for the journey",
    sizeSqm: 46,
    capacity: 4,
    childrenAllowed: true,
    description:
      "A spacious lower-deck retreat with panoramic Nile views, expressive interiors and a private Jacuzzi.",
    images: [
      "/media/hathor/scraped/luxsuite-1.webp",
      "/media/hathor/scraped/luxsuite-2.webp",
      "/media/hathor/scraped/luxsuite-3.webp",
      "/media/hathor/scraped/luxsuite-4.webp",
      "/media/hathor/scraped/luxsuite-5.webp",
      "/media/hathor/scraped/luxsuite-6.webp",
    ],
    amenities: HATHOR_AMENITIES.luxurySuites,
  },
  {
    slug: "royal-suite",
    name: "Luxury Royal Suite",
    eyebrow: "The crown of Hathor",
    sizeSqm: 56,
    capacity: 4,
    childrenAllowed: true,
    description:
      "Hathor's most expansive residence pairs prime Main Deck views with signature furnishings and two bathrooms.",
    images: [
      "/media/hathor/scraped/royal-1.webp",
      "/media/hathor/scraped/royal-2.webp",
      "/media/hathor/scraped/royal-3.webp",
      "/media/hathor/scraped/royal-4.webp",
      "/media/hathor/scraped/royal-5.webp",
      "/media/hathor/scraped/royal-6.webp",
    ],
    amenities: HATHOR_AMENITIES.luxuryRoyalSuites,
  },
] as const;

export function findRoomShowcase(slug: string) {
  return ROOM_SHOWCASES.find((room) => room.slug === slug);
}
