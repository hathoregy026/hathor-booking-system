import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import type { SiteImageName } from "@/lib/site-image-slots";

export const VOYAGES_PAGE = {
  hero: {
    title: "Our Voyages",
    secondTitle: "The Nile",
    subtitle:
      "Private dahabiya itineraries — intimate sailings, legendary ports, and the unhurried rhythm of the river.",
  },
  opening: {
    eyebrow: "Hathor Voyages",
    title: "Sail at a dahabiya's pace",
    script: "Four days on the Nile. A lifetime of golden light.",
    body: [
      "Every Hathor voyage is composed for discovery without hurry — temples at golden hour, evenings lit by river sunset, and shore days shaped around your party.",
      "From intimate three-night passages to the complete seven-night round trip, each itinerary carries the same promise: all-inclusive luxury, private excursions, and crew who know the Nile by heart.",
    ],
    primaryCta: { label: "View All Itineraries", href: "/cruises-list" },
    secondaryCta: { label: "Enquire Now", href: "/contact" },
  },
  manifesto: [
    {
      numeral: "I",
      title: "Intimate scale",
      body: "A handful of cabins — never a floating hotel. Hathor moves with the current, not the crowd.",
    },
    {
      numeral: "II",
      title: "All-inclusive grace",
      body: "Gourmet dining, premium beverages, and shore excursions woven into every sailing.",
    },
    {
      numeral: "III",
      title: "Private rhythm",
      body: "Temples when the light is right. Deck time when the river asks you to stay.",
    },
  ],
  features: {
    eyebrow: "Included aboard",
    title: "Every voyage, fully composed",
    items: [
      {
        id: "inclusive",
        label: "All-Inclusive Luxury",
        body: "Fine dining, premium beverages, and attentive service from embarkation to farewell.",
      },
      {
        id: "excursions",
        label: "Private Excursions",
        body: "Temple visits and shore discoveries with guides who honour both history and your pace.",
      },
      {
        id: "dining",
        label: "World-Class Dining",
        body: "Egyptian flavours and international craft — breakfast light, lunches that linger, dinners under stars.",
      },
      {
        id: "butler",
        label: "Butler Service",
        body: "Discreet, anticipatory hospitality that makes every moment aboard feel personally arranged.",
      },
    ],
  },
  rhythm: {
    eyebrow: "River rhythm",
    title: "The day unfolds with the Nile",
    chapters: [
      {
        kicker: "Embark",
        title: "Golden departure",
        body: "Board at Aswan or Luxor. Settle into your suite as the banks slip past in amber light.",
        slot: "home-voyage-3n-aswan-luxor" as SiteImageName,
      },
      {
        kicker: "Discover",
        title: "Temples at your pace",
        body: "Philae, Kom Ombo, Edfu, Karnak — each shore day composed for wonder, not rush.",
        slot: "home-voyage-4n-luxor-aswan" as SiteImageName,
      },
      {
        kicker: "Unwind",
        title: "Deck & current",
        body: "Sun-warmed teak, soft current, and the quiet theatre of the river between discoveries.",
        slot: "highlights-lifestyle" as SiteImageName,
      },
      {
        kicker: "Arrive",
        title: "Forever changed",
        body: "Disembark with ancient wonders still warm in memory — and the river already calling you back.",
        slot: "home-voyage-7n-roundtrip" as SiteImageName,
      },
    ],
  },
  charter: {
    eyebrow: "Private charter",
    title: "Nile Majesty",
    script: "Your river. Your rhythm. Entirely yours.",
    body: "The dahabiya entirely yours — itinerary, dining, and shore days composed around your party with Hathor's dedicated crew.",
    cta: { label: "Explore Charter", href: "/charter" },
    image: "home-voyage-nile-majesty" as SiteImageName,
  },
  cta: {
    title: "Reserve your voyage",
    body: "Choose your itinerary, select your suite, and step aboard Hathor.",
    primary: "Book Now",
    secondary: { label: "Scheduled Voyages", href: "/cruises-list" },
  },
} as const;

export type VoyagesItineraryCms = {
  slug: string;
  title: string;
  durationLabel: string;
  meta: string;
  body: string;
  cta: string;
};

