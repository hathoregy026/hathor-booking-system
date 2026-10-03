/**
 * Terms & Conditions in every public language. English reads the live
 * content in lib/terms-and-conditions-content.ts; the page's own labels are
 * the live copy, character for character. Translations keep every section
 * id, so anchors and the contents index match across languages.
 *
 * The Italian text is a translation of the English terms and has not had a
 * legal review.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import {
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_TOC,
  type TermsSection,
  type TermsTocItem,
} from "@/lib/terms-and-conditions-content";

export type TermsCopy = {
  eyebrow: string;
  title: string;
  intro: readonly string[];
  toc: readonly TermsTocItem[];
  sections: readonly TermsSection[];
  /** The tax note: text, emphasised part, text. */
  vatNote: readonly [string, string, string];
  headOffice: string;
  address: readonly [string, string, string];
  telephone: string;
  email: string;
  website: string;
  /** The contents index: its landmark name and its visible heading. */
  tocLabel: string;
  tocTitle: string;
};

/* Section titles and text, in the order and with the ids of TERMS_SECTIONS. */
const SECTIONS_IT: readonly TermsSection[] = [
  {
    id: "booking-payment",
    number: 1,
    title: "Prenotazione e pagamento",
    paragraphs: [
      "Le prenotazioni devono essere effettuate in anticipo e sono confermate secondo il seguente calendario di pagamento:",
    ],
    list: [
      { emphasis: "Il 30% del valore totale della prenotazione è dovuto al momento della conferma.", text: "" },
      {
        emphasis:
          "Entro 60 giorni prima dell’imbarco, i pagamenti complessivi devono essere pari al 50% del valore totale della prenotazione.",
        text: "",
      },
      {
        emphasis: "Il saldo restante del 50% è dovuto 45 giorni prima dell’imbarco.",
        text: "",
      },
    ],
    paragraphsAfterList: [
      "Una prenotazione si considera confermata solo quando il pagamento iniziale richiesto è stato ricevuto e la prenotazione è stata accettata da Hathor Dahabiya.",
      "Il mancato completamento dei pagamenti richiesti entro le scadenze previste può comportare la cancellazione della prenotazione, secondo le condizioni di cancellazione riportate di seguito.",
    ],
  },
  {
    id: "cancellation-refunds",
    number: 2,
    title: "Cancellazione, mancata presentazione e rimborsi",
    paragraphs: [
      "Tutte le cancellazioni devono essere comunicate per iscritto.",
      "Si applicano le seguenti penali di cancellazione:",
    ],
    list: [
      { emphasis: "90 giorni o più prima dell’imbarco:", text: " nessuna penale." },
      {
        emphasis: "Da 61 a 89 giorni prima dell’imbarco:",
        text: " 25% del valore totale della prenotazione.",
      },
      {
        emphasis: "Da 46 a 60 giorni prima dell’imbarco:",
        text: " 50% del valore totale della prenotazione.",
      },
      {
        emphasis: "45 giorni o meno prima dell’imbarco:",
        text: " 100% del valore totale della prenotazione.",
      },
      {
        emphasis: "Mancata presentazione o partenza anticipata:",
        text: " 100% del valore totale della prenotazione.",
      },
    ],
    paragraphsAfterList: [
      "Una volta iniziato il viaggio, non è previsto alcun rimborso per pasti, notti o altre parti del viaggio prenotato non usufruite.",
      "Qualora sia dovuto un rimborso in base al calendario di cancellazione sopra indicato, l’importo rimborsabile sarà calcolato dopo l’applicazione della relativa penale al valore totale della prenotazione.",
    ],
  },
  {
    id: "children-policy",
    number: 3,
    title: "Politica per i bambini",
    paragraphs: ["Ai bambini si applica la tariffa per adulti."],
  },
  {
    id: "pets-policy",
    number: 4,
    title: "Politica sugli animali domestici",
    paragraphs: ["Non sono ammessi animali domestici a bordo di Hathor Dahabiya."],
  },
  {
    id: "inclusions",
    number: 5,
    title: "Servizi inclusi",
    paragraphs: [
      "Salvo diversa indicazione nell’itinerario o nella prenotazione confermati, il pacchetto di viaggio Hathor comprende:",
    ],
    list: [
      { text: "Formula Soft All-Inclusive." },
      {
        text: "Tre pasti al giorno, a partire dal pranzo del giorno d’imbarco fino alla colazione del giorno di sbarco.",
      },
      { text: "Tè, caffè, bibite analcoliche e succhi freschi." },
      { text: "Le visite incluse nell’itinerario scelto." },
      { text: "Trasporti e trasferimenti inclusi nel pacchetto scelto." },
      { text: "Tasse e costi di servizio applicabili." },
      { text: "Personale di crociera professionale." },
      {
        text: "Un calice di Champagne di benvenuto in omaggio per ogni cabina e suite, servito una sola volta per soggiorno.",
      },
    ],
  },
  {
    id: "exclusions",
    number: 6,
    title: "Servizi esclusi",
    paragraphs: [
      "Salvo ove espressamente inclusi nell’itinerario o nella prenotazione confermati, sono esclusi:",
    ],
    list: [
      { text: "Escursioni facoltative non incluse nell’itinerario." },
      { text: "Spese personali." },
      { text: "Mance." },
      {
        text: "Bevande alcoliche, locali o internazionali, a eccezione del calice di Champagne di benvenuto in omaggio, servito una sola volta per soggiorno per ogni cabina e suite.",
      },
    ],
  },
  {
    id: "taxes-service",
    number: 7,
    title: "Tasse e costi di servizio",
    paragraphs: [
      "Il prezzo pubblicato della dahabiya include le tasse e i costi di servizio applicabili.",
    ],
    variant: "vat-note",
  },
  {
    id: "company-responsibility",
    number: 8,
    title: "Responsabilità della società",
    paragraphs: ["Hathor Dahabiya si assume la responsabilità di:"],
    list: [
      {
        text: "Fornire cibi e bevande preparati nel rispetto delle norme sanitarie, igieniche e di sicurezza applicabili.",
      },
      {
        text: "Mantenere la pulizia e l’igiene delle cabine, delle aree comuni e delle strutture di bordo.",
      },
      {
        text: "Gestire la dahabiya nel rispetto delle normative egiziane applicabili in materia marittima, turistica e sanitaria.",
      },
    ],
    paragraphsAfterList: [
      "Tale responsabilità è limitata ai servizi forniti a bordo di Hathor Dahabiya e non si estende a fattori esterni al di fuori del ragionevole controllo della società.",
    ],
  },
  {
    id: "health-medical-dietary",
    number: 9,
    title: "Salute, condizioni mediche ed esigenze alimentari",
    paragraphs: [
      "Gli ospiti sono tenuti a comunicare prima della partenza eventuali condizioni mediche, allergie, restrizioni alimentari o particolari esigenze di salute.",
      "Hathor Dahabiya non potrà essere ritenuta responsabile per malattie, lesioni o complicazioni mediche derivanti da:",
    ],
    list: [
      { text: "Condizioni mediche non comunicate." },
      { text: "Mancato rispetto delle istruzioni di sicurezza o delle indicazioni dell’equipaggio." },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya si riserva il diritto di negare la partecipazione ad attività o servizi qualora le condizioni di un ospite possano rappresentare un rischio per sé stesso, per gli altri ospiti o per i membri dell’equipaggio, senza diritto a rimborsi o indennizzi.",
    ],
  },
  {
    id: "weather-natural-events",
    number: 10,
    title: "Condizioni meteorologiche ed eventi naturali",
    paragraphs: [
      "Hathor Dahabiya non sarà responsabile per ritardi, modifiche dell’itinerario, cambi di rotta o cancellazioni causati da condizioni meteorologiche avverse, inclusi, a titolo esemplificativo e non esaustivo, vento, nebbia, tempeste o variazioni del livello delle acque del Nilo.",
      "Qualsiasi disservizio derivante da circostanze naturali o ambientali qualificabili come forza maggiore non darà diritto a rimborsi, indennizzi o pretese di alcun genere, salvo ove previsto dalla legge applicabile.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Normative, ispezioni e autorità governative",
    paragraphs: [
      "Hathor Dahabiya non sarà responsabile per ritardi, interruzioni, cambi di rotta o cancellazioni derivanti da:",
    ],
    list: [
      { text: "Ispezioni disposte dalle autorità." },
      { text: "Controlli di sicurezza." },
      {
        text: "Decisioni, restrizioni o provvedimenti imposti dalle autorità governative o di regolamentazione egiziane.",
      },
    ],
    paragraphsAfterList: [
      "Tali circostanze non danno diritto a rimborsi, indennizzi o pretese, salvo ove previsto dalla legge applicabile.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Modifiche all’itinerario e adeguamenti operativi",
    paragraphs: [
      "Hathor Dahabiya si riserva il diritto di modificare itinerari, orari, punti di attracco o servizi qualora lo ritenga necessario per ragioni operative, di navigazione o di sicurezza.",
      "A discrezione della società potranno essere offerti servizi o attività sostitutivi di valore equivalente.",
      "Tali modifiche non costituiscono inadempimento contrattuale e non danno diritto a rimborsi o indennizzi, salvo ove previsto dalla legge applicabile.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Cancellazioni da parte della società",
    paragraphs: [
      "In casi eccezionali di forza maggiore o di necessità operativa, Hathor Dahabiya si riserva il diritto di cancellare il viaggio.",
      "La società potrà, a sua esclusiva discrezione, offrire:",
    ],
    list: [
      { text: "Una nuova data di partenza; oppure" },
      { text: "Un voucher di credito non rimborsabile da utilizzare in futuro." },
    ],
    paragraphsAfterList: [
      "I rimborsi in denaro non sono garantiti, salvo ove previsto dalla legge applicabile.",
    ],
  },
  {
    id: "force-majeure",
    number: 14,
    title: "Forza maggiore",
    paragraphs: [
      "Hathor Dahabiya non sarà responsabile per il mancato o ritardato adempimento dei propri obblighi dovuto a eventi al di fuori del suo ragionevole controllo, inclusi, a titolo esemplificativo e non esaustivo:",
    ],
    list: [
      { text: "Calamità naturali." },
      { text: "Provvedimenti o restrizioni governative." },
      { text: "Epidemie o pandemie." },
      { text: "Chiusure della navigazione fluviale." },
      { text: "Situazioni legate alla sicurezza." },
      {
        text: "Altre circostanze naturali, ambientali od operative al di fuori del ragionevole controllo della società.",
      },
    ],
  },
  {
    id: "guest-conduct",
    number: 15,
    title: "Condotta e responsabilità degli ospiti",
    paragraphs: [
      "Gli ospiti sono tenuti a rispettare tutte le regole di bordo, i membri dell’equipaggio, gli altri ospiti e i beni di bordo.",
      "Eventuali danni, perdite o comportamenti scorretti causati da un ospite potranno essere addebitati al responsabile.",
      "Hathor Dahabiya si riserva il diritto di interrompere il viaggio di qualsiasi ospite il cui comportamento sia ritenuto pericoloso, molesto o inappropriato, senza rimborso né indennizzo.",
    ],
  },
  {
    id: "personal-property",
    number: 16,
    title: "Effetti personali",
    paragraphs: [
      "Hathor Dahabiya non si assume alcuna responsabilità per la perdita, il furto o il danneggiamento di effetti personali a bordo o durante le escursioni, salvo nei casi in cui la responsabilità non possa essere esclusa per legge.",
      "Si consiglia agli ospiti di custodire sempre con cura i propri oggetti di valore.",
    ],
  },
  {
    id: "limitation-liability",
    number: 17,
    title: "Limitazione di responsabilità",
    paragraphs: [
      "La responsabilità di Hathor Dahabiya è limitata all’importo pagato per i servizi prenotati, salvo ove tale limitazione sia vietata dalla legge applicabile.",
      "Nella misura massima consentita dalla legge, Hathor Dahabiya non sarà responsabile per danni indiretti, incidentali o consequenziali.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Legge applicabile e foro competente",
    paragraphs: [
      "I presenti Termini e condizioni sono regolati e interpretati in conformità alle leggi della Repubblica Araba d’Egitto.",
      "Qualsiasi controversia sarà soggetta alla giurisdizione esclusiva dei tribunali egiziani, salvo ove la legge applicabile disponga diversamente.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Accettazione dei termini",
    paragraphs: [
      "Con la conferma di una prenotazione, l’ospite riconosce, accetta e si impegna a rispettare i presenti Termini e condizioni.",
      "Qualora una prenotazione sia effettuata per conto di più ospiti, la persona che effettua la prenotazione è responsabile di informare tutti i membri del gruppo di viaggio dei Termini e condizioni applicabili.",
    ],
  },
  {
    id: "contact",
    number: 20,
    title: "Contatti",
    paragraphs: [
      "Per domande relative a una prenotazione o ai presenti Termini e condizioni, La invitiamo a contattare Hathor Dahabiya.",
    ],
    variant: "contact",
  },
];

const TOC_IT: Record<string, string> = {
  "booking-payment": "Prenotazione e pagamento",
  "cancellation-refunds": "Cancellazione, mancata presentazione e rimborsi",
  "children-policy": "Bambini",
  "pets-policy": "Animali domestici",
  inclusions: "Servizi inclusi",
  exclusions: "Servizi esclusi",
  "taxes-service": "Tasse e costi di servizio",
  "company-responsibility": "Responsabilità della società",
  "health-medical-dietary": "Salute, condizioni mediche ed esigenze alimentari",
  "weather-natural-events": "Condizioni meteorologiche ed eventi naturali",
  "government-regulations": "Normative, ispezioni e autorità governative",
  "itinerary-changes": "Modifiche all’itinerario e adeguamenti operativi",
  "company-cancellations": "Cancellazioni da parte della società",
  "force-majeure": "Forza maggiore",
  "guest-conduct": "Condotta e responsabilità degli ospiti",
  "personal-property": "Effetti personali",
  "limitation-liability": "Limitazione di responsabilità",
  "governing-law": "Legge applicabile e foro competente",
  acceptance: "Accettazione dei termini",
  contact: "Contatti",
};

export const TERMS_COPY: Record<PublicLocale, TermsCopy> = {
  en: {
    eyebrow: "Guest Information",
    title: "Terms & Conditions",
    intro: TERMS_INTRO,
    toc: TERMS_TOC,
    sections: TERMS_SECTIONS,
    vatNote: [
      "The client-supplied Terms & Conditions state that this includes ",
      "14% VAT and service charge",
      ".",
    ],
    headOffice: "Head Office",
    address: ["One Kattameya, Tower No. 211, Floor No. 11", "Ring Road, Nasr City", "Cairo, Egypt"],
    telephone: "Telephone:",
    email: "Email:",
    website: "Website:",
    tocLabel: "On this page",
    tocTitle: "On This Page",
  },
  it: {
    eyebrow: "Informazioni per gli ospiti",
    title: "Termini e condizioni",
    intro: [
      "I presenti Termini e condizioni stabiliscono le regole di prenotazione, pagamento, viaggio e permanenza a bordo, nonché le politiche per gli ospiti, che si applicano ai viaggi a bordo di Hathor Dahabiya.",
      "Hathor organizza crociere di lusso sul Nilo tra Luxor e Assuan, comprese esperienze in charter privato e con partenze condivise. Con la conferma di una prenotazione, ciascun ospite riconosce e accetta di essere vincolato dai Termini e condizioni applicabili, riportati di seguito.",
    ],
    toc: TERMS_TOC.map((item) => ({ id: item.id, label: TOC_IT[item.id] ?? item.label })),
    sections: SECTIONS_IT,
    vatNote: [
      "Secondo i Termini e condizioni forniti dal cliente, ciò include ",
      "IVA al 14% e costo del servizio",
      ".",
    ],
    headOffice: "Sede principale",
    address: ["One Kattameya, Torre 211, 11º piano", "Ring Road, Nasr City", "Il Cairo, Egitto"],
    telephone: "Telefono:",
    email: "E-mail:",
    website: "Sito web:",
    tocLabel: "In questa pagina",
    tocTitle: "In questa pagina",
  },
};
