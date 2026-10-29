/**
 * The booking journey's itineraries in Italian: the same days, routes and
 * reading links as lib/booking-itineraries.ts, worded for the /it booking
 * flow. Place names follow the rest of the Italian site (Assuan, Tempio di
 * Philae, Valle dei Re, Colossi di Memnone); product names stay in English.
 *
 * The reading links still open the English journal articles they were
 * chosen for; only their labels are Italian.
 */

import {
  HATHOR_ITINERARIES,
  type ItineraryDay,
  type ItineraryLink,
  type VoyageItinerary,
} from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PublicLocale } from "@/lib/i18n/locale";

const PHILAE: ItineraryLink = { label: "Tempio di Philae", href: "https://hathorcruise.com/blogs/philae-temple-aswan-attractions" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Cosa vedere ad Assuan", href: "https://hathorcruise.com/blogs/top-attractions-in-aswan-egypt" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Da Assuan a Luxor in dahabiya", href: "https://hathorcruise.com/blogs/Sailing%20from%20Aswan%20to%20Luxor%20on%20a%20Dahabiya%20Nile%20Cruise" };
const KOM_OMBO: ItineraryLink = { label: "Tempio di Kom Ombo", href: "https://hathorcruise.com/blogs/kom-ombo-temple-hathor-dahabiya" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Da Luxor ad Assuan o da Assuan a Luxor", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-luxor-to-aswan-vs-aswan-to-luxor" };
const EAST_BANK: ItineraryLink = { label: "Tempio di Karnak e il Tempio di Luxor", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const EAST_BANK_READING: ItineraryLink = { label: "Le meraviglie antiche della riva orientale di Luxor", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Guida all’itinerario di una crociera in dahabiya sul Nilo", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-itinerary" };
const COLOSSI: ItineraryLink = { label: "Colossi di Memnone", href: "https://hathorcruise.com/blogs/colossi-of-memnon-luxor" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "I grandi monumenti dell’Egitto lungo il Nilo", href: "https://hathorcruise.com/blogs/egypt-greatest-landmarks-dahabiya" };
const EXPLORING: ItineraryLink = { label: "Luxor e Assuan a bordo di una dahabiya di lusso", href: "https://www.hathorcruise.com/blogs/exploring-luxor-aswan-luxury-dahabiya" };
const SILSILA: ItineraryLink = { label: "Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const SILSILA_READING: ItineraryLink = { label: "I tesori nascosti del Nilo: Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const HATHOR_BLOG: ItineraryLink = { label: "Il Journal di Hathor", href: "https://www.hathorcruise.com/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Viaggiare lentamente sul Nilo", href: "https://hathorcruise.com/blogs/slow-travel-egypt-nile-cruise" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Angoli nascosti del Nilo", href: "https://hathorcruise.com/blogs/romantic-honeymoon-nile-cruise" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Assuan, l’inizio del viaggio",
    path: "Assuan, imbarco → Tempio di Philae → Grande Diga di Assuan → notte ad Assuan",
    copy: ["Arrivo con drink di benvenuto, imbarco e pranzo a bordo. Visita al ", PHILAE, " e alla Grande Diga di Assuan. Rientro a bordo di Hathor per la cena e il pernottamento ad Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS, ASWAN_TO_LUXOR],
  },
  {
    day: 2,
    title: "Kom Ombo ed Esna",
    path: "Assuan → Kom Ombo → Esna → notte a Esna",
    copy: ["Escursione facoltativa ad Abu Simbel al mattino presto. Colazione a bordo, poi navigazione verso nord fino al ", KOM_OMBO, ". Si prosegue verso Esna per la cena e il pernottamento."],
    reading: [KOM_OMBO, DIRECTION_COMPARE],
  },
  {
    day: 3,
    title: "Esna e la riva orientale di Luxor",
    path: "Esna, tempio → navigazione Esna → Luxor → Tempio di Karnak → Tempio di Luxor → notte a Luxor",
    copy: ["Colazione e visita al Tempio di Esna. Navigazione verso Luxor con pranzo a bordo, poi visita alla riva orientale, con il ", EAST_BANK, ". Cena e pernottamento a Luxor."],
    reading: [EAST_BANK_READING, ITINERARY_GUIDE],
  },
  {
    day: 4,
    title: "Arrivederci da Luxor",
    path: "Luxor, sbarco → Valle dei Re → Tempio di Hatshepsut → Colossi di Memnone",
    copy: ["Colazione e check-out. Visita alla riva occidentale di Luxor, con la Valle dei Re, il Tempio di Hatshepsut e i ", COLOSSI, "."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
];

const FOUR_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Luxor e la riva orientale",
    path: "Luxor, imbarco → Tempio di Karnak → Tempio di Luxor → notte a Luxor",
    copy: ["Aperitivo di benvenuto e check-in, seguiti dal pranzo a bordo. Visita alla riva orientale, con il ", EAST_BANK, ". Rientro a bordo di Hathor per la cena e il pernottamento a Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "La riva occidentale di Luxor e la navigazione verso Esna",
    path: "Luxor, riva occidentale → Valle dei Re → Tempio di Hatshepsut → Colossi di Memnone → navigazione Luxor → Esna → notte a Esna",
    copy: ["Colazione, poi visita alla riva occidentale: Valle dei Re, Tempio di Hatshepsut e ", COLOSSI, ". Rientro per il pranzo mentre Hathor naviga verso Esna. Cena e pernottamento a Esna."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 3,
    title: "Il Tempio di Edfu e l’isola di El Ramady",
    path: "Esna → Edfu → Tempio di Horus → isola di El Ramady → notte a El Ramady",
    copy: ["Colazione e navigazione verso sud fino a Edfu. Visita al Tempio di Horus, rientro per il pranzo, poi si prosegue verso l’isola di El Ramady per la cena e il pernottamento."],
    reading: [ITINERARY_GUIDE, HATHOR_BLOG],
  },
  {
    day: 4,
    title: "Gebel el-Silsila, Kom Ombo e la navigazione verso Assuan",
    path: "El Ramady → Gebel el-Silsila → Kom Ombo → Assuan → notte ad Assuan",
    copy: ["Visita alle antiche cave e ai santuari di ", SILSILA, ", poi si prosegue verso il ", KOM_OMBO, ". Navigazione verso Assuan con pranzo a bordo. Cena e pernottamento ad Assuan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Arrivederci da Assuan",
    path: "Abu Simbel (facoltativo) → colazione e check-out → Tempio di Philae → Grande Diga di Assuan → fine ad Assuan",
    copy: ["Escursione facoltativa ad Abu Simbel al mattino presto. Colazione e check-out, poi visita al ", PHILAE, " e alla Grande Diga di Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
];

const SEVEN_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "L’imbarco a Luxor",
    path: "Luxor, imbarco → Tempio di Karnak → Tempio di Luxor → notte a Luxor",
    copy: ["Aperitivo di benvenuto e check-in, seguiti dal pranzo. Visita alla riva orientale di Luxor, con il ", EAST_BANK, ". Cena e pernottamento a Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Da Luxor a Esna",
    path: "Luxor → navigazione sul Nilo → Esna → notte a Esna",
    copy: ["Colazione e una giornata di navigazione rilassata verso Esna, con pranzo e tè tradizionale sul ponte. Cena a lume di candela e pernottamento a Esna."],
    reading: [ITINERARY_GUIDE, SLOW_TRAVEL],
  },
  {
    day: 3,
    title: "Da Esna a Ramadi passando per Edfu",
    path: "Esna → chiusa di Esna → Edfu → Tempio di Horus → isola di Ramadi → notte a Ramadi",
    copy: ["Passaggio della chiusa di Esna e navigazione verso Edfu. Visita al Tempio di Horus, poi si prosegue verso l’isola di Ramadi per una cena tradizionale sull’isola e il pernottamento."],
    reading: [ITINERARY_GUIDE, HIDDEN_SPOTS],
  },
  {
    day: 4,
    title: "Da Gebel el-Silsila ad Assuan",
    path: "Ramadi → Gebel el-Silsila → Kom Ombo → Assuan → notte ad Assuan",
    copy: ["Visita a ", SILSILA, ", si prosegue verso il ", KOM_OMBO, ", poi navigazione verso Assuan con pranzo a bordo. Cena e pernottamento ad Assuan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Le meraviglie di Assuan",
    path: "Abu Simbel (facoltativo) → Tempio di Philae → Grande Diga di Assuan → notte ad Assuan",
    copy: ["Escursione facoltativa ad Abu Simbel al mattino presto. Visita al ", PHILAE, " e alla Grande Diga di Assuan. Rientro a bordo di Hathor per pranzo, cena e pernottamento ad Assuan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
  {
    day: 6,
    title: "Il ritorno verso Esna",
    path: "Assuan → navigazione verso nord sul Nilo → Esna → notte a Esna",
    copy: ["Colazione e un’intera giornata di navigazione rilassata verso nord, da Assuan a Esna, con pranzo e cena a bordo. Pernottamento a Esna."],
    reading: [SLOW_TRAVEL, DIRECTION_COMPARE],
  },
  {
    day: 7,
    title: "Da Esna ai templi senza tempo di Luxor",
    path: "Esna, tempio → navigazione Esna → Luxor → Valle dei Re → Tempio di Hatshepsut → Colossi di Memnone → notte a Luxor",
    copy: ["Visita al Tempio di Esna, poi rientro a Luxor con pranzo a bordo. Visita alla riva occidentale: Valle dei Re, Tempio di Hatshepsut e ", COLOSSI, ". Cena e pernottamento a Luxor."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 8,
    title: "Arrivederci al Nilo",
    path: "Luxor, colazione → check-out e sbarco → fine a Luxor",
    copy: ["Ultima colazione a bordo e check-out a Luxor."],
    reading: [EXPLORING, ITINERARY_GUIDE],
  },
];

/** `departureDay` is the weekday alone; the copy says "ogni mercoledì" where a sentence needs it. */
const HATHOR_ITINERARIES_IT: Record<StayDurationValue, VoyageItinerary> = {
  "3-nights-aswan-luxor": {
    ...HATHOR_ITINERARIES["3-nights-aswan-luxor"],
    title: "3 notti / 4 giorni",
    route: "Assuan → Luxor",
    departureDay: "Mercoledì",
    days_: THREE_NIGHT,
  },
  "4-nights-luxor-aswan": {
    ...HATHOR_ITINERARIES["4-nights-luxor-aswan"],
    title: "4 notti / 5 giorni",
    route: "Luxor → Assuan",
    departureDay: "Sabato",
    days_: FOUR_NIGHT,
  },
  "7-nights-luxor-aswan-luxor": {
    ...HATHOR_ITINERARIES["7-nights-luxor-aswan-luxor"],
    title: "7 notti / 8 giorni",
    route: "Luxor → Assuan → Luxor",
    departureDay: "Sabato",
    days_: SEVEN_NIGHT,
  },
};

const VOYAGE_ORDER: StayDurationValue[] = ["3-nights-aswan-luxor", "4-nights-luxor-aswan", "7-nights-luxor-aswan-luxor"];

/** The voyage's itinerary in the visitor's language. */
export function bookingItinerary(duration: StayDurationValue, locale: PublicLocale): VoyageItinerary {
  return locale === "it" ? HATHOR_ITINERARIES_IT[duration] : HATHOR_ITINERARIES[duration];
}

/** The three voyages, in the order the journey offers them. */
export function bookingVoyages(locale: PublicLocale): VoyageItinerary[] {
  return VOYAGE_ORDER.map((duration) => bookingItinerary(duration, locale));
}
