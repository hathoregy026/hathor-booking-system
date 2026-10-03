/**
 * The Highlights page's own words (not dashboard text) in every public
 * language. English reads the live constants in lib/highlights-content.ts
 * where the page does; the rest is the live copy, character for character.
 *
 * The English page splits the dashboard intro with English keywords and
 * pulls its quote with an English pattern, so a translation supplies its
 * intro already split (`intro`), translated from what that logic produces
 * from the live text.
 */

import {
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_MANIFESTO,
  HIGHLIGHTS_PRINCIPLES,
} from "@/lib/highlights-content";
import type { PublicLocale } from "@/lib/i18n/locale";

type Landmark = { category: string; location: string; caption: string; title: string };
type Beat = { title: string; text: string };
type Rhythm = { word: string; label: string; value: string; meta: string };
type Note = { title: string; body: string };
type Journey = { label: string; body: string };

export type HighlightsCopy = {
  runLabel: string;
  navLabel: string;
  nav: readonly [string, string, string, string];
  scroll: string;
  /** Pre-split intro for translations; null runs the English logic on the dashboard text. */
  intro: { lead: string; collage: string; quote: string } | null;
  alts: {
    guests: string;
    lead: string;
    hatshepsut: string;
    obelisk: string;
    rhythm: string;
    deck: string;
    life: string;
    sailing: string;
    sunset: string;
    valley: string;
    royal: string;
    card: string;
  };
  aboardAlt: (title: string) => string;
  /** The three notes' peek images. */
  noteAlt: (title: string) => string;
  /** The life-aboard back images; null keeps each image's own description. */
  aboardBackAlts: readonly [string, string, string] | null;
  leadCaption: string;
  manifesto: readonly [string, string, string];
  slidesLabel: string;
  ashore: string;
  ashoreBody: string;
  slidesIndex: readonly [string, string, string];
  notesTitle: string;
  notesBody: string;
  notes: readonly [Note, Note, Note];
  landmarks: readonly [Landmark, Landmark, Landmark];
  theVoyage: string;
  aboardTitle: string;
  aboardBody: string;
  life: readonly [Beat, Beat, Beat];
  exploreDining: string;
  rhythmTitle: string;
  rhythmBody: string;
  rhythm: readonly [Rhythm, Rhythm, Rhythm, Rhythm];
  closing: string;
  epilogue: readonly [string, string];
  statement: string;
  bookNow: string;
  privateCharter: string;
  journeys: readonly [Journey, Journey, Journey];
  cardTitle: string;
  cardBody: readonly [string, string];
  exploreCruises: string;
};

const [OBELISK, HATSHEPSUT, VALLEY] = HIGHLIGHTS_LANDMARK_META;
const [J1, J2, J3] = HIGHLIGHTS_JOURNEY_LINKS;

