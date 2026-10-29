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
          "Entro 60 giorni prima dell’imbarco, i pagamenti complessivi devono raggiungere almeno il 50% del valore totale della prenotazione.",
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
      "Una volta iniziato il viaggio, non è previsto alcun rimborso per pasti, notti o altre parti del viaggio prenotato di cui l’ospite sceglie di non usufruire.",
      "Qualora sia dovuto un rimborso in base al calendario di cancellazione sopra indicato, l’importo rimborsabile sarà calcolato dopo l’applicazione della relativa penale al valore totale della prenotazione.",
      "Non si applica alcuna penale se circostanze inevitabili e straordinarie verificatesi nel luogo di destinazione o nelle sue immediate vicinanze, come la chiusura del Nilo alla navigazione o una grave situazione di sicurezza, incidono in modo significativo sul viaggio. In tal caso Hathor Dahabiya rimborsa integralmente tutti i pagamenti effettuati entro 14 giorni, senza ulteriori indennizzi.",
      "L’ospite può cedere la prenotazione a un’altra persona che soddisfi tutte le condizioni del viaggio, informandone Hathor Dahabiya per iscritto almeno 7 giorni prima dell’imbarco. L’ospite originario e il nuovo ospite rispondono in solido del saldo ancora dovuto e degli eventuali costi aggiuntivi ragionevoli della cessione, che Hathor Dahabiya indicherà e giustificherà.",
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
      {
        text: "Formula Soft All-Inclusive, che comprende tutti i pasti e le bevande analcoliche (tè, caffè, bibite e succhi freschi); le bevande alcoliche non sono incluse (vedere Servizi esclusi).",
      },
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
    paragraphs: [
      "Hathor Dahabiya è responsabile dell’esecuzione di tutti i servizi turistici inclusi nella prenotazione confermata, compresi i trasferimenti e le visite, sia che siano forniti da Hathor Dahabiya sia che siano forniti dai suoi partner.",
      "In particolare, Hathor Dahabiya si assume la responsabilità di:",
    ],
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
      "Tale responsabilità non si estende ai servizi che l’ospite organizza autonomamente e che non fanno parte della prenotazione confermata.",
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
      "Condizioni meteorologiche avverse, inclusi, a titolo esemplificativo e non esaustivo, vento, nebbia, tempeste o variazioni del livello delle acque del Nilo, possono causare ritardi, modifiche dell’itinerario, cambi di rotta o cancellazioni.",
      "Hathor Dahabiya non corrisponde indennizzi per i disservizi causati da tali circostanze inevitabili e straordinarie. Restano salvi i diritti dell’ospite a una riduzione del prezzo o a recedere con il rimborso integrale, indicati nelle sezioni 2, 12 e 13.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Normative, ispezioni e autorità governative",
    paragraphs: [
      "Ritardi, interruzioni, cambi di rotta o cancellazioni possono derivare da:",
    ],
    list: [
      { text: "Ispezioni disposte dalle autorità." },
      { text: "Controlli di sicurezza." },
      {
        text: "Decisioni, restrizioni o provvedimenti imposti dalle autorità governative o di regolamentazione egiziane.",
      },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya non corrisponde indennizzi per tali circostanze. Restano salvi i diritti dell’ospite indicati nelle sezioni 2, 12 e 13.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Modifiche all’itinerario e adeguamenti operativi",
    paragraphs: [
      "Hathor Dahabiya può apportare modifiche di scarsa importanza a itinerari, orari, punti di attracco o servizi quando necessario per ragioni operative, di navigazione o di sicurezza. Tali modifiche non costituiscono inadempimento contrattuale e Hathor Dahabiya ne informerà l’ospite in modo chiaro e tempestivo.",
      "Se prima della partenza Hathor Dahabiya deve modificare in modo significativo una caratteristica principale del viaggio, ne informerà l’ospite senza ingiustificato ritardo. L’ospite può accettare la modifica oppure recedere dalla prenotazione senza penali e ottenere il rimborso integrale di tutti i pagamenti effettuati entro 14 giorni.",
      "Se durante il viaggio un servizio incluso nella prenotazione non può essere fornito come concordato, Hathor Dahabiya offrirà, ove possibile, un servizio sostitutivo di qualità equivalente o superiore senza costi aggiuntivi. Se un servizio non viene fornito, o se il servizio sostitutivo è di qualità inferiore, l’ospite ha diritto a un’adeguata riduzione del prezzo.",
      "Non è dovuto alcun indennizzo oltre alla riduzione del prezzo quando la modifica o il disservizio sono imputabili all’ospite, a un terzo estraneo ai servizi prenotati o a circostanze inevitabili e straordinarie.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Cancellazioni da parte della società",
    paragraphs: [
      "Hathor Dahabiya può cancellare un viaggio prima della partenza in casi eccezionali di forza maggiore o di necessità operativa.",
      "In caso di cancellazione da parte di Hathor Dahabiya, l’ospite riceve il rimborso integrale di tutti i pagamenti effettuati entro 14 giorni dalla cancellazione. Se l’ospite lo preferisce, Hathor Dahabiya può offrire in alternativa:",
    ],
    list: [
      { text: "Una nuova data di partenza; oppure" },
      { text: "Un voucher di credito per un viaggio futuro." },
    ],
    paragraphsAfterList: [
      "Se Hathor Dahabiya cancella il viaggio per ragioni operative e non a causa di circostanze inevitabili e straordinarie, l’ospite può avere diritto anche a un indennizzo adeguato.",
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
    paragraphsAfterList: [
      "Restano salvi i diritti dell’ospite al rimborso o alla riduzione del prezzo previsti dalle sezioni 2, 12 e 13.",
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
      "Salvo in caso di danni alla persona e di danni causati con dolo o colpa, la responsabilità di Hathor Dahabiya è limitata a tre volte il prezzo totale della prenotazione.",
      "Nella misura massima consentita dalla legge, Hathor Dahabiya non sarà responsabile per danni indiretti, incidentali o consequenziali.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Legge applicabile e foro competente",
    paragraphs: [
      "I presenti Termini e condizioni sono regolati e interpretati in conformità alle leggi della Repubblica Araba d’Egitto.",
      "Qualsiasi controversia sarà soggetta alla giurisdizione dei tribunali egiziani.",
      "Se l’ospite è un consumatore residente in un altro Paese, ciò non priva l’ospite della tutela delle norme imperative della legge del Paese di residenza, e l’ospite può anche agire dinanzi ai tribunali di tale Paese.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Accettazione dei termini",
    paragraphs: [
      "Con la conferma di una prenotazione, l’ospite riconosce, accetta e si impegna a rispettare i presenti Termini e condizioni.",
      "Qualora una prenotazione sia effettuata per conto di più ospiti, la persona che effettua la prenotazione è responsabile di informare tutti i membri del gruppo di viaggio dei Termini e condizioni applicabili.",
      "I presenti Termini e condizioni sono pubblicati in inglese e in italiano. La versione italiana è fornita per comodità di consultazione. In caso di differenze tra le due versioni prevale la versione inglese, salvo che la legge applicabile alla prenotazione disponga diversamente.",
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
      "These include ",
      "14% VAT and the service charge",
      ".",
    ],
    headOffice: "Head Office",
    address: ["One Kattamiya, Tower 211, Floor 11, Flat 111", "Ring Road", "Cairo, Egypt"],
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
      "Sono compresi ",
      "l’IVA al 14% e il costo del servizio",
      ".",
    ],
    headOffice: "Sede principale",
    address: ["One Kattamiya, Torre 211, 11º piano, int. 111", "Ring Road", "Il Cairo, Egitto"],
    telephone: "Telefono:",
    email: "E-mail:",
    website: "Sito web:",
    tocLabel: "In questa pagina",
    tocTitle: "In questa pagina",
  },
};
