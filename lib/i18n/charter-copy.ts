/**
 * The private charter page (/charter) and its request form, in every public
 * language. English is the live copy, character for character, and reads from
 * CHARTER_PRIVATE / CHARTER_PAGE where the page does. Images, links, routes
 * and the request sent to the team are unchanged: route and trip-type values
 * stay English (the reservations desk reads them); only their labels change.
 */

import { CHARTER_PRIVATE } from "@/lib/charter-private-content";
import type { PublicLocale } from "@/lib/i18n/locale";
import { CHARTER_PAGE } from "@/lib/page-content";

type TripType = (typeof CHARTER_PRIVATE.inquiry.tripTypes)[number];
type Titled = { title: string; body: string };

export type CharterCopy = {
  runLabel: string;
  chaptersLabel: string;
  chapters: readonly [string, string, string, string];
  deed: readonly [string, string, string, string, string];
  freedomWords: readonly [string, string, string];
  residenceDecks: readonly [string, string, string];
  kicker: string;
  deedIntro: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  scrollCue: string;
  shipLabel: string;
  shipLegend: readonly [string, string];
  preferToTalk: string;
  requestPhotoAlt: string;
  vow: {
    eyebrow: string;
    title: readonly string[];
    statement: string;
    places: string;
    frontAlt: string;
    backAlt: string;
    photoAlt: string;
  };
  fleet: {
    kicker: string;
    title: readonly string[];
    intro: string;
    stats: readonly string[];
    outro: string;
    cards: readonly { title: string; body: string; capacity: string; detail: string; amenities: readonly string[]; hrefLabel: string }[];
  };
  value: { kicker: string; title: string; intro: string; pillars: readonly Titled[] };
  experiences: { kicker: string; title: readonly string[]; items: readonly Titled[] };
  passages: {
    kicker: string;
    title: readonly string[];
    lead: string;
    label: string;
    selected: string;
    choose: string;
    /** The passage frame's photographs; empty keeps the dashboard description. */
    imageAlt: (route: string) => string;
  };
  preferred: (route: string) => string;
  process: { kicker: string; title: readonly string[]; begin: string; steps: readonly Titled[]; frontAlt: string; backAlt: string; celebrationAlt: string };
  trust: { kicker: string; title: readonly string[]; facts: readonly string[]; quotes: readonly { quote: string; attribution: string }[]; photoAlt: string; askWhatsapp: string };
  epilogue: {
    eyebrow: string;
    lines: readonly [string, string];
    body: string;
    scheduled: { before: string; link: string; after: string };
    email: string;
    photoAlts: readonly [string, string];
  };
  hours: string;
  /** A route or stop as shown ("Luxor ↔ Aswan" → "Luxor ↔ Assuan"); the value sent stays English. */
  place: (name: string) => string;
  form: {
    eyebrow: string;
    title: string;
    lead: string;
    tripTypes: Record<TripType, string>;
    name: string;
    email: string;
    phone: string;
    tripType: string;
    departure: string;
    departurePlaceholder: string;
    destination: string;
    destinationPlaceholder: string;
    startDate: string;
    time: string;
    route: string;
    adults: string;
    children: string;
    special: string;
    specialPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    errors: {
      name: string;
      nameChars: string;
      email: string;
      phone: string;
      date: string;
      adults: string;
      children: string;
      check: string;
      send: string;
    };
    /** Use the server's own refusal text (English) or always this language's. */
    serverErrors: boolean;
    fallback: { lead: string; link: string };
    sending: string;
    send: string;
    success: {
      title: string;
      body: string;
      receipt: { before: string; after: string };
      noReceipt: { before: string; after: string; end: string };
      again: string;
    };
    /** Added to the team's message so the desk replies in the guest's language. */
    languageNote: string | null;
  };
};

const P = CHARTER_PRIVATE;

