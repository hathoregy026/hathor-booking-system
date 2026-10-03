/**
 * Translated hero titles (Dashboard → Typography → hero pages), laid over the
 * live settings on that language's pages only. A page is added here when the
 * page itself is translated; until then it keeps the dashboard's English.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import type { HeroPageKey, TypographySettings } from "@/lib/typography-settings-shared";

type HeroPages = TypographySettings["hero_pages"];

const HERO_PAGES_IT: Partial<HeroPages> = {
  /* Three short lines, the ladder the cruises intro is drawn for. */
  cruises: { main: "Crociere\nin dahabiya", second: "sul Nilo" },
  /* The charter page breaks each line into two-word phrases. */
  charter: { main: "Charter privato\nin dahabiya", second: "Viaggio esclusivo" },
  about: { main: "Benvenuti a bordo", second: "Hathor Cruise" },
  contact: { main: "Ci contatti", second: "Per ogni domanda" },
  wellness: { main: "Un’oasi galleggiante", second: "Relax e allenamento" },
  highlights: { main: "Crociera in dahabiya", second: "Da non perdere" },
  partners: { main: "I nostri partner", second: "Fiducia nel mondo" },
};

const HERO_PAGES_BY_LOCALE: Record<PublicLocale, Partial<HeroPages>> = {
  en: {},
  it: HERO_PAGES_IT,
};

/** The settings with this language's hero titles; English gets the same object back. */
export function localizeTypography(
  settings: TypographySettings,
  locale: PublicLocale,
): TypographySettings {
  const pages = HERO_PAGES_BY_LOCALE[locale];
  const keys = Object.keys(pages) as HeroPageKey[];
  if (!keys.length) return settings;
  const heroPages = { ...settings.hero_pages };
  for (const key of keys) {
    const copy = pages[key];
    if (copy) heroPages[key] = { ...heroPages[key], ...copy };
  }
  return { ...settings, hero_pages: heroPages };
}
