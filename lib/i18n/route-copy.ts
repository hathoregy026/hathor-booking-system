/**
 * The homepage chart's moorings and the homepage guide in every public
 * language. English is the source in lib/nile-route.ts and
 * lib/home-guide-content.ts; this module lays each translation over it, so
 * distances, positions, links and prices are never retyped.
 */

import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import {
  GUIDE_FAQ,
  GUIDE_INTRO,
  GUIDE_VOYAGES,
  guideUsd,
  type GuideQuestion,
  type GuideVoyage,
} from "@/lib/home-guide-content";
import { italianWeekday } from "@/lib/i18n/home-copy";
import type { PublicLocale } from "@/lib/i18n/locale";
import { NILE_MOORINGS, type Mooring } from "@/lib/nile-route";

type MooringWords = Pick<Mooring, "name" | "day" | "imageAlt" | "note"> & {
  sites: readonly { name: string; era: string; note: string }[];
};

/* Same order as MOORING_COPY in lib/nile-route.ts: Luxor, Esna, Edfu, Kom Ombo, Aswan. */
const MOORINGS_IT: readonly MooringWords[] = [
  {
    name: "Luxor",
    day: "Giorno uno",
    imageAlt: "La Valle dei Re sulla riva occidentale di Luxor",
    note: "Hathor accoglie i suoi 32 ospiti al tramonto, con Karnak ancora illuminato sulla riva orientale.",
    sites: [
      {
        name: "Tempio di Karnak",
        era: "c. 2000 a.C.",
        note: "Ottanta ettari di santuari, edificati nell’arco di duemila anni.",
      },
      {
        name: "Valle dei Re",
        era: "c. 1539 a.C.",
        note: "Sessantatré tombe reali scavate nella roccia della riva occidentale.",
      },
      {
        name: "Tempio di Hatshepsut",
        era: "c. 1479 a.C.",
        note: "Tre terrazze colonnate addossate alla parete rocciosa di Deir el-Bahari.",
      },
    ],
  },
  {
    name: "Esna",
    day: "Giorno due",
    imageAlt: "Il Nilo visto dal ponte di Hathor",
    note: "Si attraversa la chiusa alle prime luci. Oltre, il fiume si svuota quasi del tutto di motori.",
    sites: [
      {
        name: "Tempio di Khnum",
        era: "c. 180 a.C.",
        note: "Una sala ipostila nove metri sotto il livello della città, con il soffitto dipinto ancora al suo posto.",
      },
      {
        name: "La chiusa di Esna",
        era: "1906",
        note: "L’unica chiusa di questo tratto: il varco che ogni dahabiya attende.",
      },
    ],
  },
  {
    name: "Edfu",
    day: "Giorno tre",
    imageAlt: "Antichi monumenti lungo il Nilo",
    note: "Il tempio meglio conservato d’Egitto, a breve distanza dall’ormeggio di Hathor.",
    sites: [
      {
        name: "Tempio di Horus",
        era: "237 a.C.",
        note: "Il tempio più integro d’Egitto, con il tetto ancora in piedi.",
      },
      {
        name: "Gebel el-Silsila",
        era: "c. 1500 a.C.",
        note: "La cava di arenaria da cui nacquero Karnak, Luxor ed Edfu.",
      },
    ],
  },
  {
    name: "Kom Ombo",
    day: "Giorno quattro",
    imageAlt: "Hathor in navigazione accanto agli antichi monumenti egizi",
    note: "Un tempio doppio affacciato direttamente sulla riva. Si ormeggia, si sale a piedi e si torna prima di cena.",
    sites: [
      {
        name: "Tempio di Sobek e Haroeris",
        era: "180 a.C.",
        note: "Un unico tempio in due metà speculari: il dio coccodrillo da un lato, il falco dall’altro.",
      },
      {
        name: "Museo dei Coccodrilli",
        era: "2012",
        note: "Trecento coccodrilli mummificati, provenienti dal recinto stesso del tempio.",
      },
    ],
  },
  {
    name: "Assuan",
    day: "Giorno cinque",
    imageAlt: "L’obelisco incompiuto nella sua cava ad Assuan",
    note: "Isole di granito, la luce più morbida del fiume e la cava che non ha mai liberato il suo obelisco.",
    sites: [
      {
        name: "Tempio di File",
        era: "280 a.C.",
        note: "Spostato pietra dopo pietra sull’isola di Agilkia per salvarlo dall’innalzamento delle acque.",
      },
      {
        name: "L’obelisco incompiuto",
        era: "c. 1500 a.C.",
        note: "Ancora adagiato nella roccia madre: completato, sarebbe stato alto quarantadue metri.",
      },
      {
        name: "Isola Elefantina",
        era: "c. 3000 a.C.",
        note: "La città di frontiera meridionale dell’Egitto, abitata prima ancora che sorgessero le piramidi.",
      },
    ],
  },
];

