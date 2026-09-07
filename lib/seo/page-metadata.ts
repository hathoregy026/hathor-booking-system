import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SEO_KEYWORD_MAP } from "@/lib/seo/keyword-map";

export const HOME_SEO = buildPageMetadata({
  title: "Luxury Dahabiya Nile Cruise | Hathor Dahabiya",
  description:
    "Sail a private luxury Dahabiya on the Nile between Luxor and Aswan. Twelve guests, Nile-view suites, fine dining and unhurried temple days aboard Hathor.",
  path: SEO_KEYWORD_MAP.home.path,
  keywords: [
    "Luxury Dahabiya Nile Cruise",
    "Hathor Dahabiya",
    "private Nile sailing Egypt",
  ],
  image: {
    url: HATHOR_HERO_POSTER_SRC,
    width: 1920,
    height: 1080,
    alt: "Hathor Dahabiya, a luxury Dahabiya Nile cruise between Luxor and Aswan",
  },
});

export const VOYAGES_SEO = buildPageMetadata({
  title: "Nile Cruise Voyages from Luxor and Aswan | Hathor Dahabiya",
  description:
    "Choose a Hathor Dahabiya itinerary between Luxor and Aswan — three, four or seven nights of private sailing, temple visits and all-inclusive life aboard.",
  path: SEO_KEYWORD_MAP.voyages.path,
  keywords: [
    "Nile cruise itineraries",
    "Luxor Aswan dahabiya voyage",
    "Hathor Nile cruise",
  ],
});

export const LUXOR_TO_ASWAN_SEO = buildPageMetadata({
  title: "Luxor to Aswan Nile Cruise | Hathor Dahabiya",
  description:
    "The classic four-night Luxor to Aswan Nile cruise aboard Hathor Dahabiya — Karnak, the Valley of the Kings, Edfu, Kom Ombo and Philae at a private sailing pace.",
  path: SEO_KEYWORD_MAP.luxorToAswan.path,
  keywords: [
    "Luxor to Aswan Nile Cruise",
    "4 night Luxor Aswan dahabiya",
    "Hathor Luxor to Aswan",
  ],
});

export const ASWAN_TO_LUXOR_SEO = buildPageMetadata({
  title: "Aswan to Luxor Nile Cruise | Hathor Dahabiya",
  description:
    "A three-night Aswan to Luxor Nile cruise on Hathor Dahabiya — Philae, Kom Ombo and Edfu, then Luxor’s temples, with just twelve guests aboard.",
  path: SEO_KEYWORD_MAP.aswanToLuxor.path,
  keywords: [
    "Aswan to Luxor Nile Cruise",
    "3 night Aswan Luxor dahabiya",
    "Hathor Aswan to Luxor",
  ],
});

export const CHARTER_SEO = buildPageMetadata({
  title: "Private Nile Cruise Egypt | Hathor Dahabiya Charter",
  description:
    "Charter Hathor Dahabiya for a private Nile cruise in Egypt. The entire vessel, a dedicated crew and a tailored Luxor–Aswan itinerary for your party alone.",
  path: SEO_KEYWORD_MAP.charter.path,
  keywords: [
    "Private Nile Cruise Egypt",
    "Private Dahabiya Charter",
    "exclusive Nile boat charter",
  ],
  image: {
    url: "/media/hathor/r2/charter-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Private Hathor Dahabiya charter sailing the Nile in Egypt",
  },
});

export const CABINS_SEO = buildPageMetadata({
  title: "Luxury Nile Cruise Cabins and Rooms | Hathor Dahabiya",
  description:
    "Twenty-two square metre Nile-view cabins aboard Hathor Dahabiya — king or twin rooms with quiet proportions, river light and Hathor’s considered comforts.",
  path: SEO_KEYWORD_MAP.cabins.path,
  keywords: [
    "Luxury Nile Cruise Cabins",
    "Luxury Nile Cruise Rooms",
    "Dahabiya cabins Egypt",
  ],
  image: {
    url: "/media/hathor/r2/cabins-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Luxury Nile cruise cabin aboard Hathor Dahabiya",
  },
});

export const SUITES_SEO = buildPageMetadata({
  title: "Luxury Nile Cruise Suites | Hathor Dahabiya",
  description:
    "Discover Hathor’s Nile cruise suites: generous river residences with panoramic glass, private comfort and the quieter scale of a twelve-guest Dahabiya.",
  path: SEO_KEYWORD_MAP.suites.path,
  keywords: [
    "Luxury Nile Cruise Suites",
    "Hathor suites",
    "Nile view suites Egypt",
  ],
  image: {
    url: "/media/hathor/optimized/scraped-suites-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Luxury suites aboard Hathor Dahabiya",
  },
});

export const ROOMS_SEO = buildPageMetadata({
  title: "Hathor Luxury Suite | 46 m² Nile Cruise Suite",
  description:
    "The Hathor Luxury Suite is a 46 m² Nile residence with panoramic river views, expressive interiors and a private Jacuzzi — composed for four guests.",
  path: SEO_KEYWORD_MAP.luxurySuiteProduct.path,
  keywords: [
    "Hathor Luxury Suite",
    "46 m² Nile suite",
    "Dahabiya luxury suite Egypt",
  ],
  image: {
    url: "/media/hathor/scraped/suites-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Hathor Luxury Suite with panoramic Nile views",
  },
});

