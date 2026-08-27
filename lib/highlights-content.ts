/**
 * Highlights page enrichment — CMS still owns titles/bodies.
 *
 * LANDMARK IMAGE PRECEDENCE (see lib/landmark-image-safety.ts):
 * 1. Valid landmark-specific CMS asset (non-vessel)
 * 2. Accurate local landmark-*.webp fallback
 * 3. Documented placeholder only — never hospitality photography
 *
 * ATTRIBUTION — Wikimedia-derived local defaults (NOT cleared for production deploy):
 * Resolve license + author credit before shipping these files publicly.
 * | Slot | Commons file | Subject |
 * | landmark-obelisk | File:Unfinished_obelisk.jpg | Unfinished Obelisk, Aswan |
 * | landmark-hatshepsut | File:Temple_of_Hatshepsut.jpg | Temple of Hatshepsut |
 * | landmark-valley-kings | File:Thebes, Luxor, Egypt, Valley of the Kings from above.jpg | Valley of the Kings |
 */

export const LANDMARK_ASSET_ATTRIBUTION = [
  {
    slot: "landmark-obelisk",
    commonsFile: "Unfinished_obelisk.jpg",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Unfinished_obelisk.jpg",
    subject: "Unfinished Obelisk quarry, Aswan",
    deployStatus: "blocked-pending-license-attribution" as const,
  },
  {
    slot: "landmark-hatshepsut",
    commonsFile: "Temple_of_Hatshepsut.jpg",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Temple_of_Hatshepsut.jpg",
    subject: "Mortuary Temple of Hatshepsut, Deir el-Bahari",
    deployStatus: "blocked-pending-license-attribution" as const,
  },
  {
    slot: "landmark-valley-kings",
    commonsFile: "Thebes, Luxor, Egypt, Valley of the Kings from above.jpg",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Thebes,_Luxor,_Egypt,_Valley_of_the_Kings_from_above.jpg",
    subject: "Valley of the Kings from above, Luxor",
    deployStatus: "blocked-pending-license-attribution" as const,
  },
] as const;

export const HIGHLIGHTS_LANDMARK_SLOTS = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

export type HighlightsLandmarkSlot =
  (typeof HIGHLIGHTS_LANDMARK_SLOTS)[number];

export type HighlightsLandmarkMeta = {
  slot: HighlightsLandmarkSlot;
  category: string;
  location: string;
  voyage: string;
  fact: string;
  caption: string;
  objectPosition: string;
};

/** Index-aligned with HIGHLIGHTS_PAGE.landmarks / CMS landmarks array. */
export const HIGHLIGHTS_LANDMARK_META: HighlightsLandmarkMeta[] = [
  {
    slot: "landmark-obelisk",
    category: "Cultural Landmark",
    location: "Aswan",
    voyage: "Explore within selected Hathor itineraries.",
    fact: "More than 3,500 years old · nearly 42 metres if completed",
    caption: "Unfinished Obelisk quarry, Aswan",
    objectPosition: "50% 45%",
  },
  {
    slot: "landmark-hatshepsut",
    category: "Cultural Landmark",
    location: "Luxor West Bank · Deir el-Bahari",
    voyage: "Explore within selected Hathor itineraries.",
    fact: "Dedicated to Hatshepsut and Amun",
    caption: "Mortuary Temple of Hatshepsut",
    objectPosition: "50% 40%",
  },
  {
    slot: "landmark-valley-kings",
    category: "UNESCO World Heritage",
    location: "Luxor West Bank",
    voyage: "Explore within selected Hathor itineraries.",
    fact: "63 tombs discovered · resting place of pharaohs",
    caption: "Valley of the Kings, Luxor",
    objectPosition: "50% 50%",
  },
];

export const HIGHLIGHTS_JOURNEY_LINKS = [
  {
    label: "Luxor → Aswan",
    body: "Ancient landmarks and quiet river villages.",
    href: "/cruises-list",
  },
  {
    label: "Aswan → Luxor",
    body: "A south-to-north passage through the Nile’s living history.",
    href: "/cruises-list",
  },
  {
    label: "Private Charter",
    body: "An itinerary composed around your party.",
    href: "/charter",
  },
] as const;

export const HIGHLIGHTS_MANIFESTO = [
  {
    numeral: "I",
    title: "The River",
    body: "A slower rhythm shaped by water, light and silence.",
  },
  {
    numeral: "II",
    title: "The Landmarks",
    body: "Ancient places encountered with time, context and grace.",
  },
  {
    numeral: "III",
    title: "The Return",
    body: "A private sanctuary waiting after every day of discovery.",
  },
] as const;

export const HIGHLIGHTS_PRINCIPLES = [
  {
    numeral: "I",
    title: "Private by design",
    body: "Intimate Dahabiya sailing, with cabins and suites composed for Nile light and unhurried hospitality.",
  },
  {
    numeral: "II",
    title: "Temples by day",
    body: "Ancient wonders paced with grace, followed by the quiet of the river aboard Hathor.",
  },
  {
    numeral: "III",
    title: "Voyage-native",
    body: "Dining, rest and service respond naturally to the rhythm between Luxor and Aswan.",
  },
] as const;

const PULL_QUOTE_FALLBACK =
  "There is not a detail, no matter how small, that goes overlooked.";

/** Prefer the CMS sentence when present; otherwise use the brand fallback. */
export function extractHighlightsPullQuote(intro: string[]): string {
  for (const paragraph of intro) {
    const match = paragraph.match(
      /There is not a detail[^.]*\./i,
    );
    if (match?.[0]) {
      return match[0].replace(/unlooked on/i, "overlooked").trim();
    }
  }
  return PULL_QUOTE_FALLBACK;
}

export type HighlightsIntroLayout = {
  /** Opening lead (first sentence of CMS intro when available). */
  lead: string;
  /** Remaining SEO copy in editorial groups. */
  groups: string[][];
};

/**
 * Split SEO intro into lead + editorial groups without deleting copy.
 * Group 1: vessel / privacy · Group 2: sailing · Group 3: gastronomy / hospitality
 */
export function layoutHighlightsIntro(intro: string[]): HighlightsIntroLayout {
  if (!intro.length) {
    return {
      lead: "Immerse yourself in the mystique of the River Nile aboard a Dahabiya created for elegance, privacy and unhurried discovery.",
      groups: [],
    };
  }

  const first = intro[0] ?? "";
  const rest = intro.slice(1).join(" ");

  const sentences = first
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const lead =
    sentences[0] ??
    "Immerse yourself in the mystique of the River Nile aboard a Dahabiya created for elegance, privacy and unhurried discovery.";

  const remaining = sentences.slice(1);
  const group1: string[] = [];
  const group2: string[] = [];

  for (const sentence of remaining) {
    const lower = sentence.toLowerCase();
    if (
      lower.includes("sails") ||
      lower.includes("sailing") ||
      lower.includes("hidden gems") ||
      lower.includes("away from the crowds")
    ) {
      group2.push(sentence);
    } else {
      group1.push(sentence);
    }
  }

  const group3 = rest
    ? rest
        .replace(/\s*There is not a detail[^.]*\.\s*/i, " ")
        .split(/(?<=\.)\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    lead,
    groups: [group1, group2, group3].filter((g) => g.length > 0),
  };
}
