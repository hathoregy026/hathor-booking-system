/**
 * The room collection pages and the room folio in German; see rooms-copy.ts.
 * Sizes, guests, images and links come from the English config unchanged.
 */

import type { RoomsCopy } from "@/lib/i18n/rooms-copy";
import {
  ROOM_COLLECTION_CONFIG,
  type RoomCollectionEditorialConfig,
  type RoomCollectionVariant,
} from "@/lib/room-collection-editorial";
import {
  ROOM_FOLIO_PANELS,
  type RoomFolioDay,
  type RoomFolioPanels,
  type RoomFolioRoute,
} from "@/lib/room-folio-panels";

const EN_CONFIG = ROOM_COLLECTION_CONFIG;

export const CONFIG_DE: Record<RoomCollectionVariant, RoomCollectionEditorialConfig> = {
  cabins: {
    ...EN_CONFIG.cabins,
    collectionLabel: "Die Residenzen · Kabinen",
    tierSubtitle: "Rückzugsorte am Fluss",
    tierKicker: "Kabinen auf dem Unterdeck",
    tierStatement:
      "Zweiundzwanzig Quadratmeter Ruhe für zwei Gäste: Kingsize-Bett oder zwei Einzelbetten und weite Fenster zum Nil.",
    eyebrow: "Unterdeck · Kabinen am Nil",
    support:
      "Rückzugsorte mit Kingsize-Bett oder zwei Einzelbetten für zwei Gäste: das Panoramalicht des Flusses, ruhige Proportionen und der dezente Charakter der Hathor in Creme und Gold.",
    hero: {
      caption: "Vom Nil gerahmt",
      tagline: ["Gemacht", "zum Ruhen"],
      copy: ["Stiller, gepflegter Komfort;", "das Licht des Flusses;", "der Nil hinter dem Glas."],
    },
    manifesto: {
      label: "Kabinen",
      headline: ["Zweiundzwanzig", "Quadratmeter", "Stille"],
      body: "Jede Kabine ist ein durchdachter Rückzugsort: Klimaanlage, handwerkliche Details und ein weites Fenster zum Nil, das jeden Tag auf dem Fluss einrahmt.",
    },
    ledger: [
      { value: "22", label: "Quadratmeter", note: "Pro Kabine" },
      { value: "2", label: "Gäste", note: "Maximal" },
      { value: "2", label: "Varianten", note: "King oder Twin" },
      { value: "Nil", label: "Aussicht", note: "Panorama" },
    ],
    aperture: { ...EN_CONFIG.cabins.aperture, caption: "Flusslicht", sub: "King- und Twin-Kabinen" },
    amenitiesTitle: "In jeder Kabine inklusive",
    amenitiesLead:
      "Ausstattung für erholsame Stunden zwischen den Tempelbesuchen: nichts Überflüssiges, alles durchdacht.",
    crosslinksEyebrow: "Entdecken Sie die Kollektion",
    epilogue: {
      eyebrow: "Buchen Sie Ihre Kabine",
      title: "Finden Sie die Kabine zu Ihrer Reise",
      body: "Merken Sie sich Ihre Wunschkabine in Meine Reise oder fragen Sie die Verfügbarkeit an: Unser Team stimmt sie auf Ihre Fahrt zwischen Luxor und Assuan ab.",
    },
  },
  suites: {
    ...EN_CONFIG.suites,
    collectionLabel: "Die Residenzen · Suiten",
    tierSubtitle: "Die Suite auf dem Unterdeck",
    tierKicker: "Die Suite",
    tierStatement:
      "Sechsundvierzig Quadratmeter mit Panoramablick auf den Nil, charaktervollen Interieurs und einem privaten Jacuzzi.",
    eyebrow: "Unterdeck · Die Suite",
    support:
      "Eine großzügige Residenz auf dem Unterdeck mit Panoramablick auf den Nil, charaktervollen Interieurs und einem privaten Jacuzzi für Abende ohne Eile.",
    hero: {
      caption: "Raum, um den Fluss hereinzulassen",
      tagline: ["Raum", "zum Bleiben"],
      copy: ["Panoramafenster, Stunden ohne Eile;", "ein privater Jacuzzi;", "der Nil, weit geöffnet."],
    },
    manifesto: {
      label: "Suiten",
      headline: ["Sechsundvierzig", "Quadratmeter", "zum Loslassen"],
      body: "Mehr Raum, mehr Privatsphäre, mehr Fluss: Die Accessible Hathor Suite ist für alle gedacht, die durchatmen möchten, ohne den Nil je zu verlassen.",
    },
    ledger: [
      { value: "46", label: "Quadratmeter", note: "Grundriss der Suite" },
      { value: "4", label: "Gäste", note: "Maximal" },
      { value: "1", label: "Residenz", note: "Unterdeck" },
      { value: "Jacuzzi", label: "Wellness", note: "Privat" },
    ],
    aperture: { ...EN_CONFIG.suites.aperture, caption: "Licht der Suite", sub: "Nil im Panorama" },
    amenitiesTitle: "Die Ausstattung der Suite",
    amenitiesLead:
      "Aller Komfort einer Luxussuite mit Nilblick, dazu der private Jacuzzi, der die Hathor auszeichnet.",
    crosslinksEyebrow: "Entdecken Sie die Kollektion",
    epilogue: {
      eyebrow: "Buchen Sie Ihre Suite",
      title: "Ihr Rückzugsort auf dem Unterdeck",
      body: "Fügen Sie die Luxury Suite zu Meine Reise hinzu oder sprechen Sie mit unserer Reservierung: Wir stimmen Ihre Residenz auf die passende Route ab.",
    },
  },
  royal: {
    ...EN_CONFIG.royal,
    collectionLabel: "Die Residenzen · Royal",
    tierSubtitle: "Das Juwel des Hauptdecks",
    tierKicker: "Die Royal-Residenz",
    tierStatement:
      "Sechsundfünfzig Quadratmeter auf dem Hauptdeck: die privateste und geräumigste Adresse der Hathor auf dem Nil.",
    eyebrow: "Hauptdeck · Die exklusivste Residenz",
    support:
      "Die größte private Residenz der Hathor: der beste Blick vom Hauptdeck, exklusive Einrichtung und zwei luxuriöse Badezimmer.",
    hero: {
      caption: "Der Nil ganz für Sie",
      tagline: ["Das Juwel", "der Hathor"],
      copy: [
        "Das Privileg des Hauptdecks, zwei Bäder;",
        "exklusive Einrichtung;",
        "der Fluss von seiner großzügigsten Seite.",
      ],
    },
    manifesto: {
      label: "Royal",
      headline: ["Sechsundfünfzig", "Quadratmeter", "Privileg"],
      body: "Das Juwel der Hathor: außergewöhnliche Ausblicke, vollkommene Entspannung und die Begegnung moderner Eleganz mit echtem ägyptischem Charme.",
    },
    ledger: [
      { value: "56", label: "Quadratmeter", note: "Royal-Grundriss" },
      { value: "4", label: "Gäste", note: "Maximal" },
      { value: "2", label: "Badezimmer", note: "Luxuriös" },
      { value: "Deck", label: "Hauptdeck", note: "Beste Aussicht" },
    ],
    aperture: { ...EN_CONFIG.royal.aperture, caption: "Hauptdeck", sub: "Die exklusivste Residenz" },
    amenitiesTitle: "Die Royal-Ausstattung",
    amenitiesLead:
      "Das Höchstmaß an Luxus an Bord der Hathor: Jacuzzi, zwei Badezimmer und jeder feine Komfort für Ihre private Nilkreuzfahrt.",
    crosslinksEyebrow: "Entdecken Sie die Kollektion",
    epilogue: {
      eyebrow: "Buchen Sie die Royal Suite",
      title: "Der Nil ganz für Sie",
      body: "Merken Sie sich die Royal Suite in den Favoriten oder fügen Sie sie zu Meine Reise hinzu: Unser Concierge bestätigt Ihre privateste Fahrt.",
    },
  },
};

