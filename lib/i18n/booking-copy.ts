/**
 * Words in the booking journey (/booking and /it/booking): the three steps,
 * the result page, the booking lookup and the error screen.
 *
 * English is the live copy, word for word, and formats dates and money with
 * the journey's own helpers, so the English flow reads exactly as before.
 * Italian uses the formal register ("Lei"); product names stay in English
 * (Hathor, Dahabiya, Luxury King Cabin, Luxury Suite, Royal Suite) and
 * prices stay in US dollars. Text only: nothing here changes a price, an
 * availability rule or what the booking request sends.
 */

import {
  folioRange,
  longDate,
  money,
  monthLabel,
  shortDate,
  stageLabel,
  utcParts,
  weekdayShort,
  type PaymentStage,
} from "@/components/booking/journey/model";
import { HATHOR_BOOKING_INCLUSIONS } from "@/lib/booking-room-media";
import { CARD_SURCHARGE_PERCENT } from "@/lib/card-surcharge";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import type { PublicLocale } from "@/lib/i18n/locale";
import { BOOKING_COPY_DE } from "@/lib/i18n/booking-copy-de";
import { COUNTRY_NAMES_IT } from "@/lib/i18n/countries-it";

type Kind = "adult" | "child";

export type BookingCopy = {
  locale: PublicLocale;

  /* ---------- dates, money, counts ---------- */
  money: (cents: number) => string;
  monthLabel: (year: number, month: number) => string;
  shortDate: (iso: string) => string;
  longDate: (iso: string) => string;
  weekdayShort: (iso: string) => string;
  folioRange: (fromIso: string, toIso: string) => string;
  stageLabel: (stage: PaymentStage) => string;
  /** Calendar column heads, Monday first. */
  weekdayHeads: readonly string[];
  adults: (count: number) => string;
  children: (count: number) => string;
  /** "1 adult" / "2 children", lower case, for a cabin's menu. */
  kindCount: (count: number, kind: Kind) => string;
  /** "2 Adults · 1 Child". */
  partyLine: (adults: number, children: number) => string;
  /** "1 cabin" / "2 cabins". */
  cabins: (count: number) => string;
  /** "1 Cabin" / "2 Cabins", where the English capitalises it. */
  cabinsTitle: (count: number) => string;
  nights: (count: number) => string;
  guests: (count: number) => string;
  /** "A, B and C". */
  joinAnd: (items: string[]) => string;
  /** Country name shown in the menu; the booking still records the English one. */
  countryName: (code: string, english: string) => string;
  /** A message from the booking server, in the visitor's language. */
  serverMessage: (message: string) => string;
  /** What a caught failure says: a dropped connection never shows the browser's own English. */
  caught: (error: unknown, fallback: string) => string;

  /* ---------- chrome shared by every step ---------- */
  steps: readonly [string, string, string, string];
  /** Phone and tablet: the step the back link returns to. */
  backTo: Record<2 | 3, string>;
  progressLabel: string;
  stepOf: (step: number, of: number) => string;
  bannerOf: string;
  bannerKicker: (step: number, kicker: string) => string;
  bandLine: readonly [string, string];
  bandWords: string;
  scroll: string;
  guideHeading: string;
  done: string;
  nextToDo: string;
  edit: string;
  editLabel: (label: string) => string;
  actionBarLabel: string;
  close: string;
  oneMoment: string;

  /* ---------- the voyage (itinerary picker, calendar, rail, bar) ---------- */
  voyage: {
    chooseItinerary: string;
    departureCaption: (day: string) => string;
    departsOn: (day: string) => string;
    nightsAndDay: (nights: number, day: string) => string;
    itinerary: (title: string) => string;
    expandAll: string;
    collapseAll: string;
    day: (day: number) => string;
    placeFromPath: (path: string) => string;
  };
  calendar: {
    selectDate: string;
    previousMonth: string;
    nextMonth: string;
    noSailings: string;
    dayLabel: (longDate: string, from: string | null) => string;
    available: string;
    unavailable: string;
    departures: string;
    empty: string;
    noneFrom: (month: string) => string;
    from: (amount: string) => string;
    showFewer: string;
    showAll: (count: number) => string;
    only: (day: string) => string;
  };
  rail: {
    summaryLabel: string;
    title: string;
    barLabel: string;
    journey: string;
    dates: string;
    guests: string;
    accommodation: string;
    payment: string;
    selectDates: string;
    chooseDate: string;
    notSelected: string;
    noGuests: string;
    noCabin: string;
    to: (date: string) => string;
    total: (cabins: number) => string;
    pending: string;
    pendingFine: string;
    fine: (nights: number) => string;
    tagline: string;
  };

  /* ---------- step 1: journey ---------- */
  journey: {
    kicker: string;
    title: string;
    lede: string;
    quote: string;
    guide: readonly [GuideText, GuideText, GuideText];
    mapChoice: (roomId: string) => string;
    chooseFreely: string;
    yourDeparture: string;
    datesHelp: string;
    datesHelpLink: string;
    chooseToContinue: string;
    checking: string;
    checkingShort: string;
    continueLong: string;
    continueShort: string;
    chooseDate: string;
    /** Phone and tablet: the departure tile before a date is chosen (a narrow tile). */
    tileChoose: string;
    chooseDepartureDate: string;
    departs: (date: string) => string;
    loadingDates: string;
    noOpenDates: string;
    perCabin: string;
    perUnitVoyage: (unit: string) => string;
    barContinueLabel: string;
    blocker: string;
    tabs: { voyage: string; date: string; review: string; toChoose: string; nothingHeld: string };
    departure: string;
    guests: string;
  };
  sheets: {
    dateTitle: string;
    datePick: string;
    applyDate: string;
    clearDate: string;
    clearSelection: string;
    guestsTitle: string;
    guestsLede: string;
    done: (party: string) => string;
  };
  counters: {
    adults: string;
    adultsHint: string;
    children: string;
    childrenHint: string;
    fewer: (label: string) => string;
    more: (label: string) => string;
  };

  /* ---------- step 2: guests & suites ---------- */
  suites: {
    title: string;
    lede: string;
    mapChoice: (roomId: string) => string;
    everyCabin: string;
    filterLabel: string;
    allRooms: string;
    cabinCount: (count: number) => string;
    showing: (cabins: number, free: number) => string;
    hiddenByFilter: (count: number) => string;
    showAllRooms: string;
    cabinAria: (roomType: string, index: number, inside: number, capacity: number) => string;
    cabinOutAria: (roomType: string, index: number) => string;
    saveName: (roomType: string, voyage: string) => string;
    inCart: (roomType: string) => string;
    cabinNumber: (index: number) => string;
    shownInPreview: (label: string) => string;
    showInPreview: (label: string) => string;
    selected: string;
    select: string;
    perCabinVoyage: string;
    entireVoyage: string;
    upTo: (capacity: number) => string;
    bed: Partial<Record<PhysicalRoomType, string>>;
    note: Record<PhysicalRoomType, string>;
    viewRoomLabel: (roomType: string) => string;
    viewRoom: string;
    unavailableDate: string;
    seatsTaken: (inside: number, capacity: number) => string;
    menuLabel: (label: string, cabin: string) => string;
    empty: (label: string) => string;
    needsAdult: string;
    inclusions: string;
    included: string;
    notIncluded: string;
    placeIn: (guest: string, cabin: string) => string;
    placeHere: string;
    more: (count: number, shortName: string) => string;
    free: (count: number) => string;
    party: string;
    partyLede: string;
    choosing: (guest: string) => string;
    arrangeForMe: string;
    undoArrangement: string;
    undoTitle: string;
    undoText: string;
    keep: string;
    undoAll: string;
    noteBox: string;
    trayLabel: string;
    tapCabinFor: (guest: string) => string;
    howTo: string;
    toPlace: (count: number) => string;
    everyoneHasCabin: string;
    takeOut: (guest: string, cabin: string) => string;
    continueToDetails: string;
    backToJourney: string;
    back: string;
    notices: {
      waiting: (guest: string) => string;
      placed: (guest: string, cabin: string) => string;
      counted: (cabin: string, count: string) => string;
      emptied: (cabin: string) => string;
      arranged: string;
      undone: string;
    };
    tile: (guest: string, where: string | null) => string;
    kind: (kind: Kind) => string;
    arrange: {
      title: string;
      lede: (guests: number) => string;
      freeEach: (free: number, capacity: number) => string;
      go: string;
      cancel: string;
    };
    browse: {
      tagline: Record<PhysicalRoomType, string>;
      features: Record<PhysicalRoomType, (size: number) => string[]>;
      preview: (roomType: string) => string;
      photos: (roomType: string) => string;
      photoOf: (index: number, count: number) => string;
      photoAlt: (roomType: string, index: number, count: number) => string;
      inBooking: string;
      previousPhoto: string;
      nextPhoto: string;
      closePhotos: string;
      photosGroup: string;
      photo: (index: number) => string;
      selected: (label: string) => string;
      perCabin: string;
      voyageMeals: (nights: number) => string;
      fullyBooked: string;
      showType: (count: number, shortName: string, free: number) => string;
      fullDetails: string;
    };
    tabs: { guests: string; cabins: string; placed: (placed: number, total: number) => string; checkCabin: string };
    placeGuests: string;
    checkCabins: string;
    noCabinYet: string;
    continueDetailsLabel: string;
    barContinueLabel: string;
    placeYourGuests: string;
    guide: readonly [GuideText, GuideText, GuideText];
  };

  /* ---------- the arrangement's own words (allocation.ts) ---------- */
  arrangement: {
    guest: (kind: Kind, number: number) => string;
    thatCabin: string;
    gone: string;
    notAvailable: (cabin: string) => string;
    full: (cabin: string, capacity: number) => string;
    childLimit: (cabin: string, max: number) => string;
    takesUpTo: (cabin: string, capacity: number) => string;
    noneWaiting: (kind: Kind) => string;
    onlyWaiting: (count: number, kind: Kind) => string;
    stillNeed: (count: number) => string;
    needsAdult: (cabin: string) => string;
    listStillNeeds: (list: string, count: number) => string;
  };

  /* ---------- step 3: details & payment ---------- */
  details: {
    kicker: string;
    title: string;
    lede: string;
    quote: string;
    panelTitle: string;
    panelLede: string;
    guide: readonly [GuideText, GuideText, GuideText, GuideText];
    lead: string;
    leadLede: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    country: string;
    phone: string;
    countryCode: (country: string) => string;
    countryCodeMissing: string;
    phonePlaceholder: string;
    phoneNoCountry: string;
    passengers: string;
    passengersLede: string;
    fullName: (guest: string) => string;
    requests: string;
    requestsPlaceholder: string;
    paymentTitle: string;
    paymentLede: string;
    card: string;
    cardNote: string;
    /** Under the payment choice when card is selected; `breakdown` is "quote + surcharge = total". */
    surchargeNote: (breakdown: string | null) => string;
    bank: string;
    bankNote: string;
    schedule: string;
    scheduleNote: string;
    includedTitle: string;
    inclusions: readonly string[];
    terms: string;
    termsBefore: string;
    termsLink: string;
    termsAfter: string;
    marketing: string;
    backToSuites: string;
    sending: string;
    confirm: string;
    noPayment: string;
    countrySearch: string;
    noCountry: (query: string) => string;
    tabs: {
      lead: string;
      complete: string;
      yourDetails: string;
      passengers: string;
      named: (named: number, total: number) => string;
      payment: string;
      withTerms: (method: string) => string;
      thenConfirm: string;
      review: string;
    };
    methodShort: (bank: boolean) => string;
    methodLong: (bank: boolean) => string;
    paymentSub: (bank: boolean) => string;
    withSurcharge: (partySub: string) => string;
    changePayment: string;
    reviewTitle: string;
    reviewLede: string;
    soFarTitle: string;
    soFarLede: string;
    sendingShort: string;
    /** The voyage bar's button: short, so the bar keeps its dates on one line. */
    barConfirm: string;
    barSending: string;
    barConfirmLabel: string;
    errors: {
      firstName: string;
      lastName: string;
      email: string;
      country: string;
      phone: string;
      phoneNoCountry: string;
      names: (list: string) => string;
      terms: string;
    };
    remind: string;
    reminder: {
      firstName: string;
      lastName: string;
      email: string;
      country: string;
      phoneValid: string;
      phone: string;
      names: (count: number, list: string) => string;
      terms: string;
    };
  };

  /* ---------- what the flow says when something changes ---------- */
  alerts: {
    tryAgain: string;
    cartSailingClosed: (date: string) => string;
    cartCabinClosed: (roomId: string) => string;
    availabilityUnavailable: string;
    cannotFit: (types: number, guests: number) => string;
    trimmed: (names: string[]) => string;
    chooseDateFirst: string;
    sailingClosed: string;
    sailingFull: string;
    unableToCheck: string;
    cabinClosed: (roomId: string) => string;
    placeInPreferred: (roomId: string, above: boolean) => string;
    closedNothingAdded: string;
    typeBooked: (roomType: string) => string;
    couldNotCheck: string;
    totalChanged: (amount: string) => string;
    cabinTaken: string;
    notSent: string;
    sendFailed: (reason: string) => string;
    securityCheck: string;
  };

  /* ---------- payment plan ---------- */
  plan: {
    rules: Record<1 | 2 | 3, string>;
    /** Hathor set this booking's first payment and balance date itself. */
    custom: string;
    names: Record<1 | 2 | 3, readonly string[]>;
    invoice: (index: number) => string;
    paid: string;
    paidByThen: (amount: string) => string;
    whole: string;
    rulesLabel: string;
  };

  /* ---------- request sent (result page) ---------- */
  result: {
    reservation: string;
    newSearch: string;
    contact: string;
    notFound: string;
    noReference: string;
    loadFailed: string;
    loadFailedText: string;
    noBooking: string;
    status: Record<string, string>;
    method: (method: string | null) => string;
    guideHeading: string;
    guide: readonly [GuideText, GuideText, GuideText, GuideText];
    cabinsToConfirm: string;
    booking: (code: string) => string;
    returnHome: string;
    requestSent: string;
    titleSent: string;
    titleConfirmed: string;
    titleOther: string;
    ledeSent: string;
    ledeOther: string;
    quote: string;
    submitted: string;
    confirmedText: string;
    currentStatus: string;
    headingSent: string;
    headingConfirmed: string;
    headingOther: string;
    sentNote: string;
    code: string;
    emailed: (email: string | null) => string;
    emailFailed: string;
    emailPending: string;
    preferredMethod: string;
    next: string;
    reviewTitle: string;
    reviewText: string;
    invoiceSent: string;
    invoiceComing: string;
    invoiceCheck: (email: string | null) => string;
    invoiceBy: string;
    confirmedTitle: string;
    confirmedTextNext: string;
    summary: string;
    guestSummary: (adults: number | null, children: number | null, fallback: string) => string;
    route: (route: string) => string;
    total: string;
    taxes: string;
    surchargeTaxes: (amount: string) => string;
    timeline: string;
    here: string;
    concierge: string;
    hours: string;
    reply: string;
    viewRequest: string;
  };

  /* ---------- booking lookup, error screen, unverified cabin ---------- */
  lookup: {
    title: string;
    lede: string;
    code: string;
    email: string;
    checking: string;
    track: string;
    newReservation: string;
    notFound: string;
  };
  error: {
    /** The browser tab while this screen shows. English keeps the page's own. */
    pageTitle?: string;
    title: string;
    bodyBefore: string;
    bodyStrong: string;
    bodyAfter: string;
    tryAgain: string;
    home: string;
    helpBefore: string;
    helpAfter: string;
    reference: string;
  };
  unverified: {
    kicker: string;
    title: string;
    text: string;
    link: string;
  };
  /** /booking/cruise/[id] when the room no longer exists. */
  roomGone: { title: string; text: string; link: string };
  meta: { title: string; description: string };
};

