/**
 * The selection sheet (My Favorites / My Voyage) and the Add to My Voyage
 * dialog, in every public language. English is the live copy, character for
 * character. Cabin and suite names are product names and stay in English;
 * prices stay as the catalog states them.
 */

import { describeRoomTypesOnCruise, type StayDurationValue } from "@/lib/booking-search-config";
import { localizedHref, type PublicLocale, type TranslatedLocale } from "@/lib/i18n/locale";
import { placesIn, voyageNameIn, weekdayIn, weekdayLabelIn } from "@/lib/i18n/catalog-copy";
import { SELECTION_COPY_DE, SUMMARY_WORDS_DE } from "@/lib/i18n/selection-copy-de";
import {
  findResidence,
  findVoyage,
  parseCabinSlug,
  type ResolvedFavorite,
} from "@/lib/selection-catalog";

export type SelectionCopy = {
  /** Intl locale for the sailing date. */
  dateLocale: string;
  eyebrow: string;
  tabsLabel: string;
  favoritesTab: string;
  closeSelection: string;
  close: string;
  nothingSaved: string;
  nothingSavedBody: string;
  exploreHathor: string;
  viewDetails: string;
  remove: string;
  removeLabel: (title: string) => string;
  decrease: (label: string) => string;
  increase: (label: string) => string;
  chooseVoyage: string;
  journeyOffers: (duration: StayDurationValue) => string;
  beginsTitle: string;
  beginsBody: string;
  exploreVoyages: string;
  journey: string;
  ports: (ports: string) => string;
  nightsDays: (nights: number, days: number) => string;
  departs: (day: string) => string;
  sailing: (date: string) => string;
  changeJourney: string;
  accommodation: string;
  upTo: (capacity: number) => string;
  sizeCapacity: (sizeSqm: number, capacity: number) => string;
  /** A saved item's category: a voyage, a charter. */
  voyageType: string;
  charterType: string;
  viewSuite: string;
  guests: string;
  adults: string;
  children: string;
  partyNote: string;
  privateCharter: string;
  charterMeta: string;
  viewCharter: string;
  indicativeFrom: string;
  priceNote: string;
  requestVoyage: string;
  continueBooking: string;
  continueExploring: string;
  /* Add to My Voyage: the change-of-voyage dialog. */
  changeTitle: string;
  changeBody: (voyage: string) => string;
  continue: string;
  keepCurrent: string;
  /* Switching between the Private Charter and a scheduled journey. */
  toCharterTitle: string;
  toCharterBody: string;
  fromCharterTitle: string;
  fromCharterBody: string;
  keepCharter: string;
};

