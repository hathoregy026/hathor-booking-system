/** The homepage chart's moorings and the homepage guide in German; see route-copy.ts. */
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { GUIDE_FAQ, GUIDE_VOYAGES, type GuideVoyage } from "@/lib/home-guide-content";
import { PLACES_DE, WEEKDAYS_DE } from "@/lib/i18n/catalog-copy-de";
import { usdDe } from "@/lib/i18n/format-de";
import type { GuideCopy, MooringWords } from "@/lib/i18n/route-copy";

/* Same order as MOORING_COPY in lib/nile-route.ts: Luxor, Esna, Edfu, Kom Ombo, Aswan. */
export const MOORINGS_DE: readonly MooringWords[] = [
  {
    name: "Luxor",
    day: "Tag eins",
    imageAlt: "Das Tal der Könige am Westufer von Luxor",
    note: "Die Hathor empfängt ihre 32 Gäste bei Sonnenuntergang, während Karnak am Ostufer noch im Licht liegt.",
    sites: [
      {
        name: "Karnak-Tempel",
        era: "ca. 2000 v. Chr.",
        note: "Achtzig Hektar Heiligtümer, erbaut über zwei Jahrtausende hinweg.",
      },
      {
        name: "Tal der Könige",
        era: "ca. 1539 v. Chr.",
        note: "Dreiundsechzig Königsgräber, in den Fels des Westufers geschlagen.",
      },
      {
        name: "Hatschepsut-Tempel",
        era: "ca. 1479 v. Chr.",
        note: "Drei Säulenterrassen vor der Felswand von Deir el-Bahari.",
      },
    ],
  },
  {
    name: "Esna",
    day: "Tag zwei",
    imageAlt: "Der Nil vom Deck der Hathor aus gesehen",
    note: "Im ersten Licht geht es durch die Schleuse. Danach ist auf dem Fluss kaum noch ein Motor zu hören.",
    sites: [
      {
        name: "Chnum-Tempel",
        era: "ca. 180 v. Chr.",
        note: "Eine Säulenhalle neun Meter unter dem Niveau der Stadt, die bemalte Decke noch an ihrem Platz.",
      },
      {
        name: "Die Schleuse von Esna",
        era: "1906",
        note: "Die einzige Schleuse auf diesem Abschnitt: das Tor, auf das jede Dahabiya wartet.",
      },
    ],
  },
  {
    name: "Edfu",
    day: "Tag drei",
    imageAlt: "Antike Monumente entlang des Nils",
    note: "Der am besten erhaltene Tempel Ägyptens, nur ein kurzes Stück vom Liegeplatz der Hathor entfernt.",
    sites: [
      {
        name: "Horus-Tempel",
        era: "237 v. Chr.",
        note: "Der vollständigste Tempel Ägyptens, sein Dach steht noch.",
      },
      {
        name: "Gebel el-Silsila",
        era: "ca. 1500 v. Chr.",
        note: "Der Sandsteinbruch, aus dem Karnak, Luxor und Edfu entstanden.",
      },
    ],
  },
  {
    name: "Kom Ombo",
    day: "Tag vier",
    imageAlt: "Die Hathor unterwegs vorbei an altägyptischen Monumenten",
    note: "Ein Doppeltempel direkt am Ufer. Sie legen an, gehen zu Fuß hinauf und sind vor dem Abendessen zurück.",
    sites: [
      {
        name: "Tempel des Sobek und Haroeris",
        era: "180 v. Chr.",
        note: "Ein Tempel aus zwei spiegelgleichen Hälften: auf der einen Seite der Krokodilgott, auf der anderen der Falke.",
      },
      {
        name: "Krokodilmuseum",
        era: "2012",
        note: "Dreihundert mumifizierte Krokodile aus dem Tempelbezirk selbst.",
      },
    ],
  },
  {
    name: "Assuan",
    day: "Tag fünf",
    imageAlt: "Der unvollendete Obelisk in seinem Steinbruch in Assuan",
    note: "Granitinseln, das weichste Licht des Flusses und der Steinbruch, der seinen Obelisken nie freigab.",
    sites: [
      {
        name: "Philae-Tempel",
        era: "280 v. Chr.",
        note: "Stein für Stein auf die Insel Agilkia versetzt, um ihn vor dem steigenden Wasser zu retten.",
      },
      {
        name: "Der unvollendete Obelisk",
        era: "ca. 1500 v. Chr.",
        note: "Er ruht noch im gewachsenen Fels: Fertiggestellt hätte er zweiundvierzig Meter gemessen.",
      },
      {
        name: "Insel Elephantine",
        era: "ca. 3000 v. Chr.",
        note: "Ägyptens südliche Grenzstadt, schon bewohnt, bevor die Pyramiden entstanden.",
      },
    ],
  },
];

const NIGHTS_DE: Record<number, string> = { 3: "Drei", 4: "Vier", 7: "Sieben" };
const placeDe = (name: string) => PLACES_DE[name] ?? name;

const GUIDE_VOYAGES_DE: GuideVoyage[] = GUIDE_VOYAGES.map((voyage) => {
  const cruise = HATHOR_CRUISES.find((item) => item.slug === voyage.slug);
  const stops = (cruise?.ports ?? "").split("→").map((stop) => placeDe(stop.trim()));
  return {
    ...voyage,
    nightsLabel: `${NIGHTS_DE[voyage.nights] ?? voyage.nights} Nächte`,
    route:
      stops.length > 2
        ? `Von ${stops[0]} nach ${stops[1]} und zurück`
        : `Von ${stops[0]} nach ${stops[1] ?? ""}`,
  };
});

