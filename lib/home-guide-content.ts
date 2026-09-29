import { HATHOR_CRUISES, type HathorCruiseSeed } from "@/lib/hathor-catalog";
import { voyageCommercialHref } from "@/lib/seo/keyword-map";

/**
 * The homepage's "Dahabiya Nile cruise" guide: the plain answers a searcher
 * wants before booking, set on the page itself. The visible FAQ and the
 * FAQPage structured data both read this module, so the markup can never
 * describe questions a visitor cannot see. Every fact here is one the site
 * already states elsewhere (catalogue, voyages page, booking flow).
 */

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

/** Lowest cabin price for a voyage (the catalogue's; the booking engine charges the same). */
export function voyageFromCents(cruise: HathorCruiseSeed): number {
  return Math.min(...cruise.rooms.map((room) => room.priceCents));
}

const WORD_NIGHTS: Record<number, string> = { 3: "Three", 4: "Four", 7: "Seven" };

export type GuideVoyage = {
  slug: string;
  href: string;
  nights: number;
  days: number;
  /** "Three nights" */
  nightsLabel: string;
  /** "Aswan to Luxor", or "Luxor to Aswan and back" for the round trip */
  route: string;
  departureDay: string;
  fromCents: number;
};

export const GUIDE_VOYAGES: GuideVoyage[] = HATHOR_CRUISES.map((cruise) => {
  const stops = cruise.ports.split("→").map((stop) => stop.trim());
  return {
    slug: cruise.slug,
    href: voyageCommercialHref(cruise.slug),
    nights: cruise.nights,
    days: cruise.days,
    nightsLabel: `${WORD_NIGHTS[cruise.nights] ?? cruise.nights} nights`,
    route:
      stops.length > 2
        ? `${stops[0]} to ${stops[1]} and back`
        : `${stops[0]} to ${stops[1]}`,
    departureDay: cruise.departureDay,
    fromCents: voyageFromCents(cruise),
  };
});

const byNights = (nights: number) =>
  GUIDE_VOYAGES.find((voyage) => voyage.nights === nights);

function priceAnswer(): string {
  const three = byNights(3);
  const four = byNights(4);
  const seven = byNights(7);
  if (!three || !four || !seven) {
    return "Prices are per cabin for the whole voyage, with taxes and service charges included.";
  }
  return (
    `Cabins start from ${usd(three.fromCents)} for three nights from Aswan to Luxor, ` +
    `${usd(four.fromCents)} for four nights from Luxor to Aswan and ` +
    `${usd(seven.fromCents)} for the seven-night round trip. Prices are per cabin for ` +
    "the whole voyage, with taxes and service charges included; suites and Royal Suites are priced above the cabins."
  );
}

export const GUIDE_INTRO =
  "A dahabiya Nile cruise travels the river the traditional way: a sailing boat, a handful of guests, and the Nile between Luxor and Aswan at an unhurried pace. Hathor carries 32 guests in twelve cabins and suites, so she moors at quiet banks the floating hotels sail past.";

export type GuideQuestion = {
  question: string;
  answer: string;
  /** optional onward link, shown on the page only */
  link?: { href: string; label: string };
};

export const GUIDE_FAQ: GuideQuestion[] = [
  {
    question: "What is a dahabiya Nile cruise?",
    answer:
      "A dahabiya is a traditional Egyptian sailing boat. Because a dahabiya travels under sail rather than engine and carries very few guests, it moors at quieter anchorages than a large Nile cruiser can reach, and the days follow the river rather than a timetable.",
    link: {
      href: "/blogs/what-is-a-dahabiya-nile-cruise-complete-beginner-guide",
      label: "The complete guide",
    },
  },
  {
    question: "How much does a dahabiya Nile cruise on Hathor cost?",
    answer: priceAnswer(),
    link: { href: "/cruises-list", label: "Sailing dates and prices" },
  },
  {
    question: "What is included in the price?",
    answer:
      "Fine dining and selected beverages, guided temple visits and shore days, and attentive service from embarkation to farewell. Taxes and service charges are included in the cabin price.",
    link: {
      href: "/blogs/dahabiya-cruise-cost-explained-whats-included",
      label: "What is included, in full",
    },
  },
  {
    question: "Where does Hathor sail, and for how long?",
    answer:
      "Between Luxor and Aswan, mooring at Esna, Edfu and Kom Ombo. Choose three nights from Aswan to Luxor, departing on Wednesdays; four nights from Luxor to Aswan, departing on Saturdays; or the seven-night round trip from Luxor, departing on Saturdays.",
    link: { href: "/voyages", label: "All voyages" },
  },
  {
    question: "How many guests does Hathor carry?",
    answer:
      "32 guests. Hathor is arranged across three decks with eight cabins of 22 sqm, two suites of 46 sqm and two Royal Suites of 56 sqm.",
    link: { href: "/luxury-cabins-Nile-Cruise", label: "The cabins and suites" },
  },
  {
    question: "How is a dahabiya different from a Nile cruise ship?",
    answer:
      "A Nile cruise ship usually carries a hundred guests or more; Hathor carries 32. A dahabiya draws little more than a metre, so she ties up at banks with no dock at all and reaches moorings the big ships pass by.",
    link: {
      href: "/blogs/nile-cruise-or-luxury-dahabiya-which-one-to-choose",
      label: "Nile cruise or dahabiya",
    },
  },
  {
    question: "Can we charter the whole dahabiya?",
    answer:
      "Yes. Private charter gives your group exclusive use of Hathor, with the itinerary, dining and shore days shaped around your party.",
    link: { href: "/charter", label: "Private charter" },
  },
];

export const guideUsd = usd;