type GuideText = { label: string; hint: string };

/* ---------- English ---------- */

const enPlural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
const enJoin = (items: string[]) =>
  items.length <= 1 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const EN: BookingCopy = {
  locale: "en",
  money,
  monthLabel,
  shortDate,
  longDate,
  weekdayShort,
  folioRange,
  stageLabel,
  weekdayHeads: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  adults: count => enPlural(count, "Adult"),
  children: count => enPlural(count, "Child", "Children"),
  kindCount: (count, kind) => (kind === "adult" ? enPlural(count, "adult", "adults") : enPlural(count, "child", "children")),
  partyLine: (adults, children) =>
    [enPlural(adults, "Adult"), children > 0 ? enPlural(children, "Child", "Children") : null].filter(Boolean).join(" · "),
  cabins: count => enPlural(count, "cabin"),
  cabinsTitle: count => enPlural(count, "Cabin"),
  nights: count => enPlural(count, "night"),
  guests: count => enPlural(count, "guest"),
  joinAnd: enJoin,
  countryName: (_code, english) => english,
  serverMessage: message => message,
  caught: (error, fallback) => (error instanceof Error ? error.message : fallback),

  steps: ["Journey", "Guests & Suites", "Details & Payment", "Request sent"],
  backTo: { 2: "Journey", 3: "Guests & suites" },
  progressLabel: "Booking progress",
  stepOf: (step, of) => `Step ${step} of ${of}`,
  bannerOf: "of 04",
  bannerKicker: (step, kicker) => `Step ${step} of 4 · ${kicker}`,
  bandLine: ["A slower way", "to see a greater Egypt"],
  bandWords: "Luxury. Heritage. Belonging.",
  scroll: "Scroll",
  guideHeading: "Your map for this step",
  done: "(done)",
  nextToDo: "(next to do)",
  edit: "Edit",
  editLabel: label => `Edit ${label.toLowerCase()}`,
  actionBarLabel: "Your voyage and next step",
  close: "Close",
  oneMoment: "One moment…",

  voyage: {
    chooseItinerary: "Choose your itinerary",
    departureCaption: day => day,
    departsOn: day => `Departs ${day}`,
    nightsAndDay: (nights, day) => `${enPlural(nights, "night")} · ${day}`,
    itinerary: title => `Itinerary · ${title}`,
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    day: day => `Day ${day}`,
    placeFromPath: path => {
      const first = path.split("→")[0]?.trim() ?? path;
      return first
        .replace(/^optional\s+/i, "")
        .replace(/\s*(embarkation|disembarkation|breakfast\/check-out|breakfast|checkout).*$/i, "")
        .trim();
    },
  },
  calendar: {
    selectDate: "Select your departure date",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    noSailings: "No sailings",
    dayLabel: (date, from) => `Sailing departing ${date}${from !== null ? `, from ${from}` : ""}`,
    available: "Available departure",
    unavailable: "Unavailable",
    departures: "Available departures",
    empty: "No sailings are open for this voyage at the moment. Choose another itinerary, or contact our reservations team.",
    noneFrom: month => `No open departures from ${month}.`,
    from: amount => `From ${amount}`,
    showFewer: "Show fewer dates",
    showAll: count => `Show all ${count} departures`,
    only: day => `${day} departures only.`,
  },
  rail: {
    summaryLabel: "Your voyage summary",
    title: "Your Voyage",
    barLabel: "Your voyage",
    journey: "Journey",
    dates: "Dates",
    guests: "Guests",
    accommodation: "Accommodation",
    payment: "Payment",
    selectDates: "Select your dates",
    chooseDate: "Choose a date",
    notSelected: "Not selected yet",
    noGuests: "No guests yet",
    noCabin: "No cabin yet",
    to: date => `to ${date}`,
    total: cabins => (cabins > 1 ? `Total · ${enPlural(cabins, "cabin")}` : "Voyage total"),
    pending: "Select accommodation",
    pendingFine: "The voyage total appears once your guests have a cabin.",
    fine: nights => `Entire ${nights}-night voyage, per cabin rates. Taxes and service charges included.`,
    tagline: "A higher rhythm",
  },

  journey: {
    kicker: "Journey",
    title: "Plan Your Journey",
    lede: "Three extraordinary voyages. One timeless river.",
    quote: "More than a journey.",
    guide: [
      { label: "Choose your voyage", hint: "3, 4 or 7 nights on the Nile" },
      { label: "Pick a sailing date", hint: "Open departures are marked" },
      { label: "Continue to guests & suites", hint: "Nothing is held yet" },
    ],
    mapChoice: roomId =>
      `Chosen on the ship map: cabin ${roomId}. It will be rechecked and reserved exactly when you send your request; nothing is held yet.`,
    chooseFreely: "Choose freely instead",
    yourDeparture: "Your departure",
    datesHelp: "Need a different date? If you cannot find your preferred sailing,",
    datesHelpLink: "contact Hathor Reservations",
    chooseToContinue: "Choose a sailing date to continue.",
    checking: "Checking availability…",
    checkingShort: "Checking…",
    continueLong: "Continue to guests & suites",
    continueShort: "Continue",
    chooseDate: "Choose a date",
    tileChoose: "Choose a date",
    chooseDepartureDate: "Choose a departure date",
    departs: date => `Departs ${date}`,
    loadingDates: "Loading dates…",
    noOpenDates: "No open dates",
    perCabin: "per cabin, entire voyage",
    perUnitVoyage: unit => `${unit}, entire voyage`,
    barContinueLabel: "Continue to guests and suites",
    blocker: "Choose a sailing date first: the open dates are marked in the calendar.",
    tabs: { voyage: "Voyage", date: "Date", review: "Review", toChoose: "To choose", nothingHeld: "Nothing held yet" },
    departure: "Departure",
    guests: "Guests",
  },
  sheets: {
    dateTitle: "Select departure date",
    datePick: "Tap one of the dates marked in gold.",
    applyDate: "Apply date",
    clearDate: "Clear date",
    clearSelection: "Clear selection",
    guestsTitle: "Who is travelling",
    guestsLede: "You place everyone in a cabin on the next step.",
    done: party => `Done · ${party}`,
  },
  counters: {
    adults: "Adults",
    adultsHint: "12 years and over",
    children: "Children",
    childrenHint: "Aged 2 – 11 years",
    fewer: label => `One fewer ${label.toLowerCase()}`,
    more: label => `One more ${label.toLowerCase()}`,
  },

  suites: {
    title: "Select Your Cabin or Suite",
    lede: "Every cabin on the boat for your date. Put your guests into the cabins you want — drag them in, or choose how many adults and children on the cabin.",
    mapChoice: roomId =>
      `From the ship map: cabin ${roomId}. Place your guests in this cabin type. The exact room is checked again when you send your request; it is not held yet.`,
    everyCabin: "Every cabin on this sailing · place your guests",
    filterLabel: "Filter cabins by type",
    allRooms: "All rooms",
    cabinCount: count => `${count} cabins`,
    showing: (cabins, free) => `Showing ${enPlural(cabins, "cabin")} · ${free} free on this date`,
    hiddenByFilter: count => `${enPlural(count, "cabin")} with your guests ${count === 1 ? "is" : "are"} hidden by the filter.`,
    showAllRooms: "Show all rooms",
    cabinAria: (roomType, index, inside, capacity) => `${roomType}, cabin ${index}, ${inside} of ${capacity} guests`,
    cabinOutAria: (roomType, index) => `${roomType}, cabin ${index}, unavailable for this date`,
    saveName: (roomType, voyage) => `${roomType} on the ${voyage} voyage`,
    inCart: roomType => `${roomType} for this sailing is in your cart.`,
    cabinNumber: index => `Cabin ${index}`,
    shownInPreview: label => `${label} is shown in the preview`,
    showInPreview: label => `Show ${label} in the preview`,
    selected: "Selected",
    select: "Select",
    perCabinVoyage: "per cabin · entire voyage",
    entireVoyage: "entire voyage",
    upTo: capacity => `Up to ${capacity} guests`,
    bed: { "Luxury King Cabin": "King bed", "Luxury Twin Cabin": "Twin beds" },
    note: {
      "Luxury King Cabin": "King bed",
      "Luxury Twin Cabin": "Twin beds",
      "Luxury Suite": "Separate lounge",
      "Royal Suite": "Private lounge",
    },
    viewRoomLabel: roomType => `View the ${roomType} (opens in a new tab)`,
    viewRoom: "View room",
    unavailableDate: "Unavailable for this date",
    seatsTaken: (inside, capacity) => `${inside} of ${capacity} places taken`,
    menuLabel: (label, cabin) => `${label} in ${cabin}`,
    empty: label => `Empty ${label}`,
    needsAdult: "Every cabin needs at least one adult.",
    inclusions: "What’s included and what’s not",
    included: "Included",
    notIncluded: "Not included",
    placeIn: (guest, cabin) => `Place ${guest} in ${cabin}`,
    placeHere: "Place here",
    more: (count, shortName) => enPlural(count, `more ${shortName}`),
    free: count => `${count} free`,
    party: "Who Is Travelling",
    partyLede:
      "Add your guests here, then put them in cabins: drag them, tap a guest and then a cabin, or use the Adults and Children menus on the cabin.",
    choosing: guest => `Choose a cabin for ${guest}. Press Esc to cancel.`,
    arrangeForMe: "Arrange for me",
    undoArrangement: "Undo arrangement",
    undoTitle: "Undo every arrangement?",
    undoText:
      "All arrangements will be undone: every guest leaves their cabin and waits in Who Is Travelling again, and no cabin stays chosen. The number of adults and children stays as it is.",
    keep: "Keep my arrangement",
    undoAll: "Undo all",
    noteBox: "Each cabin shows how many guests it takes. Every cabin needs one adult. Rates are per cabin for the whole voyage.",
    trayLabel: "Guests still to place",
    tapCabinFor: guest => `Now tap a cabin for ${guest}.`,
    howTo: "Tap a guest, then a cabin — or drag them in.",
    toPlace: count => (count === 1 ? "1 guest to place" : `${count} guests to place`),
    everyoneHasCabin: "Everyone has a cabin",
    takeOut: (guest, cabin) => `Take ${guest} out of ${cabin}`,
    continueToDetails: "Continue to details",
    backToJourney: "Back to journey",
    back: "Back",
    notices: {
      waiting: guest => `${guest} is waiting for a cabin.`,
      placed: (guest, cabin) => `${guest} is in ${cabin}.`,
      counted: (cabin, count) => `${cabin}: ${count}.`,
      emptied: cabin => `${cabin} is empty. Its guests are waiting in Who Is Travelling.`,
      arranged: "Your guests are in their cabins. Move anyone you like.",
      undone: "Every arrangement was undone. Your guests are waiting in Who Is Travelling.",
    },
    tile: (guest, where) =>
      `${guest}, ${where ? `in ${where}` : "waiting for a cabin"}. Drag to a cabin, or press and then choose a cabin.`,
    kind: kind => (kind === "adult" ? "Adult" : "Child"),
    arrange: {
      title: "Which cabins would you like?",
      lede: guests => `Choose one or more types. We will place all ${enPlural(guests, "guest")} within each cabin's limit.`,
      freeEach: (free, capacity) => `${free} free · up to ${capacity} guests each`,
      go: "Arrange my guests",
      cancel: "Cancel",
    },
    browse: {
      tagline: {
        "Luxury King Cabin": "A calm retreat for two.",
        "Luxury Twin Cabin": "Twin beds and wide Nile glass.",
        "Luxury Suite": "Generous space and a private Jacuzzi.",
        "Royal Suite": "Hathor’s most spacious residence.",
      },
      features: {
        "Luxury King Cabin": size => [
          "King bed",
          `${size} m²`,
          "Panoramic Nile view",
          "Up to 2 guests",
          "Connected cabins available",
          "Wi-Fi, room service and daily minibar refill",
        ],
        "Luxury Twin Cabin": size => [
          "Twin beds",
          `${size} m²`,
          "Panoramic Nile view",
          "Up to 2 guests",
          "Connected cabins available",
          "Wi-Fi, room service and daily minibar refill",
        ],
        "Luxury Suite": size => [
          "Private Jacuzzi",
          `${size} m² with a separate lounge`,
          "Panoramic Nile view",
          "Up to 4 guests",
          "Wide walkways for easy movement",
          "Wi-Fi, room service and daily minibar refill",
        ],
        "Royal Suite": size => [
          "Private balcony on the Main Deck",
          "Two bathrooms",
          `${size} m² with a private lounge`,
          "Up to 4 guests",
          "Wi-Fi, room service and daily minibar refill",
        ],
      },
      preview: roomType => `${roomType} preview`,
      photos: roomType => `${roomType} photos`,
      photoOf: (index, count) => `Photo ${index} of ${count}. Use the arrow keys for more.`,
      photoAlt: (roomType, index, count) => `${roomType}, photo ${index} of ${count}`,
      inBooking: "In your booking",
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
      closePhotos: "Close photos",
      photosGroup: "Photos",
      photo: index => `Photo ${index}`,
      selected: label => `Selected · ${label}`,
      perCabin: "Per cabin",
      voyageMeals: nights => `Entire ${nights}-night voyage, all meals and soft drinks included.`,
      fullyBooked: "Fully booked on this date",
      showType: (count, shortName, free) => `Show the ${enPlural(count, shortName)} · ${free} free`,
      fullDetails: "Full cabin details",
    },
    tabs: {
      guests: "Guests",
      cabins: "Cabins",
      placed: (placed, total) => `${placed} of ${total} placed`,
      checkCabin: "Check a cabin",
    },
    placeGuests: "Place guests",
    checkCabins: "Check cabins",
    noCabinYet: "No cabin yet",
    continueDetailsLabel: "Continue to details",
    barContinueLabel: "Continue to guest details",
    placeYourGuests: "Place your guests",
    guide: [
      { label: "Set who is travelling", hint: "Adults and children" },
      { label: "Place every guest in a cabin", hint: "Drag, tap, or use the menus" },
      { label: "Continue to details", hint: "Nothing is held yet" },
    ],
  },

  arrangement: {
    guest: (kind, number) => `${kind === "adult" ? "Adult" : "Child"} ${number}`,
    thatCabin: "that cabin",
    gone: "That guest is no longer in your party.",
    notAvailable: cabin => `${cabin} is not available on this date.`,
    full: (cabin, capacity) => `${cabin} is full — it takes up to ${capacity} guests.`,
    childLimit: (cabin, max) => `${cabin} already has ${max} children.`,
    takesUpTo: (cabin, capacity) => `${cabin} takes up to ${capacity} guests.`,
    noneWaiting: kind =>
      `No ${kind === "adult" ? "adults" : "children"} are waiting. Add them in Who Is Travelling, or take one out of another cabin.`,
    onlyWaiting: (count, kind) => {
      const noun = kind === "adult" ? (count === 1 ? "adult is" : "adults are") : count === 1 ? "child is" : "children are";
      return `Only ${count} ${noun} waiting. Add more in Who Is Travelling first.`;
    },
    stillNeed: count => `${count === 1 ? "1 guest still needs" : `${count} guests still need`} a cabin.`,
    needsAdult: cabin => `${cabin} needs at least one adult.`,
    listStillNeeds: (list, count) => `${list} ${count === 1 ? "still needs" : "still need"} a cabin.`,
  },

  details: {
    kicker: "Details & Payment",
    title: "Details & Payment",
    lede: "A few details to complete your reservation.",
    quote: "A slower, richer way to see Egypt.",
    panelTitle: "Guest Details & Payment Preference",
    panelLede: "Almost there. Please provide your details and choose your preferred payment method.",
    guide: [
      { label: "Lead guest details", hint: "Name, email, phone, country" },
      { label: "Passenger names", hint: "As shown in passports" },
      { label: "Payment preference & terms", hint: "No card details needed" },
      { label: "Confirm request", hint: "Your cabins are reserved as you send" },
    ],
    lead: "Lead guest details",
    leadLede: "This will be the primary contact for your voyage.",
    firstName: "First name *",
    firstNamePlaceholder: "e.g. Alex",
    lastName: "Last name *",
    lastNamePlaceholder: "e.g. Morgan",
    email: "Email address *",
    emailPlaceholder: "e.g. alex@example.com",
    country: "Country *",
    phone: "Phone *",
    countryCode: country => `Country code for ${country}`,
    countryCodeMissing: "Choose your country for its code",
    phonePlaceholder: "Phone number",
    phoneNoCountry: "Choose your country first",
    passengers: "Passenger names (as per passports)",
    passengersLede: "Include every guest as they appear on their passport, cabin by cabin.",
    fullName: guest => `${guest} full name *`,
    requests: "Special requests (optional)",
    requestsPlaceholder: "Celebrations, connecting cabins, or anything we should know.",
    paymentTitle: "Payment preference",
    paymentLede:
      "Choose how you would prefer to pay. Invoice and payment instructions will follow from Hathor Reservations. No card details are collected on this website.",
    card: "Visa / card payment",
    cardNote: `Adds a ${CARD_SURCHARGE_PERCENT}% online payment surcharge. Hathor sends the invoice later — no card number is stored here.`,
    surchargeNote: breakdown =>
      `Online card payments carry a ${CARD_SURCHARGE_PERCENT}% surcharge, already added to your total${breakdown ? `: ${breakdown}` : ""}. Bank transfer adds nothing.`,
    bank: "Bank transfer",
    bankNote: "No surcharge. Pay via international bank transfer using the instructions on your invoice.",
    schedule: "Payment schedule",
    scheduleNote:
      "After sending your reservation request, Hathor Reservations will review the details and send the invoice with payment instructions. Your cabins are reserved for you the moment you send this request.",
    includedTitle: "Included in your voyage",
    inclusions: HATHOR_BOOKING_INCLUSIONS,
    terms: "Terms",
    termsBefore: "I have read the",
    termsLink: "booking and cancellation terms",
    termsAfter: "and understand this sends a booking request, not a confirmed reservation.",
    marketing: "Keep me informed about Hathor voyages and offers. (optional)",
    backToSuites: "← Back to guests & suites",
    sending: "Sending your request…",
    confirm: "Confirm request",
    noPayment: "No payment is collected at this step.",
    countrySearch: "Search your country",
    noCountry: query => `No country matches “${query}”.`,
    tabs: {
      lead: "Lead guest",
      complete: "Complete",
      yourDetails: "Your details",
      passengers: "Passengers",
      named: (named, total) => `${named} of ${total} named`,
      payment: "Payment",
      withTerms: method => `${method} · terms`,
      thenConfirm: "Then confirm",
      review: "Review",
    },
    methodShort: bank => (bank ? "Bank transfer" : "Card"),
    methodLong: bank => (bank ? "Bank transfer" : "Visa / card payment"),
    paymentSub: bank =>
      bank
        ? "Invoice and payment instructions follow by email."
        : `A ${CARD_SURCHARGE_PERCENT}% card surcharge is added when you pay. Invoice and payment instructions follow by email.`,
    withSurcharge: partySub => `${partySub} · incl. ${CARD_SURCHARGE_PERCENT}% card surcharge`,
    changePayment: "Change payment preference",
    reviewTitle: "Review your voyage",
    reviewLede: "Check everything once more, then confirm your request below.",
    soFarTitle: "Your voyage so far",
    soFarLede: "Nothing is held until you send your request.",
    sendingShort: "Sending…",
    barConfirm: "Confirm request",
    barSending: "Sending your request…",
    barConfirmLabel: "Confirm request from the voyage bar",
    errors: {
      firstName: "Please enter the lead guest first name.",
      lastName: "Please enter the lead guest last name.",
      email: "Please enter a valid email address.",
      country: "Please choose your country.",
      phone: "Please check the phone number.",
      phoneNoCountry: "Choose your country first, then enter your number.",
      names: list => `Please give the full name of ${list}, as in the passport.`,
      terms: "Please accept the booking and cancellation terms.",
    },
    remind: "Before we can send your request, please add: ",
    reminder: {
      firstName: "the lead guest's first name",
      lastName: "the lead guest's last name",
      email: "a valid email address",
      country: "your country",
      phoneValid: "a valid phone number",
      phone: "your phone number",
      names: (count, list) => `the full ${count === 1 ? "name" : "names"} of ${list}`,
      terms: "your acceptance of the booking terms",
    },
  },

  alerts: {
    tryAgain: "Please try again.",
    cartSailingClosed: date => `The sailing in your cart (${date}) is no longer open. Please choose another date.`,
    cartCabinClosed: roomId =>
      `Cabin ${roomId} is no longer open for this sailing. Choose another date or release the map selection below.`,
    availabilityUnavailable: "Availability is unavailable.",
    cannotFit: (types, guests) =>
      `${types === 1 ? "That cabin type" : "Those cabin types"} cannot take all ${guests} guests on this date. Choose another type as well.`,
    trimmed: names =>
      `A ${names.join(" and ")} you chose was just booked by another guest. Its guests are waiting in Who Is Travelling — please place them again.`,
    chooseDateFirst: "Choose one of the open sailing dates first.",
    sailingClosed: "That sailing has just closed. Please choose another date.",
    sailingFull: "This sailing is fully booked. Please choose another date.",
    unableToCheck: "Unable to check availability.",
    cabinClosed: roomId => `Cabin ${roomId} is no longer open. Choose another date or release the map selection.`,
    placeInPreferred: (roomId, above) =>
      `Place guests in the selected cabin type, or release cabin ${roomId}${above ? " above" : ""} to choose freely.`,
    closedNothingAdded: "This sailing has just closed, so nothing was added to your cart.",
    typeBooked: roomType => `${roomType} was just booked on this sailing, so it was not added to your cart.`,
    couldNotCheck: "We could not check availability just now, so nothing was added. Please try again.",
    totalChanged: amount =>
      `The voyage total for these cabins is now ${amount}. Please check it and press Confirm request again.`,
    cabinTaken:
      "One of your cabins was just booked by another guest. Availability has been updated. Please check your cabins and try again.",
    notSent: "Your request could not be sent.",
    sendFailed: reason => `${reason} Nothing is being held for you, so pressing Confirm request again starts a fresh request.`,
    securityCheck: "Please complete the security check before sending your booking request.",
  },

  plan: {
    custom: "Hathor set this schedule for your booking: the first invoice, then the remaining balance by the date shown.",
    rules: {
      3: "Booked more than 60 days before departure: 30% with the first invoice, 20% by 60 days before, and the last 50% by 45 days before.",
      2: "Booked 46 to 60 days before departure: 50% with the first invoice and the other 50% by 45 days before.",
      1: "Booked 45 days or less before departure: the full amount with the first invoice.",
    },
    names: {
      1: ["Full payment"],
      2: ["First invoice", "Final invoice"],
      3: ["First invoice", "Second invoice", "Final invoice"],
    },
    invoice: index => `Invoice ${index}`,
    paid: "Paid",
    paidByThen: amount => `${amount} paid by then`,
    whole: "The whole voyage",
    rulesLabel: "How payment is split",
  },

  result: {
    reservation: "Reservation",
    newSearch: "Start a new search",
    contact: "Contact Hathor",
    notFound: "Booking not found",
    noReference: "We could not find a booking reference. Please check your link or start a new search.",
    loadFailed: "Unable to load your booking",
    loadFailedText: "We had trouble loading your details. Please try again in a moment, or contact our reservations team.",
    noBooking: "We could not find a booking with that reference. It may have expired, or the link may be incomplete.",
    status: {},
    method: method => (method === "BANK_TRANSFER" ? "Bank Transfer" : method === "VISA" ? "Visa" : "—"),
    guideHeading: "What happens from here",
    guide: [
      { label: "Request sent", hint: "Nothing was charged" },
      { label: "Hathor reviews it", hint: "We confirm cabins and total" },
      { label: "Invoice and payment", hint: "By email, for your method" },
      { label: "Booking confirmed", hint: "Once payment is recorded" },
    ],
    cabinsToConfirm: "Cabins to confirm",
    booking: code => `Booking ${code}`,
    returnHome: "Return to Hathor",
    requestSent: "Request sent",
    titleSent: "Request Sent",
    titleConfirmed: "Reservation Confirmed",
    titleOther: "Your Reservation",
    ledeSent: "Thank you for choosing Hathor. We will be in touch with your invoice.",
    ledeOther: "The current status of your Nile voyage.",
    quote: "Luxury. Heritage. Belonging.",
    submitted: "Your reservation request has been successfully submitted.",
    confirmedText: "Hathor has accepted your reservation and recorded the required payment.",
    currentStatus: "This is the current status of your reservation.",
    headingSent: "Your Reservation Request Has Been Sent",
    headingConfirmed: "Your reservation is confirmed.",
    headingOther: "Your reservation.",
    sentNote:
      "Thank you for choosing Hathor. Our reservations team will review your request and contact you with invoice and payment instructions. This is not a confirmed reservation, and no payment was collected on this website.",
    code: "Booking code · use it to track this booking",
    emailed: email => `A copy of this request was emailed to ${email}.`,
    emailFailed: "Your request is saved, but our confirmation email could not be delivered. Please contact us so we can reach you.",
    emailPending: "Your request is saved. The confirmation email is on its way.",
    preferredMethod: "Preferred payment method",
    next: "What happens next?",
    reviewTitle: "Hathor Reservations reviews your request",
    reviewText: "We verify the cabin and the final voyage total.",
    invoiceSent: "Your invoice has been sent",
    invoiceComing: "You receive invoice and payment instructions",
    invoiceCheck: email => `Check ${email ?? "your email"} for the amount due and how to pay.`,
    invoiceBy: "Sent by email for your preferred method.",
    confirmedTitle: "Reservation confirmed after payment is recorded",
    confirmedTextNext: "Once Hathor accepts the request and the required payment is recorded.",
    summary: "Your booking summary",
    guestSummary: (_adults, _children, fallback) => fallback,
    route: route => route,
    total: "Total booking amount",
    taxes: "Taxes and service charges included.",
    surchargeTaxes: amount => `Includes the ${CARD_SURCHARGE_PERCENT}% online card surcharge of ${amount}. Taxes and service charges included.`,
    timeline: "Payment timeline",
    here: "We are here for you",
    concierge: "Our concierge team is always happy to assist you with any questions.",
    hours: "",
    reply: "Or reply directly to your confirmation email.",
    viewRequest: "View my request",
  },

  lookup: {
    title: "Track your booking",
    lede: "Enter the booking code from your email (for example HB-3F2A91C0) and the email you booked with.",
    code: "Booking code",
    email: "Email",
    checking: "Checking…",
    track: "Track booking",
    newReservation: "Start a new reservation",
    notFound: "Unable to find reservation",
  },
  error: {
    title: "Something interrupted your booking",
    bodyBefore: "We hit a problem loading this page.",
    bodyStrong: "If you had already reached the confirmation step, your reservation may well have gone through",
    bodyAfter: " — please check your email before booking again.",
    tryAgain: "Try again",
    home: "Return home",
    helpBefore: "Still stuck? Email",
    helpAfter: "and we will complete your reservation by hand.",
    reference: "Reference:",
  },
  unverified: {
    kicker: "Cabin selection",
    title: "We could not verify this cabin.",
    text: "Your booking has not been started. Refresh to check again, or choose another cabin.",
    link: "Explore all cabins ↗",
  },
  roomGone: {
    title: "Cruise not found",
    text: "This sailing or room is no longer available. Try a new search.",
    link: "Back to search",
  },
  meta: {
    title: "Book Your Luxury Dahabiya Cruise",
    description:
      "Choose your Nile voyage, sailing date and cabin aboard Hathor Dahabiya, then send your booking request to our reservations team.",
  },
};