export const HIGHLIGHTS_COPY: Record<PublicLocale, HighlightsCopy> = {
  en: {
    runLabel: "Hathor cruise highlights",
    navLabel: "Highlights page sections",
    nav: ["Highlights", "Landmarks", "Aboard", "Reserve"],
    scroll: "Scroll",
    intro: null,
    alts: {
      guests: "Guests aboard the Hathor Dahabiya",
      lead: "Hathor Dahabiya highlights on the Nile",
      hatshepsut: "Temple of Hatshepsut",
      obelisk: "Unfinished Obelisk, Aswan",
      rhythm: "River rhythm aboard Hathor",
      deck: "Private deck living",
      life: "Life aboard Hathor",
      sailing: "Sailing the Nile aboard Hathor",
      sunset: "Sunset aboard Hathor",
      valley: "Valley of the Kings",
      royal: "Royal suite aboard Hathor",
      card: "Hathor Dahabiya on the Nile",
    },
    aboardAlt: (title) => `${title} aboard Hathor`,
    noteAlt: (title) => `${title} aboard Hathor`,
    aboardBackAlts: null,
    leadCaption: "Nile · Luxor — Aswan",
    manifesto: ["First light", "Cruise in true elegance", "on the Nile"],
    slidesLabel: "Shore landmarks",
    ashore: "Ashore",
    ashoreBody:
      "Three shores — the voyage is paced by stone: quarry, terrace, and valley — each revealed as the river gives it up.",
    slidesIndex: ["Obelisk", "Hatshepsut", "Valley"],
    notesTitle: "Three notes",
    notesBody: "The river, the landmarks, and the return — the grammar of a Hathor voyage.",
    notes: [
      { title: HIGHLIGHTS_MANIFESTO[0].title, body: HIGHLIGHTS_PRINCIPLES[0].body },
      { title: HIGHLIGHTS_MANIFESTO[1].title, body: HIGHLIGHTS_PRINCIPLES[1].body },
      { title: HIGHLIGHTS_MANIFESTO[2].title, body: HIGHLIGHTS_PRINCIPLES[2].body },
    ],
    landmarks: [
      { category: OBELISK!.category, location: OBELISK!.location, caption: OBELISK!.caption, title: "Obelisk" },
      { category: HATSHEPSUT!.category, location: HATSHEPSUT!.location, caption: HATSHEPSUT!.caption, title: "Hatshepsut" },
      { category: VALLEY!.category, location: VALLEY!.location, caption: VALLEY!.caption, title: "Valley" },
    ],
    theVoyage: "The voyage",
    aboardTitle: "Life aboard",
    aboardBody: "The return each day",
    life: [
      {
        title: "Dining",
        text: "Egyptian flavours and international craft: breakfast light, lunches that linger, candlelit dinners under the stars.",
      },
      {
        title: "Suite",
        text: "Cabins and royal suites composed for Nile light: private quarters after every day of discovery.",
      },
      {
        title: "Deck",
        text: "Sun, soft current, and the quiet theatre of the river: a sanctuary waiting after every shore.",
      },
    ],
    exploreDining: "Explore dining",
    rhythmTitle: "River rhythm",
    rhythmBody: "Light changes. The day answers — dawn to night aboard Hathor.",
    rhythm: [
      {
        word: "Dawn",
        label: "Silver water",
        value: "The Nile wakes slowly. Mist lifts from the banks while coffee finds the softest corner of the deck.",
        meta: "First light",
      },
      {
        word: "Noon",
        label: "Heat held away",
        value: "Shade, cool interiors, and unhurried passage between temples and quiet villages.",
        meta: "Midday",
      },
      {
        word: "Gold",
        label: "Stone warmed",
        value: "Landmarks catch amber light. The river turns copper. Time stretches.",
        meta: "Golden hour",
      },
      {
        word: "Night",
        label: "Lanterns",
        value: "When the shore dissolves, Hathor becomes a sealed world of soft music and slow conversation.",
        meta: "After dark",
      },
    ],
    closing: "Sail with Hathor",
    epilogue: ["Continue the", "voyage"],
    statement:
      "Reserve a scheduled sailing, or charter the entire Dahabiya for your party alone.",
    bookNow: "Book Now",
    privateCharter: "Private charter",
    journeys: [
      { label: J1.label, body: J1.body },
      { label: J2.label, body: J2.body },
      { label: J3.label, body: J3.body },
    ],
    cardTitle: "Nile voyage",
    cardBody: ["Ancient landmarks", "private river living"],
    exploreCruises: "Explore cruises",
  },
  it: {
    runLabel: "I momenti salienti della crociera Hathor",
    navLabel: "Sezioni della pagina",
    nav: ["Da non perdere", "Monumenti", "A bordo", "Prenota"],
    scroll: "Scorri",
    intro: {
      lead: "Si immerga nel fascino misterioso del Nilo a bordo della crociera Hathor Dahabiya, una crociera di lusso in dahabiya sul Nilo, in Egitto, che offre la più maestosa esperienza di navigazione egiziana, pensata per chi cerca eleganza, comfort e un ricco tocco di storia.",
      collage:
        "Spazi privati: con 8 cabine e 4 suite in tutto, di cui 2 Royal, la nostra dahabiya Hathor garantisce la massima privacy insieme a un’ospitalità calda ed elegante, ed è la scelta perfetta per una crociera in dahabiya da Assuan a Luxor. Questa nave elegante scivola dolcemente lungo il fiume, per una navigazione rilassata che permette agli ospiti di godersi panorami sereni e scoprire tesori nascosti lontano dalla folla.",
      quote: "Non c’è dettaglio, per quanto piccolo, che venga trascurato.",
    },
    alts: {
      guests: "Ospiti a bordo di Hathor Dahabiya",
      lead: "I momenti più belli di Hathor Dahabiya sul Nilo",
      hatshepsut: "Il Tempio di Hatshepsut",
      obelisk: "L’Obelisco Incompiuto, Assuan",
      rhythm: "Il ritmo del fiume a bordo di Hathor",
      deck: "La vita privata sul ponte",
      life: "La vita a bordo di Hathor",
      sailing: "In navigazione sul Nilo a bordo di Hathor",
      sunset: "Il tramonto a bordo di Hathor",
      valley: "La Valle dei Re",
      royal: "Una Royal Suite a bordo di Hathor",
      card: "Hathor Dahabiya sul Nilo",
    },
    aboardAlt: (title) => `${title} a bordo di Hathor`,
    noteAlt: (title) => `${title}: un viaggio con Hathor`,
    aboardBackAlts: [
      "Il ponte privato riservato al Suo gruppo",
      "Una Luxury Suite a bordo di Hathor Dahabiya",
      "Il viaggio Nile Majesty a bordo di Hathor",
    ],
    leadCaption: "Nilo · Luxor — Assuan",
    manifesto: ["Prima luce", "Navigare con eleganza", "sul Nilo"],
    slidesLabel: "Monumenti a terra",
    ashore: "A terra",
    ashoreBody:
      "Tre approdi: il viaggio segue il ritmo della pietra (la cava, la terrazza, la valle), ognuno svelato quando il fiume lo concede.",
    slidesIndex: ["Obelisco", "Hatshepsut", "Valle"],
    notesTitle: "Tre note",
    notesBody: "Il fiume, i monumenti e il ritorno: la grammatica di un viaggio con Hathor.",
    notes: [
      {
        title: "Il fiume",
        body: "Una navigazione intima in dahabiya, con cabine e suite pensate per la luce del Nilo e un’ospitalità senza fretta.",
      },
      {
        title: "I monumenti",
        body: "Le meraviglie antiche visitate con calma, seguite dalla quiete del fiume a bordo di Hathor.",
      },
      {
        title: "Il ritorno",
        body: "Cucina, riposo e servizio seguono con naturalezza il ritmo tra Luxor e Assuan.",
      },
    ],
    landmarks: [
      {
        category: "Monumento culturale",
        location: "Assuan",
        caption: "La cava dell’Obelisco Incompiuto, Assuan",
        title: "Obelisco",
      },
      {
        category: "Monumento culturale",
        location: "Riva occidentale di Luxor · Deir el-Bahari",
        caption: "Il tempio funerario di Hatshepsut",
        title: "Hatshepsut",
      },
      {
        category: "Patrimonio UNESCO",
        location: "Riva occidentale di Luxor",
        caption: "La Valle dei Re, Luxor",
        title: "Valle",
      },
    ],
    theVoyage: "Il viaggio",
    aboardTitle: "La vita a bordo",
    aboardBody: "Il ritorno, ogni giorno",
    life: [
      {
        title: "Cucina",
        text: "Sapori egiziani e arte internazionale: colazioni leggere, pranzi senza fretta, cene a lume di candela sotto le stelle.",
      },
      {
        title: "Suite",
        text: "Cabine e Royal Suite pensate per la luce del Nilo: spazi privati dopo ogni giornata di scoperte.",
      },
      {
        title: "Ponte",
        text: "Sole, corrente leggera e il quieto spettacolo del fiume: un rifugio che La attende dopo ogni approdo.",
      },
    ],
    exploreDining: "Scopra la cucina",
    rhythmTitle: "Il ritmo del fiume",
    rhythmBody: "La luce cambia e la giornata risponde: dall’alba alla notte a bordo di Hathor.",
    rhythm: [
      {
        word: "Alba",
        label: "Acqua d’argento",
        value: "Il Nilo si sveglia piano. La foschia si alza dalle rive mentre il caffè trova l’angolo più morbido del ponte.",
        meta: "Prima luce",
      },
      {
        word: "Mezzodì",
        label: "Il caldo tenuto lontano",
        value: "Ombra, interni freschi e una navigazione senza fretta tra templi e villaggi tranquilli.",
        /* The time column is narrow; "Mezzogiorno" breaks mid-word there. */
        meta: "Pieno giorno",
      },
      {
        word: "Oro",
        label: "La pietra si scalda",
        value: "I monumenti si accendono di luce ambrata. Il fiume si fa rame. Il tempo si dilata.",
        meta: "Ora dorata",
      },
      {
        word: "Notte",
        label: "Lanterne",
        value: "Quando la riva svanisce, Hathor diventa un mondo a sé, fatto di musica soffusa e conversazioni lente.",
        meta: "Dopo il tramonto",
      },
    ],
    closing: "Navighi con Hathor",
    epilogue: ["Continui il", "viaggio"],
    statement:
      "Prenoti una partenza programmata, oppure noleggi l’intera dahabiya solo per il Suo gruppo.",
    bookNow: "Prenota ora",
    privateCharter: "Charter privato",
    journeys: [
      { label: "Luxor → Assuan", body: "Monumenti antichi e tranquilli villaggi sul fiume." },
      { label: "Assuan → Luxor", body: "Una traversata da sud a nord nella storia viva del Nilo." },
      { label: "Charter privato", body: "Un itinerario pensato intorno al Suo gruppo." },
    ],
    cardTitle: "Viaggio sul Nilo",
    cardBody: ["Monumenti antichi", "vita privata sul fiume"],
    exploreCruises: "Scopra le crociere",
  },
};
