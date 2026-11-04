import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";
import { roomCollection, type LocaleRoomCollection } from "@/lib/i18n/rooms-seo";

/**
 * The Russian room collection pages: search settings and structured-data
 * words. Language, hreflang and the search switch come from the shared
 * builder. Server-only.
 */
export const RUSSIAN_ROOM_COLLECTIONS: Record<RoomCollectionVariant, LocaleRoomCollection> = {
  cabins: roomCollection("ru", {
    englishPath: "/luxury-cabins-Nile-Cruise",
    title: "Каюты для люкс-круиза по Нилу | Hathor Dahabiya",
    description:
      "Каюты площадью 22 м² с видом на Нил на борту Hathor Dahabiya: кровать king-size или две односпальные, спокойные пропорции, свет реки и продуманный комфорт.",
    pageLabel: "Luxury Rooms",
    name: "Каюты для люкс-круиза по Нилу | Hathor Dahabiya",
    crumb: "Каюты",
    image: {
      url: "/media/hathor/r2/cabins-hero.webp",
      alt: "Каюта для люкс-круиза по Нилу на борту Hathor Dahabiya",
    },
    room: {
      name: "Каюта Hathor для люкс-круиза по Нилу",
      description: "Каюта площадью 22 м² с видом на Нил для двух гостей на борту Hathor Dahabiya.",
      occupancy: 2,
      floorSizeSqm: 22,
    },
  }),
  suites: roomCollection("ru", {
    englishPath: "/rooms",
    title: "Hathor Luxury Suite | Люкс 46 м² для круиза по Нилу",
    description:
      "Hathor Luxury Suite — люкс площадью 46 м² на Ниле с панорамным видом на реку, выразительными интерьерами и собственным джакузи для четырех гостей.",
    pageLabel: "Luxury Suite",
    name: "Hathor Luxury Suite | Люкс 46 м² для круиза по Нилу",
    crumb: "Luxury Suite",
    image: {
      url: "/media/hathor/scraped/suites-hero.webp",
      alt: "Hathor Luxury Suite с панорамным видом на Нил",
    },
    room: {
      name: "Hathor Luxury Suite",
      description:
        "Hathor Luxury Suite — люкс площадью 46 м² на Ниле с панорамным видом на реку, выразительными интерьерами и собственным джакузи для четырех гостей.",
      occupancy: 4,
      floorSizeSqm: 46,
    },
  }),
  royal: roomCollection("ru", {
    englishPath: "/royal-suites",
    title: "Люкс Royal Suite для круиза по Нилу | Hathor Dahabiya",
    description:
      "Royal Suite на Hathor — люкс 56 м² на Ниле с видом с главной палубы и двумя ванными: самое уединенное размещение в этом люкс-круизе на дахабии.",
    pageLabel: "Royal Suite",
    name: "Люкс Royal Suite для круиза по Нилу | Hathor Dahabiya",
    crumb: "Royal Suite",
    image: {
      url: "/media/hathor/r2/room-royal.webp",
      alt: "Люкс Royal Suite с панорамным видом на Нил на борту Hathor Dahabiya",
    },
    room: {
      name: "Hathor Royal Suite",
      description:
        "Royal Suite на Hathor — люкс 56 м² на Ниле с видом с главной палубы и двумя ванными: самое уединенное размещение в этом люкс-круизе на дахабии.",
      occupancy: 4,
      floorSizeSqm: 56,
    },
  }),
};
