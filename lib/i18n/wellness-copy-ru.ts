/** The Wellness page's own words (not dashboard text) in Russian. */
import type { WellnessCopy } from "@/lib/i18n/wellness-copy";

const ALTS_RU: Record<string, string> = {
  "Seneb Spa aboard Hathor Dahabiya": "Seneb Spa на борту Hathor Dahabiya",
  "Seneb Spa aboard Hathor": "Seneb Spa на борту Hathor",
  "Open-air calm on the Nile deck": "Спокойствие под открытым небом на палубе над Нилом",
  "Restorative spa treatments aboard Hathor": "Восстанавливающие спа-процедуры на борту Hathor",
  "Suite rest aboard Hathor": "Отдых в люксе на борту Hathor",
  "Historia Fitness overlooking the Nile": "Historia Fitness с видом на Нил",
  "Egyptian character aboard Hathor": "Египетский колорит на борту Hathor",
  "Historia Fitness aboard Hathor": "Historia Fitness на борту Hathor",
  "Active wellness overlooking the Nile": "Активное оздоровление с видом на Нил",
  "Luxury cabin repose aboard Hathor": "Отдых в роскошной каюте на борту Hathor",
  "Life aboard Hathor": "Жизнь на борту Hathor",
  "Deck living aboard Hathor": "Отдых на палубе Hathor",
  "Historia Fitness Center with panoramic Nile views":
    "Центр Historia Fitness с панорамным видом на Нил",
  "River light from the fitness deck": "Свет реки с фитнес-палубы",
  "Movement aboard Hathor": "Движение на борту Hathor",
  "Sailing the Nile aboard Hathor": "Плавание по Нилу на борту Hathor",
  "Royal Suite repose aboard Hathor": "Отдых в люксе Royal Suite на борту Hathor",
  "Crafted detail aboard Hathor": "Детали ручной работы на борту Hathor",
  "Quiet river light aboard Hathor": "Тихий свет реки на борту Hathor",
  "Seneb Spa calm aboard Hathor": "Спокойствие Seneb Spa на борту Hathor",
};

export const WELLNESS_COPY_RU: WellnessCopy = {
  runLabel: "Велнес на борту Hathor на Ниле",
  indexLabel: "Разделы страницы",
  index: ["Seneb", "Ритуалы", "Historia", "Бронирование"],
  eyebrow: "Велнес",
  introFallback:
    "В мире, который редко останавливается, Hathor дарит телу время расслабиться. Seneb Spa, Historia Fitness и спокойные люксы сопровождают вас на пути между Луксором и Асуаном.",
  route: ["Луксор", "Асуан"],
  cue: "Плыть",
  // "seneb" stays in Latin: it is the Egyptian word behind the Seneb Spa name.
  lyric: ["Здоровье в египетском понимании:", " seneb ", "как тихое постоянство."],
  rituals: [
    {
      word: "Массаж",
      detail: "Восстановление с теплым маслом после дней в храмах",
      meta: "Seneb · 60–90 мин",
    },
    {
      word: "Травы",
      detail: "Египетская фитотерапия для кожи и душевного покоя",
      meta: "Фирменный ритуал · ежедневно",
    },
    {
      /* The ritual word sits in a narrow column; «Восстановление» crowds its text. */
      word: "Отдых",
      detail: "Успокаивающие процедуры между экскурсиями на берегу и плаванием",
      meta: "Баланс · по необходимости",
    },
    {
      word: "Тишина",
      detail: "Уединенный отдых в люксе как часть ритуала",
      meta: "Каюта · в любое время",
    },
  ],
  ritualsEyebrow: "Ритуалы на борту",
  ritualsIntro: "Четыре способа, которыми тело возвращается к себе, пока Нил продолжает свое течение.",
  ritualAlt: (word) => `Ритуал «${word}» на борту Hathor`,
  galleryLabel: "Велнес в фотографиях",
  historia: { tl: "Фитнес", tr: "Вид на Нил", bl: "Ежедневно · открыто", br: "Движение" },
  essayEyebrow: "После движения",
  essayLines: ["Отдых не", "прерывает", "путешествие"],
  essayBody:
    "Люксы становятся частью ритуала: мягкий утренний свет, глубокий сон и редкая роскошь просыпаться у нового горизонта Нила.",
  exploreSuites: "Смотреть люксы",
  pauseLabel: "Тихая пауза",
  pulse: ["Река следит за временем,", "чтобы вам не пришлось."],
  nextEyebrow: "Далее",
  nextTitle: "Забронируйте покой",
  reserveEyebrow: "Бронирование",
  reserveLines: ["Безмятежный Нил", "ждет вас"],
  statement:
    "Спланируйте частное путешествие, в котором найдется время для Seneb Spa, Historia Fitness, восстанавливающих ритуалов в люксе и храмов Египта.",
  bookNow: "Забронировать",
  enquire: "Отправить запрос",
  cardTag: "Плавучий оазис",
  cardBody: ["Спа · Фитнес · Отдых в люксе", "между Луксором и Асуаном"],
  suites: "Люксы",
  alt: (english) => ALTS_RU[english] ?? english,
};