function overlayMoorings(words: readonly MooringWords[]): readonly Mooring[] {
  return NILE_MOORINGS.map((mooring, index) => {
    const local = words[index];
    if (!local) return mooring;
    return {
      ...mooring,
      name: local.name,
      day: local.day,
      imageAlt: local.imageAlt,
      note: local.note,
      sites: mooring.sites.map((site, siteIndex) => ({
        ...site,
        ...local.sites[siteIndex],
      })),
    };
  });
}

const MOORINGS_BY_LOCALE: Record<PublicLocale, readonly Mooring[]> = {
  en: NILE_MOORINGS,
  it: overlayMoorings(MOORINGS_IT),
};

export function localizedMoorings(locale: PublicLocale): readonly Mooring[] {
  return MOORINGS_BY_LOCALE[locale];
}

/* ------------------------------------------------------------- the guide */

export type GuideCopy = {
  kicker: string;
  title: readonly [string, string];
  intro: string;
  ledgerLabel: string;
  voyages: readonly GuideVoyage[];
  days: (days: number) => string;
  departureDay: (weekday: string) => string;
  from: string;
  price: (cents: number) => string;
  note: string;
  faqLabel: string;
  faq: readonly GuideQuestion[];
};

const usdIt = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US").replace(/,/g, ".")}`;

const IT_NIGHTS: Record<number, string> = { 3: "Tre", 4: "Quattro", 7: "Sette" };
const itPlace = (name: string) => (name === "Aswan" ? "Assuan" : name);
const itTo = (place: string) => (/^[AEIOU]/i.test(place) ? `ad ${place}` : `a ${place}`);

const GUIDE_VOYAGES_IT: GuideVoyage[] = GUIDE_VOYAGES.map((voyage) => {
  const cruise = HATHOR_CRUISES.find((item) => item.slug === voyage.slug);
  const stops = (cruise?.ports ?? "").split("→").map((stop) => itPlace(stop.trim()));
  return {
    ...voyage,
    nightsLabel: `${IT_NIGHTS[voyage.nights] ?? voyage.nights} notti`,
    route:
      stops.length > 2
        ? `Da ${stops[0]} ${itTo(stops[1])} e ritorno`
        : `Da ${stops[0]} ${itTo(stops[1] ?? "")}`,
  };
});

function italianPriceAnswer(): string {
  const byNights = (nights: number) =>
    GUIDE_VOYAGES.find((voyage) => voyage.nights === nights);
  const three = byNights(3);
  const four = byNights(4);
  const seven = byNights(7);
  if (!three || !four || !seven) {
    return "I prezzi si intendono per cabina e per l’intero viaggio, tasse e costi di servizio inclusi.";
  }
  return (
    `Le cabine partono da ${usdIt(three.fromCents)} per tre notti da Assuan a Luxor, ` +
    `${usdIt(four.fromCents)} per quattro notti da Luxor ad Assuan e ` +
    `${usdIt(seven.fromCents)} per la crociera di sette notti andata e ritorno. ` +
    "I prezzi si intendono per cabina e per l’intero viaggio, tasse e costi di servizio inclusi; le suite e le Royal Suite hanno prezzi superiori a quelli delle cabine."
  );
}

