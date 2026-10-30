/**
 * Site chrome in German. Formal "Sie" everywhere; buttons use the infinitive
 * ("Jetzt buchen") or "Entdecken Sie". Product names stay in English.
 */
import type { ChromeCopy } from "@/lib/i18n/chrome-copy";

export const CHROME_COPY_DE: ChromeCopy = {
  nav: {
    groups: {
      suites: "Suiten",
      cruises: "Kreuzfahrten",
      experiences: "Erlebnisse",
      about: "Über uns",
    },
    links: {
      "/": { label: "Startseite" },
      "/suites": {
        label: "Suiten",
        description: "Luxuriöse Rückzugsorte an Bord der Hathor",
      },
      "/luxury-cabins-Nile-Cruise": {
        label: "Luxury Rooms",
        description: "Kabinen mit Nilblick und stiller Eleganz",
      },
      "/rooms": {
        label: "Luxury Suite",
        description: "Großzügige Räume an Bord",
      },
      "/royal-suites": {
        label: "Royal Suite",
        description: "Unsere schönsten Räume auf dem Nil",
      },
      "/voyages": {
        label: "Reisen",
        description: "Private Dahabiya-Routen auf dem Nil",
      },
      "/cruises-list": {
        label: "Abfahrtstermine",
        description: "Reisen Sie mit uns auf dem Nil",
      },
      "/charter": {
        label: "Privatcharter",
        description: "Die Dahabiya ganz für Sie allein",
      },
      "/highlights": {
        label: "Höhepunkte",
        description: "Antike Wunder entlang des Flusses",
      },
      "/wellness": {
        label: "Wellness und Spa",
        description: "Seneb Spa, eine schwimmende Oase",
      },
      "/gastronomy": {
        label: "Gastronomie",
        description: "Feine Küche auf dem Wasser",
      },
      "/about": {
        label: "Unsere Geschichte",
        description: "Gastfreundschaft der Hathor auf dem Nil",
      },
      "/partners": {
        label: "Partner",
        description: "Wer mit uns reist",
      },
      "/blogs": { label: "Journal" },
      "/contact": { label: "Kontakt" },
    },
  },
  header: {
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    phoneTools: "Werkzeuge",
    showGroupPages: (group) => `Seiten zu ${group} anzeigen`,
    groupPages: (group) => `Seiten zu ${group}`,
  },
  menu: {
    kicker: "Luxusreisen auf dem Nil",
    siteMenu: "Seitenmenü",
    primary: "Hauptmenü",
    closeMenu: "Menü schließen",
    privacy: "Datenschutz",
    terms: "AGB",
    bookNow: "Jetzt buchen",
  },
  language: {
    eyebrow: "Sprache",
    code: "De",
    activeName: "Deutsch",
    names: {
      AR: "Arabisch",
      EN: "Englisch",
      DE: "Deutsch",
      IT: "Italiano",
      RU: "Russisch",
    },
    comingSoon: (name) => `${name} — demnächst verfügbar`,
    toggleLabel: (active) => `Sprache: ${active}. Wählen Sie eine Sprache`,
    closeMenu: "Sprachmenü schließen",
  },
  theme: {
    day: "Tag",
    night: "Nacht",
    toNight: "Zum Nachtmodus wechseln",
    toDay: "Zum Tagmodus wechseln",
    dayTitle: "Tagmodus",
    nightTitle: "Nachtmodus",
    dayStatus: "Tagmodus, zum Nachtmodus wechseln",
    nightStatus: "Nachtmodus, zum Tagmodus wechseln",
  },
  hero: {
    regionLabel: "Einleitung",
    discover: "Entdecken Sie das Außergewöhnliche",
    scrollHint: "Scrollen",
    location: ["LUXOR", "ASSUAN"],
    playFilm: "Film abspielen",
    pauseFilm: "Film anhalten",
    filmAlt: "Die Hathor Dahabiya auf dem Nil",
    bookNow: "Jetzt buchen",
  },
  contact: {
    bookNow: "Jetzt buchen",
    contact: "Kontakt",
    openLinks: "Kontaktwege öffnen",
    closeLinks: "Kontaktwege schließen",
    call: (phone) => `${phone} anrufen`,
  },
  selection: {
    save: "Merken",
    saved: "Gemerkt",
    saveLabel: (name) => `${name} zu den Favoriten hinzufügen`,
    savedLabel: (name) => `Gemerkt — ${name} aus den Favoriten entfernen`,
    /* Short form: it shares one button row with Save, Book now and Voyages. */
    addToVoyage: "Zur Reise",
    inVoyage: "In Meiner Reise",
    addToVoyageLabel: (name) => `${name} zu Meiner Reise hinzufügen`,
    inVoyageLabel: (name) => `${name} ist in Meiner Reise`,
    myFavorites: "Meine Favoriten",
    myVoyage: "Meine Reise",
    favoritesCount: (count) =>
      count > 0
        ? `Meine Favoriten, ${count} gemerkt`
        : "Meine Favoriten, noch nichts gemerkt",
    voyageCount: (count) =>
      count > 0
        ? `Meine Reise, ${count} ausgewählt`
        : "Meine Reise, noch nichts ausgewählt",
  },
  footer: {
    titleLines: ["IHRE NILREISE", "BEGINNT HIER"],
    script: "Abenteuer auf dem Nil",
    eyebrow: "Private Reservierungen",
    bookNow: "Jetzt buchen",
    charter: "Privatcharter",
    address:
      "One Kattamiya, Tower 211, 11. Etage, Flat 111, Ring Road, Kairo, Ägypten",
    workingHours: "Täglich erreichbar: 09:00 – 17:00 Uhr",
    columns: [
      {
        id: "explore",
        title: "Entdecken",
        links: [
          { href: "/cruises-list", label: "Kreuzfahrten" },
          { href: "/suites", label: "Suiten" },
          { href: "/luxury-cabins-Nile-Cruise", label: "Kabinen" },
          { href: "/charter", label: "Privatcharter" },
        ],
      },
      {
        id: "aboard",
        title: "An Bord",
        links: [
          { href: "/gastronomy", label: "Gastronomie" },
          { href: "/wellness", label: "Seneb Spa" },
          { href: "/royal-suites", label: "Royal Suites" },
          { href: "/about", label: "Über uns" },
        ],
      },
      {
        id: "route",
        title: "Route",
        links: [
          { href: "/voyages", label: "Alle Reisen" },
          { href: "/voyages/luxor-to-aswan", label: "Luxor nach Assuan" },
          { href: "/voyages/aswan-to-luxor", label: "Assuan nach Luxor" },
          { href: "/highlights", label: "Höhepunkte" },
        ],
      },
    ],
    utility: [
      { href: "/contact", label: "Kontakt" },
      { href: "/blogs", label: "Journal" },
      { href: "/partners", label: "Partner" },
      { href: "/terms-and-conditions", label: "AGB" },
    ],
    utilityLabel: "Rechtliches und Kontakt",
    country: "Ägypten",
    backToTop: "Zurück zum Seitenanfang",
  },
};
