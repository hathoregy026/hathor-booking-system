/** The Wellness page's own words (not dashboard text) in German. */
import type { WellnessCopy } from "@/lib/i18n/wellness-copy";

const ALTS_DE: Record<string, string> = {
  "Seneb Spa aboard Hathor Dahabiya": "Das Seneb Spa an Bord der Hathor Dahabiya",
  "Seneb Spa aboard Hathor": "Das Seneb Spa an Bord der Hathor",
  "Open-air calm on the Nile deck": "Ruhe unter freiem Himmel auf dem Deck am Nil",
  "Restorative spa treatments aboard Hathor": "Wohltuende Spa-Behandlungen an Bord der Hathor",
  "Suite rest aboard Hathor": "Erholung in der Suite an Bord der Hathor",
  "Historia Fitness overlooking the Nile": "Historia Fitness mit Blick auf den Nil",
  "Egyptian character aboard Hathor": "Ägyptischer Charakter an Bord der Hathor",
  "Historia Fitness aboard Hathor": "Historia Fitness an Bord der Hathor",
  "Active wellness overlooking the Nile": "Aktive Erholung mit Blick auf den Nil",
  "Luxury cabin repose aboard Hathor": "Erholung in einer Luxuskabine an Bord der Hathor",
  "Life aboard Hathor": "Das Leben an Bord der Hathor",
  "Deck living aboard Hathor": "Das Leben auf dem Deck der Hathor",
  "Historia Fitness Center with panoramic Nile views":
    "Das Historia Fitness Center mit Panoramablick auf den Nil",
  "River light from the fitness deck": "Flusslicht vom Fitnessdeck aus",
  "Movement aboard Hathor": "Bewegung an Bord der Hathor",
  "Sailing the Nile aboard Hathor": "Auf dem Nil an Bord der Hathor",
  "Royal Suite repose aboard Hathor": "Erholung in der Royal Suite an Bord der Hathor",
  "Crafted detail aboard Hathor": "Handwerkliche Details an Bord der Hathor",
  "Quiet river light aboard Hathor": "Stilles Flusslicht an Bord der Hathor",
  "Seneb Spa calm aboard Hathor": "Die Ruhe des Seneb Spa an Bord der Hathor",
};

export const WELLNESS_COPY_DE: WellnessCopy = {
  runLabel: "Wellness der Hathor auf dem Nil",
  indexLabel: "Kapitel zu Wellness",
  index: ["Seneb", "Rituale", "Historia", "Buchen"],
  eyebrow: "Wellness",
  introFallback:
    "In einer Welt, die selten innehält, schenkt die Hathor dem Körper Zeit zum Loslassen. Seneb Spa, Historia Fitness und erholsame Suiten begleiten Sie zwischen Luxor und Assuan.",
  route: ["Luxor", "Assuan"],
  cue: "Gleiten",
  lyric: ["Gesundheit im ägyptischen Sinn:", " Seneb, ", "als stille Beständigkeit."],
  rituals: [
    {
      word: "Massage",
      detail: "Erholung mit warmem Öl nach Tagen in den Tempeln",
      meta: "Seneb · 60–90 Min.",
    },
    {
      word: "Botanik",
      detail: "Ägyptische Pflanzentherapien für Haut und Ruhe",
      meta: "Signature · täglich",
    },
    {
      word: "Erholung",
      detail: "Beruhigende Behandlungen zwischen Landgang und Fahrt",
      meta: "Balance · nach Bedarf",
    },
    {
      word: "Stille",
      detail: "Private Ruhe in der Suite als Teil des Rituals",
      meta: "Kabine · jederzeit",
    },
  ],
  ritualsEyebrow: "Rituale an Bord",
  ritualsIntro: "Vier Wege, wie der Körper zu sich zurückfindet, während der Nil weiterfließt.",
  ritualAlt: (word) => `Ritual ${word} an Bord der Hathor`,
  galleryLabel: "Bilder zu Wellness",
  historia: { tl: "Fitness", tr: "Nilblick", bl: "Täglich · geöffnet", br: "Bewegung" },
  essayEyebrow: "Nach der Bewegung",
  essayLines: ["Ruhe ist nicht", "die Abwesenheit", "der Reise"],
  essayBody:
    "Die Suiten werden Teil des Rituals: weiches Morgenlicht, tiefer Schlaf und der seltene Luxus, an einem neuen Horizont am Nil zu erwachen.",
  exploreSuites: "Suiten entdecken",
  pauseLabel: "Stille Pause",
  pulse: ["Der Fluss hält den Takt,", "damit Sie es nicht müssen."],
  nextEyebrow: "Als Nächstes",
  nextTitle: "Buchen Sie Stille",
  reserveEyebrow: "Buchen",
  reserveLines: ["Ein stillerer Nil", "erwartet Sie"],
  statement:
    "Gestalten Sie eine private Reise mit Zeit für das Seneb Spa, Historia Fitness, wohltuende Suitenrituale und die Tempel Ägyptens.",
  bookNow: "Jetzt buchen",
  enquire: "Anfragen",
  cardTag: "Schwimmende Oase",
  cardBody: ["Spa · Fitness · Ruhe in der Suite", "zwischen Luxor und Assuan"],
  suites: "Suiten",
  alt: (english) => ALTS_DE[english] ?? english,
};