/* ---------- Italian ---------- */

const MONTHS_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const WEEKDAYS_IT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const itShortDate = (iso: string) => {
  const { day, month, year } = utcParts(iso);
  return `${day} ${MONTHS_IT[month].slice(0, 3)} ${year}`;
};
const itLongDate = (iso: string) => {
  const { weekday, day, month, year } = utcParts(iso);
  return `${WEEKDAYS_IT[weekday]} ${day} ${MONTHS_IT[month]} ${year}`;
};
/** "USD 7.000", "USD 7.000,50": US dollars, Italian separators. */
/** "2,5%": the card surcharge with an Italian decimal comma. */
const SURCHARGE_IT = `${String(CARD_SURCHARGE_PERCENT).replace(".", ",")}%`;
const itMoney = (cents: number) =>
  `USD ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(cents / 100)
    .replace(/[,.]/g, mark => (mark === "," ? "." : ","))}`;
const itCount = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const itJoin = (items: string[]) =>
  items.length <= 1 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
/** "mercoledì" from "Mercoledì": weekdays are lower case inside a sentence. */
const weekday = (day: string) => day.toLowerCase();

/** Server messages the guest can meet in the journey, in Italian. */
const SERVER_IT: Record<string, string> = {
  "Too many requests. Please wait and try again.": "Troppe richieste. Attenda qualche istante e riprovi.",
  "The requested rooms or hold are no longer available. Start a new selection.":
    "Le cabine richieste non sono più disponibili. Inizi una nuova selezione.",
  "The booking request is invalid or does not match this checkout attempt.":
    "La richiesta di prenotazione non è valida o non corrisponde a questo tentativo.",
  "Please enter a name without web addresses.": "Inserisca un nome senza indirizzi web.",
  "Guest count exceeds cabin capacity.": "Il numero di ospiti supera la capienza della cabina.",
  "Use an international phone number, for example +201234567890.":
    "Usi un numero di telefono internazionale, ad esempio +201234567890.",
  "Booking code and email did not match": "Il codice di prenotazione e l’email non corrispondono.",
  "Reservation acknowledgement is required": "È necessario accettare le condizioni della prenotazione.",
  "Please try again.": "La preghiamo di riprovare.",
  "Validation failed": "Verifichi i dati inseriti e riprovi.",
  "Invalid email address": "Inserisca un indirizzo email valido.",
  "Invalid booking authorization": "Il link di questa prenotazione non è più valido. La ritrovi con il codice di prenotazione.",
  Unauthorized: "Il link di questa prenotazione non è più valido. La ritrovi con il codice di prenotazione.",
  "Not found": "Prenotazione non trovata.",
  "Database is busy. Please wait a moment and try again.": "Il sistema è momentaneamente occupato. Attenda qualche istante e riprovi.",
  "Internal server error": "Si è verificato un problema da parte nostra. Riprovi tra qualche istante.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "La verifica di sicurezza non è disponibile. Contatti direttamente il nostro ufficio prenotazioni.",
  "Please complete the security check and try again.": "Completi la verifica di sicurezza e riprovi.",
  "The security check is temporarily unavailable. Please try again.":
    "La verifica di sicurezza non è momentaneamente disponibile. La preghiamo di riprovare.",
  "The security check expired or could not be verified. Please try again.":
    "La verifica di sicurezza è scaduta o non è andata a buon fine. La preghiamo di riprovare.",
  "Content-Type must be application/json": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
  "Request body is too large": "La richiesta è troppo lunga. Abbrevi il testo inserito e riprovi.",
  "Invalid request body": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
  "Invalid request origin": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
  "Cross-site request rejected": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
  "Cross-origin request rejected": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
  "A valid Idempotency-Key header is required": "La richiesta non è valida. Aggiorni la pagina e riprovi.",
};
const SERVER_FALLBACK_IT = "Non è stato possibile completare l’operazione.";
const NETWORK_IT = "Connessione non riuscita. Verifichi la rete e riprovi.";