export const SHOWCASE_DE: Record<string, { eyebrow: string; description: string }> = {
  "luxury-king-room": {
    eyebrow: "Ein stiller Rückzugsort mit Blick auf den Nil",
    description:
      "Ein großzügiges Kingsize-Bett, warme ägyptische Materialien und ein weiter Blick auf den Fluss machen diese Kabine zu einem privaten, stillen Ort für zwei.",
  },
  "luxury-twin-room": {
    eyebrow: "Feiner Komfort, zum Teilen",
    description:
      "Zwei Einzelbetten und dieselbe Aufmerksamkeit wie in jeder Kabine: eine elegante Basis für alle, die gemeinsam reisen.",
  },
  "luxury-suite": {
    eyebrow: "Mehr Raum für die Reise",
    description:
      "Ein großzügiger Rückzugsort auf dem Unterdeck mit Panoramablick auf den Nil, charaktervollen Interieurs und einem privaten Jacuzzi.",
  },
  "royal-suite": {
    eyebrow: "Das Juwel der Hathor",
    description:
      "Die größte Residenz der Hathor vereint den besten Blick vom Hauptdeck, exklusive Einrichtung und zwei Badezimmer.",
  },
};

const INCLUDE_DE = [
  "Hin- und Rücktransfers ab den Flughäfen Assuan oder Luxor in modernen Touristenfahrzeugen (Limousine oder Van)",
  "Mehrwertsteuer und Servicegebühren",
  "Willkommensgetränk bei der Ankunft",
  "Ein kostenloser Begrüßungs-Champagner pro Kabine und Suite, einmal pro Aufenthalt serviert",
  "Unterkunft mit Soft All-Inclusive (alle Mahlzeiten und alkoholfreien Getränke tagsüber)",
  "Eintrittskarten für die Besichtigungen laut Route (öffentliche Besichtigungen)",
  "Ägyptologischer Reiseleiter",
  "Wäscheservice",
  "Täglich aufgefüllte Minibar",
  "WLAN",
  "Zimmerservice",
  "Kaffeemaschine und Teekocher, täglich aufgefüllt",
  "Safe in jeder Kabine und Suite",
] as const;

