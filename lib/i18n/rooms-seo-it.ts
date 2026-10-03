import type { Metadata } from "next";
import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * The Italian room collection pages: search settings and structured-data
 * words. Language, hreflang and the search switch come from the shared
 * builder. Server-only.
 */
type ItalianRoomCollection = {
  /** The English address: same page switch in the dashboard, same rooms. */
  englishPath: string;
  path: string;
  pageLabel: string;
  metadata: Metadata;
  name: string;
  crumb: string;
  image: string;
  room: { name: string; description: string; occupancy: number; floorSizeSqm: number };
};

const collection = (input: {
  englishPath: string;
  title: string;
  description: string;
  pageLabel: string;
  name: string;
  crumb: string;
  image: { url: string; alt: string };
  room: ItalianRoomCollection["room"];
}): ItalianRoomCollection => {
  const path = `/it${input.englishPath}`;
  return {
    englishPath: input.englishPath,
    path,
    pageLabel: input.pageLabel,
    name: input.name,
    crumb: input.crumb,
    image: input.image.url,
    room: input.room,
    metadata: buildPageMetadata({
      title: input.title,
      description: input.description,
      path,
      image: { ...input.image, width: 1920, height: 1280 },
    }),
  };
};

export const ITALIAN_ROOM_COLLECTIONS: Record<RoomCollectionVariant, ItalianRoomCollection> = {
  cabins: collection({
    englishPath: "/luxury-cabins-Nile-Cruise",
    title: "Cabine di lusso per la crociera sul Nilo | Hathor Dahabiya",
    description:
      "Cabine di 22 metri quadrati con vista sul Nilo a bordo di Hathor Dahabiya: letto king o due letti singoli, proporzioni tranquille, la luce del fiume e ogni comfort curato.",
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
  suites: collection({
    englishPath: "/rooms",
    title: "Hathor Luxury Suite | Suite di 46 m² sul Nilo",
    description:
      "La Luxury Suite di Hathor è una residenza di 46 m² sul Nilo, con vista panoramica sul fiume, interni ricchi di carattere e una jacuzzi privata, pensata per quattro ospiti.",
    pageLabel: "Luxury Suites",
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
  royal: collection({
    englishPath: "/royal-suites",
    title: "Royal Suite per la crociera sul Nilo | Hathor Dahabiya",
    description:
      "La Royal Suite di Hathor è una residenza di 56 m² sul Nilo, con vista dal ponte principale, due bagni e la sistemazione più riservata di questa crociera di lusso in dahabiya.",
    pageLabel: "Royal Suites",
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
