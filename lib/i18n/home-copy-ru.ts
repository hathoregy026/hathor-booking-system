/**
 * The homepage's words in Russian. House rules are in chrome-copy-ru.ts; the
 * display font draws no hyphens, so large titles avoid them.
 */
import { countRu, NIGHTS_RU, usdRu } from "@/lib/i18n/format-ru";
import type { HomeCopy, PartnersStripCopy } from "@/lib/i18n/home-copy";

const RU_PLACES: Record<string, string> = {
  Luxor: "Луксор",
  Aswan: "Асуан",
  Esna: "Эсна",
  Edfu: "Эдфу",
  "Kom Ombo": "Ком-Омбо",
};
const ruPlace = (name: string) => RU_PLACES[name.trim()] ?? name;
const ruPorts = (ports: string) =>
  ports
    .split(/(\s*[→—]\s*)/)
    .map((part) => ruPlace(part))
    .join("");

/* "Saturdays" on the sailing card: «по субботам». */
const RU_WEEKDAYS_EVERY: Record<string, string> = {
  Monday: "по понедельникам",
  Tuesday: "по вторникам",
  Wednesday: "по средам",
  Thursday: "по четвергам",
  Friday: "по пятницам",
  Saturday: "по субботам",
  Sunday: "по воскресеньям",
};

