import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";
import { roomCollection, type LocaleRoomCollection } from "@/lib/i18n/rooms-seo";

/**
 * The German room collection pages: search settings and structured-data
 * words. Language, hreflang and the search switch come from the shared
 * builder. Server-only.
 */
export const GERMAN_ROOM_COLLECTIONS: Record<RoomCollectionVariant, LocaleRoomCollection> = {
  cabins: roomCollection("de", {
    englishPath: "/luxury-cabins-Nile-Cruise",
    title: "Luxuskabinen für die Nilkreuzfahrt | Hathor Dahabiya",
    description:
      "Kabinen mit 22 m² und Nilblick an Bord der Hathor Dahabiya: Kingsize-Bett oder zwei Einzelbetten, ruhige Proportionen, das Licht des Flusses und jeder Komfort.",
    pageLabel: "Luxury Rooms",
    name: "Luxuskabinen für die Nilkreuzfahrt | Hathor Dahabiya",
    crumb: "Kabinen",
    image: {
      url: "/media/hathor/r2/cabins-hero.webp",
      alt: "Luxuskabine für die Nilkreuzfahrt an Bord der Hathor Dahabiya",
    },
    room: {
      name: "Luxuskabine der Hathor für die Nilkreuzfahrt",
      description: "Eine Kabine mit 22 m² und Nilblick für zwei Gäste an Bord der Hathor Dahabiya.",
      occupancy: 2,
      floorSizeSqm: 22,
    },
  }),
  suites: roomCollection("de", {
    englishPath: "/rooms",
    title: "Hathor Luxury Suite | Suite mit 46 m² auf dem Nil",
    description:
      "Die Luxury Suite der Hathor: 46 m² auf dem Nil, Panoramablick auf den Fluss, charaktervolle Interieurs und privater Jacuzzi, für bis zu vier Gäste.",
    pageLabel: "Luxury Suite",
    name: "Hathor Luxury Suite | Suite mit 46 m² für die Nilkreuzfahrt",
    crumb: "Luxury Suite",
    image: {
      url: "/media/hathor/scraped/suites-hero.webp",
      alt: "Die Luxury Suite der Hathor mit Panoramablick auf den Nil",
    },
    room: {
      name: "Hathor Luxury Suite",
      description:
        "Die Luxury Suite der Hathor ist eine Residenz mit 46 m² auf dem Nil, mit Panoramablick auf den Fluss, charaktervollen Interieurs und privatem Jacuzzi für vier Gäste.",
      occupancy: 4,
      floorSizeSqm: 46,
    },
  }),
  royal: roomCollection("de", {
    englishPath: "/royal-suites",
    title: "Royal Suite für die Nilkreuzfahrt | Hathor Dahabiya",
    description:
      "Die Royal Suite der Hathor: 56 m² mit Blick vom Hauptdeck und zwei Badezimmern, die privateste Unterkunft dieser Luxus-Dahabiya-Kreuzfahrt auf dem Nil.",
    pageLabel: "Royal Suite",
    name: "Royal Suite für die Nilkreuzfahrt | Hathor Dahabiya",
    crumb: "Royal Suite",
    image: {
      url: "/media/hathor/r2/room-royal.webp",
      alt: "Royal Suite mit Panoramablick auf den Nil an Bord der Hathor Dahabiya",
    },
    room: {
      name: "Hathor Royal Suite",
      description:
        "Die Royal Suite der Hathor ist eine Residenz mit 56 m² auf dem Nil, mit Blick vom Hauptdeck, zwei Badezimmern und der privatesten Unterkunft dieser Luxus-Dahabiya-Kreuzfahrt.",
      occupancy: 4,
      floorSizeSqm: 56,
    },
  }),
};