const EXCLUDE_DE = [
  "Inlands- oder internationale Flüge",
  "Reiseversicherung",
  "Alkoholische Getränke, außer dem einmal pro Aufenthalt servierten kostenlosen Begrüßungs-Champagner",
  "Optionale Ausflüge oder Aktivitäten, die nicht zur Route gehören",
  "Trinkgelder und persönliche Ausgaben",
] as const;

const ASWAN_TO_LUXOR_DAYS_DE: readonly RoomFolioDay[] = [
  {
    title: "Tag 1 · Assuan",
    body: "Bei der Ankunft empfangen wir Sie an Bord der Hathor mit einem Willkommensgetränk und einem Mittagessen ohne Eile. Besuch des Philae-Tempels und des Hochdamms, dann Rückkehr zu Abendessen und Übernachtung in Assuan.",
  },
  {
    title: "Tag 2 · Kom Ombo und Esna",
    body: "Auf Wunsch lässt sich ein Ausflug am Morgen nach Abu Simbel organisieren. Das Frühstück wird an Bord serviert oder für Frühaufsteher als Frühstücksbox. Fahrt nach Kom Ombo zum Tempel des Sobek und Horus, dann weiter nach Esna zu Abendessen und Übernachtung.",
  },
  {
    title: "Tag 3 · Esna und Ostufer von Luxor",
    body: "Nach dem Frühstück Besuch des Esna-Tempels. Beim Mittagessen Fahrt nach Luxor, dann Besuch des Karnak- und des Luxor-Tempels. Abendessen und Übernachtung an Bord der Hathor in Luxor.",
  },
  {
    title: "Tag 4 · Westufer von Luxor",
    body: "Nach Frühstück und Check-out geführter Besuch des Westufers (Tal der Könige, Hatschepsut-Tempel und Memnonkolosse) vor der Abreise aus Luxor.",
  },
];

