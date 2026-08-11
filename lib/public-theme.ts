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
 * Early welcome gate: skip admin + prefers-reduced-motion; else lock scroll before paint.
 * Must run in <head> so users cannot scroll behind the splash pre-hydrate.
 * Admin never mounts WelcomeSplash, so locking here would freeze the dashboard forever.
 */
export function getWelcomeSplashBlockingScript(enabled = true): string {
  if (!enabled) {
    return `(function(){try{document.documentElement.classList.add("hathor-welcome-skip");}catch(e){}})();`;
  }
  return `(function(){try{var p=(location.pathname||"/");if(p==="/admin"||p.indexOf("/admin/")===0)return;var d=document.documentElement;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("hathor-welcome-skip");return;}d.classList.add("hathor-welcome-lock");setTimeout(function(){if(!d.classList.contains("hathor-welcome-ready")&&!d.classList.contains("hathor-welcome-skip")){d.classList.add("hathor-welcome-ready");d.classList.remove("hathor-welcome-lock");}},2500);}catch(e){}})();`;
}

/**
 * Critical CSS for the welcome splash — paints full-screen cover before CSS bundles.
 * Lives outside `.public-site` so mid-page `ex-pending-deep` opacity veil cannot hide it.
 *
 * Site stays hidden until `hathor-welcome-ready` (splash finished) or `hathor-welcome-skip`.
 * That gate is stronger than `hathor-welcome-lock` alone — lock can flap on remount.
 */
export function getWelcomeSplashCriticalStyle(): string {
  return [
    "html.hathor-welcome-skip .hathor-welcome-splash{",
    "display:none!important;pointer-events:none!important;",
    "}",
    "@media (prefers-reduced-motion: reduce){",
    ".hathor-welcome-splash{display:none!important;pointer-events:none!important;}",
    "}",
    /* Gold + hide site from first paint until splash finishes or is skipped. */
    "html.hathor-welcome-lock:not(.hathor-welcome-ready):not(.hathor-welcome-skip),",
    "html.hathor-welcome-lock:not(.hathor-welcome-ready):not(.hathor-welcome-skip) body{",
    "background:#c4a052!important;",
    "overflow:hidden!important;overscroll-behavior:none;",
    "}",
    "html.hathor-welcome-lock:not(.hathor-welcome-ready):not(.hathor-welcome-skip) .public-site{",
    "opacity:0!important;visibility:hidden!important;pointer-events:none!important;",
    "}",
    /* Admin never runs WelcomeSplash — never inherit the public scroll lock. */
    "html.admin-app,html.admin-app body{",
    "overflow:auto!important;overscroll-behavior:auto;",
    "}",
    ".hathor-welcome-splash{",
    "position:fixed;inset:0;z-index:2147483000;",
    "display:flex;align-items:center;justify-content:center;",
    "background:#c4a052;margin:0;padding:0;",
    "opacity:1;transition:opacity .28s ease-out;",
    "pointer-events:auto;",
    "}",
    ".hathor-welcome-splash--out{",
    "opacity:0;pointer-events:none;",
    "}",
    ".hathor-welcome-splash__img{",
    "display:block;width:auto;height:auto;",
    "max-width:100%;max-height:100%;",
    "object-fit:contain;object-position:center;",
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