function germanPriceAnswer(formatPrice: (cents: number) => string = usdDe): string {
  const byNights = (nights: number) =>
    GUIDE_VOYAGES.find((voyage) => voyage.nights === nights);
  const three = byNights(3);
  const four = byNights(4);
  const seven = byNights(7);
  if (!three || !four || !seven) {
    return "Die Preise gelten pro Kabine und für die gesamte Reise, einschließlich Steuern und Servicegebühren.";
  }
  return (
    `Kabinen gibt es ab ${formatPrice(three.fromCents)} für drei Nächte von Assuan nach Luxor, ` +
    `ab ${formatPrice(four.fromCents)} für vier Nächte von Luxor nach Assuan und ` +
    `ab ${formatPrice(seven.fromCents)} für die siebennächtige Rundreise. ` +
    "Die Preise gelten pro Kabine und für die gesamte Reise, einschließlich Steuern und Servicegebühren; Suiten und Royal Suites liegen über den Kabinenpreisen."
  );
}

/* Same order and links as GUIDE_FAQ in lib/home-guide-content.ts. */
const FAQ_DE = [
  {
    question: "Was ist eine Dahabiya-Kreuzfahrt auf dem Nil?",
    answer:
      "Die Dahabiya ist ein traditionelles ägyptisches Segelschiff. Da sie unter Segeln statt mit Motorkraft fährt und nur sehr wenige Gäste aufnimmt, legt sie an stilleren Plätzen an, als große Kreuzfahrtschiffe sie erreichen, und die Tage richten sich nach dem Fluss statt nach einem Fahrplan.",
  },
  {
    question: "Was kostet eine Dahabiya-Kreuzfahrt mit der Hathor?",
    answer: germanPriceAnswer(),
  },
  {
    question: "Was ist im Preis enthalten?",
    answer:
      "Feine Küche und ausgewählte Getränke, geführte Tempelbesuche und Landausflüge sowie aufmerksamer Service von der Einschiffung bis zum Abschied. Steuern und Servicegebühren sind im Kabinenpreis enthalten.",
  },
  {
    question: "Wo fährt die Hathor und wie lange?",
    answer:
      "Zwischen Luxor und Assuan, mit Halten in Esna, Edfu und Kom Ombo. Sie wählen drei Nächte von Assuan nach Luxor mit Abfahrt am Mittwoch, vier Nächte von Luxor nach Assuan mit Abfahrt am Samstag oder die siebennächtige Rundreise ab Luxor mit Abfahrt am Samstag.",
  },
  {
    question: "Wie viele Gäste nimmt die Hathor auf?",
    answer:
      "32 Gäste. Die Hathor erstreckt sich über drei Decks, mit acht Kabinen von 22 m², zwei Suiten von 46 m² und zwei Royal Suites von 56 m².",
  },
  {
    question: "Worin unterscheidet sich eine Dahabiya von einem Nil-Kreuzfahrtschiff?",
    answer:
      "Ein Nil-Kreuzfahrtschiff nimmt meist hundert Gäste oder mehr auf, die Hathor 32. Eine Dahabiya hat nur wenig mehr als einen Meter Tiefgang und kann deshalb an Ufern ohne Anleger festmachen und Liegeplätze erreichen, an denen große Schiffe nur vorbeifahren.",
  },
  {
    question: "Kann man die ganze Dahabiya chartern?",
    answer:
      "Ja. Beim Privatcharter hat Ihre Gruppe die Hathor für sich allein, mit Route, Küche und Landausflügen nach Maß.",
  },
] as const;

const FAQ_LINK_LABELS_DE = [
  "Der vollständige Leitfaden",
  "Abfahrtstermine und Preise",
  "Alle Inklusivleistungen",
  "Alle Reisen",
  "Kabinen und Suiten",
  "Kreuzfahrtschiff oder Dahabiya",
  "Privatcharter",
] as const;

export const GUIDE_COPY_DE: GuideCopy = {
  kicker: "05 — Der Leitfaden",
  title: ["Dahabiya", "auf dem Nil"],
  intro:
    "Eine Dahabiya-Kreuzfahrt befährt den Nil auf die traditionelle Art: ein Segelschiff, wenige Gäste und der Fluss zwischen Luxor und Assuan, ganz ohne Eile. Die Hathor nimmt 32 Gäste in zwölf Kabinen und Suiten auf und legt deshalb an stillen Ufern an, an denen schwimmende Hotels nur vorbeiziehen.",
  ledgerLabel: "Drei Reisen ab Luxor und Assuan",
  voyages: GUIDE_VOYAGES_DE,
  days: (days) => `${days} Tage`,
  departureDay: (weekday) => `jeden ${WEEKDAYS_DE[weekday] ?? weekday}`,
  from: "ab",
  price: usdDe,
  priceAnswer: germanPriceAnswer,
  note: "Pro Kabine, für die gesamte Reise. Steuern und Servicegebühren inklusive.",
  faqLabel: "Fragen vor der Abreise",
  faq: GUIDE_FAQ.map((item, index) => ({
    kind: item.kind,
    question: FAQ_DE[index]?.question ?? item.question,
    answer: FAQ_DE[index]?.answer ?? item.answer,
    link: item.link
      ? { ...item.link, label: FAQ_LINK_LABELS_DE[index] ?? item.link.label }
      : undefined,
  })),
};
