import type { Metadata } from "next";
import type { LocaleVoyagePage, VoyagePageKey } from "@/lib/i18n/voyages-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SEO_DEFAULT_OG_IMAGE } from "@/lib/seo/site";

/**
 * The four Russian Voyages pages: search settings, structured data words and
 * the page-specific hero / statement. Titles lead with the Russian head terms
 * ("круиз по Нилу", "Луксор", "Асуан"). Server-only.
 */

const image = {
  ...SEO_DEFAULT_OG_IMAGE,
  alt: "Hathor Dahabiya в люкс-круизе по Нилу между Луксором и Асуаном",
};

const page = (
  path: string,
  title: string,
  description: string,
): { path: string; metadata: Metadata } => ({
  path,
  metadata: buildPageMetadata({ title, description, path, image }),
});

/* As in English, each route page's search description doubles as its trip description. */
const LUXOR_TO_ASWAN_DESCRIPTION =
  "Классический круиз по Нилу из Луксора в Асуан на четыре ночи на Hathor Dahabiya: Карнак, Долина царей, Эдфу, Ком-Омбо и Филе в ритме приватного плавания.";
const ASWAN_TO_LUXOR_DESCRIPTION =
  "Круиз по Нилу из Асуана в Луксор на три ночи на Hathor Dahabiya: Филе, Ком-Омбо и Эдфу, затем храмы Луксора; на борту 32 гостя.";
const ROUND_TRIP_DESCRIPTION =
  "Полный маршрут Hathor Dahabiya на 7 ночей и 8 дней, Луксор — Асуан — Луксор: все храмы по пути в ритме приватного плавания, на роскошной дахабии для 32 гостей.";

export const RUSSIAN_VOYAGE_PAGES: Record<VoyagePageKey, LocaleVoyagePage> = {
  voyages: {
    ...page(
      "/ru/voyages",
      "Круизы по Нилу из Луксора и Асуана | Hathor Dahabiya",
      "Выберите маршрут Hathor Dahabiya между Луксором и Асуаном: три, четыре или семь ночей приватного плавания, храмы и жизнь на борту по системе «все включено».",
    ),
    name: "Круизы по Нилу из Луксора и Асуана | Hathor Dahabiya",
    crumb: "Путешествия",
    trip: {
      name: "Маршруты Hathor Dahabiya по Нилу",
      description: "Путешествия на Hathor на три, четыре и семь ночей между Луксором и Асуаном.",
      departure: "Луксор",
      arrival: "Асуан",
    },
    heroLines: ["Наши путешествия", "по воле", "Нила"],
  },
  "luxor-to-aswan": {
    ...page(
      "/ru/voyages/luxor-to-aswan",
      "Круиз по Нилу из Луксора в Асуан | Hathor Dahabiya",
      LUXOR_TO_ASWAN_DESCRIPTION,
    ),
    name: "Круиз по Нилу из Луксора в Асуан | Hathor Dahabiya",
    crumb: "Из Луксора в Асуан",
    trip: {
      name: "Круиз по Нилу из Луксора в Асуан на борту Hathor Dahabiya",
      description: LUXOR_TO_ASWAN_DESCRIPTION,
      departure: "Луксор",
      arrival: "Асуан",
    },
    heroLines: ["Из Луксора", "в Асуан", "по Нилу"],
    statement:
      "Классическое путешествие по Нилу от монументальных берегов Луксора к тихому очарованию Асуана: четыре ночи храмов, фелук и вечеров в отблесках речного заката на борту роскошной дахабии для 32 гостей.",
    detailsHref: "/cruises-list",
  },
  "aswan-to-luxor": {
    ...page(
      "/ru/voyages/aswan-to-luxor",
      "Круиз по Нилу из Асуана в Луксор | Hathor Dahabiya",
      ASWAN_TO_LUXOR_DESCRIPTION,
    ),
    name: "Круиз по Нилу из Асуана в Луксор | Hathor Dahabiya",
    crumb: "Из Асуана в Луксор",
    trip: {
      name: "Круиз по Нилу из Асуана в Луксор на борту Hathor Dahabiya",
      description: ASWAN_TO_LUXOR_DESCRIPTION,
      departure: "Асуан",
      arrival: "Луксор",
    },
    heroLines: ["Из Асуана", "в Луксор", "по Нилу"],
    statement:
      "Камерное путешествие с юга на север: три ночи через Филе, Ком-Омбо и Эдфу в неспешном ритме дахабии и финал среди храмов Луксора — на борту роскошной дахабии для 32 гостей.",
    detailsHref: "/cruises-list",
  },
  "luxor-aswan-luxor": {
    ...page(
      "/ru/voyages/luxor-aswan-luxor",
      /* The English keeps hathorcruise.com's "7 night" ranking phrase. */
      "Круиз по Нилу на 7 ночей Луксор — Асуан | Hathor Dahabiya",
      ROUND_TRIP_DESCRIPTION,
    ),
    name: "Круиз по Нилу на 7 ночей Луксор — Асуан | Hathor Dahabiya",
    crumb: "Луксор, Асуан и Луксор",
    trip: {
      name: "Круиз по Нилу на 7 ночей Луксор — Асуан на борту Hathor Dahabiya",
      description: ROUND_TRIP_DESCRIPTION,
      departure: "Луксор",
      arrival: "Луксор",
    },
    heroLines: ["Луксор, Асуан", "и Луксор", "по Нилу"],
    statement:
      "Полный круг по Нилу из Луксора в Асуан и обратно: семь ночей и восемь дней, когда хватает времени на каждый храм, на речной свет и на те тихие дни, которые дарит только путешествие по всему кругу, — на борту роскошной дахабии для 32 гостей.",
    detailsHref: "/cruises-list",
  },
};
