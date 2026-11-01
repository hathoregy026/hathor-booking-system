import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";
import { roomCollection, type LocaleRoomCollection } from "@/lib/i18n/rooms-seo";

/**
 * The Italian room collection pages: search settings and structured-data
 * words. Language, hreflang and the search switch come from the shared
 * builder. Server-only.
 */
export const ITALIAN_ROOM_COLLECTIONS: Record<RoomCollectionVariant, LocaleRoomCollection> = {
  cabins: roomCollection("it", {
    englishPath: "/luxury-cabins-Nile-Cruise",
    title: "Cabine di lusso per la crociera sul Nilo | Hathor Dahabiya",
    description:
      "Cabine di 22 m² con vista sul Nilo a bordo di Hathor Dahabiya: letto king o due singoli, proporzioni tranquille, la luce del fiume e ogni comfort curato.",
    pageLabel: "Luxury Rooms",
    name: "Cabine di lusso per la crociera sul Nilo | Hathor Dahabiya",
    crumb: "Cabine",
    image: {
      url: "/media/hathor/r2/cabins-hero.webp",
      alt: "Cabina di lusso per la crociera sul Nilo a bordo di Hathor Dahabiya",
    },
    room: {
      name: "Cabina di lusso di Hathor per la crociera sul Nilo",
      description: "Una cabina di 22 m² con vista sul Nilo per due ospiti a bordo di Hathor Dahabiya.",
      occupancy: 2,
      floorSizeSqm: 22,
    },
  }),
  suites: roomCollection("it", {
    englishPath: "/rooms",
    title: "Hathor Luxury Suite | Suite di 46 m² sul Nilo",
    description:
      "La Luxury Suite di Hathor: 46 m² sul Nilo, vista panoramica sul fiume, interni ricchi di carattere e jacuzzi privata, per un massimo di quattro ospiti.",
    pageLabel: "Luxury Suite",
    name: "Hathor Luxury Suite | Suite di 46 m² per la crociera sul Nilo",
    crumb: "Luxury Suite",
    image: {
      url: "/media/hathor/scraped/suites-hero.webp",
      alt: "La Luxury Suite di Hathor con vista panoramica sul Nilo",
    },
    room: {
      name: "Hathor Luxury Suite",
      description:
        "La Luxury Suite di Hathor è una residenza di 46 m² sul Nilo, con vista panoramica sul fiume, interni ricchi di carattere e una jacuzzi privata, pensata per quattro ospiti.",
      occupancy: 4,
      floorSizeSqm: 46,
    },
  }),
  royal: roomCollection("it", {
    englishPath: "/royal-suites",
    title: "Royal Suite per la crociera sul Nilo | Hathor Dahabiya",
    description:
      "La Royal Suite di Hathor: 56 m² con vista dal ponte principale e due bagni, la sistemazione più riservata di questa crociera di lusso in dahabiya sul Nilo.",
    pageLabel: "Royal Suite",
    name: "Royal Suite per la crociera sul Nilo | Hathor Dahabiya",
    crumb: "Royal Suite",
    image: {
      url: "/media/hathor/r2/room-royal.webp",
      alt: "Royal Suite con vista panoramica sul Nilo a bordo di Hathor Dahabiya",
    },
    room: {
      name: "Hathor Royal Suite",
      description:
        "La Royal Suite di Hathor è una residenza di 56 m² sul Nilo, con vista dal ponte principale, due bagni e la sistemazione più riservata di questa crociera di lusso in dahabiya.",
      occupancy: 4,
      floorSizeSqm: 56,
    },
  }),
};
