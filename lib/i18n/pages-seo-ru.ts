import { localePage } from "@/lib/i18n/pages-seo";

/**
 * Search settings and structured-data words for the Russian content pages.
 * Language, hreflang and the search switch come from the shared builder.
 * Titles lead with the Russian head terms («круиз по Нилу на дахабии»,
 * «люкс-круиз по Нилу»). Server-only.
 */
export const RUSSIAN_PAGES = {
  about: localePage({
    path: "/ru/about",
    title: "Круиз по Нилу на дахабии в Египте | О Hathor",
    description:
      "Hathor — люкс-круиз по Нилу в Египте на дахабии для 32 гостей: восемь кают, два люкса и два Royal Suite, плавание между Луксором и Асуаном, свой экипаж.",
    name: "О Hathor Dahabiya | Частное плавание по Нилу",
    crumb: "О нас",
  }),
  contact: localePage({
    path: "/ru/contact",
    title: "Контакты Hathor Dahabiya | Бронирование круизов по Нилу",
    description:
      "Свяжитесь с отделом бронирования Hathor в Каире: даты путешествий, частный чартер и наличие мест в люксах. Ежедневно 09:00–17:00, пятница — выходной.",
    name: "Контакты Hathor Dahabiya | Бронирование круизов по Нилу",
    crumb: "Контакты",
  }),
  gastronomy: localePage({
    path: "/ru/gastronomy",
    title: "Кухня люкс-круиза по Нилу | Гастрономия на борту Hathor",
    description:
      "Гастрономия люкс-круиза по Нилу на борту Hathor Dahabiya: египетские вкусы, внимательный сервис и трапезы в зале и на палубе между Луксором и Асуаном.",
    name: "Кухня на Ниле | Гастрономия Hathor Dahabiya",
    crumb: "Кухня",
  }),
  suites: localePage({
    path: "/ru/suites",
    title: "Роскошные люксы для круиза по Нилу | Hathor Dahabiya",
    description:
      "Откройте для себя люксы Hathor для круиза по Нилу: просторные апартаменты с панорамным остеклением, уединенный комфорт и камерность дахабии на 32 гостя.",
    name: "Роскошные люксы для круиза по Нилу | Hathor Dahabiya",
    crumb: "Люксы",
    image: {
      url: "/media/hathor/optimized/scraped-suites-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Роскошные люксы на борту Hathor Dahabiya",
    },
  }),
  wellness: localePage({
    path: "/ru/wellness",
    title: "Seneb Spa на Ниле | Велнес на борту Hathor Dahabiya",
    description:
      "Seneb Spa и Historia Fitness на борту Hathor Dahabiya: восстанавливающие процедуры и тренировки с видом на реку между Луксором и Асуаном.",
    name: "Seneb Spa на Ниле | Велнес на борту Hathor Dahabiya",
    crumb: "Велнес",
  }),
  highlights: localePage({
    path: "/ru/highlights",
    title: "Что увидеть в круизе по Нилу | Храмы от Луксора до Асуана",
    description:
      "Дни на берегу с Hathor Dahabiya: Карнак, Долина царей, Эдфу, Ком-Омбо и Филе — неспешные визиты, а не список для галочки.",
    name: "Что увидеть в круизе по Нилу | Храмы от Луксора до Асуана",
    crumb: "Достопримечательности",
    image: {
      url: "/media/hathor/r2/highlights-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Храмы на маршруте круиза по Нилу с Hathor Dahabiya",
    },
  }),
  partners: localePage({
    path: "/ru/partners",
    title: "Туристические партнеры | Hathor Dahabiya",
    description:
      "Партнеры в сфере туризма и гостеприимства, которые разделяют стандарты Hathor Dahabiya в частных путешествиях по Нилу и заботе о гостях в Египте.",
    name: "Туристические партнеры | Hathor Dahabiya",
    crumb: "Партнеры",
  }),
  terms: localePage({
    path: "/ru/terms-and-conditions",
    title: "Правила и условия Hathor Dahabiya | Условия бронирования",
    description:
      "Ознакомьтесь с условиями Hathor Dahabiya: бронирование, оплата, отмена, что включено, обязанности гостей и правила путешествий по Нилу между Луксором и Асуаном.",
    name: "Правила и условия Hathor Dahabiya | Условия бронирования",
    crumb: "Условия",
  }),
  blogs: localePage({
    path: "/ru/blogs",
    title: "Блог о люкс-круизе по Нилу в Египте | Советы и истории",
    description:
      "Советы и истории о люкс-круизе по Нилу в Египте: когда плыть на дахабии, храмы Луксора и Асуана, сборы в дорогу, каюты и неспешный ритм путешествий Hathor.",
    name: "Журнал о круизах по Нилу | Истории Hathor Dahabiya",
    crumb: "Журнал",
    image: {
      url: "/media/hathor/r2/blog-hero.webp",
      width: 1920,
      height: 1280,
      alt: "Истории журнала Hathor с Нила в Египте",
    },
  }),
} as const;
