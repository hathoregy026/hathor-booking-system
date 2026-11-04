/** The Voyages pages' own words that are not dashboard text, in Russian. */
import { voyageNameIn } from "@/lib/i18n/catalog-copy";
import type { VoyagesCopy } from "@/lib/i18n/voyages-copy";

const SLOT_ALTS_RU: Record<string, string> = {
  "home-voyage-3n-aswan-luxor": "Путешествие на 3 ночи / 4 дня из Асуана в Луксор на борту Hathor",
  "home-voyage-4n-luxor-aswan": "Путешествие на 4 ночи / 5 дней из Луксора в Асуан на борту Hathor",
  "home-voyage-7n-roundtrip": "Путешествие на 7 ночей / 8 дней из Луксора в Асуан и обратно на борту Hathor",
};

export const VOYAGES_COPY_RU: VoyagesCopy = {
  runLabel: "Путешествия Hathor",
  alts: {
    goldenHour: "Hathor в золотой час",
    sailing: "Hathor идет по Нилу",
    deckLife: "Жизнь на палубе",
    quietLife: "Тихая жизнь на борту Hathor",
    table: "Сервированный стол на борту Hathor",
    restaurant: "Ресторан Hathor",
    suite: "Люкс на Hathor",
    royalSuite: "Люкс Royal Suite",
    craft: "Мастерство Hathor",
    landscape: "Пейзаж Нила",
    river: "Река с борта Hathor",
    suiteAboard: "Люкс на борту Hathor",
    charter: "Частный чартер Hathor",
    nileGoldenHour: "Нил в золотой час",
  },
  voyageName: (slug, fallback) => voyageNameIn("ru", slug, fallback),
  slotAlt: (slot) => SLOT_ALTS_RU[slot] ?? "",
};
