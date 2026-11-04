/** The guest book's frame in Russian; the reviews stay as the guests wrote them. */
import { pluralRu } from "@/lib/i18n/format-ru";
import type { ReviewsCopy } from "@/lib/i18n/reviews-copy";

/* "2 months ago" in Russian, accusative after «назад»: минуту, 2 минуты, 5 минут. */
const AGO: Record<string, readonly [string, string, string]> = {
  minute: ["минуту", "минуты", "минут"],
  hour: ["час", "часа", "часов"],
  day: ["день", "дня", "дней"],
  week: ["неделю", "недели", "недель"],
  month: ["месяц", "месяца", "месяцев"],
  year: ["год", "года", "лет"],
};
const MONTHS: Record<string, string> = {
  January: "январь", February: "февраль", March: "март", April: "апрель",
  May: "май", June: "июнь", July: "июль", August: "август",
  September: "сентябрь", October: "октябрь", November: "ноябрь", December: "декабрь",
};

/* The date Google or Tripadvisor sends, in Russian; anything else stays as sent. */
function whenRu(text: string): string {
  if (/^in the last week$/i.test(text.trim())) return "за последнюю неделю";
  const ago = /^(a|an|\d+) (minute|hour|day|week|month|year)s? ago$/i.exec(text.trim());
  if (ago) {
    const forms = AGO[ago[2].toLowerCase()];
    if (!/\d/.test(ago[1])) return `${forms[0]} назад`;
    const count = Number(ago[1]);
    return `${count} ${pluralRu(count, forms)} назад`;
  }
  const month = /^([A-Z][a-z]+) (\d{4})$/.exec(text.trim());
  return month && MONTHS[month[1]] ? `${MONTHS[month[1]]} ${month[2]}` : text;
}

/* «в Google», «на Tripadvisor»; «из Google», «с Tripadvisor». */
const on = (platform: string) => (/google/i.test(platform) ? `в ${platform}` : `на ${platform}`);
const from = (platform: string) => (/google/i.test(platform) ? `из ${platform}` : `с ${platform}`);
/* Genitive after «на основе»: 1 отзыва, 2 отзывов, 21 отзыва. */
const reviewsGenitive = (count: number) =>
  count % 10 === 1 && count % 100 !== 11 ? "отзыва" : "отзывов";

export const REVIEWS_COPY_RU: ReviewsCopy = {
  kicker: "Отзывы гостей",
  titleLead: "Своими",
  titleAccent: "словами",
  lede: "Больше чем путешествие — собрание воспоминаний. Вот слова наших гостей, написанные от всего сердца.",
  subtitle: "Настоящие путешествия. Подлинные истории.",
  googleReviews: "Отзывы в Google",
  platformReviews: (platform) => `Отзывы ${on(platform)}`,
  reviewsFrom: (platform) => `Отзывы ${from(platform)}`,
  basedOn: (count) => `На основе ${count.toLocaleString("ru-RU")} ${reviewsGenitive(count)}`,
  figure: (value) => value.toFixed(1).replace(".", ","),
  rated: (value, platform) => `Оценка ${value.replace(".", ",")} из 5 ${on(platform)}`,
  readReviews: "Читать отзывы",
  writeReview: "Написать отзыв",
  onPlatform: (platform) => {
    const words = on(platform);
    return words.charAt(0).toUpperCase() + words.slice(1);
  },
  readThisReview: (author, platform) => ` — читать отзыв автора ${author} ${on(platform)}`,
  byLine: (platform) => on(platform),
  sourceSwitch: "Источник отзывов",
  pagesLabel: "Страницы отзывов",
  previousPage: "Предыдущая страница отзывов",
  nextPage: "Следующая страница отзывов",
  chooseReview: "Выбрать отзыв",
  reviewOf: (index, total) => `Отзыв ${index} из ${total}`,
  folio: (page, total) => `Страница ${page} из ${total}`,
  attribution: (platform) => `Оценки и отзывы ${from(platform)} приведены так, как их написали гости.`,
  when: whenRu,
  fallbackLede: (withTripadvisor) =>
    `Прочитайте, что говорят гости после путешествия на борту Hathor, в Google${withTripadvisor ? " и на Tripadvisor" : ""}.`,
  handPage: [
    { text: "Медленнее", x: 12, y: 46 },
    { text: "добрее", x: 46, y: 96, r: 2 },
    { text: "прекраснее", x: 70, y: 148, r: -1 },
  ],
  handEtching: [
    { text: "Иные", x: 10, y: 50 },
    { text: "воды,", x: 44, y: 96, r: 2 },
    { text: "богаче", x: 70, y: 142, r: -1 },
    { text: "истории", x: 92, y: 188, r: 1 },
  ],
  handDeck: [
    { text: "Больше чем", x: 8, y: 44 },
    { text: "круиз:", x: 30, y: 92, r: 2 },
    { text: "история для рассказа", x: 52, y: 142, r: -1 },
  ],
  stamp: "КРУИЗ ПО НИЛУ · ЕГИПЕТ · КРУИЗ ПО НИЛУ ·",
};