const LUXOR_TO_ASWAN_DAYS_DE: readonly RoomFolioDay[] = [
  {
    title: "Tag 1 · Ostufer von Luxor",
    body: "Ein Willkommensgetränk und der Check-in eröffnen die Reise. Nach dem Mittagessen Besuch des Karnak- und des Luxor-Tempels. Abendessen und Übernachtung in Luxor.",
  },
  {
    title: "Tag 2 · Westufer und Esna",
    body: "Nach dem Frühstück Besuch des Tals der Könige, des Hatschepsut-Tempels und der Memnonkolosse. Rückkehr zum Mittagessen, während die Hathor nach Esna fährt. Abendessen und Übernachtung in Esna.",
  },
  {
    title: "Tag 3 · Edfu und El Ramady",
    body: "Frühstück, dann die Felsgräber von El Kab und der Horus-Tempel in Edfu. Mittagessen an Bord und Fahrt zur Insel El Ramady zu Abendessen und Übernachtung.",
  },
  {
    title: "Tag 4 · Gebel el-Silsila, Kom Ombo und Assuan",
    body: "Erkundung der Sandsteinbrüche von Gebel el-Silsila, dann Besuch des Tempels von Kom Ombo, der Sobek und Horus dem Älteren geweiht ist. Mittagessen auf der Fahrt nach Assuan. Abendessen und Übernachtung in Assuan.",
  },
  {
    title: "Tag 5 · Assuan",
    body: "Auf Wunsch lässt sich ein Ausflug am Morgen nach Abu Simbel organisieren. Nach dem letzten Frühstück und dem Check-out Besuch des Philae-Tempels und des Hochdamms vor der Ausschiffung in Assuan.",
  },
];

const ROUND_TRIP_DAYS_DE: readonly RoomFolioDay[] = [
  {
    title: "Tag 1 · Ostufer von Luxor",
    body: "Ein Willkommensgetränk und der Check-in eröffnen die Rundreise. Nach dem Mittagessen Besuch des Karnak- und des Luxor-Tempels. Abendessen und Übernachtung in Luxor.",
  },
  {
    title: "Tag 2 · Fahrt nach Esna",
    body: "Frühstück auf dem Nil, während die Hathor nach Süden Richtung Esna fährt. Einem Mittagessen ohne Eile und dem Nachmittagstee an Deck folgen ein Abendessen bei Kerzenlicht und die Übernachtung in Esna.",
  },
  {
    title: "Tag 3 · Edfu und die Insel Ramadi",
    body: "Durchfahrt der Schleuse von Esna und weiter nach Edfu zum Horus-Tempel. Mittagessen an Bord, dann Fahrt zur Insel Ramadi zu einem Abendessen vom Holzkohlegrill und zur Übernachtung am stillen Ufer.",
  },
  {
    title: "Tag 4 · Gebel el-Silsila, Kom Ombo und Assuan",
    body: "Besuch der antiken Steinbrüche von Gebel el-Silsila, dann des Tempels von Kom Ombo. Mittagessen auf der Fahrt nach Assuan. Abendessen und Übernachtung in Assuan.",
  },
  {
    title: "Tag 5 · Assuan",
    body: "Auf Wunsch lässt sich ein Ausflug am Morgen nach Abu Simbel organisieren. Danach Besuch des Philae-Tempels und des Hochdamms. Mittag- und Abendessen an Bord, Übernachtung in Assuan.",
  },
  {
    title: "Tag 6 · Fahrt nach Norden",
    body: "Nach dem Frühstück Fahrt von Assuan nach Esna. Mittagessen und ein ruhiger Nachmittag an Deck. Abendessen und Übernachtung in Esna.",
  },
  {
    title: "Tag 7 · Esna und Westufer von Luxor",
    body: "Frühstück, dann der Esna-Tempel. Beim Mittagessen Fahrt nach Luxor. Am Nachmittag Besuch des Tals der Könige, des Hatschepsut-Tempels und der Memnonkolosse. Abendessen und Übernachtung in Luxor.",
  },
  {
    title: "Tag 8 · Luxor",
    body: "Ein letztes Frühstück an Bord und der Check-out. Ausschiffung in Luxor.",
  },
];

