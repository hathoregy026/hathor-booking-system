/**
 * The journal index's own words (not dashboard text, not the posts) in every
 * public language. English is the live copy, character for character.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

type Theme = { word: string; note: string };

export type JournalCopy = {
  /** Intl locale for publication dates. */
  dateLocale: string;
  runLabel: string;
  mast: readonly [string, string, string];
  navLabel: string;
  nav: readonly [string, string, string, string];
  fromRiver: string;
  scroll: string;
  alts: {
    hero: string;
    life: string;
    valley: string;
    landmark: string;
    dining: string;
    sailing: string;
  };
  editorialAlt: (title: string) => string;
  leadStory: string;
  readStory: string;
  arrivingSoon: string;
  arrivingBody: string;
  issue: { tl: string; tr: string; label: string; bl: string; br: string };
  lyric: readonly [string, string, string];
  contents: string;
  contentsBody: string;
  readLabel: (title: string) => string;
  read: string;
  firstChapter: string;
  galleryLabel: string;
  openingsLabel: string;
  openNote: string;
  readingPaths: string;
  themes: readonly [Theme, Theme, Theme, Theme];
  next: string;
  continueLines: readonly [string, string];
  archive: string;
  archiveLines: readonly [string, string];
  archiveBody: string;
  arrivingStories: string;
  showMore: string;
  statement: string;
  bookNow: string;
  exploreCruises: string;
  askConcierge: string;
  cardTag: string;
  cardTitle: string;
  cardBody: readonly [string, string];
  writeToUs: string;
};

export const JOURNAL_COPY: Record<PublicLocale, JournalCopy> = {
  en: {
    dateLocale: "en-US",
    runLabel: "Hathor journal stories",
    mast: ["Hathor Journal", "Vol. 01", "Egypt 2026"],
    navLabel: "Journal sections",
    nav: ["Journal", "Feature", "Index", "Archive"],
    fromRiver: "From the river",
    scroll: "Scroll",
    alts: {
      hero: "Hathor journal on the Nile",
      life: "Life along the Nile",
      valley: "Valley of the Kings",
      landmark: "Egyptian landmark",
      dining: "Dining aboard Hathor",
      sailing: "Sailing the Nile aboard Hathor",
    },
    editorialAlt: (title) => `Editorial view for ${title}`,
    leadStory: "Lead story",
    readStory: "Read the story",
    arrivingSoon: "Arriving soon",
    arrivingBody: "New journal notes from the Nile will appear here.",
    issue: {
      tl: "Issue",
      tr: "Egypt · Nile",
      label: "Published notes",
      bl: "Hathor Journal",
      br: "Luxor — Aswan",
    },
    lyric: ["Stories written", "for the journey", "ahead"],
    contents: "Contents",
    contentsBody:
      "Recent notes — temples, river villages, packing guidance, and the slower pace of Dahabiya travel.",
    readLabel: (title) => `Read ${title}`,
    read: "Read",
    firstChapter: "The first chapter is being set.",
    galleryLabel: "Journal gallery",
    openingsLabel: "Story openings",
    openNote: "Open the note",
    readingPaths: "Reading paths",
    themes: [
      { word: "Temples", note: "Stone & light" },
      { word: "River", note: "Current & calm" },
      { word: "Seasons", note: "When to sail" },
      { word: "Voyage", note: "Dahabiya life" },
    ],
    next: "Next",
    continueLines: ["Continue", "reading"],
    archive: "Archive",
    archiveLines: ["The full", "journal"],
    archiveBody:
      "Browse every published note. Each piece is written to inform your next journey aboard Hathor.",
    arrivingStories: "Stories are arriving soon.",
    showMore: "Show more stories",
    statement:
      "When the reading ends, the river begins — reserve a private Dahabiya voyage between Luxor and Aswan.",
    bookNow: "Book Now",
    exploreCruises: "Explore cruises",
    askConcierge: "Ask concierge",
    cardTag: "Journal",
    cardTitle: "Notes",
    cardBody: ["Temples, villages, and quieter travel", "written for guests of Hathor"],
    writeToUs: "Write to us",
  },
  it: {
    dateLocale: "it-IT",
    runLabel: "Le storie del journal di Hathor",
    mast: ["Hathor Journal", "Vol. 01", "Egitto 2026"],
    navLabel: "Sezioni del journal",
    nav: ["Journal", "In primo piano", "Indice", "Archivio"],
    fromRiver: "Dal fiume",
    scroll: "Scorri",
    alts: {
      hero: "Il journal di Hathor sul Nilo",
      life: "La vita lungo il Nilo",
      valley: "La Valle dei Re",
      landmark: "Un monumento egizio",
      dining: "La cucina a bordo di Hathor",
      sailing: "In navigazione sul Nilo a bordo di Hathor",
    },
    editorialAlt: (title) => `Immagine per l’articolo «${title}»`,
    leadStory: "In primo piano",
    readStory: "Legga l’articolo",
    arrivingSoon: "In arrivo",
    arrivingBody: "Qui appariranno le nuove note dal Nilo.",
    issue: {
      tl: "Numero",
      tr: "Egitto · Nilo",
      label: "Note pubblicate",
      bl: "Hathor Journal",
      br: "Luxor — Assuan",
    },
    lyric: ["Storie scritte", "per il viaggio", "che La attende"],
    contents: "Indice",
    contentsBody:
      "Le note più recenti: templi, villaggi sul fiume, consigli per la valigia e il ritmo più lento del viaggio in dahabiya.",
    readLabel: (title) => `Legga «${title}»`,
    read: "Legga",
    firstChapter: "Il primo capitolo è in preparazione.",
    galleryLabel: "Galleria del journal",
    openingsLabel: "Incipit delle storie",
    openNote: "Apra la nota",
    readingPaths: "Percorsi di lettura",
    themes: [
      { word: "Templi", note: "Pietra e luce" },
      { word: "Fiume", note: "Corrente e calma" },
      { word: "Stagioni", note: "Quando partire" },
      { word: "Viaggio", note: "La vita in dahabiya" },
    ],
    next: "Il passo successivo",
    continueLines: ["Continui", "a leggere"],
    archive: "Archivio",
    archiveLines: ["Il journal", "completo"],
    archiveBody:
      "Sfogli tutte le note pubblicate. Ogni articolo è scritto per accompagnare il Suo prossimo viaggio a bordo di Hathor.",
    arrivingStories: "Le storie sono in arrivo.",
    showMore: "Mostra altre storie",
    statement:
      "Quando la lettura finisce, comincia il fiume: prenoti un viaggio privato in dahabiya tra Luxor e Assuan.",
    bookNow: "Prenota ora",
    exploreCruises: "Scopra le crociere",
    askConcierge: "Chieda al concierge",
    cardTag: "Journal",
    cardTitle: "Note",
    cardBody: ["Templi, villaggi e viaggi più quieti", "scritti per gli ospiti di Hathor"],
    writeToUs: "Ci scriva",
  },
};
