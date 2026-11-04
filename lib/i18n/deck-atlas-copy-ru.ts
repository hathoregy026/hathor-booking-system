/** The homepage deck planner in Russian; see deck-atlas-copy.ts. */
import type { DeckAtlasCopy, ConfigWords } from "@/lib/i18n/deck-atlas-copy";
import { CABINS_RU, countRu, pluralRu, upToGuestsRu, usdRu } from "@/lib/i18n/format-ru";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { ShipDeckId } from "@/lib/ship-experience-shared";

const DECK_GENITIVE: Record<ShipDeckId, string> = {
  lower: "нижней палубы",
  main: "главной палубы",
  sun: "солнечной палубы",
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/*
 * The page passes a deck's name in lower case, in the nominative
 * ("нижняя палуба"); the sentences need it declined. A name the dashboard
 * has reworded is left as it is.
 */
/* «главная/солнечная» end in -ая, «нижняя» in -яя: each declines its own way. */
const deckIn = (deck: string) =>
  deck.replace(/ая(\s+)палуба$/, "ой$1палубе").replace(/яя(\s+)палуба$/, "ей$1палубе");
const deckTo = (deck: string) =>
  deck.replace(/ая(\s+)палуба$/, "ую$1палубу").replace(/яя(\s+)палуба$/, "юю$1палубу");

export const DECK_ATLAS_COPY_RU: DeckAtlasCopy = {
  dateLocale: "ru-RU",
  usd: usdRu,
  voyages: {
    "3-nights-aswan-luxor": "3 ночи · Из Асуана в Луксор",
    "4-nights-luxor-aswan": "4 ночи · Из Луксора в Асуан",
    "7-nights-luxor-aswan-luxor": "7 ночей · Круговой маршрут",
  } as Record<StayDurationValue, string>,
  onRequest: "По запросу",
  spaceKind: { guest: "Общее пространство", crew: "Экипаж и сервис" },
  cabinNote: {
    "Luxury King Cabin": "Кровать king-size · панорамный вид на Нил",
    "Luxury Twin Cabin": "Две односпальные кровати · панорамный вид на Нил",
    "Luxury Suite": "Отдельная гостиная · панорамный вид на Нил",
    "Royal Suite": "Собственная гостиная · лучший вид на Нил",
  },
  kingBed: "Кровать king-size",
  upToGuests: (guests) => capitalize(upToGuestsRu(guests)),
  booked: "Забронировано",
  bookedRange: (range) => `Забронировано · ${range}`,
  contactAboutRoom: "Свяжитесь с нами по поводу этой каюты",
  availableOn: (date) => `Свободно · ${date}`,
  bookedFor: (from, to) => `Забронировано: ${from} – ${to}`,
  checkingAvailability: "Проверяем наличие мест…",
  chooseDepartureToCheck: "Выберите дату отправления, чтобы проверить наличие мест",
  comparableCabin: "Аналогичная каюта",
  checkingDates: "Проверяем даты…",
  pleaseRetry: "Попробуйте еще раз",
  noDates: "Нет запланированных дат",
  notOpenToGuests: "Недоступно для гостей",
  selectToSeeCloser: "Нажмите, чтобы рассмотреть ближе",
  deckNumber: (number) => `Палуба ${number}`,
  roomCount: (count) => countRu(count, CABINS_RU),
  deckTabs: "Палуба",
  /* As in English, the tab keeps only the deck's own word: «Нижняя», «Главная». */
  deckTab: (name) => capitalize(name.replace(/\s*(палуба|deck)$/i, "")),
  swipe: "Листайте вдоль палубы ↔",
  spacesOnDeck: "Пространства на этой палубе",
  crewAndService: "Экипаж и сервис",
  illustrated: "Иллюстрированные планы палуб. Обстановка показана условно.",
  stern: "Корма",
  bow: "Нос",
  checkingFree: "Проверяем, какие каюты свободны…",
  chooseDepartureFree: "Выберите дату отправления, чтобы увидеть свободные каюты.",
  planKey: "Условные обозначения",
  available: "Свободно",
  bookedOnDate: "Забронировано на эту дату",
  yourChoice: "Ваш выбор",
  makeItYours: "Сделайте это путешествие своим",
  findDeparture: "Найдите свой рейс",
  fieldVoyage: "Путешествие",
  fieldMonth: "С месяца",
  fieldDeparture: "Отправление",
  fullyBooked: " · мест нет",
  checkingLive: "Проверяем наличие свободных кают в реальном времени…",
  tryAgain: "Попробовать снова",
  noDepartures: [
    "В этот период нет запланированных отправлений. Выберите более поздний месяц или ",
    "свяжитесь с отделом бронирования",
    ".",
  ],
  /* Follows the bold count: "5 из 8 кают на нижней палубе свободно на 21 нояб. 2026 г." */
  freeSummary: (total, deck, date) =>
    ` из ${total} ${pluralRu(total, ["каюты", "кают", "кают"])} на ${deckIn(deck)} свободно на ${date}.`,
  departing: (date) => `Отправление ${date}.`,
  allCabins: "Все каюты этой палубы",
  viewPhotos: "Смотреть фотографии каюты",
  perCabin: "за каюту · за все путешествие",
  entireVoyage: "за все путешествие",
  perCabinHead: "За каюту · за все путешествие",
  seeOtherDates: "Смотреть другие даты",
  checkAvailability: "Проверить наличие мест",
  contactReservations: "Связаться с отделом бронирования",
  viewRoom: "Смотреть каюту",
  cabinsOnDeck: "Каюты на этой палубе",
  contactAboutRoomSentence: "Свяжитесь с нами по поводу этой каюты.",
  bookedOnDeparture: ", забронировано на этот рейс",
  loadingCabins: "Загружаем каюты из системы бронирования…",
  cabinsFailed: "Сейчас не удалось загрузить каюты. Пожалуйста, попробуйте еще раз через минуту.",
  closerToSky: "Чуть ближе к небу.",
  exploreLowerMain: "Осмотрите нижнюю и главную палубы, чтобы выбрать каюту.",
  viewDeck: (deck) => `Смотреть ${deckTo(deck)}`,
  liveUnavailable:
    "Данные о наличии мест в реальном времени временно недоступны. Осмотреть палубы можно и сейчас.",
  couldNotLoad: "Не удалось загрузить данные о наличии мест.",
  plan: {
    alt: {
      lower: "Нижняя палуба с двумя люксами, восемью каютами, ресепшеном и служебными помещениями",
      main: "Главная палуба с двумя люксами Royal Suite, библиотекой, тренажерным залом, лаунжем, рестораном и открытой террасой",
      sun: "Солнечная палуба с тенистым лаунжем, круглым баром, двумя бассейнами, шезлонгами и открытой террасой",
    },
    furnished: ". Иллюстрация с обстановкой, вид сверху.",
    closeup: (label, deck) => `${label} на плане ${DECK_GENITIVE[deck]}`,
    space: (mark, name, place, places, crew) =>
      `${mark}, ${name}${places > 1 ? ` (${place} из ${places})` : ""}${crew ? ", только для экипажа" : ""}. Рассмотреть ближе`,
    state: {
      open: "свободно",
      closed: "забронировано на этот рейс",
      unknown: "наличие мест еще не проверено",
      request: "свяжитесь с отделом бронирования по поводу этой каюты",
    },
    booked: "Забронировано",
    preparing: "Готовим план палубы…",
    failed: "Не удалось загрузить план палубы.",
    reload: "Обновить план",
  },
  modal: {
    close: (name) => `Закрыть: ${name}`,
    photoOf: (alt, photo, count) => `${alt}, фотография ${photo} из ${count}`,
    previous: "Предыдущая фотография",
    next: "Следующая фотография",
    whereItIs: "Где находится",
    back: "Вернуться к плану палубы",
    saveName: (name, label) => `${name}, каюта ${label}`,
  },
  chooseDeck: "Выберите палубу",
};

export const CONFIG_RU: ConfigWords = {
  kicker: "Hathor · Камерная резиденция на реке",
  eyebrow: "Искусство жизни на борту",
  title: "Ваше место на Ниле",
  introduction:
    "Три палубы. Ваш собственный мир. Поднимитесь на борт Hathor, осмотрите каждую каюту и найдите ту, что станет вашей.",
  decks: {
    lower: {
      name: "Нижняя палуба",
      subtitle: "Уединенный мир у самой воды",
      description:
        "Люксы и каюты вокруг сердца судна. Выберите каюту, чтобы заглянуть в ваше следующее путешествие.",
    },
    main: {
      name: "Главная палуба",
      subtitle: "Простор, где хочется задержаться",
      description:
        "Люксы Royal Suite, тихая библиотека, просторные лаунжи и обеденные залы, открытые к Нилу.",
    },
    sun: {
      name: "Солнечная палуба",
      subtitle: "Только вы и небо",
      description:
        "Тенистые лаунжи, круглый бар и два бассейна. Убежище под открытым небом — от первых лучей до последних.",
    },
  },
  spaces: {
    "fac-lower-entrance": { name: "Вход", line: "Трапы с обеих сторон, по которым вы поднимаетесь на борт с берега." },
    "fac-reception": { name: "Ресепшен", line: "Стойка приема гостей в самом сердце нижней палубы, где начинается каждое путешествие." },
    "fac-lower-stairs": { name: "Лестницы", line: "Три лестницы на главную палубу — рядом с ресепшеном и на корме." },
    "fac-massage": { name: "Массажный кабинет", line: "Процедурный кабинет Seneb Spa — для массажа между посещениями храмов." },
    "fac-office": { name: "Кабинет управляющего", line: "Кабинет управляющего судном в нескольких шагах от ресепшена." },
    "fac-guides": { name: "Каюта гидов", line: "Каюта 9, где живут гиды-египтологи. Недоступна для гостей." },
    "fac-kitchen": { name: "Кухня", line: "Камбуз в носовой части, где шеф-повар готовит все блюда на борту." },
    "fac-crew": { name: "Каюты экипажа", line: "Каюты экипажа, который заботится о вас. Недоступны для гостей." },
    "fac-main-entrance": { name: "Вход", line: "Трап главной палубы, ведущий в холл библиотеки." },
    "fac-library": { name: "Библиотека", line: "Полки с книгами и кресла для чтения — тихий уголок судна." },
    "fac-main-stairs": { name: "Лестницы", line: "Вниз на нижнюю палубу и наверх на солнечную — по обе стороны от библиотеки и на корме." },
    "fac-gym": { name: "Тренажерный зал", line: "Беговая дорожка, велотренажер и свободные веса для утренней тренировки рядом с Нилом." },
    "fac-restroom": { name: "Туалет", line: "Гостевой туалет рядом с холлом библиотеки, недалеко от лаунжа." },
    "fac-lounge": { name: "Лаунж", line: "Глубокие диваны, барная стойка и широкие окна на Нил." },
    "fac-restaurant": { name: "Ресторан", line: "От завтрака до ужина при свечах — у панорамных окон." },
    "fac-terrace": { name: "Открытая терраса", line: "Столы под открытым небом на носу для долгих обедов и вечеров на реке." },
    "fac-shade": { name: "Тенистый лаунж", line: "Диваны и лежаки под перголой, в тени даже в полуденную жару." },
    "fac-sun-stairs": { name: "Лестница", line: "Вниз на главную палубу, рядом с тенистым лаунжем." },
    "fac-bar": { name: "Круглый бар", line: "Напитки на закате у круглой барной стойки." },
    "fac-pools": { name: "Два бассейна", line: "Два бассейна, встроенные в палубу, с шезлонгами по обе стороны." },
    "fac-loungers": { name: "Шезлонги", line: "Ряды шезлонгов по обе стороны бассейнов и рядом с террасой — для долгих дней на солнце." },
    "fac-sun-terrace": { name: "Открытая терраса", line: "Столы под зонтиками на носу, с видом вперед, вверх по реке." },
  },
  /* "Room 1" → «Каюта 1», "Suite 1" → «Люкс 1»; "Royal Suite 1" keeps its product name. */
  roomName: (name) => name.replace(/^Room\b/, "Каюта").replace(/^Suite\b/, "Люкс"),
};
