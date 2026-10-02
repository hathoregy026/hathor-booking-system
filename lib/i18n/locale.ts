/**
 * Public-site languages. English lives at the root (no prefix, so every
 * existing URL, canonical and ranking stays where it is); every other language
 * lives under its own prefix — `/it`, `/it/voyages`, …
 *
 * Kept free of React and path aliases so blocking scripts, server code and
 * client components can all share the same rules.
 */

export const PUBLIC_LOCALES = ["en", "it"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

export type TranslatedLocale = Exclude<PublicLocale, "en">;

export const DEFAULT_PUBLIC_LOCALE: PublicLocale = "en";

/** Value for `<html lang>`. */
export const PUBLIC_LOCALE_HTML_LANG: Record<PublicLocale, string> = {
  en: "en",
  it: "it",
};

/**
 * Pages that exist in each added language. English is every page; another
 * language lists only the pages translated so far, so nothing links to an
 * address that does not exist and no half-translated page is reachable.
 */
export const TRANSLATED_PATHS: Record<TranslatedLocale, readonly string[]> = {
  it: ["/"],
};

const PREFIXED_LOCALES = PUBLIC_LOCALES.filter(
  (locale): locale is TranslatedLocale => locale !== DEFAULT_PUBLIC_LOCALE,
);

function cleanPath(pathname: string): string {
  const path = (pathname.split(/[?#]/, 1)[0] || "/").trim() || "/";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

/**
 * Split a URL pathname into its language and the page it shows.
 * `/it` → it + `/`, `/it/voyages` → it + `/voyages`, `/italy` → en + `/italy`.
 */
export function splitLocalePath(pathname: string | null | undefined): {
  locale: PublicLocale;
  path: string;
} {
  const path = cleanPath(pathname || "/");
  for (const locale of PREFIXED_LOCALES) {
    if (path === `/${locale}`) return { locale, path: "/" };
    if (path.startsWith(`/${locale}/`)) {
      return { locale, path: path.slice(locale.length + 1) };
    }
  }
  return { locale: DEFAULT_PUBLIC_LOCALE, path };
}

/** The page a pathname shows, with any language prefix removed. */
export function stripLocalePrefix(pathname: string | null | undefined): string {
  return splitLocalePath(pathname).path;
}

export function isTranslatedPath(path: string, locale: PublicLocale): boolean {
  if (locale === "en") return true;
  return TRANSLATED_PATHS[locale].includes(cleanPath(path));
}

/** The address of `path` in `locale`, or null when that page is not translated yet. */
export function pathInLocale(path: string, locale: PublicLocale): string | null {
  const page = cleanPath(path);
  if (!isTranslatedPath(page, locale)) return null;
  if (locale === DEFAULT_PUBLIC_LOCALE) return page;
  return page === "/" ? `/${locale}` : `/${locale}${page}`;
}

/**
 * Point an internal link at the visitor's language when that page exists in
 * it; otherwise leave it on the English page. External links, anchors and
 * already-prefixed links pass through untouched.
 */
export function localizedHref(href: string, locale: PublicLocale): string {
  if (locale === DEFAULT_PUBLIC_LOCALE) return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const match = /^([^?#]*)(.*)$/.exec(href);
  const page = match?.[1] || "/";
  const rest = match?.[2] ?? "";
  if (splitLocalePath(page).locale !== DEFAULT_PUBLIC_LOCALE) return href;
  const target = pathInLocale(page, locale);
  return target ? `${target}${rest}` : href;
}

/**
 * Blocking script for <head>: the root layout is shared by every language and
 * must stay static, so `<html lang>` is set from the address before paint.
 */
export function getHtmlLangBlockingScript(): string {
  const langs = Object.fromEntries(
    PREFIXED_LOCALES.map((locale) => [locale, PUBLIC_LOCALE_HTML_LANG[locale]]),
  );
  return `(function(){try{var m=/^\\/([a-z]{2})(?=\\/|$)/.exec(location.pathname||"");var l=${JSON.stringify(langs)};if(m&&l[m[1]])document.documentElement.lang=l[m[1]];}catch(e){}})();`;
}
