/** The selection sheet and the Add to My Voyage dialog in German; see selection-copy.ts. */

import { describeRoomTypesOnCruise } from "@/lib/booking-search-config";
import { placesIn, weekdayIn } from "@/lib/i18n/catalog-copy";
import type { SelectionCopy, SummaryWords } from "@/lib/i18n/selection-copy";

export const SELECTION_COPY_DE: SelectionCopy = {
  dateLocale: "de-DE",
  eyebrow: "Ihre Auswahl",
  tabsLabel: "Auswahl",
  favoritesTab: "Favoriten",
  closeSelection: "Auswahl schließen",
  close: "Schließen",
  nothingSaved: "Noch nichts gemerkt",
  nothingSavedBody:
    "Entdecken Sie die Reisen, Kabinen und Suiten der Hathor und merken Sie sich, was Sie anspricht: Hier finden Sie alles wieder, wenn Sie zurückkommen.",
  exploreHathor: "Hathor entdecken",
  viewDetails: "Details",
  remove: "Entfernen",
  removeLabel: (title) => `${title} aus den Favoriten entfernen`,
  decrease: (label) => `${label}: eine Person weniger`,
  increase: (label) => `${label}: eine Person mehr`,
  chooseVoyage: "Wählen Sie eine Reise, um Ihre Auswahl abzuschließen.",
  journeyOffers: (duration) => {
    const types = describeRoomTypesOnCruise(duration);
    return `Diese Reise bietet ${types === "a different room type" ? "einen anderen Unterkunftstyp" : types}.`;
  },
  beginsTitle: "Ihre Reise beginnt hier",
  beginsBody:
    "Wählen Sie Route und Unterkunft und gestalten Sie so Ihr Erlebnis an Bord der Hathor.",
  exploreVoyages: "Reisen entdecken",
  journey: "Route",
  ports: (ports) => placesIn("de", ports),
  nightsDays: (nights, days) => `${nights} Nächte / ${days} Tage`,
  departs: (day) => `Abfahrt am ${weekdayIn("de", day)}`,
  sailing: (date) => `Einschiffung: ${date}`,
  changeJourney: "Route ändern",
  accommodation: "Unterkunft",
  upTo: (capacity) => `Bis zu ${capacity} Gäste`,
  sizeCapacity: (sizeSqm, capacity) => `${sizeSqm} m² · Bis zu ${capacity} Gäste`,
  voyageType: "Reise",
  charterType: "Charter",
  viewSuite: "Suite ansehen",
  guests: "Gäste",
  adults: "Erwachsene",
  children: "Kinder",
  partyNote: "Ihre ganze Gruppe. Die Kabinen wählen Sie im weiteren Buchungsverlauf.",
  privateCharter: "Privatcharter",
  charterMeta: "Die Dahabiya ganz für Sie allein.",
  viewCharter: "Charter ansehen",
  indicativeFrom: "Richtpreis ab",
  priceNote:
    "Unverbindlicher Katalogpreis pro Kabine. Endpreis und Verfügbarkeit bestätigt Ihnen unsere Reservierung.",
  requestVoyage: "Diese Reise anfragen",
  continueBooking: "Buchung fortsetzen",
  continueExploring: "Weiter entdecken",
  changeTitle: "Wenn Sie die Reise ändern, kann sich Ihre gewählte Unterkunft ändern.",
  changeBody: (voyage) =>
    `${voyage} bietet Ihre aktuelle Unterkunft nicht an. Wenn Sie fortfahren, bleibt die neue Route bestehen und die Unterkunft wird zurückgesetzt, damit Sie neu wählen können.`,
  continue: "Fortfahren",
  keepCurrent: "Aktuelle Reise behalten",
  toCharterTitle: "Mit dem Wechsel zum Privatcharter wird Ihre gewählte Route gelöscht.",
  toCharterBody:
    "Beim Privatcharter gehört Ihrer Gruppe die ganze Dahabiya mit eigener Route. Er ersetzt daher die geplante Route und die Unterkunft in Meine Reise.",
  fromCharterTitle: "Mit einer geplanten Route wird Ihr Privatcharter entfernt.",
  fromCharterBody:
    "Meine Reise enthält entweder einen Privatcharter oder eine geplante Route. Wenn Sie fortfahren, wird der Charter entfernt und stattdessen diese Auswahl hinzugefügt.",
  keepCharter: "Privatcharter behalten",
};

export const SUMMARY_WORDS_DE: SummaryWords = {
  labels: {
    "Enquiry type": "Art der Anfrage",
    "Selected Journey": "Gewählte Reise",
    Route: "Route",
    Duration: "Dauer",
    "Departure day": "Abfahrtstag",
    "Selected Accommodation": "Gewählte Unterkunft",
    "Accommodation detail": "Details zur Unterkunft",
    Guests: "Gäste",
    "Guest also saved": "Außerdem gemerkt",
  },
  notCarriedOver: "Nicht übernommen: Die gemerkte Unterkunft ist auf dieser Route nicht verfügbar.",
  privateCharter: "Privatcharter",
  nightsDays: "$1 Nächte / $2 Tage",
  nightsShort: "($1 Nächte, ",
  upToGuests: "bis zu $1 Gäste",
  guestWords: { Adult: "Erwachsener", Adults: "Erwachsene", Child: "Kind", Children: "Kinder" },
};
