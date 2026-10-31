/**
 * The guest book's own words. The reviews themselves are always shown as the
 * guests wrote them, so only the frame around them is translated. English is
 * the live copy, word for word.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import { REVIEWS_COPY_DE } from "@/lib/i18n/reviews-copy-de";

type HandLine = { text: string; x: number; y: number; r?: number };

export type ReviewsCopy = {
  kicker: string;
  titleLead: string;
  titleAccent: string;
  lede: string;
  subtitle: string;
  googleReviews: string;
  platformReviews: (platform: string) => string;
  reviewsFrom: (platform: string) => string;
  basedOn: (count: number) => string;
  rated: (value: string, platform: string) => string;
  /** The big score: 4.9 in English, 4,9 in Italian. */
  figure: (value: number) => string;
  /** The platforms date reviews in English: "2 months ago", "March 2026". */
  when: (when: string) => string;
  /** The source line the review platforms ask for. */
  attribution: (platform: string) => string;
  readReviews: string;
  writeReview: string;
  /** A review's date link when the platform gives no date. */
  onPlatform: (platform: string) => string;
  readThisReview: (author: string, platform: string) => string;
  byLine: (platform: string) => string;
  sourceSwitch: string;
  pagesLabel: string;
  previousPage: string;
  nextPage: string;
  chooseReview: string;
  reviewOf: (index: number, total: number) => string;
  /** The open spread in the pager. */
  folio: (page: number, total: number) => string;
  fallbackLede: (withTripadvisor: boolean) => string;
  /** Pencilled notes, placed line by line inside fixed boxes (see ephemera.tsx). */
  handPage: HandLine[];
  handEtching: HandLine[];
  handDeck: HandLine[];
  /** Round the ink stamp; about 44 characters fill its ring. */
  stamp: string;
};

const MONTHS_IT: Record<string, string> = {
  January: "gennaio", February: "febbraio", March: "marzo", April: "aprile", May: "maggio", June: "giugno",
  July: "luglio", August: "agosto", September: "settembre", October: "ottobre", November: "novembre", December: "dicembre",
};

const AGO_IT: Record<string, readonly [string, string]> = {
  minute: ["un minuto fa", "minuti fa"],
  hour: ["un’ora fa", "ore fa"],
  day: ["un giorno fa", "giorni fa"],
  week: ["una settimana fa", "settimane fa"],
  month: ["un mese fa", "mesi fa"],
  year: ["un anno fa", "anni fa"],
};

/** A wording it does not know is left as the platform gave it. */
function reviewWhenIt(when: string): string {
  if (/^in the last week$/i.test(when.trim())) return "nell’ultima settimana";
  const date = /^(\w+) (\d{4})$/.exec(when);
  if (date && MONTHS_IT[date[1]]) return `${MONTHS_IT[date[1]]} ${date[2]}`;
  const ago = /^(a|an|\d+) (minute|hour|day|week|month|year)s? ago$/.exec(when);
  if (!ago) return when;
  const [one, many] = AGO_IT[ago[2]];
  return ago[1] === "a" || ago[1] === "an" || ago[1] === "1" ? one : `${ago[1]} ${many}`;
}

