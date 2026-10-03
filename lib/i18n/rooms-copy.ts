/**
 * The room collection pages (/luxury-cabins-Nile-Cruise, /rooms, /royal-suites)
 * and the room folio, in every public language. English is the live copy:
 * it is read straight from ROOM_COLLECTION_CONFIG, ROOM_SHOWCASES and
 * ROOM_FOLIO_PANELS, so nothing English is restated here. Cabin and suite
 * names (Luxury Rooms, Luxury Suite, Royal Suite…) are product names and stay
 * English; sizes, guests, images and links are unchanged.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
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
import type { RoomShowcase } from "@/lib/room-showcase";

/* ---------- Collection pages: the variant config ---------- */

const EN_CONFIG = ROOM_COLLECTION_CONFIG;

const CONFIG_IT: Record<RoomCollectionVariant, RoomCollectionEditorialConfig> = {
  cabins: {
    ...EN_CONFIG.cabins,
    collectionLabel: "Le residenze · Cabine",
    tierSubtitle: "Rifugi sul fiume",
    tierKicker: "Cabine del ponte inferiore",
    tierStatement:
      "Ventidue metri quadrati di calma: letto king o due letti singoli, pensati per due ospiti e ampie vetrate sul Nilo.",
    eyebrow: "Ponte inferiore · Cabine sul Nilo",
    support:
      "Rifugi con letto king o due letti singoli per due ospiti: la luce panoramica del fiume, proporzioni calme e il carattere discreto, crema e oro, di Hathor.",
    hero: {
      caption: "Incorniciate dal Nilo",
      tagline: ["Fatte", "per riposare"],
      copy: ["Un comfort quieto e curato;", "la luce del fiume;", "il Nilo oltre il vetro."],
    },
    manifesto: {
      label: "Cabine",
      headline: ["Ventidue", "metri quadrati", "di quiete"],
      body: "Ogni cabina è un rifugio pratico: aria condizionata, dettagli artigianali e un’ampia finestra sul Nilo che incornicia ogni giornata di navigazione.",
    },
    ledger: [
      { value: "22", label: "Metri quadrati", note: "Per cabina" },
      { value: "2", label: "Ospiti", note: "Al massimo" },
      { value: "2", label: "Configurazioni", note: "King o twin" },
      { value: "Nilo", label: "Vista", note: "Panoramica" },
    ],
    aperture: { ...EN_CONFIG.cabins.aperture, caption: "Luce del fiume", sub: "Cabine king e twin" },
    amenitiesTitle: "Incluso in ogni cabina",
    amenitiesLead:
      "Dotazioni pensate per riposare tra una visita ai templi e l’altra: niente di superfluo, tutto curato.",
    crosslinksEyebrow: "Esplori la collezione",
    epilogue: {
      eyebrow: "Prenoti la Sua cabina",
      title: "Abbini una cabina al Suo viaggio",
      body: "Salvi la cabina che preferisce in Il mio viaggio o richieda la disponibilità: il nostro team la abbinerà alla Sua navigazione tra Luxor e Assuan.",
    },
  },
  suites: {
    ...EN_CONFIG.suites,
    collectionLabel: "Le residenze · Suite",
    tierSubtitle: "La suite del ponte inferiore",
    tierKicker: "La suite",
    tierStatement:
      "Quarantasei metri quadrati con vista panoramica sul Nilo, interni ricchi di carattere e una jacuzzi privata.",
    eyebrow: "Ponte inferiore · La suite",
    support:
      "Un’ampia residenza sul ponte inferiore con vista panoramica sul Nilo, interni ricchi di carattere e una jacuzzi privata per serate senza fretta.",
    hero: {
      caption: "Spazio per lasciar entrare il fiume",
      tagline: ["Spazio", "per restare"],
      copy: ["Vetrate panoramiche, ore senza fretta;", "una jacuzzi privata;", "il Nilo, spalancato."],
    },
    manifesto: {
      label: "Suite",
      headline: ["Quarantasei", "metri quadrati", "per lasciarsi andare"],
      body: "Più spazio, più privacy, più fiume: la Accessible Hathor Suite è pensata per chi desidera respirare senza mai lasciare il Nilo.",
    },
    ledger: [
      { value: "46", label: "Metri quadrati", note: "Pianta della suite" },
      { value: "4", label: "Ospiti", note: "Al massimo" },
      { value: "1", label: "Residenza", note: "Ponte inferiore" },
      { value: "Jacuzzi", label: "Benessere", note: "Privata" },
    ],
    aperture: { ...EN_CONFIG.suites.aperture, caption: "Luce della suite", sub: "Nilo panoramico" },
    amenitiesTitle: "Le dotazioni della suite",
    amenitiesLead:
      "Tutti i comfort di una suite di lusso con vista sul Nilo, e la jacuzzi privata che distingue Hathor.",
    crosslinksEyebrow: "Esplori la collezione",
    epilogue: {
      eyebrow: "Prenoti la Sua suite",
      title: "Il Suo rifugio sul ponte inferiore",
      body: "Aggiunga la Luxury Suite a Il mio viaggio o parli con il nostro ufficio prenotazioni: abbineremo la Sua residenza all’itinerario giusto.",
    },
  },
  royal: {
    ...EN_CONFIG.royal,
    collectionLabel: "Le residenze · Royal",
    tierSubtitle: "Il gioiello del ponte principale",
    tierKicker: "La residenza Royal",
    tierStatement:
      "Cinquantasei metri quadrati sul ponte principale: l’indirizzo più privato e spazioso di Hathor sul Nilo.",
    eyebrow: "Ponte principale · La residenza più esclusiva",
    support:
      "La residenza privata più ampia di Hathor: la migliore vista dal ponte principale, arredi esclusivi e due bagni di lusso.",
    hero: {
      caption: "Il Nilo, tutto per Lei",
      tagline: ["Il gioiello", "di Hathor"],
      copy: [
        "Il privilegio del ponte principale, due bagni;",
        "arredi esclusivi;",
        "il fiume nella sua veste più generosa.",
      ],
    },
    manifesto: {
      label: "Royal",
      headline: ["Cinquantasei", "metri quadrati", "di privilegio"],
      body: "Il gioiello di Hathor: viste eccezionali, relax assoluto e l’incontro tra eleganza moderna e autentico fascino egiziano.",
    },
    ledger: [
      { value: "56", label: "Metri quadrati", note: "Pianta Royal" },
      { value: "4", label: "Ospiti", note: "Al massimo" },
      { value: "2", label: "Bagni", note: "Di lusso" },
      { value: "Ponte", label: "Principale", note: "Le viste migliori" },
    ],
    aperture: { ...EN_CONFIG.royal.aperture, caption: "Ponte principale", sub: "La residenza più esclusiva" },
    amenitiesTitle: "Le dotazioni Royal",
    amenitiesLead:
      "Il massimo del lusso a bordo di Hathor: jacuzzi, doppio bagno e ogni comfort raffinato per la Sua crociera privata sul Nilo.",
    crosslinksEyebrow: "Esplori la collezione",
    epilogue: {
      eyebrow: "Prenoti la Royal Suite",
      title: "Il Nilo, tutto per Lei",
      body: "Salvi la Royal Suite nei preferiti o la aggiunga a Il mio viaggio: il nostro concierge confermerà la Sua navigazione più riservata.",
    },
  },
};

