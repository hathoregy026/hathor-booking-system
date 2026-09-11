import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";

export type RoomFolioDay = {
  title: string;
  body: string;
};

export type RoomFolioRoute = {
  id: string;
  title: string;
  meta: string;
  departs: string;
  occupancy: string;
  href: string;
  hrefLabel: string;
  days: readonly RoomFolioDay[];
};

export type RoomFolioSailing = {
  title: string;
  meta: string;
  occupancy: string;
};

export type RoomFolioPanels = {
  overview: {
    lead: string;
    paragraphs: readonly string[];
    facts: readonly string[];
  };
  itineraries: readonly RoomFolioRoute[];
  include: readonly string[];
  exclude: readonly string[];
  availability: {
    note: string;
    sailings: readonly RoomFolioSailing[];
  };
};

const SHARED_INCLUDE = [
  "Round-trip transfers from Aswan or Luxor airports in modern tourist vehicles (limousine or van)",
  "VAT and service charges",
  "Welcome drink upon arrival",
  "One complimentary welcome Champagne for each cabin and suite, served once per stay",
  "Accommodation on a Soft All-Inclusive basis (all meals and soft drinks throughout the day)",
  "Entrance tickets for sightseeing as per the itinerary (public visits)",
  "Professional Egyptologist guide",
  "Laundry service",
  "Daily mini-bar refill",
  "Wi-Fi",
  "Room service",
  "Coffee machine and tea maker with daily refill",
  "Safe deposit box in each unit",
] as const;

const SHARED_EXCLUDE = [
  "Domestic or international flights",
  "Travel insurance",
  "Alcoholic beverages, except the complimentary welcome Champagne served once per stay",
  "Optional tours or activities not included in the itinerary",
  "Gratuities and personal expenses",
] as const;

const ASWAN_TO_LUXOR_DAYS: readonly RoomFolioDay[] = [
  {
    title: "Day 1 · Aswan",
    body: "On arrival you are welcomed with a drink and board Hathor for a leisurely lunch. Visit Philae Temple and the High Dam, then return for dinner and overnight in Aswan.",
  },
  {
    title: "Day 2 · Kom Ombo & Esna",
    body: "An optional early visit to Abu Simbel may be arranged. Breakfast is served on board, or as a breakfast box for early risers. Sail to Kom Ombo to visit the temple dedicated to Sobek and Horus, then continue to Esna for dinner and overnight.",
  },
  {
    title: "Day 3 · Esna & Luxor East Bank",
    body: "After breakfast, visit the Temple of Esna. Sail to Luxor over lunch, then explore Karnak Temple and Luxor Temple. Dinner and overnight aboard Hathor in Luxor.",
  },
  {
    title: "Day 4 · Luxor West Bank",
    body: "Breakfast and check-out are followed by a guided visit to the West Bank — the Valley of the Kings, the Temple of Hatshepsut and the Colossi of Memnon — before departure from Luxor.",
  },
];

const LUXOR_TO_ASWAN_DAYS: readonly RoomFolioDay[] = [
  {
    title: "Day 1 · Luxor East Bank",
    body: "A welcome drink and check-in begin the voyage. After lunch, visit Karnak Temple and Luxor Temple. Dinner and overnight in Luxor.",
  },
  {
    title: "Day 2 · West Bank & Esna",
    body: "After breakfast, visit the Valley of the Kings, the Temple of Hatshepsut and the Colossi of Memnon. Return for lunch as Hathor sails toward Esna. Dinner and overnight in Esna.",
  },
  {
    title: "Day 3 · Edfu & El Ramady",
    body: "Breakfast, then the rock-cut tombs of El Kab and the Temple of Horus at Edfu. Lunch on board before sailing to El Ramady Island for dinner and overnight.",
  },
  {
    title: "Day 4 · Gebel el-Silsila, Kom Ombo & Aswan",
    body: "Explore the sandstone quarries of Gebel el-Silsila, then visit the Temple of Kom Ombo, dedicated to Sobek and Horus the Elder. Lunch while sailing to Aswan. Dinner and overnight in Aswan.",
  },
  {
    title: "Day 5 · Aswan",
    body: "An optional early visit to Abu Simbel may be arranged. After a final breakfast and check-out, visit Philae Temple and the High Dam before disembarking in Aswan.",
  },
];

const ROUND_TRIP_DAYS: readonly RoomFolioDay[] = [
  {
    title: "Day 1 · Luxor East Bank",
    body: "A welcome drink and check-in open the round voyage. After lunch, visit Karnak Temple and Luxor Temple. Dinner and overnight in Luxor.",
  },
  {
    title: "Day 2 · Sailing to Esna",
    body: "Breakfast on the Nile as Hathor sails south toward Esna. A leisurely lunch and afternoon tea on deck precede a candlelit dinner and overnight in Esna.",
  },
  {
    title: "Day 3 · Edfu & Ramadi Island",
    body: "Pass the Esna Lock and continue toward Edfu for the Temple of Horus. Lunch on board, then sail to Ramadi Island for a charcoal-grilled dinner and overnight on the quiet shore.",
  },
  {
    title: "Day 4 · Gebel el-Silsila, Kom Ombo & Aswan",
    body: "Visit the ancient quarries of Gebel el-Silsila, then the Temple of Kom Ombo. Lunch while sailing to Aswan. Dinner and overnight in Aswan.",
  },
  {
    title: "Day 5 · Aswan",
    body: "An optional early visit to Abu Simbel may be arranged. Then explore Philae Temple and the High Dam. Lunch and dinner on board; overnight in Aswan.",
  },
  {
    title: "Day 6 · Sailing north",
    body: "After breakfast, sail from Aswan toward Esna. Lunch and a quiet afternoon on deck. Dinner and overnight in Esna.",
  },
  {
    title: "Day 7 · Esna & Luxor West Bank",
    body: "Breakfast, then the Temple of Esna. Sail to Luxor over lunch. In the afternoon visit the Valley of the Kings, the Temple of Hatshepsut and the Colossi of Memnon. Dinner and overnight in Luxor.",
  },
  {
    title: "Day 8 · Luxor",
    body: "A final breakfast on board and check-out. Disembark in Luxor.",
  },
];

