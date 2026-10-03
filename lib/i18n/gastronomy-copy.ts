/**
 * The Dining page's own words (not dashboard text) in every public language:
 * image descriptions and two labels. English is the live copy, character for
 * character.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

export type GastronomyCopy = {
  storyLabel: string;
  rail: readonly [string, string, string];
  alts: {
    introHero: string;
    courses: string;
    service: string;
    salon: string;
    celebration: string;
    fitness: string;
    suite: string;
    goldenHour: string;
    table: string;
    gym: string;
    privateCelebration: string;
  };
  storyAlts: readonly [string, string, string, string, string];
  /** Plates use the dashboard's image description; null keeps it. */
  plateAlt: string | null;
};

export const GASTRONOMY_COPY: Record<PublicLocale, GastronomyCopy> = {
  en: {
    storyLabel: "The Hathor dining story",
    rail: ["DINING", "MOVE", "REST"],
    alts: {
      introHero: "Dining beside the Nile aboard Hathor",
      courses: "A sequence of Hathor tasting courses",
      service: "Warm attentive service aboard Hathor",
      salon: "Hathor's intimate dining salon",
      celebration: "A candlelit celebration on Hathor",
      fitness: "Hathor onboard fitness",
      suite: "A calm Hathor suite",
      goldenHour: "The last golden hour at the Hathor table",
      table: "A Hathor table prepared beside the river",
      gym: "Hathor's onboard gym",
      privateCelebration: "A private celebration on Hathor",
    },
    storyAlts: [
      "Breakfast served aboard Hathor in the Nile morning light",
      "Hathor's chef composing an evening course",
      "An intimate supper overlooking the Nile",
      "Guests training in Hathor's onboard fitness space",
      "Private service in a Hathor Nile suite",
    ],
    plateAlt: null,
  },
  it: {
    storyLabel: "Il racconto della cucina di Hathor",
    rail: ["CUCINA", "MOVIMENTO", "RIPOSO"],
    alts: {
      introHero: "A tavola sul Nilo a bordo di Hathor",
      courses: "Una sequenza di portate della degustazione di Hathor",
      service: "Un servizio caloroso e attento a bordo di Hathor",
      salon: "L’intima sala da pranzo di Hathor",
      celebration: "Una festa a lume di candela a bordo di Hathor",
      fitness: "Il fitness a bordo di Hathor",
      suite: "Una suite tranquilla di Hathor",
      goldenHour: "L’ultima ora dorata alla tavola di Hathor",
      table: "Una tavola di Hathor apparecchiata sul fiume",
      gym: "La palestra di bordo di Hathor",
      privateCelebration: "Una festa privata a bordo di Hathor",
    },
    storyAlts: [
      "La colazione servita a bordo di Hathor nella luce del mattino sul Nilo",
      "Lo chef di Hathor compone una portata serale",
      "Una cena intima con vista sul Nilo",
      "Ospiti che si allenano nello spazio fitness di Hathor",
      "Servizio privato in una suite di Hathor sul Nilo",
    ],
    plateAlt: "Una portata della cucina di Hathor",
  },
};
