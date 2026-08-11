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
  return `(function(){try{var k=${JSON.stringify(key)};var t=localStorage.getItem(k);var theme;if(t==="night"||t==="day"){theme=t;}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches){theme="night";}else{theme="day";}document.documentElement.setAttribute("data-public-theme",theme);}catch(e){document.documentElement.setAttribute("data-public-theme",${JSON.stringify(fallback)});}})();`;
}

/**
 * Critical home CSS in <head> — kills unstyled giant letter images + hero type FOUC.
 * Full-page veil (ex-pending-deep) only when a mid-page scroll restore is pending.
 */
export function getHomeBootCriticalStyle(): string {
  return [
    /* Logo letters: never paint at intrinsic size on any device before scroll-ready. */
    "html.ex-home:not(.ex-scroll-ready) .hero-logo-mark,",
    "html.ex-home:not(.ex-scroll-ready) .hathor-logo-split,",
    "html.ex-home:not(.ex-scroll-ready) .hathor-logo-split .logo-letter-wrap,",
    "html.ex-home:not(.ex-scroll-ready) .hathor-logo-split img,",
    "html.ex-home:not(.ex-scroll-ready) .blind-strip-v{",
    "opacity:0!important;visibility:hidden!important;pointer-events:none!important;",
    "}",
    "html.ex-home:not(.ex-scroll-ready) .hathor-logo-split img{",
    "width:0!important;height:0!important;max-width:0!important;max-height:0!important;",
    "}",
    /* Hero titles: hide until display fonts are ready — no fallback→Bitho/Carista morph. */
    "html.ex-home:not(.hathor-hero-type-ready) .home-hero-container .hero-heading,",
    "html.ex-home:not(.hathor-hero-type-ready) .home-hero-container .hero-heading .hero-line{",
    "opacity:0!important;visibility:hidden!important;",
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

/**
 * Preload + gate hero display fonts so titles never flash in a fallback face.
 * Marks html.hathor-hero-type-ready as soon as faces load (failsafe 400ms).
 */
export function getHeroTypeReadyBlockingScript(): string {
  return `(function(){try{var d=document.documentElement;if(d.classList.contains("hathor-hero-type-ready"))return;function done(){d.classList.add("hathor-hero-type-ready");}var faces=["Bitho Luxury","Carista","Gabigaile","Quiet Luxury","Agraham"];var fail=setTimeout(done,400);if(!document.fonts||!document.fonts.load){clearTimeout(fail);done();return;}Promise.all(faces.map(function(f){return document.fonts.load('400 64px "'+f+'"');})).then(function(){clearTimeout(fail);done();}).catch(function(){clearTimeout(fail);done();});}catch(e){try{document.documentElement.classList.add("hathor-hero-type-ready");}catch(x){}}})();`;
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
 * Welcome splash is retired on the public site.
 * Always skip + strip any leftover overlay from a cached/old shell.
 */
export function getWelcomeSplashBlockingScript(
  _enabled = false,
  _imageUrl = "/branding/hathor-welcome-aboard.webp",
): string {
  return `(function(){try{var d=document.documentElement;d.classList.add("hathor-welcome-skip");d.classList.add("hathor-welcome-ready");d.classList.remove("hathor-welcome-lock");function nuke(){try{document.querySelectorAll(".hathor-welcome-splash,#hathor-welcome-boot").forEach(function(el){el.remove();});}catch(e){}}nuke();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",nuke);else nuke();var obs=new MutationObserver(nuke);if(document.documentElement)obs.observe(document.documentElement,{childList:!0,subtree:!0});setTimeout(function(){try{obs.disconnect();}catch(e){}},4000);}catch(e){}})();`;
}

/**
 * Force-hide any leftover welcome splash nodes (stale HTML / bfcache).
 * No gold cover styles — the preload must never paint.
 */
export function getWelcomeSplashCriticalStyle(): string {
  return [
    ".hathor-welcome-splash,#hathor-welcome-boot{",
    "display:none!important;opacity:0!important;visibility:hidden!important;",
    "pointer-events:none!important;background:transparent!important;",
    "}",
    "html.hathor-welcome-lock,html.hathor-welcome-lock body{",
    "overflow:auto!important;overscroll-behavior:auto;",
    "}",
    "html.admin-app,html.admin-app body{",
    "overflow:auto!important;overscroll-behavior:auto;",
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