function routesDe(occupancy: string): readonly RoomFolioRoute[] {
  const [aswanLuxor, luxorAswan, roundTrip] = ROOM_FOLIO_PANELS.cabins.itineraries;
  return [
    {
      ...aswanLuxor,
      title: "Assuan → Luxor",
      meta: "3 Nächte / 4 Tage",
      departs: "Jeden Mittwoch",
      occupancy,
      hrefLabel: "Reise entdecken",
      days: ASWAN_TO_LUXOR_DAYS_DE,
    },
    {
      ...luxorAswan,
      title: "Luxor → Assuan",
      meta: "4 Nächte / 5 Tage",
      departs: "Jeden Samstag",
      occupancy,
      hrefLabel: "Reise entdecken",
      days: LUXOR_TO_ASWAN_DAYS_DE,
    },
    {
      ...roundTrip,
      title: "Luxor → Assuan → Luxor",
      meta: "7 Nächte / 8 Tage",
      departs: "Jeden Samstag",
      occupancy,
      hrefLabel: "Abfahrtstermine ansehen",
      days: ROUND_TRIP_DAYS_DE,
    },
  ];
}

function sailingsDe(occupancy: string) {
  return [
    { title: "Assuan → Luxor", meta: "3 Nächte / 4 Tage · jeden Mittwoch", occupancy },
    { title: "Luxor → Assuan", meta: "4 Nächte / 5 Tage · jeden Samstag", occupancy },
    { title: "Luxor → Assuan → Luxor", meta: "7 Nächte / 8 Tage · jeden Samstag", occupancy },
  ] as const;
}

const AVAILABILITY_NOTE_DE = (what: string) =>
  `Die Hathor fährt nach einem veröffentlichten Wochenplan. Fragen Sie einen Termin an, um zu prüfen, ob ${what} für die gewählte Route noch verfügbar ist.`;

