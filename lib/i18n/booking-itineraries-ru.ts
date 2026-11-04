/**
 * The booking journey's itineraries in Russian: the same days, routes and
 * reading links as lib/booking-itineraries.ts. Paths open with the place; a
 * detail after it follows a comma or a bracket (see placeFromPath in
 * booking-copy-ru.ts). The reading links open the Russian journal articles,
 * the same ones the English links reach through lib/seo/legacy-redirects.ts.
 * ItineraryPanel renders each href as it stands, so they carry /ru themselves.
 * DIRECTION_COMPARE and ITINERARY_GUIDE have no Russian article, so they open
 * the Russian voyages page.
 */

import {
  HATHOR_ITINERARIES,
  type ItineraryDay,
  type ItineraryLink,
  type VoyageItinerary,
} from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

const PHILAE: ItineraryLink = { label: "Храм Филе", href: "/ru/blogs/discovering-the-secrets-of-philae-temple" };
/** The same links inside a sentence, where Russian grammar changes the ending. */
const PHILAE_GENITIVE: ItineraryLink = { ...PHILAE, label: "храма Филе" };
const ASWAN_ATTRACTIONS: ItineraryLink = { label: "Достопримечательности Асуана", href: "/ru/blogs/golden-gems-of-aswan" };
const ASWAN_TO_LUXOR: ItineraryLink = { label: "Из Асуана в Луксор на дахабии", href: "/ru/blogs/sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise" };
const KOM_OMBO: ItineraryLink = { label: "Храм Ком-Омбо", href: "/ru/blogs/kom-ombo-temple" };
const KOM_OMBO_DATIVE: ItineraryLink = { ...KOM_OMBO, label: "храму Ком-Омбо" };
const DIRECTION_COMPARE: ItineraryLink = { label: "Из Луксора в Асуан или из Асуана в Луксор", href: "/ru/voyages" };
const EAST_BANK: ItineraryLink = { label: "Карнакский и Луксорский храмы", href: "/ru/blogs/luxors-sacred-east-bank" };
const EAST_BANK_READING: ItineraryLink = { label: "Древние чудеса Восточного берега Луксора", href: "/ru/blogs/luxors-sacred-east-bank" };
const ITINERARY_GUIDE: ItineraryLink = { label: "Маршруты круизов по Нилу на дахабии", href: "/ru/voyages" };
const COLOSSI: ItineraryLink = { label: "Колоссы Мемнона", href: "/ru/blogs/colossi-of-memnon" };
const GREATEST_LANDMARKS: ItineraryLink = { label: "Величайшие памятники Египта на Ниле", href: "/ru/blogs/best-places-to-visit-along-the-nile-with-a-dahabiya-cruise" };
const EXPLORING: ItineraryLink = { label: "Луксор и Асуан на роскошной дахабии", href: "/ru/blogs/exploring-luxor-and-aswan-on-a-luxury-dahabiya" };
/** Inside a sentence it follows «в местности», so the name keeps its own form. */
const SILSILA: ItineraryLink = { label: "Гебель-эль-Сильсила", href: "/ru/blogs/niles-hidden-gems-by-dahabiya" };
const SILSILA_READING: ItineraryLink = { label: "Скрытые жемчужины Нила: Гебель-эль-Сильсила", href: "/ru/blogs/niles-hidden-gems-by-dahabiya" };
const HATHOR_BLOG: ItineraryLink = { label: "Блог Hathor", href: "/ru/blogs" };
const SLOW_TRAVEL: ItineraryLink = { label: "Неспешное путешествие по Нилу", href: "/ru/blogs/why-travelers-love-slow-travel-on-the-nile" };
const HIDDEN_SPOTS: ItineraryLink = { label: "Укромные уголки Нила", href: "/ru/blogs/5-quiet-nile-spots-for-stunning-honeymoon-captures" };

