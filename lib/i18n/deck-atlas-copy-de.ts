/** The homepage deck planner in German; see deck-atlas-copy.ts. */
import type { DeckAtlasCopy, ConfigWords } from "@/lib/i18n/deck-atlas-copy";
import { usdDe } from "@/lib/i18n/format-de";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { ShipDeckId } from "@/lib/ship-experience-shared";

const DE_DECK_WORD: Record<ShipDeckId, string> = {
  lower: "Unterdeck",
  main: "Hauptdeck",
  sun: "Sonnendeck",
};

/* The page lowers a deck's name for the English sentence; German nouns keep their capital. */
const deckNoun = (deck: string) => deck.charAt(0).toUpperCase() + deck.slice(1);

export const DECK_ATLAS_COPY_DE: DeckAtlasCopy = {
  dateLocale: "de-DE",
  usd: usdDe,
  voyages: {
    "3-nights-aswan-luxor": "3 Nächte · Von Assuan nach Luxor",
    "4-nights-luxor-aswan": "4 Nächte · Von Luxor nach Assuan",
    "7-nights-luxor-aswan-luxor": "7 Nächte · Rundreise",
  } as Record<StayDurationValue, string>,
  onRequest: "Auf Anfrage",
  spaceKind: { guest: "Gemeinschaftsbereich", crew: "Crew und Service" },
  cabinNote: {
    "Luxury King Cabin": "Kingsize-Bett · Panoramablick auf den Nil",
    "Luxury Twin Cabin": "Zwei Einzelbetten · Panoramablick auf den Nil",
    "Luxury Suite": "Separater Wohnbereich · Panoramablick auf den Nil",
    "Royal Suite": "Privater Wohnbereich · bester Blick auf den Nil",
  },
  kingBed: "Kingsize-Bett",
  upToGuests: (guests) => `Bis zu ${guests} Gäste`,
  booked: "Gebucht",
  bookedRange: (range) => `Gebucht · ${range}`,
  contactAboutRoom: "Kontaktieren Sie uns zu dieser Kabine",
  availableOn: (date) => `Verfügbar · ${date}`,
  bookedFor: (from, to) => `Gebucht vom ${from} bis ${to}`,
  checkingAvailability: "Verfügbarkeit wird geprüft…",
  chooseDepartureToCheck: "Wählen Sie eine Abfahrt, um die Verfügbarkeit zu prüfen",
  comparableCabin: "Eine vergleichbare Kabine",
  checkingDates: "Termine werden geprüft…",
  pleaseRetry: "Erneut versuchen",
  noDates: "Keine Termine geplant",
  notOpenToGuests: "Für Gäste nicht zugänglich",
  selectToSeeCloser: "Zum Vergrößern auswählen",
  deckNumber: (number) => `Deck ${number}`,
  roomCount: (count) => `${count} Kabinen`,
  deckTabs: "Deck",
  deckTab: (name) => name,
  swipe: "Über das Deck wischen ↔",
  spacesOnDeck: "Bereiche auf diesem Deck",
  crewAndService: "Crew und Service",
  illustrated: "Illustrierte Deckpläne. Die Einrichtung ist beispielhaft.",
  stern: "Heck",
  bow: "Bug",
  checkingFree: "Freie Kabinen werden geprüft…",
  chooseDepartureFree: "Wählen Sie eine Abfahrt, um freie Kabinen zu sehen.",
  planKey: "Legende",
  available: "Verfügbar",
  bookedOnDate: "An diesem Termin gebucht",
  yourChoice: "Ihre Wahl",
  makeItYours: "Machen Sie daraus Ihre Reise",
  findDeparture: "Finden Sie Ihre Abfahrt",
  fieldVoyage: "Reise",
  fieldMonth: "Ab Monat",
  fieldDeparture: "Abfahrt",
  fullyBooked: " · ausgebucht",
  checkingLive: "Verfügbare Kabinen werden live geprüft…",
  tryAgain: "Erneut versuchen",
  noDepartures: [
    "In diesem Zeitraum sind keine Abfahrten geplant. Wählen Sie einen späteren Monat oder ",
    "kontaktieren Sie die Reservierung",
    ".",
  ],
  freeSummary: (total, deck, date) =>
    ` von ${total} Kabinen frei auf dem ${deckNoun(deck)} für die Abfahrt am ${date}.`,
  departing: (date) => `Abfahrt am ${date}.`,
  allCabins: "Alle Kabinen auf diesem Deck",
  viewPhotos: "Fotos der Kabine ansehen",
  perCabin: "pro Kabine · gesamte Reise",
  entireVoyage: "gesamte Reise",
  perCabinHead: "Pro Kabine · gesamte Reise",
  seeOtherDates: "Andere Termine ansehen",
  checkAvailability: "Verfügbarkeit prüfen",
  contactReservations: "Reservierung kontaktieren",
  viewRoom: "Kabine ansehen",
  cabinsOnDeck: "Kabinen auf diesem Deck",
  contactAboutRoomSentence: "Kontaktieren Sie uns zu dieser Kabine.",
  bookedOnDeparture: ", für diese Abfahrt gebucht",
  loadingCabins: "Kabinen werden aus dem Buchungssystem geladen…",
  cabinsFailed: "Die Kabinen konnten gerade nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.",
  closerToSky: "Ein wenig näher am Himmel.",
  exploreLowerMain: "Erkunden Sie Unter- und Hauptdeck, um Ihre Kabine zu wählen.",
  viewDeck: (deck) => `${deckNoun(deck)} ansehen`,
  liveUnavailable:
    "Die Live-Verfügbarkeit ist derzeit nicht abrufbar. Die Decks können Sie trotzdem erkunden.",
  couldNotLoad: "Die Verfügbarkeit konnte nicht geladen werden.",
  plan: {
    alt: {
      lower: "Unterdeck mit zwei Suiten, acht Kabinen, Rezeption und Servicebereichen",
      main: "Hauptdeck mit zwei Royal Suites, Bibliothek, Fitnessraum, Lounge, Restaurant und Außenterrasse",
      sun: "Sonnendeck mit schattiger Lounge, runder Bar, zwei Pools, Liegen und Außenterrasse",
    },
    furnished: ". Möblierte Illustration von oben.",
    closeup: (label, deck) => `${label} im Plan des ${DE_DECK_WORD[deck]}s`,
    space: (mark, name, place, places, crew) =>
      `${mark}, ${name}${places > 1 ? ` (${place} von ${places})` : ""}${crew ? ", nur Crew" : ""}. Vergrößert ansehen`,
    state: {
      open: "verfügbar",
      closed: "für diese Abfahrt gebucht",
      unknown: "Verfügbarkeit noch nicht geprüft",
      request: "kontaktieren Sie die Reservierung zu dieser Kabine",
    },
    booked: "Gebucht",
    preparing: "Deckplan wird vorbereitet…",
    failed: "Der Deckplan konnte nicht geladen werden.",
    reload: "Plan neu laden",
  },
  modal: {
    close: (name) => `${name} schließen`,
    photoOf: (alt, photo, count) => `${alt}, Foto ${photo} von ${count}`,
    previous: "Vorheriges Foto",
    next: "Nächstes Foto",
    whereItIs: "Lage an Bord",
    back: "Zurück zum Deckplan",
    saveName: (name, label) => `${name}, Kabine ${label}`,
  },
  chooseDeck: "Wählen Sie ein Deck",
};