export const FOLIO_DE: Record<RoomCollectionVariant, RoomFolioPanels> = {
  cabins: {
    overview: {
      lead: "Luxuskabinen für die Nilkreuzfahrt · 22 Quadratmeter · Panoramablick auf den Nil",
      paragraphs: [
        "Jede Kabine ist ein stiller Rückzugsort für zwei, mit weiten Fenstern zum Nil, Kingsize-Bett oder zwei Einzelbetten und zeitgemäßem Komfort für die Fahrt zwischen Luxor und Assuan.",
        "Die überschaubare Größe einer Dahabiya schenkt ruhigere Tage auf dem Wasser und einen persönlicheren Service während der ganzen Reise. Nach den Landausflügen erwarten die Gäste edle Interieurs, eine aufmerksame Crew und eine vom Fluss inspirierte Küche.",
      ],
      facts: [
        "King- oder Twin-Ausstattung",
        "Maximal 2 Gäste pro Kabine",
        "Verbindungskabinen verfügbar",
        "12 Luxuskabinen und Suiten an Bord der Hathor",
      ],
    },
    itineraries: routesDe("Preis pro Kabine, maximal 2 Personen"),
    include: INCLUDE_DE,
    exclude: EXCLUDE_DE,
    availability: {
      note: AVAILABILITY_NOTE_DE("die Kabine"),
      sailings: sailingsDe("Maximal 2 Personen pro Kabine"),
    },
  },
  suites: {
    overview: {
      lead: "Accessible Hathor Suite · 46 Quadratmeter · Panoramablick auf den Nil",
      paragraphs: [
        "Die barrierefreundlichen Kabinen und Suiten der Hathor haben die Eleganz eines bernsteinfarbenen Sonnenuntergangs, mit durchdachter Zugänglichkeit und müheloser Bequemlichkeit: ein privater Rückzugsort auf dem Nil für alle, die sich gern leicht bewegen.",
        "Weitläufig und gestaltet wie ein Kunstwerk, bietet die Suite offene Räume, natürliche Materialien, breite Durchgänge und Panoramafenster. Jedes Detail ist vom ägyptischen Erbe inspiriert und lädt dazu ein, zu entspannen oder einfach den langsamen Rhythmus des Flusses zu genießen.",
        "Die Luxury Suite bietet mehr Raum für Gäste, die mehr Privatsphäre, großzügige Proportionen und einen freien Blick auf den Fluss suchen: eine Residenz auf dem Unterdeck mit privatem Jacuzzi.",
      ],
      facts: [
        "Maximal 4 Gäste pro Suite",
        "Privater Jacuzzi",
        "Verbindungskabinen verfügbar",
        "2 Luxury Suites an Bord der Hathor",
      ],
    },
    itineraries: routesDe("Preis pro Suite, maximal 4 Personen"),
    include: INCLUDE_DE,
    exclude: EXCLUDE_DE,
    availability: {
      note: AVAILABILITY_NOTE_DE("die Suite"),
      sailings: sailingsDe("Maximal 4 Personen pro Suite"),
    },
  },
  royal: {
    overview: {
      lead: "Luxury Royal Suites · 56 Quadratmeter · Panoramablick auf den Nil",
      paragraphs: [
        "Die Royal Suites sind die größten Unterkünfte der Hathor, mit zusätzlichem privatem Raum und noch mehr Abgeschiedenheit auf dem Hauptdeck.",
        "Panoramafenster und ein privater Balkon öffnen sich zum Fluss, während Sie zwischen Luxor und Assuan unterwegs sind. Traditionelles Handwerk und zeitgemäßer Komfort treffen sich in einem Rahmen für eine stillere, persönlichere Reise.",
      ],
      facts: [
        "Maximal 4 Gäste pro Royal Suite",
        "Privater Balkon und zwei Badezimmer",
        "2 Royal Suites an Bord der Hathor",
      ],
    },
    itineraries: routesDe("Preis pro Royal Suite, maximal 4 Personen"),
    include: INCLUDE_DE,
    exclude: EXCLUDE_DE,
    availability: {
      note: AVAILABILITY_NOTE_DE("die Royal Suite"),
      sailings: sailingsDe("Maximal 4 Personen pro Royal Suite"),
    },
  },
};

