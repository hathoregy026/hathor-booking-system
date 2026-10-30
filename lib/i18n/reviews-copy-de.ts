/** The guest book's frame in German; the reviews stay as the guests wrote them. */
import type { ReviewsCopy } from "@/lib/i18n/reviews-copy";

const AGO: Record<string, readonly [string, string]> = {
  minute: ["einer Minute", "Minuten"],
  hour: ["einer Stunde", "Stunden"],
  day: ["einem Tag", "Tagen"],
  week: ["einer Woche", "Wochen"],
  month: ["einem Monat", "Monaten"],
  year: ["einem Jahr", "Jahren"],
};
const MONTHS: Record<string, string> = {
  January: "Januar", February: "Februar", March: "März", April: "April",
  May: "Mai", June: "Juni", July: "Juli", August: "August",
  September: "September", October: "Oktober", November: "November", December: "Dezember",
};

/* The date Google or Tripadvisor sends, in German; anything else stays as sent. */
function whenDe(text: string): string {
  if (/^in the last week$/i.test(text.trim())) return "in der letzten Woche";
  const ago = /^(a|an|\d+) (minute|hour|day|week|month|year)s? ago$/i.exec(text.trim());
  if (ago) {
    const unit = AGO[ago[2].toLowerCase()];
    return /\d/.test(ago[1]) ? `vor ${ago[1]} ${unit[1]}` : `vor ${unit[0]}`;
  }
  const month = /^([A-Z][a-z]+) (\d{4})$/.exec(text.trim());
  return month && MONTHS[month[1]] ? `${MONTHS[month[1]]} ${month[2]}` : text;
}

export const REVIEWS_COPY_DE: ReviewsCopy = {
  kicker: "Gästestimmen",
  titleLead: "In ihren",
  titleAccent: "eigenen Worten",
  lede: "Mehr als eine Reise, eine Sammlung von Erinnerungen. Das sind die Worte unserer Gäste, von Herzen geschrieben.",
  subtitle: "Echte Reisen. Wahre Geschichten.",
  googleReviews: "Google-Bewertungen",
  platformReviews: (platform) => `${platform}-Bewertungen`,
  reviewsFrom: (platform) => `Bewertungen von ${platform}`,
  basedOn: (count) =>
    `Basierend auf ${count.toLocaleString("de-DE")} ${count === 1 ? "Bewertung" : "Bewertungen"}`,
  rated: (value, platform) => `Mit ${value.replace(".", ",")} von 5 auf ${platform} bewertet`,
  readReviews: "Bewertungen lesen",
  writeReview: "Bewertung schreiben",
  onPlatform: (platform) => `Auf ${platform}`,
  readThisReview: (author, platform) => ` — diese Bewertung von ${author} auf ${platform} lesen`,
  byLine: (platform) => `auf ${platform}`,
  sourceSwitch: "Quelle der Bewertungen",
  pagesLabel: "Bewertungsseiten",
  previousPage: "Vorherige Seite der Bewertungen",
  nextPage: "Nächste Seite der Bewertungen",
  chooseReview: "Bewertung wählen",
  reviewOf: (index, total) => `Bewertung ${index} von ${total}`,
  folio: (page, total) => `Seite ${page} von ${total}`,
  sourceNote: (platform) => `Bewertungen und Rezensionen von ${platform}, so wiedergegeben, wie die Gäste sie geschrieben haben.`,
  when: whenDe,
  fallbackLede: (withTripadvisor) =>
    `Lesen Sie, was Gäste nach einer Reise an Bord der Hathor berichten, auf Google${withTripadvisor ? " und Tripadvisor" : ""}.`,
  handPage: [
    { text: "Langsamer", x: 12, y: 46 },
    { text: "herzlicher", x: 46, y: 96, r: 2 },
    { text: "schöner", x: 70, y: 148, r: -1 },
  ],
  handEtching: [
    { text: "Andere", x: 10, y: 50 },
    { text: "Wasser,", x: 44, y: 96, r: 2 },
    { text: "reichere", x: 70, y: 142, r: -1 },
    { text: "Geschichten", x: 82, y: 188, r: 1 },
  ],
  handDeck: [
    { text: "Mehr als", x: 8, y: 44 },
    { text: "eine Kreuzfahrt:", x: 30, y: 92, r: 2 },
    { text: "eine Geschichte zum Teilen", x: 40, y: 142, r: -1 },
  ],
  stamp: "NILREISE · ÄGYPTEN · NILREISE · ÄGYPTEN ·",
};
