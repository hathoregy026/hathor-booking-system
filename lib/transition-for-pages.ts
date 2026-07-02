/**
 * Next.js module port of transition-for-pages.js (canonical logic unchanged).
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STYLE_ID = "transition-for-pages-styles";

type TransitionColors = {
  gold: string;
  cream: string;
};

type TransitionOptions = {
  root?: HTMLElement | null;
  rootSelector?: string;
  colors?: Partial<TransitionColors>;
  pinHeight?: string;
  lenis?: boolean;
  nav?: string;
  scrollTriggerId?: string;
};

type Strip = {
  el: HTMLDivElement;
  colW: number;
  slatW: number;
};

type Controller = {
  init: () => void;
  destroy: () => void;
  refresh: () => void;
  root: HTMLElement;
};

let activeInstance: { destroy: () => void; refresh: () => void } | null = null;

const DEFAULTS = {
  rootSelector: "[data-page-transition]",
  stage: ".pt-stage",
  maskSelector: ".pt-mask",
  sheet: ".pt-sheet",
  heroCopy: ".pt-hero__copy",
  archInner: "[data-pt-arch-inner]",
  label: "[data-pt-label]",
  ornaments: "[data-pt-ornaments]",
  body: "[data-pt-body]",
  nav: "[data-pt-nav]",
  colors: {
    gold: "#C9A96E",
    cream: "#ECE8DF",
  },
  pinHeight: "280vh",
  domeRadius: {
    start: "1250px",
    end: "400px",
  },
  peekVh: 0.065,
  mask: {
    start: 0.02,
    end: 0.88,
    gapRatio: 0.94,
    rotSpread: 0.82,
    rotWindow: 0.04,
    gapSealStart: 0.48,
    gapSealStagger: 0.32,
    gapSealWindow: 0.022,
  },
  strips: {
    mobile: 25,
    tablet: 35,
    desktop: 52,
  },
  scrollTriggerId: "transition-for-pages-scroll",
};

const CSS = `
[data-page-transition] {
  --pt-gold: #C9A96E;
  --pt-cream: #ECE8DF;
  --pt-pin-height: 280vh;
  --pt-dome-r-start: 1250px;
  --pt-dome-r-end: 400px;
  height: var(--pt-pin-height);
  position: relative;
}

[data-page-transition] .pt-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
}

[data-page-transition] .pt-hero {
  position: absolute;
  inset: 0;
  z-index: 1;
}

[data-page-transition] .pt-hero__media {
  position: absolute;
  inset: 0;
}

[data-page-transition] .pt-hero__media video,
[data-page-transition] .pt-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

[data-page-transition] .pt-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform-style: preserve-3d;
}

[data-page-transition] .pt-mask.is-active {
  visibility: visible;
}

[data-page-transition] .pt-mask__col {
  position: absolute;
  top: 0;
  height: 100%;
  transform-style: preserve-3d;
}

[data-page-transition] .pt-mask__strip {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--pt-gold);
  transform-origin: left center;
  transform-style: preserve-3d;
  transform: rotateY(-90deg);
  opacity: 0;
  backface-visibility: hidden;
  will-change: transform, opacity, width;
}

[data-page-transition] .pt-hero__copy {
  position: absolute;
  z-index: 3;
  pointer-events: auto;
}

[data-page-transition] .pt-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: var(--pt-cream);
  border-top-left-radius: var(--pt-dome-r-start);
  border-top-right-radius: var(--pt-dome-r-start);
  will-change: transform, border-radius;
}

[data-page-transition] [data-pt-arch-inner] {
  overflow: hidden;
  will-change: clip-path;
}

[data-page-transition] [data-pt-arch-inner] img {
  transform-origin: center top;
  will-change: transform;
}

@media (max-width: 1024px) {
  [data-page-transition] {
    --pt-dome-r-start: 300px;
    --pt-dome-r-end: 200px;
    --pt-pin-height: 260vh;
  }
}

@media (max-width: 767px) {
  [data-page-transition] {
    --pt-dome-r-start: 150px;
    --pt-dome-r-end: 80px;
    --pt-pin-height: 240vh;
  }
}
`;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function mapRange(
  p: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = clamp((p - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

function stripCount(opts: typeof DEFAULTS) {
  const w = window.innerWidth;
  if (w <= 767) return opts.strips.mobile;
  if (w <= 1024) return opts.strips.tablet;
  return opts.strips.desktop;
}

function applyTheme(root: HTMLElement, opts: typeof DEFAULTS) {
  root.style.setProperty("--pt-gold", opts.colors.gold);
  root.style.setProperty("--pt-cream", opts.colors.cream);
  root.style.setProperty("--pt-pin-height", opts.pinHeight);
  root.style.setProperty("--pt-dome-r-start", opts.domeRadius.start);
  root.style.setProperty("--pt-dome-r-end", opts.domeRadius.end);
}

function createController(root: HTMLElement, opts: typeof DEFAULTS): Controller | null {
  const pin = root;
  const stage = root.querySelector<HTMLElement>(opts.stage);
  const maskEl = root.querySelector<HTMLElement>(opts.maskSelector);
  const sheet = root.querySelector<HTMLElement>(opts.sheet);
  const heroCopy = root.querySelector<HTMLElement>(opts.heroCopy);
  const nav =
    opts.nav && !opts.nav.includes("___pt-nav-none___")
      ? document.querySelector<HTMLElement>(opts.nav)
      : null;
  const label = root.querySelector<HTMLElement>(opts.label);
  const ornaments = root.querySelector<HTMLElement>(opts.ornaments);
  const archInner = root.querySelector<HTMLElement>(opts.archInner);
  const archImg = archInner?.querySelector<HTMLImageElement>("img");
  const body = root.querySelector<HTMLElement>(opts.body);

  if (!stage || !maskEl || !sheet) {
    console.warn("[TransitionForPages] Missing required elements inside", root);
    return null;
  }

  const mask = maskEl;
  const sheetEl = sheet;

  let strips: Strip[] = [];
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const { mask: maskConfig, peekVh } = opts;

  function buildMaskStrips() {
    const n = stripCount(opts);
    const w = mask.clientWidth;
    if (!w) return;

    const colW = w / n;
    const slatW = colW * maskConfig.gapRatio;
    mask.innerHTML = "";
    strips = [];

    for (let i = 0; i < n; i++) {
      const col = document.createElement("div");
      col.className = "pt-mask__col";
      col.style.left = `${i * colW}px`;
      col.style.width = `${colW}px`;

      const strip = document.createElement("div");
      strip.className = "pt-mask__strip";
      col.appendChild(strip);
      mask.appendChild(col);
      strips.push({ el: strip, colW, slatW });
    }
  }

  function getDomeRadii() {
    const styles = getComputedStyle(root);
    return {
      start: parseFloat(styles.getPropertyValue("--pt-dome-r-start")) || 1250,
      end: parseFloat(styles.getPropertyValue("--pt-dome-r-end")) || 400,
    };
  }

  function applyMaskReveal(p: number) {
    const maskT = mapRange(p, maskConfig.start, maskConfig.end, 0, 1);
    const n = strips.length;

    if (maskT <= 0 || n === 0) {
      mask.classList.remove("is-active");
      gsap.set(mask, { opacity: 0 });
      strips.forEach(({ el, colW }) =>
        gsap.set(el, { rotationY: -90, opacity: 0, width: colW }),
      );
      return;
    }

    mask.classList.add("is-active");
    gsap.set(mask, { opacity: 1 });

    strips.forEach(({ el, colW, slatW }, i) => {
      const rotStart = (i / n) * maskConfig.rotSpread;
      const rotEnd = rotStart + maskConfig.rotWindow;
      const open = mapRange(maskT, rotStart, rotEnd, 0, 1);

      const sealStart = maskConfig.gapSealStart + (i / n) * maskConfig.gapSealStagger;
      const sealEnd = sealStart + maskConfig.gapSealWindow;
      const seal = open >= 0.98 ? mapRange(maskT, sealStart, sealEnd, 0, 1) : 0;

      const fullW = colW + 1;
      let width: number;
      if (open <= 0.03) {
        width = fullW;
      } else if (seal > 0) {
        width = slatW + (fullW - slatW) * seal;
      } else {
        width = slatW;
      }

      gsap.set(el, {
        rotationY: -90 + open * 90,
        opacity: open > 0.03 ? 1 : 0,
        width,
      });
    });
  }

  function applyProgress(p: number) {
    const vh = window.innerHeight;
    const sheetH = sheetEl.offsetHeight;
    const peek = vh * peekVh;
    const startY = sheetH - peek;
    const { start: rStart, end: rEnd } = getDomeRadii();

    const riseT = mapRange(p, 0, 0.7, 0, 1);
    let y = startY * (1 - riseT);

    const driftT = mapRange(p, 0.7, 1, 0, 1);
    const extra = Math.max(0, sheetH - vh * 0.92);
    y -= driftT * extra;

    gsap.set(sheetEl, {
      y,
      borderTopLeftRadius: rStart + (rEnd - rStart) * riseT,
      borderTopRightRadius: rStart + (rEnd - rStart) * riseT,
    });

    applyMaskReveal(p);

    if (heroCopy) {
      gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
    }

    const labelTargets = [label, ornaments].filter(Boolean) as HTMLElement[];
    if (labelTargets.length) {
      gsap.set(labelTargets, { opacity: mapRange(riseT, 0.3, 0.55, 0, 1) });
    }

    if (archInner) {
      const archT = mapRange(p, 0.42, 0.72, 0, 1);
      gsap.set(archInner, { clipPath: `inset(${100 - archT * 100}% 0 0 0)` });
      if (archImg) {
        gsap.set(archImg, { scale: 1.35 - archT * 0.35 });
      }
    }

    if (body) {
      gsap.set(body, {
        opacity: mapRange(p, 0.62, 0.88, 0, 1),
        y: mapRange(p, 0.62, 0.88, 24, 0),
      });
    }

    if (nav) {
      nav.classList.toggle("is-scrolled", riseT > 0.32);
    }
  }

  function initScroll() {
    ScrollTrigger.getById(opts.scrollTriggerId)?.kill();
    buildMaskStrips();
    applyProgress(0);

    ScrollTrigger.create({
      id: opts.scrollTriggerId,
      trigger: pin,
      start: "top top",
      end: "bottom bottom",
      scrub: 0,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyProgress(self.progress),
    });
  }

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    applyTheme(root, opts);
    initScroll();
    ScrollTrigger.refresh();
  }

  function teardown() {
    ScrollTrigger.getById(opts.scrollTriggerId)?.kill();
    if (resizeTimer) clearTimeout(resizeTimer);
  }

  function refresh() {
    initScroll();
    ScrollTrigger.refresh();
  }

  function onResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refresh, 150);
  }

  window.addEventListener("resize", onResize);

  return {
    init,
    destroy() {
      window.removeEventListener("resize", onResize);
      teardown();
    },
    refresh,
    root,
  };
}

function mergeOptions(options: TransitionOptions = {}) {
  return {
    ...DEFAULTS,
    ...options,
    colors: { ...DEFAULTS.colors, ...options.colors },
    nav: options.nav ?? DEFAULTS.nav,
  };
}

export function initTransitionForPages(options: TransitionOptions = {}) {
  if (typeof window === "undefined") return null;

  injectStyles();
  gsap.registerPlugin(ScrollTrigger);

  const opts = mergeOptions(options);
  const roots: HTMLElement[] = options.root
    ? [options.root]
    : Array.from(document.querySelectorAll<HTMLElement>(opts.rootSelector));

  if (!roots.length) {
    console.warn("[TransitionForPages] No transition root found");
    return null;
  }

  activeInstance?.destroy();

  const controllers = roots
    .map((root) => createController(root, opts))
    .filter((ctrl): ctrl is Controller => Boolean(ctrl));

  controllers.forEach((ctrl) => ctrl.init());

  activeInstance = {
    destroy() {
      controllers.forEach((ctrl) => ctrl.destroy());
      activeInstance = null;
    },
    refresh() {
      controllers.forEach((ctrl) => ctrl.refresh());
    },
  };

  return activeInstance;
}

export function destroyTransitionForPages() {
  activeInstance?.destroy();
}

export function refreshTransitionForPages() {
  activeInstance?.refresh();
}