export const HOME_COPY_RU: HomeCopy = {
  campaign: { label: "Приглашение к бронированию", cta: "Забронировать" },
  amenitiesStoriesLabel: "Истории с Нила",
  hero: {
    lineRight: "Роскошная дахабия",
    lineLeft: "Круиз по Нилу",
  },
  runLabel: "На борту Hathor",
  open: {
    label: "Hathor Dahabiya",
    navLabel: "На этой странице",
    nav: [
      { href: "/cruises-list", label: "Круизы" },
      { href: "/voyages", label: "Путешествия" },
      { href: "/suites", label: "Люксы" },
      { href: "/contact", label: "Контакты" },
    ],
    eyebrow: "Hathor Dahabiya",
    titleLines: ["32", "гостя", "Одна река"],
    body: "Частная парусная дахабия на египетском Ниле. Восемь кают, два люкса и два Royal Suite — между Луксором и Асуаном.",
    scroll: "Листайте",
    npCopy:
      "Частное путешествие на дахабии между Луксором и Асуаном, в котором задают тон тишина, история и ритм реки.",
    npTitle: "Нил только для вас",
  },
  lead: {
    label: "Круиз",
    mainAlt: "Hathor Dahabiya у берега Нила в золотой час",
    insetUnderAlt: "Палуба с бассейном на борту Hathor Dahabiya",
    insetOverAlt: "Hathor Dahabiya под парусами между Луксором и Асуаном",
    aboard: "На борту",
    aboardRoute: "Луксор — Асуан",
  },
  sailings: {
    label: "Рейсы",
    kicker: "02 — Рейсы",
    titleLines: ["Выберите", "свою каюту"],
    support:
      "Пятизвездочная дахабия, где сходятся история Нила, современный комфорт и камерное плавание. Три маршрута, четыре категории кают, 32 гостя на борту.",
    tiers: {
      "Luxury Room": "Каюта люкс",
      "Luxury Suite": "Luxury Suite",
      "Luxury Royal Suite": "Royal Suite",
    },
    roundTrip: "Туда и обратно",
    route: (ports) => ruPorts(ports).replace("→", "—"),
    nights: (nights) => countRu(nights, NIGHTS_RU),
    day: (weekday) => RU_WEEKDAYS_EVERY[weekday] ?? weekday,
    from: "от",
    viewDetails: "Подробнее",
    price: usdRu,
    alt: (roomName, ports) => `${roomName} на борту Hathor, ${ruPorts(ports)}`,
    bookNow: "Забронировать",
    moreAlt: "Hathor Dahabiya на Ниле",
    moreTier: "Полный список",
    moreName: "Смотреть еще",
    moreLink: "Все рейсы",
  },
  chart: {
    panelLabel: "Маршрут между Луксором и Асуаном",
    kicker: "Маршрут",
    titleLines: ["Из Луксора", "в Асуан"],
    support:
      "Нарисован по настоящим координатам реки. Пройдите маршрут здесь и узнайте, что ждет вас у каждой стоянки, еще до того, как вы там причалите.",
    sailed: (km) => `из ${km} км пройдено`,
    eyebrow: "Плавание на 4 ночи · Из Луксора в Асуан",
    stopsLabel: "Места на Ниле",
    embarkation: "Посадка",
    readMore: "Подробнее",
    mapTitle: "Нил между Луксором и Асуаном",
    mapDescription:
      "Географическая схема, ориентированная на север, с расположением городов. Пунктирные выноски соединяют места с упрощенным руслом реки и не обозначают причалы. Плавание показано на юг, из Луксора в Асуан.",
    heading: "Курс",
    westernDesert: "ЗАПАДНАЯ ПУСТЫНЯ",
    easternDesert: "ВОСТОЧНАЯ ПУСТЫНЯ",
    caption: "Географическая схема · приблизительное расположение городов",
    notNavigation: "· не навигационная карта",
    place: ruPlace,
  },
  claim: {
    label: "Она идет туда, где большие суда не пройдут",
    lines: ["Она идет", "туда, где", "большие суда", "не пройдут"],
    copy: "Осадка дахабии — чуть больше метра. Она швартуется в Эсне, Эдфу и Ком-Омбо, пока плавучие отели проходят мимо, и пристает к берегам, где нет никакого причала.",
  },
  voyages: {
    label: "Путешествия",
    kicker: "02 — Путешествия",
    support:
      "Три рейса между двумя городами. Река определяет, сколько длится каждый, а направление — каким он ощущается.",
    link: "Все путешествия",
    items: [
      {
        nights: "Три ночи",
        route: "Асуан — Луксор",
        note: "По течению",
        alt: "Hathor Dahabiya на пути из Асуана в Луксор",
      },
      {
        nights: "Четыре ночи",
        route: "Луксор — Асуан",
        note: "Под собственными парусами",
        alt: "Hathor Dahabiya на пути из Луксора в Асуан",
      },
      {
        nights: "Семь ночей",
        route: "Туда и обратно",
        note: "Оба берега, вся река",
        alt: "Hathor Dahabiya на полном маршруте из Луксора в Асуан и обратно",
      },
    ],
  },
  suites: {
    label: "Люксы",
    kicker: "03 — Люксы",
    line: "Двенадцать кают, и в каждой из них — река.",
    copy: [
      "Восемь кают, два люкса и два Royal Suite, и в каждом из них свое окно на берег.",
      "Дерево ручной работы, лен и кровать, созданная для тишины после дня на берегу.",
    ],
    link: "Смотреть люксы",
    royalBathAlt: "Ванная комната люкса Royal Suite на борту Hathor",
    royalAlt: "Люкс Royal Suite на борту Hathor Dahabiya",
    cabinAlt: "Каюта с видом на реку на борту Hathor Dahabiya",
    luxurySuiteAlt: "Люкс Luxury Suite на борту Hathor Dahabiya",
  },
  marquee: {
    label: "На борту Hathor",
    words: [
      "Seneb Spa",
      "Два ресторана",
      "Дни на берегу",
      "Солнечная палуба",
      "Частный чартер",
    ],
  },
  experiences: {
    label: "Впечатления",
    navLabel: "На борту Hathor",
    loungeAlt: "Гостиная на борту Hathor Dahabiya",
    diningAlt: "Трапеза на борту Hathor Dahabiya",
    fitnessAlt: "Фитнес-зал на борту Hathor Dahabiya",
    spaAlt: "Seneb Spa на борту Hathor Dahabiya",
    explore: [
      { href: "/gastronomy", label: "Гастрономия" },
      { href: "/wellness", label: "Seneb Spa" },
      { href: "/highlights", label: "Достопримечательности" },
      { href: "/charter", label: "Частный чартер" },
    ],
  },
  terms: {
    label: "О Hathor",
    items: [
      {
        title: "Двенадцать кают",
        copy: "Восемь кают, два люкса и два Royal Suite. На всей дахабии меньше людей, чем на одной палубе круизного лайнера, и в этом весь ее смысл.",
        aside: "При полной загрузке на борту тридцать два гостя в двенадцати тихих каютах.",
        imageAlt: "Hathor Dahabiya под парусами на Ниле",
      },
      {
        title: "без мотора",
        copy: "Дахабия ходит под парусом. Всю работу делают два латинских паруса и течение, и между стоянками вы слышите только реку.",
        imageAlt: "Деталь ручной работы на борту Hathor Dahabiya",
      },
      {
        title: "Образ жизни",
        copy: "Египет открывается без спешки: теплая компания, изысканные каюты и река, неторопливо открывающая изгиб за изгибом.",
        imageAlt: "Жизнь на борту Hathor Dahabiya на Ниле",
      },
    ],
  },
  close: {
    label: "Плавание с Hathor",
    charterAlt: "Hathor Dahabiya, арендованная целиком, на Ниле",
    duskAlt: "Hathor Dahabiya на якоре в сумерках",
    kicker: "Луксор · Асуан · Египет",
    title: "Поднимайтесь на борт",
    support: "32 гостя, пять стоянок и одна река. Обо всем остальном позаботимся мы.",
    cta: "Проверить наличие мест",
  },
  doc: {
    contactLabel: "Связаться с Hathor",
    kicker: "06 — Контакты",
    support: "32 гостя, пять стоянок и одна река. Обо всем остальном позаботимся мы.",
    titleLines: ["Начните свой", "путь по Нилу"],
    mosaicLabel: "На борту Hathor",
    mosaicAlts: [
      "Храм Хатшепсут в Дейр-эль-Бахри",
      "Нил в первых лучах солнца с палубы Hathor",
      "Ужин на палубе Hathor",
      "День на берегу с Hathor Dahabiya",
    ],
  },
};

export const PARTNERS_STRIP_COPY_RU: PartnersStripCopy = {
  title: "Наши партнеры",
  headline: "В достойной компании",
  script: "надежные спутники в пути",
  phoneScript: "Круиз на дахабии",
  /* Three measured lines, like the English band. */
  leadLines: [
    "Мы гордимся признанием ведущих партнеров",
    "в сфере туризма и гостеприимства по всему миру,",
    "разделяющих нашу любовь к подлинным путешествиям по Нилу.",
  ],
  hrefLabel: "Познакомиться с партнерами",
  listLabel: "Партнеры Hathor",
};
