/** Canonical Hathor product data from assets/RAW_DATA.md */

export const HATHOR_AMENITIES = {
  luxuryRooms: [
    "LED Satellite Screen",
    "Bathtub or Walk-In Shower",
    "Safe box",
    "Tea & Coffee Facilities",
    "Telephone",
    "High-Speed Internet Access",
    "All cabins are non-smoking areas",
    "Panoramic Nile view",
    "22 Square Metres",
    "Minibar",
    "Laundry Service",
    "Smart System",
    "Doctor On Call",
    "Room Service",
    "Air Conditioner",
    "Hair Dryer",
  ],
  luxurySuites: [
    "LED Satellite Screen",
    "Bathtub or Walk-In Shower",
    "Safe box",
    "Panoramic Nile view",
    "Jacuzzi & dual toilets",
    "Hair dryer & mini bar",
    "Smart entertainment system",
    "Room & laundry service",
    "Air conditioning & high-speed Wi-Fi",
  ],
  luxuryRoyalSuites: [
    "Tea & Coffee Facilities",
    "High-Speed Internet Access",
    "All cabins are non-smoking areas",
    "Panoramic Nile view",
    "LED Satellite Screen",
    "Bathtub or Walk-In Shower",
    "Safe box",
    "Jacuzzi & two luxurious bathrooms",
    "Coffee machine, mini bar, air conditioning",
  ],
} as const;

/** Scraped 7-night cabin prices from RAW_DATA.md (USD). */
export const HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD = {
  luxuryRoom: 7000,
  luxurySuite: 10500,
  luxuryRoyalSuite: 12600,
} as const;

export const HATHOR_FOUR_NIGHT_CABIN_PRICES_USD = {
  luxuryRoom: 4000,
  luxurySuite: 6000,
  luxuryRoyalSuite: 7200,
} as const;

export const HATHOR_THREE_NIGHT_CABIN_PRICES_USD = {
  luxuryRoom: 3000,
  luxurySuite: 4500,
  luxuryRoyalSuite: 5400,
} as const;

function usdToCents(usd: number) {
  return usd * 100;
}

function amenitiesText(items: readonly string[]) {
  return items.map((item) => `• ${item}`).join("\n");
}

export type HathorCruiseSeed = {
  slug: string;
  name: string;
  description: string;
  ports: string;
  departureDay: "Wednesday" | "Saturday";
  nights: number;
  days: number;
  basePriceCents: number;
  rooms: {
    roomNumber: string;
    name: string;
    roomType: string;
    capacity: number;
    priceCents: number;
    amenities: readonly string[];
    description: string;
  }[];
};

export const HATHOR_CRUISES: HathorCruiseSeed[] = [
  {
    slug: "3-nights-aswan-luxor",
    name: "3 Nights / 4 Days — Aswan to Luxor",
    description:
      "Aswan → Luxor · 3 Nights / 4 Days. Every Wednesday. An intimate Hathor Dahabiya sailing on the Nile.",
    ports: "Aswan → Luxor",
    departureDay: "Wednesday",
    nights: 3,
    days: 4,
    basePriceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoom),
    rooms: [
      {
        roomNumber: "KING-3N",
        name: "Luxury King Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A King Bed cabin with classic style, modern comfort and panoramic Nile views. 3 Nights / 4 Days · Aswan → Luxor. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-3N",
        name: "Luxury Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A Twin Bed cabin with elegant interiors, modern amenities and panoramic Nile views. 3 Nights / 4 Days · Aswan → Luxor. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-3N",
        name: "Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Suite accommodation with additional space and Nile views. 3 Nights / 4 Days · Aswan → Luxor. Price per suite — maximum 4 persons.",
      },
      {
        roomNumber: "ROYAL-3N",
        name: "Luxury Royal Suite",
        roomType: "Luxury Royal Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoyalSuite),
        amenities: HATHOR_AMENITIES.luxuryRoyalSuites,
        description:
          "Royal Suite accommodation with generous space and privacy. 3 Nights / 4 Days · Aswan → Luxor. Price per Royal Suite — maximum 4 persons.",
      },
    ],
  },
  {
    slug: "4-nights-luxor-aswan",
    name: "4 Nights / 5 Days — Luxor to Aswan",
    description:
      "Luxor → Aswan · 4 Nights / 5 Days. Every Saturday. The classic Hathor Dahabiya voyage on the Nile.",
    ports: "Luxor → Aswan",
    departureDay: "Saturday",
    nights: 4,
    days: 5,
    basePriceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoom),
    rooms: [
      {
        roomNumber: "KING-4N",
        name: "Luxury King Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A King Bed cabin with panoramic Nile views on the 4 Nights / 5 Days Luxor → Aswan voyage. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-4N",
        name: "Luxury Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A Twin Bed cabin with river views on the 4 Nights / 5 Days Luxor → Aswan voyage. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-4N",
        name: "Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Suite accommodation on the 4 Nights / 5 Days Luxor → Aswan voyage. Price per suite — maximum 4 persons.",
      },
      {
        roomNumber: "ROYAL-4N",
        name: "Luxury Royal Suite",
        roomType: "Luxury Royal Suite",
        capacity: 4,
        priceCents: usdToCents(
          HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoyalSuite,
        ),
        amenities: HATHOR_AMENITIES.luxuryRoyalSuites,
        description:
          "Royal Suite accommodation on the 4 Nights / 5 Days Luxor → Aswan voyage. Price per Royal Suite — maximum 4 persons.",
      },
    ],
  },
  {
    slug: "7-nights-luxor-aswan-luxor",
    name: "7 Nights / 8 Days — Luxor to Aswan to Luxor",
    description:
      "Luxor → Aswan → Luxor · 7 Nights / 8 Days. Every Saturday. The complete Hathor Dahabiya circuit on the Nile.",
    ports: "Luxor → Aswan → Luxor",
    departureDay: "Saturday",
    nights: 7,
    days: 8,
    basePriceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxuryRoom),
    rooms: [
      {
        roomNumber: "KING-7N",
        name: "Luxury King Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A King Bed cabin on the 7 Nights / 8 Days Luxor → Aswan → Luxor voyage, with panoramic Nile views. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-7N",
        name: "Luxury Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "A Twin Bed cabin with river views on the 7 Nights / 8 Days Luxor → Aswan → Luxor voyage. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-7N",
        name: "Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Suite accommodation on the 7 Nights / 8 Days Luxor → Aswan → Luxor voyage. Price per suite — maximum 4 persons.",
      },
      {
        roomNumber: "ROYAL-7N",
        name: "Luxury Royal Suite",
        roomType: "Luxury Royal Suite",
        capacity: 4,
        priceCents: usdToCents(
          HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxuryRoyalSuite,
        ),
        amenities: HATHOR_AMENITIES.luxuryRoyalSuites,
        description:
          "Royal Suite accommodation on the 7 Nights / 8 Days Luxor → Aswan → Luxor voyage. Price per Royal Suite — maximum 4 persons.",
      },
    ],
  },
];

