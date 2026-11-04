/** The selection sheet and the Add to My Voyage dialog in Russian; see selection-copy.ts. */

import { describeRoomTypesOnCruise } from "@/lib/booking-search-config";
import { everyWeekdayRu, placesRu } from "@/lib/i18n/catalog-copy-ru";
import { DAYS_RU, NIGHTS_RU, countRu, upToGuestsRu } from "@/lib/i18n/format-ru";
import type { SelectionCopy, SummaryWords } from "@/lib/i18n/selection-copy";

/** "До 4 гостей": the capacity at the start of a line. */
const upToRu = (capacity: number) => {
  const text = upToGuestsRu(capacity);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const SELECTION_COPY_RU: SelectionCopy = {
  dateLocale: "ru-RU",
  eyebrow: "Ваш выбор",
  tabsLabel: "Выбранное",
  favoritesTab: "Избранное",
  closeSelection: "Закрыть панель выбора",
  close: "Закрыть",
  nothingSaved: "Пока ничего не сохранено",
  nothingSavedBody:
    "Познакомьтесь с путешествиями, каютами и люксами Hathor и сохраните то, что вам по душе. Все это будет ждать вас здесь, когда вы вернетесь.",
  exploreHathor: "Познакомиться с Hathor",
  viewDetails: "Подробнее",
  remove: "Удалить",
  removeLabel: (title) => `Удалить ${title} из избранного`,
  decrease: (label) => `${label}: на одного меньше`,
  increase: (label) => `${label}: на одного больше`,
  chooseVoyage: "Выберите путешествие, чтобы завершить выбор.",
  journeyOffers: (duration) => {
    // The catalog names the accommodation types in English; only the words around them change.
    const types = describeRoomTypesOnCruise(duration);
    return types === "a different room type"
      ? "В этом путешествии предлагается другой тип размещения."
      : `В этом путешествии доступны: ${types.replace(/, or /, " или ")}.`;
  },
  beginsTitle: "Ваше путешествие начинается здесь",
  beginsBody:
    "Выберите маршрут и размещение, чтобы начать создавать свое путешествие на борту Hathor.",
  exploreVoyages: "Смотреть маршруты",
  journey: "Путешествие",
  ports: (ports) => placesRu(ports),
  nightsDays: (nights, days) => `${countRu(nights, NIGHTS_RU)} / ${countRu(days, DAYS_RU)}`,
  departs: (day) => `Отправление ${everyWeekdayRu(day)}`,
  sailing: (date) => `Рейс: ${date}`,
  changeJourney: "Изменить маршрут",
  accommodation: "Размещение",
  upTo: (capacity) => upToRu(capacity),
  sizeCapacity: (sizeSqm, capacity) => `${sizeSqm} м² · ${upToRu(capacity)}`,
  voyageType: "Путешествие",
  charterType: "Чартер",
  viewSuite: "Смотреть люкс",
  guests: "Гости",
  adults: "Взрослые",
  children: "Дети",
  partyNote: "Вся ваша группа. Каюты для гостей вы выберете, когда продолжите бронирование.",
  privateCharter: "Частный чартер",
  charterMeta: "Дахабия только для вас.",
  viewCharter: "Смотреть чартер",
  indicativeFrom: "Ориентировочно от",
  priceNote:
    "Ориентировочная цена по каталогу за каюту. Окончательную стоимость и наличие мест подтверждает наш отдел бронирования.",
  requestVoyage: "Запросить это путешествие",
  continueBooking: "Продолжить бронирование",
  continueExploring: "Продолжить знакомство",
  changeTitle: "При смене путешествия выбранное размещение может измениться.",
  changeBody: (voyage) =>
    `На маршруте ${voyage} нет вашего текущего размещения. Если вы продолжите, новое путешествие сохранится, а размещение будет сброшено, чтобы вы могли выбрать его заново.`,
  continue: "Продолжить",
  keepCurrent: "Оставить текущее путешествие",
  toCharterTitle: "При переходе на частный чартер выбранное путешествие будет сброшено.",
  toCharterBody:
    "Частный чартер предоставляет вашей группе всю дахабию с собственным маршрутом, поэтому он заменяет путешествие по расписанию и размещение в разделе «Мое путешествие».",
  fromCharterTitle: "При выборе путешествия по расписанию частный чартер будет удален.",
  fromCharterBody:
    "В разделе «Мое путешествие» может быть либо частный чартер, либо путешествие по расписанию. Если вы продолжите, чартер будет удален, а вместо него добавится этот выбор.",
  keepCharter: "Оставить частный чартер",
};

/*
 * These are fixed replacement patterns ($1, $2 are the numbers), so the counts
 * use abbreviations that read right with any number: «3 ноч. / 4 дн.», «2 взр.».
 */
export const SUMMARY_WORDS_RU: SummaryWords = {
  labels: {
    "Enquiry type": "Тип запроса",
    "Selected Journey": "Выбранное путешествие",
    Route: "Маршрут",
    Duration: "Продолжительность",
    "Departure day": "День отправления",
    "Selected Accommodation": "Выбранное размещение",
    "Accommodation detail": "Подробности размещения",
    Guests: "Гости",
    "Guest also saved": "Также в избранном",
  },
  notCarriedOver: "Не перенесено — сохраненное размещение не предлагается на этом маршруте.",
  privateCharter: "Частный чартер",
  nightsDays: "$1 ноч. / $2 дн.",
  nightsShort: "($1 ноч., ",
  upToGuests: "до $1 гостей",
  guestWords: { Adult: "взр.", Adults: "взр.", Child: "реб.", Children: "реб." },
};
