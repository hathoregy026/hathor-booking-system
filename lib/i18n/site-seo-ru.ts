import type { Metadata } from "next";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Russian search settings for the homepage, private charter and scheduled
 * sailings. Language, hreflang, og:locale and the search switch
 * (LOCALE_INDEXED in lib/i18n/locale.ts) come from the shared builder.
 * Head terms: «круиз по Нилу на дахабии», «люкс-круиз по Нилу», «чартер дахабии».
 */
export const HOME_SEO_RU: Metadata = buildPageMetadata({
  title: "Люкс-круиз по Нилу на дахабии | Hathor Dahabiya",
  description:
    "Частная дахабия класса люкс на Ниле между Луксором и Асуаном: 32 гостя, люксы с видом на Нил, изысканная кухня и неспешные дни у храмов на борту Hathor.",
  path: "/ru",
  image: {
    url: HATHOR_HERO_POSTER_SRC,
    width: 1920,
    height: 1080,
    alt: "Hathor Dahabiya — люкс-круиз по Нилу на дахабии между Луксором и Асуаном",
  },
});

export const CHARTER_SEO_TITLE_RU = "Чартер дахабии | Частный круиз по Нилу в Египте | Hathor";

export const CHARTER_SEO_RU: Metadata = buildPageMetadata({
  title: CHARTER_SEO_TITLE_RU,
  description:
    "Арендуйте дахабию класса люкс целиком: все судно Hathor для группы до 32 гостей, свой экипаж и шеф-повар, частный круиз по Нилу в Египте из Луксора в Асуан.",
  path: "/ru/charter",
  image: {
    url: "/media/hathor/r2/charter-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Hathor Dahabiya в частном чартере под парусом на Ниле в Египте",
  },
});

export const CRUISES_LIST_SEO_RU: Metadata = buildPageMetadata({
  title: "Расписание рейсов Hathor | Забронировать круиз по Нилу",
  description:
    "Даты отправления и наличие мест в каютах Hathor Dahabiya: круизы по Нилу на дахабии на три, четыре и семь ночей между Луксором и Асуаном.",
  path: "/ru/cruises-list",
});

export const CRUISES_LIST_PAGE_RU = {
  name: "Расписание рейсов Hathor | Забронировать круиз по Нилу на дахабии",
  breadcrumbs: [
    { name: "Главная", path: "/ru" },
    { name: "Путешествия", path: "/ru/voyages" },
    { name: "Расписание рейсов", path: "/ru/cruises-list" },
  ],
} as const;