const EN: CharterCopy = {
  runLabel: "Private charter aboard Hathor",
  chaptersLabel: "Charter chapters",
  chapters: ["Request", "The vessel", "Residences", "Passages"],
  deed: ["Private Dahabiya", "Decks", "Residences", "Guests at most", "Other guests"],
  freedomWords: ["Privacy.", "Flexibility.", "Care."],
  residenceDecks: ["Lower deck", "Lower deck", "Main deck"],
  kicker: P.hero.kicker,
  deedIntro:
    "Charter your own luxury Dahabiya — Hathor’s twelve cabins and suites, crew and chef — for a private Nile cruise in Egypt, from Luxor to Aswan, Dendera or Cairo.",
  lead: CHARTER_PAGE.hero.subtitle,
  primaryCta: P.hero.primaryCta,
  secondaryCta: P.hero.secondaryCta,
  scrollCue: "Scroll to come aboard",
  shipLabel: "Hathor in profile: the sun deck, main deck and lower deck, all reserved for one party",
  shipLegend: ["Every deck", "reserved for your party"],
  preferToTalk: "Prefer to talk",
  requestPhotoAlt: "Hathor under way on the Nile",
  vow: {
    eyebrow: "Exclusive use of the Dahabiya",
    title: ["The vessel", "is yours"],
    statement: P.hero.subhead,
    places: "Luxor · Aswan · Dendera · Cairo",
    frontAlt: "Private sun deck reserved for your party",
    backAlt: "Life aboard Hathor",
    photoAlt: "Private Hathor Dahabiya charter on the Nile",
  },
  fleet: {
    kicker: P.fleet.kicker,
    title: ["Every", "residence"],
    intro: P.fleet.intro,
    stats: P.fleet.stats,
    outro: P.fleet.outro,
    cards: P.fleet.cards.map((card) => ({
      title: card.title,
      body: card.body,
      capacity: card.capacity,
      detail: card.detail,
      amenities: card.amenities,
      hrefLabel: card.hrefLabel,
    })),
  },
  value: { kicker: P.value.kicker, title: P.value.title, intro: P.value.intro, pillars: P.value.pillars },
  experiences: { kicker: P.experiences.kicker, title: ["Crafted for", "your party", "alone"], items: P.experiences.items },
  passages: {
    kicker: P.passages.kicker,
    title: ["Choose", "your", "passage"],
    lead: P.passages.lead,
    label: "Charter passages",
    selected: "Selected · Request quote",
    choose: "Choose this passage",
    imageAlt: () => "",
  },
  preferred: (route) => `Preferred · ${route}`,
  process: {
    kicker: P.process.kicker,
    title: ["Three", "measured", "steps"],
    begin: "Begin step one",
    steps: P.process.steps,
    frontAlt: "Unhurried sailing rhythm along the Nile",
    backAlt: "Dedicated hospitality aboard Hathor",
    celebrationAlt: "Private celebration aboard Hathor",
  },
  trust: {
    kicker: P.trust.kicker,
    title: ["Quiet", "proof"],
    facts: P.trust.facts,
    quotes: P.trust.quotes,
    photoAlt: "Life aboard a private Hathor charter",
    askWhatsapp: "Ask on WhatsApp",
  },
  epilogue: {
    eyebrow: "Private concierge",
    lines: ["Your Journey,", "Redefined."],
    body: P.finale.body,
    scheduled: { before: "Travelling as a couple or a small group? Join a", link: "scheduled Nile cruise", after: "aboard Hathor instead." },
    email: "Email",
    photoAlts: ["Private dining aboard Hathor", "Private Hathor charter at dusk on the Nile"],
  },
  hours: P.finale.hours,
  place: (name) => name,
  form: {
    eyebrow: "Private Concierge",
    title: P.inquiry.title,
    lead: P.inquiry.lead,
    tripTypes: { "One-Way": "One-Way", "Round-Trip": "Round-Trip", "Multi-Stop": "Multi-Stop" },
    name: "Name",
    email: "Email",
    phone: "Phone",
    tripType: "Trip Type",
    departure: "Departure",
    departurePlaceholder: "e.g. Luxor",
    destination: "Destination",
    destinationPlaceholder: "e.g. Aswan",
    startDate: "Preferred start date",
    time: "Preferred Time",
    route: "Preferred Route",
    adults: "Passengers (Adults)",
    children: "Children",
    special: "Luggage / Special Requirements",
    specialPlaceholder: "Accessibility, celebrations, dietary…",
    message: "Message",
    messagePlaceholder: "Tell us how you wish to travel…",
    errors: {
      name: "Please enter your name.",
      nameChars: "Please use letters, spaces, hyphens or apostrophes only.",
      email: "Please enter a valid email.",
      phone: "Please use digits, spaces and + ( ) - only.",
      date: "Please choose a date from today onwards.",
      adults: "Please enter 1 to 50 adults.",
      children: "Please enter 0 to 50 children.",
      check: "Please check the highlighted fields.",
      send: "Unable to send your request.",
    },
    serverErrors: true,
    fallback: { lead: "Your details are safe — send them straight to our charter team:", link: "email the request" },
    sending: "Sending…",
    send: "Send Request",
    success: {
      title: "Thank you.",
      body: "Your private voyage inquiry has been received. Our charter team will prepare a tailored response.",
      receipt: { before: "A confirmation is on its way to", after: ". If it does not arrive, write to" },
      noReceipt: {
        before: "Our team has your request, but we could not send a confirmation to",
        after: ". Please check the address, or write to",
        end: "so we can reach you.",
      },
      again: "Send another request",
    },
    languageNote: null,
  },
};

