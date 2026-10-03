/**
 * The Wellness page's own words (not dashboard text) in every public
 * language. English is the live copy, character for character. Image
 * descriptions are looked up by their English text, so the page keeps one
 * list of images.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

type Ritual = { word: string; detail: string; meta: string };

export type WellnessCopy = {
  runLabel: string;
  indexLabel: string;
  index: readonly [string, string, string, string];
  eyebrow: string;
  introFallback: string;
  route: readonly [string, string];
  cue: string;
  lyric: readonly [string, string, string];
  rituals: readonly [Ritual, Ritual, Ritual, Ritual];
  ritualsEyebrow: string;
  ritualsIntro: string;
  ritualAlt: (word: string) => string;
  galleryLabel: string;
  historia: { tl: string; tr: string; bl: string; br: string };
  essayEyebrow: string;
  essayLines: readonly [string, string, string];
  essayBody: string;
  exploreSuites: string;
  pauseLabel: string;
  pulse: readonly [string, string];
  nextEyebrow: string;
  nextTitle: string;
  reserveEyebrow: string;
  reserveLines: readonly [string, string];
  statement: string;
  bookNow: string;
  enquire: string;
  cardTag: string;
  cardBody: readonly [string, string];
  suites: string;
  /** An image description in this language (English passes through). */
  alt: (english: string) => string;
};

const ALTS_IT: Record<string, string> = {
  "Seneb Spa aboard Hathor Dahabiya": "La Seneb Spa a bordo di Hathor Dahabiya",
  "Seneb Spa aboard Hathor": "La Seneb Spa a bordo di Hathor",
  "Open-air calm on the Nile deck": "Calma all’aria aperta sul ponte, sul Nilo",
  "Restorative spa treatments aboard Hathor": "Trattamenti spa rigeneranti a bordo di Hathor",
  "Suite rest aboard Hathor": "Riposo in suite a bordo di Hathor",
  "Historia Fitness overlooking the Nile": "L’Historia Fitness affacciato sul Nilo",
  "Egyptian character aboard Hathor": "Carattere egiziano a bordo di Hathor",
  "Historia Fitness aboard Hathor": "L’Historia Fitness a bordo di Hathor",
  "Active wellness overlooking the Nile": "Benessere attivo affacciato sul Nilo",
  "Luxury cabin repose aboard Hathor": "Riposo in una cabina di lusso a bordo di Hathor",
  "Life aboard Hathor": "La vita a bordo di Hathor",
  "Deck living aboard Hathor": "La vita sul ponte di Hathor",
  "Historia Fitness Center with panoramic Nile views":
    "L’Historia Fitness Center con vista panoramica sul Nilo",
  "River light from the fitness deck": "La luce del fiume dal ponte fitness",
  "Movement aboard Hathor": "Movimento a bordo di Hathor",
  "Sailing the Nile aboard Hathor": "In navigazione sul Nilo a bordo di Hathor",
  "Royal Suite repose aboard Hathor": "Riposo nella Royal Suite a bordo di Hathor",
  "Crafted detail aboard Hathor": "Dettagli artigianali a bordo di Hathor",
  "Quiet river light aboard Hathor": "La luce quieta del fiume a bordo di Hathor",
  "Seneb Spa calm aboard Hathor": "La calma della Seneb Spa a bordo di Hathor",
};