export const CONFIG_DE: ConfigWords = {
  kicker: "Hathor · Eine intime Residenz auf dem Fluss",
  eyebrow: "Die Kunst des Lebens an Bord",
  title: "Ihr Platz auf dem Nil",
  introduction:
    "Drei Decks. Eine Welt für sich. Kommen Sie an Bord der Hathor, erkunden Sie jeden Raum und finden Sie den, der sich nach Ihnen anfühlt.",
  decks: {
    lower: {
      name: "Unterdeck",
      subtitle: "Eine private Welt dicht am Wasser",
      description:
        "Suiten und Kabinen rund um das Herz des Schiffes. Wählen Sie eine Kabine und entdecken Sie Ihre nächste Reise.",
    },
    main: {
      name: "Hauptdeck",
      subtitle: "Raum zum Verweilen",
      description:
        "Die Royal Suites, eine stille Bibliothek, weite Lounges und Speisesäle mit Blick auf den Nil.",
    },
    sun: {
      name: "Sonnendeck",
      subtitle: "Nichts zwischen Ihnen und dem Himmel",
      description:
        "Schattige Lounges, eine runde Bar und zwei Pools. Ein Rückzugsort unter freiem Himmel, vom ersten bis zum letzten Licht.",
    },
  },
  spaces: {
    "fac-lower-entrance": { name: "Eingang", line: "Die Gangways an beiden Seiten, über die Sie vom Ufer an Bord kommen." },
    "fac-reception": { name: "Rezeption", line: "Der Empfang im Herzen des Unterdecks, an dem jede Reise beginnt." },
    "fac-lower-stairs": { name: "Treppen", line: "Drei Treppen zum Hauptdeck: neben der Rezeption und am Heck." },
    "fac-massage": { name: "Massageraum", line: "Der Behandlungsraum des Seneb Spa, für eine Massage zwischen zwei Tempelbesuchen." },
    "fac-office": { name: "Büro des Managers", line: "Das Büro des Schiffsmanagers, nur wenige Schritte von der Rezeption entfernt." },
    "fac-guides": { name: "Kabine der Reiseleiter", line: "Kabine 9, in der die ägyptologischen Reiseleiter wohnen. Für Gäste nicht zugänglich." },
    "fac-kitchen": { name: "Küche", line: "Die Küche am Bug, in der der Küchenchef jede Mahlzeit an Bord zubereitet." },
    "fac-crew": { name: "Crew-Quartiere", line: "Die Kabinen der Crew, die sich um Sie kümmert. Für Gäste nicht zugänglich." },
    "fac-main-entrance": { name: "Eingang", line: "Die Gangway des Hauptdecks, die sich zur Bibliothek hin öffnet." },
    "fac-library": { name: "Bibliothek", line: "Bücherregale und Lesesessel: die stille Ecke des Schiffes." },
    "fac-main-stairs": { name: "Treppen", line: "Zum Unter- und Sonnendeck, zu beiden Seiten der Bibliothek und am Heck." },
    "fac-gym": { name: "Fitnessraum", line: "Laufband, Ergometer und Gewichte, für das Morgentraining mit dem Nil an Ihrer Seite." },
    "fac-restroom": { name: "Toilette", line: "Eine Gästetoilette neben der Bibliothek, nahe der Lounge." },
    "fac-lounge": { name: "Lounge", line: "Tiefe Sofas, eine Bar und große Fenster zum Nil." },
    "fac-restaurant": { name: "Restaurant", line: "Vom Frühstück bis zum Abendessen bei Kerzenlicht, serviert an Panoramafenstern." },
    "fac-terrace": { name: "Außenterrasse", line: "Tische unter freiem Himmel am Bug, für lange Mittagessen und Abende auf dem Fluss." },
    "fac-shade": { name: "Schattige Lounge", line: "Sofas und Tagesbetten unter der Pergola, schattig auch in der Mittagshitze." },
    "fac-sun-stairs": { name: "Treppen", line: "Zum Hauptdeck, neben der schattigen Lounge." },
    "fac-bar": { name: "Runde Bar", line: "Drinks bei Sonnenuntergang, rund um die runde Theke serviert." },
    "fac-pools": { name: "Zwei Pools", line: "Zwei ins Deck eingelassene Pools mit Liegen auf beiden Seiten." },
    "fac-loungers": { name: "Liegen", line: "Liegenreihen an den Pools und neben der Terrasse, für lange Nachmittage in der Sonne." },
    "fac-sun-terrace": { name: "Außenterrasse", line: "Tische unter Sonnenschirmen am Bug, mit Blick flussaufwärts." },
  },
  roomName: (name) => name.replace(/^Room\b/, "Kabine"),
};