export const REVIEWS_COPY: Record<PublicLocale, ReviewsCopy> = {
  en: {
    kicker: "Guest reviews",
    titleLead: "In their",
    titleAccent: "own words",
    lede: "More than a journey, a collection of memories. Here are the words of our guests, written from the heart.",
    subtitle: "Real journeys. Genuine stories.",
    googleReviews: "Google reviews",
    platformReviews: (platform) => `${platform} reviews`,
    reviewsFrom: (platform) => `Reviews from ${platform}`,
    basedOn: (count) =>
      `Based on ${count.toLocaleString("en-GB")} ${count === 1 ? "review" : "reviews"}`,
    rated: (value, platform) => `Rated ${value} out of 5 on ${platform}`,
    figure: (value) => value.toFixed(1),
    when: (when) => when,
    attribution: (platform) => `Ratings and reviews from ${platform}, shown as written by guests.`,
    readReviews: "Read reviews",
    writeReview: "Write a review",
    onPlatform: (platform) => `On ${platform}`,
    readThisReview: (author, platform) => ` — read this review by ${author} on ${platform}`,
    byLine: (platform) => `on ${platform}`,
    sourceSwitch: "Review source",
    pagesLabel: "Review pages",
    previousPage: "Previous page of reviews",
    nextPage: "Next page of reviews",
    chooseReview: "Choose a review",
    reviewOf: (index, total) => `Review ${index} of ${total}`,
    folio: (page, total) => `Page ${page} of ${total}`,
    fallbackLede: (withTripadvisor) =>
      `Read what guests say after a voyage aboard Hathor, on Google${withTripadvisor ? " and Tripadvisor" : ""}.`,
    handPage: [
      { text: "Slower", x: 12, y: 46 },
      { text: "kinder", x: 46, y: 96, r: 2 },
      { text: "more beautiful", x: 70, y: 148, r: -1 },
    ],
    handEtching: [
      { text: "Different", x: 10, y: 50 },
      { text: "waters,", x: 44, y: 96, r: 2 },
      { text: "richer", x: 70, y: 142, r: -1 },
      { text: "stories", x: 92, y: 188, r: 1 },
    ],
    handDeck: [
      { text: "More than", x: 8, y: 44 },
      { text: "a cruise —", x: 30, y: 92, r: 2 },
      { text: "a story worth sharing", x: 52, y: 142, r: -1 },
    ],
    stamp: "NILE CRUISE · EGYPT · NILE CRUISE · EGYPT ·",
  },
  it: {
    kicker: "Recensioni degli ospiti",
    titleLead: "Con le loro",
    titleAccent: "parole",
    lede: "Più di un viaggio, una raccolta di ricordi. Ecco le parole dei nostri ospiti, scritte con il cuore.",
    subtitle: "Viaggi veri. Storie autentiche.",
    googleReviews: "Recensioni Google",
    platformReviews: (platform) => `Recensioni ${platform}`,
    reviewsFrom: (platform) => `Recensioni da ${platform}`,
    basedOn: (count) =>
      `Su ${count.toLocaleString("it-IT")} ${count === 1 ? "recensione" : "recensioni"}`,
    rated: (value, platform) => `Valutazione ${value.replace(".", ",")} su 5 su ${platform}`,
    figure: (value) => value.toFixed(1).replace(".", ","),
    when: reviewWhenIt,
    attribution: (platform) => `Valutazioni e recensioni da ${platform}, riportate come scritte dagli ospiti.`,
    readReviews: "Leggi le recensioni",
    writeReview: "Scrivi una recensione",
    onPlatform: (platform) => `Su ${platform}`,
    readThisReview: (author, platform) => ` — leggi questa recensione di ${author} su ${platform}`,
    byLine: (platform) => `su ${platform}`,
    sourceSwitch: "Fonte delle recensioni",
    pagesLabel: "Pagine delle recensioni",
    previousPage: "Pagina precedente delle recensioni",
    nextPage: "Pagina successiva delle recensioni",
    chooseReview: "Scegli una recensione",
    reviewOf: (index, total) => `Recensione ${index} di ${total}`,
    folio: (page, total) => `Pagina ${page} di ${total}`,
    fallbackLede: (withTripadvisor) =>
      `Legga che cosa raccontano gli ospiti dopo un viaggio a bordo di Hathor, su Google${withTripadvisor ? " e Tripadvisor" : ""}.`,
    handPage: [
      { text: "Più lento", x: 12, y: 46 },
      { text: "più gentile", x: 46, y: 96, r: 2 },
      { text: "più bello", x: 70, y: 148, r: -1 },
    ],
    handEtching: [
      { text: "Altre", x: 10, y: 50 },
      { text: "acque,", x: 44, y: 96, r: 2 },
      { text: "altre", x: 70, y: 142, r: -1 },
      { text: "storie", x: 92, y: 188, r: 1 },
    ],
    handDeck: [
      { text: "Più di", x: 8, y: 44 },
      { text: "una crociera:", x: 30, y: 92, r: 2 },
      { text: "una storia da raccontare", x: 52, y: 142, r: -1 },
    ],
    stamp: "CROCIERE SUL NILO · EGITTO · LUXOR · ASSUAN ·",
  },
  de: REVIEWS_COPY_DE,
};