/** Four itinerary cards on /voyages — also supplies homepage Our Voyages summary/CTA. */
export const VOYAGES_ITINERARY_CMS_DEFAULTS: VoyagesItineraryCms[] = [
  {
    slug: "3-nights-aswan-luxor",
    title: "Aswan to Luxor",
    durationLabel: "3 Nights / 4 Days",
    meta: "Aswan → Luxor",
    body: "An intimate south-to-north passage — Philae, Kom Ombo, and Edfu unfold at a dahabiya’s unhurried pace, ending among Luxor’s temples.",
    cta: "Check Voyage Details",
  },
  {
    slug: "4-nights-luxor-aswan",
    title: "Luxor to Aswan",
    durationLabel: "4 Nights / 5 Days",
    meta: "Luxor → Aswan",
    body: "The classic Nile voyage from Luxor’s monumental banks to Aswan’s quiet grace — temples, feluccas, and evenings lit by river sunset.",
    cta: "Check Voyage Details",
  },
  {
    slug: "7-nights-luxor-aswan-luxor",
    title: "Luxor to Aswan to Luxor",
    durationLabel: "7 Nights / 8 Days",
    meta: "Luxor → Aswan → Luxor",
    body: "The ultimate Nile experience. Drift between Luxor and Aswan in absolute privacy, discovering ancient wonders at your own pace aboard Hathor.",
    cta: "Check Voyage Details",
  },
  {
    slug: "nile-majesty",
    title: "Nile Majesty",
    durationLabel: "Private charter",
    meta: "Custom itinerary",
    body: "The dahabiya entirely yours — itinerary, dining, and shore days composed around your party with Hathor’s dedicated crew.",
    cta: "Explore private charter",
  },
];

export function resolveVoyagesItineraryCms(
  list: readonly VoyagesItineraryCms[] | undefined,
  slug: string,
  index: number,
): VoyagesItineraryCms {
  const fallback =
    VOYAGES_ITINERARY_CMS_DEFAULTS[index] ?? VOYAGES_ITINERARY_CMS_DEFAULTS[0]!;
  if (!list || list.length === 0) return fallback;
  const bySlug = slug
    ? list.find((item) => item.slug === slug)
    : undefined;
  return bySlug ?? list[index] ?? fallback;
}

const CHARTER_VOYAGE: HomepageAccordionCruise = {
  id: "catalog-nile-majesty",
  name: "Private Charter — Nile Majesty",
  description:
    "The dahabiya entirely yours — itinerary, dining, and shore days composed around your party with Hathor's dedicated crew.",
  imageName: "home-voyage-nile-majesty",
  ports: "Custom itinerary",
  basePriceCents: 0,
  roomCount: 1,
  slug: "nile-majesty",
  romanNumeral: "IV",
  meta: "PRIVATE CHARTER · CUSTOM ITINERARY",
  href: "/charter",
};

/** Ensure all four homepage voyages appear on the dedicated page (incl. charter). */
export function buildVoyagesPageItems(
  cruises: HomepageAccordionCruise[],
): HomepageAccordionCruise[] {
  const bySlug = new Map<string, HomepageAccordionCruise>();

  for (const cruise of cruises) {
    bySlug.set(cruise.slug, cruise);
  }

  if (!bySlug.has("nile-majesty")) {
    bySlug.set("nile-majesty", CHARTER_VOYAGE);
  }

  const order = [
    "3-nights-aswan-luxor",
    "4-nights-luxor-aswan",
    "7-nights-luxor-aswan-luxor",
    "nile-majesty",
  ];

  const ordered = order
    .map((slug) => bySlug.get(slug))
    .filter((item): item is HomepageAccordionCruise => Boolean(item))
    .map((item) => ({
      ...item,
      href: item.slug === "nile-majesty" ? "/charter" : "/cruises-list",
    }));

  if (ordered.length > 0) return ordered;

  return HATHOR_CRUISES.map((cruise, index) => ({
    id: `catalog-${cruise.slug}`,
    name: cruise.name,
    description: cruise.description,
    imageName: (
      [
        "home-voyage-3n-aswan-luxor",
        "home-voyage-4n-luxor-aswan",
        "home-voyage-7n-roundtrip",
        "home-voyage-nile-majesty",
      ] as SiteImageName[]
    )[index % 4]!,
    ports: cruise.ports,
    basePriceCents: cruise.basePriceCents,
    roomCount: cruise.rooms.length,
    slug: cruise.slug,
    romanNumeral: ["I", "II", "III", "IV"][index] ?? String(index + 1),
    meta: `${cruise.rooms.length} CABINS · BASE ${formatUsd(cruise.basePriceCents)}`,
    href: "/cruises-list",
  })).concat([CHARTER_VOYAGE]);
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
