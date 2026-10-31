/**
 * Words of the occasions layer (lib/occasions.ts) that come from the dashboard,
 * in other languages. The built-in text below is looked up by the exact English
 * the dashboard's templates write, so a standard occasion is in Italian the
 * moment it is switched on. A custom message with no line here is left off
 * Italian pages rather than shown in English. The layer's fixed labels live in
 * chrome-copy.ts.
 */
import type { Occasion, OccasionStripeItem } from "@/lib/occasions";
import {
  localizedHref,
  splitLocalePath,
  type PublicLocale,
  type TranslatedLocale,
} from "@/lib/i18n/locale";

/* English exactly as stored or as a template writes it. "2027" stands for any year. */
const BUILT_IN_YEAR = "2027";
const BUILT_IN_TEXT: Record<TranslatedLocale, ReadonlyMap<string, string>> = {
  it: new Map([
    /* Occasion names */
    ["New Year's Eve", "Capodanno"],
    ["Christmas", "Natale"],
    ["Ramadan & Eid", "Ramadan ed Eid"],
    ["National day", "Festa nazionale"],
    ["Abu Simbel Sun Festival", "Festa del Sole di Abu Simbel"],
    ["Valentine's & honeymoon", "San Valentino e luna di miele"],
    ["New occasion", "Nuova ricorrenza"],
    /* Countdown captions */
    ["Until New Year", "Fino a Capodanno"],
    ["Until New Year's Eve", "Fino a Capodanno"],
    ["Until the sun festival", "Fino alla festa del sole"],
    /* New Year */
    ["2027 begins in {countdown}", "Il 2027 inizia tra {countdown}"],
    ["Season's greetings from everyone aboard Hathor", "Buone feste da tutti noi a bordo di Hathor"],
    ["Plan your 2027 Nile voyage", "Pianifica il viaggio sul Nilo del 2027"],
    ["Happy New Year 2027 from everyone aboard Hathor", "Buon 2027 da tutti noi a bordo di Hathor"],
    /* Christmas */
    ["Merry Christmas from the crew of Hathor", "Buon Natale dall’equipaggio di Hathor"],
    ["Coptic Christmas, 7 January, celebrated in Luxor", "Il Natale copto, il 7 gennaio, si festeggia a Luxor"],
    /* Ramadan & Eid: the greetings are the same in Italian */
    ["Ramadan Kareem · رمضان كريم", "Ramadan Kareem · رمضان كريم"],
    ["Eid Mubarak · عيد مبارك", "Eid Mubarak · عيد مبارك"],
    /* National day */
    ["Happy National Day", "Buona festa nazionale"],
    /* Abu Simbel Sun Festival */
    [
      "The sun reaches the inner sanctuary of Abu Simbel in {countdown}",
      "Il sole raggiunge il santuario interno di Abu Simbel tra {countdown}",
    ],
    ["Twice a year, on 22 February and 22 October", "Due volte l’anno, il 22 febbraio e il 22 ottobre"],
    ["Today the sun lights the sanctuary of Abu Simbel", "Oggi il sole illumina il santuario di Abu Simbel"],
    /* Valentine's & honeymoon */
    ["Honeymoon on the Nile", "Luna di miele sul Nilo"],
    ["Celebrate together aboard Hathor", "Da festeggiare insieme a bordo di Hathor"],
    /* Blank occasion */
    ["Your message here", "Il Suo messaggio qui"],
  ]),
};

/** The built-in text for this English, in any year; null when there is none. */
function builtInOccasionText(english: string, locale: TranslatedLocale): string | null {
  const table = BUILT_IN_TEXT[locale];
  const key = english.trim();
  const exact = table.get(key);
  if (exact !== undefined) return exact;
  const year = /\b20\d{2}\b/.exec(key)?.[0];
  if (!year) return null;
  return table.get(key.replace(year, BUILT_IN_YEAR))?.replaceAll(BUILT_IN_YEAR, year) ?? null;
}

const OWN_SITE = /^https:\/\/(?:www\.)?hathorcruise\.com(?=[/?#]|$)/i;

/**
 * Where a stripe link goes in this language. Other sites pass through; a page
 * of this site with no version in the language gives null, so the message stays
 * as plain text instead of sending the visitor to an English page.
 */
export function occasionHref(href: string | null, locale: PublicLocale): string | null {
  if (!href || locale === "en") return href;
  const local = href.replace(OWN_SITE, "") || "/";
  if (!local.startsWith("/") || local.startsWith("//")) return href;
  const target = localizedHref(local, locale);
  return splitLocalePath(target).locale === locale ? target : null;
}

/** The messages a visitor reads in this language (see the note at the top). */
export function localizedStripeItems(items: OccasionStripeItem[], locale: PublicLocale): OccasionStripeItem[] {
  if (locale === "en") return items;
  return items.flatMap((item) => {
    const text = builtInOccasionText(item.text, locale);
    return text ? [{ ...item, text, href: occasionHref(item.href, locale) }] : [];
  });
}

/** The occasion's name, which labels the stripe, and its countdown caption, given the English caption. */
export function occasionWords(
  occasion: Occasion,
  englishCaption: string,
  locale: PublicLocale,
): { name: string; caption: string } {
  if (locale === "en") return { name: occasion.name, caption: englishCaption };
  return {
    name: builtInOccasionText(occasion.name, locale) ?? "Hathor",
    caption: builtInOccasionText(englishCaption, locale) ?? "Conto alla rovescia",
  };
}