export function roomCollectionConfig(
  variant: RoomCollectionVariant,
  locale: PublicLocale,
): RoomCollectionEditorialConfig {
  return locale === "it" ? CONFIG_IT[variant] : EN_CONFIG[variant];
}

/* ---------- Rooms: eyebrow and description (names stay English) ---------- */

const SHOWCASE_IT: Record<string, { eyebrow: string; description: string }> = {
  "luxury-king-room": {
    eyebrow: "Un rifugio tranquillo affacciato sul Nilo",
    description:
      "Un ampio letto king, calde finiture egiziane e una vasta vista sul fiume per una cabina privata e tranquilla per due.",
  },
  "luxury-twin-room": {
    eyebrow: "Comfort raffinato, da condividere",
    description:
      "Due letti singoli e le stesse attenzioni di ogni cabina: una base elegante per chi viaggia in compagnia.",
  },
  "luxury-suite": {
    eyebrow: "Più spazio per il viaggio",
    description:
      "Un ampio rifugio sul ponte inferiore con vista panoramica sul Nilo, interni ricchi di carattere e una jacuzzi privata.",
  },
  "royal-suite": {
    eyebrow: "Il gioiello di Hathor",
    description:
      "La residenza più ampia di Hathor unisce la migliore vista dal ponte principale, arredi esclusivi e due bagni.",
  },
};

