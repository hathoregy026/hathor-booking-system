/**
 * The booking journey's itineraries in German: the same days, routes and
 * reading links as lib/booking-itineraries.ts. Paths open with the place; a
 * detail after it follows a comma (see placeFromPath in booking-copy-de.ts).
 * The reading links open the German journal articles, the same ones the English
 * links reach through lib/seo/legacy-redirects.ts. ItineraryPanel renders each
 * href as it stands, so they carry /de themselves. DIRECTION_COMPARE and
 * ITINERARY_GUIDE have no German article, so they open the German voyages page.
 */

import {
  HATHOR_ITINERARIES,
  type ItineraryDay,
  type ItineraryLink,
  type VoyageItinerary,
} from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

const PHILAE: ItineraryLink = { label: "Philae-Tempel", href: "/de/blogs/discovering-the-secrets-of-philae-temple" };
/** The same link inside a sentence, where German grammar changes the ending. */
const PHILAE_GENITIVE: ItineraryLink = { ...PHILAE, label: "Philae-Tempels" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Sehenswertes in Assuan", href: "/de/blogs/golden-gems-of-aswan" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Von Assuan nach Luxor mit der Dahabiya", href: "/de/blogs/sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise" };
const KOM_OMBO: ItineraryLink = { label: "Tempel von Kom Ombo", href: "/de/blogs/kom-ombo-temple" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Die Reisen in beide Richtungen vergleichen", href: "/de/voyages" };
const EAST_BANK: ItineraryLink = { label: "Karnak-Tempel und Luxor-Tempel", href: "/de/blogs/luxors-sacred-east-bank" };
const EAST_BANK_READING: ItineraryLink = { label: "Die antiken Wunder am Ostufer von Luxor", href: "/de/blogs/luxors-sacred-east-bank" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Die Routen unserer Nilreisen entdecken", href: "/de/voyages" };
const COLOSSI: ItineraryLink = { label: "Memnonkolosse", href: "/de/blogs/colossi-of-memnon" };
const COLOSSI_DATIVE: ItineraryLink = { ...COLOSSI, label: "Memnonkolossen" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "Ägyptens große Monumente am Nil", href: "/de/blogs/best-places-to-visit-along-the-nile-with-a-dahabiya-cruise" };
const EXPLORING: ItineraryLink = { label: "Luxor und Assuan an Bord einer Luxus-Dahabiya", href: "/de/blogs/exploring-luxor-and-aswan-on-a-luxury-dahabiya" };
const SILSILA: ItineraryLink = { label: "Gebel el-Silsila", href: "/de/blogs/niles-hidden-gems-by-dahabiya" };
const SILSILA_READING: ItineraryLink = { label: "Verborgene Schätze am Nil: Gebel el-Silsila", href: "/de/blogs/niles-hidden-gems-by-dahabiya" };
const HATHOR_BLOG: ItineraryLink = { label: "Das Journal der Hathor", href: "/de/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Langsam reisen auf dem Nil", href: "/de/blogs/why-travelers-love-slow-travel-on-the-nile" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Verborgene Winkel am Nil", href: "/de/blogs/5-quiet-nile-spots-for-stunning-honeymoon-captures" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Assuan, der Beginn Ihrer Reise",
    path: "Assuan, Einschiffung → Philae-Tempel → Assuan-Hochdamm → Nacht in Assuan",
    copy: ["Ankunft mit Willkommensgetränk, Einschiffung und Mittagessen an Bord. Besuch des ", PHILAE_GENITIVE, " und des Assuan-Hochdamms. Rückkehr an Bord der Hathor zu Abendessen und Übernachtung in Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS, ASWAN_TO_LUXOR],
  },
  {
    day: 2,
    title: "Kom Ombo und Esna entdecken",
    path: "Assuan → Kom Ombo → Esna → Nacht in Esna",
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Frühstück an Bord, dann Fahrt nach Norden zum ", KOM_OMBO, ". Weiter nach Esna zu Abendessen und Übernachtung."],
    reading: [KOM_OMBO, DIRECTION_COMPARE],
  },
  {
    day: 3,
    title: "Esna und das Ostufer von Luxor",
    path: "Esna-Tempel → Fahrt Esna → Luxor → Karnak-Tempel → Luxor-Tempel → Nacht in Luxor",
    copy: ["Frühstück und Besuch des Esna-Tempels. Fahrt nach Luxor mit Mittagessen an Bord, dann Besuch des Ostufers mit ", EAST_BANK, ". Abendessen und Übernachtung in Luxor."],
    reading: [EAST_BANK_READING, ITINERARY_GUIDE],
  },
  {
    day: 4,
    title: "Abschied in Luxor",
    path: "Luxor, Ausschiffung → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse",
    copy: ["Frühstück und Check-out. Besuch des Westufers von Luxor mit dem Tal der Könige, dem Hatschepsut-Tempel und den ", COLOSSI_DATIVE, "."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
];

const FOUR_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Willkommen in Luxor und am Ostufer",
    path: "Luxor, Einschiffung → Karnak-Tempel → Luxor-Tempel → Nacht in Luxor",
    copy: ["Willkommensgetränk und Check-in, gefolgt vom Mittagessen an Bord. Besuch des Ostufers mit ", EAST_BANK, ". Rückkehr an Bord der Hathor zu Abendessen und Übernachtung in Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Das Westufer von Luxor und die Fahrt nach Esna",
    path: "Westufer von Luxor → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse → Fahrt Luxor → Esna → Nacht in Esna",
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
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Frühstück und Check-out, dann Besuch des ", PHILAE_GENITIVE, " und des Assuan-Hochdamms."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
];

const SEVEN_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Willkommen an Bord in Luxor",
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
    title: "Von Esna über Edfu nach El Ramady",
    path: "Esna → Schleuse von Esna → Edfu → Horus-Tempel → Insel El Ramady → Nacht in El Ramady",
    copy: ["Durchfahrt der Schleuse von Esna und Fahrt nach Edfu. Besuch des Horus-Tempels, dann weiter zur Insel El Ramady zu einem traditionellen Abendessen auf der Insel und zur Übernachtung."],
    reading: [ITINERARY_GUIDE, HIDDEN_SPOTS],
  },
  {
    day: 4,
    title: "Von Gebel el-Silsila nach Assuan",
    path: "El Ramady → Gebel el-Silsila → Kom Ombo → Assuan → Nacht in Assuan",
    copy: ["Besuch von ", SILSILA, ", weiter zum ", KOM_OMBO, ", dann Fahrt nach Assuan mit Mittagessen an Bord. Abendessen und Übernachtung in Assuan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Die Wunder von Assuan",
    path: "Abu Simbel (optional) → Philae-Tempel → Assuan-Hochdamm → Nacht in Assuan",
    copy: ["Optionaler Ausflug nach Abu Simbel am frühen Morgen. Besuch des ", PHILAE_GENITIVE, " und des Assuan-Hochdamms. Rückkehr an Bord der Hathor zu Mittagessen, Abendessen und Übernachtung in Assuan."],
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
    path: "Esna-Tempel → Fahrt Esna → Luxor → Tal der Könige → Hatschepsut-Tempel → Memnonkolosse → Nacht in Luxor",
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
