import type { StayDurationValue } from "@/lib/booking-search-config";

/**
 * Canonical Hathor itinerary content, from
 * HATHOR_BOOKING_CANONICAL_ITINERARIES.md.
 *
 * The itinerary belongs to the voyage, never to the cabin type: King, Twin,
 * Luxury Suite and Royal Suite on the same sailing read the same days. Copy is
 * stored as segments so the supplied Hathor blog links stay inside the sentence
 * they belong to.
 */

export type ItineraryLink = { label: string; href: string };
export type ItineraryCopy = (string | ItineraryLink)[];

export type ItineraryDay = {
  day: number;
  title: string;
  path: string;
  copy: ItineraryCopy;
  reading: ItineraryLink[];
};

export type VoyageItinerary = {
  duration: StayDurationValue;
  nights: number;
  days: number;
  title: string;
  route: string;
  departureDay: string;
  image: string;
  days_: ItineraryDay[];
};

const PHILAE: ItineraryLink = { label: "Philae Temple", href: "https://hathorcruise.com/blogs/philae-temple-aswan-attractions" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Aswan Attractions", href: "https://hathorcruise.com/blogs/top-attractions-in-aswan-egypt" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Aswan to Luxor by Dahabiya", href: "https://hathorcruise.com/blogs/Sailing%20from%20Aswan%20to%20Luxor%20on%20a%20Dahabiya%20Nile%20Cruise" };
const KOM_OMBO: ItineraryLink = { label: "Kom Ombo Temple", href: "https://hathorcruise.com/blogs/kom-ombo-temple-hathor-dahabiya" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Luxor to Aswan vs Aswan to Luxor", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-luxor-to-aswan-vs-aswan-to-luxor" };
const EAST_BANK: ItineraryLink = { label: "Karnak Temple and Luxor Temple", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const EAST_BANK_READING: ItineraryLink = { label: "Luxor East Bank Ancient Wonders", href: "https://hathorcruise.com/blogs/east-bank-ancient-wonders-luxor" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Dahabiya Nile Cruise Itinerary Guide", href: "https://hathorcruise.com/blogs/dahabiya-nile-cruise-itinerary" };
const COLOSSI: ItineraryLink = { label: "Colossi of Memnon", href: "https://hathorcruise.com/blogs/colossi-of-memnon-luxor" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "Egypt's Greatest Nile Landmarks", href: "https://hathorcruise.com/blogs/egypt-greatest-landmarks-dahabiya" };
const EXPLORING: ItineraryLink = { label: "Exploring Luxor and Aswan on a Luxury Dahabiya", href: "https://www.hathorcruise.com/blogs/exploring-luxor-aswan-luxury-dahabiya" };
const SILSILA: ItineraryLink = { label: "Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const SILSILA_READING: ItineraryLink = { label: "Nile Hidden Gems — Gebel el-Silsila", href: "https://hathorcruise.com/blogs/hidden-gems-along-luxor-aswan" };
const HATHOR_BLOG: ItineraryLink = { label: "Hathor Blog", href: "https://www.hathorcruise.com/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Slow Travel on the Nile", href: "https://hathorcruise.com/blogs/slow-travel-egypt-nile-cruise" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Hidden Nile Spots", href: "https://hathorcruise.com/blogs/romantic-honeymoon-nile-cruise" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Aswan — Start Your Journey",
    path: "Aswan embarkation → Philae Temple → Aswan High Dam → Aswan overnight",
    copy: ["Arrival and welcome drink, embarkation and lunch on board. Visit ", PHILAE, " and the Aswan High Dam. Return to Hathor for dinner and overnight in Aswan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS, ASWAN_TO_LUXOR],
  },
  {
    day: 2,
    title: "Explore Kom Ombo & Esna",
    path: "Aswan → Kom Ombo → Esna → Esna overnight",
    copy: ["Optional early-morning Abu Simbel excursion. Breakfast on board, then sail north to ", KOM_OMBO, ". Continue sailing to Esna for dinner and overnight."],
    reading: [KOM_OMBO, DIRECTION_COMPARE],
  },
  {
    day: 3,
    title: "Esna & Luxor's East Bank",
    path: "Esna Temple → sail Esna → Luxor → Karnak Temple → Luxor Temple → Luxor overnight",
    copy: ["Breakfast followed by the Temple of Esna. Sail to Luxor with lunch on board, then explore the East Bank including ", EAST_BANK, ". Dinner and overnight in Luxor."],
    reading: [EAST_BANK_READING, ITINERARY_GUIDE],
  },
  {
    day: 4,
    title: "Farewell from Luxor",
    path: "Luxor disembarkation → Valley of the Kings → Hatshepsut Temple → Colossi of Memnon",
    copy: ["Breakfast and checkout. Visit Luxor's West Bank, including the Valley of the Kings, Temple of Hatshepsut and ", COLOSSI, "."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
];

const FOUR_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Welcome to Luxor & the East Bank",
    path: "Luxor embarkation → Karnak Temple → Luxor Temple → Luxor overnight",
    copy: ["Welcome drink and check-in, followed by lunch on board. Explore the East Bank, including ", EAST_BANK, ". Return to Hathor for dinner and overnight in Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "West Bank of Luxor & Sailing to Esna",
    path: "Luxor West Bank → Valley of the Kings → Hatshepsut Temple → Colossi of Memnon → sail Luxor → Esna → Esna overnight",
    copy: ["Breakfast, then visit the West Bank: Valley of the Kings, Temple of Hatshepsut and ", COLOSSI, ". Return for lunch as Hathor sails to Esna. Dinner and overnight in Esna."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 3,
    title: "Edfu Temple & El Ramady Island",
    path: "Esna → Edfu → Temple of Horus → El Ramady Island → El Ramady overnight",
    copy: ["Breakfast and southbound sailing to Edfu. Visit the Temple of Horus, return for lunch, then continue to El Ramady Island for dinner and overnight."],
    reading: [ITINERARY_GUIDE, HATHOR_BLOG],
  },
  {
    day: 4,
    title: "Gebel el-Silsila, Kom Ombo & Sailing to Aswan",
    path: "El Ramady → Gebel el-Silsila → Kom Ombo → Aswan → Aswan overnight",
    copy: ["Visit the ancient quarries and shrines of ", SILSILA, ", then continue to ", KOM_OMBO, ". Sail onward to Aswan with lunch on board. Dinner and overnight in Aswan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Farewell from Aswan",
    path: "optional Abu Simbel → breakfast/check-out → Philae Temple → Aswan High Dam → end in Aswan",
    copy: ["Optional early excursion to Abu Simbel. Breakfast and checkout, then visit ", PHILAE, " and the Aswan High Dam."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
];

const SEVEN_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Welcome Aboard in Luxor",
    path: "Luxor embarkation → Karnak Temple → Luxor Temple → Luxor overnight",
    copy: ["Welcome drink and check-in, followed by lunch. Explore Luxor's East Bank, including ", EAST_BANK, ". Dinner and overnight in Luxor."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Luxor to Esna",
    path: "Luxor → Nile sailing → Esna → Esna overnight",
    copy: ["Breakfast and a relaxed sailing day toward Esna, with lunch and traditional tea on deck. Candlelit dinner and overnight in Esna."],
    reading: [ITINERARY_GUIDE, SLOW_TRAVEL],
  },
  {
    day: 3,
    title: "Esna to Ramadi via Edfu",
    path: "Esna → Esna Lock → Edfu → Temple of Horus → Ramadi Island → Ramadi overnight",
    copy: ["Sail through Esna Lock toward Edfu. Visit the Temple of Horus, then continue to Ramadi Island for a traditional island dinner and overnight."],
    reading: [ITINERARY_GUIDE, HIDDEN_SPOTS],
  },
  {
    day: 4,
    title: "From Gebel el-Silsila to Aswan",
    path: "Ramadi → Gebel el-Silsila → Kom Ombo → Aswan → Aswan overnight",
    copy: ["Explore ", SILSILA, ", continue to ", KOM_OMBO, ", then sail to Aswan with lunch on board. Dinner and overnight in Aswan."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Wonders of Aswan",
    path: "optional Abu Simbel → Philae Temple → Aswan High Dam → Aswan overnight",
    copy: ["Optional early excursion to Abu Simbel. Explore ", PHILAE, " and the Aswan High Dam. Return to Hathor for lunch, dinner and overnight in Aswan."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
  {
    day: 6,
    title: "Return Journey to Esna",
    path: "Aswan → northbound Nile sailing → Esna → Esna overnight",
    copy: ["Breakfast and a relaxed full-day sail north from Aswan toward Esna, with lunch and dinner on board. Overnight in Esna."],
    reading: [SLOW_TRAVEL, DIRECTION_COMPARE],
  },
  {
    day: 7,
    title: "Esna to Luxor's Timeless Temples",
    path: "Esna Temple → sail Esna → Luxor → Valley of the Kings → Hatshepsut Temple → Colossi of Memnon → Luxor overnight",
    copy: ["Visit Esna Temple, then return to Luxor with lunch on board. Explore the West Bank: Valley of the Kings, Temple of Hatshepsut and ", COLOSSI, ". Dinner and overnight in Luxor."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 8,
    title: "Farewell to the Nile",
    path: "Luxor breakfast → checkout/disembarkation → end in Luxor",
    copy: ["Final breakfast on board and checkout in Luxor."],
    reading: [EXPLORING, ITINERARY_GUIDE],
  },
];

export const HATHOR_ITINERARIES: Record<StayDurationValue, VoyageItinerary> = {
  "3-nights-aswan-luxor": {
    duration: "3-nights-aswan-luxor",
    nights: 3,
    days: 4,
    title: "3 Nights / 4 Days",
    route: "Aswan → Luxor",
    departureDay: "Wednesdays",
    image: "/media/hathor/optimized/home-voyage-3n-aswan-luxor.webp",
    days_: THREE_NIGHT,
  },
  "4-nights-luxor-aswan": {
    duration: "4-nights-luxor-aswan",
    nights: 4,
    days: 5,
    title: "4 Nights / 5 Days",
    route: "Luxor → Aswan",
    departureDay: "Saturdays",
    image: "/media/hathor/optimized/home-voyage-4n-luxor-aswan.webp",
    days_: FOUR_NIGHT,
  },
  "7-nights-luxor-aswan-luxor": {
    duration: "7-nights-luxor-aswan-luxor",
    nights: 7,
    days: 8,
    title: "7 Nights / 8 Days",
    route: "Luxor → Aswan → Luxor",
    departureDay: "Saturdays",
    image: "/media/hathor/optimized/home-voyage-7n-roundtrip.webp",
    days_: SEVEN_NIGHT,
  },
};

export const HATHOR_VOYAGES = [
  HATHOR_ITINERARIES["3-nights-aswan-luxor"],
  HATHOR_ITINERARIES["4-nights-luxor-aswan"],
  HATHOR_ITINERARIES["7-nights-luxor-aswan-luxor"],
];

export function itineraryFor(duration: StayDurationValue): VoyageItinerary {
  return HATHOR_ITINERARIES[duration];
}
