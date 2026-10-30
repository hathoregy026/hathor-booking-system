/** The About page's own words (not dashboard text) in German. */
import type { AboutCopy } from "@/lib/i18n/about-copy";

export const ABOUT_COPY_DE: AboutCopy = {
  runLabel: "Über die Hathor Dahabiya",
  navLabel: "Bereiche der Seite",
  nav: { about: "Über uns", stay: "Wohnen", dining: "Kulinarik", reserve: "Buchen" },
  scroll: "Scrollen",
  alts: {
    hero: "Die Hathor Dahabiya auf dem Nil",
    suite: "Eine Suite an Bord der Hathor",
    dining: "Speisen an Bord der Hathor",
    life: "Das Leben an Bord der Hathor",
    river: "Die Hathor auf dem Fluss",
    craft: "Handwerk an Bord der Hathor",
    cabin: "Eine Kabine an Bord der Hathor",
    restaurant: "Das Innenrestaurant der Hathor",
    bar: "Die Bar an Bord der Hathor",
    fineDining: "Feine Küche an Bord der Hathor",
    legacy: "Das Erbe der Hathor auf dem Nil",
    deck: "Das Leben auf dem Deck der Hathor",
    royalExperience: "Das Erlebnis der Royal Suite",
    diningExperience: "Das kulinarische Erlebnis",
    card: "Hathor Dahabiya",
  },
  aboardAlt: (title) => `${title} an Bord der Hathor`,
  leadCaption: "An Bord · Drei Decks · 32 Gäste",
  manifesto: ["Die Dahabiya", "Erleben Sie", "Ägypten in", "neuem Licht"],
  principles: [
    {
      title: "Kabinen",
      text: "Acht Luxuskabinen mit feinem Komfort: 22 m² zeitgemäßes Wohnen auf dem Nil, mit eigenem Bad und Smart-Systemen.",
    },
    {
      title: "Suiten",
      text: "Zwei elegante Suiten auf dem Unterdeck: 46 m² unverwechselbarer Luxus mit Panoramablick auf den Nil und privatem Jacuzzi.",
    },
    {
      title: "Royal",
      text: "Zwei prachtvolle Royal Suites auf dem Hauptdeck: 56 m², das Juwel des Schiffes, für alle, die das Außergewöhnliche suchen.",
    },
  ],
  stays: [
    { meta: "22 m²", place: "Oberdeck", title: "Kabine" },
    { meta: "46 m²", place: "Unterdeck", title: "Suite" },
    { meta: "56 m²", place: "Hauptdeck", title: "Royal" },
  ],
  experience: "Das Erlebnis",
  diningLines: ["Feine Küche", "auf Ägyptens", "schönster Dahabiya"],
  exploreDining: "Kulinarik entdecken",
  welcomeFallback: "Willkommen an Bord",
  epilogue: ["Zeitloser Luxus", "auf dem Nil"],
  bookNow: "Jetzt buchen",
  exploreCruises: "Kreuzfahrten entdecken",
  cardTitle: "Die Dahabiya",
  cardBody: ["Drei Decks voller Stille", "auf einer privaten Nilkreuzfahrt"],
};
