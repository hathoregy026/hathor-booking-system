/**
 * The booking journey in Russian: polite «вы», product names in English,
 * prices in US dollars with Russian separators ("7 000 USD"), dates from
 * `Intl` in "ru-RU". Text only: nothing here changes a price, an availability
 * rule or what the booking request sends.
 */

import { utcParts } from "@/components/booking/journey/model";
import { CARD_SURCHARGE_PERCENT } from "@/lib/card-surcharge";
import type { BookingCopy } from "@/lib/i18n/booking-copy";
import { everyWeekdayRu, placesRu } from "@/lib/i18n/catalog-copy-ru";
import { COUNTRY_NAMES_RU } from "@/lib/i18n/countries-ru";
import { CABINS_RU, DAYS_RU, GUESTS_RU, NBSP, NIGHTS_RU, countRu, pluralRu, upToGuestsRu } from "@/lib/i18n/format-ru";

const ADULTS_RU = ["взрослый", "взрослых", "взрослых"] as const;
const CHILDREN_RU = ["ребенок", "ребенка", "детей"] as const;
/** After «скрывает»: the accusative of «каюта». */
const CABINS_ACC_RU = ["каюту", "каюты", "кают"] as const;
/** After «всех»: the accusative of «гость». */
const GUESTS_ACC_RU = ["гостя", "гостей", "гостей"] as const;

