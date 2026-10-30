/**
 * The booking journey in German: formal "Sie", product names in English,
 * prices in US dollars with German separators. Text only: nothing here changes
 * a price, an availability rule or what the booking request sends.
 */

import { utcParts } from "@/components/booking/journey/model";
import { CARD_SURCHARGE_PERCENT } from "@/lib/card-surcharge";
import type { BookingCopy } from "@/lib/i18n/booking-copy";
import { COUNTRY_NAMES_DE } from "@/lib/i18n/countries-de";
import { NBSP } from "@/lib/i18n/format-de";

const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_SHORT_DE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
const WEEKDAYS_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const deShortDate = (iso: string) => {
  const { day, month, year } = utcParts(iso);
  return `${day}. ${MONTHS_SHORT_DE[month]} ${year}`;
};
const deLongDate = (iso: string) => {
  const { weekday, day, month, year } = utcParts(iso);
  return `${WEEKDAYS_DE[weekday]}, ${day}. ${MONTHS_DE[month]} ${year}`;
};
/** "2,5 %": the card surcharge with a German decimal comma and space. */
const SURCHARGE_DE = `${String(CARD_SURCHARGE_PERCENT).replace(".", ",")}${NBSP}%`;
/** "7.000 USD", "7.000,50 USD": US dollars, German separators, currency last. */
const deMoney = (cents: number) =>
  `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(cents / 100)
    .replace(/[,.]/g, mark => (mark === "," ? "." : ","))}${NBSP}USD`;