export function roomShowcaseIn<T extends RoomShowcase>(room: T, locale: PublicLocale): T {
  const words = locale === "it" ? SHOWCASE_IT[room.slug] : undefined;
  return words ? { ...room, ...words } : room;
}

/* ---------- Room folio: overview, itineraries, inclusions, sailings ---------- */

const INCLUDE_IT = [
  "Trasferimenti di andata e ritorno dagli aeroporti di Assuan o Luxor con veicoli turistici moderni (limousine o van)",
  "IVA e costi di servizio",
  "Drink di benvenuto all’arrivo",
  "Uno Champagne di benvenuto in omaggio per ogni cabina e suite, servito una volta per soggiorno",
  "Sistemazione in formula Soft All-Inclusive (tutti i pasti e le bevande analcoliche durante la giornata)",
  "Biglietti d’ingresso per le visite previste dall’itinerario (visite di gruppo)",
  "Guida egittologa professionista",
  "Servizio lavanderia",
  "Rifornimento giornaliero del minibar",
  "Wi-Fi",
  "Servizio in camera",
  "Macchina del caffè e bollitore per il tè con rifornimento giornaliero",
  "Cassaforte in ogni cabina e suite",
] as const;

const EXCLUDE_IT = [
  "Voli nazionali o internazionali",
  "Assicurazione di viaggio",
  "Bevande alcoliche, eccetto lo Champagne di benvenuto in omaggio servito una volta per soggiorno",
  "Escursioni o attività facoltative non incluse nell’itinerario",
  "Mance e spese personali",
] as const;

const ASWAN_TO_LUXOR_DAYS_IT: readonly RoomFolioDay[] = [
  {
    title: "Giorno 1 · Assuan",
    body: "All’arrivo La accogliamo con un drink di benvenuto e sale a bordo di Hathor per un pranzo senza fretta. Visita al Tempio di File e alla Grande Diga, poi rientro per la cena e il pernottamento ad Assuan.",
  },
  {
    title: "Giorno 2 · Kom Ombo ed Esna",
    body: "Su richiesta è possibile organizzare una visita mattutina ad Abu Simbel. La colazione è servita a bordo, oppure in un cestino per chi parte presto. Navigazione verso Kom Ombo per visitare il tempio dedicato a Sobek e Horus, poi verso Esna per la cena e il pernottamento.",
  },
  {
    title: "Giorno 3 · Esna e la riva orientale di Luxor",
    body: "Dopo la colazione, visita al Tempio di Esna. Navigazione verso Luxor durante il pranzo, poi visita al Tempio di Karnak e al Tempio di Luxor. Cena e pernottamento a bordo di Hathor a Luxor.",
  },
  {
    title: "Giorno 4 · La riva occidentale di Luxor",
    body: "Dopo la colazione e il check-out, visita guidata alla riva occidentale (la Valle dei Re, il Tempio di Hatshepsut e i Colossi di Memnone) prima della partenza da Luxor.",
  },
];

