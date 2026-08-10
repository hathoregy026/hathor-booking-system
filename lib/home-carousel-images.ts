import type { SiteImageName } from "@/lib/site-image-slots";

/**
 * Homepage itineraries carousel — dedicated CMS slot per cruise room card.
 * Do not collapse by room type (that made King/Twin/etc. share one dashboard image).
 */
export const HOME_CAROUSEL_IMAGE_BY_ROOM = {
  "SUITE-3N": "home-carousel-suite-3n",
  "ROYAL-3N": "home-carousel-royal-3n",
  "KING-4N": "home-carousel-king-4n",
  "TWIN-4N": "home-carousel-twin-4n",
  "SUITE-4N": "home-carousel-suite-4n",
  "ROYAL-4N": "home-carousel-royal-4n",
  "KING-7N": "home-carousel-king-7n",
  "TWIN-7N": "home-carousel-twin-7n",
  "SUITE-7N": "home-carousel-suite-7n",
  "ROYAL-7N": "home-carousel-royal-7n",
} as const satisfies Record<string, SiteImageName>;

export type HomeCarouselRoomNumber = keyof typeof HOME_CAROUSEL_IMAGE_BY_ROOM;

/** Soft-migrate: inherit shared room-* CMS uploads until each carousel slot is saved. */
export const HOME_CAROUSEL_LEGACY_FALLBACK: Readonly<
  Record<(typeof HOME_CAROUSEL_IMAGE_BY_ROOM)[HomeCarouselRoomNumber], string>
> = {
  "home-carousel-suite-3n": "room-suite",
  "home-carousel-royal-3n": "room-royal",
  "home-carousel-king-4n": "room-luxury",
  "home-carousel-twin-4n": "room-luxury",
  "home-carousel-suite-4n": "room-suite",
  "home-carousel-royal-4n": "room-royal",
  "home-carousel-king-7n": "room-luxury",
  "home-carousel-twin-7n": "room-luxury",
  "home-carousel-suite-7n": "room-suite",
  "home-carousel-royal-7n": "room-royal",
};

export const HOME_CAROUSEL_ADMIN_CARDS: ReadonlyArray<{
  name: (typeof HOME_CAROUSEL_IMAGE_BY_ROOM)[HomeCarouselRoomNumber];
  label: string;
}> = [
  {
    name: "home-carousel-suite-3n",
    label: "Homepage itinerary — 3N Aswan/Luxor · Suite",
  },
  {
    name: "home-carousel-royal-3n",
    label: "Homepage itinerary — 3N Aswan/Luxor · Royal Suite",
  },
  {
    name: "home-carousel-king-4n",
    label: "Homepage itinerary — 4N Luxor/Aswan · King Cabin",
  },
  {
    name: "home-carousel-twin-4n",
    label: "Homepage itinerary — 4N Luxor/Aswan · Twin Cabin",
  },
  {
    name: "home-carousel-suite-4n",
    label: "Homepage itinerary — 4N Luxor/Aswan · Suite",
  },
  {
    name: "home-carousel-royal-4n",
    label: "Homepage itinerary — 4N Luxor/Aswan · Royal Suite",
  },
  {
    name: "home-carousel-king-7n",
    label: "Homepage itinerary — 7N Round trip · King Cabin",
  },
  {
    name: "home-carousel-twin-7n",
    label: "Homepage itinerary — 7N Round trip · Twin Cabin",
  },
  {
    name: "home-carousel-suite-7n",
    label: "Homepage itinerary — 7N Round trip · Suite",
  },
  {
    name: "home-carousel-royal-7n",
    label: "Homepage itinerary — 7N Round trip · Royal Suite",
  },
];

export function homeCarouselImageName(roomNumber: string): SiteImageName {
  const mapped =
    HOME_CAROUSEL_IMAGE_BY_ROOM[
      roomNumber as HomeCarouselRoomNumber
    ];
  if (mapped) return mapped;
  return "home-carousel-suite-3n";
}
