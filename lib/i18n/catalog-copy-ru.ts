/** Russian catalog words; see lib/i18n/catalog-copy.ts for how they are used. */
import type { AmenityCaption } from "@/lib/i18n/catalog-copy";

export const VOYAGE_NAMES_RU: Record<string, string> = {
  "3-nights-aswan-luxor": "3 ночи / 4 дня — из Асуана в Луксор",
  "4-nights-luxor-aswan": "4 ночи / 5 дней — из Луксора в Асуан",
  "7-nights-luxor-aswan-luxor": "7 ночей / 8 дней — из Луксора в Асуан и обратно",
  "nile-majesty": "Частный чартер — Nile Majesty",
};

/** English place names in a route and their Russian names. */
export const PLACES_RU: Record<string, string> = {
  Aswan: "Асуан",
  Cairo: "Каир",
  Luxor: "Луксор",
  Esna: "Эсна",
  Edfu: "Эдфу",
  "Kom Ombo": "Ком-Омбо",
};

/** Every place in an English route, in Russian ("Luxor → Aswan" → «Луксор → Асуан»). */
export const placesRu = (text: string) =>
  text.replace(/\b(Kom Ombo|Luxor|Aswan|Cairo|Esna|Edfu)\b/g, (place) => PLACES_RU[place] ?? place);

/** A departure day as a word inside a sentence: nominative, lower case («суббота»). */
export const WEEKDAYS_RU: Record<string, string> = {
  Monday: "понедельник",
  Tuesday: "вторник",
  Wednesday: "среда",
  Thursday: "четверг",
  Friday: "пятница",
  Saturday: "суббота",
  Sunday: "воскресенье",
};

const EVERY_WEEKDAY_RU: Record<string, string> = {
  понедельник: "по понедельникам",
  вторник: "по вторникам",
  среда: "по средам",
  четверг: "по четвергам",
  пятница: "по пятницам",
  суббота: "по субботам",
  воскресенье: "по воскресеньям",
};

/**
 * A departure day as a repeating day, for "Departs Saturdays": «по субботам».
 * Takes the English day ("Saturday", "Saturdays") or the Russian one («Суббота»).
 */
export function everyWeekdayRu(day: string): string {
  const trimmed = day.trim();
  const word = (WEEKDAYS_RU[trimmed.replace(/s$/, "")] ?? trimmed).toLowerCase();
  return EVERY_WEEKDAY_RU[word] ?? word;
}

export const AMENITIES_RU: Record<string, string> = {
  "LED Satellite Screen": "Светодиодный экран со спутниковым ТВ",
  "Bathtub or Walk-In Shower": "Ванна или душ открытого типа",
  "Safe box": "Сейф",
  "Tea & Coffee Facilities": "Принадлежности для чая и кофе",
  Telephone: "Телефон",
  "High-Speed Internet Access": "Высокоскоростной интернет",
  "All cabins are non-smoking areas": "Курение во всех каютах запрещено",
  "Panoramic Nile view": "Панорамный вид на Нил",
  "22 Square Metres": "22 квадратных метра",
  Minibar: "Мини-бар",
  "Laundry Service": "Услуги прачечной",
  "Smart System": "Умная система управления",
  "Doctor On Call": "Врач по вызову",
  "Room Service": "Обслуживание в каюте",
  "Air Conditioner": "Кондиционер",
  "Hair Dryer": "Фен",
  "Jacuzzi & dual toilets": "Джакузи и два туалета",
  "Hair dryer & mini bar": "Фен и мини-бар",
  "Smart entertainment system": "Умная развлекательная система",
  "Room & laundry service": "Обслуживание в каюте и прачечная",
  "Air conditioning & high-speed Wi-Fi": "Кондиционер и высокоскоростной Wi-Fi",
  "Jacuzzi & two luxurious bathrooms": "Джакузи и две роскошные ванные комнаты",
  "Coffee machine, mini bar, air conditioning": "Кофемашина, мини-бар, кондиционер",
};

export const AMENITY_KIND_CAPTIONS_RU: Record<string, AmenityCaption> = {
  screen: { wide: "ТВ", tight: "ТВ" },
  bath: { wide: "Ванна / душ", tight: "Ванна" },
  safe: { wide: "Сейф", tight: "Сейф" },
  coffee: { wide: "Чай и кофе", tight: "Кофе" },
  wifi: { wide: "Wi-Fi", tight: "Wi-Fi" },
  phone: { wide: "Телефон", tight: "Телефон" },
  minibar: { wide: "Мини-бар", tight: "Мини-бар" },
  laundry: { wide: "Прачечная", tight: "Прачечная" },
  smart: { wide: "Умное управление", tight: "Смарт" },
  doctor: { wide: "Врач", tight: "Врач" },
  service: { wide: "Рум-сервис", tight: "Сервис" },
  ac: { wide: "Кондиционер", tight: "Климат" },
  hair: { wide: "Фен", tight: "Фен" },
  view: { wide: "Вид на Нил", tight: "Вид на Нил" },
  jacuzzi: { wide: "Джакузи", tight: "Джакузи" },
  smoke: { wide: "Для некурящих", tight: "Без курения" },
  space: { wide: "Площадь", tight: "Площадь" },
  default: { wide: "", tight: "" },
};

export const AMENITY_CAPTION_OVERRIDES_RU: Record<string, AmenityCaption> = {
  "jacuzzi & dual toilets": { wide: "Джакузи и 2 туалета", tight: "Джакузи, WC" },
  "jacuzzi & two luxurious bathrooms": { wide: "Джакузи и ванные", tight: "Джакузи, ванные" },
  "hair dryer & mini bar": { wide: "Фен и мини-бар", tight: "Фен и бар" },
  "smart entertainment system": { wide: "Смарт-система", tight: "Смарт" },
  "room & laundry service": { wide: "Сервис и прачечная", tight: "Прачечная" },
  "air conditioning & high-speed wi-fi": { wide: "Кондиционер и Wi-Fi", tight: "Климат, Wi-Fi" },
  "coffee machine, mini bar, air conditioning": {
    wide: "Кофе · Бар · Климат",
    tight: "Кофе и бар",
  },
};
