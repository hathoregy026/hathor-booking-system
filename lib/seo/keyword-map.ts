/**
 * Keyword-to-page map — one primary commercial intent per URL.
 * Supporting terms may appear in copy; they must not become a second page title.
 */

export type SeoIntent = {
  path: string;
  primary: string;
  secondary: readonly string[];
  intent: "commercial" | "informational" | "transactional";
};

export const SEO_KEYWORD_MAP = {
  home: {
    path: "/",
    primary: "Luxury Dahabiya Nile Cruise",
    secondary: ["Hathor Dahabiya", "private Nile sailing Egypt"],
    intent: "commercial",
  },
  voyages: {
    path: "/voyages",
    primary: "Nile cruise itineraries Luxor Aswan",
    secondary: ["Dahabiya voyage Egypt", "Hathor Nile itineraries"],
    intent: "commercial",
  },
  luxorToAswan: {
    path: "/voyages/luxor-to-aswan",
    primary: "Luxor to Aswan Nile Cruise",
    secondary: ["4 night Luxor Aswan dahabiya"],
    intent: "commercial",
  },
  aswanToLuxor: {
    path: "/voyages/aswan-to-luxor",
    primary: "Aswan to Luxor Nile Cruise",
    secondary: ["3 night Aswan Luxor dahabiya"],
    intent: "commercial",
  },
  charter: {
    path: "/charter",
    primary: "Private Nile Cruise Egypt",
    secondary: ["Private Dahabiya Charter", "exclusive Nile boat charter"],
    intent: "commercial",
  },
  cabins: {
    path: "/luxury-cabins-Nile-Cruise",
    primary: "Luxury Nile Cruise Cabins",
    secondary: ["Luxury Nile Cruise Rooms", "Dahabiya cabins Egypt"],
    intent: "commercial",
  },
  suites: {
    path: "/suites",
    primary: "Luxury Nile Cruise Suites",
    secondary: ["Hathor suites collection", "Nile view suites"],
    intent: "commercial",
  },
  luxurySuiteProduct: {
    path: "/rooms",
    primary: "Hathor Luxury Suite",
    secondary: ["46 m² Nile suite", "accessible Dahabiya suite"],
    intent: "commercial",
  },
  royalSuites: {
    path: "/royal-suites",
    primary: "Royal Suite Nile Cruise",
    secondary: ["Hathor Royal Suite", "panoramic Nile royal suite"],
    intent: "commercial",
  },
  scheduled: {
    path: "/cruises-list",
    primary: "Book Hathor Dahabiya sailing",
    secondary: ["scheduled Nile cruise departures"],
    intent: "transactional",
  },
  blogs: {
    path: "/blogs",
    primary: "Dahabiya Nile cruise journal",
    secondary: ["Egypt travel stories", "Luxor Aswan guides"],
    intent: "informational",
  },
  about: {
    path: "/about",
    primary: "About Hathor Dahabiya",
    secondary: ["Hathor cruise story"],
    intent: "informational",
  },
  contact: {
    path: "/contact",
    primary: "Contact Hathor Dahabiya",
    secondary: ["Nile cruise reservations Egypt"],
    intent: "transactional",
  },
} as const satisfies Record<string, SeoIntent>;

export const VOYAGE_ROUTE_HREF: Record<string, string> = {
  "3-nights-aswan-luxor": "/voyages/aswan-to-luxor",
  "4-nights-luxor-aswan": "/voyages/luxor-to-aswan",
  "7-nights-luxor-aswan-luxor": "/voyages",
  "nile-majesty": "/charter",
};

export function voyageCommercialHref(slug: string): string {
  return VOYAGE_ROUTE_HREF[slug] ?? "/voyages";
}