const LUXOR_TO_ASWAN_DAYS_IT: readonly RoomFolioDay[] = [
  {
    title: "Giorno 1 · La riva orientale di Luxor",
    body: "Un drink di benvenuto e il check-in aprono il viaggio. Dopo pranzo, visita al Tempio di Karnak e al Tempio di Luxor. Cena e pernottamento a Luxor.",
  },
  {
    title: "Giorno 2 · Riva occidentale ed Esna",
    body: "Dopo la colazione, visita alla Valle dei Re, al Tempio di Hatshepsut e ai Colossi di Memnone. Rientro per il pranzo mentre Hathor naviga verso Esna. Cena e pernottamento a Esna.",
  },
  {
    title: "Giorno 3 · Edfu ed El Ramady",
    body: "Colazione, poi le tombe rupestri di El Kab e il Tempio di Horus a Edfu. Pranzo a bordo e navigazione verso l’isola di El Ramady per la cena e il pernottamento.",
  },
  {
    title: "Giorno 4 · Gebel el-Silsila, Kom Ombo e Assuan",
    body: "Esplorazione delle cave di arenaria di Gebel el-Silsila, poi visita al Tempio di Kom Ombo, dedicato a Sobek e a Horus il Vecchio. Pranzo in navigazione verso Assuan. Cena e pernottamento ad Assuan.",
  },
  {
    title: "Giorno 5 · Assuan",
    body: "Su richiesta è possibile organizzare una visita mattutina ad Abu Simbel. Dopo l’ultima colazione e il check-out, visita al Tempio di File e alla Grande Diga prima dello sbarco ad Assuan.",
  },
];

const ROUND_TRIP_DAYS_IT: readonly RoomFolioDay[] = [
  {
    title: "Giorno 1 · La riva orientale di Luxor",
    body: "Un drink di benvenuto e il check-in aprono il viaggio di andata e ritorno. Dopo pranzo, visita al Tempio di Karnak e al Tempio di Luxor. Cena e pernottamento a Luxor.",
  },
  {
    title: "Giorno 2 · In navigazione verso Esna",
    body: "Colazione sul Nilo mentre Hathor naviga verso sud, in direzione di Esna. Un pranzo senza fretta e il tè del pomeriggio sul ponte precedono una cena a lume di candela e il pernottamento a Esna.",
  },
  {
    title: "Giorno 3 · Edfu e l’isola di Ramadi",
    body: "Passaggio della chiusa di Esna e proseguimento verso Edfu per il Tempio di Horus. Pranzo a bordo, poi navigazione verso l’isola di Ramadi per una cena alla brace e il pernottamento sulla riva tranquilla.",
  },
  {
    title: "Giorno 4 · Gebel el-Silsila, Kom Ombo e Assuan",
    body: "Visita alle antiche cave di Gebel el-Silsila, poi al Tempio di Kom Ombo. Pranzo in navigazione verso Assuan. Cena e pernottamento ad Assuan.",
  },
  {
    title: "Giorno 5 · Assuan",
    body: "Su richiesta è possibile organizzare una visita mattutina ad Abu Simbel. Poi visita al Tempio di File e alla Grande Diga. Pranzo e cena a bordo; pernottamento ad Assuan.",
  },
  {
    title: "Giorno 6 · In navigazione verso nord",
    body: "Dopo la colazione, navigazione da Assuan verso Esna. Pranzo e un pomeriggio tranquillo sul ponte. Cena e pernottamento a Esna.",
  },
  {
    title: "Giorno 7 · Esna e la riva occidentale di Luxor",
    body: "Colazione, poi il Tempio di Esna. Navigazione verso Luxor durante il pranzo. Nel pomeriggio, visita alla Valle dei Re, al Tempio di Hatshepsut e ai Colossi di Memnone. Cena e pernottamento a Luxor.",
  },
  {
    title: "Giorno 8 · Luxor",
    body: "Un’ultima colazione a bordo e il check-out. Sbarco a Luxor.",
  },
];

function routesIt(occupancy: string): readonly RoomFolioRoute[] {
  const [aswanLuxor, luxorAswan, roundTrip] = ROOM_FOLIO_PANELS.cabins.itineraries;
  return [
    {
      ...aswanLuxor,
      title: "Assuan → Luxor",
      meta: "3 notti / 4 giorni",
      departs: "Ogni mercoledì",
      occupancy,
      hrefLabel: "Scopra il viaggio",
      days: ASWAN_TO_LUXOR_DAYS_IT,
    },
    {
      ...luxorAswan,
      title: "Luxor → Assuan",
      meta: "4 notti / 5 giorni",
      departs: "Ogni sabato",
      occupancy,
      hrefLabel: "Scopra il viaggio",
      days: LUXOR_TO_ASWAN_DAYS_IT,
    },
    {
      ...roundTrip,
      title: "Luxor → Assuan → Luxor",
      meta: "7 notti / 8 giorni",
      departs: "Ogni sabato",
      occupancy,
      hrefLabel: "Vedi le partenze programmate",
      days: ROUND_TRIP_DAYS_IT,
    },
  ];
}

