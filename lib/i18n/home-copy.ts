/**
 * The homepage's words in every public language.
 *
 * English is the live copy, character for character — the components render
 * the same markup from it. Italian follows the house rules in chrome-copy.ts:
 * formal "Lei" in sentences, the usual short web form on buttons, product
 * names (Hathor, Dahabiya, Seneb Spa, Luxury Suite, Royal Suite) unchanged,
 * Aswan written "Assuan".
 */

import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import type { PublicLocale } from "@/lib/i18n/locale";

type Pair = readonly [string, string];

export type HomeCopy = {
  hero: { lineRight: string; lineLeft: string };
  runLabel: string;
  open: {
    label: string;
    navLabel: string;
    nav: readonly { href: string; label: string }[];
    eyebrow: string;
    titleLines: readonly [string, string, string];
    body: string;
    scroll: string;
    npCopy: string;
    npTitle: string;
  };
  lead: {
    label: string;
    mainAlt: string;
    insetUnderAlt: string;
    insetOverAlt: string;
    aboard: string;
    aboardRoute: string;
  };
  sailings: {
    label: string;
    kicker: string;
    titleLines: Pair;
    support: string;
    /** By catalogue room type. */
    tiers: Record<string, string>;
    roundTrip: string;
    /** "Aswan → Luxor" as the card prints it. */
    route: (ports: string) => string;
    nights: (nights: number) => string;
    /** The departure weekday as the card prints it ("Saturdays"). */
    day: (weekday: string) => string;
    from: string;
    price: (cents: number) => string;
    alt: (roomName: string, ports: string) => string;
    bookNow: string;
    moreAlt: string;
    moreTier: string;
    moreName: string;
    moreLink: string;
  };
  chart: {
    panelLabel: string;
    kicker: string;
    titleLines: Pair;
    support: string;
    sailed: (km: number) => string;
    eyebrow: string;
    stopsLabel: string;
    embarkation: string;
    readMore: string;
    mapTitle: string;
    mapDescription: string;
    heading: string;
    westernDesert: string;
    easternDesert: string;
    caption: string;
    notNavigation: string;
    place: (name: string) => string;
  };
  claim: {
    label: string;
    lines: readonly [string, string, string, string];
    copy: string;
  };
  voyages: {
    label: string;
    kicker: string;
    support: string;
    link: string;
    items: readonly { nights: string; route: string; note: string; alt: string }[];
  };
  suites: {
    label: string;
    kicker: string;
    line: string;
    copy: Pair;
    link: string;
    royalBathAlt: string;
    royalAlt: string;
    cabinAlt: string;
    luxurySuiteAlt: string;
  };
  marquee: { label: string; words: readonly string[] };
  experiences: {
    label: string;
    navLabel: string;
    loungeAlt: string;
    diningAlt: string;
    fitnessAlt: string;
    spaAlt: string;
    explore: readonly { href: string; label: string }[];
  };
  terms: {
    label: string;
    items: readonly { title: string; copy: string; aside?: string; imageAlt: string }[];
  };
  close: {
    label: string;
    charterAlt: string;
    duskAlt: string;
    kicker: string;
    title: string;
    support: string;
    cta: string;
  };
  doc: {
    contactLabel: string;
    kicker: string;
    support: string;
    titleLines: Pair;
    mosaicLabel: string;
    mosaicAlts: readonly string[];
  };
};

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;
/* Italian groups thousands with a dot — always, so $4.000 sits beside $12.600. */
const usdIt = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US").replace(/,/g, ".")}`;

const IT_PLACES: Record<string, string> = { Aswan: "Assuan" };
const itPlace = (name: string) => IT_PLACES[name] ?? name;
const itPorts = (ports: string) =>
  ports
    .split(/(\s*[→—]\s*)/)
    .map((part) => itPlace(part))
    .join("");

const IT_WEEKDAYS: Record<string, string> = {
  Monday: "lunedì",
  Tuesday: "martedì",
  Wednesday: "mercoledì",
  Thursday: "giovedì",
  Friday: "venerdì",
  Saturday: "sabato",
  Sunday: "domenica",
};
export const italianWeekday = (weekday: string) =>
  IT_WEEKDAYS[weekday] ?? weekday;

