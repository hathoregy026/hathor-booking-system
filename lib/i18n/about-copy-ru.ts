/** The About page's own words (not dashboard text) in Russian. */
import type { AboutCopy } from "@/lib/i18n/about-copy";

export const ABOUT_COPY_RU: AboutCopy = {
  runLabel: "О Hathor Dahabiya",
  navLabel: "Разделы страницы",
  nav: { about: "О нас", stay: "Проживание", dining: "Кухня", reserve: "Бронирование" },
  scroll: "Листайте",
  alts: {
    hero: "Hathor Dahabiya на Ниле",
    suite: "Люкс на борту Hathor",
    dining: "Трапеза на борту Hathor",
    life: "Жизнь на борту Hathor",
    river: "Hathor на реке",
    craft: "Мастерство на борту Hathor",
    cabin: "Каюта на борту Hathor",
    restaurant: "Крытый ресторан на борту Hathor",
    bar: "Бар на борту Hathor",
    fineDining: "Высокая кухня на борту Hathor",
    legacy: "Наследие Hathor на Ниле",
    deck: "Отдых на палубе Hathor",
    royalExperience: "Проживание в люксе Royal Suite",
    diningExperience: "Гастрономические впечатления",
    card: "Hathor Dahabiya",
  },
  aboardAlt: (title) => `${title} на борту Hathor`,
  leadCaption: "На борту · Три палубы · 32 гостя",
  manifesto: ["Дахабия", "Откройте Египет", "в совершенно", "новом свете"],
  principles: [
    {
      title: "Каюты",
      text: "Восемь роскошных кают с изысканным комфортом — 22 м² современной жизни на Ниле, с собственной ванной комнатой и умными системами.",
    },
    {
      title: "Люксы",
      text: "Два элегантных люкса на нижней палубе — 46 м² неповторимой роскоши с панорамным видом на Нил и собственным джакузи.",
    },
    {
      title: "Royal",
      text: "Два великолепных люкса Royal Suite на главной палубе — 56 м², настоящая жемчужина судна, созданная для тех, кто ищет исключительного.",
    },
  ],
  stays: [
    { meta: "22 м²", place: "Нижняя палуба", title: "Каюта" },
    { meta: "46 м²", place: "Нижняя палуба", title: "Люкс" },
    { meta: "56 м²", place: "Главная палуба", title: "Royal" },
  ],
  experience: "Впечатления",
  diningLines: ["Изысканная кухня", "на лучшей дахабии", "Египта"],
  exploreDining: "Подробнее о кухне",
  welcomeFallback: "Добро пожаловать на борт",
  epilogue: ["Вечная роскошь", "на Ниле"],
  bookNow: "Забронировать",
  exploreCruises: "Смотреть круизы",
  cardTitle: "Дахабия",
  cardBody: ["Три палубы тишины", "в частном круизе по Нилу"],
};