const IT: BookingCopy = {
  locale: "it",
  money: itMoney,
  monthLabel: (year, month) => `${capitalise(MONTHS_IT[month])} ${year}`,
  shortDate: itShortDate,
  longDate: itLongDate,
  weekdayShort: iso => WEEKDAYS_IT[utcParts(iso).weekday].slice(0, 3).toUpperCase(),
  folioRange: (fromIso, toIso) => `${itShortDate(fromIso)} – ${itShortDate(toIso)}`,
  stageLabel: stage => {
    if (stage.milestone === "INITIAL") return "All’invio della fattura da parte di Hathor";
    if (!stage.dueAt) return stage.milestone;
    if (stage.milestone === "BALANCE") return `Entro ${itLongDate(stage.dueAt)}`;
    const days = stage.milestone === "DAY_60" ? 60 : 45;
    return `Entro ${itLongDate(stage.dueAt)} · ${days} giorni prima della partenza`;
  },
  weekdayHeads: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  adults: count => itCount(count, "Adulto", "Adulti"),
  children: count => itCount(count, "Bambino", "Bambini"),
  kindCount: (count, kind) => (kind === "adult" ? itCount(count, "adulto", "adulti") : itCount(count, "bambino", "bambini")),
  partyLine: (adults, children) =>
    [itCount(adults, "Adulto", "Adulti"), children > 0 ? itCount(children, "Bambino", "Bambini") : null].filter(Boolean).join(" · "),
  cabins: count => itCount(count, "cabina", "cabine"),
  cabinsTitle: count => itCount(count, "Cabina", "Cabine"),
  nights: count => itCount(count, "notte", "notti"),
  guests: count => itCount(count, "ospite", "ospiti"),
  joinAnd: itJoin,
  countryName: (code, english) => COUNTRY_NAMES_IT[code] ?? english,
  serverMessage: message => {
    if (SERVER_IT[message]) return SERVER_IT[message];
    // Validation messages arrive as "Field: message".
    const detail = message.split(": ").slice(1).join(": ");
    return SERVER_IT[detail] ?? SERVER_FALLBACK_IT;
  },
  // A failed fetch or an unreadable reply carries the browser's own English;
  // every other error here was already worded by this file.
  caught: (error, fallback) => {
    if (error instanceof TypeError || error instanceof SyntaxError) return NETWORK_IT;
    if (error instanceof Error && error.name === "AbortError") return NETWORK_IT;
    return error instanceof Error ? error.message : fallback;
  },

  steps: ["Viaggio", "Ospiti e suite", "Dati e pagamento", "Richiesta inviata"],
  backTo: { 2: "Viaggio", 3: "Ospiti e suite" },
  progressLabel: "Avanzamento della prenotazione",
  stepOf: (step, of) => `Passo ${step} di ${of}`,
  bannerOf: "di 04",
  bannerKicker: (step, kicker) => `Passo ${step} di 4 · ${kicker}`,
  bandLine: ["Un modo più lento", "di scoprire un Egitto più grande"],
  bandWords: "Lusso. Eredità. Appartenenza.",
  scroll: "Scorri",
  guideHeading: "La mappa di questo passo",
  done: "(completato)",
  nextToDo: "(da fare ora)",
  edit: "Modifica",
  editLabel: label => `Modifica: ${label.toLowerCase()}`,
  actionBarLabel: "Il Suo viaggio e il prossimo passo",
  close: "Chiudi",
  oneMoment: "Un momento…",

  voyage: {
    chooseItinerary: "Scelga l’itinerario",
    departureCaption: day => `Ogni ${weekday(day)}`,
    departsOn: day => `Partenza ogni ${weekday(day)}`,
    nightsAndDay: (nights, day) => `${itCount(nights, "notte", "notti")} · ogni ${weekday(day)}`,
    itinerary: title => `Itinerario · ${title}`,
    expandAll: "Apri tutto",
    collapseAll: "Chiudi tutto",
    day: day => `Giorno ${day}`,
    // Italian paths open with the place, then a comma or a bracket: "Assuan, imbarco".
    placeFromPath: path => (path.split("→")[0] ?? path).replace(/\s*[,(].*$/, "").trim(),
  },
  calendar: {
    selectDate: "Selezioni la data di partenza",
    previousMonth: "Mese precedente",
    nextMonth: "Mese successivo",
    noSailings: "Nessuna partenza",
    dayLabel: (date, from) => `Partenza ${date}${from !== null ? `, da ${from}` : ""}`,
    available: "Partenza disponibile",
    unavailable: "Non disponibile",
    departures: "Partenze disponibili",
    empty: "Al momento non ci sono partenze disponibili per questo viaggio. Scelga un altro itinerario oppure contatti il nostro ufficio prenotazioni.",
    noneFrom: month => `Nessuna partenza disponibile da ${month}.`,
    from: amount => `Da ${amount}`,
    showFewer: "Mostra meno date",
    showAll: count => `Mostra tutte le ${count} partenze`,
    only: day => `Partenze solo di ${weekday(day)}.`,
  },
  rail: {
    summaryLabel: "Riepilogo del Suo viaggio",
    title: "Il Suo viaggio",
    barLabel: "Il Suo viaggio",
    journey: "Viaggio",
    dates: "Date",
    guests: "Ospiti",
    accommodation: "Sistemazione",
    payment: "Pagamento",
    selectDates: "Selezioni le date",
    chooseDate: "Scelga una data",
    notSelected: "Non ancora selezionata",
    noGuests: "Ancora nessun ospite",
    noCabin: "Ancora nessuna cabina",
    to: date => `al ${date}`,
    total: cabins => (cabins > 1 ? `Totale · ${itCount(cabins, "cabina", "cabine")}` : "Totale del viaggio"),
    pending: "Selezioni la sistemazione",
    pendingFine: "Il totale del viaggio compare quando tutti gli ospiti hanno una cabina.",
    fine: nights => `Intero viaggio di ${nights} notti, tariffe per cabina. Tasse e servizio inclusi.`,
    tagline: "Un ritmo più alto",
  },

  journey: {
    kicker: "Viaggio",
    title: "Pianifichi il Suo viaggio",
    lede: "Tre viaggi straordinari. Un fiume senza tempo.",
    quote: "Più di un viaggio.",
    guide: [
      { label: "Scelga il viaggio", hint: "3, 4 o 7 notti sul Nilo" },
      { label: "Scelga una data di partenza", hint: "Le partenze disponibili sono evidenziate" },
      { label: "Prosegua con ospiti e suite", hint: "Per ora nulla è bloccato" },
    ],
    mapChoice: roomId =>
      `Scelta sulla mappa della nave: cabina ${roomId}. Sarà verificata di nuovo e riservata nel momento in cui invia la richiesta; per ora nulla è bloccato.`,
    chooseFreely: "Preferisco scegliere liberamente",
    yourDeparture: "La Sua partenza",
    datesHelp: "Le serve un’altra data? Se non trova la partenza che preferisce,",
    datesHelpLink: "contatti il nostro ufficio prenotazioni",
    chooseToContinue: "Scelga una data di partenza per continuare.",
    checking: "Verifica della disponibilità…",
    checkingShort: "Verifica…",
    continueLong: "Prosegui con ospiti e suite",
    continueShort: "Continua",
    chooseDate: "Scegli una data",
    tileChoose: "Da scegliere",
    chooseDepartureDate: "Scegli una data di partenza",
    departs: date => `Partenza ${date}`,
    loadingDates: "Caricamento delle date…",
    noOpenDates: "Nessuna data disponibile",
    perCabin: "per cabina, intero viaggio",
    perUnitVoyage: unit => `${unit}, intero viaggio`,
    barContinueLabel: "Prosegui con ospiti e suite",
    blocker: "Scelga prima una data di partenza: le date disponibili sono evidenziate nel calendario.",
    tabs: { voyage: "Viaggio", date: "Data", review: "Riepilogo", toChoose: "Da scegliere", nothingHeld: "Nulla di bloccato" },
    departure: "Partenza",
    guests: "Ospiti",
  },
  sheets: {
    dateTitle: "Selezioni la data di partenza",
    datePick: "Tocchi una delle date evidenziate in oro.",
    applyDate: "Applica la data",
    clearDate: "Cancella la data",
    clearSelection: "Cancella la selezione",
    guestsTitle: "Chi viaggia",
    guestsLede: "Al passo successivo sistemerà ciascun ospite in una cabina.",
    done: party => `Fatto · ${party}`,
  },
  counters: {
    adults: "Adulti",
    adultsHint: "Dai 12 anni in su",
    children: "Bambini",
    childrenHint: "Dai 2 agli 11 anni",
    fewer: label => (label === "Adulti" ? "Un adulto in meno" : "Un bambino in meno"),
    more: label => (label === "Adulti" ? "Un adulto in più" : "Un bambino in più"),
  },

  suites: {
    title: "Scelga la Sua cabina o suite",
    lede: "Tutte le cabine della nave per la data scelta. Sistemi gli ospiti nelle cabine che desidera: li trascini dentro oppure indichi sulla cabina quanti adulti e bambini.",
    mapChoice: roomId =>
      `Dalla mappa della nave: cabina ${roomId}. Sistemi gli ospiti in questa tipologia di cabina. La cabina esatta sarà verificata di nuovo quando invia la richiesta; per ora non è bloccata.`,
    everyCabin: "Tutte le cabine di questa partenza · sistemi gli ospiti",
    filterLabel: "Filtra le cabine per tipologia",
    allRooms: "Tutte le cabine",
    cabinCount: count => `${count} cabine`,
    showing: (cabins, free) => `Cabine mostrate: ${cabins} · ${free} ${free === 1 ? "libera" : "libere"} in questa data`,
    hiddenByFilter: count =>
      count === 1 ? "1 cabina con i Suoi ospiti è nascosta dal filtro." : `${count} cabine con i Suoi ospiti sono nascoste dal filtro.`,
    showAllRooms: "Mostra tutte le cabine",
    cabinAria: (roomType, index, inside, capacity) => `${roomType}, cabina ${index}, ${inside} ${inside === 1 ? "ospite" : "ospiti"} su ${capacity}`,
    cabinOutAria: (roomType, index) => `${roomType}, cabina ${index}, non disponibile in questa data`,
    saveName: (roomType, voyage) => `${roomType}, viaggio di ${voyage}`,
    inCart: roomType => `La ${roomType} per questa partenza è nel Suo carrello.`,
    cabinNumber: index => `Cabina ${index}`,
    shownInPreview: label => `La ${label} è mostrata nell’anteprima`,
    showInPreview: label => `Mostra la ${label} nell’anteprima`,
    selected: "Selezionata",
    select: "Seleziona",
    perCabinVoyage: "per cabina · intero viaggio",
    entireVoyage: "intero viaggio",
    upTo: capacity => `Fino a ${capacity} ospiti`,
    bed: { "Luxury King Cabin": "Letto king size", "Luxury Twin Cabin": "Letti singoli" },
    note: {
      "Luxury King Cabin": "Letto king size",
      "Luxury Twin Cabin": "Letti singoli",
      "Luxury Suite": "Salotto separato",
      "Royal Suite": "Salotto privato",
    },
    viewRoomLabel: roomType => `Visualizza la ${roomType} (si apre in una nuova scheda)`,
    viewRoom: "Vedi la cabina",
    unavailableDate: "Non disponibile in questa data",
    seatsTaken: (inside, capacity) => `${inside} ${inside === 1 ? "posto occupato" : "posti occupati"} su ${capacity}`,
    menuLabel: (label, cabin) => `${label} nella ${cabin}`,
    empty: label => `Svuota la ${label}`,
    needsAdult: "Ogni cabina deve ospitare almeno un adulto.",
    inclusions: "Cosa è incluso e cosa no",
    included: "Incluso",
    notIncluded: "Non incluso",
    placeIn: (guest, cabin) => `Sistema ${guest} nella ${cabin}`,
    placeHere: "Sistema qui",
    more: (count, shortName) => (count === 1 ? `Un’altra ${shortName}` : `Altre ${count} ${shortName}`),
    free: count => `${count} ${count === 1 ? "libera" : "libere"}`,
    party: "Chi viaggia",
    partyLede:
      "Aggiunga qui gli ospiti, poi li sistemi nelle cabine: li trascini, tocchi un ospite e poi una cabina, oppure usi i menu Adulti e Bambini sulla cabina.",
    choosing: guest => `Scelga una cabina per ${guest}. Prema Esc per annullare.`,
    arrangeForMe: "Sistema per me",
    undoArrangement: "Annulla la sistemazione",
    undoTitle: "Annullare tutte le sistemazioni?",
    undoText:
      "Tutte le sistemazioni saranno annullate: ogni ospite lascia la propria cabina e torna ad attendere in «Chi viaggia», e nessuna cabina resta scelta. Il numero di adulti e bambini resta invariato.",
    keep: "Mantieni la sistemazione",
    undoAll: "Annulla tutto",
    noteBox: "Ogni cabina indica quanti ospiti può accogliere. Ogni cabina richiede un adulto. Le tariffe sono per cabina, per l’intero viaggio.",
    trayLabel: "Ospiti ancora da sistemare",
    tapCabinFor: guest => `Ora tocchi una cabina per ${guest}.`,
    howTo: "Tocchi un ospite, poi una cabina, oppure lo trascini dentro.",
    toPlace: count => (count === 1 ? "1 ospite da sistemare" : `${count} ospiti da sistemare`),
    everyoneHasCabin: "Ogni ospite ha una cabina",
    takeOut: (guest, cabin) => `Togli ${guest} dalla ${cabin}`,
    continueToDetails: "Prosegui con i dati",
    backToJourney: "Torna al viaggio",
    back: "Indietro",
    notices: {
      waiting: guest => `${guest} è in attesa di una cabina.`,
      placed: (guest, cabin) => `${guest} è nella ${cabin}.`,
      counted: (cabin, count) => `${cabin}: ${count}.`,
      emptied: cabin => `La ${cabin} è vuota. I suoi ospiti attendono in «Chi viaggia».`,
      arranged: "Gli ospiti sono nelle loro cabine. Può spostare chi desidera.",
      undone: "Tutte le sistemazioni sono state annullate. Gli ospiti attendono in «Chi viaggia».",
    },
    tile: (guest, where) =>
      `${guest}, ${where ? `nella ${where}` : "in attesa di una cabina"}. Lo trascini in una cabina, oppure lo selezioni e poi scelga una cabina.`,
    kind: kind => (kind === "adult" ? "Adulto" : "Bambino"),
    arrange: {
      title: "Quali cabine desidera?",
      lede: guests =>
        guests === 1
          ? "Scelga una o più tipologie. Sistemeremo l’ospite nel rispetto dei limiti di ogni cabina."
          : `Scelga una o più tipologie. Sistemeremo tutti e ${guests} gli ospiti nel rispetto dei limiti di ogni cabina.`,
      freeEach: (free, capacity) => `${free} ${free === 1 ? "libera" : "libere"} · fino a ${capacity} ospiti ciascuna`,
      go: "Sistema i miei ospiti",
      cancel: "Annulla",
    },
    browse: {
      tagline: {
        "Luxury King Cabin": "Un rifugio tranquillo per due.",
        "Luxury Twin Cabin": "Letti singoli e ampie vetrate sul Nilo.",
        "Luxury Suite": "Spazi generosi e una Jacuzzi privata.",
        "Royal Suite": "La residenza più spaziosa di Hathor.",
      },
      features: {
        "Luxury King Cabin": size => [
          "Letto king size",
          `${size} m²`,
          "Vista panoramica sul Nilo",
          "Fino a 2 ospiti",
          "Cabine comunicanti disponibili",
          "Wi-Fi, servizio in camera e minibar rifornito ogni giorno",
        ],
        "Luxury Twin Cabin": size => [
          "Letti singoli",
          `${size} m²`,
          "Vista panoramica sul Nilo",
          "Fino a 2 ospiti",
          "Cabine comunicanti disponibili",
          "Wi-Fi, servizio in camera e minibar rifornito ogni giorno",
        ],
        "Luxury Suite": size => [
          "Jacuzzi privata",
          `${size} m² con salotto separato`,
          "Vista panoramica sul Nilo",
          "Fino a 4 ospiti",
          "Passaggi ampi per muoversi con facilità",
          "Wi-Fi, servizio in camera e minibar rifornito ogni giorno",
        ],
        "Royal Suite": size => [
          "Balcone privato sul Main Deck",
          "Due bagni",
          `${size} m² con salotto privato`,
          "Fino a 4 ospiti",
          "Wi-Fi, servizio in camera e minibar rifornito ogni giorno",
        ],
      },
      preview: roomType => `Anteprima della ${roomType}`,
      photos: roomType => `Foto della ${roomType}`,
      photoOf: (index, count) => `Foto ${index} di ${count}. Usi i tasti freccia per vederne altre.`,
      photoAlt: (roomType, index, count) => `${roomType}, foto ${index} di ${count}`,
      inBooking: "Nella Sua prenotazione",
      previousPhoto: "Foto precedente",
      nextPhoto: "Foto successiva",
      closePhotos: "Chiudi le foto",
      photosGroup: "Foto",
      photo: index => `Foto ${index}`,
      selected: label => `Selezionata · ${label}`,
      perCabin: "Per cabina",
      voyageMeals: nights => `Intero viaggio di ${nights} notti, tutti i pasti e le bevande analcoliche inclusi.`,
      fullyBooked: "Al completo in questa data",
      showType: (count, shortName, free) =>
        `Mostra ${count === 1 ? "la" : "le"} ${count} ${shortName} · ${free} ${free === 1 ? "libera" : "libere"}`,
      fullDetails: "Tutti i dettagli della cabina",
    },
    tabs: {
      guests: "Ospiti",
      cabins: "Cabine",
      placed: (placed, total) => `${placed}/${total} in cabina`,
      checkCabin: "Controlli una cabina",
    },
    placeGuests: "Sistema gli ospiti",
    checkCabins: "Controlla le cabine",
    // The phone bar's amount, in its large display face: kept short.
    noCabinYet: "Da definire",
    continueDetailsLabel: "Prosegui con i dati",
    barContinueLabel: "Prosegui con i dati degli ospiti",
    placeYourGuests: "Sistemi gli ospiti",
    guide: [
      { label: "Indichi chi viaggia", hint: "Adulti e bambini" },
      { label: "Sistemi ogni ospite in una cabina", hint: "Trascini, tocchi o usi i menu" },
      { label: "Prosegua con i dati", hint: "Per ora nulla è bloccato" },
    ],
  },

  arrangement: {
    guest: (kind, number) => `${kind === "adult" ? "Adulto" : "Bambino"} ${number}`,
    thatCabin: "cabina",
    gone: "Questo ospite non fa più parte del gruppo.",
    notAvailable: cabin => `La ${cabin} non è disponibile in questa data.`,
    full: (cabin, capacity) => `La ${cabin} è al completo: accoglie fino a ${capacity} ospiti.`,
    childLimit: (cabin, max) => `La ${cabin} ospita già ${max} bambini.`,
    takesUpTo: (cabin, capacity) => `La ${cabin} accoglie fino a ${capacity} ospiti.`,
    noneWaiting: kind =>
      `Nessun ${kind === "adult" ? "adulto" : "bambino"} in attesa. Lo aggiunga in «Chi viaggia» oppure lo tolga da un’altra cabina.`,
    onlyWaiting: (count, kind) =>
      `${count === 1 ? "Solo 1" : `Solo ${count}`} ${kind === "adult" ? (count === 1 ? "adulto" : "adulti") : count === 1 ? "bambino" : "bambini"} in attesa. Ne aggiunga prima altri in «Chi viaggia».`,
    stillNeed: count => (count === 1 ? "1 ospite ha ancora bisogno di una cabina." : `${count} ospiti hanno ancora bisogno di una cabina.`),
    needsAdult: cabin => `La ${cabin} deve ospitare almeno un adulto.`,
    listStillNeeds: (list, count) => `${list} ${count === 1 ? "ha" : "hanno"} ancora bisogno di una cabina.`,
  },

  details: {
    kicker: "Dati e pagamento",
    title: "Dati e pagamento",
    lede: "Pochi dati per completare la prenotazione.",
    quote: "Un modo più lento e più ricco di scoprire l’Egitto.",
    panelTitle: "Dati degli ospiti e preferenza di pagamento",
    panelLede: "Ci siamo quasi. Inserisca i Suoi dati e scelga il metodo di pagamento che preferisce.",
    guide: [
      { label: "Dati dell’ospite principale", hint: "Nome, email, telefono, paese" },
      { label: "Nomi dei passeggeri", hint: "Come nei passaporti" },
      { label: "Pagamento e condizioni", hint: "Nessun dato della carta richiesto" },
      { label: "Conferma la richiesta", hint: "Le cabine vengono riservate all’invio" },
    ],
    lead: "Dati dell’ospite principale",
    leadLede: "Sarà il contatto principale per il Suo viaggio.",
    firstName: "Nome *",
    firstNamePlaceholder: "es. Alex",
    lastName: "Cognome *",
    lastNamePlaceholder: "es. Rossi",
    email: "Indirizzo email *",
    emailPlaceholder: "es. alex@example.com",
    country: "Paese *",
    phone: "Telefono *",
    countryCode: country => `Prefisso internazionale: ${country}`,
    countryCodeMissing: "Scelga il paese per il prefisso",
    phonePlaceholder: "Numero di telefono",
    phoneNoCountry: "Scelga prima il paese",
    passengers: "Nomi dei passeggeri (come nei passaporti)",
    passengersLede: "Indichi ogni ospite come riportato sul passaporto, cabina per cabina.",
    fullName: guest => `${guest}: nome completo *`,
    requests: "Richieste particolari (facoltativo)",
    requestsPlaceholder: "Ricorrenze, cabine comunicanti o qualsiasi cosa dovremmo sapere.",
    paymentTitle: "Preferenza di pagamento",
    paymentLede:
      "Scelga come preferisce pagare. Fattura e istruzioni di pagamento Le saranno inviate dal nostro ufficio prenotazioni. Su questo sito non vengono raccolti dati della carta.",
    card: "Pagamento con Visa / carta",
    cardNote: `Prevede un supplemento del ${SURCHARGE_IT} per il pagamento online. Hathor invierà la fattura in seguito: qui non viene memorizzato alcun numero di carta.`,
    surchargeNote: breakdown =>
      `I pagamenti online con carta prevedono un supplemento del ${SURCHARGE_IT}, già aggiunto al totale${breakdown ? `: ${breakdown}` : ""}. Il bonifico bancario non prevede supplementi.`,
    bank: "Bonifico bancario",
    bankNote: "Nessun supplemento. Pagamento tramite bonifico internazionale, seguendo le istruzioni riportate in fattura.",
    schedule: "Piano dei pagamenti",
    scheduleNote:
      "Dopo l’invio della richiesta di prenotazione, il nostro ufficio prenotazioni ne verificherà i dettagli e Le invierà la fattura con le istruzioni di pagamento. Le cabine vengono riservate a Suo nome nel momento in cui invia questa richiesta.",
    includedTitle: "Incluso nel Suo viaggio",
    inclusions: [
      "Trasferimenti di andata e ritorno dagli aeroporti di Assuan o Luxor",
      "IVA e costi di servizio",
      "Aperitivo di benvenuto all’arrivo",
      "Formula Soft All-Inclusive: pasti e bevande analcoliche",
      "Biglietti d’ingresso per le visite previste dall’itinerario",
      "Guida egittologa",
      "Servizio lavanderia e rifornimento giornaliero del minibar",
      "Wi-Fi, servizio in camera, macchina del caffè e bollitore per il tè",
    ],
    terms: "Condizioni",
    termsBefore: "Ho letto le",
    termsLink: "condizioni di prenotazione e cancellazione",
    termsAfter: "e sono consapevole che così invio una richiesta di prenotazione, non una prenotazione confermata.",
    marketing: "Desidero ricevere aggiornamenti sui viaggi e sulle offerte Hathor. (facoltativo)",
    backToSuites: "← Torna a ospiti e suite",
    sending: "Invio della richiesta…",
    confirm: "Conferma la richiesta",
    noPayment: "In questo passo non viene effettuato alcun pagamento.",
    countrySearch: "Cerchi il Suo paese",
    noCountry: query => `Nessun paese corrisponde a «${query}».`,
    tabs: {
      // Short: four tabs share a 375px phone.
      lead: "Referente",
      complete: "Completo",
      yourDetails: "I Suoi dati",
      passengers: "Passeggeri",
      named: (named, total) => `Nomi: ${named} su ${total}`,
      payment: "Pagamento",
      withTerms: method => `${method} · condizioni`,
      thenConfirm: "Poi confermi",
      review: "Riepilogo",
    },
    methodShort: bank => (bank ? "Bonifico" : "Carta"),
    methodLong: bank => (bank ? "Bonifico bancario" : "Pagamento con Visa / carta"),
    paymentSub: bank =>
      bank
        ? "Fattura e istruzioni di pagamento Le arriveranno via email."
        : `Al pagamento si aggiunge un supplemento del ${SURCHARGE_IT} per la carta. Fattura e istruzioni di pagamento Le arriveranno via email.`,
    withSurcharge: partySub => `${partySub} · incl. supplemento carta del ${SURCHARGE_IT}`,
    changePayment: "Cambia la preferenza di pagamento",
    reviewTitle: "Riepilogo del Suo viaggio",
    reviewLede: "Controlli ancora una volta ogni dettaglio, poi confermi la richiesta qui sotto.",
    soFarTitle: "Il Suo viaggio finora",
    soFarLede: "Nulla viene bloccato finché non invia la richiesta.",
    sendingShort: "Invio…",
    barConfirm: "Conferma",
    barSending: "Invio…",
    barConfirmLabel: "Conferma la richiesta dalla barra del viaggio",
    errors: {
      firstName: "Inserisca il nome dell’ospite principale.",
      lastName: "Inserisca il cognome dell’ospite principale.",
      email: "Inserisca un indirizzo email valido.",
      country: "Scelga il Suo paese.",
      phone: "Verifichi il numero di telefono.",
      phoneNoCountry: "Scelga prima il Suo paese, poi inserisca il numero.",
      names: list => `Indichi il nome completo di ${list}, come nel passaporto.`,
      terms: "Accetti le condizioni di prenotazione e cancellazione.",
    },
    remind: "Prima di inviare la richiesta, aggiunga: ",
    reminder: {
      firstName: "il nome dell’ospite principale",
      lastName: "il cognome dell’ospite principale",
      email: "un indirizzo email valido",
      country: "il Suo paese",
      phoneValid: "un numero di telefono valido",
      phone: "il Suo numero di telefono",
      names: (count, list) => (count === 1 ? `il nome completo di ${list}` : `i nomi completi di ${list}`),
      terms: "l’accettazione delle condizioni di prenotazione",
    },
  },

  alerts: {
    tryAgain: "La preghiamo di riprovare.",
    cartSailingClosed: date => `La partenza nel Suo carrello (${date}) non è più disponibile. Scelga un’altra data.`,
    cartCabinClosed: roomId =>
      `La cabina ${roomId} non è più disponibile per questa partenza. Scelga un’altra data oppure rinunci alla scelta fatta sulla mappa qui sotto.`,
    availabilityUnavailable: "Al momento non è possibile consultare la disponibilità.",
    cannotFit: (types, guests) =>
      types === 1
        ? `Questa tipologia di cabina non può accogliere tutti e ${guests} gli ospiti in questa data. Scelga anche un’altra tipologia.`
        : `Queste tipologie di cabina non possono accogliere tutti e ${guests} gli ospiti in questa data. Scelga anche un’altra tipologia.`,
    trimmed: names =>
      `Una ${names.join(" e una ")} che aveva scelto è appena stata prenotata da un altro ospite. I suoi ospiti attendono in «Chi viaggia»: li sistemi di nuovo.`,
    chooseDateFirst: "Scelga prima una delle date di partenza disponibili.",
    sailingClosed: "Questa partenza è appena stata chiusa. Scelga un’altra data.",
    sailingFull: "Questa partenza è al completo. Scelga un’altra data.",
    unableToCheck: "Impossibile verificare la disponibilità.",
    cabinClosed: roomId => `La cabina ${roomId} non è più disponibile. Scelga un’altra data oppure rinunci alla scelta fatta sulla mappa.`,
    placeInPreferred: (roomId, above) =>
      `Sistemi gli ospiti nella tipologia di cabina selezionata, oppure rinunci alla cabina ${roomId}${above ? " qui sopra" : ""} per scegliere liberamente.`,
    closedNothingAdded: "Questa partenza è appena stata chiusa, quindi nulla è stato aggiunto al Suo carrello.",
    typeBooked: roomType => `La ${roomType} è appena stata prenotata su questa partenza, quindi non è stata aggiunta al Suo carrello.`,
    couldNotCheck: "Non è stato possibile verificare la disponibilità in questo momento, quindi nulla è stato aggiunto. La preghiamo di riprovare.",
    totalChanged: amount =>
      `Il totale del viaggio per queste cabine è ora ${amount}. Lo verifichi e prema di nuovo «Conferma la richiesta».`,
    cabinTaken:
      "Una delle Sue cabine è appena stata prenotata da un altro ospite. La disponibilità è stata aggiornata. Verifichi le cabine e riprovi.",
    notSent: "Non è stato possibile inviare la richiesta.",
    sendFailed: reason =>
      `${reason} Nessuna cabina è bloccata a Suo nome: premendo di nuovo «Conferma la richiesta» si avvia una nuova richiesta.`,
    securityCheck: "Completi la verifica di sicurezza prima di inviare la richiesta di prenotazione.",
  },

  plan: {
    custom: "Hathor ha stabilito questo piano per la Sua prenotazione: la prima fattura, poi il saldo entro la data indicata.",
    rules: {
      3: "Prenotazione a più di 60 giorni dalla partenza: 30% con la prima fattura, 20% entro il 60º giorno prima della partenza e il restante 50% entro il 45º giorno prima della partenza.",
      2: "Prenotazione tra 46 e 60 giorni dalla partenza: 50% con la prima fattura e il restante 50% entro il 45º giorno prima della partenza.",
      1: "Prenotazione a 45 giorni o meno dalla partenza: l’intero importo con la prima fattura.",
    },
    names: {
      1: ["Pagamento completo"],
      2: ["Prima fattura", "Fattura finale"],
      3: ["Prima fattura", "Seconda fattura", "Fattura finale"],
    },
    invoice: index => `Fattura ${index}`,
    paid: "Pagato",
    paidByThen: amount => `${amount} pagati entro quella data`,
    whole: "L’intero viaggio",
    rulesLabel: "Come è suddiviso il pagamento",
  },

  result: {
    reservation: "Prenotazione",
    newSearch: "Inizia una nuova ricerca",
    contact: "Contatta Hathor",
    notFound: "Prenotazione non trovata",
    noReference: "Non abbiamo trovato alcun riferimento di prenotazione. Verifichi il link oppure inizi una nuova ricerca.",
    loadFailed: "Impossibile caricare la prenotazione",
    loadFailedText:
      "Si è verificato un problema nel caricamento dei dati. Riprovi tra qualche istante oppure contatti il nostro ufficio prenotazioni.",
    noBooking:
      "Non abbiamo trovato alcuna prenotazione con questo riferimento. Potrebbe essere scaduta, oppure il link potrebbe essere incompleto.",
    status: {
      REQUESTED: "Richiesta ricevuta",
      PENDING_HOLD: "Blocco temporaneo",
      CONFIRMED: "Confermata",
      CANCELLED: "Annullata",
      EXPIRED: "Scaduta",
    },
    method: method => (method === "BANK_TRANSFER" ? "Bonifico bancario" : method === "VISA" ? "Visa" : "—"),
    guideHeading: "Cosa succede ora",
    guide: [
      { label: "Richiesta inviata", hint: "Nessun addebito effettuato" },
      { label: "Hathor la esamina", hint: "Confermiamo cabine e totale" },
      { label: "Fattura e pagamento", hint: "Via email, per il metodo scelto" },
      { label: "Prenotazione confermata", hint: "Dopo la registrazione del pagamento" },
    ],
    cabinsToConfirm: "Cabine da confermare",
    // The voyage bar's total label: short, so the code stays on one line.
    booking: code => `Codice ${code}`,
    returnHome: "Torna a Hathor",
    requestSent: "Richiesta inviata",
    titleSent: "Richiesta inviata",
    titleConfirmed: "Prenotazione confermata",
    titleOther: "La Sua prenotazione",
    ledeSent: "Grazie per aver scelto Hathor. La contatteremo con la fattura.",
    ledeOther: "Lo stato attuale del Suo viaggio sul Nilo.",
    quote: "Lusso. Eredità. Appartenenza.",
    submitted: "La Sua richiesta di prenotazione è stata inviata correttamente.",
    confirmedText: "Hathor ha accettato la Sua prenotazione e registrato il pagamento richiesto.",
    currentStatus: "Questo è lo stato attuale della Sua prenotazione.",
    headingSent: "La Sua richiesta di prenotazione è stata inviata",
    headingConfirmed: "La Sua prenotazione è confermata.",
    headingOther: "La Sua prenotazione.",
    sentNote:
      "Grazie per aver scelto Hathor. Il nostro ufficio prenotazioni esaminerà la richiesta e La contatterà con la fattura e le istruzioni di pagamento. Non si tratta di una prenotazione confermata e su questo sito non è stato effettuato alcun pagamento.",
    code: "Codice di prenotazione · lo usi per seguire questa prenotazione",
    emailed: email => `Una copia di questa richiesta è stata inviata via email a ${email}.`,
    emailFailed:
      "La richiesta è stata salvata, ma non è stato possibile recapitare la nostra email di conferma. La preghiamo di contattarci, così potremo raggiungerLa.",
    emailPending: "La richiesta è stata salvata. L’email di conferma è in arrivo.",
    preferredMethod: "Metodo di pagamento preferito",
    next: "Cosa succede adesso?",
    reviewTitle: "L’ufficio prenotazioni esamina la richiesta",
    reviewText: "Verifichiamo la cabina e il totale definitivo del viaggio.",
    invoiceSent: "La fattura è stata inviata",
    invoiceComing: "Riceve la fattura e le istruzioni di pagamento",
    invoiceCheck: email => `Controlli ${email ?? "la Sua email"} per l’importo dovuto e le modalità di pagamento.`,
    invoiceBy: "Inviate via email per il metodo che preferisce.",
    confirmedTitle: "Prenotazione confermata dopo la registrazione del pagamento",
    confirmedTextNext: "Quando Hathor accetta la richiesta e il pagamento richiesto viene registrato.",
    summary: "Riepilogo della prenotazione",
    guestSummary: (adults, children, fallback) =>
      adults !== null && children !== null
        ? `${itCount(adults, "adulto", "adulti")}, ${itCount(children, "bambino", "bambini")}`
        : fallback,
    route: route => route.replace(/\bAswan\b/g, "Assuan"),
    total: "Importo totale della prenotazione",
    taxes: "Tasse e servizio inclusi.",
    surchargeTaxes: amount => `Include il supplemento del ${SURCHARGE_IT} per il pagamento online con carta, pari a ${amount}. Tasse e servizio inclusi.`,
    timeline: "Tempistica dei pagamenti",
    here: "Siamo a Sua disposizione",
    concierge: "Il nostro concierge è sempre lieto di rispondere a ogni Sua domanda.",
    hours: "Orari: tutti i giorni 09:00 – 17:00. Giorno di chiusura: venerdì.",
    reply: "Oppure risponda direttamente alla Sua email di conferma.",
    viewRequest: "Vedi la mia richiesta",
  },

  lookup: {
    title: "Segua la Sua prenotazione",
    lede: "Inserisca il codice di prenotazione ricevuto via email (ad esempio HB-3F2A91C0) e l’indirizzo email usato per prenotare.",
    code: "Codice di prenotazione",
    email: "Email",
    checking: "Verifica…",
    track: "Segui la prenotazione",
    newReservation: "Inizia una nuova prenotazione",
    notFound: "Impossibile trovare la prenotazione",
  },
  error: {
    pageTitle: "Si è verificato un problema | Hathor Dahabiya",
    title: "Qualcosa ha interrotto la Sua prenotazione",
    bodyBefore: "Si è verificato un problema nel caricamento di questa pagina.",
    bodyStrong: "Se aveva già raggiunto il passo di conferma, la Sua prenotazione potrebbe essere già stata inviata",
    bodyAfter: ": controlli la Sua email prima di prenotare di nuovo.",
    tryAgain: "Riprova",
    home: "Torna alla home",
    helpBefore: "Ancora problemi? Scriva a",
    helpAfter: "e completeremo la prenotazione per Lei.",
    reference: "Riferimento:",
  },
  unverified: {
    kicker: "Scelta della cabina",
    title: "Non è stato possibile verificare questa cabina.",
    text: "La prenotazione non è stata avviata. Aggiorni la pagina per verificare di nuovo, oppure scelga un’altra cabina.",
    link: "Scopri tutte le cabine ↗",
  },
  roomGone: {
    title: "Cabina non trovata",
    text: "Questa partenza o questa cabina non è più disponibile. Inizi una nuova ricerca.",
    link: "Torna alla ricerca",
  },
  meta: {
    title: "Prenoti la Sua crociera in dahabiya",
    description:
      "Scelga il viaggio sul Nilo, la data di partenza e la cabina a bordo di Hathor Dahabiya, poi invii la richiesta al nostro ufficio prenotazioni.",
  },
};

export const BOOKING_COPY: Record<PublicLocale, BookingCopy> = { en: EN, it: IT, de: BOOKING_COPY_DE };
