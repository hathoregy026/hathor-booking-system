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
 * Overlay + dismiss timer run here — must NOT wait for React hydrate (that caused 5s+ gold).
 * Admin never mounts WelcomeSplash, so locking here would freeze the dashboard forever.
 */
export function getWelcomeSplashBlockingScript(
  enabled = true,
  imageUrl = "/branding/hathor-welcome-aboard.webp",
): string {
  if (!enabled) {
    return `(function(){try{document.documentElement.classList.add("hathor-welcome-skip");document.documentElement.classList.add("hathor-welcome-ready");}catch(e){}})();`;
  }
  const src = JSON.stringify(imageUrl);
  return `(function(){try{var p=(location.pathname||"/");if(p==="/admin"||p.indexOf("/admin/")===0)return;var d=document.documentElement;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("hathor-welcome-skip");d.classList.add("hathor-welcome-ready");return;}if(d.classList.contains("hathor-welcome-ready")||d.classList.contains("hathor-welcome-skip"))return;d.classList.add("hathor-welcome-lock");var HOLD=700,FADE=220;function unlock(){d.classList.add("hathor-welcome-ready");d.classList.remove("hathor-welcome-lock");}function finish(){if(d.classList.contains("hathor-welcome-ready")||d.classList.contains("hathor-welcome-skip"))return;var el=document.getElementById("hathor-welcome-boot");if(!el){unlock();return;}el.classList.add("hathor-welcome-splash--out");setTimeout(function(){unlock();try{el.remove();}catch(e){}},FADE);}function mount(){if(document.getElementById("hathor-welcome-boot"))return;var wrap=document.createElement("div");wrap.id="hathor-welcome-boot";wrap.className="hathor-welcome-splash";wrap.setAttribute("aria-hidden","true");wrap.setAttribute("role","presentation");var img=document.createElement("img");img.className="hathor-welcome-splash__img";img.alt="";img.decoding="async";try{img.fetchPriority="high";}catch(e){}img.src=${src};wrap.appendChild(img);(document.body||d).appendChild(wrap);}if(document.body)mount();else document.addEventListener("DOMContentLoaded",mount);setTimeout(finish,HOLD);}catch(e){}})();`;
}

/**
 * Critical CSS for the welcome splash — paints full-screen cover before CSS bundles.
 * Overlay covers the site; we do NOT hide `.public-site` (that waited on hydrate = multi-second gold).
 */
export function getWelcomeSplashCriticalStyle(): string {
  return [
    "html.hathor-welcome-skip .hathor-welcome-splash{",
    "display:none!important;pointer-events:none!important;",
    "}",
    "@media (prefers-reduced-motion: reduce){",
    ".hathor-welcome-splash{display:none!important;pointer-events:none!important;}",
    "}",
    "html.hathor-welcome-lock:not(.hathor-welcome-ready):not(.hathor-welcome-skip),",
    "html.hathor-welcome-lock:not(.hathor-welcome-ready):not(.hathor-welcome-skip) body{",
    "overflow:hidden!important;overscroll-behavior:none;",
    "}",
    /* Admin never runs WelcomeSplash — never inherit the public scroll lock. */
    "html.admin-app,html.admin-app body{",
    "overflow:auto!important;overscroll-behavior:auto;",
    "}",
    ".hathor-welcome-splash{",
    "position:fixed;inset:0;z-index:2147483000;",
    "display:flex;align-items:center;justify-content:center;",
    "background:#c4a052;margin:0;padding:0;",
    "opacity:1;transition:opacity .22s ease-out;",
    "pointer-events:auto;",
    "}",
    ".hathor-welcome-splash--out{",
    "opacity:0;pointer-events:none;",
    "}",
    ".hathor-welcome-splash__img{",
    "display:block;width:auto;height:auto;",
    "max-width:min(92vw,720px);max-height:70vh;",
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