export const SELECTION_COPY: Record<PublicLocale, SelectionCopy> = {
  en: {
    dateLocale: "en-GB",
    eyebrow: "Your selections",
    tabsLabel: "Selections",
    favoritesTab: "Favorites",
    closeSelection: "Close selection",
    close: "Close",
    nothingSaved: "Nothing saved yet",
    nothingSavedBody:
      "Explore Hathor's voyages, cabins and suites, and save the experiences that speak to you. They will be waiting here when you return.",
    exploreHathor: "Explore Hathor",
    viewDetails: "View Details",
    remove: "Remove",
    removeLabel: (title) => `Remove ${title} from Favorites`,
    decrease: (label) => `Decrease ${label}`,
    increase: (label) => `Increase ${label}`,
    chooseVoyage: "Choose a voyage to complete your selection.",
    journeyOffers: (duration) => `This journey offers ${describeRoomTypesOnCruise(duration)}.`,
    beginsTitle: "Your voyage begins here",
    beginsBody:
      "Choose a journey and accommodation to begin shaping your experience aboard Hathor.",
    exploreVoyages: "Explore Voyages",
    journey: "Journey",
    ports: (ports) => ports,
    nightsDays: (nights, days) => `${nights} Nights / ${days} Days`,
    departs: (day) => `Departs ${day}`,
    sailing: (date) => `Sailing ${date}`,
    changeJourney: "Change Journey",
    accommodation: "Accommodation",
    upTo: (capacity) => `Up to ${capacity} guests`,
    sizeCapacity: (sizeSqm, capacity) => `${sizeSqm} m² · Up to ${capacity} guests`,
    voyageType: "Voyage",
    charterType: "Charter",
    viewSuite: "View Suite",
    guests: "Guests",
    adults: "Adults",
    children: "Children",
    partyNote: "Your whole party. You choose their cabins when you continue booking.",
    privateCharter: "Private Charter",
    charterMeta: "The Dahabiya, yours alone.",
    viewCharter: "View Charter",
    indicativeFrom: "Indicative from",
    priceNote:
      "Indicative catalog rate per cabin. Final pricing and availability are confirmed by our reservations team.",
    requestVoyage: "Request This Voyage",
    continueBooking: "Continue Booking",
    continueExploring: "Continue Exploring",
    changeTitle: "Changing your voyage may update your selected accommodation.",
    changeBody: (voyage) =>
      `${voyage} does not offer your current accommodation. Continuing will keep the new journey and clear the accommodation so you can choose again.`,
    continue: "Continue",
    keepCurrent: "Keep Current Voyage",
    toCharterTitle: "Switching to a private charter will clear your selected journey.",
    toCharterBody:
      "A private charter gives your party the whole Dahabiya on its own itinerary, so it replaces the scheduled journey and accommodation in My Voyage.",
    fromCharterTitle: "Choosing a scheduled journey will remove your private charter.",
    fromCharterBody:
      "My Voyage holds either a private charter or a scheduled journey. Continuing will remove the charter and add this selection instead.",
    keepCharter: "Keep Private Charter",
  },
  it: {
    dateLocale: "it-IT",
    eyebrow: "Le Sue selezioni",
    tabsLabel: "Selezioni",
    favoritesTab: "Preferiti",
    closeSelection: "Chiudi la selezione",
    close: "Chiudi",
    nothingSaved: "Ancora nessun preferito",
    nothingSavedBody:
      "Scopra i viaggi, le cabine e le suite di Hathor e salvi le esperienze che La ispirano: le ritroverà qui al Suo ritorno.",
    exploreHathor: "Scopri Hathor",
    viewDetails: "Dettagli",
    remove: "Rimuovi",
    removeLabel: (title) => `Rimuovi ${title} dai preferiti`,
    decrease: (label) => `${label}: uno in meno`,
    increase: (label) => `${label}: uno in più`,
    chooseVoyage: "Scelga un viaggio per completare la Sua selezione.",
    journeyOffers: (duration) => {
      const types = describeRoomTypesOnCruise(duration);
      return `Questo viaggio offre ${types === "a different room type" ? "un’altra tipologia di sistemazione" : types}.`;
    },
    beginsTitle: "Il Suo viaggio inizia qui",
    beginsBody:
      "Scelga un itinerario e una sistemazione per iniziare a dare forma alla Sua esperienza a bordo di Hathor.",
    exploreVoyages: "Scopri i viaggi",
    journey: "Itinerario",
    ports: (ports) => placesIn("it", ports),
    nightsDays: (nights, days) => `${nights} notti / ${days} giorni`,
    departs: (day) => `Partenza il ${weekdayIn("it", day)}`,
    sailing: (date) => `Imbarco: ${date}`,
    changeJourney: "Modifica l’itinerario",
    accommodation: "Sistemazione",
    upTo: (capacity) => `Fino a ${capacity} ospiti`,
    sizeCapacity: (sizeSqm, capacity) => `${sizeSqm} m² · Fino a ${capacity} ospiti`,
    voyageType: "Viaggio",
    charterType: "Charter",
    viewSuite: "Vedi i dettagli",
    guests: "Ospiti",
    adults: "Adulti",
    children: "Bambini",
    partyNote:
      "Tutto il Suo gruppo. Sceglierà le cabine proseguendo con la prenotazione.",
    privateCharter: "Charter privato",
    charterMeta: "La dahabiya, solo per Lei.",
    viewCharter: "Scopri il charter",
    indicativeFrom: "Prezzo indicativo da",
    priceNote:
      "Tariffa indicativa di listino per cabina. Prezzo finale e disponibilità sono confermati dal nostro ufficio prenotazioni.",
    requestVoyage: "Richiedi questo viaggio",
    continueBooking: "Continua la prenotazione",
    continueExploring: "Continua a esplorare",
    changeTitle: "Se cambia viaggio, la sistemazione scelta potrebbe essere aggiornata.",
    changeBody: (voyage) =>
      `${voyage} non offre la Sua sistemazione attuale. Continuando, verrà mantenuto il nuovo itinerario e la sistemazione sarà azzerata, così potrà sceglierne un’altra.`,
    continue: "Continua",
    keepCurrent: "Mantieni il viaggio attuale",
    toCharterTitle: "Scegliendo un charter privato, l’itinerario selezionato verrà rimosso.",
    toCharterBody:
      "Con un charter privato l’intera dahabiya è riservata al Suo gruppo, con un itinerario su misura: sostituisce quindi l’itinerario programmato e la sistemazione che ha scelto.",
    fromCharterTitle: "Scegliendo un itinerario programmato, il charter privato verrà rimosso.",
    fromCharterBody:
      "La Sua selezione può contenere un charter privato oppure un itinerario programmato. Continuando, il charter verrà rimosso e sarà aggiunta questa scelta.",
    keepCharter: "Mantieni il charter privato",
  },
  de: SELECTION_COPY_DE,
};