const EN: HomeCopy = {
  hero: {
    lineRight: "Luxury Dahabiya",
    lineLeft: "Nile Cruise",
  },
  runLabel: "Aboard Hathor",
  open: {
    label: "Hathor Dahabiya",
    navLabel: "This page",
    nav: [
      { href: "/cruises", label: "Cruises" },
      { href: "/voyages", label: "Voyages" },
      { href: "/suites", label: "Suites" },
      { href: "/contact", label: "Contact" },
    ],
    eyebrow: "Hathor Dahabiya",
    titleLines: ["32", "guests", "One river"],
    body: "A private sailing dahabiya on the Egyptian Nile. Eight cabins, two suites and two Royal Suites, between Luxor and Aswan.",
    scroll: "Scroll",
    npCopy:
      "A private dahabiya journey between Luxor and Aswan, shaped by stillness, history and the rhythm of the river.",
    npTitle: "The Nile in private",
  },
  lead: {
    label: "The cruise",
    mainAlt: "Hathor Dahabiya moored on the Nile at golden hour",
    insetUnderAlt: "The pool deck aboard Hathor Dahabiya",
    insetOverAlt: "Hathor Dahabiya under sail between Luxor and Aswan",
    aboard: "Aboard",
    aboardRoute: "Luxor — Aswan",
  },
  sailings: {
    label: "Sailings",
    kicker: "02 — Sailings",
    titleLines: ["Choose", "your cabin"],
    support:
      "A five-star dahabiya where Nile history, contemporary comfort and intimate sailing come together. Three itineraries, four cabin grades, 32 guests aboard.",
    tiers: {
      "Luxury Room": "Luxury room",
      "Luxury Suite": "Luxury suite",
      "Luxury Royal Suite": "Royal suite",
    },
    roundTrip: "Round trip",
    route: (ports) => ports.replace("→", "—"),
    nights: (nights) => `${nights} nights`,
    day: (weekday) => `${weekday}s`,
    from: "from",
    price: usd,
    alt: (roomName, ports) => `${roomName} aboard Hathor, ${ports}`,
    bookNow: "Book now",
    moreAlt: "Hathor Dahabiya on the Nile",
    moreTier: "The full list",
    moreName: "View more",
    moreLink: "All sailings",
  },
  chart: {
    panelLabel: "The route between Luxor and Aswan",
    kicker: "The route",
    titleLines: ["Luxor", "to Aswan"],
    support:
      "Drawn from the river’s own coordinates. Sail it here, and see what stands at each mooring before you tie up there.",
    sailed: (km) => `of ${km} km sailed`,
    eyebrow: "A 4-night passage · Luxor to Aswan",
    stopsLabel: "Explore places on the Nile",
    embarkation: "Embarkation",
    readMore: "Read more",
    mapTitle: "The Nile between Luxor and Aswan",
    mapDescription:
      "North-up geographic overview with city locations. Dotted leaders connect places to a generalized river course; they do not mark berths. Sailing is shown southwards from Luxor to Aswan.",
    heading: "Heading",
    westernDesert: "WESTERN DESERT",
    easternDesert: "EASTERN DESERT",
    caption: "Geographic overview · approximate city locations",
    notNavigation: "· not a navigation chart",
    place: (name) => name,
  },
  claim: {
    label: "She sails where the big ships cannot",
    lines: ["She sails", "where the", "big ships", "cannot"],
    copy: "A dahabiya draws little more than a metre. She moors at Esna, Edfu and Kom Ombo while the floating hotels pass by, and ties up at banks that have no dock at all.",
  },
  voyages: {
    label: "The voyages",
    kicker: "02 — The voyages",
    support:
      "Three sailings between the two cities. The river decides how long each one takes; the direction decides how it feels.",
    link: "All voyages",
    items: [
      {
        nights: "Three nights",
        route: "Aswan — Luxor",
        note: "With the current",
        alt: "Hathor Dahabiya sailing from Aswan to Luxor",
      },
      {
        nights: "Four nights",
        route: "Luxor — Aswan",
        note: "Under her own canvas",
        alt: "Hathor Dahabiya sailing from Luxor to Aswan",
      },
      {
        nights: "Seven nights",
        route: "The round trip",
        note: "Both banks, the whole river",
        alt: "Hathor Dahabiya on the full Luxor to Aswan round trip",
      },
    ],
  },
  suites: {
    label: "The suites",
    kicker: "03 — The suites",
    line: "Twelve rooms, and the river in every one of them.",
    copy: [
      "Eight cabins, two suites and two Royal Suites, each with its own window on the bank.",
      "Hand-worked wood, linen, and a bed made for the quiet after a shore day.",
    ],
    link: "See the suites",
    royalBathAlt: "A Royal Suite bathroom aboard Hathor",
    royalAlt: "A Royal Suite aboard Hathor Dahabiya",
    cabinAlt: "A river-view cabin aboard Hathor Dahabiya",
    luxurySuiteAlt: "A Luxury Suite aboard Hathor Dahabiya",
  },
  marquee: {
    label: "Aboard Hathor",
    words: [
      "Seneb Spa",
      "Two restaurants",
      "Shore days",
      "Sun deck",
      "Private charter",
    ],
  },
  experiences: {
    label: "The experiences",
    navLabel: "Aboard Hathor",
    loungeAlt: "The lounge aboard Hathor Dahabiya",
    diningAlt: "Dining aboard Hathor Dahabiya",
    fitnessAlt: "The fitness space aboard Hathor Dahabiya",
    spaAlt: "Seneb Spa aboard Hathor Dahabiya",
    explore: [
      { href: "/gastronomy", label: "Gastronomy" },
      { href: "/wellness", label: "Seneb Spa" },
      { href: "/highlights", label: "Highlights" },
      { href: "/charter", label: "Private charter" },
    ],
  },
  terms: {
    label: "About Hathor",
    items: [
      {
        title: "Twelve rooms",
        copy: "Eight cabins, two suites and two Royal Suites. The whole boat holds fewer people than one deck of a cruise ship, which is the entire point of her.",
        aside: "A full sailing is thirty-two guests, across twelve quiet rooms.",
        imageAlt: "Hathor Dahabiya under sail on the Nile",
      },
      {
        title: "no engine",
        copy: "A dahabiya sails. Two lateen sails and the current do the work, and the river is the only thing you hear between the moorings.",
        imageAlt: "Hand-worked detail aboard Hathor Dahabiya",
      },
      {
        title: "A way of life",
        copy: "Egypt arrives without hurry: warm company, refined cabins and the river unfolding one measured bend at a time.",
        imageAlt: "Life aboard Hathor Dahabiya on the Nile",
      },
    ],
  },
  close: {
    label: "Sail with Hathor",
    charterAlt: "Hathor Dahabiya chartered in full on the Nile",
    duskAlt: "Hathor Dahabiya at anchor at dusk",
    kicker: "Luxor · Aswan · Egypt",
    title: "Come aboard",
    support:
      "32 guests, five moorings and one river. The rest of the arrangements are ours.",
    cta: "Check availability",
  },
  doc: {
    contactLabel: "Contact Hathor",
    kicker: "06 — Contact",
    support:
      "32 guests, five moorings and one river. The rest of the arrangements are ours.",
    titleLines: ["Begin your", "Nile journey"],
    mosaicLabel: "Aboard Hathor",
    mosaicAlts: [
      "The Temple of Hatshepsut at Deir el-Bahari",
      "The Nile at first light from the deck of Hathor",
      "Dinner served on deck aboard Hathor",
      "A shore day from Hathor Dahabiya",
    ],
  },
};

