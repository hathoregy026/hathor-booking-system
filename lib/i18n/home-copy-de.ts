/**
 * The homepage's words in German. House rules are in chrome-copy-de.ts; the
 * display font draws no hyphens, so large titles avoid them.
 */
import { WEEKDAYS_DE } from "@/lib/i18n/catalog-copy-de";
import { usdDe } from "@/lib/i18n/format-de";
import type { HomeCopy, PartnersStripCopy } from "@/lib/i18n/home-copy";

const dePlace = (name: string) => (name === "Aswan" ? "Assuan" : name);
const dePorts = (ports: string) =>
  ports
    .split(/(\s*[→—]\s*)/)
    .map((part) => dePlace(part))
    .join("");

export const HOME_COPY_DE: HomeCopy = {
  hero: {
    lineRight: "Luxus Dahabiya",
    lineLeft: "Nilkreuzfahrt",
  },
  runLabel: "An Bord der Hathor",
  open: {
    label: "Hathor Dahabiya",
    navLabel: "Auf dieser Seite",
    nav: [
      { href: "/cruises-list", label: "Kreuzfahrten" },
      { href: "/voyages", label: "Reisen" },
      { href: "/suites", label: "Suiten" },
      { href: "/contact", label: "Kontakt" },
    ],
    eyebrow: "Hathor Dahabiya",
    titleLines: ["32", "Gäste", "Ein Fluss"],
    body: "Eine private Segel-Dahabiya auf dem ägyptischen Nil. Acht Kabinen, zwei Suiten und zwei Royal Suites, zwischen Luxor und Assuan.",
    scroll: "Scrollen",
    npCopy:
      "Eine private Dahabiya-Reise zwischen Luxor und Assuan, geprägt von Stille, Geschichte und dem Rhythmus des Flusses.",
    npTitle: "Der Nil ganz privat",
  },
  lead: {
    label: "Die Kreuzfahrt",
    mainAlt: "Die Hathor Dahabiya am Nilufer in der goldenen Stunde",
    insetUnderAlt: "Das Pooldeck an Bord der Hathor Dahabiya",
    insetOverAlt: "Die Hathor Dahabiya unter Segeln zwischen Luxor und Assuan",
    aboard: "An Bord",
    aboardRoute: "Luxor — Assuan",
  },
  sailings: {
    label: "Abfahrten",
    kicker: "02 — Abfahrten",
    titleLines: ["Wählen Sie", "Ihre Kabine"],
    support:
      "Eine Fünf-Sterne-Dahabiya, in der die Geschichte des Nils, zeitgemäßer Komfort und intimes Segeln zusammenfinden. Drei Routen, vier Kabinenkategorien, 32 Gäste an Bord.",
    tiers: {
      "Luxury Room": "Luxury Room",
      "Luxury Suite": "Luxury Suite",
      "Luxury Royal Suite": "Royal Suite",
    },
    roundTrip: "Rundreise",
    route: (ports) => dePorts(ports).replace("→", "—"),
    nights: (nights) => `${nights} Nächte`,
    day: (weekday) => `jeden ${WEEKDAYS_DE[weekday] ?? weekday}`,
    from: "ab",
    viewDetails: "Details ansehen",
    price: usdDe,
    alt: (roomName, ports) => `${roomName} an Bord der Hathor, ${dePorts(ports)}`,
    bookNow: "Jetzt buchen",
    moreAlt: "Die Hathor Dahabiya auf dem Nil",
    moreTier: "Die ganze Liste",
    moreName: "Mehr ansehen",
    moreLink: "Alle Abfahrten",
  },
  chart: {
    panelLabel: "Die Route zwischen Luxor und Assuan",
    kicker: "Die Route",
    titleLines: ["Von Luxor", "nach Assuan"],
    support:
      "Gezeichnet nach den echten Koordinaten des Flusses. Fahren Sie die Strecke hier ab und sehen Sie, was an jedem Liegeplatz auf Sie wartet, bevor Sie dort festmachen.",
    sailed: (km) => `von ${km} km gefahren`,
    eyebrow: "Eine Passage mit 4 Nächten · Von Luxor nach Assuan",
    stopsLabel: "Entdecken Sie Orte am Nil",
    embarkation: "Einschiffung",
    readMore: "Mehr erfahren",
    mapTitle: "Der Nil zwischen Luxor und Assuan",
    mapDescription:
      "Geografische Übersicht, nach Norden ausgerichtet, mit der Lage der Städte. Gepunktete Linien verbinden die Orte mit einem vereinfachten Flusslauf und markieren keine Liegeplätze. Die Fahrt ist nach Süden dargestellt, von Luxor nach Assuan.",
    heading: "Kurs",
    westernDesert: "WESTLICHE WÜSTE",
    easternDesert: "ÖSTLICHE WÜSTE",
    caption: "Geografische Übersicht · ungefähre Lage der Städte",
    notNavigation: "· keine Seekarte",
    place: dePlace,
  },
  claim: {
    label: "Sie fährt, wo große Schiffe nicht hinkommen",
    lines: ["Sie fährt,", "wo große", "Schiffe nicht", "hinkommen"],
    copy: "Eine Dahabiya hat nur wenig mehr als einen Meter Tiefgang. Sie legt in Esna, Edfu und Kom Ombo an, während die schwimmenden Hotels vorbeiziehen, und macht an Ufern fest, die gar keinen Anleger haben.",
  },
  voyages: {
    label: "Die Reisen",
    kicker: "02 — Die Reisen",
    support:
      "Drei Fahrten zwischen den beiden Städten. Der Fluss bestimmt, wie lange jede dauert, die Richtung, wie sie sich anfühlt.",
    link: "Alle Reisen",
    items: [
      {
        nights: "Drei Nächte",
        route: "Assuan — Luxor",
        note: "Mit der Strömung",
        alt: "Die Hathor Dahabiya auf der Fahrt von Assuan nach Luxor",
      },
      {
        nights: "Vier Nächte",
        route: "Luxor — Assuan",
        note: "Unter eigenen Segeln",
        alt: "Die Hathor Dahabiya auf der Fahrt von Luxor nach Assuan",
      },
      {
        nights: "Sieben Nächte",
        route: "Die Rundreise",
        note: "Beide Ufer, der ganze Fluss",
        alt: "Die Hathor Dahabiya auf der gesamten Rundreise zwischen Luxor und Assuan",
      },
    ],
  },
  suites: {
    label: "Die Suiten",
    kicker: "03 — Die Suiten",
    line: "Zwölf Räume, und in jedem von ihnen der Fluss.",
    copy: [
      "Acht Kabinen, zwei Suiten und zwei Royal Suites, jede mit eigenem Fenster zum Ufer.",
      "Handgearbeitetes Holz, Leinen und ein Bett für die Stille nach einem Tag an Land.",
    ],
    link: "Suiten ansehen",
    royalBathAlt: "Das Bad einer Royal Suite an Bord der Hathor",
    royalAlt: "Eine Royal Suite an Bord der Hathor Dahabiya",
    cabinAlt: "Eine Kabine mit Flussblick an Bord der Hathor Dahabiya",
    luxurySuiteAlt: "Eine Luxury Suite an Bord der Hathor Dahabiya",
  },
  marquee: {
    label: "An Bord der Hathor",
    words: [
      "Seneb Spa",
      "Zwei Restaurants",
      "Tage an Land",
      "Sonnendeck",
      "Privatcharter",
    ],
  },
  experiences: {
    label: "Die Erlebnisse",
    navLabel: "An Bord der Hathor",
    loungeAlt: "Die Lounge an Bord der Hathor Dahabiya",
    diningAlt: "Kulinarik an Bord der Hathor Dahabiya",
    fitnessAlt: "Der Fitnessraum an Bord der Hathor Dahabiya",
    spaAlt: "Das Seneb Spa an Bord der Hathor Dahabiya",
    explore: [
      { href: "/gastronomy", label: "Gastronomie" },
      { href: "/wellness", label: "Seneb Spa" },
      { href: "/highlights", label: "Höhepunkte" },
      { href: "/charter", label: "Privatcharter" },
    ],
  },
  terms: {
    label: "Über die Hathor",
    items: [
      {
        title: "Zwölf Räume",
        copy: "Acht Kabinen, zwei Suiten und zwei Royal Suites. Das ganze Schiff beherbergt weniger Menschen als ein einziges Deck eines Kreuzfahrtschiffs, und genau darum geht es.",
        aside: "Voll belegt reisen zweiunddreißig Gäste in zwölf stillen Räumen.",
        imageAlt: "Die Hathor Dahabiya unter Segeln auf dem Nil",
      },
      {
        title: "kein Motor",
        copy: "Eine Dahabiya segelt. Zwei Lateinersegel und die Strömung leisten die Arbeit, und zwischen den Liegeplätzen hören Sie nichts als den Fluss.",
        imageAlt: "Handgearbeitetes Detail an Bord der Hathor Dahabiya",
      },
      {
        title: "Eine Lebensart",
        copy: "Ägypten kommt ohne Eile zu Ihnen: herzliche Gesellschaft, edle Kabinen und ein Fluss, der sich Biegung um Biegung entfaltet.",
        imageAlt: "Das Leben an Bord der Hathor Dahabiya auf dem Nil",
      },
    ],
  },
  close: {
    label: "Reisen Sie mit der Hathor",
    charterAlt: "Die Hathor Dahabiya, ganz gechartert, auf dem Nil",
    duskAlt: "Die Hathor Dahabiya vor Anker in der Abenddämmerung",
    kicker: "Luxor · Assuan · Ägypten",
    title: "Kommen Sie an Bord",
    support: "32 Gäste, fünf Liegeplätze und ein Fluss. Um alles Weitere kümmern wir uns.",
    cta: "Verfügbarkeit prüfen",
  },
  doc: {
    contactLabel: "Hathor kontaktieren",
    kicker: "06 — Kontakt",
    support: "32 Gäste, fünf Liegeplätze und ein Fluss. Um alles Weitere kümmern wir uns.",
    titleLines: ["Beginnen Sie", "Ihre Nilreise"],
    mosaicLabel: "An Bord der Hathor",
    mosaicAlts: [
      "Der Hatschepsut-Tempel in Deir el-Bahari",
      "Der Nil im ersten Licht, vom Deck der Hathor aus",
      "Abendessen auf dem Deck der Hathor",
      "Ein Tag an Land mit der Hathor Dahabiya",
    ],
  },
};

export const PARTNERS_STRIP_COPY_DE: PartnersStripCopy = {
  title: "Unsere Partner",
  headline: "In bester Gesellschaft",
  script: "vertrauensvoll auf der Reise",
  phoneScript: "Dahabiya Kreuzfahrt",
  /* Three measured lines, like the English band. */
  leadLines: [
    "Wir sind stolz auf die Anerkennung führender",
    "Partner aus Tourismus und Gastgewerbe weltweit,",
    "die unsere Leidenschaft für authentische Nilreisen teilen.",
  ],
  hrefLabel: "Unsere Partner entdecken",
  listLabel: "Die Partner der Hathor",
};