/* Same order and links as GUIDE_FAQ in lib/home-guide-content.ts. */
const FAQ_IT: readonly Omit<GuideQuestion, "link">[] = [
  {
    question: "Che cos’è una crociera sul Nilo in dahabiya?",
    answer:
      "La dahabiya è una tradizionale imbarcazione a vela egiziana. Poiché naviga a vela anziché a motore e accoglie pochissimi ospiti, ormeggia in approdi più tranquilli di quelli raggiungibili dalle grandi navi da crociera, e le giornate seguono il fiume anziché un orario.",
  },
  {
    question: "Quanto costa una crociera sul Nilo in dahabiya con Hathor?",
    answer: italianPriceAnswer(),
  },
  {
    question: "Che cosa è incluso nel prezzo?",
    answer:
      "Alta cucina e bevande selezionate, visite guidate ai templi ed escursioni a terra, e un servizio attento dall’imbarco al congedo. Tasse e costi di servizio sono inclusi nel prezzo della cabina.",
  },
  {
    question: "Dove naviga Hathor, e per quanto tempo?",
    answer:
      "Tra Luxor e Assuan, con ormeggi a Esna, Edfu e Kom Ombo. Può scegliere tre notti da Assuan a Luxor, con partenza il mercoledì; quattro notti da Luxor ad Assuan, con partenza il sabato; oppure la crociera di sette notti andata e ritorno da Luxor, con partenza il sabato.",
  },
  {
    question: "Quanti ospiti accoglie Hathor?",
    answer:
      "32 ospiti. Hathor si sviluppa su tre ponti, con otto cabine da 22 mq, due suite da 46 mq e due Royal Suite da 56 mq.",
  },
  {
    question: "In che cosa una dahabiya è diversa da una nave da crociera sul Nilo?",
    answer:
      "Una nave da crociera sul Nilo accoglie di solito cento ospiti o più; Hathor ne accoglie 32. Una dahabiya pesca poco più di un metro, così può attraccare lungo rive prive di banchina e raggiungere ormeggi che le grandi navi si limitano a oltrepassare.",
  },
  {
    question: "È possibile noleggiare l’intera dahabiya?",
    answer:
      "Sì. Con il charter privato il Suo gruppo ha l’uso esclusivo di Hathor, con itinerario, cucina ed escursioni a terra pensati su misura.",
  },
];

const FAQ_LINK_LABELS_IT = [
  "La guida completa",
  "Date di partenza e prezzi",
  "Tutto ciò che è incluso",
  "Tutti i viaggi",
  "Cabine e suite",
  "Crociera sul Nilo o dahabiya",
  "Charter privato",
] as const;

const GUIDE_BY_LOCALE: Record<PublicLocale, GuideCopy> = {
  en: {
    kicker: "05 — The guide",
    title: ["Dahabiya", "Nile cruise"],
    intro: GUIDE_INTRO,
    ledgerLabel: "Three voyages from Luxor and Aswan",
    voyages: GUIDE_VOYAGES,
    days: (days) => `${days} days`,
    departureDay: (weekday) => `${weekday}s`,
    from: "from",
    price: guideUsd,
    note: "Per cabin, for the whole voyage. Taxes and service charges included.",
    faqLabel: "Questions before you sail",
    faq: GUIDE_FAQ,
  },
  it: {
    kicker: "05 — La guida",
    title: ["Dahabiya", "sul Nilo"],
    intro:
      "Una crociera sul Nilo in dahabiya percorre il fiume nel modo tradizionale: una barca a vela, pochi ospiti e il Nilo tra Luxor e Assuan, senza fretta. Hathor accoglie 32 ospiti in dodici cabine e suite, e per questo ormeggia lungo rive tranquille che gli hotel galleggianti si limitano a costeggiare.",
    ledgerLabel: "Tre viaggi da Luxor e Assuan",
    voyages: GUIDE_VOYAGES_IT,
    days: (days) => `${days} giorni`,
    departureDay: (weekday) => `ogni ${italianWeekday(weekday)}`,
    from: "da",
    price: usdIt,
    note: "Per cabina, per l’intero viaggio. Tasse e costi di servizio inclusi.",
    faqLabel: "Domande prima di salpare",
    faq: GUIDE_FAQ.map((item, index) => ({
      question: FAQ_IT[index]?.question ?? item.question,
      answer: FAQ_IT[index]?.answer ?? item.answer,
      link: item.link
        ? { ...item.link, label: FAQ_LINK_LABELS_IT[index] ?? item.link.label }
        : undefined,
    })),
  },
};

export function localizedGuide(locale: PublicLocale): GuideCopy {
  return GUIDE_BY_LOCALE[locale];
}
