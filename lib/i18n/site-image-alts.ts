import type { PublicLocale, TranslatedLocale } from "@/lib/i18n/locale";
import { SITE_IMAGE_ALTS_DE } from "@/lib/i18n/site-image-alts-de";
import { SITE_IMAGE_ALTS_IT } from "@/lib/i18n/site-image-alts-it";

const SITE_IMAGE_ALTS: Record<TranslatedLocale, Record<string, string>> = {
  it: SITE_IMAGE_ALTS_IT,
  de: SITE_IMAGE_ALTS_DE,
};

/** A site-image alt in the visitor's language; unknown alts pass through. */
export function siteImageAltIn(locale: PublicLocale, alt: string): string {
  if (locale === "en") return alt;
  return SITE_IMAGE_ALTS[locale][alt.trim()] ?? alt;
}
