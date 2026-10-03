/**
 * The Partners page's own words (not dashboard text) in every public
 * language. English is the live copy, character for character. Partner
 * names are brands and stay as they are.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

type Circle = { role: string; region: string; note: string };

export type PartnersCopy = {
  runLabel: string;
  spineLabel: string;
  names: string;
  scroll: string;
  navLabel: string;
  nav: readonly [string, string, string, string];
  artLabel: string;
  alts: {
    portrait: string;
    river: string;
    legacy: string;
    cabin: string;
    dining: string;
    deck: string;
    living: string;
    fineDining: string;
    restaurant: string;
    atmosphere: string;
    wine: string;
    amenity: string;
    craft: string;
    highlights: string;
    wheel: string;
    royal: string;
    card: string;
    /** The photographic wash; empty keeps the image's own description. */
    wash: string;
  };
  partnerAlt: (name: string) => string;
  aboard: string;
  route: string;
  covenant: readonly [string, string, string, string];
  leadFallback: string;
  orbitTitle: string;
  orbitBody: string;
  circle: readonly [Circle, Circle, Circle, Circle];
  craft: readonly [string, string, string];
  craftBody: string;
  datum: { tl: string; tr: string; one: string; bl: string; br: string };
  bridge: readonly [string, string];
  epilogue: readonly [string, string, string];
  statement: string;
  contactHathor: string;
  bookVoyage: string;
  epilogueMeta: string;
  cardTitle: string;
  cardBody: readonly [string, string];
  aboutHathor: string;
  writeToUs: string;
};

