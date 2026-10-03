/**
 * The About page's own words (not dashboard text) in every public language.
 * English is the live copy, character for character. Layout, images and links
 * are unchanged; only the words differ.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

type Principle = { title: string; text: string };
type Stay = { meta: string; place: string; title: string };

export type AboutCopy = {
  runLabel: string;
  navLabel: string;
  nav: { about: string; stay: string; dining: string; reserve: string };
  scroll: string;
  alts: {
    hero: string;
    suite: string;
    dining: string;
    life: string;
    river: string;
    craft: string;
    cabin: string;
    restaurant: string;
    bar: string;
    fineDining: string;
    legacy: string;
    deck: string;
    royalExperience: string;
    diningExperience: string;
    card: string;
  };
  aboardAlt: (title: string) => string;
  leadCaption: string;
  manifesto: readonly [string, string, string, string];
  principles: readonly [Principle, Principle, Principle];
  stays: readonly [Stay, Stay, Stay];
  experience: string;
  diningLines: readonly [string, string, string];
  exploreDining: string;
  welcomeFallback: string;
  epilogue: readonly [string, string];
  bookNow: string;
  exploreCruises: string;
  cardTitle: string;
  cardBody: readonly [string, string];
};

export const ABOUT_COPY: Record<PublicLocale, AboutCopy> = {
  en: {
    runLabel: "About Hathor Dahabiya",
    navLabel: "About page sections",
    nav: { about: "About", stay: "Stay", dining: "Dining", reserve: "Reserve" },
    scroll: "Scroll",
    alts: {
      hero: "Hathor Dahabiya on the Nile",
      suite: "Suite aboard Hathor",
      dining: "Dining aboard Hathor",
      life: "Life aboard Hathor",
      river: "Hathor on the river",
      craft: "Craft aboard Hathor",
      cabin: "Cabin aboard Hathor",
      restaurant: "Indoor restaurant aboard Hathor",
      bar: "Bar aboard Hathor",
      fineDining: "Fine dining aboard Hathor",
      legacy: "Hathor legacy on the Nile",
      deck: "Hathor deck living",
      royalExperience: "Royal Suite experience",
      diningExperience: "Dining experience",
      card: "Hathor Dahabiya",
    },
    aboardAlt: (title) => `${title} aboard Hathor`,
    leadCaption: "Aboard · Three decks · 32 guests",
    manifesto: ["The Dahabiya", "Experience Egypt", "in a whole", "new light"],
    principles: [
      {
        title: "Cabins",
        text: "Eight luxury cabins of refined comfort — 22 sqm of contemporary Nile living with ensuite bathrooms and smart systems.",
      },
      {
        title: "Suites",
        text: "Two elegant suites on the Lower Deck — 46 sqm of distinctive luxury with panoramic Nile views and private jacuzzi.",
      },
      {
        title: "Royal",
        text: "Two magnificent Royal Suites on the Main Deck — 56 sqm, the crown jewel, designed for those who seek the extraordinary.",
      },
    ],
    stays: [
      { meta: "22 sqm", place: "Upper Deck", title: "Cabin" },
      { meta: "46 sqm", place: "Lower Deck", title: "Suite" },
      { meta: "56 sqm", place: "Main Deck", title: "Royal" },
    ],
    experience: "The experience",
    diningLines: ["Luxury dining", "on Egypt’s finest", "dahabiya"],
    exploreDining: "Explore Dining",
    welcomeFallback: "Welcome aboard",
    epilogue: ["Timeless luxury", "on the Nile"],
    bookNow: "Book Now",
    exploreCruises: "Explore cruises",
    cardTitle: "Dahabiya vessel",
    cardBody: ["Three decks of stillness", "on a private Nile cruise"],
  },
  it: {
    runLabel: "Hathor Dahabiya, chi siamo",
    navLabel: "Sezioni della pagina",
    nav: { about: "Chi siamo", stay: "Soggiorno", dining: "Cucina", reserve: "Prenota" },
    scroll: "Scorri",
    alts: {
      hero: "Hathor Dahabiya sul Nilo",
      suite: "Una suite a bordo di Hathor",
      dining: "A tavola a bordo di Hathor",
      life: "La vita a bordo di Hathor",
      river: "Hathor sul fiume",
      craft: "L’artigianalità a bordo di Hathor",
      cabin: "Una cabina a bordo di Hathor",
      restaurant: "Il ristorante interno di Hathor",
      bar: "Il bar a bordo di Hathor",
      fineDining: "Alta cucina a bordo di Hathor",
      legacy: "L’eredità di Hathor sul Nilo",
      deck: "La vita sul ponte di Hathor",
      royalExperience: "L’esperienza della Royal Suite",
      diningExperience: "L’esperienza a tavola",
      card: "Hathor Dahabiya",
    },
    aboardAlt: (title) => `${title} a bordo di Hathor`,
    leadCaption: "A bordo · Tre ponti · 32 ospiti",
    manifesto: ["La dahabiya", "Scopra l’Egitto", "sotto una luce", "nuova"],
    principles: [
      {
        title: "Cabine",
        text: "Otto cabine di lusso dal comfort raffinato: 22 m² di vita contemporanea sul Nilo, con bagno privato e sistemi smart.",
      },
      {
        title: "Suite",
        text: "Due eleganti suite sul ponte inferiore: 46 m² di lusso distintivo, con vista panoramica sul Nilo e jacuzzi privata.",
      },
      {
        title: "Royal",
        text: "Due magnifiche Royal Suite sul ponte principale: 56 m², il gioiello di Hathor, pensate per chi cerca lo straordinario.",
      },
    ],
    stays: [
      { meta: "22 m²", place: "Ponte superiore", title: "Cabina" },
      { meta: "46 m²", place: "Ponte inferiore", title: "Suite" },
      { meta: "56 m²", place: "Ponte principale", title: "Royal" },
    ],
    experience: "L’esperienza",
    diningLines: ["Alta cucina", "sulla più bella", "dahabiya d’Egitto"],
    exploreDining: "Scopra la cucina",
    welcomeFallback: "Benvenuti a bordo",
    epilogue: ["Un lusso senza tempo", "sul Nilo"],
    bookNow: "Prenota ora",
    exploreCruises: "Scopra le crociere",
    cardTitle: "La dahabiya",
    cardBody: ["Tre ponti di quiete", "per una crociera privata sul Nilo"],
  },
};
