/**
 * The booking journey's itineraries in German: the same days, routes and
 * reading links as lib/booking-itineraries.ts. Paths open with the place, then
 * a comma (see placeFromPath in booking-copy-de.ts). The reading links still
 * open the English journal articles they were chosen for; only labels change.
 */

import {
  HATHOR_ITINERARIES,
  type ItineraryDay,
  type ItineraryLink,
  type VoyageItinerary,
} from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

const PHILAE: ItineraryLink = { label: "Philae-Tempel", href: "https://hathorcruise.com/blogs/philae-temple-aswan-attractions" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Sehenswertes in Assuan", href: "https://hathorcruise.com/blogs/top-attractions-in-aswan-egypt" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Von Assuan nach Luxor mit der Dahabiya", href: "https://hathorcruise.com/blogs/Sailing%20from%20Aswan%20to%20Luxor%20on%20a%20Dahabiya%20Nile%20Cruise" };
const KOM_OMBO: ItineraryLink = { label: "Tempel von Kom Ombo", href: "https://hathorcruise.com/blogs/kom-ombo-temple-hathor-dahabiya" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Von Luxor nach Assuan oder von Assuan nach Luxor", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-luxor-to-aswan-vs-aswan-to-luxor" };
const EAST_BANK: ItineraryLink = { label: "Karnak-Tempel und Luxor-Tempel", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const EAST_BANK_READING: ItineraryLink = { label: "Die antiken Wunder am Ostufer von Luxor", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Routenführer für eine Dahabiya-Kreuzfahrt auf dem Nil", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-itinerary" };
const COLOSSI: ItineraryLink = { label: "Memnonkolosse", href: "https://hathorcruise.com/blogs/colossi-of-memnon-luxor" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "Ägyptens große Monumente am Nil", href: "https://hathorcruise.com/blogs/egypt-greatest-landmarks-dahabiya" };
const EXPLORING: ItineraryLink = { label: "Luxor und Assuan an Bord einer Luxus-Dahabiya", href: "https://www.hathorcruise.com/blogs/exploring-luxor-aswan-luxury-dahabiya" };
const SILSILA: ItineraryLink = { label: "Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const SILSILA_READING: ItineraryLink = { label: "Verborgene Schätze am Nil: Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const HATHOR_BLOG: ItineraryLink = { label: "Das Journal der Hathor", href: "https://www.hathorcruise.com/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Langsam reisen auf dem Nil", href: "https://hathorcruise.com/blogs/slow-travel-egypt-nile-cruise" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Verborgene Winkel am Nil", href: "https://hathorcruise.com/blogs/romantic-honeymoon-nile-cruise" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Assuan, der Beginn der Reise",
    path: "Assuan, Einschiffung → Philae-Tempel → Assuan-Hochdamm → Nacht in Assuan",
    copy: ["Ankunft mit Willkommensgetränk, Einschiffung und Mittagessen an Bord. Besuch des ", PHILAE, " und des Assuan-Hochdamms. Rückkehr an Bord der Hathor zu Abendessen und Übernachtung in Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS, ASWAN_TO_LUXOR],
  },
  {
    day: 2,
    title: "Kom Ombo und Esna",
    path: "Assuan → Kom Ombo → Esna → Nacht in Esna",
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Frühstück an Bord, dann Fahrt nach Norden zum ", KOM_OMBO, ". Weiter nach Esna zu Abendessen und Übernachtung."],
    reading: [KOM_OMBO, DIRECTION_COMPARE],
  },
  {
    day: 3,
    title: "Esna und das Ostufer von Luxor",
    path: "Esna, Tempel → Fahrt Esna → Luxor → Karnak-Tempel → Luxor-Tempel → Nacht in Luxor",
    copy: ["Frühstück und Besuch des Esna-Tempels. Fahrt nach Luxor mit Mittagessen an Bord, dann Besuch des Ostufers mit ", EAST_BANK, ". Abendessen und Übernachtung in Luxor."],
    reading: [EAST_BANK_READING, ITINERARY_GUIDE],
  },
  {
    day: 4,
    title: "Abschied in Luxor",
    path: "Luxor, Ausschiffung → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse",
    copy: ["Frühstück und Check-out. Besuch des Westufers von Luxor mit dem Tal der Könige, dem Hatschepsut-Tempel und den ", COLOSSI, "."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
];

const FOUR_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Luxor und das Ostufer",
    path: "Luxor, Einschiffung → Karnak-Tempel → Luxor-Tempel → Nacht in Luxor",
    copy: ["Willkommensgetränk und Check-in, gefolgt vom Mittagessen an Bord. Besuch des Ostufers mit ", EAST_BANK, ". Rückkehr an Bord der Hathor zu Abendessen und Übernachtung in Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Das Westufer von Luxor und die Fahrt nach Esna",
    path: "Luxor, Westufer → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse → Fahrt Luxor → Esna → Nacht in Esna",
    copy: ["Frühstück, dann Besuch des Westufers: Tal der Könige, Hatschepsut-Tempel und ", COLOSSI, ". Rückkehr zum Mittagessen, während die Hathor nach Esna fährt. Abendessen und Übernachtung in Esna."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 3,
    title: "Der Tempel von Edfu und die Insel El Ramady",
    path: "Esna → Edfu → Horus-Tempel → Insel El Ramady → Nacht in El Ramady",
    copy: ["Frühstück und Fahrt nach Süden bis Edfu. Besuch des Horus-Tempels, Rückkehr zum Mittagessen, dann weiter zur Insel El Ramady zu Abendessen und Übernachtung."],
    reading: [ITINERARY_GUIDE, HATHOR_BLOG],
  },
  {
    day: 4,
    title: "Gebel el-Silsila, Kom Ombo und die Fahrt nach Assuan",
    path: "El Ramady → Gebel el-Silsila → Kom Ombo → Assuan → Nacht in Assuan",
    copy: ["Besuch der antiken Steinbrüche und Heiligtümer von ", SILSILA, ", dann weiter zum ", KOM_OMBO, ". Fahrt nach Assuan mit Mittagessen an Bord. Abendessen und Übernachtung in Assuan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Abschied in Assuan",
    path: "Abu Simbel (optional) → Frühstück und Check-out → Philae-Tempel → Assuan-Hochdamm → Ende in Assuan",
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Frühstück und Check-out, dann Besuch des ", PHILAE, " und des Assuan-Hochdamms."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
];

const SEVEN_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Einschiffung in Luxor",
    path: "Luxor, Einschiffung → Karnak-Tempel → Luxor-Tempel → Nacht in Luxor",
    copy: ["Willkommensgetränk und Check-in, gefolgt vom Mittagessen. Besuch des Ostufers von Luxor mit ", EAST_BANK, ". Abendessen und Übernachtung in Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Von Luxor nach Esna",
    path: "Luxor → Fahrt auf dem Nil → Esna → Nacht in Esna",
    copy: ["Frühstück und ein entspannter Tag auf dem Fluss Richtung Esna, mit Mittagessen und traditionellem Tee an Deck. Abendessen bei Kerzenlicht und Übernachtung in Esna."],
    reading: [ITINERARY_GUIDE, SLOW_TRAVEL],
  },
  {
    day: 3,
    title: "Von Esna über Edfu nach Ramadi",
    path: "Esna → Schleuse von Esna → Edfu → Horus-Tempel → Insel Ramadi → Nacht in Ramadi",
    copy: ["Durchfahrt der Schleuse von Esna und Fahrt nach Edfu. Besuch des Horus-Tempels, dann weiter zur Insel Ramadi zu einem traditionellen Abendessen auf der Insel und zur Übernachtung."],
    reading: [ITINERARY_GUIDE, HIDDEN_SPOTS],
  },
  {
    day: 4,
    title: "Von Gebel el-Silsila nach Assuan",
    path: "Ramadi → Gebel el-Silsila → Kom Ombo → Assuan → Nacht in Assuan",
    copy: ["Besuch von ", SILSILA, ", weiter zum ", KOM_OMBO, ", dann Fahrt nach Assuan mit Mittagessen an Bord. Abendessen und Übernachtung in Assuan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Die Wunder von Assuan",
    path: "Abu Simbel (optional) → Philae-Tempel → Assuan-Hochdamm → Nacht in Assuan",
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Besuch des ", PHILAE, " und des Assuan-Hochdamms. Rückkehr an Bord der Hathor zu Mittagessen, Abendessen und Übernachtung in Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
  {
    day: 6,
    title: "Zurück nach Esna",
    path: "Assuan → Fahrt nach Norden auf dem Nil → Esna → Nacht in Esna",
    copy: ["Frühstück und ein ganzer entspannter Tag auf dem Fluss nach Norden, von Assuan nach Esna, mit Mittag- und Abendessen an Bord. Übernachtung in Esna."],
    reading: [SLOW_TRAVEL, DIRECTION_COMPARE],
  },
  {
    day: 7,
    title: "Von Esna zu den zeitlosen Tempeln von Luxor",
    path: "Esna, Tempel → Fahrt Esna → Luxor → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse → Nacht in Luxor",
    copy: ["Besuch des Esna-Tempels, dann Rückfahrt nach Luxor mit Mittagessen an Bord. Besuch des Westufers: Tal der Könige, Hatschepsut-Tempel und ", COLOSSI, ". Abendessen und Übernachtung in Luxor."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 8,
    title: "Abschied vom Nil",
    path: "Luxor, Frühstück → Check-out und Ausschiffung → Ende in Luxor",
    copy: ["Letztes Frühstück an Bord und Check-out in Luxor."],
    reading: [EXPLORING, ITINERARY_GUIDE],
  },
];

/** `departureDay` is the weekday alone; the copy says "jeden Mittwoch" where a sentence needs it. */
export const HATHOR_ITINERARIES_DE: Record<StayDurationValue, VoyageItinerary> = {
  "3-nights-aswan-luxor": {
    ...HATHOR_ITINERARIES["3-nights-aswan-luxor"],
    title: "3 Nächte / 4 Tage",
    route: "Assuan → Luxor",
    departureDay: "Mittwoch",
    days_: THREE_NIGHT,
  },
  "4-nights-luxor-aswan": {
    ...HATHOR_ITINERARIES["4-nights-luxor-aswan"],
    title: "4 Nächte / 5 Tage",
    route: "Luxor → Assuan",
    departureDay: "Samstag",
    days_: FOUR_NIGHT,
  },
  "7-nights-luxor-aswan-luxor": {
    ...HATHOR_ITINERARIES["7-nights-luxor-aswan-luxor"],
    title: "7 Nächte / 8 Tage",
    route: "Luxor → Assuan → Luxor",
    departureDay: "Samstag",
    days_: SEVEN_NIGHT,
  },
};
