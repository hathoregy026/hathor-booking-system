import type { PublicLocale } from "@/lib/i18n/locale";
import { PAGES_DE } from "@/lib/i18n/website-text-de";
import { PAGES_IT } from "@/lib/i18n/website-text-it";
import type { WebsiteText } from "@/lib/website-text-shared";

const PAGES_BY_LOCALE: Record<PublicLocale, Partial<WebsiteText["pages"]>> = {
  en: {},
  it: PAGES_IT,
  de: PAGES_DE,
};

/** The dashboard text for a language: its translated sections over the live English. */
export function localizeWebsiteText(text: WebsiteText, locale: PublicLocale): WebsiteText {
  const pages = PAGES_BY_LOCALE[locale];
  if (!Object.keys(pages).length) return text;
  return { ...text, pages: { ...text.pages, ...pages } };
}