function sailingsIt(occupancy: string) {
  return [
    { title: "Assuan → Luxor", meta: "3 notti / 4 giorni · ogni mercoledì", occupancy },
    { title: "Luxor → Assuan", meta: "4 notti / 5 giorni · ogni sabato", occupancy },
    { title: "Luxor → Assuan → Luxor", meta: "7 notti / 8 giorni · ogni sabato", occupancy },
  ] as const;
}

const AVAILABILITY_NOTE_IT = (what: string) =>
  `Hathor naviga secondo un calendario settimanale pubblicato. Richieda una data per confermare ${what} ancora disponibile per l’itinerario scelto.`;

const FOLIO_IT: Record<RoomCollectionVariant, RoomFolioPanels> = {
  cabins: {
    overview: {
      lead: "Cabine di lusso per la crociera sul Nilo · 22 metri quadrati · vista panoramica sul Nilo",
      paragraphs: [
        "Ogni cabina è un rifugio tranquillo per due, con ampie vetrate sul Nilo, letto king o due letti singoli e un comfort contemporaneo per navigare tra Luxor e Assuan.",
        "Le dimensioni contenute di una dahabiya regalano giornate più quiete sull’acqua e un servizio più personale per tutto il viaggio. Dopo le visite a terra, gli ospiti ritrovano interni raffinati, un equipaggio attento e una cucina ispirata al fiume.",
      ],
      facts: [
        "Configurazione king o twin",
        "Massimo 2 ospiti per cabina",
        "Cabine comunicanti disponibili",
        "12 cabine e suite di lusso a bordo di Hathor",
      ],
    },
    itineraries: routesIt("Prezzo per cabina, massimo 2 persone"),
    include: INCLUDE_IT,
    exclude: EXCLUDE_IT,
    availability: {
      note: AVAILABILITY_NOTE_IT("la cabina"),
      sailings: sailingsIt("Massimo 2 persone per cabina"),
    },
  },
  suites: {
    overview: {
      lead: "Accessible Hathor Suite · 46 metri quadrati · vista panoramica sul Nilo",
      paragraphs: [
        "Le cabine e le suite accessibili di Hathor hanno l’eleganza di un tramonto color ambra, con un’accessibilità studiata e un comfort senza sforzo: un rifugio privato sul Nilo per chi apprezza muoversi con facilità.",
        "Ampia e curata come un’opera d’arte, la suite offre spazi aperti, materiali naturali, passaggi larghi e finestre panoramiche. Ispirato al patrimonio egiziano, ogni dettaglio invita a rilassarsi o semplicemente a godersi il ritmo lento del fiume.",
        "La Luxury Suite offre più spazio agli ospiti che cercano maggiore privacy, proporzioni generose e una vista ininterrotta sul fiume: una residenza sul ponte inferiore con jacuzzi privata.",
      ],
      facts: [
        "Massimo 4 ospiti per suite",
        "Jacuzzi privata",
        "Cabine comunicanti disponibili",
        "2 Luxury Suite a bordo di Hathor",
      ],
    },
    itineraries: routesIt("Prezzo per suite, massimo 4 persone"),
    include: INCLUDE_IT,
    exclude: EXCLUDE_IT,
    availability: {
      note: AVAILABILITY_NOTE_IT("la suite"),
      sailings: sailingsIt("Massimo 4 persone per suite"),
    },
  },
  royal: {
    overview: {
      lead: "Luxury Royal Suite · 56 metri quadrati · vista panoramica sul Nilo",
      paragraphs: [
        "Le Royal Suite sono le sistemazioni più ampie di Hathor, con spazio privato in più e un senso di riservatezza ancora maggiore sul ponte principale.",
        "Finestre panoramiche e un balcone privato si aprono sul fiume mentre si naviga tra Luxor e Assuan. Artigianato tradizionale e comfort contemporaneo si incontrano in un ambiente pensato per un viaggio più quieto e personale.",
      ],
      facts: [
        "Massimo 4 ospiti per Royal Suite",
        "Balcone privato e due bagni",
        "2 Royal Suite a bordo di Hathor",
      ],
    },
    itineraries: routesIt("Prezzo per Royal Suite, massimo 4 persone"),
    include: INCLUDE_IT,
    exclude: EXCLUDE_IT,
    availability: {
      note: AVAILABILITY_NOTE_IT("la Royal Suite"),
      sailings: sailingsIt("Massimo 4 persone per Royal Suite"),
    },
  },
};