const THREE_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Асуан, начало вашего путешествия",
    path: "Асуан, посадка на борт → храм Филе → Асуанская плотина → ночевка в Асуане",
    copy: ["Прибытие и приветственный напиток, посадка и обед на борту. Посещение ", PHILAE_GENITIVE, " и Асуанской плотины. Возвращение на Hathor к ужину, ночевка в Асуане."],
    reading: [PHILAE, ASWAN_ATTRACTIONS, ASWAN_TO_LUXOR],
  },
  {
    day: 2,
    title: "Знакомство с Ком-Омбо и Эсной",
    path: "Асуан → Ком-Омбо → Эсна → ночевка в Эсне",
    copy: ["Ранним утром экскурсия в Абу-Симбел по желанию. Завтрак на борту, затем переход на север к ", KOM_OMBO_DATIVE, ". Дальше путь в Эсну, где вас ждут ужин и ночевка."],
    reading: [KOM_OMBO, DIRECTION_COMPARE],
  },
  {
    day: 3,
    title: "Эсна и Восточный берег Луксора",
    path: "Храм в Эсне → переход Эсна → Луксор → Карнакский храм → Луксорский храм → ночевка в Луксоре",
    copy: ["Завтрак, затем посещение храма в Эсне. Переход в Луксор с обедом на борту, затем осмотр Восточного берега, включая ", EAST_BANK, ". Ужин и ночевка в Луксоре."],
    reading: [EAST_BANK_READING, ITINERARY_GUIDE],
  },
  {
    day: 4,
    title: "Прощание с Луксором",
    path: "Луксор, сход на берег → Долина царей → храм Хатшепсут → Колоссы Мемнона",
    copy: ["Завтрак и выезд. Осмотр Западного берега Луксора, включая Долину царей, храм Хатшепсут и ", COLOSSI, "."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
];

const FOUR_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Добро пожаловать в Луксор и на Восточный берег",
    path: "Луксор, посадка на борт → Карнакский храм → Луксорский храм → ночевка в Луксоре",
    copy: ["Приветственный напиток и заселение, затем обед на борту. Осмотр Восточного берега, включая ", EAST_BANK, ". Возвращение на Hathor к ужину, ночевка в Луксоре."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Западный берег Луксора и переход в Эсну",
    path: "Западный берег Луксора → Долина царей → храм Хатшепсут → Колоссы Мемнона → переход Луксор → Эсна → ночевка в Эсне",
    copy: ["Завтрак, затем осмотр Западного берега: Долина царей, храм Хатшепсут и ", COLOSSI, ". Возвращение к обеду, пока Hathor идет в Эсну. Ужин и ночевка в Эсне."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 3,
    title: "Храм в Эдфу и остров Эль-Рамади",
    path: "Эсна → Эдфу → храм Гора → остров Эль-Рамади → ночевка на Эль-Рамади",
    copy: ["Завтрак и переход на юг, в Эдфу. Посещение храма Гора, возвращение к обеду, затем путь к острову Эль-Рамади, где вас ждут ужин и ночевка."],
    reading: [ITINERARY_GUIDE, HATHOR_BLOG],
  },
  {
    day: 4,
    title: "Гебель-эль-Сильсила, Ком-Омбо и переход в Асуан",
    path: "Эль-Рамади → Гебель-эль-Сильсила → Ком-Омбо → Асуан → ночевка в Асуане",
    copy: ["Посещение древних каменоломен и святилищ в местности ", SILSILA, ", затем путь к ", KOM_OMBO_DATIVE, ". Переход в Асуан с обедом на борту. Ужин и ночевка в Асуане."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Прощание с Асуаном",
    path: "Абу-Симбел (по желанию) → завтрак и выезд → храм Филе → Асуанская плотина → окончание в Асуане",
    copy: ["Ранняя экскурсия в Абу-Симбел по желанию. Завтрак и выезд, затем посещение ", PHILAE_GENITIVE, " и Асуанской плотины."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
];

const SEVEN_NIGHT: ItineraryDay[] = [
  {
    day: 1,
    title: "Добро пожаловать на борт в Луксоре",
    path: "Луксор, посадка на борт → Карнакский храм → Луксорский храм → ночевка в Луксоре",
    copy: ["Приветственный напиток и заселение, затем обед. Осмотр Восточного берега Луксора, включая ", EAST_BANK, ". Ужин и ночевка в Луксоре."],
    reading: [EAST_BANK_READING, EXPLORING],
  },
  {
    day: 2,
    title: "Из Луксора в Эсну",
    path: "Луксор → плавание по Нилу → Эсна → ночевка в Эсне",
    copy: ["Завтрак и неспешный день плавания в сторону Эсны, с обедом и традиционным чаем на палубе. Ужин при свечах и ночевка в Эсне."],
    reading: [ITINERARY_GUIDE, SLOW_TRAVEL],
  },
  {
    day: 3,
    title: "Из Эсны в Рамади через Эдфу",
    path: "Эсна → шлюз в Эсне → Эдфу → храм Гора → остров Рамади → ночевка на Рамади",
    copy: ["Проход через шлюз в Эсне и переход в Эдфу. Посещение храма Гора, затем путь к острову Рамади: традиционный ужин на острове и ночевка."],
    reading: [ITINERARY_GUIDE, HIDDEN_SPOTS],
  },
  {
    day: 4,
    title: "От Гебель-эль-Сильсилы до Асуана",
    path: "Рамади → Гебель-эль-Сильсила → Ком-Омбо → Асуан → ночевка в Асуане",
    copy: ["Осмотр местности ", SILSILA, ", затем путь к ", KOM_OMBO_DATIVE, " и переход в Асуан с обедом на борту. Ужин и ночевка в Асуане."],
    reading: [SILSILA_READING, KOM_OMBO],
  },
  {
    day: 5,
    title: "Чудеса Асуана",
    path: "Абу-Симбел (по желанию) → храм Филе → Асуанская плотина → ночевка в Асуане",
    copy: ["Ранняя экскурсия в Абу-Симбел по желанию. Осмотр ", PHILAE_GENITIVE, " и Асуанской плотины. Возвращение на Hathor к обеду, ужин и ночевка в Асуане."],
    reading: [PHILAE, ASWAN_ATTRACTIONS],
  },
  {
    day: 6,
    title: "Обратный путь в Эсну",
    path: "Асуан → плавание по Нилу на север → Эсна → ночевка в Эсне",
    copy: ["Завтрак и целый неспешный день плавания на север, из Асуана в сторону Эсны, с обедом и ужином на борту. Ночевка в Эсне."],
    reading: [SLOW_TRAVEL, DIRECTION_COMPARE],
  },
  {
    day: 7,
    title: "Из Эсны к вечным храмам Луксора",
    path: "Храм в Эсне → переход Эсна → Луксор → Долина царей → храм Хатшепсут → Колоссы Мемнона → ночевка в Луксоре",
    copy: ["Посещение храма в Эсне, затем возвращение в Луксор с обедом на борту. Осмотр Западного берега: Долина царей, храм Хатшепсут и ", COLOSSI, ". Ужин и ночевка в Луксоре."],
    reading: [COLOSSI, GREATEST_LANDMARKS],
  },
  {
    day: 8,
    title: "Прощание с Нилом",
    path: "Луксор, завтрак → выезд и сход на берег → окончание в Луксоре",
    copy: ["Последний завтрак на борту и выезд в Луксоре."],
    reading: [EXPLORING, ITINERARY_GUIDE],
  },
];

/**
 * `departureDay` is the weekday alone, in the nominative ("Среда"); the copy
 * builds the form a sentence needs ("каждую среду", "по средам").
 */
export const HATHOR_ITINERARIES_RU: Record<StayDurationValue, VoyageItinerary> = {
  "3-nights-aswan-luxor": {
    ...HATHOR_ITINERARIES["3-nights-aswan-luxor"],
    title: "3 ночи / 4 дня",
    route: "Асуан → Луксор",
    departureDay: "Среда",
    days_: THREE_NIGHT,
  },
  "4-nights-luxor-aswan": {
    ...HATHOR_ITINERARIES["4-nights-luxor-aswan"],
    title: "4 ночи / 5 дней",
    route: "Луксор → Асуан",
    departureDay: "Суббота",
    days_: FOUR_NIGHT,
  },
  "7-nights-luxor-aswan-luxor": {
    ...HATHOR_ITINERARIES["7-nights-luxor-aswan-luxor"],
    title: "7 ночей / 8 дней",
    route: "Луксор → Асуан → Луксор",
    departureDay: "Суббота",
    days_: SEVEN_NIGHT,
  },
};
