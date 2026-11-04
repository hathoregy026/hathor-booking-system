/** The homepage chart's moorings and the homepage guide in Russian; see route-copy.ts. */
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { GUIDE_FAQ, GUIDE_VOYAGES, type GuideVoyage } from "@/lib/home-guide-content";
import { DAYS_RU, NBSP, NIGHTS_RU, countRu, pluralRu, usdRu } from "@/lib/i18n/format-ru";
import type { GuideCopy, MooringWords } from "@/lib/i18n/route-copy";

/** "ок. 2000 г. до н. э." and "237 г. до н. э.", kept on one line. */
const bc = (year: string) => `${year}${NBSP}г.${NBSP}до${NBSP}н.${NBSP}э.`;
const circa = (year: string) => `ок.${NBSP}${bc(year)}`;

/* Same order as MOORING_COPY in lib/nile-route.ts: Luxor, Esna, Edfu, Kom Ombo, Aswan. */
export const MOORINGS_RU: readonly MooringWords[] = [
  {
    name: "Луксор",
    day: "День первый",
    imageAlt: "Долина царей на Западном берегу Луксора",
    note: "Hathor принимает на борт 32 гостя в сумерках, когда Карнак на Восточном берегу еще освещен.",
    sites: [
      {
        name: "Карнакский храм",
        era: circa("2000"),
        note: "Около восьмидесяти гектаров святилищ, возводившихся на протяжении двух тысяч лет.",
      },
      {
        name: "Долина царей",
        era: circa("1539"),
        note: "Шестьдесят три царские гробницы, высеченные в скалах Западного берега.",
      },
      {
        name: "Храм Хатшепсут",
        era: circa("1479"),
        note: "Три террасы с колоннадами, вплотную примыкающие к скале в Дейр-эль-Бахри.",
      },
    ],
  },
  {
    name: "Эсна",
    day: "День второй",
    imageAlt: "Нил с палубы Hathor",
    note: "С первыми лучами солнца — проход через шлюз. За ним моторных судов на реке почти не остается.",
    sites: [
      {
        name: "Храм Хнума",
        era: circa("180"),
        note: "Гипостильный зал на девять метров ниже уровня города, с сохранившимся расписным потолком.",
      },
      {
        name: "Шлюз в Эсне",
        era: "1906",
        note: "Единственный шлюз на этом участке реки — ворота, которых ждет каждая дахабия.",
      },
    ],
  },
  {
    name: "Эдфу",
    day: "День третий",
    imageAlt: "Древние памятники на берегах Нила",
    note: "Лучше всего сохранившийся храм Египта, в нескольких минутах езды от стоянки Hathor.",
    sites: [
      {
        name: "Храм Гора",
        era: bc("237"),
        note: "Наиболее полно сохранившийся храм Египта: его кровля цела до сих пор.",
      },
      {
        name: "Гебель-эль-Сильсила",
        era: circa("1500"),
        note: "Каменоломня, давшая песчаник для Карнака, Луксора и Эдфу.",
      },
    ],
  },
  {
    name: "Ком-Омбо",
    day: "День четвертый",
    imageAlt: "Hathor проходит мимо древнеегипетских памятников",
    note: "Двойной храм стоит прямо на берегу. Причалить, подняться к нему пешком и вернуться до ужина.",
    sites: [
      {
        name: "Храм Собека и Хароэриса",
        era: bc("180"),
        note: "Один храм из двух зеркальных половин: с одной стороны бог-крокодил, с другой — сокол.",
      },
      {
        name: "Музей крокодилов",
        era: "2012",
        note: "Триста мумифицированных крокодилов, найденных на территории самого храма.",
      },
    ],
  },
  {
    name: "Асуан",
    day: "День пятый",
    imageAlt: "Незаконченный обелиск в каменоломне Асуана",
    note: "Гранитные острова, самый мягкий свет на реке и каменоломня, так и не отдавшая свой обелиск.",
    sites: [
      {
        name: "Храм Филе",
        era: bc("280"),
        note: "Перенесен камень за камнем на остров Агилкия, чтобы спасти его от поднимающейся воды.",
      },
      {
        name: "Незаконченный обелиск",
        era: circa("1500"),
        note: "Он по-прежнему лежит в материнской породе; будь он закончен, его высота составила бы сорок два метра.",
      },
      {
        name: "Остров Элефантина",
        era: circa("3000"),
        note: "Южный пограничный город Египта, заселенный еще до того, как были возведены пирамиды.",
      },
    ],
  },
];

const NIGHT_WORDS_RU: Record<number, string> = { 3: "Три", 4: "Четыре", 7: "Семь" };
/** "Из Асуана в Луксор": the start takes the genitive, the end the accusative. */
const FROM_RU: Record<string, string> = { Luxor: "Луксора", Aswan: "Асуана", Cairo: "Каира" };
const TO_RU: Record<string, string> = { Luxor: "Луксор", Aswan: "Асуан", Cairo: "Каир" };
/** "Saturdays" → "по субботам". */
const WEEKDAYS_ON_RU: Record<string, string> = {
  Monday: "по понедельникам",
  Tuesday: "по вторникам",
  Wednesday: "по средам",
  Thursday: "по четвергам",
  Friday: "по пятницам",
  Saturday: "по субботам",
  Sunday: "по воскресеньям",
};