const deCount = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const deJoin = (items: string[]) =>
  items.length <= 1 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} und ${items[items.length - 1]}`;

/** Server messages the guest can meet in the journey, in German. */
const SERVER_DE: Record<string, string> = {
  "Too many requests. Please wait and try again.": "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
  "The requested rooms or hold are no longer available. Start a new selection.":
    "Die angefragten Kabinen oder die Reservierung sind nicht mehr verfügbar. Bitte beginnen Sie eine neue Auswahl.",
  "The booking request is invalid or does not match this checkout attempt.":
    "Die Buchungsanfrage ist ungültig oder passt nicht zu diesem Vorgang.",
  "Please enter a name without web addresses.": "Bitte geben Sie einen Namen ohne Webadressen ein.",
  "Guest count exceeds cabin capacity.": "Die Gästezahl übersteigt die Kapazität der Kabine.",
  "Use an international phone number, for example +201234567890.":
    "Bitte verwenden Sie eine internationale Telefonnummer, zum Beispiel +201234567890.",
  "Booking code and email did not match": "Buchungscode und E-Mail-Adresse stimmen nicht überein.",
  "Reservation acknowledgement is required": "Bitte bestätigen Sie die Buchungsbedingungen.",
  "Please try again.": "Bitte versuchen Sie es erneut.",
  "Please complete the security check and try again.": "Bitte schließen Sie die Sicherheitsprüfung ab und versuchen Sie es erneut.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "Die Sicherheitsprüfung ist nicht verfügbar. Bitte kontaktieren Sie direkt unsere Reservierung.",
  "The security check is temporarily unavailable. Please try again.":
    "Die Sicherheitsprüfung ist vorübergehend nicht verfügbar. Bitte versuchen Sie es erneut.",
  "The security check expired or could not be verified. Please try again.":
    "Die Sicherheitsprüfung ist abgelaufen oder konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.",
  "Database is busy. Please wait a moment and try again.":
    "Die Datenbank ist ausgelastet. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
  "Invalid booking authorization": "Die Berechtigung für diese Buchung ist ungültig.",
  "Invalid email address": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
  "Validation failed": "Die Prüfung der Angaben ist fehlgeschlagen.",
  "Internal server error": "Interner Serverfehler.",
};
const SERVER_FALLBACK_DE = "Der Vorgang konnte nicht abgeschlossen werden.";

export const BOOKING_COPY_DE: BookingCopy = {
  locale: "de",
  money: deMoney,
  monthLabel: (year, month) => `${MONTHS_DE[month]} ${year}`,
  shortDate: deShortDate,
  longDate: deLongDate,
  weekdayShort: iso => WEEKDAYS_DE[utcParts(iso).weekday].slice(0, 2).toUpperCase(),
  folioRange: (fromIso, toIso) => `${deShortDate(fromIso)} – ${deShortDate(toIso)}`,
  stageLabel: stage => {
    if (stage.milestone === "INITIAL") return "Wenn Hathor Ihnen die Rechnung sendet";
    if (!stage.dueAt) return stage.milestone;
    if (stage.milestone === "BALANCE") return `Bis ${deLongDate(stage.dueAt)}`;
    const days = stage.milestone === "DAY_60" ? 60 : 45;
    return `Bis ${deLongDate(stage.dueAt)} · ${days} Tage vor Abfahrt`;
  },
  weekdayHeads: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  adults: count => deCount(count, "Erwachsener", "Erwachsene"),
  children: count => deCount(count, "Kind", "Kinder"),
  kindCount: (count, kind) => (kind === "adult" ? deCount(count, "Erwachsener", "Erwachsene") : deCount(count, "Kind", "Kinder")),
  partyLine: (adults, children) =>
    [deCount(adults, "Erwachsener", "Erwachsene"), children > 0 ? deCount(children, "Kind", "Kinder") : null].filter(Boolean).join(" · "),
  cabins: count => deCount(count, "Kabine", "Kabinen"),
  cabinsTitle: count => deCount(count, "Kabine", "Kabinen"),
  nights: count => deCount(count, "Nacht", "Nächte"),
  guests: count => deCount(count, "Gast", "Gäste"),
  joinAnd: deJoin,
  countryName: (code, english) => COUNTRY_NAMES_DE[code] ?? english,
  serverMessage: message => {
    if (SERVER_DE[message]) return SERVER_DE[message];
    // Validation messages arrive as "Field: message".
    const detail = message.split(": ").slice(1).join(": ");
    return SERVER_DE[detail] ?? SERVER_FALLBACK_DE;
  },

  steps: ["Reise", "Gäste und Suiten", "Daten und Zahlung", "Anfrage gesendet"],
  backTo: { 2: "Reise", 3: "Gäste und Suiten" },
  progressLabel: "Buchungsfortschritt",
  stepOf: (step, of) => `Schritt ${step} von ${of}`,
  bannerOf: "von 04",
  bannerKicker: (step, kicker) => `Schritt ${step} von 4 · ${kicker}`,
  bandLine: ["Ein langsamerer Weg", "zu einem größeren Ägypten"],
  bandWords: "Luxus. Erbe. Zugehörigkeit.",
  scroll: "Scrollen",
  guideHeading: "Ihr Wegweiser für diesen Schritt",
  done: "(erledigt)",
  nextToDo: "(als Nächstes)",
  edit: "Ändern",
  editLabel: label => `${label} ändern`,
  actionBarLabel: "Ihre Reise und der nächste Schritt",
  close: "Schließen",
  oneMoment: "Einen Moment…",

  voyage: {
    chooseItinerary: "Wählen Sie Ihre Route",
    departureCaption: day => `Jeden ${day}`,
    departsOn: day => `Abfahrt jeden ${day}`,
    nightsAndDay: (nights, day) => `${deCount(nights, "Nacht", "Nächte")} · jeden ${day}`,
    itinerary: title => `Route · ${title}`,
    expandAll: "Alle öffnen",
    collapseAll: "Alle schließen",
    day: day => `Tag ${day}`,
    // German paths open with the place, then a comma or a bracket: "Assuan, Einschiffung".
    placeFromPath: path => (path.split("→")[0] ?? path).replace(/\s*[,(].*$/, "").trim(),
  },
  calendar: {
    selectDate: "Wählen Sie Ihren Abfahrtstermin",
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    noSailings: "Keine Abfahrten",
    dayLabel: (date, from) => `Abfahrt am ${date}${from !== null ? `, ab ${from}` : ""}`,
    available: "Verfügbare Abfahrt",
    unavailable: "Nicht verfügbar",
    departures: "Verfügbare Abfahrten",
    empty: "Für diese Reise sind derzeit keine Abfahrten buchbar. Wählen Sie eine andere Route oder kontaktieren Sie unsere Reservierung.",
    noneFrom: month => `Keine verfügbaren Abfahrten ab ${month}.`,
    from: amount => `Ab ${amount}`,
    showFewer: "Weniger Termine anzeigen",
    showAll: count => `Alle ${count} Abfahrten anzeigen`,
    only: day => `Abfahrten nur am ${day}.`,
  },
  rail: {
    summaryLabel: "Zusammenfassung Ihrer Reise",
    title: "Ihre Reise",
    barLabel: "Ihre Reise",
    journey: "Reise",
    dates: "Termine",
    guests: "Gäste",
    accommodation: "Unterkunft",
    payment: "Zahlung",
    selectDates: "Termin wählen",
    chooseDate: "Datum wählen",
    notSelected: "Noch nicht gewählt",
    noGuests: "Noch keine Gäste",
    noCabin: "Noch keine Kabine",
    to: date => `bis ${date}`,
    total: cabins => (cabins > 1 ? `Gesamt · ${deCount(cabins, "Kabine", "Kabinen")}` : "Reisepreis gesamt"),
    pending: "Unterkunft wählen",
    pendingFine: "Der Gesamtpreis erscheint, sobald alle Gäste eine Kabine haben.",
    fine: nights => `Gesamte Reise mit ${nights} Nächten, Preise pro Kabine. Steuern und Service inklusive.`,
    tagline: "Ein höherer Rhythmus",
  },

  journey: {
    kicker: "Reise",
    title: "Planen Sie Ihre Reise",
    lede: "Drei außergewöhnliche Reisen. Ein zeitloser Fluss.",
    quote: "Mehr als eine Reise.",
    guide: [
      { label: "Wählen Sie Ihre Reise", hint: "3, 4 oder 7 Nächte auf dem Nil" },
      { label: "Wählen Sie einen Abfahrtstermin", hint: "Verfügbare Abfahrten sind hervorgehoben" },
      { label: "Weiter zu Gästen und Suiten", hint: "Noch ist nichts reserviert" },
    ],
    mapChoice: roomId =>
      `Auswahl aus dem Schiffsplan: Kabine ${roomId}. Sie wird beim Absenden Ihrer Anfrage erneut geprüft und reserviert; noch ist nichts reserviert.`,
    chooseFreely: "Lieber frei wählen",
    yourDeparture: "Ihre Abfahrt",
    datesHelp: "Brauchen Sie einen anderen Termin? Wenn Ihre Wunschabfahrt nicht dabei ist,",
    datesHelpLink: "kontaktieren Sie unsere Reservierung",
    chooseToContinue: "Wählen Sie einen Abfahrtstermin, um fortzufahren.",
    checking: "Verfügbarkeit wird geprüft…",
    checkingShort: "Prüfung…",
    continueLong: "Weiter zu Gästen und Suiten",
    continueShort: "Weiter",
    chooseDate: "Datum wählen",
    tileChoose: "Noch offen",
    chooseDepartureDate: "Abfahrtstermin wählen",
    departs: date => `Abfahrt ${date}`,
    loadingDates: "Termine werden geladen…",
    noOpenDates: "Keine Termine verfügbar",
    perCabin: "pro Kabine, gesamte Reise",
    perUnitVoyage: unit => `${unit}, gesamte Reise`,
    barContinueLabel: "Weiter zu Gästen und Suiten",
    blocker: "Wählen Sie zuerst einen Abfahrtstermin: Verfügbare Termine sind im Kalender hervorgehoben.",
    tabs: { voyage: "Reise", date: "Datum", review: "Überblick", toChoose: "Noch offen", nothingHeld: "Nichts reserviert" },
    departure: "Abfahrt",
    guests: "Gäste",
  },
  sheets: {
    dateTitle: "Wählen Sie Ihren Abfahrtstermin",
    datePick: "Tippen Sie auf eines der goldenen Daten.",
    applyDate: "Datum übernehmen",
    clearDate: "Datum löschen",
    clearSelection: "Auswahl löschen",
    guestsTitle: "Wer reist mit",
    guestsLede: "Im nächsten Schritt weisen Sie jedem Gast eine Kabine zu.",
    done: party => `Fertig · ${party}`,
  },
  counters: {
    adults: "Erwachsene",
    adultsHint: "Ab 12 Jahren",
    children: "Kinder",
    childrenHint: "2 bis 11 Jahre",
    fewer: label => (label === "Erwachsene" ? "Ein Erwachsener weniger" : "Ein Kind weniger"),
    more: label => (label === "Erwachsene" ? "Ein Erwachsener mehr" : "Ein Kind mehr"),
  },

  suites: {
    title: "Wählen Sie Ihre Kabine oder Suite",
    lede: "Alle Kabinen des Schiffes für den gewählten Termin. Verteilen Sie Ihre Gäste nach Wunsch: per Drag-and-drop oder indem Sie an der Kabine angeben, wie viele Erwachsene und Kinder dort wohnen.",
    mapChoice: roomId =>
      `Aus dem Schiffsplan: Kabine ${roomId}. Verteilen Sie Ihre Gäste auf diesen Kabinentyp. Die genaue Kabine wird beim Absenden Ihrer Anfrage erneut geprüft; noch ist sie nicht reserviert.`,
    everyCabin: "Alle Kabinen dieser Abfahrt · Gäste verteilen",
    filterLabel: "Kabinen nach Typ filtern",
    allRooms: "Alle Kabinen",
    cabinCount: count => `${count} Kabinen`,
    showing: (cabins, free) => `Angezeigte Kabinen: ${cabins} · ${free} frei an diesem Termin`,
    hiddenByFilter: count =>
      count === 1 ? "1 Kabine mit Ihren Gästen ist durch den Filter ausgeblendet." : `${count} Kabinen mit Ihren Gästen sind durch den Filter ausgeblendet.`,
    showAllRooms: "Alle Kabinen anzeigen",
    cabinAria: (roomType, index, inside, capacity) => `${roomType}, Kabine ${index}, ${inside} von ${capacity} Gästen`,
    cabinOutAria: (roomType, index) => `${roomType}, Kabine ${index}, an diesem Termin nicht verfügbar`,
    saveName: (roomType, voyage) => `${roomType}, Reise ${voyage}`,
    inCart: roomType => `Die ${roomType} für diese Abfahrt liegt in Ihrem Warenkorb.`,
    cabinNumber: index => `Kabine ${index}`,
    shownInPreview: label => `Die ${label} wird in der Vorschau gezeigt`,
    showInPreview: label => `${label} in der Vorschau zeigen`,
    selected: "Ausgewählt",
    select: "Auswählen",
    perCabinVoyage: "pro Kabine · gesamte Reise",
    entireVoyage: "gesamte Reise",
    upTo: capacity => `Bis zu ${capacity} Gäste`,
    bed: { "Luxury King Cabin": "Kingsize-Bett", "Luxury Twin Cabin": "Einzelbetten" },
    note: {
      "Luxury King Cabin": "Kingsize-Bett",
      "Luxury Twin Cabin": "Einzelbetten",
      "Luxury Suite": "Separater Wohnbereich",
      "Royal Suite": "Privater Wohnbereich",
    },
    viewRoomLabel: roomType => `${roomType} ansehen (öffnet in einem neuen Tab)`,
    viewRoom: "Kabine ansehen",
    unavailableDate: "An diesem Termin nicht verfügbar",
    seatsTaken: (inside, capacity) => `${inside} von ${capacity} Plätzen belegt`,
    menuLabel: (label, cabin) => `${label} in der ${cabin}`,
    empty: label => `${label} leeren`,
    needsAdult: "In jeder Kabine muss mindestens ein Erwachsener wohnen.",
    inclusions: "Was inklusive ist und was nicht",
    included: "Inklusive",
    notIncluded: "Nicht inklusive",
    placeIn: (guest, cabin) => `${guest} in die ${cabin} setzen`,
    placeHere: "Hier platzieren",
    more: (count, shortName) => (count === 1 ? `Eine weitere ${shortName}` : `${count} weitere ${shortName}s`),
    free: count => `${count} frei`,
    party: "Wer reist mit",
    partyLede:
      "Fügen Sie hier Ihre Gäste hinzu und verteilen Sie sie dann auf die Kabinen: per Drag-and-drop, indem Sie erst einen Gast und dann eine Kabine antippen, oder über die Menüs Erwachsene und Kinder an der Kabine.",
    choosing: guest => `Wählen Sie eine Kabine für ${guest}. Mit Esc abbrechen.`,
    arrangeForMe: "Für mich verteilen",
    undoArrangement: "Verteilung aufheben",
    undoTitle: "Gesamte Verteilung aufheben?",
    undoText:
      "Die gesamte Verteilung wird aufgehoben: Jeder Gast verlässt seine Kabine und wartet wieder unter „Wer reist mit“, und keine Kabine bleibt gewählt. Die Zahl der Erwachsenen und Kinder bleibt gleich.",
    keep: "Verteilung behalten",
    undoAll: "Alles aufheben",
    noteBox: "Jede Kabine zeigt, wie viele Gäste sie aufnehmen kann. In jeder Kabine wohnt mindestens ein Erwachsener. Die Preise gelten pro Kabine und für die gesamte Reise.",
    trayLabel: "Noch zu verteilende Gäste",
    tapCabinFor: guest => `Tippen Sie jetzt auf eine Kabine für ${guest}.`,
    howTo: "Tippen Sie auf einen Gast und dann auf eine Kabine oder ziehen Sie ihn hinein.",
    toPlace: count => (count === 1 ? "1 Gast zu verteilen" : `${count} Gäste zu verteilen`),
    everyoneHasCabin: "Alle Gäste haben eine Kabine",
    takeOut: (guest, cabin) => `${guest} aus der ${cabin} nehmen`,
    continueToDetails: "Weiter zu den Daten",
    backToJourney: "Zurück zur Reise",
    back: "Zurück",
    notices: {
      waiting: guest => `${guest} wartet auf eine Kabine.`,
      placed: (guest, cabin) => `${guest} ist in der ${cabin}.`,
      counted: (cabin, count) => `${cabin}: ${count}.`,
      emptied: cabin => `Die ${cabin} ist leer. Ihre Gäste warten unter „Wer reist mit“.`,
      arranged: "Ihre Gäste sind in ihren Kabinen. Sie können jeden nach Wunsch umsetzen.",
      undone: "Die gesamte Verteilung wurde aufgehoben. Ihre Gäste warten unter „Wer reist mit“.",
    },
    tile: (guest, where) =>
      `${guest}, ${where ? `in der ${where}` : "wartet auf eine Kabine"}. Ziehen Sie den Gast in eine Kabine oder wählen Sie ihn aus und dann eine Kabine.`,
    kind: kind => (kind === "adult" ? "Erwachsener" : "Kind"),
    arrange: {
      title: "Welche Kabinen wünschen Sie?",
      lede: guests =>
        guests === 1
          ? "Wählen Sie einen oder mehrere Typen. Wir platzieren den Gast unter Beachtung der Grenzen jeder Kabine."
          : `Wählen Sie einen oder mehrere Typen. Wir verteilen alle ${guests} Gäste unter Beachtung der Grenzen jeder Kabine.`,
      freeEach: (free, capacity) => `${free} frei · bis zu ${capacity} Gäste pro Kabine`,
      go: "Meine Gäste verteilen",
      cancel: "Abbrechen",
    },
    browse: {
      tagline: {
        "Luxury King Cabin": "Ein stiller Rückzugsort für zwei.",
        "Luxury Twin Cabin": "Einzelbetten und weite Fenster zum Nil.",
        "Luxury Suite": "Großzügige Räume und ein privater Jacuzzi.",
        "Royal Suite": "Die geräumigste Residenz der Hathor.",
      },
      features: {
        "Luxury King Cabin": size => [
          "Kingsize-Bett",
          `${size} m²`,
          "Panoramablick auf den Nil",
          "Bis zu 2 Gäste",
          "Verbindungskabinen verfügbar",
          "WLAN, Zimmerservice und täglich aufgefüllte Minibar",
        ],
        "Luxury Twin Cabin": size => [
          "Einzelbetten",
          `${size} m²`,
          "Panoramablick auf den Nil",
          "Bis zu 2 Gäste",
          "Verbindungskabinen verfügbar",
          "WLAN, Zimmerservice und täglich aufgefüllte Minibar",
        ],
        "Luxury Suite": size => [
          "Privater Jacuzzi",
          `${size} m² mit separatem Wohnbereich`,
          "Panoramablick auf den Nil",
          "Bis zu 4 Gäste",
          "Breite Durchgänge für bequemes Bewegen",
          "WLAN, Zimmerservice und täglich aufgefüllte Minibar",
        ],
        "Royal Suite": size => [
          "Privater Balkon auf dem Main Deck",
          "Zwei Badezimmer",
          `${size} m² mit privatem Wohnbereich`,
          "Bis zu 4 Gäste",
          "WLAN, Zimmerservice und täglich aufgefüllte Minibar",
        ],
      },
      preview: roomType => `Vorschau der ${roomType}`,
      photos: roomType => `Fotos der ${roomType}`,
      photoOf: (index, count) => `Foto ${index} von ${count}. Weitere Fotos sehen Sie mit den Pfeiltasten.`,
      photoAlt: (roomType, index, count) => `${roomType}, Foto ${index} von ${count}`,
      inBooking: "In Ihrer Buchung",
      previousPhoto: "Vorheriges Foto",
      nextPhoto: "Nächstes Foto",
      closePhotos: "Fotos schließen",
      photosGroup: "Fotos",
      photo: index => `Foto ${index}`,
      selected: label => `Ausgewählt · ${label}`,
      perCabin: "Pro Kabine",
      voyageMeals: nights => `Gesamte Reise mit ${nights} Nächten, alle Mahlzeiten und alkoholfreien Getränke inklusive.`,
      fullyBooked: "An diesem Termin ausgebucht",
      showType: (count, shortName, free) => `${count} ${shortName}${count === 1 ? "" : "s"} anzeigen · ${free} frei`,
      fullDetails: "Alle Details der Kabine",
    },
    tabs: {
      guests: "Gäste",
      cabins: "Kabinen",
      placed: (placed, total) => `${placed}/${total} in Kabinen`,
      checkCabin: "Kabine prüfen",
    },
    placeGuests: "Gäste verteilen",
    checkCabins: "Kabinen prüfen",
    // The phone bar's amount, in its large display face: kept short.
    noCabinYet: "Noch offen",
    continueDetailsLabel: "Weiter zu den Daten",
    barContinueLabel: "Weiter zu den Gästedaten",
    placeYourGuests: "Gäste verteilen",
    guide: [
      { label: "Geben Sie an, wer mitreist", hint: "Erwachsene und Kinder" },
      { label: "Verteilen Sie die Gäste auf Kabinen", hint: "Ziehen, tippen oder Menüs nutzen" },
      { label: "Weiter zu den Daten", hint: "Noch ist nichts reserviert" },
    ],
  },

  arrangement: {
    guest: (kind, number) => `${kind === "adult" ? "Erwachsener" : "Kind"} ${number}`,
    thatCabin: "Kabine",
    gone: "Dieser Gast gehört nicht mehr zur Gruppe.",
    notAvailable: cabin => `Die ${cabin} ist an diesem Termin nicht verfügbar.`,
    full: (cabin, capacity) => `Die ${cabin} ist voll: Sie nimmt bis zu ${capacity} Gäste auf.`,
    childLimit: (cabin, max) => `In der ${cabin} wohnen bereits ${max} Kinder.`,
    takesUpTo: (cabin, capacity) => `Die ${cabin} nimmt bis zu ${capacity} Gäste auf.`,
    noneWaiting: kind =>
      `Kein ${kind === "adult" ? "Erwachsener" : "Kind"} wartet. Fügen Sie unter „Wer reist mit“ jemanden hinzu oder nehmen Sie jemanden aus einer anderen Kabine.`,
    onlyWaiting: (count, kind) =>
      `Nur ${count} ${kind === "adult" ? (count === 1 ? "Erwachsener wartet" : "Erwachsene warten") : count === 1 ? "Kind wartet" : "Kinder warten"}. Fügen Sie zuerst weitere unter „Wer reist mit“ hinzu.`,
    stillNeed: count => (count === 1 ? "1 Gast braucht noch eine Kabine." : `${count} Gäste brauchen noch eine Kabine.`),
    needsAdult: cabin => `In der ${cabin} muss mindestens ein Erwachsener wohnen.`,
    listStillNeeds: (list, count) => `${list} ${count === 1 ? "braucht" : "brauchen"} noch eine Kabine.`,
  },

  details: {
    kicker: "Daten und Zahlung",
    title: "Daten und Zahlung",
    lede: "Nur noch wenige Angaben, um Ihre Reservierung abzuschließen.",
    quote: "Ein langsamerer, reicherer Weg, Ägypten zu entdecken.",
    panelTitle: "Gästedaten und Zahlungswunsch",
    panelLede: "Fast geschafft. Tragen Sie Ihre Daten ein und wählen Sie Ihre bevorzugte Zahlungsart.",
    guide: [
      { label: "Daten des Hauptgastes", hint: "Name, E-Mail, Telefon, Land" },
      { label: "Namen der Passagiere", hint: "Wie im Reisepass" },
      { label: "Zahlung und Bedingungen", hint: "Keine Kartendaten erforderlich" },
      { label: "Anfrage bestätigen", hint: "Kabinen werden beim Absenden reserviert" },
    ],
    lead: "Daten des Hauptgastes",
    leadLede: "Diese Person ist unser Hauptkontakt für Ihre Reise.",
    firstName: "Vorname *",
    firstNamePlaceholder: "z. B. Alex",
    lastName: "Nachname *",
    lastNamePlaceholder: "z. B. Schmidt",
    email: "E-Mail-Adresse *",
    emailPlaceholder: "z. B. alex@example.com",
    country: "Land *",
    phone: "Telefon *",
    countryCode: country => `Landesvorwahl: ${country}`,
    countryCodeMissing: "Land für die Vorwahl wählen",
    phonePlaceholder: "Telefonnummer",
    phoneNoCountry: "Bitte zuerst das Land wählen",
    passengers: "Namen der Passagiere (wie im Reisepass)",
    passengersLede: "Geben Sie jeden Gast so an, wie er im Reisepass steht, Kabine für Kabine.",
    fullName: guest => `${guest}: vollständiger Name *`,
    requests: "Besondere Wünsche (optional)",
    requestsPlaceholder: "Anlässe, Verbindungskabinen oder alles, was wir wissen sollten.",
    paymentTitle: "Zahlungswunsch",
    paymentLede:
      "Wählen Sie, wie Sie bevorzugt zahlen möchten. Rechnung und Zahlungsanweisungen erhalten Sie von unserer Reservierung. Auf dieser Website werden keine Kartendaten erfasst.",
    card: "Zahlung mit Visa / Karte",
    cardNote: `Für die Online-Zahlung fällt ein Aufschlag von ${SURCHARGE_DE} an. Hathor sendet Ihnen die Rechnung später: Hier wird keine Kartennummer gespeichert.`,
    surchargeNote: breakdown =>
      `Für Online-Kartenzahlungen fällt ein Aufschlag von ${SURCHARGE_DE} an, der bereits im Gesamtbetrag enthalten ist${breakdown ? `: ${breakdown}` : ""}. Die Banküberweisung ist ohne Aufschlag.`,
    bank: "Banküberweisung",
    bankNote: "Kein Aufschlag. Zahlung per internationaler Überweisung nach den Anweisungen auf der Rechnung.",
    schedule: "Zahlungsplan",
    scheduleNote:
      "Nach dem Absenden Ihrer Buchungsanfrage prüft unsere Reservierung die Angaben und sendet Ihnen die Rechnung mit den Zahlungsanweisungen. Die Kabinen werden in dem Moment für Sie reserviert, in dem Sie diese Anfrage absenden.",
    includedTitle: "In Ihrer Reise inklusive",
    inclusions: [
      "Hin- und Rücktransfers ab den Flughäfen Assuan oder Luxor",
      "Mehrwertsteuer und Servicegebühren",
      "Willkommensgetränk bei der Ankunft",
      "Soft All-Inclusive: Mahlzeiten und alkoholfreie Getränke",
      "Eintrittskarten für die Besichtigungen laut Route",
      "Ägyptologischer Reiseleiter",
      "Wäscheservice und täglich aufgefüllte Minibar",
      "WLAN, Zimmerservice, Kaffee- und Teezubereitung",
    ],
    terms: "Bedingungen",
    termsBefore: "Ich habe die",
    termsLink: "Buchungs- und Stornobedingungen",
    termsAfter: "gelesen und weiß, dass ich damit eine Buchungsanfrage sende, keine bestätigte Buchung.",
    marketing: "Ich möchte Neuigkeiten zu Reisen und Angeboten der Hathor erhalten. (optional)",
    backToSuites: "← Zurück zu Gästen und Suiten",
    sending: "Anfrage wird gesendet…",
    confirm: "Anfrage bestätigen",
    noPayment: "In diesem Schritt erfolgt keine Zahlung.",
    countrySearch: "Suchen Sie Ihr Land",
    noCountry: query => `Kein Land passt zu „${query}“.`,
    tabs: {
      // Short: four tabs share a 375px phone.
      lead: "Kontakt",
      complete: "Fertig",
      yourDetails: "Ihre Daten",
      passengers: "Passagiere",
      named: (named, total) => `Namen: ${named} von ${total}`,
      payment: "Zahlung",
      withTerms: method => `${method} · Bedingungen`,
      thenConfirm: "Dann bestätigen",
      review: "Überblick",
    },
    methodShort: bank => (bank ? "Überweisung" : "Karte"),
    methodLong: bank => (bank ? "Banküberweisung" : "Zahlung mit Visa / Karte"),
    paymentSub: bank =>
      bank
        ? "Rechnung und Zahlungsanweisungen erhalten Sie per E-Mail."
        : `Bei Zahlung kommt ein Kartenaufschlag von ${SURCHARGE_DE} hinzu. Rechnung und Zahlungsanweisungen erhalten Sie per E-Mail.`,
    withSurcharge: partySub => `${partySub} · inkl. ${SURCHARGE_DE} Kartenaufschlag`,
    changePayment: "Zahlungswunsch ändern",
    reviewTitle: "Überblick über Ihre Reise",
    reviewLede: "Prüfen Sie noch einmal alle Angaben und bestätigen Sie dann unten Ihre Anfrage.",
    soFarTitle: "Ihre Reise bisher",
    soFarLede: "Erst beim Absenden Ihrer Anfrage wird etwas reserviert.",
    sendingShort: "Senden…",
    barConfirm: "Bestätigen",
    barSending: "Senden…",
    barConfirmLabel: "Anfrage über die Reiseleiste bestätigen",
    errors: {
      firstName: "Bitte geben Sie den Vornamen des Hauptgastes ein.",
      lastName: "Bitte geben Sie den Nachnamen des Hauptgastes ein.",
      email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      country: "Bitte wählen Sie Ihr Land.",
      phone: "Bitte prüfen Sie die Telefonnummer.",
      phoneNoCountry: "Bitte wählen Sie zuerst Ihr Land und geben Sie dann die Nummer ein.",
      names: list => `Bitte geben Sie den vollständigen Namen von ${list} wie im Reisepass an.`,
      terms: "Bitte akzeptieren Sie die Buchungs- und Stornobedingungen.",
    },
    remind: "Bitte ergänzen Sie vor dem Absenden: ",
    reminder: {
      firstName: "den Vornamen des Hauptgastes",
      lastName: "den Nachnamen des Hauptgastes",
      email: "eine gültige E-Mail-Adresse",
      country: "Ihr Land",
      phoneValid: "eine gültige Telefonnummer",
      phone: "Ihre Telefonnummer",
      names: (count, list) => (count === 1 ? `den vollständigen Namen von ${list}` : `die vollständigen Namen von ${list}`),
      terms: "Ihre Zustimmung zu den Buchungsbedingungen",
    },
  },

  alerts: {
    tryAgain: "Bitte versuchen Sie es erneut.",
    cartSailingClosed: date => `Die Abfahrt in Ihrem Warenkorb (${date}) ist nicht mehr verfügbar. Bitte wählen Sie einen anderen Termin.`,
    cartCabinClosed: roomId =>
      `Kabine ${roomId} ist für diese Abfahrt nicht mehr verfügbar. Wählen Sie einen anderen Termin oder verzichten Sie unten auf die Auswahl aus dem Plan.`,
    availabilityUnavailable: "Die Verfügbarkeit kann derzeit nicht abgerufen werden.",
    cannotFit: (types, guests) =>
      types === 1
        ? `Dieser Kabinentyp bietet an diesem Termin nicht allen ${guests} Gästen Platz. Wählen Sie zusätzlich einen anderen Typ.`
        : `Diese Kabinentypen bieten an diesem Termin nicht allen ${guests} Gästen Platz. Wählen Sie zusätzlich einen anderen Typ.`,
    trimmed: names =>
      `Eine von Ihnen gewählte ${names.join(" und eine ")} wurde soeben von einem anderen Gast gebucht. Ihre Gäste warten unter „Wer reist mit“: Bitte verteilen Sie sie neu.`,
    chooseDateFirst: "Wählen Sie zuerst einen der verfügbaren Abfahrtstermine.",
    securityCheck: "Bitte schließen Sie die Sicherheitsprüfung ab, bevor Sie Ihre Buchungsanfrage senden.",
    sailingClosed: "Diese Abfahrt wurde soeben geschlossen. Bitte wählen Sie einen anderen Termin.",
    sailingFull: "Diese Abfahrt ist ausgebucht. Bitte wählen Sie einen anderen Termin.",
    unableToCheck: "Die Verfügbarkeit konnte nicht geprüft werden.",
    cabinClosed: roomId => `Kabine ${roomId} ist nicht mehr verfügbar. Wählen Sie einen anderen Termin oder verzichten Sie auf die Auswahl aus dem Plan.`,
    placeInPreferred: (roomId, above) =>
      `Verteilen Sie Ihre Gäste auf den gewählten Kabinentyp oder verzichten Sie ${above ? "oben " : ""}auf Kabine ${roomId}, um frei zu wählen.`,
    closedNothingAdded: "Diese Abfahrt wurde soeben geschlossen, deshalb wurde nichts in Ihren Warenkorb gelegt.",
    typeBooked: roomType => `Die ${roomType} wurde für diese Abfahrt soeben gebucht und deshalb nicht in Ihren Warenkorb gelegt.`,
    couldNotCheck: "Die Verfügbarkeit konnte gerade nicht geprüft werden, deshalb wurde nichts hinzugefügt. Bitte versuchen Sie es erneut.",
    totalChanged: amount =>
      `Der Reisepreis für diese Kabinen beträgt jetzt ${amount}. Bitte prüfen Sie ihn und klicken Sie erneut auf „Anfrage bestätigen“.`,
    cabinTaken:
      "Eine Ihrer Kabinen wurde soeben von einem anderen Gast gebucht. Die Verfügbarkeit wurde aktualisiert. Bitte prüfen Sie die Kabinen und versuchen Sie es erneut.",
    notSent: "Die Anfrage konnte nicht gesendet werden.",
    sendFailed: reason =>
      `${reason} Für Sie ist keine Kabine reserviert: Ein erneuter Klick auf „Anfrage bestätigen“ startet eine neue Anfrage.`,
  },

  plan: {
    custom: "Hathor hat diesen Plan für Ihre Buchung festgelegt: die erste Rechnung, danach der Restbetrag bis zum angegebenen Datum.",
    rules: {
      3: "Buchung mehr als 60 Tage vor Abfahrt: 30 % mit der ersten Rechnung, 20 % bis 60 Tage vor Abfahrt und die restlichen 50 % bis 45 Tage vor Abfahrt.",
      2: "Buchung 46 bis 60 Tage vor Abfahrt: 50 % mit der ersten Rechnung und die restlichen 50 % bis 45 Tage vor Abfahrt.",
      1: "Buchung 45 Tage oder weniger vor Abfahrt: der gesamte Betrag mit der ersten Rechnung.",
    },
    names: {
      1: ["Gesamtzahlung"],
      2: ["Erste Rechnung", "Schlussrechnung"],
      3: ["Erste Rechnung", "Zweite Rechnung", "Schlussrechnung"],
    },
    invoice: index => `Rechnung ${index}`,
    paid: "Bezahlt",
    paidByThen: amount => `${amount} bis dahin bezahlt`,
    whole: "Die gesamte Reise",
    rulesLabel: "So verteilt sich die Zahlung",
  },

  result: {
    reservation: "Reservierung",
    newSearch: "Neue Suche starten",
    contact: "Hathor kontaktieren",
    notFound: "Buchung nicht gefunden",
    noReference: "Wir haben keine Buchungsreferenz gefunden. Prüfen Sie den Link oder starten Sie eine neue Suche.",
    loadFailed: "Buchung konnte nicht geladen werden",
    loadFailedText:
      "Beim Laden der Daten ist ein Problem aufgetreten. Bitte versuchen Sie es gleich noch einmal oder kontaktieren Sie unsere Reservierung.",
    noBooking:
      "Zu dieser Referenz haben wir keine Buchung gefunden. Sie ist möglicherweise abgelaufen, oder der Link ist unvollständig.",
    status: {
      REQUESTED: "Anfrage erhalten",
      PENDING_HOLD: "Vorläufig reserviert",
      CONFIRMED: "Bestätigt",
      CANCELLED: "Storniert",
      EXPIRED: "Abgelaufen",
    },
    method: method => (method === "BANK_TRANSFER" ? "Banküberweisung" : method === "VISA" ? "Visa" : "—"),
    guideHeading: "Wie es jetzt weitergeht",
    guide: [
      { label: "Anfrage gesendet", hint: "Noch keine Belastung" },
      { label: "Hathor prüft sie", hint: "Wir bestätigen Kabinen und Gesamtpreis" },
      { label: "Rechnung und Zahlung", hint: "Per E-Mail, für Ihre gewählte Zahlungsart" },
      { label: "Buchung bestätigt", hint: "Nach Erfassung der Zahlung" },
    ],
    cabinsToConfirm: "Zu bestätigende Kabinen",
    // The voyage bar's total label: short, so the code stays on one line.
    booking: code => `Code ${code}`,
    returnHome: "Zurück zu Hathor",
    requestSent: "Anfrage gesendet",
    titleSent: "Anfrage gesendet",
    titleConfirmed: "Buchung bestätigt",
    titleOther: "Ihre Buchung",
    ledeSent: "Danke, dass Sie sich für Hathor entschieden haben. Wir melden uns mit der Rechnung bei Ihnen.",
    ledeOther: "Der aktuelle Stand Ihrer Nilreise.",
    quote: "Luxus. Erbe. Zugehörigkeit.",
    submitted: "Ihre Buchungsanfrage wurde erfolgreich gesendet.",
    confirmedText: "Hathor hat Ihre Buchung angenommen und die erforderliche Zahlung erfasst.",
    currentStatus: "Dies ist der aktuelle Stand Ihrer Buchung.",
    headingSent: "Ihre Buchungsanfrage wurde gesendet",
    headingConfirmed: "Ihre Buchung ist bestätigt.",
    headingOther: "Ihre Buchung.",
    sentNote:
      "Danke, dass Sie sich für Hathor entschieden haben. Unsere Reservierung prüft Ihre Anfrage und meldet sich mit der Rechnung und den Zahlungsanweisungen. Dies ist noch keine bestätigte Buchung, und auf dieser Website wurde keine Zahlung geleistet.",
    code: "Buchungscode · damit verfolgen Sie diese Buchung",
    emailed: email => `Eine Kopie dieser Anfrage wurde per E-Mail an ${email} gesendet.`,
    emailFailed:
      "Die Anfrage ist gespeichert, unsere Bestätigungs-E-Mail konnte aber nicht zugestellt werden. Bitte kontaktieren Sie uns, damit wir Sie erreichen können.",
    emailPending: "Die Anfrage ist gespeichert. Die Bestätigungs-E-Mail ist unterwegs.",
    preferredMethod: "Bevorzugte Zahlungsart",
    next: "Wie geht es weiter?",
    reviewTitle: "Die Reservierung prüft Ihre Anfrage",
    reviewText: "Wir prüfen die Kabine und den endgültigen Reisepreis.",
    invoiceSent: "Die Rechnung wurde gesendet",
    invoiceComing: "Sie erhalten Rechnung und Zahlungsanweisungen",
    invoiceCheck: email => `Prüfen Sie ${email ?? "Ihre E-Mails"} auf den fälligen Betrag und die Zahlungsmodalitäten.`,
    invoiceBy: "Per E-Mail, für Ihre bevorzugte Zahlungsart.",
    confirmedTitle: "Buchung bestätigt nach Erfassung der Zahlung",
    confirmedTextNext: "Sobald Hathor die Anfrage annimmt und die erforderliche Zahlung erfasst ist.",
    summary: "Zusammenfassung der Buchung",
    guestSummary: (adults, children, fallback) =>
      adults !== null && children !== null
        ? `${deCount(adults, "Erwachsener", "Erwachsene")}, ${deCount(children, "Kind", "Kinder")}`
        : fallback,
    route: route => route.replace(/\bAswan\b/g, "Assuan"),
    total: "Gesamtbetrag der Buchung",
    taxes: "Steuern und Service inklusive.",
    surchargeTaxes: amount => `Enthält den Aufschlag von ${SURCHARGE_DE} für die Online-Kartenzahlung in Höhe von ${amount}. Steuern und Service inklusive.`,
    timeline: "Zeitplan der Zahlungen",
    here: "Wir sind für Sie da",
    concierge: "Unser Concierge-Team hilft Ihnen immer gern bei allen Fragen.",
    hours: "Täglich erreichbar: 09:00 – 17:00 Uhr. Ruhetag: Freitag.",
    reply: "Oder antworten Sie direkt auf Ihre Bestätigungs-E-Mail.",
    viewRequest: "Meine Anfrage ansehen",
  },

  lookup: {
    title: "Verfolgen Sie Ihre Buchung",
    lede: "Geben Sie den Buchungscode aus Ihrer E-Mail (zum Beispiel HB-3F2A91C0) und die bei der Buchung verwendete E-Mail-Adresse ein.",
    code: "Buchungscode",
    email: "E-Mail",
    checking: "Prüfung…",
    track: "Buchung verfolgen",
    newReservation: "Neue Buchung beginnen",
    notFound: "Buchung konnte nicht gefunden werden",
  },
  error: {
    title: "Etwas hat Ihre Buchung unterbrochen",
    bodyBefore: "Beim Laden dieser Seite ist ein Problem aufgetreten.",
    bodyStrong: "Wenn Sie bereits beim Bestätigen waren, wurde Ihre Buchung möglicherweise schon gesendet",
    bodyAfter: ": Bitte prüfen Sie Ihre E-Mails, bevor Sie erneut buchen.",
    tryAgain: "Erneut versuchen",
    home: "Zur Startseite",
    helpBefore: "Weiterhin Probleme? Schreiben Sie an",
    helpAfter: "und wir schließen Ihre Buchung von Hand ab.",
    reference: "Referenz:",
  },
  unverified: {
    kicker: "Kabinenwahl",
    title: "Diese Kabine konnten wir nicht prüfen.",
    text: "Ihre Buchung wurde nicht begonnen. Laden Sie die Seite neu, um es erneut zu prüfen, oder wählen Sie eine andere Kabine.",
    link: "Alle Kabinen entdecken ↗",
  },
  meta: {
    title: "Buchen Sie Ihre Luxus-Dahabiya-Kreuzfahrt",
    description:
      "Wählen Sie Nilreise, Abfahrtstermin und Kabine an Bord der Hathor Dahabiya und senden Sie Ihre Buchungsanfrage an unsere Reservierung.",
  },
};
