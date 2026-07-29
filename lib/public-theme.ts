export type PublicTheme = "day" | "night";

export const PUBLIC_THEME_STORAGE_KEY = "hathor-public-theme";

export const PUBLIC_THEME_DEFAULT: PublicTheme = "day";

export function isPublicTheme(value: string | null): value is PublicTheme {
  return value === "day" || value === "night";
}

export function normalizePublicTheme(value: string | null): PublicTheme {
  if (value === "night") return "night";
  return PUBLIC_THEME_DEFAULT;
}

/** Blocking inline script — must run in <head> before paint. */
export function getPublicThemeBlockingScript(): string {
  const key = PUBLIC_THEME_STORAGE_KEY;
  const fallback = PUBLIC_THEME_DEFAULT;
  return `(function(){try{var k=${JSON.stringify(key)};var t=localStorage.getItem(k);var theme=t==="night"?"night":"day";document.documentElement.setAttribute("data-public-theme",theme);}catch(e){document.documentElement.setAttribute("data-public-theme",${JSON.stringify(fallback)});}})();`;
}

/**
 * Critical home CSS in <head> — kills unstyled giant letter images before any CSS bundle.
 * Full-page veil (ex-pending-deep) only when a mid-page scroll restore is pending.
 */
export function getHomeBootCriticalStyle(): string {
  return [
    "html.ex-home:not(.ex-scroll-ready):not(.is-touch-device) .hero-logo-mark,",
    "html.ex-home:not(.ex-scroll-ready):not(.is-touch-device) .hathor-logo-split,",
    "html.ex-home:not(.ex-scroll-ready):not(.is-touch-device) .hathor-logo-split .logo-letter-wrap,",
    "html.ex-home:not(.ex-scroll-ready):not(.is-touch-device) .hathor-logo-split img,",
    "html.ex-home:not(.ex-scroll-ready) .blind-strip-v{",
    "opacity:0!important;visibility:hidden!important;pointer-events:none!important;",
    "}",
    "html.ex-home:not(.ex-scroll-ready):not(.is-touch-device) .hathor-logo-split img{",
    "width:0!important;height:0!important;max-width:0!important;max-height:0!important;",
    "}",
    "html.ex-home.ex-pending-deep:not(.ex-scroll-ready) .public-site{",
    "opacity:0!important;pointer-events:none!important;",
    "}",
    "html.ex-home.ex-pending-deep:not(.ex-scroll-ready),",
    "html.ex-home.ex-pending-deep:not(.ex-scroll-ready) body{",
    "background:#ece8df!important;",
    "}",
  ].join("");
}

/** Critical CSS for inner public heroes (cruises, about, etc.) before motion hook runs. */
export function getPublicHeroBootCriticalStyle(): string {
  return [
    "html:not(.ex-home):not(.hero-motion-ready):not(.ex-scroll-ready) .home-hero-container .hero-heading,",
    "html:not(.ex-home):not(.hero-motion-ready):not(.ex-scroll-ready) .home-hero-container .hero-button{",
    "opacity:0!important;visibility:hidden!important;pointer-events:none!important;",
    "}",
  ].join("");
}

/**
 * Home boot: tag html.ex-home, force scrollTop 0, deep-veil only if restoring mid-page.
 */
export function getHomeScrollPendingBlockingScript(): string {
  return `(function(){try{var p=(location.pathname||"/").replace(/\\/+$/,"")||"/";if(p!=="/")return;var d=document.documentElement;d.classList.add("ex-home");if("scrollRestoration"in history)history.scrollRestoration="manual";window.scrollTo(0,0);d.scrollTop=0;if(document.body)document.body.scrollTop=0;var y=0;try{y=Number(sessionStorage.getItem("hathor:scroll-y:/")||0)||0;}catch(e){}if(y>120)d.classList.add("ex-pending-deep");}catch(e){}})();`;
}

export function readPublicThemeFromDocument(): PublicTheme {
  if (typeof document === "undefined") return PUBLIC_THEME_DEFAULT;
  const fromDom = document.documentElement.getAttribute("data-public-theme");
  return normalizePublicTheme(fromDom);
}

export function applyPublicThemeToDocument(theme: PublicTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-public-theme", theme);
}

export function persistPublicTheme(theme: PublicTheme): void {
  try {
    localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable */
  }
}

export function isHeroRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/preview"
  );
}

const PAGE_HERO_PREFIXES = [
  "/blogs",
  "/about",
  "/cruises",
  "/highlights",
  "/gastronomy",
  "/wellness",
  "/charter",
  "/contact",
  "/rooms",
  "/luxury-cabins",
  "/Luxury-Royal",
] as const;

/** Routes with a full-bleed image hero — header needs light nav text at the top. */
export function hasPageHero(pathname: string): boolean {
  if (isHeroRoute(pathname)) return true;
  return PAGE_HERO_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type HeaderBase = "hathor-header" | "preview-header";

export function getPublicHeaderClassName({
  theme,
  scrolled,
  overHero,
  baseClass = "hathor-header",
}: {
  theme: PublicTheme;
  scrolled: boolean;
  overHero: boolean;
  baseClass?: HeaderBase;
}): string {
  if (scrolled) {
    return theme === "day"
      ? `${baseClass} ${baseClass}--solid ${baseClass}--light`
      : `${baseClass} ${baseClass}--solid`;
  }

  const overHeroClass = overHero ? ` ${baseClass}--over-hero` : "";
  return `${baseClass} ${baseClass}--transparent${overHeroClass}`;
}
