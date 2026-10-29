/**
 * The guest book's own words. The reviews themselves are always shown as the
 * guests wrote them, so only the frame around them is translated. English is
 * the live copy, word for word.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

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
  fallbackLede: (withTripadvisor: boolean) => string;
  /** Pencilled notes, placed line by line inside fixed boxes (see ephemera.tsx). */
  handPage: HandLine[];
  handEtching: HandLine[];
  handDeck: HandLine[];
  /** Round the ink stamp; about 44 characters fill its ring. */
  stamp: string;
};

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
};