/**
 * A saved item's words and link in a language. English returns the item as
 * the catalog resolved it; a translation rebuilds the same facts from the
 * same live catalog entries.
 */
export function favoriteIn(item: ResolvedFavorite, locale: PublicLocale): ResolvedFavorite {
  if (locale === "en") return item;
  const t = SELECTION_COPY[locale];
  const href = localizedHref(item.href, locale);
  const { ref } = item;

  if (ref.type === "charter") {
    return {
      ...item,
      title: t.privateCharter,
      typeLabel: t.charterType,
      meta: t.charterMeta.replace(/\.$/, ""),
      href,
    };
  }

  if (ref.type === "cabin") {
    const pair = parseCabinSlug(ref.slug);
    const voyage = pair ? findVoyage(pair.voyageSlug) : null;
    const residence = pair ? findResidence(pair.residenceSlug) : null;
    if (!voyage || !residence) return { ...item, href };
    return {
      ...item,
      typeLabel: t.nightsDays(voyage.nights, voyage.days),
      meta: `${t.ports(voyage.ports)} · ${t.departs(voyage.departureDay)} · ${t.upTo(residence.capacity)}`,
      href,
    };
  }

  if (ref.type === "voyage") {
    const voyage = findVoyage(ref.slug);
    if (!voyage) return { ...item, href };
    return {
      ...item,
      title: t.ports(voyage.ports),
      typeLabel: t.voyageType,
      meta: `${t.nightsDays(voyage.nights, voyage.days)} · ${t.departs(voyage.departureDay)}`,
      href,
    };
  }

  const residence = findResidence(ref.slug);
  if (!residence) return { ...item, href };
  return {
    ...item,
    typeLabel: t.accommodation,
    meta: t.sizeCapacity(residence.sizeSqm, residence.capacity),
    href,
  };
}

/** How a language rewrites the English selection summary; `$1` and `$2` are the numbers. */
export type SummaryWords = {
  labels: Record<string, string>;
  notCarriedOver: string;
  privateCharter: string;
  nightsDays: string;
  nightsShort: string;
  upToGuests: string;
  guestWords: Record<string, string>;
};

const SUMMARY_WORDS: Record<TranslatedLocale, SummaryWords> = {
  it: {
    labels: {
      "Enquiry type": "Tipo di richiesta",
      "Selected Journey": "Viaggio scelto",
      Route: "Itinerario",
      Duration: "Durata",
      "Departure day": "Giorno di partenza",
      "Selected Accommodation": "Sistemazione scelta",
      "Accommodation detail": "Dettagli della sistemazione",
      Guests: "Ospiti",
      "Guest also saved": "Ha salvato anche",
    },
    notCarriedOver: "Non riportata: la sistemazione salvata non è disponibile su questo itinerario.",
    privateCharter: "Charter privato",
    nightsDays: "$1 notti / $2 giorni",
    nightsShort: "($1 notti, ",
    upToGuests: "fino a $1 ospiti",
    guestWords: { Adult: "adulto", Adults: "adulti", Child: "bambino", Children: "bambini" },
  },
  de: SUMMARY_WORDS_DE,
};

/**
 * One line of the selection summary, as the guest reads it on the form. The
 * reservations team's email keeps the English summary; this changes only
 * what the page shows.
 */
export function summaryLineIn(
  line: { label: string; value: string },
  locale: PublicLocale,
  voyageSlug?: string,
): { label: string; value: string } {
  if (locale === "en") return line;
  const words = SUMMARY_WORDS[locale];
  const label = words.labels[line.label] ?? line.label;
  let value = line.value;
  switch (line.label) {
    case "Selected Journey":
      value = voyageSlug ? voyageNameIn(locale, voyageSlug, value) : value;
      break;
    case "Departure day":
      value = weekdayLabelIn(locale, value);
      break;
    case "Selected Accommodation":
      if (value.startsWith("Not carried over")) {
        value = words.notCarriedOver;
      }
      break;
    default:
      value = placesIn(
        locale,
        value
          .replace(/\bPrivate Charter\b/g, words.privateCharter)
          .replace(/(\d+) Nights \/ (\d+) Days/g, words.nightsDays)
          .replace(/\((\d+)N /g, words.nightsShort)
          .replace(/\bup to (\d+) guests\b/g, words.upToGuests)
          .replace(/\b(\d+) (Adults?|Child(?:ren)?)\b/g, (_, n: string, word: string) => `${n} ${words.guestWords[word] ?? word}`),
      );
  }
  return { label, value };
}