export const ROOMS_COPY_DE: RoomsCopy = {
  runLabel: (collection) => `${collection} an Bord der Hathor`,
  previewLabels: ["Hauptansicht", "Detail", "Licht", "Bad", "Aussicht"],
  previewFallback: "Interieur",
  previewAlt: (room, label) => `${room}, ${label} an Bord der Hathor`,
  previewGroup: (room) => `${room}: fünf Ansichten`,
  viewRoom: "Residenz ansehen",
  viewRoomLabel: (room) => `Residenz ${room} ansehen`,
  configurations: "Varianten",
  bookNow: "Jetzt buchen",
  bookNowCaps: "Jetzt buchen",
  /* The hero's four-button row has no room for "Reisen ansehen". */
  viewVoyages: "Reisen",
  space: "Fläche",
  guests: "Gäste",
  upTo: (n) => `Bis zu ${n}`,
  outlook: "Aussicht",
  panoramicNile: "Nilpanorama",
  previewKicker: "Ansichten",
  previewLead: (room) => `Fünf Ansichten der ${room}: das Licht, die Proportionen und der Fluss hinter dem Glas.`,
  elsewhere: "Mehr an Bord",
  hold: "Ihre Residenz erwartet Sie zwischen Luxor und Assuan.",
  continueToReserve: "Weiter zur Buchung",
  nile: "Nil",
  detail: {
    home: "Startseite",
    tabs: ["Überblick", "Verfügbarkeit", "Ausstattung", "Ihre Reise", "Gut zu wissen"],
    breadcrumb: "Brotkrumennavigation",
    sections: "Bereiche dieser Residenz",
    nightsDays: (nights, days) => `${nights} Nächte / ${days} Tage`,
    photographs: (room) => `Fotos: ${room}`,
    openPhoto: (index, count) => `Foto ${index} von ${count} im Vollbild öffnen`,
    photoAlt: (room, index) => `${room}, Ansicht ${index}`,
    viewerAlt: (room, index, count) => `${room}, Foto ${index} von ${count}`,
    children: "Kinder",
    childrenWelcome: "Willkommen",
    childrenNo: "Nicht in dieser Residenz",
    fareLabel: "Preis und Verfügbarkeit",
    yourVoyage: "Ihre Reise",
    perCabinNights: (nights) => `pro Kabine · ${nights} Nächte`,
    nights: (nights) => `${nights} Nächte`,
    vatIncluded: "MwSt. und Service inklusive",
    route: "Route",
    chooseVoyage: "Reise wählen",
    voyageOption: (ports, nights) => `${ports} · ${nights} Nächte`,
    departs: "Abfahrt",
    every: (day) => `Jeden ${day}`,
    oneCabin: "1 Kabine",
    upToGuests: (n) => `Bis zu ${n} Gäste`,
    checkAvailability: "Verfügbarkeit prüfen",
    conditions: "Buchungsbedingungen",
    insideKicker: "In Ihrer Residenz",
    insideTitle: ["Ein privater Ort,", "der den Nil hereinlässt"],
    childrenNote: (allowed) =>
      allowed
        ? "Kinder sind in diesem Residenztyp willkommen."
        : "Dieser Residenztyp ist nicht für Kinder ausgelegt.",
    comfortsKicker: "Ausstattung und Komfort",
    comfortsTitle: "Alles bedacht",
    reservationKicker: "01 — Buchung",
    fareTitle: "Ihre Kabine und der Preis",
    portsEvery: (ports, day) => `${ports} · jeden ${day}`,
    requestDate: "Termin anfragen",
    ledgerHead: (nights) => [
      "Unterkunft",
      "Ihre Reise umfasst",
      nights ? `Gesamt ${nights} Nächte` : "Gesamt",
      "Kabinen",
    ],
    sizeGuests: (sqm, n) => `${sqm} m² · Bis zu ${n} Gäste`,
    allInclusions: "Alle Inklusivleistungen ansehen",
    perCabin: "pro Kabine",
    cabin: "Kabine",
    totalLine: (nights, capacity) =>
      `1 Kabine · ${nights ? `${nights} Nächte` : "flexible Termine"} · bis zu ${capacity} Gäste`,
    total: "Gesamt",
    onRequest: "Auf Anfrage",
    continueToReservation: "Weiter zur Buchung",
    includedTitle: ["Inklusive,", "mit unserer Sorgfalt"],
    goodToKnow: "Gut zu wissen",
    closePhotos: "Fotos schließen",
    previousPhoto: "Vorheriges Foto",
    nextPhoto: "Nächstes Foto",
  },
  folio: {
    label: "Hinweise zum Aufenthalt",
    title: "Die Reise im Detail",
    overview: "Überblick",
    itinerary: "Route",
    includeExclude: "Inklusive und exklusive",
    availability: "Verfügbarkeit der Kreuzfahrt",
    included: "Inklusive",
    notIncluded: "Nicht inklusive",
    checkAvailability: "Verfügbarkeit prüfen",
    scheduledSailings: "Abfahrtstermine ansehen",
  },
};
