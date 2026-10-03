/**
 * The scheduled-sailings page (/cruises-list) words that are not dashboard
 * text: filters, card labels, the "continue exploring" cards and the intro
 * hero chrome. English is the live copy, character for character. Prices,
 * dates and availability are untouched; only their labels change.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

export type CruisesSortKey = "price-asc" | "price-desc" | "nights-asc" | "nights-desc";

export type CruisesCopy = {
  roomTypes: { all: string; room: string; suite: string; royal: string };
  features: { nile: string; jacuzzi: string; bathtub: string; wifi: string; minibar: string; safe: string };
  minPrice: string;
  maxPrice: string;
  favourite: (saved: boolean, room: string, cruise: string) => string;
  /** The cabin + voyage pair, as the "add to my voyage" button names it. */
  pairName: (room: string, cruise: string) => string;
  sort: Record<CruisesSortKey, string>;
  closeFilters: string;
  close: string;
  cabinTypeGroup: string;
  durationGroup: string;
  departureGroup: string;
  amenitiesGroup: string;
  all: string;
  nightsShort: (n: number) => string;
  nights: string;
  anyDay: string;
  price: string;
  reset: string;
  checkAvailability: string;
  filters: string;
  cabinCount: (n: number) => string;
  bookNow: string;
  dismissFilters: string;
  filtersLabel: string;
  listingsLabel: string;
  emptyTitle: string;
  emptyBody: string;
  resetFilters: string;
  viewDetailsLabel: (room: string) => string;
  priceMeta: (nights: number, days: number, roomType: string) => string;
  perCabin: string;
  upToGuests: (n: number) => string;
  departs: (day: string) => string;
  viewDetails: string;
  onboard: string;
  continueLabel: string;
  explore: Array<{ label: string; title: string; hint: string }>;
  reserveLabel: string;
  reserveEyebrow: string;
  luxuryRooms: string;
  /** Fallbacks used only while the dashboard field is empty. */
  continueTitleFallback: string;
  ctaTitleFallback: string;
  intro: {
    label: string;
    scene: string;
    nav: string;
    links: { cruises: string; voyages: string; suites: string; contact: string };
    eyebrow: string;
    scroll: string;
    aboard: string;
    route: string;
  };
};

