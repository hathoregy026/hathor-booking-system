/**
 * German versions of the dashboard ("Website Text") page sections, translated
 * from the live dashboard copy. They replace those sections on German pages
 * only; see website-text-it.ts for how the sections are laid over the live text.
 */

import type { WebsiteText } from "@/lib/website-text-shared";

type Pages = WebsiteText["pages"];

export const PAGES_DE: Partial<Pages> = {
  /*
   * The iframe fills titles line by line, so each one keeps its English line
   * count and each line stays about as long as the English one.
   */
  suites: {
    heroTitle: "Suiten\nam Fluss",
    heroKicker: "Gemacht\nzum Leben",
    heroBody: "Stiller, gepflegter Komfort; Licht vom Fluss;\nder Nil gleich hinter dem Glas.",
    heroCabinsCta: "Kabinen entdecken",
    heroSuitesCta: "Suiten entdecken",
    heroBookCta: "Jetzt buchen",
    heroVoyagesCta: "Reisen entdecken",
    storyLabel: "An Bord der Hathor",
    storyTitle: "Räume\nfür die Stille\nmit dem Nil\nimmer nah",
    storyBody:
      "Warme Hölzer, weiche Stoffe, Panoramafenster und aufmerksamer Service machen jede Residenz zu einer privaten Welt zwischen Luxor und Assuan.",
    storySecondBody:
      "Die traditionelle Handwerkskunst der Dahabiya trifft auf zeitgemäßen Komfort, in Suiten für Ruhe, Privatsphäre und den gemächlichen Rhythmus des Flusses.",
    qualityOneTitle: "FLUSSLICHT",
    qualityOneBody:
      "Weite Fenster zum Fluss holen den Nil in jeden Moment, vom ersten Licht an den Ufern bis zum stillen Gold des Sonnenuntergangs.",
    qualityTwoTitle: "PRIVATE RUHE",
    qualityTwoBody:
      "Heitere Interieurs, feine Bettwäsche, eigene Bäder und aufmerksamer Service schaffen an Bord der Hathor einen ganz persönlichen Rückzugsort.",
    qualityThreeTitle: "ÄGYPTISCHES HANDWERK",
    qualityThreeBody:
      "Ägyptischer Charakter, warme Naturmaterialien und durchdachte moderne Details geben jeder Kabine und Suite eine bleibende Verbindung zu diesem Ort.",
    collectionLabel: "Die Suitenkollektion",
    collectionBody:
      "Drei Ausdrucksformen des Lebens an Bord der Hathor, von den behaglichen Kabinen bis zu unseren größten Royal Suites: jede rund um Privatsphäre, Proportion und freien Blick auf den Nil gestaltet.",
    cabinMeta: "8 KABINEN",
    cabinDeck: "OBERDECK",
    cabinTitle: "Luxury Cabins",
    suiteMeta: "2 SUITEN",
    suiteDeck: "UNTERDECK",
    suiteTitle: "Luxury Suites",
    royalMeta: "2 ROYAL",
    royalDeck: "HAUPTDECK",
    royalTitle: "Royal Suites",
    ensuiteMeta: "EIGENES BAD",
    ensuiteDeck: "AN BORD DER HATHOR",
    ensuiteTitle: "Bad der Stille",
    nightMeta: "PRIVAT",
    nightDeck: "LUXOR–ASSUAN",
    nightTitle: "Der Nil bei Nacht",
    residenceCta: "Residenz entdecken",
    discoverCta: "Mehr erfahren",
    viewAllCta: "Alle Suiten entdecken",
    collectionClosingTitle: "Jeder Blick\nAuf den Nil\nGehört\nIhrer Suite",
    collectionClosingBody:
      "Räume für Ruhe, Gespräche, private Dinner und freie Ausblicke, während die Hathor zwischen den alten Ufern Ägyptens dahingleitet.",
    reservationsLabel: "Reservierung",
    reservationsTitle: "IHRE SUITE\nWARTET",
    closingTitle: "Beginnen Sie Ihre Reise",
    closingBody:
      "Eine Reise nach Ihren Wünschen. Treten Sie in unseren exklusiven Kreis ein, für private Routen und frühen Zugang zu seltenen Reisen.",
  },
  blog: {
    intro:
      "Ihre Reise nach Ägypten mit der Hathor Dahabiya, ein Fenster zur Seele des Nils. Wir teilen Geschichten über zeitlose Monumente, antike Wunder und langsames Reisen. Von Kultur bis zu Reisetipps: Entdecken Sie die Kunst des Segelns auf einer Luxus-Dahabiya-Kreuzfahrt auf dem Nil in Ägypten. Lassen Sie sich von jedem Beitrag zu Ihrem nächsten Abenteuer an Bord der Hathor Dahabiya inspirieren.",
  },
  partners: {
    lead: "Wir fahren mit vertrauten Namen aus Reise und Gastgewerbe: Partnern, die unsere Sorgfalt für den Nil und unsere Gäste teilen.",
  },
  highlights: {
    intro: [
      "Tauchen Sie ein in den geheimnisvollen Zauber des Nils an Bord der Hathor Dahabiya, einer Luxus-Dahabiya-Kreuzfahrt auf dem Nil in Ägypten, die das majestätischste Segelerlebnis des Landes bietet, gemacht für alle, die Eleganz, Komfort und einen reichen Hauch Geschichte suchen. Private Räume: Mit insgesamt 8 Kabinen und 4 Suiten, davon 2 Royal Suites, garantiert unsere Dahabiya Hathor größte Privatsphäre bei herzlicher, eleganter Gastfreundschaft und ist die perfekte Wahl für eine Dahabiya-Kreuzfahrt von Assuan nach Luxor. Das elegante Schiff gleitet sanft den Fluss entlang und schenkt eine entspannte Fahrt, bei der die Gäste heitere Ausblicke genießen und verborgene Schätze abseits der Menge entdecken.",
      "Mit der Gastronomie der Hathor genießen die Gäste kunstvoll zubereitete Gerichte, in denen authentische ägyptische Aromen auf internationale Küche treffen, alles frisch von erfahrenen Köchen zubereitet. Entspannen Sie bei einem Drink in den Lounge-Bars, während sich der Himmel in die atemberaubenden Farben des Sonnenuntergangs taucht. Unsere aufmerksame Crew umsorgt Sie mit aufrichtiger Gastfreundschaft und erfüllt jeden Ihrer Wünsche. Kein Detail ist zu klein, um nicht beachtet zu werden. Das ist die Handschrift des Luxus, die nur eine Dahabiya-Kreuzfahrt auf dem Nil in Ägypten bieten kann.",
    ],
    landmarks: [
      {
        title: "Der unvollendete Obelisk",
        body: "Der unvollendete Obelisk von Assuan, ein herausragendes Beispiel altägyptischer Monumente, ist über 3.500 Jahre alt und wurde in einem Steinbruch in Assuan aufgegeben. Dieser Obelisk der Königin Hatschepsut ist fast ein Drittel größer als jeder fertiggestellte ägyptische Obelisk. Vollendet hätte er rund 1.090 Tonnen gewogen und fast 42 Meter Höhe erreicht. Die Arbeiten endeten, als im Granit Risse auftraten, während die Bauleute ihn aus dem Fels lösten. Als eindrucksvolles Zeugnis altägyptischer Ingenieurskunst erzählt der unvollendete Obelisk von fortschrittlichen Techniken der Steinbearbeitung.",
      },
      {
        title: "Der Totentempel der Hatschepsut",
        body: "Der Totentempel der Hatschepsut, auch als Djeser-Djeseru bekannt, liegt am Fuß der Felswände von Deir el-Bahari am Westufer des Nils. Der Tempel wurde zu Ehren der Hatschepsut und des Amun errichtet und liegt neben dem Totentempel des Mentuhotep. Seine Reliefs erzählen von der göttlichen Geburt einer Pharaonin ohne Vorbild.",
      },
      {
        title: "Das Tal der Könige",
        body: "Das Tal der Könige ist eine prächtige Nekropole, in der bis heute 63 Gräber freigelegt wurden. Sie reichen von einer einzelnen Kammer bis zu Gängen mit 120 Räumen, und hier fanden Pharaonen wie Ramses II., Tutanchamun und Sethos I. ihre letzte Ruhe. Das Tal stand im Mittelpunkt zahlreicher Ausgrabungen; 1979 wurde es UNESCO-Welterbe.",
      },
    ],
  },
  wellness: {
    heroSupport:
      "In einer Welt, die selten innehält, schenkt die Hathor dem Körper Zeit zum Loslassen. Seneb Spa, Historia Fitness und wahrhaft erholsame Suiten begleiten Sie zwischen Luxor und Assuan.",
    /* Set three words to a line in a fixed column: kept to two short lines. */
    spaTitle: "Das Seneb Spa am Nil",
    spaParagraphs: [
      "Entdecken Sie das Seneb Spa, das Herz der Ruhe an Bord der Kreuzfahrt Hathor Dahabiya. Ein unvergessliches Erlebnis, inspiriert von über 7.000 Jahren ägyptischer Wellnesstradition (Seneb bedeutet Gesundheit und Wohlbefinden): Ihr Spa auf dem Nil entspringt zeitloser Weisheit und ganzheitlicher Fürsorge.",
      "Während der Nil Sie sanft durch die majestätische Kultur der alten Ägypter trägt, überlassen Sie Körper und Geist den entspannenden Rhythmen unseres Spas. Jeder Moment ist darauf ausgerichtet, das Gleichgewicht wiederzufinden, den Geist zu beruhigen und die innere Lebenskraft zu wecken.",
      "Wählen Sie aus einer erlesenen Auswahl exklusiver Behandlungen, alter Rituale und zeitgemäßer Wellnessanwendungen. Von Aromatherapie-Massagen bis zu entgiftenden Kräuterwickeln verwenden unsere erfahrenen Therapeuten natürliche, lokale Zutaten und traditionelle Techniken und passen jede Behandlung Ihren Bedürfnissen an.",
      "Ob Sie Ruhe, strahlende Haut, neue Energie oder Gelassenheit suchen: Das Seneb Spa ist die beste Wahl, umgeben von der magischen Schönheit des Nils.",
    ],
    fitnessTitle: "Training mit Aussicht",
    fitnessBody:
      "Bringen Sie Ihr Training im Historia Fitness Center der Kreuzfahrt Hathor Dahabiya auf ein neues Niveau und trainieren Sie mit Aussicht: Ihre persönliche Oase mit Blick auf die Lebensader Ägyptens, den majestätischen Nil. Das führende Fitnessstudio unter den Nilkreuzfahrten bietet ein inspirierendes Panorama, ob Sie den Sonnenaufgang begrüßen oder den Sternen folgen. Lassen Sie sich von der Aussicht beflügeln und nutzen Sie modernste Geräte in unserem zeitgemäßen Fitnessrefugium, wo Wohlbefinden und Abenteuer zusammentreffen.",
  },
  gastronomy: {
    introChapter: "Die Küche",
    introTitle: "TAFELN\nAM NIL",
    introSecondTitle: "GEMACHT\nFÜR SIE",
    introThirdTitle: "KOSTEN SIE\nÄGYPTEN",
    introBody:
      "Die Menüs entstehen aus ägyptischen Zutaten und vertrauten internationalen Einflüssen, mit Gerichten, die dem Rhythmus und der Umgebung jedes Tages folgen. Küche, Bewegung und Ruhe verschmelzen zu einem einzigen, fortlaufenden Erlebnis.",
    tableLabel: "DIE TAFEL",
    statementChapter: "Das Erlebnis",
    statementTitle: "EINE KÜCHE, DIE\nZUM BLEIBEN LÄDT\nUND SICH MIT DEM\nFLUSS BEWEGT",
    statementBody:
      "Jede Tafel entsteht rund um die Menschen, die sich an ihr versammeln. Das Frühstück kommt mit dem ersten Licht, das Abendessen folgt der Brise, der Fitnessraum bleibt nah am Deck, und Ihre Suite weiß, wie Sie gern ruhen. Design, Geschmack und Lebensqualität treffen sich in einem einzigen Tag auf der Hathor.",
    riverBody:
      "An Bord der Hathor ist die Küche Teil der Reise, keine Unterbrechung. Saisonale Menüs vereinen ägyptische Aromen, frische Zutaten und aufmerksamen Service in Räumen, die der Fluss geprägt hat.",
    marquee: "RITUALE",
    coursesChapter: "Sieben Gänge",
    /*
     * The Dining titles are split into letters and wrap at about eight
     * capitals here, so every German line stays a short word or two.
     */
    coursesTitle: "TELLER\nWIE\nMOMENTE",
    coursesBody:
      "Jeder Gang kommt in Ruhe, findet seinen Platz und lässt der Tafel Zeit zum Schauen, Atmen und Genießen.",
    values: [
      {
        title: "TAFEL",
        body: "Ägyptische Zutaten werden mit Maß behandelt: leuchtende Zitrusfrüchte, warme Gewürze, Flussfisch und Gemüse von den Ufern.",
      },
      {
        title: "BEWEGUNG",
        body: "Der Fitnessraum an Bord hält Bewegung in Reichweite: eine Morgeneinheit ohne Eile, während Palmen und Dörfer am Deck vorbeiziehen.",
      },
      {
        title: "RUHE",
        body: "Ihre Suite ist der stille Gegenpol: weite Blicke auf den Fluss, gepflegte Details und privater Service, wann immer Sie lieber im Zimmer bleiben.",
      },
    ],
    experiencesChapter: "Erlebnisse",
    experiencesBody:
      "Luxus muss sich nicht ankündigen. Man spürt ihn im perfekten Timing, im Lieblingsgetränk, an das sich die Crew erinnert, im Raum zur Bewegung und in der Freiheit, dort zu speisen, wo der Fluss am schönsten ist.",
    stories: [
      { time: "MORGEN", place: "OBERDECK", title: "FRÜHSTÜCK", cta: "Geschichte öffnen" },
      { time: "ABEND", place: "SPEISESAAL", title: "VOM KÜCHENCHEF", cta: "Geschichte öffnen" },
      { time: "GOLDENE STUNDE", place: "FLUSSDECK", title: "DINNER AM NIL", cta: "Geschichte öffnen" },
      { time: "TÄGLICH", place: "FITNESSDECK", title: "BEWEGUNG", cta: "Geschichte öffnen" },
      { time: "JEDERZEIT", place: "IHRE SUITE", title: "ZIMMERSERVICE", cta: "Geschichte öffnen" },
    ],
    closingChapter: "Jenseits der Tafel",
    closingTitle: "WER SAGT,\nGENUSS KÖNNE\nNICHT AUCH\nNÜTZLICH SEIN?",
    closingBody:
      "Küche, Bewegung und Ruhe verschmelzen zu einem einzigen, fortlaufenden Erlebnis. Nichts ist gehetzt, nichts übertrieben, und jedes Detail dient dem Leben an Bord.",
    closingCta: "Reise buchen",
    conciergeTitle: "EINE REISE\nNACH MASS",
    diningClosingTitle: "TAFELN\nOHNE\nEILE",
    conciergeBody:
      "Erzählen Sie uns, wie Sie gern reisen. Unser Team organisiert private Dinner, Ernährungswünsche, Anlässe, Trainingszeiten und Service in der Suite nach dem natürlichen Rhythmus Ihrer Nilreise.",
    conciergeCta: "Reise planen",
    featureLabel: "DIE TAFEL DER HATHOR",
    featureTitle: "PRIVATE DINNER",
    featureBody:
      "Auf Wunsch private Dinner an ausgewählten Orten an Bord, für alle, die ein persönlicheres Erlebnis suchen.",
  },
  contact: {
    formIntro:
      "Nennen Sie uns Ihre Termine, die Gästezahl und wie Sie reisen möchten. Unsere Reservierung antwortet innerhalb von 24 Stunden.",
    formTitle: "Wir freuen uns auf Sie",
    /* About the English length: a second line would rise into the scroll cue. */
    heroSupport: "Unser Team ist gern für Sie da.",
  },
  about: {
    intro: [
      "Entdecken Sie Ägypten in einem ganz neuen Licht mit der Nilkreuzfahrt Hathor Dahabiya, wo zeitlose Tradition auf modernen Luxus trifft.",
      "Eine Dahabiya-Reise ist eine der intimsten Arten, den Nil zu erleben. Das ruhigere Tempo, die überschaubare Größe und die stilleren Anlegestellen schaffen eine persönlichere Verbindung zum Fluss und zu den Orten an seinen Ufern.",
      "Die Dahabiya bietet jeden erdenklichen zeitgemäßen Komfort für eine Panoramakreuzfahrt durch dieses faszinierende Land, abgestimmt auf die Wünsche jedes Gastes. Vom ersten Moment an ist alles darauf ausgerichtet, Ihre Erwartungen zu übertreffen.",
      "Erleben Sie das größte Abenteuer auf dem Nil mit der Kreuzfahrt Hathor Dahabiya in Ägypten: Jeder Sonnenaufgang auf dem Fluss wird zu einer neuen epischen Erzählung.",
    ],
    diningIntro:
      "Gönnen Sie sich internationale Spitzenküche und feine Unterhaltung in unseren besonderen Räumen:",
    diningOutro:
      "An Bord der Hathor Dahabiya verbinden wir Tradition und Innovation zu einer Reise jenseits des Gewöhnlichen. Ob Sie Ruhe, Abenteuer oder kulturelles Eintauchen suchen: Ihre Reise mit uns wird schlicht außergewöhnlich.",
    diningTitle: "Küche und Unterhaltung",
    heroSupport:
      "Entdecken Sie Ägypten in einem ganz neuen Licht, wo zeitlose Tradition auf modernen Luxus trifft.",
    welcomeBody:
      "Entdecken Sie eine stillere Form des Luxus, aus Raum, Privatsphäre und aufmerksamem Service.",
    welcomeTitle: "Willkommen an Bord der Hathor Dahabiya.",
    accommodationsIntro:
      "Die Hathor Dahabiya erstreckt sich über drei bis ins Detail gestaltete Decks (Unterdeck, Hauptdeck und Sonnendeck) mit:",
    accommodationsTitle: "Die Unterkünfte",
  },
  cabins: {
    overviewIntro:
      "Die Hathor Dahabiya bietet eine private, elegante Dahabiya-Kreuzfahrt: ein echtes Boutique-Erlebnis auf dem Nil für alle, die den zeitlosen Fluss erleben möchten.",
    amenitiesIntro:
      "Jede Kabine unserer kleinen Luxuskreuzfahrt auf dem Nil bietet einen ruhigen, entspannenden Raum mit weitem Blick auf den Fluss und allem Komfort. Das Boutique-Erlebnis auf dem Nil ist eine exklusive Dahabiya-Reise, die den Gästen privaten Raum lässt, um auf den stillen Wassern des Nils zu fahren, ohne anderen Reisenden zu begegnen.",
    amenitiesTitle: "In Ihrem Aufenthalt inklusive",
  },
  rooms: {
    overviewIntro:
      "Erleben Sie die Kreuzfahrt Hathor Dahabiya, die Authentizität und Luxus zu einer unvergesslichen Reise auf dem zeitlosen Nil verbindet.\n\nOb Sie unsere eleganten Suiten oder die Royal Suites mit Panoramablick auf den Nil wählen: Sie finden unvergleichlichen Komfort und exklusive Privatsphäre.",
    amenitiesIntro:
      "Entdecken Sie den mühelosen Luxus der Accessible Hathor Suite: ein weiter, eleganter Rückzugsort für Komfort, leichte Bewegung und feines Wohnen. Jedes Detail ist darauf ausgerichtet, dass sich jeder Gast ohne Kompromisse wie zu Hause fühlt.",
    amenitiesTitle: "In Ihrem Aufenthalt inklusive",
  },
  royal: {
    overviewIntro:
      "Erleben Sie eine authentische Luxusreise in der Royal Suite der Hathor Dahabiya: eine private Dahabiya-Kreuzfahrt unter Segeln auf dem zeitlosen Nil, die in Erinnerung bleibt.",
    amenitiesIntro:
      "Gestaltet für Privatsphäre und Luxus, vereinen sie die eleganten Interieurs der Hathor, historisch inspirierte Dekorationen und modernen Komfort zu einem feinen Aufenthalt.",
    amenitiesTitle: "In Ihrem Aufenthalt inklusive",
  },
  charter: {
    benefits: [
      "Größte Privatsphäre an Bord: keine anderen Gäste, 100 % privat",
      "Eigene Crew und eigener Küchenchef",
      "Luxuriöse Unterkünfte und Service",
      "Route nach Maß",
    ],
    benefitsIntro: "Buchen Sie die ganze Dahabiya exklusiv für Ihre Gruppe und freuen Sie sich auf:",
    overviewIntro:
      "Chartern Sie Ihre eigene Luxus-Dahabiya. Machen Sie aus Ihrer Nilreise ein privates Erlebnis.",
  },
  cruises: {
    overviewTitle: "Die Dahabiya Kreuzfahrten",
    overviewIntro:
      "Entdecken Sie exklusive Routen: intime Fahrten, legendäre Anlegestellen und Luxus ohne Kompromisse.",
    continueTitle: "Entdecken Sie mehr\nan Bord der Hathor",
    continueBody: "Entdecken Sie die Luxury Rooms, die Suiten, die Royal Suites und die Küche von Hathor Flavors.",
    ctaTitle: "Buchen Sie Ihre Reise",
    ctaBody:
      "Entdecken Sie exklusive Routen: intime Fahrten, legendäre Anlegestellen und Luxus ohne Kompromisse.",
  },
  voyages: {
    heroLabel: "Die Reisen der Hathor",
    heroSupport:
      "Private Dahabiya-Routen: intime Fahrten, legendäre Anlegestellen und der gemächliche Rhythmus des Flusses.",
    scrollHint: "Scrollen und ablegen",
    statementLabel: "Der Stil der Hathor",
    statementTitle: "Langsam reisen\nTief entdecken\nFür immer erinnern",
    statementBody:
      "Jede Reise der Hathor ist für Entdeckungen ohne Eile gemacht: Tempel in der goldenen Stunde, Abende im Sonnenuntergang auf dem Fluss und Landausflüge nach Maß für Ihre Gruppe.",
    openingScript: "Vier Tage auf dem Nil. Ein Leben voller goldenem Licht.",
    promiseLabel: "Das Versprechen",
    manifesto: [
      {
        title: "Intime Größe",
        body: "Wenige Kabinen, nie ein schwimmendes Hotel. Die Hathor folgt der Strömung, nicht der Menge.",
      },
      {
        title: "Eleganz inklusive",
        body: "Feine Küche, ausgewählte Getränke und Landausflüge gehören zu jeder Fahrt.",
      },
      {
        title: "Privater Rhythmus",
        body: "Die Tempel, wenn das Licht stimmt. Das Deck, wenn der Fluss Sie zum Bleiben einlädt.",
      },
    ],
    itinerariesLabel: "Wählen Sie Ihre Passage",
    itinerariesTitle: "Der Nil\nIhr Rhythmus",
    itinerariesBody:
      "Von intimen Passagen mit drei Nächten bis zur ganzen Rundreise mit sieben Nächten hält jede Route dasselbe Versprechen: Luxus inklusive, private Ausflüge und eine Crew, die den Nil auswendig kennt.",
    itineraries: [
      {
        slug: "3-nights-aswan-luxor",
        title: "Von Assuan nach Luxor",
        durationLabel: "3 Nächte / 4 Tage",
        meta: "Assuan → Luxor",
        body: "Eine intime Passage von Süden nach Norden: Philae, Kom Ombo und Edfu zeigen sich im gemächlichen Tempo einer Dahabiya, bis zu den Tempeln von Luxor.",
        cta: "Reise entdecken",
      },
      {
        slug: "4-nights-luxor-aswan",
        title: "Von Luxor nach Assuan",
        durationLabel: "4 Nächte / 5 Tage",
        meta: "Luxor → Assuan",
        body: "Die klassische Nilreise, von den monumentalen Ufern Luxors zur stillen Anmut Assuans: Tempel, Feluken und Abende im Sonnenuntergang auf dem Fluss.",
        cta: "Reise entdecken",
      },
      {
        slug: "7-nights-luxor-aswan-luxor",
        title: "Von Luxor nach Assuan und zurück",
        durationLabel: "7 Nächte / 8 Tage",
        meta: "Luxor → Assuan → Luxor",
        body: "Die ganze Nilrunde zwischen Luxor und Assuan: Zeit für die Tempel, das Licht des Flusses und stillere Tage an Bord der Hathor.",
        cta: "Reise entdecken",
      },
      {
        slug: "nile-majesty",
        title: "Nile Majesty",
        durationLabel: "Privatcharter",
        meta: "Route nach Maß",
        body: "Beim Privatcharter gehört die Hathor allein Ihrer Gruppe, und Sie gestalten Route, Küche und Landausflüge ganz nach Ihren Wünschen.",
        cta: "Charter entdecken",
      },
    ],
    charterLabel: "Privatcharter",
    charterTitle: "Ihr Fluss\nIhr Rhythmus",
    charterScript: "Ihr Fluss. Ihr Rhythmus. Ganz für Sie.",
    charterBody:
      "Beim Privatcharter gehört die Hathor allein Ihrer Gruppe, und Sie gestalten die Reise frei nach Ihrem Rhythmus, Ihrer Küche und Ihren Landausflügen.",
    charterCta: "Charter entdecken",
    reserveLabel: "Die Reise beginnen",
    ctaTitle: "Buchen Sie Ihre Reise",
    ctaBody: "Wählen Sie die Route, suchen Sie Ihre Suite aus und kommen Sie an Bord der Hathor.",
    ctaPrimary: "Jetzt buchen",
    ctaSecondary: "Abfahrtstermine",
  },
};