export const ROYAL_SUITES_SEO = buildPageMetadata({
  title: "Royal Suite Nile Cruise | Hathor Dahabiya",
  description:
    "Hathor’s Royal Suite is a 56 m² Nile residence with Main Deck views, two bathrooms and the most private accommodation on this luxury Dahabiya cruise.",
  path: SEO_KEYWORD_MAP.royalSuites.path,
  keywords: [
    "Royal Suite Nile Cruise",
    "Hathor Royal Suite",
    "panoramic Nile royal suite",
  ],
  image: {
    url: "/media/hathor/r2/room-royal.webp",
    width: 1920,
    height: 1280,
    alt: "Royal suite with panoramic Nile views aboard Hathor Dahabiya",
  },
});

export const CRUISES_LIST_SEO = buildPageMetadata({
  title: "Scheduled Hathor Sailings | Book a Dahabiya Nile Cruise",
  description:
    "Browse departure dates and cabin availability for Hathor Dahabiya — three, four and seven-night Nile sailings between Luxor and Aswan.",
  path: SEO_KEYWORD_MAP.scheduled.path,
  keywords: [
    "book Dahabiya Nile cruise",
    "Hathor sailing dates",
    "Luxor Aswan cruise availability",
  ],
});

export const BLOGS_SEO = buildPageMetadata({
  title: "Nile Cruise Journal | Hathor Dahabiya Stories",
  description:
    "Guides and stories from the Nile: when to sail a Dahabiya, Luxor and Aswan temples, packing, cabins and the slower rhythm of Hathor voyages.",
  path: SEO_KEYWORD_MAP.blogs.path,
  keywords: [
    "Dahabiya Nile cruise journal",
    "Egypt travel stories",
    "Luxor Aswan cruise guide",
  ],
  image: {
    url: "/media/hathor/r2/blog-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Hathor Journal stories from the Nile in Egypt",
  },
});

export const ABOUT_SEO = buildPageMetadata({
  title: "About Hathor Dahabiya | A Private Nile Sailing",
  description:
    "Hathor is a twelve-guest luxury Dahabiya: eight cabins, two suites and two Royal Suites, sailing the Nile between Luxor and Aswan with a dedicated crew.",
  path: SEO_KEYWORD_MAP.about.path,
  keywords: ["About Hathor Dahabiya", "Hathor cruise story", "twelve guest dahabiya"],
});

export const CONTACT_SEO = buildPageMetadata({
  title: "Contact Hathor Dahabiya | Nile Cruise Reservations",
  description:
    "Speak with Hathor reservations in Cairo for voyage dates, private charter and suite availability. Daily 09:00–17:00, closed Fridays.",
  path: SEO_KEYWORD_MAP.contact.path,
  keywords: [
    "Contact Hathor Dahabiya",
    "Nile cruise reservations Egypt",
    "Hathor charter enquiry",
  ],
});

export const HIGHLIGHTS_SEO = buildPageMetadata({
  title: "Nile Cruise Highlights | Temples Between Luxor and Aswan",
  description:
    "Shore days on a Hathor Dahabiya: Karnak, the Valley of the Kings, Edfu, Kom Ombo and Philae — composed as unhurried visits, not a checklist.",
  path: "/highlights",
  keywords: [
    "Nile cruise highlights",
    "Luxor Aswan temples",
    "Hathor shore excursions",
  ],
  image: {
    url: "/media/hathor/r2/highlights-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Temple highlights along a Hathor Dahabiya Nile cruise",
  },
});

export const WELLNESS_SEO = buildPageMetadata({
  title: "Seneb Spa on the Nile | Hathor Dahabiya Wellness",
  description:
    "Seneb Spa and Historia Fitness aboard Hathor Dahabiya — restorative treatments and river-view movement between Luxor and Aswan.",
  path: "/wellness",
  keywords: ["Seneb Spa Nile", "Dahabiya spa Egypt", "Hathor wellness"],
});

export const GASTRONOMY_SEO = buildPageMetadata({
  title: "Dining on the Nile | Hathor Dahabiya Gastronomy",
  description:
    "Egyptian flavours and considered service aboard Hathor Dahabiya — indoor and deck dining shaped by the river between Luxor and Aswan.",
  path: "/gastronomy",
  keywords: ["Nile cruise dining", "Hathor Dahabiya restaurant", "Egypt river gastronomy"],
});

export const PARTNERS_SEO = buildPageMetadata({
  title: "Travel Partners | Hathor Dahabiya",
  description:
    "The travel and hospitality partners who share Hathor Dahabiya’s standard for private Nile journeys and guest care in Egypt.",
  path: "/partners",
  keywords: ["Hathor Dahabiya partners", "Egypt luxury travel trade"],
});

export const HOME_THREE_SEO = buildPageMetadata({
  title: "Hathor Dahabiya Chart | Twelve Guests on the Nile",
  description:
    "An editorial chart of Hathor Dahabiya: twelve guests, three itinerary lengths, suites and shore days between Luxor and Aswan.",
  path: "/home-3",
  index: false,
  keywords: ["Hathor Dahabiya chart"],
});
