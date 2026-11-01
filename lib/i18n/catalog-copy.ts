/**
 * Catalog words shown on several pages (cruise listings, room pages): voyage
 * names, departure days, amenity sentences and their short captions. Cabin
 * and suite names (Luxury King Bed, Luxury Suite, Royal Suite…) are product
 * names and stay in English in every language.
 */

import {
  AMENITIES_DE,
  AMENITY_CAPTION_OVERRIDES_DE,
  AMENITY_KIND_CAPTIONS_DE,
  PLACES_DE,
  VOYAGE_NAMES_DE,
  WEEKDAYS_DE,
} from "@/lib/i18n/catalog-copy-de";
import { usdTextDe } from "@/lib/i18n/format-de";
import type { PublicLocale, TranslatedLocale } from "@/lib/i18n/locale";

type Words = Record<string, string>;

/** Voyage names by catalog slug. English keeps the catalog's own name. */
const VOYAGE_NAMES_IT: Record<string, string> = {
  "3-nights-aswan-luxor": "3 notti / 4 giorni — da Assuan a Luxor",
  "4-nights-luxor-aswan": "4 notti / 5 giorni — da Luxor ad Assuan",
  "7-nights-luxor-aswan-luxor": "7 notti / 8 giorni — da Luxor ad Assuan e ritorno",
  "nile-majesty": "Charter privato — Nile Majesty",
};

const VOYAGE_NAMES: Record<TranslatedLocale, Words> = { it: VOYAGE_NAMES_IT, de: VOYAGE_NAMES_DE };

export function voyageNameIn(locale: PublicLocale, slug: string, fallback: string): string {
  return locale === "en" ? fallback : (VOYAGE_NAMES[locale][slug] ?? fallback);
}

const PLACES_IT: Record<string, string> = { Aswan: "Assuan", Cairo: "Il Cairo" };
const PLACES: Record<TranslatedLocale, Words> = { it: PLACES_IT, de: PLACES_DE };

/**
 * A dollar amount written US-style ("$7,000", "$3,000.00") with the reader’s
 * separators: Italian reads "$7.000", "$3.000,00", like the home page fares;
 * German puts the currency last ("7.000 $"). Currency and amount never change.
 */
export function usdIn(locale: PublicLocale, formatted: string): string {
  if (locale === "en") return formatted;
  if (locale === "de") return usdTextDe(formatted);
  return formatted.replace(/[,.]/g, (mark) => (mark === "," ? "." : ","));
}

/** Place names inside a route or sentence ("Luxor → Aswan" → "Luxor → Assuan"). */
export function placesIn(locale: PublicLocale, text: string): string {
  if (locale === "en") return text;
  return text.replace(/\b(Aswan|Cairo)\b/g, (place) => PLACES[locale][place] ?? place);
}

const WEEKDAYS_IT: Record<string, string> = {
  Monday: "lunedì",
  Tuesday: "martedì",
  Wednesday: "mercoledì",
  Thursday: "giovedì",
  Friday: "venerdì",
  Saturday: "sabato",
  Sunday: "domenica",
};

const WEEKDAYS: Record<TranslatedLocale, Words> = { it: WEEKDAYS_IT, de: WEEKDAYS_DE };

/** A departure day as a word inside a sentence ("sabato"; English "Saturday"). */
export function weekdayIn(locale: PublicLocale, day: string): string {
  return locale === "en" ? day : (WEEKDAYS[locale][day] ?? day);
}