const IT: HomeCopy = {
  hero: {
    lineRight: "Dahabiya di lusso",
    lineLeft: "Crociera sul Nilo",
  },
  runLabel: "A bordo di Hathor",
  open: {
    label: "Hathor Dahabiya",
    navLabel: "In questa pagina",
    nav: [
      { href: "/cruises", label: "Crociere" },
      { href: "/voyages", label: "Viaggi" },
      { href: "/suites", label: "Suite" },
      { href: "/contact", label: "Contatti" },
    ],
    eyebrow: "Hathor Dahabiya",
    titleLines: ["32", "ospiti", "Un fiume"],
    body: "Una dahabiya a vela privata sul Nilo egiziano. Otto cabine, due suite e due Royal Suite, tra Luxor e Assuan.",
    scroll: "Scorri",
    npCopy:
      "Un viaggio privato in dahabiya tra Luxor e Assuan, scandito dalla quiete, dalla storia e dal ritmo del fiume.",
    npTitle: "Il Nilo in privato",
  },
  lead: {
    label: "La crociera",
    mainAlt: "Hathor Dahabiya ormeggiata sul Nilo all’ora dorata",
    insetUnderAlt: "Il ponte piscina a bordo di Hathor Dahabiya",
    insetOverAlt: "Hathor Dahabiya a vela tra Luxor e Assuan",
    aboard: "A bordo",
    aboardRoute: "Luxor — Assuan",
  },
  sailings: {
    label: "Partenze",
    kicker: "02 — Partenze",
    titleLines: ["Scelga", "la Sua cabina"],
    support:
      "Una dahabiya cinque stelle in cui la storia del Nilo, il comfort contemporaneo e una navigazione intima si incontrano. Tre itinerari, quattro categorie di cabina, 32 ospiti a bordo.",
    tiers: {
      "Luxury Room": "Camera di lusso",
      "Luxury Suite": "Luxury Suite",
      "Luxury Royal Suite": "Royal Suite",
    },
    roundTrip: "Andata e ritorno",
    route: (ports) => itPorts(ports).replace("→", "—"),
    nights: (nights) => `${nights} notti`,
    day: (weekday) => `ogni ${italianWeekday(weekday)}`,
    from: "da",
    price: usdIt,
    alt: (roomName, ports) => `${roomName} a bordo di Hathor, ${itPorts(ports)}`,
    bookNow: "Prenota ora",
    moreAlt: "Hathor Dahabiya sul Nilo",
    moreTier: "L’elenco completo",
    moreName: "Vedi di più",
    moreLink: "Tutte le partenze",
  },
  chart: {
    panelLabel: "La rotta tra Luxor e Assuan",
    kicker: "La rotta",
    titleLines: ["Da Luxor", "ad Assuan"],
    support:
      "Tracciata sulle coordinate reali del fiume. La percorra qui e scopra che cosa La attende a ogni ormeggio, prima ancora di attraccare.",
    sailed: (km) => `di ${km} km navigati`,
    eyebrow: "Una traversata di 4 notti · Da Luxor ad Assuan",
    stopsLabel: "Esplori i luoghi sul Nilo",
    embarkation: "Imbarco",
    readMore: "Scopra di più",
    mapTitle: "Il Nilo tra Luxor e Assuan",
    mapDescription:
      "Panoramica geografica orientata a nord con la posizione delle città. Le linee tratteggiate collegano i luoghi a un tracciato semplificato del fiume e non indicano gli ormeggi. La navigazione è mostrata verso sud, da Luxor ad Assuan.",
    heading: "Rotta",
    westernDesert: "DESERTO OCCIDENTALE",
    easternDesert: "DESERTO ORIENTALE",
    caption: "Panoramica geografica · posizione indicativa delle città",
    notNavigation: "· non è una carta nautica",
    place: itPlace,
  },
  claim: {
    label: "Naviga dove le grandi navi non arrivano",
    lines: ["Naviga", "dove le", "grandi navi", "non arrivano"],
    copy: "Una dahabiya pesca poco più di un metro. Ormeggia a Esna, Edfu e Kom Ombo mentre gli hotel galleggianti tirano dritto, e attracca lungo rive prive di qualsiasi banchina.",
  },
  voyages: {
    label: "I viaggi",
    kicker: "02 — I viaggi",
    support:
      "Tre navigazioni tra le due città. Il fiume decide quanto dura ciascuna; la direzione, che sapore avrà.",
    link: "Tutti i viaggi",
    items: [
      {
        nights: "Tre notti",
        route: "Assuan — Luxor",
        note: "Seguendo la corrente",
        alt: "Hathor Dahabiya in navigazione da Assuan a Luxor",
      },
      {
        nights: "Quattro notti",
        route: "Luxor — Assuan",
        note: "Spinta dalle sue vele",
        alt: "Hathor Dahabiya in navigazione da Luxor ad Assuan",
      },
      {
        nights: "Sette notti",
        route: "Andata e ritorno",
        note: "Entrambe le rive, tutto il fiume",
        alt: "Hathor Dahabiya sull’intero itinerario Luxor–Assuan, andata e ritorno",
      },
    ],
  },
  suites: {
    label: "Le suite",
    kicker: "03 — Le suite",
    line: "Dodici stanze, e il fiume in ognuna di esse.",
    copy: [
      "Otto cabine, due suite e due Royal Suite, ciascuna con la propria finestra sulla riva.",
      "Legno lavorato a mano, lino e un letto pensato per la quiete dopo una giornata a terra.",
    ],
    link: "Scopra le suite",
    royalBathAlt: "Il bagno di una Royal Suite a bordo di Hathor",
    royalAlt: "Una Royal Suite a bordo di Hathor Dahabiya",
    cabinAlt: "Una cabina vista fiume a bordo di Hathor Dahabiya",
    luxurySuiteAlt: "Una Luxury Suite a bordo di Hathor Dahabiya",
  },
  marquee: {
    label: "A bordo di Hathor",
    words: [
      "Seneb Spa",
      "Due ristoranti",
      "Escursioni a terra",
      "Ponte sole",
      "Charter privato",
    ],
  },
  experiences: {
    label: "Le esperienze",
    navLabel: "A bordo di Hathor",
    loungeAlt: "Il salone a bordo di Hathor Dahabiya",
    diningAlt: "La cucina a bordo di Hathor Dahabiya",
    fitnessAlt: "La sala fitness a bordo di Hathor Dahabiya",
    spaAlt: "La Seneb Spa a bordo di Hathor Dahabiya",
    explore: [
      { href: "/gastronomy", label: "Gastronomia" },
      { href: "/wellness", label: "Seneb Spa" },
      { href: "/highlights", label: "Da non perdere" },
      { href: "/charter", label: "Charter privato" },
    ],
  },
  terms: {
    label: "Chi è Hathor",
    items: [
      {
        title: "Dodici stanze",
        copy: "Otto cabine, due suite e due Royal Suite. L’intera imbarcazione ospita meno persone di un solo ponte di una nave da crociera: ed è proprio questo il suo senso.",
        aside: "Una navigazione al completo conta trentadue ospiti, in dodici stanze silenziose.",
        imageAlt: "Hathor Dahabiya a vela sul Nilo",
      },
      {
        title: "nessun motore",
        copy: "Una dahabiya va a vela. Due vele latine e la corrente fanno il lavoro, e tra un ormeggio e l’altro si sente soltanto il fiume.",
        imageAlt: "Un dettaglio lavorato a mano a bordo di Hathor Dahabiya",
      },
      {
        title: "Uno stile di vita",
        copy: "L’Egitto arriva senza fretta: compagnia calorosa, cabine raffinate e il fiume che si svela un’ansa alla volta.",
        imageAlt: "La vita a bordo di Hathor Dahabiya sul Nilo",
      },
    ],
  },
  close: {
    label: "Navighi con Hathor",
    charterAlt: "Hathor Dahabiya noleggiata in esclusiva sul Nilo",
    duskAlt: "Hathor Dahabiya all’ancora al tramonto",
    kicker: "Luxor · Assuan · Egitto",
    title: "Salga a bordo",
    support: "32 ospiti, cinque ormeggi e un fiume. A tutto il resto pensiamo noi.",
    cta: "Verifica la disponibilità",
  },
  doc: {
    contactLabel: "Contatti Hathor",
    kicker: "06 — Contatti",
    support: "32 ospiti, cinque ormeggi e un fiume. A tutto il resto pensiamo noi.",
    titleLines: ["Inizi il Suo", "viaggio sul Nilo"],
    mosaicLabel: "A bordo di Hathor",
    mosaicAlts: [
      "Il Tempio di Hatshepsut a Deir el-Bahari",
      "Il Nilo alle prime luci dal ponte di Hathor",
      "La cena servita sul ponte di Hathor",
      "Un’escursione a terra da Hathor Dahabiya",
    ],
  },
};

