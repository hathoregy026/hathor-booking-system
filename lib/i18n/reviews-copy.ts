/**
 * The guest-reviews section's own words. The reviews themselves are always
 * shown as the guests wrote them — the section says so — so only the frame
 * around them is translated.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

export type ReviewsCopy = {
  kicker: string;
  titleLead: string;
  titleAccent: string;
  platformReviews: (platform: string) => string;
  basedOn: (count: number) => string;
  numberLocale: string;
  readReviews: string;
  writeReview: string;
  alsoTripadvisor: string;
  recentFrom: (platform: string) => string;
  readOn: (platform: string) => string;
  reviewBy: (author: string) => string;
  googleNote: string;
  tripadvisorNote: string;
  fallbackLede: (withTripadvisor: boolean) => string;
  sourceSwitch: string;
};

export const REVIEWS_COPY: Record<PublicLocale, ReviewsCopy> = {
  en: {
    kicker: "Guest reviews",
    titleLead: "In their",
    titleAccent: "own words",
    platformReviews: (platform) => `${platform} reviews`,
    basedOn: (count) =>
      `Based on ${count.toLocaleString("en-GB")} ${count === 1 ? "review" : "reviews"}`,
    numberLocale: "en-GB",
    readReviews: "Read reviews",
    writeReview: "Write a review",
    alsoTripadvisor: "Also reviewed on Tripadvisor",
    recentFrom: (platform) => `Recent reviews from ${platform}`,
    readOn: (platform) => `Read on ${platform}`,
    reviewBy: (author) => ` — review by ${author}`,
    googleNote: "Ratings and reviews from Google Maps, shown as written by guests.",
    tripadvisorNote:
      "Ratings and reviews from Tripadvisor, shown as written by guests.",
    fallbackLede: (withTripadvisor) =>
      `Read what guests say after a voyage aboard Hathor, on Google${withTripadvisor ? " and Tripadvisor" : ""}.`,
    sourceSwitch: "Review source",
  },
  it: {
    kicker: "Recensioni degli ospiti",
    titleLead: "Con le loro",
    titleAccent: "parole",
    platformReviews: (platform) => `Recensioni ${platform}`,
    basedOn: (count) =>
      `Su ${count.toLocaleString("it-IT")} ${count === 1 ? "recensione" : "recensioni"}`,
    numberLocale: "it-IT",
    readReviews: "Legga le recensioni",
    writeReview: "Scrivi una recensione",
    alsoTripadvisor: "Recensito anche su Tripadvisor",
    recentFrom: (platform) => `Recensioni recenti da ${platform}`,
    readOn: (platform) => `Legga su ${platform}`,
    reviewBy: (author) => ` — recensione di ${author}`,
    googleNote:
      "Valutazioni e recensioni da Google Maps, riportate così come scritte dagli ospiti.",
    tripadvisorNote:
      "Valutazioni e recensioni da Tripadvisor, riportate così come scritte dagli ospiti.",
    fallbackLede: (withTripadvisor) =>
      `Legga che cosa raccontano gli ospiti dopo un viaggio a bordo di Hathor, su Google${withTripadvisor ? " e Tripadvisor" : ""}.`,
    sourceSwitch: "Fonte delle recensioni",
  },
};
