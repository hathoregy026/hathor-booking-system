/**
 * The homepage deck planner ("Your place on the Nile") in every public
 * language: its fixed labels, and — for a translated page — the plan's own
 * wording (decks, spaces, room names) laid over the dashboard defaults.
 *
 * A dashboard edit always wins: a translation is only laid over a field the
 * dashboard has left at its default, so an edited English line is never
 * replaced by a translation of the old one.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import type { StayDurationValue } from "@/lib/booking-search-config";
import {
  DEFAULT_SHIP_EXPERIENCE,
  type ShipDeckId,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";

type AtlasState = "open" | "closed" | "unknown" | "request";

export type DeckAtlasCopy = {
  dateLocale: string;
  usd: (cents: number) => string;
  voyages: Record<StayDurationValue, string>;
  /** Display name of the group of rooms not in the booking catalogue. */
  onRequest: string;
  spaceKind: { guest: string; crew: string };
  cabinNote: Record<PhysicalRoomType, string>;
  kingBed: string;
  upToGuests: (guests: number) => string;
  booked: string;
  bookedRange: (range: string) => string;
  contactAboutRoom: string;
  availableOn: (date: string) => string;
  bookedFor: (from: string, to: string) => string;
  checkingAvailability: string;
  chooseDepartureToCheck: string;
  comparableCabin: string;
  checkingDates: string;
  pleaseRetry: string;
  noDates: string;
  notOpenToGuests: string;
  selectToSeeCloser: string;
  deckNumber: (number: string) => string;
  roomCount: (count: number) => string;
  deckTabs: string;
  deckTab: (name: string) => string;
  swipe: string;
  spacesOnDeck: string;
  crewAndService: string;
  illustrated: string;
  stern: string;
  bow: string;
  checkingFree: string;
  chooseDepartureFree: string;
  planKey: string;
  available: string;
  bookedOnDate: string;
  yourChoice: string;
  makeItYours: string;
  findDeparture: string;
  fieldVoyage: string;
  fieldMonth: string;
  fieldDeparture: string;
  fullyBooked: string;
  checkingLive: string;
  tryAgain: string;
  noDepartures: readonly [string, string, string];
  /** Follows the bold count: " of 8 cabins free on the lower deck for 21 Nov 2026." */
  freeSummary: (total: number, deck: string, date: string) => string;
  departing: (date: string) => string;
  allCabins: string;
  viewPhotos: string;
  perCabin: string;
  perCabinHead: string;
  seeOtherDates: string;
  checkAvailability: string;
  contactReservations: string;
  viewRoom: string;
  cabinsOnDeck: string;
  contactAboutRoomSentence: string;
  bookedOnDeparture: string;
  loadingCabins: string;
  cabinsFailed: string;
  closerToSky: string;
  exploreLowerMain: string;
  viewDeck: (deck: string) => string;
  liveUnavailable: string;
  couldNotLoad: string;
  plan: {
    alt: Record<ShipDeckId, string>;
    furnished: string;
    closeup: (label: string, deck: ShipDeckId) => string;
    space: (mark: string, name: string, place: number, places: number, crew: boolean) => string;
    state: Record<AtlasState, string>;
    booked: string;
    preparing: string;
    failed: string;
    reload: string;
  };
  modal: {
    close: (name: string) => string;
    photoOf: (alt: string, photo: number, count: number) => string;
    previous: string;
    next: string;
    whereItIs: string;
    back: string;
    saveName: (name: string, label: string) => string;
  };
  chooseDeck: string;
};