const PLACES_IT: Record<string, string> = { Aswan: "Assuan", Cairo: "Il Cairo" };

const IT: CharterCopy = {
  runLabel: "Charter privato a bordo di Hathor",
  chaptersLabel: "Capitoli del charter",
  chapters: ["Richiesta", "La nave", "Le residenze", "Gli itinerari"],
  deed: ["Dahabiya privata", "Ponti", "Residenze", "Ospiti al massimo", "Altri ospiti"],
  freedomWords: ["Riservatezza.", "Libertà.", "Cura."],
  residenceDecks: ["Ponte inferiore", "Ponte inferiore", "Ponte principale"],
  kicker: "Charter privato in dahabiya · Egitto",
  deedIntro:
    "Noleggi in esclusiva una dahabiya di lusso: le dodici cabine e suite di Hathor, l’equipaggio e lo chef, per una crociera privata sul Nilo in Egitto, da Luxor ad Assuan, Dendera o Il Cairo.",
  lead: "Il Suo Nilo privato, solo per Lei.",
  primaryCta: "Richieda un charter privato",
  secondaryCta: "Verifica disponibilità",
  scrollCue: "Scorra per salire a bordo",
  shipLabel:
    "Il profilo di Hathor: il ponte sole, il ponte principale e il ponte inferiore, tutti riservati a un solo gruppo",
  shipLegend: ["Ogni ponte", "riservato al Suo gruppo"],
  preferToTalk: "Preferisce parlarne",
  requestPhotoAlt: "Hathor in navigazione sul Nilo",
  vow: {
    eyebrow: "La dahabiya in uso esclusivo",
    title: ["La nave", "è Sua"],
    statement:
      "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare il viaggio secondo il ritmo, la cucina e le escursioni a terra che preferisce.",
    places: "Luxor · Assuan · Dendera · Il Cairo",
    frontAlt: "Il ponte sole privato, riservato al Suo gruppo",
    backAlt: "La vita a bordo di Hathor",
    photoAlt: "Charter privato di Hathor Dahabiya sul Nilo",
  },
  fleet: {
    kicker: "Le residenze",
    title: ["Ogni", "residenza"],
    intro:
      "Hathor si sviluppa su tre ponti e accoglie un numero limitato di ospiti in otto cabine, due suite e due Royal Suite.",
    stats: ["8 cabine", "2 suite", "2 Royal Suite"],
    outro:
      "Alcune cabine sono comunicanti, per una maggiore privacy. Ogni ambiente dispone di sistemi smart: accesso senza chiave, smart TV, luci e tende automatizzate.",
    cards: [
      {
        title: "Luxury Rooms",
        body: "Le cabine di Hathor uniscono proporzioni studiate, vista sul Nilo e comfort pratico in un ambiente calmo e contemporaneo.",
        capacity: "8 cabine",
        detail: "22 m² · bagno privato · comfort vista Nilo",
        amenities: ["Sistemi smart", "Bagno privato", "Wi-Fi ad alta velocità"],
        hrefLabel: "Vedi le cabine",
      },
      {
        title: "Luxury Suites",
        body: "Le suite offrono più spazio agli ospiti che cercano maggiore privacy, proporzioni generose e una vista ininterrotta sul fiume.",
        capacity: "2 suite",
        detail: "46 m² · ponte inferiore · jacuzzi",
        amenities: ["Vista panoramica sul Nilo", "Jacuzzi", "Doppio bagno"],
        hrefLabel: "Tutte le caratteristiche",
      },
      {
        title: "Luxury Royal Suites",
        body: "Le Royal Suite sono le sistemazioni più ampie di Hathor, con spazio privato in più e un senso di riservatezza ancora maggiore.",
        capacity: "2 Royal Suite",
        detail: "56 m² · ponte principale · spazio privato",
        amenities: ["La migliore vista sul Nilo", "Jacuzzi", "Due bagni"],
        hrefLabel: "Vedi le suite",
      },
    ],
  },
  value: {
    kicker: "Perché scegliere Hathor in charter",
    title: "Riservatezza. Libertà. Cura.",
    intro:
      "Il nostro team costruisce con Lei un viaggio privato sul Nilo su misura per le Sue date, il Suo gruppo e le Sue priorità. Potrà contare su:",
    pillars: [
      {
        title: "Privacy e discrezione totali",
        body: "Massima privacy a bordo, nessun altro ospite. Una dahabiya privata solo per il Suo gruppo, con un servizio riservato e misurato.",
      },
      {
        title: "Itinerari flessibili",
        body: "Un itinerario su misura, con i Suoi tempi. Navighi da Luxor ad Assuan, percorra la rotta al contrario o si spinga fino a Dendera e Il Cairo: tutto pensato per Lei.",
      },
      {
        title: "Cura dedicata",
        body: "Equipaggio e chef dedicati, sistemazioni raffinate e un’ospitalità attenta, pensata per il comfort e per giornate senza pensieri sul Nilo.",
      },
    ],
  },
  experiences: {
    kicker: "Esperienze private a bordo",
    title: ["Pensato per", "il Suo gruppo", "soltanto"],
    items: [
      {
        title: "Cene private",
        body: "Su richiesta, cene private in spazi selezionati a bordo, per chi desidera un’esperienza più personale.",
      },
      {
        title: "Concierge a terra e sul fiume",
        body: "Un equipaggio dedicato coordina approdi, guide e trasferimenti, perché ogni momento a terra scorra senza intoppi.",
      },
      {
        title: "Il Suo ritmo",
        body: "Si svegli, navighi e ceni quando preferisce. Ponti silenziosi o feste: la nave cambia atmosfera con Lei.",
      },
      {
        title: "Benessere sul Nilo",
        body: "Tra un tempio e l’altro, rituali spa e ore senza fretta, pensati per la privacy e la calma.",
      },
    ],
  },
  passages: {
    kicker: "Itinerari privati sul Nilo",
    title: ["Scelga", "il Suo", "itinerario"],
    lead: "Selezioni l’itinerario che preferisce. Ogni approdo, orario ed escursione a terra sarà definito intorno ai Suoi ospiti.",
    label: "Itinerari del charter",
    selected: "Selezionato · Richieda un preventivo",
    choose: "Scelga questo itinerario",
    imageAlt: (route) => `Hathor Dahabiya, charter privato sul Nilo: ${route}`,
  },
  preferred: (route) => `Preferenza · ${route}`,
  process: {
    kicker: "Come funziona il charter",
    title: ["Tre", "semplici", "passaggi"],
    begin: "Inizi dal primo passo",
    steps: [
      {
        title: "Invii la richiesta",
        body: "Ci indichi le date, il numero di ospiti, l’itinerario preferito e come desidera viaggiare.",
      },
      {
        title: "Riceva una proposta su misura",
        body: "Il nostro team costruisce con Lei un viaggio privato sul Nilo su misura per le Sue date, il Suo gruppo e le Sue priorità.",
      },
      {
        title: "Salga a bordo e si rilassi",
        body: "Arriverà su una dahabiya privata preparata solo per Lei. Dal primo caffè all’ultimo approdo, ogni dettaglio sarà già al suo posto.",
      },
    ],
    frontAlt: "Il ritmo lento della navigazione sul Nilo",
    backAlt: "Ospitalità dedicata a bordo di Hathor",
    celebrationAlt: "Una festa privata a bordo di Hathor",
  },
  trust: {
    kicker: "Fiducia e riservatezza",
    title: ["Prove", "discrete"],
    facts: [
      "Nessun altro ospite a bordo, privacy al 100%",
      "Equipaggio dedicato e chef privato",
      "Cabine, suite e Royal Suite",
      "Itinerari sul Nilo su misura",
    ],
    quotes: [
      {
        quote:
          "Abbiamo chiesto privacy e abbiamo trovato una casa galleggiante che ha capito il nostro ritmo. Niente di affrettato, tutto pensato con cura.",
        attribution: "A.M. · Charter in famiglia, Londra",
      },
      {
        quote:
          "L’itinerario si muoveva quando lo desideravamo noi. Templi alle prime luci, cena quando il fiume rinfrescava: tutto perfetto, dalla richiesta all’imbarco.",
        attribution: "R.K. · Ritiro aziendale",
      },
    ],
    photoAlt: "La vita a bordo di un charter privato di Hathor",
    askWhatsapp: "Ci scriva su WhatsApp",
  },
  epilogue: {
    eyebrow: "Concierge privato",
    lines: ["Il Suo viaggio,", "reinventato."],
    body:
      "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare il viaggio secondo il ritmo, la cucina e le escursioni a terra che preferisce.",
    scheduled: {
      before: "Viaggia in coppia o in un piccolo gruppo? Si unisca a una",
      link: "crociera sul Nilo in partenza programmata",
      after: "a bordo di Hathor.",
    },
    email: "E-mail",
    photoAlts: ["Cena privata a bordo di Hathor", "Charter privato di Hathor al tramonto sul Nilo"],
  },
  hours: "Orari: tutti i giorni 09:00 – 17:00",
  place: (name) => name.replace(/\b(Aswan|Cairo)\b/g, (stop) => PLACES_IT[stop] ?? stop),
  form: {
    eyebrow: "Concierge privato",
    title: "Charter privato in dahabiya",
    lead: "Richieda un charter privato: La contatteremo con un’offerta su misura.",
    tripTypes: { "One-Way": "Solo andata", "Round-Trip": "Andata e ritorno", "Multi-Stop": "Più tappe" },
    name: "Nome",
    email: "E-mail",
    phone: "Telefono",
    tripType: "Tipo di viaggio",
    departure: "Partenza",
    departurePlaceholder: "es. Luxor",
    destination: "Destinazione",
    destinationPlaceholder: "es. Assuan",
    startDate: "Data di partenza preferita",
    time: "Orario preferito",
    route: "Itinerario preferito",
    adults: "Passeggeri (adulti)",
    children: "Bambini",
    special: "Bagagli / esigenze particolari",
    specialPlaceholder: "Accessibilità, ricorrenze, esigenze alimentari…",
    message: "Messaggio",
    messagePlaceholder: "Ci racconti come desidera viaggiare…",
    errors: {
      name: "Inserisca il Suo nome.",
      nameChars: "Usi solo lettere, spazi, trattini o apostrofi.",
      email: "Inserisca un indirizzo e-mail valido.",
      phone: "Usi solo cifre, spazi e + ( ) -.",
      date: "Scelga una data a partire da oggi.",
      adults: "Indichi da 1 a 50 adulti.",
      children: "Indichi da 0 a 50 bambini.",
      check: "Controlli i campi evidenziati.",
      send: "Non è stato possibile inviare la richiesta.",
    },
    serverErrors: false,
    fallback: {
      lead: "I Suoi dati sono al sicuro: li invii direttamente al nostro team charter:",
      link: "invii la richiesta per e-mail",
    },
    sending: "Invio in corso…",
    send: "Invia la richiesta",
    success: {
      title: "Grazie.",
      body: "Abbiamo ricevuto la Sua richiesta di viaggio privato. Il nostro team charter preparerà una risposta su misura.",
      receipt: { before: "Una conferma è in arrivo all’indirizzo", after: ". Se non dovesse arrivare, scriva a" },
      noReceipt: {
        before: "Il nostro team ha ricevuto la Sua richiesta, ma non è stato possibile inviare una conferma a",
        after: ". Controlli l’indirizzo oppure scriva a",
        end: "per permetterci di contattarLa.",
      },
      again: "Invii un’altra richiesta",
    },
    languageNote: "Guest language: Italian",
  },
};

export const CHARTER_COPY: Record<PublicLocale, CharterCopy> = { en: EN, it: IT };