export const WELLNESS_COPY: Record<PublicLocale, WellnessCopy> = {
  en: {
    runLabel: "Hathor wellness on the Nile",
    indexLabel: "Wellness chapters",
    index: ["Seneb", "Rituals", "Historia", "Reserve"],
    eyebrow: "Wellness",
    introFallback:
      "In a world that rarely pauses, Hathor creates time for the body to soften. Seneb Spa, Historia Fitness, and restful suites move with you between Luxor and Aswan.",
    route: ["Luxor", "Aswan"],
    cue: "Drift",
    lyric: ["Health, in the Egyptian sense —", " seneb ", "as quiet continuity."],
    rituals: [
      { word: "Massage", detail: "Warm-oil recovery after temple days", meta: "Seneb · 60–90 min" },
      { word: "Botanical", detail: "Egyptian plant therapies for skin and calm", meta: "Signature · daily" },
      { word: "Recovery", detail: "Quieting treatments between shore and sail", meta: "Balance · as needed" },
      { word: "Stillness", detail: "Private suite rest as part of the ritual", meta: "Cabin · continuous" },
    ],
    ritualsEyebrow: "Onboard rituals",
    ritualsIntro: "Four ways the body returns to itself while the Nile keeps moving.",
    ritualAlt: (word) => `${word} ritual aboard Hathor`,
    galleryLabel: "Wellness imagery",
    historia: { tl: "Fitness", tr: "Nile view", bl: "Daily · open", br: "Movement" },
    essayEyebrow: "After movement",
    essayLines: ["Rest is not", "the absence of", "the voyage"],
    essayBody:
      "Suites become part of the ritual: soft morning light, deep sleep, and the rare luxury of waking beside a different Nile horizon.",
    exploreSuites: "Explore suites",
    pauseLabel: "Quiet pause",
    pulse: ["The river keeps time —", "so you do not have to."],
    nextEyebrow: "Next",
    nextTitle: "Book stillness",
    reserveEyebrow: "Reserve",
    reserveLines: ["A quieter Nile", "awaits"],
    statement:
      "Shape a private voyage with time for Seneb Spa, Historia Fitness, restorative suite rituals, and the temples of Egypt.",
    bookNow: "Book Now",
    enquire: "Enquire",
    cardTag: "Floating oasis",
    cardBody: ["Spa · Fitness · Suite rest", "between Luxor and Aswan"],
    suites: "Suites",
    alt: (english) => english,
  },
  it: {
    runLabel: "Il benessere di Hathor sul Nilo",
    indexLabel: "Capitoli del benessere",
    index: ["Seneb", "Rituali", "Historia", "Prenota"],
    eyebrow: "Benessere",
    introFallback:
      "In un mondo che raramente si ferma, Hathor crea il tempo perché il corpo si distenda. La Seneb Spa, l’Historia Fitness e suite riposanti La accompagnano tra Luxor e Assuan.",
    route: ["Luxor", "Assuan"],
    cue: "Scorri",
    lyric: ["La salute, nel senso egizio:", " seneb, ", "come quieta continuità."],
    rituals: [
      {
        /* The ritual word sits in a narrow column; "Massaggio" crowds its text. */
        word: "Massaggi",
        detail: "Recupero con oli caldi dopo le giornate tra i templi",
        meta: "Seneb · 60–90 min",
      },
      {
        word: "Botanica",
        detail: "Terapie a base di piante egiziane per la pelle e la calma",
        meta: "Esclusivo · ogni giorno",
      },
      {
        word: "Recupero",
        detail: "Trattamenti distensivi tra un approdo e l’altro",
        meta: "Equilibrio · su richiesta",
      },
      {
        word: "Quiete",
        detail: "Il riposo privato in suite, parte del rituale",
        meta: "Cabina · sempre",
      },
    ],
    ritualsEyebrow: "Rituali a bordo",
    ritualsIntro: "Quattro modi per ritrovare sé stessi mentre il Nilo continua a scorrere.",
    ritualAlt: (word) => `Rituale: ${word.toLowerCase()} a bordo di Hathor`,
    galleryLabel: "Immagini del benessere",
    historia: { tl: "Fitness", tr: "Vista Nilo", bl: "Ogni giorno · aperto", br: "Movimento" },
    essayEyebrow: "Dopo il movimento",
    essayLines: ["Il riposo non è", "l’assenza del", "viaggio"],
    essayBody:
      "Le suite diventano parte del rituale: la luce morbida del mattino, un sonno profondo e il raro lusso di svegliarsi ogni giorno davanti a un orizzonte diverso sul Nilo.",
    exploreSuites: "Scopra le suite",
    pauseLabel: "Una pausa quieta",
    pulse: ["Il fiume tiene il tempo:", "Lei non deve farlo."],
    nextEyebrow: "Il passo successivo",
    nextTitle: "Prenoti la quiete",
    reserveEyebrow: "Prenota",
    reserveLines: ["Un Nilo più quieto", "La attende"],
    statement:
      "Costruisca un viaggio privato con il tempo per la Seneb Spa, l’Historia Fitness, i rituali rigeneranti in suite e i templi d’Egitto.",
    bookNow: "Prenota ora",
    enquire: "Ci scriva",
    cardTag: "Oasi galleggiante",
    cardBody: ["Spa · Fitness · Riposo in suite", "tra Luxor e Assuan"],
    suites: "Suite",
    alt: (english) => ALTS_IT[english] ?? english,
  },
};