export const HOME_COPY: Record<PublicLocale, HomeCopy> = { en: EN, it: IT };

/* ------------------------------------------------------ partners strip */

export type PartnersStripCopy = {
  title: string;
  headline: string;
  script: string;
  phoneScript: string;
  leadLines: readonly string[];
  hrefLabel: string;
  listLabel: string;
};

export const PARTNERS_STRIP_COPY: Record<PublicLocale, PartnersStripCopy> = {
  en: {
    title: HOMEPAGE_PARTNERS.title,
    headline: HOMEPAGE_PARTNERS.headline,
    script: HOMEPAGE_PARTNERS.script,
    phoneScript: "Dahabiya Cruise",
    leadLines: HOMEPAGE_PARTNERS.leadLines,
    hrefLabel: HOMEPAGE_PARTNERS.hrefLabel,
    listLabel: "Hathor partners",
  },
  it: {
    title: "I nostri partner",
    headline: "In compagnia illustre",
    script: "di fiducia lungo il viaggio",
    phoneScript: "Crociera in dahabiya",
    /* Three measured lines, like the English band. */
    leadLines: [
      "Siamo orgogliosi del riconoscimento di importanti",
      "partner del turismo e dell’ospitalità in tutto il mondo,",
      "che condividono la nostra passione per i viaggi autentici sul Nilo.",
    ],
    hrefLabel: "Scopra i nostri partner",
    listLabel: "I partner di Hathor",
  },
};
