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
    "22 Square Meters",
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
      "Aswan / Luxor 3 Nights - 4 Days. Every Wednesday. Experience the magic of Egypt on the luxury Hathor Dahabiya Nile cruise.",
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
          "Experience true luxury in an elegant King Bed cabin where classic style meets modern comfort and panoramic Nile scenery. 3 nights itinerary Aswan to Luxor. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-3N",
        name: "Luxury Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "Enjoy refined comfort in a Luxury Twin Bed cabin with elegant interiors, modern amenities and panoramic Nile views. 3 nights itinerary Aswan to Luxor. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-3N",
        name: "Hathor Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Experience the ultimate luxury in our Nile Cruise Luxury Suites, where the authenticity of Egypt meets luxurious modern interiors. 3 nights itinerary Aswan to Luxor. Price per suite — maximum 4 persons.",
      },
      {
        roomNumber: "ROYAL-3N",
        name: "Hathor Luxury Royal Suite",
        roomType: "Luxury Royal Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_THREE_NIGHT_CABIN_PRICES_USD.luxuryRoyalSuite),
        amenities: HATHOR_AMENITIES.luxuryRoyalSuites,
        description:
          "Discover the perfect blend of luxury, space, and elegance aboard our Luxury Royal Suites Dahabiya Cruise. 3-Night Itinerary: Aswan to Luxor. Price per royal suite — maximum 4 persons.",
      },
    ],
  },
  {
    slug: "4-nights-luxor-aswan",
    name: "4 Nights / 5 Days — Luxor to Aswan",
    description:
      "Luxor / Aswan 4 Nights - 5 Days. Every Saturday. Sail the Nile in style with panoramic views and timeless elegance.",
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
          "Sail the Nile in style featuring luxury cabins, panoramic views, and timeless elegance. 4 nights itinerary Luxor / Aswan. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-4N",
        name: "Hathor Dahabiya Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "Filled with warmth and elegance, our Luxury Dahabiya Nile Cruise Rooms with River View promise an unforgettable experience. 4 nights itinerary Luxor / Aswan. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-4N",
        name: "Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Immerse yourself in timeless style and modern luxury on our Nile Cruise Luxury Suites. 4 nights itinerary Luxor / Aswan. Price per suite — maximum 4 persons.",
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
          "Sail the Nile in style aboard the Luxury Royal Suites Nile Cruise. 4 nights itinerary Luxor / Aswan. Price per royal suite — maximum 4 persons.",
      },
    ],
  },
  {
    slug: "7-nights-luxor-aswan-luxor",
    name: "7 Nights / 8 Days — Luxor to Aswan to Luxor",
    description:
      "Luxor / Aswan / Luxor - 7 Nights - 8 Days. Every Saturday. Experience the magic of Egypt on the luxury Hathor Dahabiya Nile cruise.",
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
          "Sail the Nile in style on a 7 Nights 8 Days Dahabiya Nile Cruise from Luxor to Aswan, featuring luxury cabins, panoramic views, and timeless elegance. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "TWIN-7N",
        name: "Hathor Dahabiya Twin Bed",
        roomType: "Luxury Room",
        capacity: 2,
        priceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxuryRoom),
        amenities: HATHOR_AMENITIES.luxuryRooms,
        description:
          "Filled with warmth and elegance, our Luxury Dahabiya Nile Cruise Rooms with River View promise an unforgettable experience. 7 Nights Itinerary: Luxor – Aswan – Luxor. Price per cabin — maximum 2 persons.",
      },
      {
        roomNumber: "SUITE-7N",
        name: "Luxury Suite",
        roomType: "Luxury Suite",
        capacity: 4,
        priceCents: usdToCents(HATHOR_SEVEN_NIGHT_CABIN_PRICES_USD.luxurySuite),
        amenities: HATHOR_AMENITIES.luxurySuites,
        description:
          "Immerse yourself in the perfect harmony of timeless style and modern luxury on our Nile Cruise Luxury Suites. 7 nights itinerary Luxor / Aswan / Luxor. Price per suite — maximum 4 persons.",
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
          "Lose yourself in the heart of the Nile with our Luxury Royal Suites Nile Cruise, tailored for those who appreciate authenticity, royalty and comfort. 7 nights itinerary Luxor / Aswan / Luxor. Price per royal suite — maximum 4 persons.",
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
      "Step into an aura of elegance and tranquility aboard the Hathor Dahabiya, where luxury glides gracefully along the Nile and the timeless beauty of Egypt surrounds you. Experience the finest luxurious Dahabiya in Egypt, where every moment is crafted to inspire wonder and serenity.",
    imageUrl: null,
  },
  ITINERARIES: {
    title: "Hathor itineraries",
    subtitle: "Explore, Relax, Discover",
    bodyText:
      "Experience the magic of Egypt on the luxury Hathor Dahabiya Nile cruise.\n\n• Aswan / Luxor 3 Nights - 4 Days — Every Wednesday (King/Twin $3,000 · Suite $4,500 · Royal Suite $5,400)\n• Luxor / Aswan 4 Nights - 5 Days — Every Saturday (King/Twin $4,000 · Suite $6,000 · Royal Suite $7,200)\n• Luxor / Aswan / Luxor 7 Nights - 8 Days — Every Saturday (King/Twin $7,000 · Suite $10,500 · Royal Suite $12,600).",
    imageUrl: null,
  },
  ROOMS: {
    title: "Luxury Rooms & Suites",
    subtitle: "Refined comfort on the Nile",
    bodyText:
      "Sail with Hathor Dahabiya, the best Dahabiya Nile Cruise, perfect for lovers of comfort, style, and authenticity. This Luxury Dahabiya Nile Cruise offers an exclusive journey down the legendary river, with every detail reflecting grace and personalized attention.\n\nLuxury Rooms — Discover refined luxury rooms suitable for a truly elegant Nile cruise. Relish the comfort of refined luxury.\n\nLuxury Suites — Experience elegant comfort and thoughtful design in our Accessible Hathor Suite aboard Hathor Dahabiya, a luxury privilege on the Nile.\n\nLuxury Royal Suites — Enjoy the Royal Suites on Hathor Dahabiya, with the highest level of comfort and the real charm of a Luxury Dahabiya Nile Cruise, with breathtaking Nile views.",
    imageUrl: null,
  },
  WELLNESS: {
    title: "Wellness",
    subtitle: "Renew Your Soul",
    bodyText:
      "Introducing our exclusive Seneb Spa on Hathor Dahabiya. Step into a refreshing journey where every moment is a peaceful oasis, offering a relaxing and unforgettable escape on your Luxury Dahabiya Nile Cruise.\n\nDiscover the Seneb Spa, inspired by over 7,000 years of Egyptian wellness traditions. Seneb means health and well-being — your spa experience on the Nile is shaped by timeless wisdom and holistic care.\n\nTrain with a view at Historia Fitness Center — your personal oasis overlooking the majestic River Nile.",
    imageUrl: null,
  },
  GASTRONOMY: {
    title: "Luxury Dining on Egypt's Finest Dahabiya",
    subtitle: "Hathor Flavors",
    bodyText:
      "Where fancy dining meets warm hospitality in unforgettable culinary delight on Hathor Dahabiya, the very best Luxury Dahabiya Nile Cruise offers. Dishes are prepared with restaurant-level expertise using the freshest locally sourced ingredients, blending Egyptian and international flavors. Each meal indulges your taste buds in a symphony of flavors.\n\nEnjoy breakfast and gourmet lunches with magical Nile river views, and dine by candlelight under the stars. With two elegant restaurants and relaxing lounge bars, every moment becomes a celebration of taste and tranquility.",
    imageUrl: null,
  },
} as const;