const usdEn = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const usdIt = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 }).replace(/,/g, ".")}`;

const EN: DeckAtlasCopy = {
  dateLocale: "en-GB",
  usd: usdEn,
  voyages: {
    "3-nights-aswan-luxor": "3 nights · Aswan to Luxor",
    "4-nights-luxor-aswan": "4 nights · Luxor to Aswan",
    "7-nights-luxor-aswan-luxor": "7 nights · Round trip",
  } as Record<StayDurationValue, string>,
  onRequest: "On request",
  spaceKind: { guest: "Shared space", crew: "Crew & service" },
  cabinNote: {
    "Luxury King Cabin": "King bed · panoramic Nile view",
    "Luxury Twin Cabin": "Twin beds · panoramic Nile view",
    "Luxury Suite": "Separate lounge · panoramic Nile view",
    "Royal Suite": "Private lounge · premium Nile view",
  },
  kingBed: "King bed",
  upToGuests: (guests) => `Up to ${guests} guests`,
  booked: "Booked",
  bookedRange: (range) => `Booked · ${range}`,
  contactAboutRoom: "Contact us about this room",
  availableOn: (date) => `Available · ${date}`,
  bookedFor: (from, to) => `Booked for ${from} – ${to}`,
  checkingAvailability: "Checking availability…",
  chooseDepartureToCheck: "Choose a departure to check availability",
  comparableCabin: "A comparable cabin",
  checkingDates: "Checking dates…",
  pleaseRetry: "Please retry",
  noDates: "No scheduled dates",
  notOpenToGuests: "Not open to guests",
  selectToSeeCloser: "Select to see it closer",
  deckNumber: (number) => `Deck ${number}`,
  roomCount: (count) => `${count} rooms`,
  deckTabs: "Deck",
  deckTab: (name) => name.replace(/\s*deck$/i, ""),
  swipe: "Swipe across the deck ↔",
  spacesOnDeck: "Spaces on this deck",
  crewAndService: "Crew & service",
  illustrated: "Illustrated deck plans. Furnishings are indicative.",
  stern: "Stern",
  bow: "Bow",
  checkingFree: "Checking which cabins are free…",
  chooseDepartureFree: "Choose a departure to see which cabins are free.",
  planKey: "Plan key",
  available: "Available",
  bookedOnDate: "Booked on this date",
  yourChoice: "Your choice",
  makeItYours: "Make it your journey",
  findDeparture: "Find your departure",
  fieldVoyage: "Voyage",
  fieldMonth: "From month",
  fieldDeparture: "Departure",
  fullyBooked: " · fully booked",
  checkingLive: "Checking live cabin availability…",
  tryAgain: "Try again",
  noDepartures: [
    "No scheduled departures in this period. Choose a later month or ",
    "contact reservations",
    ".",
  ],
  freeSummary: (total, deck, date) => ` of ${total} cabins free on the ${deck} for ${date}.`,
  departing: (date) => `Departing ${date}.`,
  allCabins: "All cabins on this deck",
  viewPhotos: "View the room photographs",
  perCabin: "per cabin · entire voyage",
  perCabinHead: "Per cabin · entire voyage",
  seeOtherDates: "See other dates",
  checkAvailability: "Check availability",
  contactReservations: "Contact reservations",
  viewRoom: "View room",
  cabinsOnDeck: "Cabins on this deck",
  contactAboutRoomSentence: "Contact us about this room.",
  bookedOnDeparture: ", booked on this departure",
  loadingCabins: "Loading the cabins from the booking system…",
  cabinsFailed: "The cabins could not be loaded just now. Please try again in a moment.",
  closerToSky: "A little closer to the sky.",
  exploreLowerMain: "Explore the lower and main decks to choose your room.",
  viewDeck: (deck) => `View the ${deck}`,
  liveUnavailable: "Live availability is temporarily unavailable. You can still explore the decks.",
  couldNotLoad: "Availability could not be loaded.",
  plan: {
    alt: {
      lower: "Lower deck with two suites, eight rooms, reception and service areas",
      main: "Main deck with two Royal Suites, library, gym, lounge, restaurant and outdoor terrace",
      sun: "Sun deck with shaded lounge, circular bar, two pools, sun loungers and an outdoor terrace",
    },
    furnished: ". Furnished overhead illustration.",
    closeup: (label, deck) => `${label} on the ${deck} deck plan`,
    space: (mark, name, place, places, crew) =>
      `${mark}, ${name}${places > 1 ? ` (${place} of ${places})` : ""}${crew ? ", crew only" : ""}. See it closer`,
    state: {
      open: "available",
      closed: "booked on this departure",
      unknown: "availability not checked yet",
      request: "contact reservations about this room",
    },
    booked: "Booked",
    preparing: "Preparing the deck plan…",
    failed: "The deck plan could not load.",
    reload: "Reload the plan",
  },
  modal: {
    close: (name) => `Close ${name}`,
    photoOf: (alt, photo, count) => `${alt}, photograph ${photo} of ${count}`,
    previous: "Previous photograph",
    next: "Next photograph",
    whereItIs: "Where it is",
    back: "Back to the deck plan",
    saveName: (name, label) => `${name}, cabin ${label}`,
  },
  chooseDeck: "Choose a deck",
};

const IT_DECK_WORD: Record<ShipDeckId, string> = {
  lower: "inferiore",
  main: "principale",
  sun: "sole",
};

const IT: DeckAtlasCopy = {
  dateLocale: "it-IT",
  usd: usdIt,
  voyages: {
    "3-nights-aswan-luxor": "3 notti · Da Assuan a Luxor",
    "4-nights-luxor-aswan": "4 notti · Da Luxor ad Assuan",
    "7-nights-luxor-aswan-luxor": "7 notti · Andata e ritorno",
  } as Record<StayDurationValue, string>,
  onRequest: "Su richiesta",
  spaceKind: { guest: "Spazio comune", crew: "Equipaggio e servizio" },
  cabinNote: {
    "Luxury King Cabin": "Letto king · vista panoramica sul Nilo",
    "Luxury Twin Cabin": "Due letti singoli · vista panoramica sul Nilo",
    "Luxury Suite": "Salotto separato · vista panoramica sul Nilo",
    "Royal Suite": "Salotto privato · vista privilegiata sul Nilo",
  },
  kingBed: "Letto king",
  upToGuests: (guests) => `Fino a ${guests} ospiti`,
  booked: "Prenotata",
  bookedRange: (range) => `Prenotata · ${range}`,
  contactAboutRoom: "Ci contatti per questa camera",
  availableOn: (date) => `Disponibile · ${date}`,
  bookedFor: (from, to) => `Prenotata dal ${from} al ${to}`,
  checkingAvailability: "Verifica della disponibilità…",
  chooseDepartureToCheck: "Scelga una partenza per verificare la disponibilità",
  comparableCabin: "Una cabina analoga",
  checkingDates: "Verifica delle date…",
  pleaseRetry: "Riprovi",
  noDates: "Nessuna data in programma",
  notOpenToGuests: "Non accessibile agli ospiti",
  selectToSeeCloser: "Selezioni per vederlo da vicino",
  deckNumber: (number) => `Ponte ${number}`,
  roomCount: (count) => `${count} camere`,
  deckTabs: "Ponte",
  deckTab: (name) => {
    const short = name.replace(/^ponte\s+/i, "");
    return short.charAt(0).toUpperCase() + short.slice(1);
  },
  swipe: "Scorra lungo il ponte ↔",
  spacesOnDeck: "Spazi su questo ponte",
  crewAndService: "Equipaggio e servizio",
  illustrated: "Piani dei ponti illustrati. Gli arredi sono indicativi.",
  stern: "Poppa",
  bow: "Prua",
  checkingFree: "Verifica delle cabine libere…",
  chooseDepartureFree: "Scelga una partenza per vedere quali cabine sono libere.",
  planKey: "Legenda",
  available: "Disponibile",
  bookedOnDate: "Prenotata in questa data",
  yourChoice: "La Sua scelta",
  makeItYours: "Un viaggio tutto Suo",
  findDeparture: "Trovi la Sua partenza",
  fieldVoyage: "Viaggio",
  fieldMonth: "Dal mese",
  fieldDeparture: "Partenza",
  fullyBooked: " · al completo",
  checkingLive: "Verifica in tempo reale delle cabine disponibili…",
  tryAgain: "Riprova",
  noDepartures: [
    "Nessuna partenza in programma in questo periodo. Scelga un mese successivo oppure ",
    "contatti le prenotazioni",
    ".",
  ],
  freeSummary: (total, deck, date) =>
    ` cabine libere su ${total} sul ${deck} per la partenza del ${date}.`,
  departing: (date) => `Partenza ${date}.`,
  allCabins: "Tutte le cabine di questo ponte",
  viewPhotos: "Vedi le fotografie della camera",
  perCabin: "per cabina · intero viaggio",
  perCabinHead: "Per cabina · intero viaggio",
  seeOtherDates: "Vedi altre date",
  checkAvailability: "Verifica la disponibilità",
  contactReservations: "Contatta le prenotazioni",
  viewRoom: "Vedi la camera",
  cabinsOnDeck: "Cabine su questo ponte",
  contactAboutRoomSentence: "Ci contatti per questa camera.",
  bookedOnDeparture: ", prenotata per questa partenza",
  loadingCabins: "Caricamento delle cabine dal sistema di prenotazione…",
  cabinsFailed: "Al momento non è stato possibile caricare le cabine. Riprovi tra qualche istante.",
  closerToSky: "Un po’ più vicino al cielo.",
  exploreLowerMain: "Esplori il ponte inferiore e quello principale per scegliere la Sua camera.",
  viewDeck: (deck) => `Vedi il ${deck}`,
  liveUnavailable:
    "La disponibilità in tempo reale non è al momento consultabile. Può comunque esplorare i ponti.",
  couldNotLoad: "Non è stato possibile caricare la disponibilità.",
  plan: {
    alt: {
      lower: "Ponte inferiore con due suite, otto camere, reception e aree di servizio",
      main: "Ponte principale con due Royal Suite, biblioteca, palestra, salone, ristorante e terrazza all’aperto",
      sun: "Ponte sole con salotto all’ombra, bar circolare, due piscine, lettini e terrazza all’aperto",
    },
    furnished: ". Illustrazione arredata vista dall’alto.",
    closeup: (label, deck) => `${label} sul piano del ponte ${IT_DECK_WORD[deck]}`,
    space: (mark, name, place, places, crew) =>
      `${mark}, ${name}${places > 1 ? ` (${place} di ${places})` : ""}${crew ? ", solo equipaggio" : ""}. Vedi da vicino`,
    state: {
      open: "disponibile",
      closed: "prenotata per questa partenza",
      unknown: "disponibilità non ancora verificata",
      request: "contatti le prenotazioni per questa camera",
    },
    booked: "Prenotata",
    preparing: "Preparazione del piano del ponte…",
    failed: "Non è stato possibile caricare il piano del ponte.",
    reload: "Ricarica il piano",
  },
  modal: {
    close: (name) => `Chiudi ${name}`,
    photoOf: (alt, photo, count) => `${alt}, fotografia ${photo} di ${count}`,
    previous: "Fotografia precedente",
    next: "Fotografia successiva",
    whereItIs: "Dove si trova",
    back: "Torna al piano del ponte",
    saveName: (name, label) => `${name}, cabina ${label}`,
  },
  chooseDeck: "Scelga un ponte",
};

export const DECK_ATLAS_COPY: Record<PublicLocale, DeckAtlasCopy> = { en: EN, it: IT };

/* ------------------------------------------------- the plan's own wording */

type ConfigWords = {
  kicker: string;
  eyebrow: string;
  title: string;
  introduction: string;
  decks: Record<ShipDeckId, { name: string; subtitle: string; description: string }>;
  spaces: Record<string, { name: string; line: string }>;
  roomName: (name: string) => string;
};

const CONFIG_IT: ConfigWords = {
  kicker: "Hathor · Una residenza intima sul fiume",
  eyebrow: "L’arte di vivere a bordo",
  title: "Il Suo posto sul Nilo",
  introduction:
    "Tre ponti. Un mondo tutto Suo. Entri a bordo di Hathor, esplori ogni ambiente e trovi quello che sente Suo.",
  decks: {
    lower: {
      name: "Ponte inferiore",
      subtitle: "Un mondo privato a filo d’acqua",
      description:
        "Suite e camere disposte attorno al cuore della nave. Selezioni una camera per scoprire il Suo prossimo viaggio.",
    },
    main: {
      name: "Ponte principale",
      subtitle: "Spazio per indugiare",
      description:
        "Le Royal Suite, una biblioteca silenziosa, ampi saloni e sale da pranzo aperte sul Nilo.",
    },
    sun: {
      name: "Ponte sole",
      subtitle: "Niente tra Lei e il cielo",
      description:
        "Salotti all’ombra, un bar circolare e due piscine. Un rifugio all’aria aperta, dalla prima all’ultima luce.",
    },
  },
  spaces: {
    "fac-lower-entrance": { name: "Ingresso", line: "Le passerelle sui due lati, da cui si sale a bordo dalla riva." },
    "fac-reception": { name: "Reception", line: "Il banco di accoglienza nel cuore del ponte inferiore, dove inizia ogni viaggio." },
    "fac-lower-stairs": { name: "Scale", line: "Tre scalinate verso il ponte principale: accanto alla reception e a poppa." },
    "fac-massage": { name: "Sala massaggi", line: "La sala trattamenti della Seneb Spa, per un massaggio tra una visita ai templi e l’altra." },
    "fac-office": { name: "Ufficio del direttore", line: "L’ufficio del direttore di bordo, a pochi passi dalla reception." },
    "fac-guides": { name: "Cabina delle guide", line: "La camera 9, dove alloggiano le guide egittologhe. Non accessibile agli ospiti." },
    "fac-kitchen": { name: "Cucina", line: "La cucina a prua, dove lo chef prepara ogni pasto a bordo." },
    "fac-crew": { name: "Alloggi dell’equipaggio", line: "Le cabine dell’equipaggio che si prende cura di Lei. Non accessibili agli ospiti." },
    "fac-main-entrance": { name: "Ingresso", line: "La passerella del ponte principale, che si apre sulla sala della biblioteca." },
    "fac-library": { name: "Biblioteca", line: "Scaffali di libri e poltrone da lettura: l’angolo silenzioso della nave." },
    "fac-main-stairs": { name: "Scale", line: "Verso il ponte inferiore e il ponte sole, ai due lati della biblioteca e a poppa." },
    "fac-gym": { name: "Palestra", line: "Tapis roulant, cyclette e pesi, per un allenamento mattutino con il Nilo accanto." },
    "fac-restroom": { name: "Servizi", line: "Servizi per gli ospiti accanto alla sala della biblioteca, vicino al salone." },
    "fac-lounge": { name: "Salone", line: "Divani profondi, un bancone bar e ampie finestre sul Nilo." },
    "fac-restaurant": { name: "Ristorante", line: "Dalla colazione alla cena a lume di candela, servite accanto a vetrate panoramiche." },
    "fac-terrace": { name: "Terrazza all’aperto", line: "Tavoli all’aria aperta a prua, per lunghi pranzi e serate sul fiume." },
    "fac-shade": { name: "Salotto all’ombra", line: "Divani e lettini sotto il pergolato, all’ombra nelle ore più calde." },
    "fac-sun-stairs": { name: "Scale", line: "Verso il ponte principale, accanto al salotto all’ombra." },
    "fac-bar": { name: "Bar circolare", line: "Drink al tramonto, serviti tutt’intorno al bancone rotondo." },
    "fac-pools": { name: "Due piscine", line: "Due piscine incassate nel ponte, con lettini su entrambi i lati." },
    "fac-loungers": { name: "Lettini", line: "File di lettini ai lati delle piscine e accanto alla terrazza, per lunghi pomeriggi al sole." },
    "fac-sun-terrace": { name: "Terrazza all’aperto", line: "Tavoli sotto gli ombrelloni a prua, con lo sguardo rivolto a monte del fiume." },
  },
  roomName: (name) => name.replace(/^Room\b/, "Camera"),
};

const CONFIG_WORDS: Partial<Record<PublicLocale, ConfigWords>> = { it: CONFIG_IT };

/** Translated text for a field still at its default; the dashboard's own text otherwise. */
function overDefault(value: string, fallback: string, translated: string): string {
  return value === fallback ? translated : value;
}

/** The plan's wording in a language — kicker, title, decks and room names. */
export function localizeShipConfig(
  config: ShipExperienceConfig,
  locale: PublicLocale,
): ShipExperienceConfig {
  const words = CONFIG_WORDS[locale];
  if (!words) return config;
  const base = DEFAULT_SHIP_EXPERIENCE;
  return {
    ...config,
    kicker: overDefault(config.kicker, base.kicker, words.kicker),
    eyebrow: overDefault(config.eyebrow, base.eyebrow, words.eyebrow),
    title: overDefault(config.title, base.title, words.title),
    introduction: overDefault(config.introduction, base.introduction, words.introduction),
    decks: config.decks.map((deck) => {
      const fallback = base.decks.find((item) => item.id === deck.id);
      const local = words.decks[deck.id];
      if (!fallback || !local) return deck;
      return {
        ...deck,
        name: overDefault(deck.name, fallback.name, local.name),
        subtitle: overDefault(deck.subtitle, fallback.subtitle, local.subtitle),
        description: overDefault(deck.description, fallback.description, local.description),
      };
    }),
    rooms: config.rooms.map((room) => {
      const fallback = base.rooms.find((item) => item.slotId === room.slotId);
      return fallback && room.name === fallback.name
        ? { ...room, name: words.roomName(room.name) }
        : room;
    }),
  };
}

/** A space's name and line in a language, unless the dashboard has reworded it. */
export function localizeSpace<T extends { id: string; name: string; line: string }>(
  space: T,
  defaults: { name: string; line: string } | undefined,
  locale: PublicLocale,
): T {
  const local = CONFIG_WORDS[locale]?.spaces[space.id];
  if (!local || !defaults) return space;
  return {
    ...space,
    name: overDefault(space.name, defaults.name, local.name),
    line: overDefault(space.line, defaults.line, local.line),
  };
}
