import { HATHOR_HERO_VIDEO_SRC } from "@/lib/branding";

export type VoyageFeatureId =
  | "inclusive"
  | "excursions"
  | "dining"
  | "butler";

export type VoyagePanelContent = {
  durationLabel: string;
  routeTitle: string;
  summary: string;
  railQuote: string;
  features: readonly { id: VoyageFeatureId; label: string }[];
  highlights: readonly string[];
  priceCaption: string;
  detailsLabel: string;
  detailsHref: string;
  enquireLabel: string;
  watchLabel: string;
  watchHref: string;
};

const SHARED_FEATURES = [
  { id: "inclusive" as const, label: "All Inclusive" },
  { id: "excursions" as const, label: "Private Excursions" },
  { id: "dining" as const, label: "World-Class Dining" },
  { id: "butler" as const, label: "Butler Service" },
] as const;

const CHARTER_FEATURES = [
  { id: "inclusive" as const, label: "Private Charter" },
  { id: "excursions" as const, label: "Custom Excursions" },
  { id: "dining" as const, label: "Private Dining" },
  { id: "butler" as const, label: "Dedicated Crew" },
] as const;

const PANEL_BY_SLUG: Record<string, VoyagePanelContent> = {
  "3-nights-aswan-luxor": {
    durationLabel: "3 Nights / 4 Days",
    routeTitle: "Aswan to Luxor",
    summary:
      "An intimate south-to-north passage — Philae, Kom Ombo, and Edfu unfold at a dahabiya’s unhurried pace, ending among Luxor’s temples.",
    railQuote: "Four days on the Nile. A lifetime of golden light.",
    features: SHARED_FEATURES,
    highlights: [
      "Philae Temple by private boat",
      "Kom Ombo at golden hour",
      "Edfu Temple of Horus",
    ],
    priceCaption: "Per Cabin",
    detailsLabel: "View Details",
    detailsHref: "/cruises",
    enquireLabel: "Book Now",
    watchLabel: "Watch Journey",
    watchHref: HATHOR_HERO_VIDEO_SRC,
  },
  "4-nights-luxor-aswan": {
    durationLabel: "4 Nights / 5 Days",
    routeTitle: "Luxor to Aswan",
    summary:
      "The classic Nile voyage from Luxor’s monumental banks to Aswan’s quiet grace — temples, feluccas, and evenings lit by river sunset.",
    railQuote: "Sail the classic Nile. Arrive forever changed.",
    features: SHARED_FEATURES,
    highlights: [
      "Valley of the Kings",
      "Karnak & Luxor Temples",
      "Edfu & Kom Ombo",
      "Philae Temple",
    ],
    priceCaption: "Per Cabin",
    detailsLabel: "View Details",
    detailsHref: "/cruises",
    enquireLabel: "Book Now",
    watchLabel: "Watch Journey",
    watchHref: HATHOR_HERO_VIDEO_SRC,
  },
  "7-nights-luxor-aswan-luxor": {
    durationLabel: "7 Nights / 8 Days",
    routeTitle: "Luxor to Aswan to Luxor",
    summary:
      "The ultimate Nile experience. Drift between Luxor and Aswan in absolute privacy, discovering ancient wonders at your own pace aboard Hathor.",
    railQuote:
      "A week of discovery. A lifetime of extraordinary memories.",
    features: SHARED_FEATURES,
    highlights: [
      "Valley of the Kings (Private Access)",
      "Philae Temple by Private Felucca",
      "Sunset Soirée on the Nile",
      "Gourmet Dining Experiences",
    ],
    priceCaption: "Per Cabin",
    detailsLabel: "View Details",
    detailsHref: "/cruises",
    enquireLabel: "Book Now",
    watchLabel: "Watch Journey",
    watchHref: HATHOR_HERO_VIDEO_SRC,
  },
  "nile-majesty": {
    durationLabel: "Private Charter",
    routeTitle: "Nile Majesty",
    summary:
      "The dahabiya entirely yours — itinerary, dining, and shore days composed around your party with Hathor’s dedicated crew.",
    railQuote: "Your river. Your rhythm. Entirely yours.",
    features: CHARTER_FEATURES,
    highlights: [
      "Fully private dahabiya",
      "Custom itinerary design",
      "Dedicated crew & butler",
      "Exclusive private dining",
    ],
    priceCaption: "Charter From",
    detailsLabel: "View Details",
    detailsHref: "/charter",
    enquireLabel: "Book Now",
    watchLabel: "Watch Journey",
    watchHref: HATHOR_HERO_VIDEO_SRC,
  },
};

function parseDurationAndRoute(name: string): {
  durationLabel: string;
  routeTitle: string;
} {
  const parts = name.split(/\s*[—–]\s*/);
  if (parts.length >= 2) {
    return {
      durationLabel: parts[0]!.trim(),
      routeTitle: parts.slice(1).join(" — ").trim(),
    };
  }
  const slash = name.match(/^(.+?\bDays?)\s*[-–—]\s*(.+)$/i);
  if (slash) {
    return {
      durationLabel: slash[1]!.trim(),
      routeTitle: slash[2]!.trim(),
    };
  }
  return { durationLabel: "Voyage", routeTitle: name };
}

/** Resolve open-panel copy for a voyage; falls back from name/description. */
export function resolveVoyagePanelContent(input: {
  slug: string;
  name: string;
  description: string;
  href?: string;
}): VoyagePanelContent {
  const known = PANEL_BY_SLUG[input.slug];
  if (known) {
    return {
      ...known,
      detailsHref: input.href ?? known.detailsHref,
      /* Prefer curated open-panel copy; fall back to cruise description. */
      summary: known.summary || input.description.trim(),
    };
  }

  const parsed = parseDurationAndRoute(input.name);
  return {
    durationLabel: parsed.durationLabel,
    routeTitle: parsed.routeTitle,
    summary:
      input.description.trim() ||
      "Sail the Nile aboard Hathor — intimate, all-inclusive, and composed at a dahabiya’s pace.",
    railQuote: "Private dahabiya itineraries on the Nile.",
    features: SHARED_FEATURES,
    highlights: [
      "Temple visits with private guides",
      "Panoramic Nile sailing",
      "Gourmet dining on board",
      "Butler & crew service",
    ],
    priceCaption: "Per Cabin",
    detailsLabel: "View Details",
    detailsHref: input.href ?? "/cruises",
    enquireLabel: "Book Now",
    watchLabel: "Watch Journey",
    watchHref: HATHOR_HERO_VIDEO_SRC,
  };
}

export function formatVoyageFromPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
