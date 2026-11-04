/** The Partners page's own words (not dashboard text) in Russian. Partner names stay as they are. */
import type { PartnersCopy } from "@/lib/i18n/partners-copy";

export const PARTNERS_COPY_RU: PartnersCopy = {
  runLabel: "Партнеры Hathor в сфере путешествий и гостеприимства",
  spineLabel: "Список партнеров",
  /* Follows the fixed count of four partners: «04 имени». */
  names: "имени",
  scroll: "Листайте",
  navLabel: "Разделы страницы",
  nav: ["Круг", "Мастерство", "Диалог", "Контакты"],
  artLabel: "В избранном обществе",
  alts: {
    portrait: "Hathor Dahabiya на Ниле",
    river: "Hathor на реке",
    legacy: "Наследие на Ниле",
    cabin: "Каюта на борту Hathor",
    dining: "Трапеза на борту Hathor",
    deck: "Жизнь на палубе Hathor",
    living: "Пространства для отдыха на борту Hathor",
    fineDining: "Высокая кухня на борту Hathor",
    restaurant: "Ресторан на борту Hathor Dahabiya",
    atmosphere: "Атмосфера ресторана на борту Hathor",
    wine: "Подача вина на борту Hathor",
    amenity: "Деталь оснащения на борту Hathor",
    craft: "Мастерство и забота на борту Hathor",
    highlights: "Красоты Нила с борта Hathor",
    wheel: "Штурвал и река на борту Hathor",
    royal: "Люкс Royal Suite на борту Hathor",
    card: "Hathor Dahabiya на Ниле",
    wash: "Hathor Dahabiya на Ниле в золотой час",
  },
  partnerAlt: (name) => `${name} — партнер Hathor`,
  aboard: "На борту",
  route: "Луксор — Асуан",
  covenant: ["Общие стандарты", "Узкий круг", "верных партнеров", "на Ниле"],
  leadFallback:
    "Мы отправляемся в плавание вместе с проверенными партнерами из мира путешествий и гостеприимства, которые разделяют нашу заботу о Ниле и о наших гостях.",
  orbitTitle: "Доверие во всем мире",
  orbitBody: "Четыре партнера. Единый стандарт заботы о каждом госте Hathor.",
  circle: [
    {
      role: "Турбизнес",
      region: "Египет",
      note: "Знание страны и маршруты по Нилу, выверенные с точностью местных экспертов.",
    },
    {
      role: "Весь мир",
      region: "Бронирование",
      note: "Путешественники со всего мира открывают для себя камерную дахабию.",
    },
    {
      role: "По всему миру",
      region: "Поиск",
      note: "Продуманный путь от первого поиска до путешествия по реке.",
    },
    {
      role: "Люкс",
      region: "Консьерж",
      note: "Стандарты гостеприимства, созвучные ненавязчивой личной заботе Hathor.",
    },
  ],
  /* Kept short: longer lines spill out of the scene at 1920. */
  craft: ["Гостеприимство", "Забота в каждом", "бронировании"],
  craftBody:
    "От первого запроса до последнего утра на палубе наши партнеры сохраняют ту же ненавязчивую точность, которую гости встречают на борту Hathor.",
  datum: {
    tl: "Партнеры",
    tr: "Египет и весь мир",
    one: "Один",
    bl: "Круг Hathor",
    br: "Общий стандарт",
  },
  bridge: ["Путешествия, бережно", "связанные."],
  epilogue: ["Начните разговор", "Станьте партнером", "Hathor"],
  statement:
    "По вопросам сотрудничества, представительства и продуманных партнерских проектов в сфере путешествий обращайтесь к команде Hathor в Каире.",
  contactHathor: "Связаться с Hathor",
  bookVoyage: "Забронировать",
  epilogueMeta: "Представительство и запросы от турбизнеса · Офис в Каире",
  cardTitle: "Круг партнеров",
  cardBody: ["Проверенные партнеры, разделяющие", "нашу заботу о каждом госте"],
  aboutHathor: "О Hathor",
  writeToUs: "Написать нам",
};