/** A departure day on its own, as a label ("Sabato"). */
export function weekdayLabelIn(locale: PublicLocale, day: string): string {
  const word = weekdayIn(locale, day);
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const AMENITIES_IT: Record<string, string> = {
  "LED Satellite Screen": "Schermo LED satellitare",
  "Bathtub or Walk-In Shower": "Vasca o doccia walk-in",
  "Safe box": "Cassaforte",
  "Tea & Coffee Facilities": "Set per tè e caffè",
  Telephone: "Telefono",
  "High-Speed Internet Access": "Internet ad alta velocità",
  "All cabins are non-smoking areas": "Tutte le cabine sono per non fumatori",
  "Panoramic Nile view": "Vista panoramica sul Nilo",
  "22 Square Metres": "22 metri quadrati",
  Minibar: "Minibar",
  "Laundry Service": "Servizio lavanderia",
  "Smart System": "Sistema smart",
  "Doctor On Call": "Medico reperibile",
  "Room Service": "Servizio in camera",
  "Air Conditioner": "Aria condizionata",
  "Hair Dryer": "Asciugacapelli",
  "Jacuzzi & dual toilets": "Jacuzzi e doppi servizi",
  "Hair dryer & mini bar": "Asciugacapelli e minibar",
  "Smart entertainment system": "Sistema di intrattenimento smart",
  "Room & laundry service": "Servizio in camera e lavanderia",
  "Air conditioning & high-speed Wi-Fi": "Aria condizionata e Wi-Fi ad alta velocità",
  "Jacuzzi & two luxurious bathrooms": "Jacuzzi e due bagni di lusso",
  "Coffee machine, mini bar, air conditioning": "Macchina del caffè, minibar, aria condizionata",
};

const AMENITIES: Record<TranslatedLocale, Words> = { it: AMENITIES_IT, de: AMENITIES_DE };

/** An amenity sentence in this language (the hover title and screen-reader text). */
export function amenityIn(locale: PublicLocale, label: string): string {
  return locale === "en" ? label : (AMENITIES[locale][label.trim()] ?? label);
}

export type AmenityCaption = { wide: string; tight: string };

/** Short captions by amenity kind (see RoomAmenityIcon), Italian. */
const AMENITY_KIND_CAPTIONS_IT: Record<string, AmenityCaption> = {
  screen: { wide: "TV", tight: "TV" },
  bath: { wide: "Vasca / Doccia", tight: "Bagno" },
  safe: { wide: "Cassaforte", tight: "Cassaforte" },
  coffee: { wide: "Tè e caffè", tight: "Caffè" },
  wifi: { wide: "Wi-Fi", tight: "Wi-Fi" },
  phone: { wide: "Telefono", tight: "Telefono" },
  minibar: { wide: "Minibar", tight: "Minibar" },
  laundry: { wide: "Lavanderia", tight: "Lavanderia" },
  smart: { wide: "Controlli smart", tight: "Smart" },
  doctor: { wide: "Medico", tight: "Medico" },
  service: { wide: "Servizio in camera", tight: "Servizio" },
  ac: { wide: "Aria condizionata", tight: "Clima" },
  hair: { wide: "Asciugacapelli", tight: "Phon" },
  view: { wide: "Vista Nilo", tight: "Vista Nilo" },
  jacuzzi: { wide: "Jacuzzi", tight: "Jacuzzi" },
  smoke: { wide: "Non fumatori", tight: "Non fumatori" },
  space: { wide: "Metratura", tight: "Metratura" },
  default: { wide: "", tight: "" },
};

/** Captions for the bundled suite / royal amenity lines, Italian. */
const AMENITY_CAPTION_OVERRIDES_IT: Record<string, AmenityCaption> = {
  "jacuzzi & dual toilets": { wide: "Jacuzzi e doppio WC", tight: "Jacuzzi e WC" },
  "jacuzzi & two luxurious bathrooms": { wide: "Jacuzzi e bagni", tight: "Jacuzzi e bagni" },
  "hair dryer & mini bar": { wide: "Phon e minibar", tight: "Phon e minibar" },
  "smart entertainment system": { wide: "Sistema smart", tight: "Smart" },
  "room & laundry service": { wide: "Servizio in camera e lavanderia", tight: "Lavanderia" },
  "air conditioning & high-speed wi-fi": { wide: "Clima e Wi-Fi", tight: "Clima e Wi-Fi" },
  "coffee machine, mini bar, air conditioning": {
    wide: "Caffè · Minibar · Clima",
    tight: "Caffè e minibar",
  },
};

/** Each added language's captions; English keeps its own in RoomAmenityIcon. */
export const AMENITY_CAPTIONS: Record<
  TranslatedLocale,
  { kinds: Record<string, AmenityCaption>; overrides: Record<string, AmenityCaption> }
> = {
  it: { kinds: AMENITY_KIND_CAPTIONS_IT, overrides: AMENITY_CAPTION_OVERRIDES_IT },
  de: { kinds: AMENITY_KIND_CAPTIONS_DE, overrides: AMENITY_CAPTION_OVERRIDES_DE },
};