export function roomFolioPanels(
  variant: RoomCollectionVariant,
  locale: PublicLocale,
): RoomFolioPanels {
  return locale === "it" ? FOLIO_IT[variant] : ROOM_FOLIO_PANELS[variant];
}

/* ---------- Page words ---------- */

export type RoomsCopy = {
  runLabel: (collection: string) => string;
  previewLabels: readonly [string, string, string, string, string];
  previewFallback: string;
  previewAlt: (room: string, label: string) => string;
  previewGroup: (room: string) => string;
  viewRoom: string;
  viewRoomLabel: (room: string) => string;
  configurations: string;
  bookNow: string;
  bookNowCaps: string;
  viewVoyages: string;
  space: string;
  guests: string;
  upTo: (n: number) => string;
  outlook: string;
  panoramicNile: string;
  previewKicker: string;
  previewLead: (room: string) => string;
  elsewhere: string;
  hold: string;
  continueToReserve: string;
  nile: string;
  detail: {
    tabs: readonly [string, string, string, string, string];
    breadcrumb: string;
    sections: string;
    nightsDays: (nights: number, days: number) => string;
    photographs: (room: string) => string;
    openPhoto: (index: number, count: number) => string;
    photoAlt: (room: string, index: number) => string;
    viewerAlt: (room: string, index: number, count: number) => string;
    children: string;
    childrenWelcome: string;
    childrenNo: string;
    fareLabel: string;
    yourVoyage: string;
    perCabinNights: (nights: number) => string;
    vatIncluded: string;
    route: string;
    chooseVoyage: string;
    voyageOption: (ports: string, nights: number) => string;
    departs: string;
    every: (day: string) => string;
    oneCabin: string;
    upToGuests: (n: number) => string;
    checkAvailability: string;
    conditions: string;
    insideKicker: string;
    insideTitle: readonly [string, string];
    childrenNote: (allowed: boolean) => string;
    comfortsKicker: string;
    comfortsTitle: string;
    reservationKicker: string;
    fareTitle: string;
    portsEvery: (ports: string, day: string) => string;
    requestDate: string;
    ledgerHead: (nights: number | null) => readonly [string, string, string, string];
    sizeGuests: (sqm: number, n: number) => string;
    allInclusions: string;
    perCabin: string;
    cabin: string;
    totalLine: (nights: number | null, capacity: number) => string;
    total: string;
    onRequest: string;
    continueToReservation: string;
    includedTitle: readonly [string, string];
    goodToKnow: string;
    closePhotos: string;
    previousPhoto: string;
    nextPhoto: string;
  };
  folio: {
    label: string;
    title: string;
    overview: string;
    itinerary: string;
    includeExclude: string;
    availability: string;
    included: string;
    notIncluded: string;
    checkAvailability: string;
    scheduledSailings: string;
  };
};