const GUIDE_VOYAGES_RU: GuideVoyage[] = GUIDE_VOYAGES.map((voyage) => {
  const cruise = HATHOR_CRUISES.find((item) => item.slug === voyage.slug);
  const stops = (cruise?.ports ?? "").split("→").map((stop) => stop.trim());
  const from = FROM_RU[stops[0] ?? ""] ?? stops[0] ?? "";
  const to = TO_RU[stops[1] ?? ""] ?? stops[1] ?? "";
  const word = NIGHT_WORDS_RU[voyage.nights];
  return {
    ...voyage,
    nightsLabel: word
      ? `${word} ${pluralRu(voyage.nights, NIGHTS_RU)}`
      : countRu(voyage.nights, NIGHTS_RU),
    route: stops.length > 2 ? `Из ${from} в ${to} и обратно` : `Из ${from} в ${to}`,
  };
});

function russianPriceAnswer(formatPrice: (cents: number) => string = usdRu): string {
  const byNights = (nights: number) =>
    GUIDE_VOYAGES.find((voyage) => voyage.nights === nights);
  const three = byNights(3);
  const four = byNights(4);
  const seven = byNights(7);
  if (!three || !four || !seven) {
    return "Цены указаны за каюту за все путешествие, включая налоги и сервисные сборы.";
  }
  return (
    `Стоимость каюты — от ${formatPrice(three.fromCents)} за три ночи из Асуана в Луксор, ` +
    `от ${formatPrice(four.fromCents)} за четыре ночи из Луксора в Асуан и ` +
    `от ${formatPrice(seven.fromCents)} за путешествие на семь ночей туда и обратно. ` +
    "Цены указаны за каюту за все путешествие, включая налоги и сервисные сборы; люксы, в том числе Royal Suite, стоят дороже кают."
  );
}

/* Same order and links as GUIDE_FAQ in lib/home-guide-content.ts. */
const FAQ_RU = [
  {
    question: "Что такое круиз по Нилу на дахабии?",
    answer:
      "Дахабия — традиционное египетское парусное судно. Она идет под парусом, а не на моторе, и принимает совсем немного гостей, поэтому швартуется в более тихих местах, чем те, куда может подойти большой круизный теплоход, и дни на борту подчиняются реке, а не расписанию.",
  },
  {
    question: "Сколько стоит круиз по Нилу на дахабии Hathor?",
    answer: russianPriceAnswer(),
  },
  {
    question: "Что входит в стоимость?",
    answer:
      "Изысканная кухня и избранные напитки, экскурсии по храмам с гидом и дни на берегу, а также внимательный сервис от посадки на борт до прощания. Налоги и сервисные сборы включены в стоимость каюты.",
  },
  {
    question: "Куда ходит Hathor и сколько длится путешествие?",
    answer:
      "Между Луксором и Асуаном, со стоянками в Эсне, Эдфу и Ком-Омбо. Выберите три ночи из Асуана в Луксор с отправлением по средам, четыре ночи из Луксора в Асуан с отправлением по субботам или путешествие на семь ночей из Луксора и обратно с отправлением по субботам.",
  },
  {
    question: "Сколько гостей принимает Hathor?",
    answer:
      "32 гостя. На трех палубах Hathor расположены восемь кают по 22 м², два люкса по 46 м² и два люкса Royal Suite по 56 м².",
  },
  {
    question: "Чем дахабия отличается от круизного теплохода на Ниле?",
    answer:
      "Круизный теплоход на Ниле обычно принимает сто гостей и больше, Hathor — 32. Осадка дахабии лишь немногим больше метра, поэтому она может причалить к берегу, где нет никакой пристани, и подойти к стоянкам, мимо которых проходят большие суда.",
  },
  {
    question: "Можно ли арендовать дахабию целиком?",
    answer:
      "Да. Частный чартер предоставляет вашей группе Hathor в исключительное пользование, а маршрут, кухня и дни на берегу выстраиваются под вашу компанию.",
  },
] as const;

const FAQ_LINK_LABELS_RU = [
  "Полный путеводитель",
  "Даты рейсов и цены",
  "Все, что входит в стоимость",
  "Все путешествия",
  "Каюты и люксы",
  "Круизный теплоход или дахабия",
  "Частный чартер",
] as const;

export const GUIDE_COPY_RU: GuideCopy = {
  kicker: "05 — Путеводитель",
  /* Two short display lines, like the German, which drops "cruise" to fit. */
  title: ["На дахабии", "по Нилу"],
  intro:
    "Круиз по Нилу на дахабии — это путешествие по реке в традиционном духе: парусное судно, совсем немного гостей и Нил между Луксором и Асуаном в неспешном ритме. Hathor принимает 32 гостя в двенадцати каютах и люксах, поэтому швартуется у тихих берегов, мимо которых проходят плавучие отели.",
  ledgerLabel: "Три путешествия из Луксора и Асуана",
  voyages: GUIDE_VOYAGES_RU,
  days: (days) => countRu(days, DAYS_RU),
  departureDay: (weekday) => WEEKDAYS_ON_RU[weekday] ?? weekday,
  from: "от",
  price: usdRu,
  priceAnswer: russianPriceAnswer,
  note: "За каюту, за все путешествие. Налоги и сервисные сборы включены.",
  faqLabel: "Вопросы перед отплытием",
  faq: GUIDE_FAQ.map((item, index) => ({
    kind: item.kind,
    question: FAQ_RU[index]?.question ?? item.question,
    answer: FAQ_RU[index]?.answer ?? item.answer,
    link: item.link
      ? { ...item.link, label: FAQ_LINK_LABELS_RU[index] ?? item.link.label }
      : undefined,
  })),
};