function routesFor(occupancy: string): readonly RoomFolioRoute[] {
  return [
    {
      id: "3-nights-aswan-luxor",
      title: "Aswan → Luxor",
      meta: "3 Nights / 4 Days",
      departs: "Every Wednesday",
      occupancy,
      href: "/voyages/aswan-to-luxor",
      hrefLabel: "View voyage",
      days: ASWAN_TO_LUXOR_DAYS,
    },
    {
      id: "4-nights-luxor-aswan",
      title: "Luxor → Aswan",
      meta: "4 Nights / 5 Days",
      departs: "Every Saturday",
      occupancy,
      href: "/voyages/luxor-to-aswan",
      hrefLabel: "View voyage",
      days: LUXOR_TO_ASWAN_DAYS,
    },
    {
      id: "7-nights-luxor-aswan-luxor",
      title: "Luxor → Aswan → Luxor",
      meta: "7 Nights / 8 Days",
      departs: "Every Saturday",
      occupancy,
      href: "/cruises-list",
      hrefLabel: "View scheduled sailings",
      days: ROUND_TRIP_DAYS,
    },
  ];
}

function sailingsFor(occupancy: string): readonly RoomFolioSailing[] {
  return [
    {
      title: "Aswan → Luxor",
      meta: "3 Nights / 4 Days · every Wednesday",
      occupancy,
    },
    {
      title: "Luxor → Aswan",
      meta: "4 Nights / 5 Days · every Saturday",
      occupancy,
    },
    {
      title: "Luxor → Aswan → Luxor",
      meta: "7 Nights / 8 Days · every Saturday",
      occupancy,
    },
  ];
}

export const ROOM_FOLIO_PANELS: Record<RoomCollectionVariant, RoomFolioPanels> = {
  cabins: {
    overview: {
      lead: "Luxury Nile Cruise Rooms · 22 square metres · panoramic Nile view",
      paragraphs: [
        "Every cabin is a calm retreat for two, with wide Nile glass, king or twin beds, and contemporary comfort for sailing between Luxor and Aswan.",
        "The smaller scale of a Dahabiya creates quieter days on the water and more personal service throughout the voyage. After shore visits, guests return to refined interiors, attentive crew and dining shaped by the river.",
      ],
      facts: [
        "King or twin configuration",
        "Maximum 2 guests per cabin",
        "Connected cabins available",
        "12 luxury cabins and suites aboard Hathor",
      ],
    },
    itineraries: routesFor("Price per cabin — maximum 2 persons"),
    include: SHARED_INCLUDE,
    exclude: SHARED_EXCLUDE,
    availability: {
      note: "Hathor sails on a published weekly cadence. Request a date to confirm the cabin that remains open for your chosen itinerary.",
      sailings: sailingsFor("Maximum 2 persons per cabin"),
    },
  },
  suites: {
    overview: {
      lead: "Accessible Hathor Suite · 46 square metres · panoramic Nile view",
      paragraphs: [
        "The Hathor inclusive cabins and suites embody the elegance of an oil-drop sunset, complemented by thoughtful accessibility and effortless comfort — a private sanctuary on the Nile for travellers who value refined ease of movement.",
        "Spacious and artistically designed, the suite features open spaces, natural textures, wide walkways and panoramic windows. Inspired by Egypt’s heritage, every detail invites guests to unwind or simply enjoy the mellow pace of the river.",
        "The Luxury Suite offers additional space for guests who value greater privacy, generous proportions and uninterrupted river views — a lower-deck residence with a private Jacuzzi.",
      ],
      facts: [
        "Maximum 4 guests per suite",
        "Private Jacuzzi",
        "Connected cabins available",
        "2 Luxury Suites aboard Hathor",
      ],
    },
    itineraries: routesFor("Price per suite — maximum 4 persons"),
    include: SHARED_INCLUDE,
    exclude: SHARED_EXCLUDE,
    availability: {
      note: "Hathor sails on a published weekly cadence. Request a date to confirm the suite that remains open for your chosen itinerary.",
      sailings: sailingsFor("Maximum 4 persons per suite"),
    },
  },
  royal: {
    overview: {
      lead: "Luxury Royal Suites · 56 square metres · panoramic Nile view",
      paragraphs: [
        "The Royal Suites are Hathor’s most spacious accommodation, with additional private space and a stronger sense of seclusion on the Main Deck.",
        "Panoramic windows and a private balcony open onto the river as you sail between Luxor and Aswan. Traditional craftsmanship and contemporary comfort meet in a setting shaped for quieter, more personal travel.",
      ],
      facts: [
        "Maximum 4 guests per Royal Suite",
        "Private balcony and two bathrooms",
        "2 Royal Suites aboard Hathor",
      ],
    },
    itineraries: routesFor("Price per Royal Suite — maximum 4 persons"),
    include: SHARED_INCLUDE,
    exclude: SHARED_EXCLUDE,
    availability: {
      note: "Hathor sails on a published weekly cadence. Request a date to confirm the Royal Suite that remains open for your chosen itinerary.",
      sailings: sailingsFor("Maximum 4 persons per Royal Suite"),
    },
  },
};

export function folioVariantForRoomSlug(slug: string): RoomCollectionVariant {
  if (slug === "royal-suite") return "royal";
  if (slug === "luxury-suite") return "suites";
  return "cabins";
}