export function formatRoomDescription(
  intro: string,
  amenities: readonly string[],
) {
  return `${intro}\n\nAmenities:\n${amenitiesText(amenities)}`;
}

export const HATHOR_SITE_CONTENT = {
  HERO: {
    title: "Ultra Luxury Dahabiya Cruise",
    subtitle: "Your luxurious Nile escape begins with the Hathor Dahabiya",
    bodyText: null,
    imageUrl: null,
  },
  ABOUT: {
    title: "About Hathor",
    subtitle: "Elegance and Serenity on the Nile",
    bodyText:
      "Hathor is an intimate luxury Dahabiya for travellers who prefer space, privacy and an unhurried pace between Luxor and Aswan.",
    imageUrl: null,
  },
  ITINERARIES: {
    title: "Hathor itineraries",
    subtitle: "Explore, Relax, Discover",
    bodyText:
      "Choose a Hathor voyage between Luxor and Aswan.\n\n• Aswan → Luxor · 3 Nights / 4 Days — Every Wednesday (King/Twin $3,000 · Suite $4,500 · Royal Suite $5,400)\n• Luxor → Aswan · 4 Nights / 5 Days — Every Saturday (King/Twin $4,000 · Suite $6,000 · Royal Suite $7,200)\n• Luxor → Aswan → Luxor · 7 Nights / 8 Days — Every Saturday (King/Twin $7,000 · Suite $10,500 · Royal Suite $12,600).",
    imageUrl: null,
  },
  ROOMS: {
    title: "Luxury Rooms & Suites",
    subtitle: "Refined comfort on the Nile",
    bodyText:
      "Hathor's cabins combine thoughtful proportions, Nile views and practical comfort in a calm, contemporary setting.\n\nLuxury Rooms — thoughtful proportions and Nile views.\n\nLuxury Suites — additional space and privacy.\n\nLuxury Royal Suites — Hathor's most spacious accommodation.",
    imageUrl: null,
  },
  WELLNESS: {
    title: "Wellness",
    subtitle: "Renew Your Soul",
    bodyText:
      "A calm onboard space for restorative treatments designed around rest, recovery and the rhythm of the journey.\n\nSeneb means health and well-being — spa care shaped by Egyptian tradition.\n\nHistoria Fitness offers a considered environment for guests who wish to maintain movement while travelling.",
    imageUrl: null,
  },
  GASTRONOMY: {
    title: "Dining aboard Hathor",
    subtitle: "Hathor Flavors",
    bodyText:
      "Seasonal menus bring together Egyptian flavours, fresh ingredients and attentive service, served in settings shaped by the river.\n\nBreakfast, lunch and dinner move with the day's light — from morning decks to candlelit evenings under the stars.",
    imageUrl: null,
  },
} as const;
