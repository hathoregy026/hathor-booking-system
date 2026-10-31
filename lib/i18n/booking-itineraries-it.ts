/**
 * The booking journey's itineraries in Italian: the same days, routes and
 * reading links as lib/booking-itineraries.ts, worded for the /it booking
 * flow. Place names follow the rest of the Italian site (Assuan, Tempio di
 * Philae, Valle dei Re, Colossi di Memnone); product names stay in English.
 *
 * The reading links open the Italian journal articles, the same ones the
 * English links reach through lib/seo/legacy-redirects.ts. The two whose old
 * article now lives on the voyages page go to /it/voyages, worded to say so.
 */

import {
  HATHOR_ITINERARIES,
  type ItineraryDay,
  type ItineraryLink,
  type VoyageItinerary,
} from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

const PHILAE: ItineraryLink = { label: "Tempio di Philae", href: "/it/blogs/discovering-the-secrets-of-philae-temple" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Cosa vedere ad Assuan", href: "/it/blogs/golden-gems-of-aswan" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Da Assuan a Luxor in dahabiya", href: "/it/blogs/sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise" };
const KOM_OMBO: ItineraryLink = { label: "Tempio di Kom Ombo", href: "/it/blogs/kom-ombo-temple" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Confronta i viaggi da Luxor ad Assuan e da Assuan a Luxor", href: "/it/voyages" };
const EAST_BANK: ItineraryLink = { label: "Tempio di Karnak e il Tempio di Luxor", href: "/it/blogs/luxors-sacred-east-bank" };
const EAST_BANK_READING: ItineraryLink = { label: "Le meraviglie antiche della riva orientale di Luxor", href: "/it/blogs/luxors-sacred-east-bank" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Scopri gli itinerari dei viaggi sul Nilo", href: "/it/voyages" };
const COLOSSI: ItineraryLink = { label: "Colossi di Memnone", href: "/it/blogs/colossi-of-memnon" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "I grandi monumenti dell’Egitto lungo il Nilo", href: "/it/blogs/best-places-to-visit-along-the-nile-with-a-dahabiya-cruise" };
const EXPLORING: ItineraryLink = { label: "Luxor e Assuan a bordo di una dahabiya di lusso", href: "/it/blogs/exploring-luxor-and-aswan-on-a-luxury-dahabiya" };
const SILSILA: ItineraryLink = { label: "Gebel el-Silsila", href: "/it/blogs/niles-hidden-gems-by-dahabiya" };
const SILSILA_READING: ItineraryLink = { label: "I tesori nascosti del Nilo: Gebel el-Silsila", href: "/it/blogs/niles-hidden-gems-by-dahabiya" };
const HATHOR_BLOG: ItineraryLink = { label: "Il Journal di Hathor", href: "/it/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Viaggiare lentamente sul Nilo", href: "/it/blogs/why-travelers-love-slow-travel-on-the-nile" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Angoli nascosti del Nilo", href: "/it/blogs/5-quiet-nile-spots-for-stunning-honeymoon-captures" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Assuan, l’inizio del viaggio",
    path: "Assuan, imbarco → Tempio di Philae → Grande Diga di Assuan → notte ad Assuan",
    copy: ["Arrivo con aperitivo di benvenuto, imbarco e pranzo a bordo. Visita al ", PHILAE, " e alla Grande Diga di Assuan. Rientro a bordo di Hathor per la cena e il pernottamento ad Assuan."],
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
    title: "Il Tempio di Edfu e l’isola di Ramadi",
    path: "Esna → Edfu → Tempio di Horus → isola di Ramadi → notte a Ramadi",
    copy: ["Colazione e navigazione verso sud fino a Edfu. Visita al Tempio di Horus, rientro per il pranzo, poi si prosegue verso l’isola di Ramadi per la cena e il pernottamento."],
    reading: [ITINERARY_GUIDE, HATHOR_BLOG],
  },
  {
    day: 4,
    title: "Gebel el-Silsila, Kom Ombo e la navigazione verso Assuan",
    path: "Ramadi → Gebel el-Silsila → Kom Ombo → Assuan → notte ad Assuan",
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
export const HATHOR_ITINERARIES_IT: Record<StayDurationValue, VoyageItinerary> = {
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