export const PARTNERS_COPY: Record<PublicLocale, PartnersCopy> = {
  en: {
    runLabel: "Hathor travel and hospitality partners",
    spineLabel: "Partner index",
    names: "names",
    scroll: "Scroll",
    navLabel: "Partners page sections",
    nav: ["Circle", "Craft", "Converse", "Contact"],
    artLabel: "In Distinguished Company",
    alts: {
      portrait: "Hathor Dahabiya on the Nile",
      river: "Hathor on the river",
      legacy: "Legacy on the Nile",
      cabin: "Cabin aboard Hathor",
      dining: "Dining aboard Hathor",
      deck: "Life on deck aboard Hathor",
      living: "Living spaces aboard Hathor",
      fineDining: "Fine dining aboard Hathor",
      restaurant: "Restaurant aboard Hathor Dahabiya",
      atmosphere: "Dining atmosphere aboard Hathor",
      wine: "Wine service aboard Hathor",
      amenity: "Amenity detail aboard Hathor",
      craft: "Craft and care aboard Hathor",
      highlights: "Nile highlights from Hathor",
      wheel: "Wheel and river aboard Hathor",
      royal: "Royal Suite aboard Hathor",
      card: "Hathor Dahabiya on the Nile",
      wash: "",
    },
    partnerAlt: (name) => `${name} — Hathor partnership`,
    aboard: "Aboard",
    route: "Luxor — Aswan",
    covenant: ["Shared standards", "A private circle", "of trusted names", "on the Nile"],
    leadFallback:
      "We sail with trusted names in travel and hospitality, partners who share our care for the Nile and our guests.",
    orbitTitle: "Trusted worldwide",
    orbitBody: "Four partners. One standard of care for every Hathor guest.",
    circle: [
      {
        role: "Trade",
        region: "Egypt",
        note: "Destination craft and Nile itineraries shaped with local precision.",
      },
      {
        role: "Global",
        region: "Reservations",
        note: "Worldwide discovery that brings travellers to an intimate Dahabiya.",
      },
      {
        role: "Worldwide",
        region: "Discovery",
        note: "A considered path from first search to a voyage on the river.",
      },
      {
        role: "Luxury",
        region: "Concierge",
        note: "Hospitality standards aligned with Hathor's quiet, personal care.",
      },
    ],
    craft: ["Hospitality craft", "Care that travels", "with every booking"],
    craftBody:
      "From first enquiry to the last morning on deck, our partners uphold the same quiet precision guests meet aboard Hathor.",
    datum: {
      tl: "Partners",
      tr: "Egypt & beyond",
      one: "One",
      bl: "Hathor circle",
      br: "Shared standard",
    },
    bridge: ["Travel, thoughtfully", "connected."],
    epilogue: ["Begin a conversation", "Collaborate with", "Hathor"],
    statement:
      "For collaborations, representation, and considered travel partnerships, speak with the Hathor team in Cairo.",
    contactHathor: "Contact Hathor",
    bookVoyage: "Book a voyage",
    epilogueMeta: "Representation and trade enquiries · Cairo office",
    cardTitle: "Partner circle",
    cardBody: ["Trusted names who share", "our care for every guest"],
    aboutHathor: "About Hathor",
    writeToUs: "Write to us",
  },
  it: {
    runLabel: "I partner di Hathor nel viaggio e nell’ospitalità",
    spineLabel: "Indice dei partner",
    names: "nomi",
    scroll: "Scorri",
    navLabel: "Sezioni della pagina",
    nav: ["Cerchia", "Accoglienza", "Dialogo", "Contatti"],
    artLabel: "In compagnia illustre",
    alts: {
      portrait: "Hathor Dahabiya sul Nilo",
      river: "Hathor sul fiume",
      legacy: "Una storia sul Nilo",
      cabin: "Una cabina a bordo di Hathor",
      dining: "La cucina a bordo di Hathor",
      deck: "La vita sul ponte di Hathor",
      living: "Gli spazi comuni a bordo di Hathor",
      fineDining: "Alta cucina a bordo di Hathor",
      restaurant: "Il ristorante a bordo di Hathor Dahabiya",
      atmosphere: "L’atmosfera della sala da pranzo a bordo di Hathor",
      wine: "Il servizio dei vini a bordo di Hathor",
      amenity: "Un dettaglio dei servizi a bordo di Hathor",
      craft: "Cura e maestria a bordo di Hathor",
      highlights: "Le meraviglie del Nilo viste da Hathor",
      wheel: "Il timone e il fiume a bordo di Hathor",
      royal: "La Royal Suite a bordo di Hathor",
      card: "Hathor Dahabiya sul Nilo",
      wash: "Hathor Dahabiya sul Nilo all’ora dorata",
    },
    partnerAlt: (name) => `${name}, partner di Hathor`,
    aboard: "A bordo",
    route: "Luxor — Assuan",
    covenant: ["Standard condivisi", "Una cerchia privata", "di nomi fidati", "sul Nilo"],
    leadFallback:
      "Navighiamo con nomi di fiducia del viaggio e dell’ospitalità: partner che condividono la nostra cura per il Nilo e per i nostri ospiti.",
    orbitTitle: "Fiducia nel mondo",
    orbitBody: "Quattro partner. Un’unica cura per ogni ospite di Hathor.",
    circle: [
      {
        role: "Operatore",
        region: "Egitto",
        note: "Conoscenza della destinazione e itinerari sul Nilo costruiti con precisione locale.",
      },
      {
        role: "Globale",
        region: "Prenotazioni",
        note: "Una vetrina mondiale che porta i viaggiatori a bordo di una dahabiya intima.",
      },
      {
        role: "Nel mondo",
        region: "Scoperta",
        note: "Un percorso curato, dalla prima ricerca al viaggio sul fiume.",
      },
      {
        role: "Lusso",
        region: "Concierge",
        note: "Standard di ospitalità in sintonia con la cura discreta e personale di Hathor.",
      },
    ],
    /* Kept short: longer lines spill out of the scene at 1920. */
    craft: ["L’arte di accogliere", "Una cura che segue", "ogni prenotazione"],
    craftBody:
      "Dalla prima richiesta all’ultima mattina sul ponte, i nostri partner mantengono la stessa quieta precisione che gli ospiti trovano a bordo di Hathor.",
    datum: {
      tl: "Partner",
      tr: "Egitto e oltre",
      one: "Uno",
      bl: "La cerchia Hathor",
      br: "Standard comune",
    },
    bridge: ["Viaggi legati", "con cura."],
    epilogue: ["Iniziamo un dialogo", "Collabori con", "Hathor"],
    statement:
      "Per collaborazioni, rappresentanza e partnership di viaggio ben ponderate, si rivolga al team Hathor al Cairo.",
    contactHathor: "Contatti Hathor",
    bookVoyage: "Prenoti un viaggio",
    epilogueMeta: "Rappresentanza e richieste dal settore · Ufficio del Cairo",
    cardTitle: "La cerchia dei partner",
    cardBody: ["Nomi fidati che condividono", "la nostra cura per ogni ospite"],
    aboutHathor: "Chi è Hathor",
    writeToUs: "Ci scriva",
  },
};