/* Sailing times are stored as UTC midnight, so every date reads in UTC. */
const UTC = { timeZone: "UTC" } as const;
const MONTH_RU = new Intl.DateTimeFormat("ru-RU", { ...UTC, month: "long" });
const SHORT_DATE_RU = new Intl.DateTimeFormat("ru-RU", { ...UTC, day: "numeric", month: "short", year: "numeric" });
const LONG_DATE_RU = new Intl.DateTimeFormat("ru-RU", { ...UTC, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const DATE_RU = new Intl.DateTimeFormat("ru-RU", { ...UTC, day: "numeric", month: "long", year: "numeric" });
const WEEKDAY_SHORT_RU = new Intl.DateTimeFormat("ru-RU", { ...UTC, weekday: "short" });

/** After «до» a weekday takes the genitive: «до вторника, 3 ноября 2026 г.». Sunday first, as `getUTCDay`. */
const WEEKDAYS_GENITIVE_RU = ["воскресенья", "понедельника", "вторника", "среды", "четверга", "пятницы", "субботы"];
/** After «с» a month takes the genitive: «с ноября 2026 г.». */
const MONTHS_GENITIVE_RU: Record<string, string> = {
  январь: "января",
  февраль: "февраля",
  март: "марта",
  апрель: "апреля",
  май: "мая",
  июнь: "июня",
  июль: "июля",
  август: "августа",
  сентябрь: "сентября",
  октябрь: "октября",
  ноябрь: "ноября",
  декабрь: "декабря",
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** "3 нояб. 2026": the short form, without the trailing «г.» so the voyage bar stays on one line. */
const ruShortDate = (iso: string) => SHORT_DATE_RU.format(new Date(iso)).replace(/\s*г\.$/, "");
/** "вторник, 3 ноября 2026 г." */
const ruLongDate = (iso: string) => LONG_DATE_RU.format(new Date(iso));
/** "до вторника, 3 ноября 2026 г." */
const ruDueDate = (iso: string) => `до ${WEEKDAYS_GENITIVE_RU[utcParts(iso).weekday]}, ${DATE_RU.format(new Date(iso))}`;
/** "2,5%": the card surcharge with a Russian decimal comma. */
const SURCHARGE_RU = `${String(CARD_SURCHARGE_PERCENT).replace(".", ",")}%`;
/** "7 000 USD", "7 000,50 USD": US dollars, Russian separators, currency last. */
const ruMoney = (cents: number) =>
  `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(cents / 100)
    .replace(/[,.]/g, mark => (mark === "," ? NBSP : ","))}${NBSP}USD`;
const ruJoin = (items: string[]) =>
  items.length <= 1 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} и ${items[items.length - 1]}`;
/** "До 4 гостей": the capacity at the start of a line. */
const upToRu = (capacity: number) => capitalise(upToGuestsRu(capacity));

/** Server messages the guest can meet in the journey, in Russian. */
const SERVER_RU: Record<string, string> = {
  "Too many requests. Please wait and try again.": "Слишком много запросов. Пожалуйста, подождите и попробуйте еще раз.",
  "The requested rooms or hold are no longer available. Start a new selection.":
    "Выбранные каюты или их предварительный резерв больше недоступны. Пожалуйста, начните выбор заново.",
  "The booking request is invalid or does not match this checkout attempt.":
    "Запрос на бронирование недействителен или не соответствует этой попытке оформления.",
  "Please enter a name without web addresses.": "Пожалуйста, укажите имя без веб-адресов.",
  "Guest count exceeds cabin capacity.": "Число гостей превышает вместимость каюты.",
  "Use an international phone number, for example +201234567890.":
    "Укажите номер телефона в международном формате, например +201234567890.",
  "Booking code and email did not match": "Код бронирования и адрес электронной почты не совпадают.",
  "Reservation acknowledgement is required": "Необходимо подтвердить согласие с условиями бронирования.",
  "Please try again.": "Пожалуйста, попробуйте еще раз.",
  "Please complete the security check and try again.": "Пожалуйста, пройдите проверку безопасности и попробуйте еще раз.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "Проверка безопасности недоступна. Пожалуйста, свяжитесь напрямую с нашим отделом бронирования.",
  "The security check is temporarily unavailable. Please try again.":
    "Проверка безопасности временно недоступна. Пожалуйста, попробуйте еще раз.",
  "The security check expired or could not be verified. Please try again.":
    "Срок проверки безопасности истек, или ее не удалось подтвердить. Пожалуйста, попробуйте еще раз.",
  "Database is busy. Please wait a moment and try again.":
    "Система сейчас перегружена. Пожалуйста, подождите немного и попробуйте еще раз.",
  "Invalid booking authorization": "Ссылка на это бронирование недействительна.",
  Unauthorized: "Ссылка на это бронирование недействительна.",
  "Not found": "Бронирование не найдено.",
  "Invalid email address": "Пожалуйста, укажите действительный адрес электронной почты.",
  "Validation failed": "Пожалуйста, проверьте введенные данные.",
  "Internal server error": "Произошла техническая ошибка.",
  "Content-Type must be application/json": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
  "Request body is too large": "Запрос слишком длинный. Пожалуйста, сократите введенный текст и попробуйте еще раз.",
  "Invalid request body": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
  "Invalid request origin": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
  "Cross-site request rejected": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
  "Cross-origin request rejected": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
  "A valid Idempotency-Key header is required": "Запрос недействителен. Пожалуйста, обновите страницу и попробуйте еще раз.",
};
const NETWORK_RU = "Не удалось установить соединение. Пожалуйста, проверьте подключение к интернету и попробуйте еще раз.";
const SERVER_FALLBACK_RU = "Не удалось завершить операцию.";

export const BOOKING_COPY_RU: BookingCopy = {
  locale: "ru",
  money: ruMoney,
  caught: (error, fallback) => {
    if (error instanceof TypeError || error instanceof SyntaxError) return NETWORK_RU;
    if (error instanceof Error && error.name === "AbortError") return NETWORK_RU;
    return error instanceof Error ? error.message : fallback;
  },
  roomGone: {
    title: "Круиз не найден",
    text: "Этот рейс или каюта больше недоступны. Попробуйте начать новый поиск.",
    link: "Вернуться к поиску",
  },
  monthLabel: (year, month) => `${capitalise(MONTH_RU.format(new Date(Date.UTC(year, month, 1))))} ${year}`,
  shortDate: ruShortDate,
  longDate: ruLongDate,
  weekdayShort: iso => WEEKDAY_SHORT_RU.format(new Date(iso)).toUpperCase(),
  folioRange: (fromIso, toIso) => `${ruShortDate(fromIso)} — ${ruShortDate(toIso)}`,
  stageLabel: stage => {
    if (stage.milestone === "INITIAL") return "Когда Hathor пришлет вам счет";
    if (!stage.dueAt) return stage.milestone;
    if (stage.milestone === "BALANCE") return capitalise(ruDueDate(stage.dueAt));
    const days = stage.milestone === "DAY_60" ? 60 : 45;
    return `${capitalise(ruDueDate(stage.dueAt))} · за ${countRu(days, DAYS_RU)} до отправления`;
  },
  weekdayHeads: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  adults: count => countRu(count, ADULTS_RU),
  children: count => countRu(count, CHILDREN_RU),
  kindCount: (count, kind) => countRu(count, kind === "adult" ? ADULTS_RU : CHILDREN_RU),
  partyLine: (adults, children) =>
    [countRu(adults, ADULTS_RU), children > 0 ? countRu(children, CHILDREN_RU) : null].filter(Boolean).join(" · "),
  cabins: count => countRu(count, CABINS_RU),
  cabinsTitle: count => countRu(count, CABINS_RU),
  nights: count => countRu(count, NIGHTS_RU),
  guests: count => countRu(count, GUESTS_RU),
  joinAnd: ruJoin,
  countryName: (code, english) => COUNTRY_NAMES_RU[code] ?? english,
  serverMessage: message => {
    if (SERVER_RU[message]) return SERVER_RU[message];
    // Validation messages arrive as "Field: message".
    const detail = message.split(": ").slice(1).join(": ");
    return SERVER_RU[detail] ?? SERVER_FALLBACK_RU;
  },

  steps: ["Путешествие", "Гости и каюты", "Данные и оплата", "Запрос отправлен"],
  backTo: { 2: "Путешествие", 3: "Гости и каюты" },
  progressLabel: "Ход бронирования",
  stepOf: (step, of) => `Шаг ${step} из ${of}`,
  bannerOf: "из 04",
  bannerKicker: (step, kicker) => `Шаг ${step} из 4 · ${kicker}`,
  bandLine: ["Медленнее путь,", "больше Египта"],
  bandWords: "Роскошь. Наследие. Причастность.",
  scroll: "Листайте",
  guideHeading: "Ваш ориентир на этом шаге",
  done: "(готово)",
  nextToDo: "(на очереди)",
  edit: "Изменить",
  editLabel: label => `Изменить: ${label.toLowerCase()}`,
  actionBarLabel: "Ваше путешествие и следующий шаг",
  close: "Закрыть",
  oneMoment: "Одну минуту…",

  voyage: {
    chooseItinerary: "Выберите маршрут",
    // `day` is the bare weekday («Среда»); the sentence needs «по средам».
    departureCaption: day => capitalise(everyWeekdayRu(day)),
    departsOn: day => `Отправление ${everyWeekdayRu(day)}`,
    nightsAndDay: (nights, day) => `${countRu(nights, NIGHTS_RU)} · ${everyWeekdayRu(day)}`,
    itinerary: title => `Маршрут · ${title}`,
    expandAll: "Развернуть все",
    collapseAll: "Свернуть все",
    day: day => `День ${day}`,
    // Russian paths open with the place, then a comma or a bracket: «Асуан, посадка».
    placeFromPath: path => (path.split("→")[0] ?? path).replace(/\s*[,(].*$/, "").trim(),
  },
  calendar: {
    selectDate: "Выберите дату отправления",
    previousMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    noSailings: "Нет рейсов",
    dayLabel: (date, from) => `Отправление: ${date}${from !== null ? `, от ${from}` : ""}`,
    available: "Доступное отправление",
    unavailable: "Недоступно",
    departures: "Доступные отправления",
    empty: "Сейчас на это путешествие нет открытых рейсов. Выберите другой маршрут или свяжитесь с нашим отделом бронирования.",
    // `month` is this file's month label («Ноябрь 2026»); after «с» it takes the genitive.
    noneFrom: month => {
      const [name = "", ...rest] = month.split(" ");
      const genitive = MONTHS_GENITIVE_RU[name.toLowerCase()];
      return genitive
        ? `С ${genitive} ${rest.join(" ")} г. открытых отправлений нет.`
        : `${month}: открытых отправлений нет.`;
    },
    from: amount => `От ${amount}`,
    showFewer: "Показать меньше дат",
    showAll: count => `Показать все отправления (${count})`,
    only: day => `Отправления только ${everyWeekdayRu(day)}.`,
  },
  rail: {
    summaryLabel: "Сводка вашего путешествия",
    title: "Ваше путешествие",
    barLabel: "Ваше путешествие",
    journey: "Путешествие",
    dates: "Даты",
    guests: "Гости",
    accommodation: "Размещение",
    payment: "Оплата",
    selectDates: "Выберите даты",
    chooseDate: "Выберите дату",
    notSelected: "Пока не выбрано",
    noGuests: "Гостей пока нет",
    noCabin: "Каюта пока не выбрана",
    to: date => `по ${date}`,
    total: cabins => (cabins > 1 ? `Итого · ${countRu(cabins, CABINS_RU)}` : "Итого за путешествие"),
    pending: "Выберите размещение",
    pendingFine: "Итоговая стоимость появится, когда у всех гостей будет каюта.",
    fine: nights => `Все путешествие на ${countRu(nights, NIGHTS_RU)}, цены за каюту. Налоги и сервисные сборы включены.`,
    tagline: "Иной ритм",
  },

  journey: {
    kicker: "Путешествие",
    title: "Спланируйте путешествие",
    lede: "Три необыкновенных путешествия. Одна вечная река.",
    quote: "Больше, чем путешествие.",
    guide: [
      { label: "Выберите путешествие", hint: "3, 4 или 7 ночей на Ниле" },
      { label: "Выберите дату рейса", hint: "Открытые отправления отмечены" },
      { label: "Перейдите к гостям и каютам", hint: "Пока ничего не зарезервировано" },
    ],
    mapChoice: roomId =>
      `Выбрано на схеме судна: каюта ${roomId}. Мы еще раз проверим и зарезервируем ее ровно в момент отправки запроса; пока ничего не зарезервировано.`,
    chooseFreely: "Выбрать свободно",
    yourDeparture: "Ваше отправление",
    datesHelp: "Нужна другая дата? Если вы не нашли подходящий рейс,",
    datesHelpLink: "свяжитесь с отделом бронирования Hathor",
    chooseToContinue: "Чтобы продолжить, выберите дату рейса.",
    checking: "Проверяем наличие мест…",
    checkingShort: "Проверяем…",
    continueLong: "Перейти к гостям и каютам",
    continueShort: "Продолжить",
    chooseDate: "Выберите дату",
    tileChoose: "Не выбрана",
    chooseDepartureDate: "Выберите дату отправления",
    departs: date => `Отправление ${date}`,
    loadingDates: "Загружаем даты…",
    noOpenDates: "Нет открытых дат",
    perCabin: "за каюту, за все путешествие",
    perUnitVoyage: unit => `${unit}, за все путешествие`,
    barContinueLabel: "Перейти к гостям и каютам",
    blocker: "Сначала выберите дату рейса: открытые даты отмечены в календаре.",
    tabs: { voyage: "Маршрут", date: "Дата", review: "Обзор", toChoose: "Не выбрано", nothingHeld: "Пока без брони" },
    departure: "Отправление",
    guests: "Гости",
  },
  sheets: {
    dateTitle: "Выберите дату отправления",
    datePick: "Нажмите на одну из дат, отмеченных золотым.",
    applyDate: "Применить дату",
    clearDate: "Сбросить дату",
    clearSelection: "Сбросить выбор",
    guestsTitle: "Кто путешествует",
    guestsLede: "На следующем шаге вы разместите каждого гостя в каюте.",
    done: party => `Готово · ${party}`,
  },
  counters: {
    adults: "Взрослые",
    adultsHint: "От 12 лет",
    children: "Дети",
    childrenHint: "От 2 до 11 лет",
    fewer: label => (label === "Взрослые" ? "Убрать одного взрослого" : "Убрать одного ребенка"),
    more: label => (label === "Взрослые" ? "Добавить одного взрослого" : "Добавить одного ребенка"),
  },

  suites: {
    title: "Выберите каюту или люкс",
    lede: "Все каюты на борту для выбранной даты. Разместите гостей в нужных каютах: перетащите их или укажите на карточке каюты, сколько в ней взрослых и детей.",
    mapChoice: roomId =>
      `Со схемы судна: каюта ${roomId}. Разместите гостей в каютах этого типа. Конкретную каюту мы еще раз проверим при отправке запроса; пока она не зарезервирована.`,
    everyCabin: "Все каюты этого рейса · разместите гостей",
    filterLabel: "Фильтр кают по типу",
    allRooms: "Все каюты",
    cabinCount: count => countRu(count, CABINS_RU),
    showing: (cabins, free) => `Показано: ${countRu(cabins, CABINS_RU)} · свободно на эту дату: ${free}`,
    hiddenByFilter: count => `Фильтр скрывает ${count}${NBSP}${pluralRu(count, CABINS_ACC_RU)} с вашими гостями.`,
    showAllRooms: "Показать все каюты",
    cabinAria: (roomType, index, inside, capacity) => `${roomType}, каюта ${index}, гостей: ${inside} из ${capacity}`,
    cabinOutAria: (roomType, index) => `${roomType}, каюта ${index}, недоступна на эту дату`,
    saveName: (roomType, voyage) => `${roomType}, путешествие ${voyage}`,
    inCart: roomType => `${roomType} на этот рейс — в вашей корзине.`,
    cabinNumber: index => `Каюта ${index}`,
    shownInPreview: label => `В предпросмотре: ${label}`,
    showInPreview: label => `Показать ${label} в предпросмотре`,
    selected: "Выбрано",
    select: "Выбрать",
    perCabinVoyage: "за каюту · за все путешествие",
    entireVoyage: "за все путешествие",
    upTo: capacity => upToRu(capacity),
    bed: { "Luxury King Cabin": "Большая двуспальная кровать", "Luxury Twin Cabin": "Две односпальные кровати" },
    note: {
      "Luxury King Cabin": "Большая двуспальная кровать",
      "Luxury Twin Cabin": "Две односпальные кровати",
      "Luxury Suite": "Отдельная гостиная",
      "Royal Suite": "Собственная гостиная",
    },
    viewRoomLabel: roomType => `Смотреть ${roomType} (откроется в новой вкладке)`,
    viewRoom: "Смотреть каюту",
    unavailableDate: "Недоступно на эту дату",
    seatsTaken: (inside, capacity) => `Занято мест: ${inside} из ${capacity}`,
    menuLabel: (label, cabin) => `${label} в ${cabin}`,
    empty: label => `Освободить ${label}`,
    needsAdult: "В каждой каюте должен быть хотя бы один взрослый.",
    inclusions: "Что входит в стоимость, а что нет",
    included: "Включено",
    notIncluded: "Не включено",
    // Guest labels («Взрослый 1») read as names, so they follow a colon instead of being declined.
    placeIn: (guest, cabin) => `Разместить в ${cabin}: ${guest}`,
    placeHere: "Разместить здесь",
    more: (count, shortName) => `${shortName}: еще ${count}`,
    free: count => `свободно: ${count}`,
    party: "Кто путешествует",
    partyLede:
      "Добавьте здесь гостей, а затем разместите их по каютам: перетащите их, нажмите на гостя, а затем на каюту, или воспользуйтесь меню «Взрослые» и «Дети» на карточке каюты.",
    choosing: guest => `${guest}: выберите каюту. Нажмите Esc, чтобы отменить.`,
    arrangeForMe: "Разместить автоматически",
    undoArrangement: "Отменить размещение",
    undoTitle: "Отменить размещение всех гостей?",
    undoText:
      "Размещение будет полностью отменено: каждый гость покинет свою каюту и снова окажется в разделе «Кто путешествует», а выбранных кают не останется. Число взрослых и детей не изменится.",
    keep: "Оставить мое размещение",
    undoAll: "Отменить все",
    noteBox: "На каждой каюте указано, сколько гостей она вмещает. В каждой каюте должен быть взрослый. Цены указаны за каюту на все путешествие.",
    trayLabel: "Гости, которых еще нужно разместить",
    tapCabinFor: guest => `${guest}: теперь нажмите на каюту.`,
    howTo: "Нажмите на гостя, затем на каюту — или перетащите его.",
    toPlace: count => `Осталось разместить: ${countRu(count, GUESTS_RU)}`,
    everyoneHasCabin: "Все гости размещены",
    takeOut: (guest, cabin) => `Убрать из ${cabin}: ${guest}`,
    continueToDetails: "Перейти к данным",
    backToJourney: "Назад к путешествию",
    back: "Назад",
    notices: {
      waiting: guest => `${guest} ждет размещения.`,
      placed: (guest, cabin) => `${guest} — в ${cabin}.`,
      counted: (cabin, count) => `${cabin}: ${count}.`,
      emptied: cabin => `В ${cabin} больше никого нет: гости ждут в разделе «Кто путешествует».`,
      arranged: "Ваши гости размещены по каютам. Вы можете переместить любого из них.",
      undone: "Размещение полностью отменено. Ваши гости ждут в разделе «Кто путешествует».",
    },
    tile: (guest, where) =>
      `${guest}, ${where ? `в ${where}` : "ждет размещения"}. Перетащите в каюту или выберите гостя, а затем каюту.`,
    kind: kind => (kind === "adult" ? "Взрослый" : "Ребенок"),
    arrange: {
      title: "Какие каюты вы предпочитаете?",
      lede: guests =>
        guests === 1
          ? "Выберите один или несколько типов. Мы разместим гостя с учетом вместимости каждой каюты."
          : `Выберите один или несколько типов. Мы разместим всех ${guests}${NBSP}${pluralRu(guests, GUESTS_ACC_RU)} с учетом вместимости каждой каюты.`,
      freeEach: (free, capacity) => `свободно: ${free} · ${upToGuestsRu(capacity)} в каждой`,
      go: "Разместить моих гостей",
      cancel: "Отменить",
    },
    browse: {
      tagline: {
        "Luxury King Cabin": "Тихое убежище для двоих.",
        "Luxury Twin Cabin": "Две кровати и широкие окна на Нил.",
        "Luxury Suite": "Простор и собственное джакузи.",
        "Royal Suite": "Самая просторная резиденция на борту Hathor.",
      },
      features: {
        "Luxury King Cabin": size => [
          "Большая двуспальная кровать",
          `${size} м²`,
          "Панорамный вид на Нил",
          "До 2 гостей",
          "Возможны смежные каюты",
          "Wi-Fi, обслуживание в каюте и ежедневное пополнение мини-бара",
        ],
        "Luxury Twin Cabin": size => [
          "Две односпальные кровати",
          `${size} м²`,
          "Панорамный вид на Нил",
          "До 2 гостей",
          "Возможны смежные каюты",
          "Wi-Fi, обслуживание в каюте и ежедневное пополнение мини-бара",
        ],
        "Luxury Suite": size => [
          "Собственное джакузи",
          `${size} м², отдельная гостиная`,
          "Панорамный вид на Нил",
          "До 4 гостей",
          "Широкие проходы для свободного передвижения",
          "Wi-Fi, обслуживание в каюте и ежедневное пополнение мини-бара",
        ],
        "Royal Suite": size => [
          "Собственный балкон на главной палубе",
          "Две ванные комнаты",
          `${size} м², собственная гостиная`,
          "До 4 гостей",
          "Wi-Fi, обслуживание в каюте и ежедневное пополнение мини-бара",
        ],
      },
      preview: roomType => `Предпросмотр: ${roomType}`,
      photos: roomType => `Фотографии: ${roomType}`,
      photoOf: (index, count) => `Фото ${index} из ${count}. Чтобы посмотреть другие, используйте клавиши со стрелками.`,
      photoAlt: (roomType, index, count) => `${roomType}, фото ${index} из ${count}`,
      inBooking: "В вашем бронировании",
      previousPhoto: "Предыдущее фото",
      nextPhoto: "Следующее фото",
      closePhotos: "Закрыть фото",
      photosGroup: "Фотографии",
      photo: index => `Фото ${index}`,
      selected: label => `Выбрано · ${label}`,
      perCabin: "За каюту",
      voyageMeals: nights =>
        `За все путешествие на ${countRu(nights, NIGHTS_RU)}, полный пансион и безалкогольные напитки включены.`,
      fullyBooked: "На эту дату мест нет",
      showType: (count, shortName, free) => `Показать ${shortName} (${count}) · свободно: ${free}`,
      fullDetails: "Подробнее о каюте",
    },
    tabs: {
      guests: "Гости",
      cabins: "Каюты",
      placed: (placed, total) => `Размещено: ${placed} из ${total}`,
      checkCabin: "Проверить каюту",
    },
    placeGuests: "Разместить гостей",
    checkCabins: "Проверить каюты",
    // The phone bar's amount, in its large display face: kept short.
    noCabinYet: "Не выбрано",
    continueDetailsLabel: "Перейти к данным",
    barContinueLabel: "Перейти к данным гостей",
    placeYourGuests: "Разместите гостей",
    guide: [
      { label: "Укажите, кто путешествует", hint: "Взрослые и дети" },
      { label: "Разместите каждого гостя в каюте", hint: "Перетащите, нажмите или выберите в меню" },
      { label: "Перейдите к данным", hint: "Пока ничего не зарезервировано" },
    ],
  },

  arrangement: {
    guest: (kind, number) => `${kind === "adult" ? "Взрослый" : "Ребенок"} ${number}`,
    thatCabin: "эта каюта",
    gone: "Этого гостя больше нет в вашей группе.",
    notAvailable: cabin => `${cabin} нельзя забронировать на эту дату.`,
    full: (cabin, capacity) => `В ${cabin} больше нет мест: вместимость — ${upToGuestsRu(capacity)}.`,
    childLimit: (cabin, max) => `В ${cabin} уже ${countRu(max, CHILDREN_RU)}.`,
    takesUpTo: (cabin, capacity) => `${cabin} вмещает ${upToGuestsRu(capacity)}.`,
    noneWaiting: kind =>
      `Нет ожидающих ${kind === "adult" ? "взрослых" : "детей"}. Добавьте их в разделе «Кто путешествует» или переместите кого-нибудь из другой каюты.`,
    onlyWaiting: (count, kind) =>
      `Размещения ${pluralRu(count, ["ждет", "ждут", "ждут"])} только ${countRu(count, kind === "adult" ? ADULTS_RU : CHILDREN_RU)}. Сначала добавьте гостей в разделе «Кто путешествует».`,
    stillNeed: count => `${countRu(count, GUESTS_RU)} пока без каюты.`,
    needsAdult: cabin => `В ${cabin} должен быть хотя бы один взрослый.`,
    listStillNeeds: list => `${list} пока без каюты.`,
  },

  details: {
    kicker: "Данные и оплата",
    title: "Данные и оплата",
    lede: "Еще несколько данных, чтобы завершить бронирование.",
    quote: "Более неспешный и насыщенный способ увидеть Египет.",
    panelTitle: "Данные гостей и способ оплаты",
    panelLede: "Почти готово. Укажите ваши данные и выберите удобный способ оплаты.",
    guide: [
      { label: "Данные основного гостя", hint: "Имя, почта, телефон, страна" },
      { label: "Имена пассажиров", hint: "Как в паспортах" },
      { label: "Способ оплаты и условия", hint: "Данные карты не нужны" },
      { label: "Подтвердите запрос", hint: "Каюты резервируются при отправке" },
    ],
    lead: "Данные основного гостя",
    leadLede: "Этот человек будет основным контактным лицом по вашему путешествию.",
    firstName: "Имя *",
    firstNamePlaceholder: "например, Алекс",
    lastName: "Фамилия *",
    lastNamePlaceholder: "например, Иванов",
    email: "Адрес электронной почты *",
    emailPlaceholder: "например, alex@example.com",
    country: "Страна *",
    phone: "Телефон *",
    countryCode: country => `Код страны: ${country}`,
    countryCodeMissing: "Выберите страну, чтобы указать код",
    phonePlaceholder: "Номер телефона",
    phoneNoCountry: "Сначала выберите страну",
    passengers: "Имена пассажиров (как в паспортах)",
    passengersLede: "Укажите имя каждого гостя так, как оно написано в паспорте, каюта за каютой.",
    fullName: guest => `${guest}: полное имя *`,
    requests: "Особые пожелания (необязательно)",
    requestsPlaceholder: "Торжества, смежные каюты или что-то еще, о чем нам следует знать.",
    paymentTitle: "Предпочтительный способ оплаты",
    paymentLede:
      "Выберите удобный способ оплаты. Счет и инструкции по оплате вам пришлет отдел бронирования Hathor. На этом сайте данные карты не запрашиваются.",
    card: "Visa / оплата картой",
    cardNote: `Взимается комиссия ${SURCHARGE_RU} за онлайн-оплату. Hathor пришлет счет позже — номер карты здесь не сохраняется.`,
    surchargeNote: breakdown =>
      `При онлайн-оплате картой взимается комиссия ${SURCHARGE_RU}, она уже включена в итоговую сумму${breakdown ? `: ${breakdown}` : ""}. При банковском переводе комиссии нет.`,
    bank: "Банковский перевод",
    bankNote: "Без комиссии. Оплата международным банковским переводом по инструкциям в вашем счете.",
    schedule: "График платежей",
    scheduleNote:
      "После отправки запроса на бронирование отдел бронирования Hathor проверит данные и пришлет счет с инструкциями по оплате. Каюты резервируются за вами в момент отправки этого запроса.",
    includedTitle: "В стоимость путешествия входит",
    inclusions: [
      "Трансфер из аэропорта Асуана или Луксора и обратно",
      "НДС и сервисные сборы",
      "Приветственный напиток по прибытии",
      "Soft All-Inclusive: питание и безалкогольные напитки",
      "Входные билеты на экскурсии по маршруту",
      "Гид-египтолог",
      "Услуги прачечной и ежедневное пополнение мини-бара",
      "Wi-Fi, обслуживание в каюте, принадлежности для чая и кофе",
    ],
    terms: "Условия",
    termsBefore: "Я подтверждаю ознакомление с",
    termsLink: "условиями бронирования и отмены",
    termsAfter: "и понимаю, что отправляю запрос на бронирование, а не оформляю подтвержденное бронирование.",
    marketing: "Получать новости о путешествиях и предложениях Hathor. (необязательно)",
    backToSuites: "← Назад к гостям и каютам",
    sending: "Отправляем запрос…",
    confirm: "Подтвердить запрос",
    noPayment: "На этом шаге оплата не взимается.",
    countrySearch: "Поиск страны",
    noCountry: query => `По запросу «${query}» страна не найдена.`,
    tabs: {
      // Short: four tabs share a 375px phone.
      lead: "Контакт",
      complete: "Готово",
      yourDetails: "Ваши данные",
      passengers: "Пассажиры",
      named: (named, total) => `Имена: ${named} из ${total}`,
      payment: "Оплата",
      withTerms: method => `${method} · условия`,
      thenConfirm: "Затем подтвердите",
      review: "Обзор",
    },
    methodShort: bank => (bank ? "Перевод" : "Карта"),
    methodLong: bank => (bank ? "Банковский перевод" : "Visa / оплата картой"),
    paymentSub: bank =>
      bank
        ? "Счет и инструкции по оплате придут по электронной почте."
        : `При оплате взимается комиссия ${SURCHARGE_RU} за оплату картой. Счет и инструкции по оплате придут по электронной почте.`,
    withSurcharge: partySub => `${partySub} · вкл. комиссию ${SURCHARGE_RU} за оплату картой`,
    changePayment: "Изменить способ оплаты",
    reviewTitle: "Проверьте ваше путешествие",
    reviewLede: "Еще раз проверьте все данные, затем подтвердите запрос ниже.",
    soFarTitle: "Ваше путешествие сейчас",
    soFarLede: "Пока вы не отправите запрос, ничего не резервируется.",
    sendingShort: "Отправка…",
    barConfirm: "Подтвердить",
    barSending: "Отправка…",
    barConfirmLabel: "Подтвердить запрос с панели путешествия",
    errors: {
      firstName: "Пожалуйста, укажите имя основного гостя.",
      lastName: "Пожалуйста, укажите фамилию основного гостя.",
      email: "Пожалуйста, укажите действительный адрес электронной почты.",
      country: "Пожалуйста, выберите страну.",
      phone: "Пожалуйста, проверьте номер телефона.",
      phoneNoCountry: "Сначала выберите страну, затем введите номер.",
      names: list => `Пожалуйста, укажите полное имя, как в паспорте: ${list}.`,
      terms: "Пожалуйста, примите условия бронирования и отмены.",
    },
    remind: "Перед отправкой запроса, пожалуйста, укажите: ",
    reminder: {
      firstName: "имя основного гостя",
      lastName: "фамилию основного гостя",
      email: "действительный адрес электронной почты",
      country: "вашу страну",
      phoneValid: "действительный номер телефона",
      phone: "ваш номер телефона",
      // Singular or plural noun for the list itself; no number is shown.
      names: (count, list) => `${count > 1 ? "полные имена" : "полное имя"} (${list})`,
      terms: "согласие с условиями бронирования",
    },
  },

  alerts: {
    tryAgain: "Пожалуйста, попробуйте еще раз.",
    cartSailingClosed: date => `Рейс в вашей корзине (${date}) больше недоступен. Пожалуйста, выберите другую дату.`,
    cartCabinClosed: roomId =>
      `Каюта ${roomId} на этот рейс больше недоступна. Выберите другую дату или отмените выбор на схеме ниже.`,
    availabilityUnavailable: "Сведения о наличии мест сейчас недоступны.",
    cannotFit: (types, guests) =>
      `${types === 1 ? "Каюты этого типа" : "Каюты этих типов"} не могут вместить всех ${guests}${NBSP}${pluralRu(guests, GUESTS_ACC_RU)} на эту дату. Выберите дополнительно другой тип.`,
    trimmed: names =>
      names.length > 1
        ? `Выбранные вами каюты ${ruJoin(names)} только что забронировал другой гость. Гости из этих кают ждут в разделе «Кто путешествует» — пожалуйста, разместите их снова.`
        : `Выбранную вами каюту ${names[0] ?? ""} только что забронировал другой гость. Ее гости ждут в разделе «Кто путешествует» — пожалуйста, разместите их снова.`,
    chooseDateFirst: "Сначала выберите одну из открытых дат рейса.",
    securityCheck: "Пожалуйста, пройдите проверку безопасности перед отправкой запроса на бронирование.",
    sailingClosed: "Этот рейс только что закрыт. Пожалуйста, выберите другую дату.",
    sailingFull: "На этот рейс мест больше нет. Пожалуйста, выберите другую дату.",
    unableToCheck: "Не удалось проверить наличие мест.",
    cabinClosed: roomId => `Каюта ${roomId} больше недоступна. Выберите другую дату или отмените выбор на схеме.`,
    placeInPreferred: (roomId, above) =>
      `Разместите гостей в каютах выбранного типа или отмените выбор каюты ${roomId}${above ? " выше" : ""}, чтобы выбрать свободно.`,
    closedNothingAdded: "Этот рейс только что закрыт, поэтому в корзину ничего не добавлено.",
    typeBooked: roomType => `${roomType} на этот рейс только что забронировали, поэтому добавить в корзину не удалось.`,
    couldNotCheck: "Сейчас не удалось проверить наличие мест, поэтому ничего не добавлено. Пожалуйста, попробуйте еще раз.",
    totalChanged: amount =>
      `Стоимость путешествия для этих кают теперь составляет ${amount}. Пожалуйста, проверьте ее и снова нажмите «Подтвердить запрос».`,
    cabinTaken:
      "Одну из ваших кают только что забронировал другой гость. Сведения о наличии мест обновлены. Пожалуйста, проверьте каюты и попробуйте еще раз.",
    notSent: "Не удалось отправить запрос.",
    sendFailed: reason =>
      `${reason} За вами ничего не зарезервировано, поэтому повторное нажатие «Подтвердить запрос» отправит новый запрос.`,
  },

  plan: {
    custom: "Этот график для вашего бронирования составлен Hathor: первый счет, затем остаток суммы до указанной даты.",
    rules: {
      3: "Бронирование более чем за 60 дней до отправления: 30% по первому счету, 20% не позднее чем за 60 дней до отправления и оставшиеся 50% не позднее чем за 45 дней.",
      2: "Бронирование за 46–60 дней до отправления: 50% по первому счету и остальные 50% не позднее чем за 45 дней до отправления.",
      1: "Бронирование за 45 дней или менее до отправления: вся сумма по первому счету.",
    },
    names: {
      1: ["Полная оплата"],
      2: ["Первый счет", "Итоговый счет"],
      3: ["Первый счет", "Второй счет", "Итоговый счет"],
    },
    invoice: index => `Счет ${index}`,
    paid: "Оплачено",
    paidByThen: amount => `К этой дате оплачено: ${amount}`,
    whole: "Все путешествие",
    rulesLabel: "Как распределяется оплата",
  },

  result: {
    reservation: "Бронирование",
    newSearch: "Начать новый поиск",
    contact: "Связаться с Hathor",
    notFound: "Бронирование не найдено",
    noReference: "Мы не нашли номер бронирования. Пожалуйста, проверьте ссылку или начните новый поиск.",
    loadFailed: "Не удалось загрузить бронирование",
    loadFailedText:
      "Не удалось загрузить ваши данные. Пожалуйста, попробуйте еще раз чуть позже или свяжитесь с нашим отделом бронирования.",
    noBooking:
      "Мы не нашли бронирование с таким номером. Возможно, срок его действия истек или ссылка неполная.",
    status: {
      REQUESTED: "Запрос получен",
      PENDING_HOLD: "Временный резерв",
      CONFIRMED: "Подтверждено",
      CANCELLED: "Отменено",
      EXPIRED: "Срок истек",
    },
    method: method => (method === "BANK_TRANSFER" ? "Банковский перевод" : method === "VISA" ? "Visa" : "—"),
    guideHeading: "Что будет дальше",
    guide: [
      { label: "Запрос отправлен", hint: "Оплата не списана" },
      { label: "Hathor проверяет запрос", hint: "Мы подтверждаем каюты и сумму" },
      { label: "Счет и оплата", hint: "По почте, для выбранного способа" },
      { label: "Бронирование подтверждено", hint: "После зачисления оплаты" },
    ],
    cabinsToConfirm: "Каюты уточняются",
    // The voyage bar's total label: short, so the code stays on one line.
    booking: code => `Код ${code}`,
    returnHome: "Вернуться к Hathor",
    requestSent: "Запрос отправлен",
    titleSent: "Запрос отправлен",
    titleConfirmed: "Бронирование подтверждено",
    titleOther: "Ваше бронирование",
    ledeSent: "Благодарим вас за выбор Hathor. Мы свяжемся с вами и пришлем счет.",
    ledeOther: "Текущий статус вашего путешествия по Нилу.",
    quote: "Роскошь. Наследие. Причастность.",
    submitted: "Ваш запрос на бронирование успешно отправлен.",
    confirmedText: "В Hathor приняли ваше бронирование и зарегистрировали необходимый платеж.",
    currentStatus: "Это текущий статус вашего бронирования.",
    headingSent: "Ваш запрос на бронирование отправлен",
    headingConfirmed: "Ваше бронирование подтверждено.",
    headingOther: "Ваше бронирование.",
    sentNote:
      "Благодарим вас за выбор Hathor. Наш отдел бронирования рассмотрит ваш запрос и свяжется с вами, чтобы прислать счет и инструкции по оплате. Это еще не подтвержденное бронирование, и на этом сайте оплата не взималась.",
    code: "Код бронирования · по нему можно отслеживать это бронирование",
    emailed: email => `Копия этого запроса отправлена на адрес ${email}.`,
    emailFailed:
      "Ваш запрос сохранен, но письмо с подтверждением доставить не удалось. Пожалуйста, обратитесь к нам, чтобы мы могли с вами связаться.",
    emailPending: "Ваш запрос сохранен. Письмо с подтверждением уже в пути.",
    preferredMethod: "Предпочтительный способ оплаты",
    next: "Что будет дальше?",
    reviewTitle: "Отдел бронирования Hathor рассматривает ваш запрос",
    reviewText: "Мы проверяем каюту и итоговую стоимость путешествия.",
    invoiceSent: "Счет отправлен",
    invoiceComing: "Вы получите счет и инструкции по оплате",
    invoiceCheck: email =>
      `${email ? `Проверьте почту ${email}` : "Проверьте свою почту"}: в письме будут указаны сумма к оплате и способ оплаты.`,
    invoiceBy: "Отправляется по электронной почте для выбранного вами способа оплаты.",
    confirmedTitle: "Бронирование подтверждается после зачисления оплаты",
    confirmedTextNext: "Как только Hathor примет запрос и необходимый платеж будет зачислен.",
    summary: "Сводка бронирования",
    guestSummary: (adults, children, fallback) =>
      adults !== null && children !== null ? `${countRu(adults, ADULTS_RU)}, ${countRu(children, CHILDREN_RU)}` : fallback,
    route: route => placesRu(route),
    total: "Общая сумма бронирования",
    taxes: "Налоги и сервисные сборы включены.",
    surchargeTaxes: amount =>
      `Включает комиссию ${SURCHARGE_RU} за онлайн-оплату картой в размере ${amount}. Налоги и сервисные сборы включены.`,
    timeline: "График платежей",
    here: "Мы всегда на связи",
    concierge: "Наша команда консьержей всегда с радостью ответит на любые ваши вопросы.",
    hours: "Часы работы: ежедневно 09:00–17:00. Выходной: пятница.",
    reply: "Или просто ответьте на письмо с подтверждением.",
    viewRequest: "Посмотреть мой запрос",
  },

  lookup: {
    title: "Отслеживание бронирования",
    lede: "Введите код бронирования из письма (например, HB-3F2A91C0) и адрес электронной почты, указанный при бронировании.",
    code: "Код бронирования",
    email: "Электронная почта",
    checking: "Проверяем…",
    track: "Отследить бронирование",
    newReservation: "Начать новое бронирование",
    notFound: "Не удалось найти бронирование",
  },
  error: {
    pageTitle: "Произошла ошибка | Hathor Dahabiya",
    title: "Ваше бронирование прервано",
    bodyBefore: "При загрузке этой страницы возникла проблема.",
    bodyStrong: "Если вы уже дошли до шага подтверждения, ваше бронирование, вероятно, уже отправлено",
    bodyAfter: " — пожалуйста, проверьте почту, прежде чем бронировать снова.",
    tryAgain: "Попробовать снова",
    home: "На главную",
    helpBefore: "Проблема не решена? Напишите на",
    helpAfter: "— и мы оформим ваше бронирование вручную.",
    reference: "Код ошибки:",
  },
  unverified: {
    kicker: "Выбор каюты",
    title: "Нам не удалось проверить эту каюту.",
    text: "Бронирование не начато. Обновите страницу, чтобы проверить еще раз, или выберите другую каюту.",
    link: "Смотреть все каюты ↗",
  },
  meta: {
    title: "Забронируйте люкс-круиз на дахабии",
    description:
      "Выберите путешествие по Нилу, дату рейса и каюту на борту Hathor Dahabiya, затем отправьте запрос на бронирование в наш отдел бронирования.",
  },
};
