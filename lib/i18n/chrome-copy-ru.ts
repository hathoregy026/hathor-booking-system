/**
 * Site chrome in Russian. Polite «вы» in sentences; buttons and links use the
 * infinitive («Забронировать», «Связаться»). Product names stay in Latin
 * letters: Hathor, Seneb Spa, Luxury Suite, Royal Suite.
 */
import type { ChromeCopy } from "@/lib/i18n/chrome-copy";
import { countRu, DAYS_RU } from "@/lib/i18n/format-ru";

const HOURS_RU = ["час", "часа", "часов"] as const;
const MINUTES_RU = ["минута", "минуты", "минут"] as const;

export const CHROME_COPY_RU: ChromeCopy = {
  nav: {
    groups: {
      suites: "Люксы",
      cruises: "Круизы",
      experiences: "Впечатления",
      about: "О нас",
    },
    links: {
      "/": { label: "Главная" },
      "/suites": {
        label: "Люксы",
        description: "Роскошное уединение на борту Hathor",
      },
      "/luxury-cabins-Nile-Cruise": {
        label: "Luxury Rooms",
        description: "Каюты с видом на Нил и сдержанной элегантностью",
      },
      "/rooms": {
        label: "Luxury Suites",
        description: "Просторные апартаменты на палубе",
      },
      "/royal-suites": {
        label: "Royal Suites",
        description: "Наши лучшие каюты на Ниле",
      },
      "/voyages": {
        label: "Круизы",
        description: "Частные маршруты дахабии по Нилу",
      },
      "/cruises-list": {
        label: "Расписание рейсов",
        description: "Присоединяйтесь к рейсу по Нилу",
      },
      "/charter": {
        label: "Частный чартер",
        description: "Дахабия только для вас",
      },
      "/highlights": {
        label: "Достопримечательности",
        description: "Древние чудеса на берегах реки",
      },
      "/wellness": {
        label: "Велнес и спа",
        description: "Seneb Spa — плавучий оазис",
      },
      "/gastronomy": {
        label: "Кухня",
        description: "Изысканная кухня на воде",
      },
      "/about": {
        label: "Наша история",
        description: "Добро пожаловать на борт Hathor",
      },
      "/partners": {
        label: "Партнеры",
        description: "Те, с кем мы в пути",
      },
      "/blogs": { label: "Журнал" },
      "/contact": { label: "Контакты" },
    },
  },
  header: {
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    phoneTools: "Быстрый доступ",
    showGroupPages: (group) => `Показать страницы раздела «${group}»`,
    groupPages: (group) => `Страницы раздела «${group}»`,
    exploreLabel: "Обзор",
    exploreMenu: "Меню навигации",
    closeExplore: "Закрыть меню навигации",
    followUs: "Следите за нами",
    followVoyage: "Следите за путешествием",
    socialLinks: "Социальные сети",
    navLeft: "Основная навигация, слева",
    navRight: "Основная навигация, справа",
    siteLogo: "Логотип сайта",
  },
  menu: {
    kicker: "Роскошные путешествия по Нилу",
    siteMenu: "Меню сайта",
    primary: "Основное меню",
    closeMenu: "Закрыть меню",
    privacy: "Политика конфиденциальности",
    terms: "Правила и условия",
    privacyHref: "/contact",
    termsHref: "/terms-and-conditions",
    bookNow: "Забронировать",
  },
  language: {
    eyebrow: "Язык",
    code: "Ru",
    activeName: "Русский",
    names: {
      /* A live language is always named in itself, so its speakers find it. */
      en: "English",
      it: "Italiano",
      de: "Deutsch",
      ru: "Русский",
    },
    toggleLabel: (active) => `Язык: ${active}. Выберите язык`,
    closeMenu: "Закрыть меню языков",
  },
  theme: {
    day: "день",
    night: "ночь",
    toNight: "Включить ночной режим",
    toDay: "Включить дневной режим",
    dayTitle: "Дневной режим",
    nightTitle: "Ночной режим",
    dayStatus: "Дневной режим, включить ночной режим",
    nightStatus: "Ночной режим, включить дневной режим",
  },
  hero: {
    regionLabel: "Вступление",
    discover: "Откройте необыкновенное",
    scrollHint: "Листайте",
    location: ["ЛУКСОР", "АСУАН"],
    playFilm: "Воспроизвести фоновое видео",
    pauseFilm: "Приостановить фоновое видео",
    filmAlt: "Hathor Dahabiya под парусом на Ниле",
    bookNow: "Забронировать",
  },
  contact: {
    bookNow: "Забронировать",
    contact: "Связаться",
    openLinks: "Открыть способы связи",
    closeLinks: "Закрыть способы связи",
    call: (phone) => `Позвонить по номеру ${phone}`,
  },
  selection: {
    save: "Сохранить",
    saved: "Сохранено",
    saveLabel: (name) => `Добавить ${name} в избранное`,
    savedLabel: (name) => `Сохранено — удалить ${name} из избранного`,
    /* Short form: it shares one button row with Save, Book now and Voyages. */
    addToVoyage: "В путешествие",
    inVoyage: "В моем путешествии",
    addToVoyageLabel: (name) => `Добавить ${name} в «Мое путешествие»`,
    inVoyageLabel: (name) => `${name} уже в «Моем путешествии»`,
    myFavorites: "Мое избранное",
    myVoyage: "Мое путешествие",
    favoritesCount: (count) =>
      count > 0
        ? `Мое избранное, сохранено: ${count}`
        : "Мое избранное, пока ничего не сохранено",
    voyageCount: (count) =>
      count > 0
        ? `Мое путешествие, выбрано: ${count}`
        : "Мое путешествие, пока ничего не выбрано",
  },
  footer: {
    /* Short enough for a phone, as in Italian: the word for "story" is dropped. */
    titleLines: ["ВАШ НИЛ", "НАЧИНАЕТСЯ ЗДЕСЬ"],
    script: "Приключения на Ниле",
    eyebrow: "Индивидуальное бронирование",
    bookNow: "Забронировать",
    charter: "Арендовать судно",
    address: "One Kattamiya, Tower 211, 11-й этаж, кв. 111, Ring Road, Каир, Египет",
    workingHours: "Часы работы: ежедневно 09:00–17:00",
    columns: [
      {
        id: "explore",
        title: "Обзор",
        links: [
          { href: "/cruises-list", label: "Круизы" },
          { href: "/suites", label: "Люксы" },
          { href: "/luxury-cabins-Nile-Cruise", label: "Каюты" },
          { href: "/charter", label: "Частный чартер" },
        ],
      },
      {
        id: "aboard",
        title: "На борту",
        links: [
          { href: "/gastronomy", label: "Гастрономия" },
          { href: "/wellness", label: "Seneb Spa" },
          { href: "/royal-suites", label: "Royal Suites" },
          { href: "/about", label: "О нас" },
        ],
      },
      {
        id: "route",
        title: "Маршрут",
        links: [
          { href: "/voyages", label: "Все путешествия" },
          { href: "/voyages/luxor-to-aswan", label: "Из Луксора в Асуан" },
          { href: "/voyages/aswan-to-luxor", label: "Из Асуана в Луксор" },
          { href: "/highlights", label: "Достопримечательности" },
        ],
      },
    ],
    utility: [
      { href: "/contact", label: "Контакты" },
      { href: "/blogs", label: "Журнал" },
      { href: "/partners", label: "Партнеры" },
      { href: "/terms-and-conditions", label: "Условия" },
    ],
    utilityLabel: "Правовая информация и контакты",
    country: "Египет",
    backToTop: "Вернуться к началу страницы",
  },
  occasion: {
    hide: (name) => `Скрыть сообщение «${name}»`,
    units: {
      days: ["Дней", "Дн."],
      hours: ["Часов", "Час."],
      minutes: ["Минут", "Мин."],
      seconds: ["Секунд", "Сек."],
    },
    timer: (caption, days, hours, minutes) =>
      `${caption}: ${countRu(days, DAYS_RU)}, ${countRu(hours, HOURS_RU)}, ${countRu(minutes, MINUTES_RU)}`,
    dayMark: "д",
  },
};
