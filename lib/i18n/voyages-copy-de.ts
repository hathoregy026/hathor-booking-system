/** The Voyages pages' own words that are not dashboard text, in German. */
import { voyageNameIn } from "@/lib/i18n/catalog-copy";
import type { VoyagesCopy } from "@/lib/i18n/voyages-copy";

const SLOT_ALTS_DE: Record<string, string> = {
  "home-voyage-3n-aswan-luxor": "Die Reise mit 3 Nächten / 4 Tagen von Assuan nach Luxor an Bord der Hathor",
  "home-voyage-4n-luxor-aswan": "Die Reise mit 4 Nächten / 5 Tagen von Luxor nach Assuan an Bord der Hathor",
  "home-voyage-7n-roundtrip": "Die Rundreise mit 7 Nächten / 8 Tagen von Luxor nach Assuan und zurück an Bord der Hathor",
};

export const VOYAGES_COPY_DE: VoyagesCopy = {
  runLabel: "Die Reisen der Hathor",
  alts: {
    goldenHour: "Die Hathor in der goldenen Stunde",
    sailing: "Die Hathor auf dem Nil",
    deckLife: "Das Leben an Deck",
    quietLife: "Ruhiges Leben an Bord der Hathor",
    table: "Ein gedeckter Tisch an Bord der Hathor",
    restaurant: "Das Restaurant der Hathor",
    suite: "Eine Suite der Hathor",
    royalSuite: "Die Royal Suite",
    craft: "Das Handwerk der Hathor",
    landscape: "Die Landschaft am Nil",
    river: "Der Fluss von der Hathor aus",
    suiteAboard: "Eine Suite an Bord der Hathor",
    charter: "Privatcharter der Hathor",
    nileGoldenHour: "Der Nil in der goldenen Stunde",
  },
  voyageName: (slug, fallback) => voyageNameIn("de", slug, fallback),
  slotAlt: (slot) => SLOT_ALTS_DE[slot] ?? "",
};