export const ROOMS_COPY: Record<PublicLocale, RoomsCopy> = {
  en: {
    runLabel: (collection) => `${collection} aboard Hathor`,
    previewLabels: ["Primary", "Detail", "Light", "Bath", "View"],
    previewFallback: "interior",
    previewAlt: (room, label) => `${room} — ${label} aboard Hathor`,
    previewGroup: (room) => `${room} — five preview views`,
    viewRoom: "View the room",
    viewRoomLabel: (room) => `View the ${room} room`,
    configurations: "Configurations",
    bookNow: "Book now",
    bookNowCaps: "Book Now",
    viewVoyages: "View voyages",
    space: "Space",
    guests: "Guests",
    upTo: (n) => `Up to ${n}`,
    outlook: "Outlook",
    panoramicNile: "Panoramic Nile",
    previewKicker: "Preview sequence",
    previewLead: (room) =>
      `Five composed views of ${room} — light, proportion and river beyond the glass.`,
    elsewhere: "Elsewhere on board",
    hold: "Your quarters await between Luxor and Aswan.",
    continueToReserve: "Continue to reserve",
    nile: "Nile",
    detail: {
      tabs: ["Overview", "Availability", "Amenities", "Your voyage", "Good to know"],
      breadcrumb: "Breadcrumb",
      sections: "Sections of this room",
      nightsDays: (nights, days) => `${nights} nights / ${days} days`,
      photographs: (room) => `${room} photographs`,
      openPhoto: (index, count) => `View photograph ${index} of ${count} full screen`,
      photoAlt: (room, index) => `${room}, view ${index}`,
      viewerAlt: (room, index, count) => `${room}, photograph ${index} of ${count}`,
      children: "Children",
      childrenWelcome: "Welcome",
      childrenNo: "Not in this room",
      fareLabel: "Fare and availability",
      yourVoyage: "Your voyage",
      perCabinNights: (nights) => `per cabin · ${nights} nights`,
      vatIncluded: "VAT & service included",
      route: "Route",
      chooseVoyage: "Choose a voyage",
      voyageOption: (ports, nights) => `${ports} · ${nights} nights`,
      departs: "Departs",
      every: (day) => `Every ${day}`,
      oneCabin: "1 cabin",
      upToGuests: (n) => `Up to ${n} guests`,
      checkAvailability: "Check availability",
      conditions: "Booking conditions",
      insideKicker: "Inside your room",
      insideTitle: ["A private place", "to let the Nile in"],
      childrenNote: (allowed) =>
        allowed
          ? "Children are welcome in this room type."
          : "This room type does not accommodate children.",
      comfortsKicker: "Utilities & comforts",
      comfortsTitle: "Everything, considered",
      reservationKicker: "01 — Reservation",
      fareTitle: "Your cabin & fare",
      portsEvery: (ports, day) => `${ports} · every ${day}`,
      requestDate: "Request a date",
      ledgerHead: (nights) => [
        "Accommodation",
        "Your voyage includes",
        nights ? `${nights}-night total` : "Total",
        "Cabins",
      ],
      sizeGuests: (sqm, n) => `${sqm} m² · Up to ${n} guests`,
      allInclusions: "See all inclusions",
      perCabin: "per cabin",
      cabin: "cabin",
      totalLine: (nights, capacity) =>
        `1 cabin · ${nights ? `${nights} nights` : "flexible dates"} · up to ${capacity} guests`,
      total: "Total",
      onRequest: "On request",
      continueToReservation: "Continue to reservation",
      includedTitle: ["Included,", "with our care"],
      goodToKnow: "Good to know",
      closePhotos: "Close photographs",
      previousPhoto: "Previous photograph",
      nextPhoto: "Next photograph",
    },
    folio: {
      label: "Stay notes",
      title: "The voyage, in full",
      overview: "Overview",
      itinerary: "Itinerary",
      includeExclude: "Include & Exclude",
      availability: "Cruise Availability",
      included: "Included",
      notIncluded: "Not included",
      checkAvailability: "Check availability",
      scheduledSailings: "View scheduled sailings",
    },
  },
  it: {
    runLabel: (collection) => `${collection} a bordo di Hathor`,
    previewLabels: ["vista principale", "dettaglio", "luce", "bagno", "vista"],
    previewFallback: "interni",
    previewAlt: (room, label) => `${room}, ${label} a bordo di Hathor`,
    previewGroup: (room) => `${room}: cinque anteprime`,
    viewRoom: "Vedi la residenza",
    viewRoomLabel: (room) => `Vedi la residenza ${room}`,
    configurations: "Configurazioni",
    bookNow: "Prenota ora",
    bookNowCaps: "Prenota ora",
    /* The hero's four-button row has no room for "Vedi i viaggi". */
    viewVoyages: "I viaggi",
    space: "Spazio",
    guests: "Ospiti",
    upTo: (n) => `Fino a ${n}`,
    outlook: "Vista",
    panoramicNile: "Nilo panoramico",
    previewKicker: "Anteprime",
    previewLead: (room) => `Cinque viste di ${room}: la luce, le proporzioni e il fiume oltre il vetro.`,
    elsewhere: "Altrove a bordo",
    hold: "La Sua residenza La attende tra Luxor e Assuan.",
    continueToReserve: "Prosegua con la prenotazione",
    nile: "Nilo",
    detail: {
      tabs: ["Panoramica", "Disponibilità", "Dotazioni", "Il Suo viaggio", "Da sapere"],
      breadcrumb: "Percorso di navigazione",
      sections: "Sezioni di questa residenza",
      nightsDays: (nights, days) => `${nights} notti / ${days} giorni`,
      photographs: (room) => `Fotografie: ${room}`,
      openPhoto: (index, count) => `Apri la fotografia ${index} di ${count} a schermo intero`,
      photoAlt: (room, index) => `${room}, vista ${index}`,
      viewerAlt: (room, index, count) => `${room}, fotografia ${index} di ${count}`,
      children: "Bambini",
      childrenWelcome: "Benvenuti",
      childrenNo: "Non in questa residenza",
      fareLabel: "Tariffa e disponibilità",
      yourVoyage: "Il Suo viaggio",
      perCabinNights: (nights) => `per cabina · ${nights} notti`,
      vatIncluded: "IVA e servizio inclusi",
      route: "Itinerario",
      chooseVoyage: "Scelga un viaggio",
      voyageOption: (ports, nights) => `${ports} · ${nights} notti`,
      departs: "Partenza",
      every: (day) => `Ogni ${day}`,
      oneCabin: "1 cabina",
      upToGuests: (n) => `Fino a ${n} ospiti`,
      checkAvailability: "Verifica disponibilità",
      conditions: "Condizioni di prenotazione",
      insideKicker: "Dentro la Sua residenza",
      insideTitle: ["Uno spazio privato", "dove lasciar entrare il Nilo"],
      childrenNote: (allowed) =>
        allowed
          ? "I bambini sono i benvenuti in questa tipologia di residenza."
          : "Questa tipologia di residenza non accoglie bambini.",
      comfortsKicker: "Servizi e comfort",
      comfortsTitle: "Tutto, con cura",
      reservationKicker: "01 — Prenotazione",
      fareTitle: "La Sua cabina e la tariffa",
      portsEvery: (ports, day) => `${ports} · ogni ${day}`,
      requestDate: "Richieda una data",
      ledgerHead: (nights) => [
        "Sistemazione",
        "Il Suo viaggio include",
        nights ? `Totale ${nights} notti` : "Totale",
        "Cabine",
      ],
      sizeGuests: (sqm, n) => `${sqm} m² · Fino a ${n} ospiti`,
      allInclusions: "Vedi tutto ciò che è incluso",
      perCabin: "per cabina",
      cabin: "cabina",
      totalLine: (nights, capacity) =>
        `1 cabina · ${nights ? `${nights} notti` : "date flessibili"} · fino a ${capacity} ospiti`,
      total: "Totale",
      onRequest: "Su richiesta",
      continueToReservation: "Prosegua con la prenotazione",
      includedTitle: ["Incluso,", "con la nostra cura"],
      goodToKnow: "Da sapere",
      closePhotos: "Chiudi le fotografie",
      previousPhoto: "Fotografia precedente",
      nextPhoto: "Fotografia successiva",
    },
    folio: {
      label: "Note sul soggiorno",
      title: "Il viaggio, nel dettaglio",
      overview: "Panoramica",
      itinerary: "Itinerario",
      includeExclude: "Incluso ed escluso",
      availability: "Disponibilità della crociera",
      included: "Incluso",
      notIncluded: "Non incluso",
      checkAvailability: "Verifica disponibilità",
      scheduledSailings: "Vedi le partenze programmate",
    },
  },
};
