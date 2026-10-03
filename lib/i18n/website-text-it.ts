/**
 * Italian versions of the dashboard ("Website Text") page sections.
 *
 * Each section is translated from the live dashboard copy (SiteSetting
 * "website-text"), not the code defaults, and replaces that section on Italian
 * pages only. Sections are added as their pages are translated; until then a
 * section keeps the dashboard's English. A later step can move these into the
 * dashboard itself, one tab per language.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import type { WebsiteText } from "@/lib/website-text-shared";

type Pages = WebsiteText["pages"];

const PAGES_IT: Partial<Pages> = {
  blog: {
    intro:
      "Il Suo viaggio in Egitto con Hathor Dahabiya, una finestra sull’anima del Nilo. Condividiamo storie di monumenti senza tempo, meraviglie antiche e viaggi lenti. Dalla cultura ai consigli di viaggio, scopra l’arte di navigare con una crociera di lusso in dahabiya sul Nilo, in Egitto. Lasci che ogni articolo ispiri la Sua prossima avventura a bordo di Hathor Dahabiya.",
  },
  partners: {
    lead: "Navighiamo con nomi di fiducia del viaggio e dell’ospitalità: partner che condividono la nostra cura per il Nilo e per i nostri ospiti.",
  },
  highlights: {
    intro: [
      "Si immerga nel fascino misterioso del Nilo a bordo della crociera Hathor Dahabiya, una crociera di lusso in dahabiya sul Nilo, in Egitto, che offre la più maestosa esperienza di navigazione egiziana, pensata per chi cerca eleganza, comfort e un ricco tocco di storia. Spazi privati: con 8 cabine e 4 suite in tutto, di cui 2 Royal, la nostra dahabiya Hathor garantisce la massima privacy insieme a un’ospitalità calda ed elegante, ed è la scelta perfetta per una crociera in dahabiya da Assuan a Luxor. Questa nave elegante scivola dolcemente lungo il fiume, per una navigazione rilassata che permette agli ospiti di godersi panorami sereni e scoprire tesori nascosti lontano dalla folla.",
      "Con la gastronomia di Hathor, gli ospiti assaporano piatti preparati con maestria, in cui gli autentici sapori egiziani si fondono con la cucina internazionale, tutti preparati al momento da chef esperti. Si rilassi con un drink nei lounge bar mentre il cielo si accende dei colori mozzafiato del tramonto. Il nostro attento personale di bordo Le offrirà cura e ospitalità sincere per soddisfare ogni Sua esigenza. Non c’è dettaglio, per quanto piccolo, che venga trascurato. È questa la firma del lusso che solo una crociera in dahabiya sul Nilo, in Egitto, sa offrire.",
    ],
    landmarks: [
      {
        title: "L’Obelisco Incompiuto",
        body: "L’Obelisco Incompiuto di Assuan, straordinario esempio dei monumenti dell’antico Egitto, ha più di 3.500 anni ed è stato abbandonato in una cava di pietra di Assuan. Questo obelisco della regina Hatshepsut è grande quasi un terzo in più di qualsiasi obelisco egizio portato a termine. Se fosse stato completato, avrebbe pesato circa 1.090 tonnellate e raggiunto quasi 42 metri di altezza. I lavori si interruppero quando nel granito comparvero delle crepe, mentre i costruttori lo ricavavano dalla roccia. Potente testimonianza del genio ingegneristico dell’antico Egitto, l’Obelisco Incompiuto racconta tecniche avanzate di taglio della pietra.",
      },
      {
        title: "Il complesso del tempio funerario di Hatshepsut",
        body: "Noto anche come Djeser-Djeseru, il complesso del tempio funerario di Hatshepsut sorge ai piedi delle falesie di Deir el-Bahari, sulla riva occidentale del Nilo. Il tempio fu costruito in onore di Hatshepsut e di Amon e si trova accanto al tempio funerario di Mentuhotep. I rilievi del tempio narrano la nascita divina di una donna faraone senza precedenti.",
      },
      {
        title: "La Valle dei Re",
        body: "La Valle dei Re è una magnifica necropoli in cui, a oggi, sono state portate alla luce 63 tombe. Si va da una semplice stanza a corridoi con 120 camere, e qui trovarono riposo faraoni come Ramses II, Tutankhamon e Seti I. La valle è stata al centro di numerose campagne archeologiche; nel 1979 è diventata Patrimonio mondiale dell’UNESCO.",
      },
    ],
  },
  wellness: {
    heroSupport:
      "In un mondo che raramente si ferma, Hathor crea il tempo perché il corpo si distenda. La Seneb Spa, l’Historia Fitness e suite davvero riposanti La accompagnano tra Luxor e Assuan.",
    /* Set three words to a line in a fixed column: kept to two short lines. */
    spaTitle: "La Seneb Spa sul Nilo",
    spaParagraphs: [
      "Scopra la Seneb Spa, il cuore della tranquillità a bordo della crociera Hathor Dahabiya. Un’esperienza che non dimenticherà, ispirata a oltre 7.000 anni di tradizioni egizie del benessere (Seneb significa salute e benessere): la Sua spa sul Nilo nasce da una saggezza senza tempo e da una cura olistica.",
      "Mentre il Nilo La porta dolcemente attraverso la maestosa civiltà degli antichi Egizi, lasci che corpo e spirito si abbandonino ai ritmi rilassanti della nostra spa. Ogni momento è pensato per ritrovare l’equilibrio, calmare la mente e risvegliare la vitalità interiore.",
      "Scelga tra una selezione curata di trattamenti esclusivi, rituali antichi e trattamenti di benessere contemporanei. Dai massaggi aromaterapici agli impacchi detox alle erbe, i nostri terapisti esperti usano ingredienti naturali e locali e tecniche tradizionali per adattare ogni trattamento alle Sue esigenze.",
      "Che cerchi calma, una pelle luminosa, una carica di energia o serenità, la Seneb Spa sarà la scelta migliore, circondata dalla magica bellezza del Nilo.",
    ],
    fitnessTitle: "Allenarsi con vista",
    fitnessBody:
      "Porti il Suo allenamento a un livello superiore all’Historia Fitness Center della crociera Hathor Dahabiya e si alleni con vista: la Sua oasi personale affacciata sulla linfa vitale dell’Egitto, il maestoso Nilo. Palestra di riferimento tra le crociere sul Nilo, offre un panorama che ispira, che saluti l’alba o insegua le stelle. Lasci che la vista dia energia al Suo allenamento e usi attrezzature all’avanguardia nel nostro moderno santuario del fitness, dove benessere e avventura si incontrano.",
  },
  gastronomy: {
    introChapter: "La cucina",
    introTitle: "TAVOLE\nSUL NILO",
    introSecondTitle: "FATTE PER\nSEGUIRLA",
    introThirdTitle: "GUSTI\nL’EGITTO",
    introBody:
      "I menu nascono da ingredienti egiziani e da influenze internazionali familiari, con piatti preparati secondo il ritmo e l’ambiente di ogni giornata. Cucina, movimento e riposo si fondono in un’unica esperienza continua.",
    tableLabel: "LA TAVOLA",
    statementChapter: "L’esperienza",
    statementTitle: "UNA CUCINA CHE\nINVITA A RESTARE\nA MUOVERSI CON\nIL FIUME",
    statementBody:
      "Ogni tavola prende forma intorno a chi vi si riunisce. La colazione arriva con le prime luci; la cena segue la brezza; la palestra resta vicina al ponte; la Sua suite ricorda come ama riposare. Design, sapore e qualità della vita si incontrano in un’unica giornata Hathor.",
    riverBody:
      "A bordo di Hathor la cucina fa parte del viaggio, non è una pausa. Menu stagionali uniscono sapori egiziani, ingredienti freschi e un servizio attento, in ambienti plasmati dal fiume.",
    marquee: "RITUALI",
    coursesChapter: "Sette portate",
    /*
     * The Dining titles are split into letters and wrap at about eight
     * capitals here, so every Italian line stays a whole word or two.
     */
    coursesTitle: "PIATTI\nCOME\nISTANTI",
    coursesBody:
      "Ogni portata arriva con calma, trova il suo posto e lascia alla tavola il tempo di guardare, respirare e assaporare.",
    values: [
      {
        title: "TAVOLA",
        body: "Gli ingredienti egiziani sono trattati con misura: agrumi luminosi, spezie calde, pesce di fiume e verdure raccolte lungo le rive.",
      },
      {
        title: "ENERGIA",
        body: "La palestra di bordo tiene il movimento a portata di mano: una sessione mattutina senza fretta, mentre palme e villaggi scorrono oltre il ponte.",
      },
      {
        title: "RIPOSO",
        body: "La Sua suite è il contrappunto tranquillo: ampie vedute sul fiume, dettagli curati e servizio privato ogni volta che preferisce restare in camera.",
      },
    ],
    experiencesChapter: "Esperienze",
    experiencesBody:
      "Il lusso non ha bisogno di annunciarsi. Si avverte nei tempi perfetti, nella bevanda preferita ricordata, nello spazio per muoversi e nella libertà di cenare dove il fiume è più bello.",
    stories: [
      { time: "ALBA", place: "PONTE SUPERIORE", title: "COLAZIONE", cta: "Apri la storia" },
      { time: "SERA", place: "SALA DA PRANZO", title: "DALLO CHEF", cta: "Apri la storia" },
      { time: "ORA DORATA", place: "PONTE SUL FIUME", title: "CENA SUL NILO", cta: "Apri la storia" },
      { time: "OGNI GIORNO", place: "PONTE FITNESS", title: "MOVIMENTO", cta: "Apri la storia" },
      { time: "A OGNI ORA", place: "LA SUA SUITE", title: "ROOM SERVICE", cta: "Apri la storia" },
    ],
    closingChapter: "Oltre la tavola",
    closingTitle: "CHI HA DETTO\nCHE IL PIACERE\nNON PUÒ ESSERE\nFUNZIONALE?",
    closingBody:
      "Cucina, movimento e riposo si fondono in un’unica esperienza continua. Niente è affrettato, niente è eccessivo, e ogni dettaglio è al servizio della vita a bordo.",
    closingCta: "Prenoti il viaggio",
    conciergeTitle: "UN VIAGGIO\nSU MISURA",
    diningClosingTitle: "UNA CUCINA\nCHE LASCIA\nRESPIRARE",
    conciergeBody:
      "Ci racconti come ama viaggiare. Il nostro team può organizzare cene private, esigenze alimentari, ricorrenze, momenti di allenamento e servizio in suite secondo il ritmo naturale del Suo viaggio sul Nilo.",
    conciergeCta: "Pianifichi il viaggio",
    featureLabel: "LA TAVOLA DI HATHOR",
    featureTitle: "CENE PRIVATE",
    featureBody:
      "Su richiesta, cene private in spazi selezionati a bordo, per chi desidera un’esperienza più personale.",
  },
  contact: {
    formIntro:
      "Ci indichi le date, il numero di ospiti e come desidera navigare. Il nostro ufficio prenotazioni risponde entro 24 ore.",
    formTitle: "Saremo lieti di sentirLa",
    /* About the English length: a second line would rise into the scroll cue. */
    heroSupport: "Il nostro team è pronto ad assisterLa.",
  },
  about: {
    intro: [
      "Scopra l’Egitto sotto una luce del tutto nuova con la crociera sul Nilo Hathor Dahabiya, dove la tradizione senza tempo incontra il lusso moderno.",
      "Un viaggio in dahabiya è uno dei modi più intimi di vivere il Nilo. Il ritmo più lento, le dimensioni contenute e gli approdi più tranquilli creano un legame più personale con il fiume e con i luoghi lungo le sue rive.",
      "La dahabiya offre ogni comfort contemporaneo immaginabile per una crociera panoramica in questo paese affascinante, adatta alle esigenze di ciascuno. Fin dal primo momento, tutto è pensato per andare oltre le Sue aspettative.",
      "Viva la più grande avventura sul Nilo con la crociera Hathor Dahabiya in Egitto: ogni alba sul fiume diventa un nuovo racconto epico.",
    ],
    diningIntro:
      "Si conceda una cucina di livello internazionale e momenti di svago raffinato nei nostri spazi d’autore:",
    diningOutro:
      "A bordo di Hathor Dahabiya uniamo tradizione e innovazione per un viaggio fuori dall’ordinario. Che cerchi pace, avventura o immersione culturale, il Suo viaggio con noi sarà a dir poco straordinario.",
    diningTitle: "Cucina e intrattenimento",
    heroSupport:
      "Scopra l’Egitto sotto una luce del tutto nuova, dove la tradizione senza tempo incontra il lusso moderno.",
    welcomeBody:
      "Scopra un’espressione più quieta del lusso, fatta di spazio, privacy e servizio attento.",
    welcomeTitle: "Benvenuti a bordo della crociera Hathor Dahabiya.",
    accommodationsIntro:
      "Hathor Dahabiya si sviluppa su tre ponti curati in ogni dettaglio (il ponte inferiore, il ponte principale e il ponte sole) con:",
    accommodationsTitle: "Le sistemazioni",
  },
  cabins: {
    overviewIntro:
      "Hathor Dahabiya offre una crociera privata ed elegante in dahabiya: un’autentica esperienza boutique sul Nilo, pensata per chi desidera vivere il fiume senza tempo.",
    amenitiesIntro:
      "Ogni cabina della nostra piccola crociera di lusso sul Nilo offre uno spazio tranquillo e rilassante, con ampie vedute sul fiume in tutto comfort. L’esperienza boutique sul Nilo è un viaggio esclusivo in dahabiya, che lascia agli ospiti uno spazio privato per navigare le acque serene del Nilo senza incrociare altri viaggiatori.",
    amenitiesTitle: "Incluso nel Suo soggiorno",
  },
  rooms: {
    overviewIntro:
      "Viva la crociera Hathor Dahabiya, che unisce autenticità e lusso in un viaggio indimenticabile sul Nilo senza tempo.\n\nChe scelga le nostre eleganti suite o le Royal Suite con vista panoramica sul Nilo, troverà un comfort impareggiabile e una privacy esclusiva.",
    amenitiesIntro:
      "Scopra il lusso senza sforzo della Accessible Hathor Suite: un rifugio ampio ed elegante, pensato per il comfort, la facilità di movimento e una vita raffinata. Ogni dettaglio è curato perché ciascun ospite si senta davvero a casa, senza compromessi.",
    amenitiesTitle: "Incluso nel Suo soggiorno",
  },
  royal: {
    overviewIntro:
      "Viva un viaggio autentico e di lusso nella Royal Suite di Hathor Dahabiya: una crociera privata in dahabiya, a vela sul Nilo senza tempo, da ricordare per sempre.",
    amenitiesIntro:
      "Pensate per la privacy e il lusso, uniscono gli interni eleganti di Hathor, decorazioni d’ispirazione storica e comfort moderni, per un soggiorno raffinato.",
    amenitiesTitle: "Incluso nel Suo soggiorno",
  },
  charter: {
    benefits: [
      "Massima privacy a bordo: nessun altro ospite, 100% privato",
      "Equipaggio e chef dedicati",
      "Sistemazioni e servizio di lusso",
      "Itinerario su misura",
    ],
    benefitsIntro: "Prenoti l’intera dahabiya in esclusiva per il Suo gruppo e potrà contare su:",
    overviewIntro:
      "Noleggi la Sua dahabiya di lusso. Trasformi il Suo viaggio sul Nilo in un’esperienza privata.",
  },
  cruises: {
    overviewTitle: "Le crociere in dahabiya",
    overviewIntro:
      "Scopra itinerari esclusivi: navigazioni intime, approdi leggendari e un lusso senza compromessi.",
    continueTitle: "Continui a esplorare\na bordo di Hathor",
    continueBody: "Scopra le Luxury Rooms, le Suite, le Royal Suite e la cucina di Hathor Flavors.",
    ctaTitle: "Prenoti il Suo viaggio",
    ctaBody:
      "Scopra itinerari esclusivi: navigazioni intime, approdi leggendari e un lusso senza compromessi.",
  },
  voyages: {
    heroLabel: "I viaggi di Hathor",
    heroSupport:
      "Itinerari privati in dahabiya: navigazioni intime, approdi leggendari e il ritmo senza fretta del fiume.",
    scrollHint: "Scorri per salpare",
    statementLabel: "Lo stile Hathor",
    statementTitle: "Navigare lenti\nScoprire a fondo\nRicordare per sempre",
    statementBody:
      "Ogni viaggio di Hathor è pensato per scoprire senza fretta: templi all’ora dorata, serate illuminate dal tramonto sul fiume ed escursioni a terra su misura per il Suo gruppo.",
    openingScript: "Quattro giorni sul Nilo. Una vita di luce dorata.",
    promiseLabel: "La promessa",
    manifesto: [
      {
        title: "Dimensione intima",
        body: "Poche cabine, mai un hotel galleggiante. Hathor segue la corrente, non la folla.",
      },
      {
        title: "Eleganza tutto incluso",
        body: "Alta cucina, bevande selezionate ed escursioni a terra, parte di ogni navigazione.",
      },
      {
        title: "Ritmo privato",
        body: "I templi quando la luce è quella giusta. Il ponte quando il fiume La invita a restare.",
      },
    ],
    itinerariesLabel: "Scelga la Sua traversata",
    itinerariesTitle: "Il Nilo\nIl Suo ritmo",
    itinerariesBody:
      "Dalle intime traversate di tre notti al giro completo di sette notti, ogni itinerario mantiene la stessa promessa: lusso tutto incluso, escursioni private e un equipaggio che conosce il Nilo a memoria.",
    itineraries: [
      {
        slug: "3-nights-aswan-luxor",
        title: "Da Assuan a Luxor",
        durationLabel: "3 notti / 4 giorni",
        meta: "Assuan → Luxor",
        body: "Una traversata intima da sud a nord: File, Kom Ombo ed Edfu si svelano al passo senza fretta di una dahabiya, fino ai templi di Luxor.",
        cta: "Scopra il viaggio",
      },
      {
        slug: "4-nights-luxor-aswan",
        title: "Da Luxor ad Assuan",
        durationLabel: "4 notti / 5 giorni",
        meta: "Luxor → Assuan",
        body: "Il classico viaggio sul Nilo, dalle rive monumentali di Luxor alla grazia quieta di Assuan: templi, feluche e serate illuminate dal tramonto sul fiume.",
        cta: "Scopra il viaggio",
      },
      {
        slug: "7-nights-luxor-aswan-luxor",
        title: "Da Luxor ad Assuan e ritorno",
        durationLabel: "7 notti / 8 giorni",
        meta: "Luxor → Assuan → Luxor",
        body: "Il circuito completo del Nilo tra Luxor e Assuan: tempo per i templi, per la luce del fiume e per giornate più tranquille a bordo di Hathor.",
        cta: "Scopra il viaggio",
      },
      {
        slug: "nile-majesty",
        title: "Nile Majesty",
        durationLabel: "Charter privato",
        meta: "Itinerario su misura",
        body: "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare itinerario, cucina ed escursioni a terra su misura per Lei.",
        cta: "Scopra il charter",
      },
    ],
    charterLabel: "Charter privato",
    charterTitle: "Il Suo fiume\nIl Suo ritmo",
    charterScript: "Il Suo fiume. Il Suo ritmo. Tutto per Lei.",
    charterBody:
      "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare il viaggio secondo il ritmo, la cucina e le escursioni a terra che preferisce.",
    charterCta: "Scopra il charter",
    reserveLabel: "Inizi il Suo viaggio",
    ctaTitle: "Prenoti il Suo viaggio",
    ctaBody: "Scelga l’itinerario, selezioni la Sua suite e salga a bordo di Hathor.",
    ctaPrimary: "Prenota ora",
    ctaSecondary: "Partenze programmate",
  },
};

const PAGES_BY_LOCALE: Record<PublicLocale, Partial<Pages>> = {
  en: {},
  it: PAGES_IT,
};

/** The dashboard text for a language: its translated sections over the live English. */
export function localizeWebsiteText(text: WebsiteText, locale: PublicLocale): WebsiteText {
  const pages = PAGES_BY_LOCALE[locale];
  if (!Object.keys(pages).length) return text;
  return { ...text, pages: { ...text.pages, ...pages } };
}
