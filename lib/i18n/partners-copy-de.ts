/** The Partners page's own words (not dashboard text) in German. Partner names stay as they are. */
import type { PartnersCopy } from "@/lib/i18n/partners-copy";

export const PARTNERS_COPY_DE: PartnersCopy = {
  runLabel: "Die Reise- und Gastgewerbepartner der Hathor",
  spineLabel: "Partnerverzeichnis",
  names: "Namen",
  scroll: "Scrollen",
  navLabel: "Bereiche der Seite",
  nav: ["Kreis", "Gastlichkeit", "Dialog", "Kontakt"],
  artLabel: "In bester Gesellschaft",
  alts: {
    portrait: "Die Hathor Dahabiya auf dem Nil",
    river: "Die Hathor auf dem Fluss",
    legacy: "Eine Geschichte auf dem Nil",
    cabin: "Eine Kabine an Bord der Hathor",
    dining: "Speisen an Bord der Hathor",
    deck: "Das Leben auf dem Deck der Hathor",
    living: "Die Gemeinschaftsräume an Bord der Hathor",
    fineDining: "Feine Küche an Bord der Hathor",
    restaurant: "Das Restaurant an Bord der Hathor Dahabiya",
    atmosphere: "Die Atmosphäre im Speisesaal der Hathor",
    wine: "Der Weinservice an Bord der Hathor",
    amenity: "Ein Ausstattungsdetail an Bord der Hathor",
    craft: "Sorgfalt und Können an Bord der Hathor",
    highlights: "Die Wunder des Nils von der Hathor aus",
    wheel: "Steuerrad und Fluss an Bord der Hathor",
    royal: "Die Royal Suite an Bord der Hathor",
    card: "Die Hathor Dahabiya auf dem Nil",
    wash: "Die Hathor Dahabiya auf dem Nil in der goldenen Stunde",
  },
  partnerAlt: (name) => `${name}, Partner der Hathor`,
  aboard: "An Bord",
  route: "Luxor — Assuan",
  covenant: ["Gemeinsame Standards", "Ein privater Kreis", "vertrauter Namen", "auf dem Nil"],
  leadFallback:
    "Wir fahren mit vertrauten Namen aus Reise und Gastgewerbe: Partnern, die unsere Sorgfalt für den Nil und unsere Gäste teilen.",
  orbitTitle: "Weltweites Vertrauen",
  orbitBody: "Vier Partner. Ein Standard der Fürsorge für jeden Gast der Hathor.",
  circle: [
    {
      role: "Fachhandel",
      region: "Ägypten",
      note: "Zielgebietswissen und Nilrouten, gestaltet mit lokaler Präzision.",
    },
    {
      role: "Global",
      region: "Reservierung",
      note: "Eine weltweite Bühne, die Reisende an Bord einer intimen Dahabiya bringt.",
    },
    {
      role: "Weltweit",
      region: "Entdeckung",
      note: "Ein durchdachter Weg von der ersten Suche bis zur Reise auf dem Fluss.",
    },
    {
      role: "Luxus",
      region: "Concierge",
      note: "Gastfreundschaft im Einklang mit der stillen, persönlichen Fürsorge der Hathor.",
    },
  ],
  /* Kept short: longer lines spill out of the scene at 1920. */
  craft: ["Die Kunst der Gastlichkeit", "Fürsorge, die jede", "Buchung begleitet"],
  craftBody:
    "Von der ersten Anfrage bis zum letzten Morgen an Deck halten unsere Partner dieselbe stille Präzision, die Gäste an Bord der Hathor erleben.",
  datum: {
    tl: "Partner",
    tr: "Ägypten und mehr",
    one: "Ein",
    bl: "Hathor-Kreis",
    br: "Gemeinsamer Standard",
  },
  bridge: ["Reisen, mit Bedacht", "verbunden."],
  epilogue: ["Beginnen wir ein Gespräch", "Arbeiten Sie mit", "der Hathor"],
  statement:
    "Für Kooperationen, Repräsentanz und durchdachte Reisepartnerschaften sprechen Sie mit dem Team der Hathor in Kairo.",
  contactHathor: "Hathor kontaktieren",
  bookVoyage: "Reise buchen",
  epilogueMeta: "Repräsentanz und Fachanfragen · Büro in Kairo",
  cardTitle: "Der Partnerkreis",
  cardBody: ["Vertraute Namen, die unsere", "Fürsorge für jeden Gast teilen"],
  aboutHathor: "Über die Hathor",
  writeToUs: "Schreiben Sie uns",
};