export const CRUISES_COPY: Record<PublicLocale, CruisesCopy> = {
  en: {
    roomTypes: { all: "All", room: "Rooms", suite: "Suites", royal: "Royal" },
    features: {
      nile: "Nile View",
      jacuzzi: "Jacuzzi",
      bathtub: "Bathtub",
      wifi: "Wi-Fi",
      minibar: "Minibar",
      safe: "Safe",
    },
    minPrice: "Minimum price",
    maxPrice: "Maximum price",
    favourite: (saved, room, cruise) =>
      saved
        ? `Remove ${room} on ${cruise} from favourites`
        : `Save ${room} on ${cruise} to favourites`,
    pairName: (room, cruise) => `${room} on ${cruise}`,
    sort: {
      "price-asc": "Lowest Price",
      "price-desc": "Highest Price",
      "nights-asc": "Shortest Voyage",
      "nights-desc": "Longest Voyage",
    },
    closeFilters: "Close filters",
    close: "Close",
    cabinTypeGroup: "Cabin type",
    durationGroup: "Duration",
    departureGroup: "Departure day",
    amenitiesGroup: "Amenities",
    all: "All",
    nightsShort: (n) => `${n}N`,
    nights: "Nights",
    anyDay: "Any Day",
    price: "Price",
    reset: "Reset",
    checkAvailability: "Check Availability",
    filters: "Filters",
    cabinCount: (n) => `${n} cabin${n === 1 ? "" : "s"}`,
    bookNow: "Book Now",
    dismissFilters: "Dismiss filters",
    filtersLabel: "Voyage filters",
    listingsLabel: "Cruise listings",
    emptyTitle: "No cabins match",
    emptyBody: "Adjust filters or reset to see all Hathor voyages.",
    resetFilters: "Reset filters",
    viewDetailsLabel: (room) => `View details: ${room}`,
    priceMeta: (nights, days, roomType) => `${nights}N / ${days}D · ${roomType}`,
    perCabin: "per cabin",
    upToGuests: (n) => `up to ${n} guests`,
    departs: (day) => `Departs ${day}`,
    viewDetails: "View Details",
    onboard: "Onboard",
    continueLabel: "Continue exploring",
    explore: [
      { label: "Cabins", title: "Luxury Rooms", hint: "River-view cabins" },
      { label: "Suites", title: "Luxury Suites", hint: "Spacious Nile suites" },
      { label: "Royal", title: "Royal Suites", hint: "Highest privilege" },
      { label: "Dining", title: "Hathor Flavors", hint: "Onboard gastronomy" },
    ],
    reserveLabel: "Reserve a voyage",
    reserveEyebrow: "Voyages",
    luxuryRooms: "Luxury Rooms",
    continueTitleFallback: "Continue exploring\naboard Hathor",
    ctaTitleFallback: "Reserve your voyage",
    intro: {
      label: "Cruises introduction",
      scene: "Cruises",
      nav: "Cruises page sections",
      links: { cruises: "Cruises", voyages: "Voyages", suites: "Suites", contact: "Contact" },
      eyebrow: "Cruises",
      scroll: "Scroll",
      aboard: "Aboard",
      route: "Luxor — Aswan",
    },
  },
  it: {
    roomTypes: { all: "Tutte", room: "Cabine", suite: "Suite", royal: "Royal" },
    features: {
      nile: "Vista Nilo",
      jacuzzi: "Jacuzzi",
      bathtub: "Vasca",
      wifi: "Wi-Fi",
      minibar: "Minibar",
      safe: "Cassaforte",
    },
    minPrice: "Prezzo minimo",
    maxPrice: "Prezzo massimo",
    favourite: (saved, room, cruise) =>
      saved
        ? `Rimuovi ${room} (${cruise}) dai preferiti`
        : `Salva ${room} (${cruise}) nei preferiti`,
    pairName: (room, cruise) => `${room} (${cruise})`,
    sort: {
      "price-asc": "Prezzo più basso",
      "price-desc": "Prezzo più alto",
      "nights-asc": "Viaggio più breve",
      "nights-desc": "Viaggio più lungo",
    },
    closeFilters: "Chiudi i filtri",
    close: "Chiudi",
    cabinTypeGroup: "Tipo di cabina",
    durationGroup: "Durata",
    departureGroup: "Giorno di partenza",
    amenitiesGroup: "Servizi",
    all: "Tutte",
    nightsShort: (n) => `${n}N`,
    nights: "Notti",
    anyDay: "Ogni giorno",
    price: "Prezzo",
    reset: "Azzera",
    checkAvailability: "Verifica disponibilità",
    filters: "Filtri",
    cabinCount: (n) => `${n} ${n === 1 ? "cabina" : "cabine"}`,
    bookNow: "Prenota ora",
    dismissFilters: "Chiudi i filtri",
    filtersLabel: "Filtri dei viaggi",
    listingsLabel: "Elenco delle crociere",
    emptyTitle: "Nessuna cabina corrisponde",
    emptyBody: "Modifichi i filtri o li azzeri per vedere tutti i viaggi di Hathor.",
    resetFilters: "Azzera i filtri",
    viewDetailsLabel: (room) => `Vedi i dettagli: ${room}`,
    priceMeta: (nights, days, roomType) => `${nights}N / ${days}G · ${roomType}`,
    perCabin: "per cabina",
    upToGuests: (n) => `fino a ${n} ospiti`,
    departs: (day) => `Partenza il ${day}`,
    viewDetails: "Vedi dettagli",
    onboard: "A bordo",
    continueLabel: "Continui a esplorare",
    explore: [
      { label: "Cabine", title: "Luxury Rooms", hint: "Cabine con vista sul fiume" },
      { label: "Suite", title: "Luxury Suites", hint: "Ampie suite sul Nilo" },
      { label: "Royal", title: "Royal Suites", hint: "Il massimo privilegio" },
      { label: "Cucina", title: "Hathor Flavors", hint: "La gastronomia a bordo" },
    ],
    reserveLabel: "Prenoti un viaggio",
    reserveEyebrow: "Viaggi",
    luxuryRooms: "Luxury Rooms",
    continueTitleFallback: "Continui a esplorare\na bordo di Hathor",
    ctaTitleFallback: "Prenoti il Suo viaggio",
    intro: {
      label: "Introduzione alle crociere",
      scene: "Crociere",
      nav: "Sezioni della pagina crociere",
      links: { cruises: "Crociere", voyages: "Viaggi", suites: "Suite", contact: "Contatti" },
      eyebrow: "Crociere",
      scroll: "Scorri",
      aboard: "A bordo",
      route: "Luxor — Assuan",
    },
  },
};
