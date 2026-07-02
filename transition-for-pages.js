/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  @AGENT_ORDERS — MANDATORY WORKFLOW FOR CURSOR AGENT
 *  When the user says: "apply this transition", "do the transition",
 *  "add transition for pages", "hero scroll transition", or similar:
 *  READ AND EXECUTE EVERY STEP BELOW EXACTLY. DO NOT IMPROVISE.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * STEP 0 — SOURCE OF TRUTH
 *   Canonical file: transition-for-pages.js (this file).
 *   If target project lacks it → COPY this file into js/transition-for-pages.js
 *   DO NOT rewrite transition logic inline. DO NOT use CSS scroll-timeline.
 *   DO NOT use a separate hero-transition.js unless user explicitly rejects this file.
 *
 * STEP 1 — COPY FILE
 *   Copy transition-for-pages.js → {targetProject}/js/transition-for-pages.js
 *
 * STEP 2 — SCRIPT TAGS (exact order, before </body>)
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
 *   <script src="https://unpkg.com/lenis@1.3.21/dist/lenis.min.js"></script>
 *   <script src="js/transition-for-pages.js"></script>
 *   <script>TransitionForPages.init();</script>
 *
 * STEP 3 — HTML SKELETON (replace first hero + next section OR wrap existing content)
 *   REQUIRED structure — every class name must match exactly:
 *
 *   <section data-page-transition>
 *     <div class="pt-stage">
 *       <div class="pt-hero">
 *         <div class="pt-hero__media">
 *           <!-- user's video or img here -->
 *         </div>
 *         <div class="pt-mask" aria-hidden="true"></div>
 *         <div class="pt-hero__copy"><!-- move user's hero headline/CTA here --></div>
 *       </div>
 *       <div class="pt-sheet">
 *         <!-- move user's next-section content here -->
 *         <p data-pt-label>...</p>           <!-- optional -->
 *         <div data-pt-ornaments>...</div>    <!-- optional -->
 *         <div data-pt-arch-inner><img /></div> <!-- optional -->
 *         <div data-pt-body>...</div>         <!-- optional -->
 *       </div>
 *     </div>
 *   </section>
 *
 * STEP 4 — NAV (if site has a header)
 *   Add data-pt-nav to existing <header> or nav element.
 *   Add CSS for [data-pt-nav].is-scrolled { ... } using project's nav styles.
 *
 * STEP 5 — BODY BACKGROUND
 *   Set body { background: #ECE8DF; } OR pass cream in init() — must match .pt-sheet.
 *
 * STEP 6 — INIT OPTIONS (use project brand colors if known)
 *   TransitionForPages.init({
 *     colors: { gold: '#B69F64', cream: '#ECE8DF' },
 *   });
 *
 * STEP 7 — HERO COPY POSITION (project CSS — script does not position copy)
 *   [data-page-transition] .pt-hero__copy {
 *     left: clamp(1.5rem, 6vw, 5rem);
 *     bottom: clamp(18vh, 24vh, 30vh);
 *   }
 *
 * STEP 8 — REMOVE CONFLICTS
 *   Delete old hero-transition.js, hero-pin markup, mask-reveal IDs, CSS scroll-timeline
 *   stripe code, or duplicate ScrollTrigger hero logic that would fight this file.
 *
 * STEP 9 — VERIFY CHECKLIST (agent must confirm each)
 *   [ ] transition-for-pages.js exists in target project
 *   [ ] GSAP + ScrollTrigger load before transition-for-pages.js
 *   [ ] [data-page-transition] present with .pt-stage .pt-hero .pt-mask .pt-sheet
 *   [ ] .pt-mask is EMPTY (strips are built by JS)
 *   [ ] TransitionForPages.init() called once after load
 *   [ ] body background matches cream color
 *   [ ] No duplicate Lenis/ScrollTrigger hero init elsewhere
 *
 * FORBIDDEN
 *   × Reinventing venetian blinds in a new file
 *   × Changing mask gapRatio / seal timing unless user asks
 *   × Skipping .pt-mask element
 *   × Putting content outside .pt-sheet for the rising section
 *   × Using position:fixed hero + CSS animation-timeline instead of this file
 *
 * REFERENCE IMPLEMENTATION: example-site/ in HATHOR/TRANSITIONS (may use legacy IDs —
 *   when applying to new projects always use pt-* classes from STEP 3)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  TRANSITION FOR PAGES — user documentation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DEPENDENCIES (load before this file):
 *   - GSAP 3.x + ScrollTrigger
 *   - Lenis (optional, recommended for smooth scroll)
 *
 * QUICK START
 * ───────────
 * 1. Add the HTML block below anywhere in your page (first major section).
 * 2. Include GSAP, ScrollTrigger, Lenis, then this script.
 * 3. Call: TransitionForPages.init();
 *
 * MINIMAL HTML
 * ────────────
 * <section data-page-transition>
 *   <div class="pt-stage">
 *     <div class="pt-hero">
 *       <div class="pt-hero__media">
 *         <video autoplay muted loop playsinline src="hero.mp4"></video>
 *       </div>
 *       <div class="pt-mask" aria-hidden="true"></div>
 *       <div class="pt-hero__copy"><!-- optional hero text --></div>
 *     </div>
 *     <div class="pt-sheet">
 *       <!-- your next section content -->
 *     </div>
 *   </div>
 * </section>
 *
 * OPTIONAL DATA HOOKS (inside .pt-sheet)
 *   data-pt-label      label above arch
 *   data-pt-ornaments  decorative row
 *   data-pt-arch-inner clip-reveal wrapper (put <img> inside)
 *   data-pt-body       body block that fades up
 *
 * OPTIONAL NAV
 *   Add data-pt-nav to your header — toggles .is-scrolled on cream overlap
 *
 * CUSTOMIZE
 * ─────────
 * TransitionForPages.init({
 *   colors: { gold: '#B69F64', cream: '#ECE8DF' },
 *   pinHeight: '280vh',
 *   domeRadius: { start: '1250px', end: '400px' },
 *   mask: { gapRatio: 0.94 },
 *   lenis: true,
 * });
 */
(function (global) {
  'use strict';

  const STYLE_ID = 'transition-for-pages-styles';
  let activeInstance = null;

  const DEFAULTS = {
    root: '[data-page-transition]',
    stage: '.pt-stage',
    mask: '.pt-mask',
    sheet: '.pt-sheet',
    heroCopy: '.pt-hero__copy',
    archInner: '[data-pt-arch-inner]',
    label: '[data-pt-label]',
    ornaments: '[data-pt-ornaments]',
    body: '[data-pt-body]',
    nav: '[data-pt-nav]',
    colors: {
      gold: '#B69F64',
      cream: '#ECE8DF',
    },
    pinHeight: '280vh',
    domeRadius: {
      start: '1250px',
      end: '400px',
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
    lenis: true,
    lenisOptions: {
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    },
    scrollTriggerId: 'transition-for-pages-scroll',
  };

  const CSS = `
[data-page-transition] {
  --pt-gold: #B69F64;
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
  object-position: center 70%;
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

[data-pt-nav].is-scrolled { }

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

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function mapRange(p, inMin, inMax, outMin, outMax) {
    const t = clamp((p - inMin) / (inMax - inMin), 0, 1);
    return outMin + t * (outMax - outMin);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function applyTheme(root, opts) {
    root.style.setProperty('--pt-gold', opts.colors.gold);
    root.style.setProperty('--pt-cream', opts.colors.cream);
    root.style.setProperty('--pt-pin-height', opts.pinHeight);
    root.style.setProperty('--pt-dome-r-start', opts.domeRadius.start);
    root.style.setProperty('--pt-dome-r-end', opts.domeRadius.end);
  }

  function stripCount(opts) {
    const w = window.innerWidth;
    if (w <= 767) return opts.strips.mobile;
    if (w <= 1024) return opts.strips.tablet;
    return opts.strips.desktop;
  }

  function setupLenis(opts) {
    if (!opts.lenis || typeof Lenis === 'undefined') return null;

    const lenis = new Lenis(opts.lenisOptions);
    lenis.on('scroll', ScrollTrigger.update);
    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis._ptTicker = ticker;
    return lenis;
  }

  function createController(root, opts) {
    const pin = root;
    const stage = root.querySelector(opts.stage);
    const maskEl = root.querySelector(opts.mask);
    const sheet = root.querySelector(opts.sheet);
    const heroCopy = root.querySelector(opts.heroCopy);
    const nav = document.querySelector(opts.nav);
    const label = root.querySelector(opts.label);
    const ornaments = root.querySelector(opts.ornaments);
    const archInner = root.querySelector(opts.archInner);
    const archImg = archInner?.querySelector('img');
    const body = root.querySelector(opts.body);

    if (!pin || !stage || !maskEl || !sheet) {
      console.warn('[TransitionForPages] Missing required elements inside', opts.root);
      return null;
    }

    let strips = [];
    let resizeTimer = null;
    let lenis = null;

    const { mask: m, peekVh } = opts;

    function buildMaskStrips() {
      const n = stripCount(opts);
      const w = maskEl.clientWidth;
      const colW = w / n;
      const slatW = colW * m.gapRatio;
      maskEl.innerHTML = '';
      strips = [];

      for (let i = 0; i < n; i++) {
        const col = document.createElement('div');
        col.className = 'pt-mask__col';
        col.style.left = `${i * colW}px`;
        col.style.width = `${colW}px`;

        const strip = document.createElement('div');
        strip.className = 'pt-mask__strip';
        col.appendChild(strip);
        maskEl.appendChild(col);
        strips.push({ el: strip, colW, slatW });
      }
    }

    function getDomeRadii() {
      const styles = getComputedStyle(root);
      return {
        start: parseFloat(styles.getPropertyValue('--pt-dome-r-start')) || 1250,
        end: parseFloat(styles.getPropertyValue('--pt-dome-r-end')) || 400,
      };
    }

    function applyMaskReveal(p) {
      const maskT = mapRange(p, m.start, m.end, 0, 1);
      const n = strips.length;

      if (maskT <= 0 || n === 0) {
        maskEl.classList.remove('is-active');
        gsap.set(maskEl, { opacity: 0 });
        strips.forEach(({ el, colW }) => gsap.set(el, { rotationY: -90, opacity: 0, width: colW }));
        return;
      }

      maskEl.classList.add('is-active');
      gsap.set(maskEl, { opacity: 1 });

      strips.forEach(({ el, colW, slatW }, i) => {
        const rotStart = (i / n) * m.rotSpread;
        const rotEnd = rotStart + m.rotWindow;
        const open = mapRange(maskT, rotStart, rotEnd, 0, 1);

        const sealStart = m.gapSealStart + (i / n) * m.gapSealStagger;
        const sealEnd = sealStart + m.gapSealWindow;
        const seal = open >= 0.98 ? mapRange(maskT, sealStart, sealEnd, 0, 1) : 0;

        const fullW = colW + 1;
        let width;
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

    function applyProgress(p) {
      const vh = window.innerHeight;
      const sheetH = sheet.offsetHeight;
      const peek = vh * peekVh;
      const startY = sheetH - peek;
      const { start: rStart, end: rEnd } = getDomeRadii();

      const riseT = mapRange(p, 0, 0.7, 0, 1);
      let y = startY * (1 - riseT);

      const driftT = mapRange(p, 0.7, 1, 0, 1);
      const extra = Math.max(0, sheetH - vh * 0.92);
      y -= driftT * extra;

      gsap.set(sheet, {
        y,
        borderTopLeftRadius: rStart + (rEnd - rStart) * riseT,
        borderTopRightRadius: rStart + (rEnd - rStart) * riseT,
      });

      applyMaskReveal(p);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }

      const labelTargets = [label, ornaments].filter(Boolean);
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
        nav.classList.toggle('is-scrolled', riseT > 0.32);
      }
    }

    function initScroll() {
      ScrollTrigger.getById(opts.scrollTriggerId)?.kill();
      buildMaskStrips();
      applyProgress(0);

      ScrollTrigger.create({
        id: opts.scrollTriggerId,
        trigger: pin,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }

    function init() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('[TransitionForPages] GSAP and ScrollTrigger are required.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      applyTheme(root, opts);
      lenis = setupLenis(opts);
      initScroll();
      ScrollTrigger.refresh();
    }

    function teardown() {
      ScrollTrigger.getById(opts.scrollTriggerId)?.kill();
      if (lenis) {
        if (lenis._ptTicker) gsap.ticker.remove(lenis._ptTicker);
        if (typeof lenis.destroy === 'function') lenis.destroy();
        lenis = null;
      }
      clearTimeout(resizeTimer);
    }

    function refresh() {
      initScroll();
      ScrollTrigger.refresh();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refresh, 150);
    }

    window.addEventListener('resize', onResize);

    return {
      init,
      destroy() {
        window.removeEventListener('resize', onResize);
        teardown();
      },
      refresh,
      root,
    };
  }

  function mergeOptions(options) {
    const opts = {
      ...DEFAULTS,
      ...options,
      colors: { ...DEFAULTS.colors, ...options?.colors },
      domeRadius: { ...DEFAULTS.domeRadius, ...options?.domeRadius },
      mask: { ...DEFAULTS.mask, ...options?.mask },
      strips: { ...DEFAULTS.strips, ...options?.strips },
      lenisOptions: { ...DEFAULTS.lenisOptions, ...options?.lenisOptions },
    };
    return opts;
  }

  const TransitionForPages = {
    /**
     * Initialize the hero scroll transition on all matching roots.
     * @param {object} [options]
     * @returns {object|null} controller with destroy() and refresh()
     */
    init(options = {}) {
      injectStyles();

      const opts = mergeOptions(options);
      const roots = document.querySelectorAll(opts.root);

      if (!roots.length) {
        console.warn('[TransitionForPages] No element found for:', opts.root);
        return null;
      }

      if (activeInstance) {
        activeInstance.destroy();
      }

      const controllers = Array.from(roots).map((root) => {
        const ctrl = createController(root, opts);
        ctrl?.init();
        return ctrl;
      }).filter(Boolean);

      activeInstance = {
        controllers,
        destroy() {
          controllers.forEach((c) => c.destroy());
          activeInstance = null;
        },
        refresh() {
          controllers.forEach((c) => c.refresh());
        },
      };

      return activeInstance;
    },

    destroy() {
      activeInstance?.destroy();
    },

    refresh() {
      activeInstance?.refresh();
    },

    defaults: DEFAULTS,
  };

  global.TransitionForPages = TransitionForPages;

  if (document.currentScript?.hasAttribute('data-auto-init')) {
    const run = () => TransitionForPages.init();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  }
})(typeof window !== 'undefined' ? window : this);
