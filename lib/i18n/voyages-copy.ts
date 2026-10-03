/**
 * The Voyages pages' own words that are not dashboard text — image
 * descriptions, the section label and the itinerary names used as alt text.
 * English is the live copy, character for character.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

export type VoyagesCopy = {
  runLabel: string;
  alts: {
    goldenHour: string;
    sailing: string;
    deckLife: string;
    quietLife: string;
    table: string;
    restaurant: string;
    suite: string;
    royalSuite: string;
    craft: string;
    landscape: string;
    river: string;
    suiteAboard: string;
    charter: string;
    nileGoldenHour: string;
  };
  /** Itinerary photograph alt: the voyage's name in this language. */
  voyageName: (slug: string, fallback: string) => string;
  /** Hover photographs in "The promise": empty keeps the dashboard description. */
  slotAlt: (slot: string) => string;
};

const VOYAGE_NAMES_IT: Record<string, string> = {
  "3-nights-aswan-luxor": "3 notti / 4 giorni — da Assuan a Luxor",
  "4-nights-luxor-aswan": "4 notti / 5 giorni — da Luxor ad Assuan",
  "7-nights-luxor-aswan-luxor": "7 notti / 8 giorni — da Luxor ad Assuan e ritorno",
  "nile-majesty": "Charter privato — Nile Majesty",
};

const SLOT_ALTS_IT: Record<string, string> = {
  "home-voyage-3n-aswan-luxor": "Il viaggio di 3 notti / 4 giorni da Assuan a Luxor a bordo di Hathor",
  "home-voyage-4n-luxor-aswan": "Il viaggio di 4 notti / 5 giorni da Luxor ad Assuan a bordo di Hathor",
  "home-voyage-7n-roundtrip": "Il viaggio di 7 notti / 8 giorni da Luxor ad Assuan e ritorno a bordo di Hathor",
};

export const VOYAGES_COPY: Record<PublicLocale, VoyagesCopy> = {
  en: {
    runLabel: "Hathor voyages",
    alts: {
      goldenHour: "Hathor at golden hour",
      sailing: "Hathor sailing the Nile",
      deckLife: "Life on deck",
      quietLife: "Quiet life aboard Hathor",
      table: "A table prepared aboard Hathor",
      restaurant: "Hathor restaurant",
      suite: "A Hathor suite",
      royalSuite: "The Royal Suite",
      craft: "The craft of Hathor",
      landscape: "The Nile landscape",
      river: "The river from Hathor",
      suiteAboard: "A suite aboard Hathor",
      charter: "Hathor private charter",
      nileGoldenHour: "The Nile at golden hour",
    },
    voyageName: (_slug, fallback) => fallback,
    slotAlt: () => "",
  },
  it: {
    runLabel: "I viaggi di Hathor",
    alts: {
      goldenHour: "Hathor all’ora dorata",
      sailing: "Hathor in navigazione sul Nilo",
      deckLife: "La vita sul ponte",
      quietLife: "La vita tranquilla a bordo di Hathor",
      table: "Una tavola apparecchiata a bordo di Hathor",
      restaurant: "Il ristorante di Hathor",
      suite: "Una suite di Hathor",
      royalSuite: "La Royal Suite",
      craft: "L’artigianalità di Hathor",
      landscape: "Il paesaggio del Nilo",
      river: "Il fiume visto da Hathor",
      suiteAboard: "Una suite a bordo di Hathor",
      charter: "Il charter privato di Hathor",
      nileGoldenHour: "Il Nilo all’ora dorata",
    },
    voyageName: (slug, fallback) => VOYAGE_NAMES_IT[slug] ?? fallback,
    slotAlt: (slot) => SLOT_ALTS_IT[slot] ?? "",
  },
};
