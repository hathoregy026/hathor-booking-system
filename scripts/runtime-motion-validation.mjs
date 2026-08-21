/**
 * Focused runtime validation for motion lab (dev-only).
 * Usage: node scripts/runtime-motion-validation.mjs
 */
import { chromium, devices } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.env.RUNTIME_AUDIT_BASE_URL || "http://127.0.0.1:3010";
const HOME = `${BASE}/dev/motion-lab`;
const SECONDARY = `${BASE}/dev/motion-lab/secondary`;

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { name: "tablet-1024x1366", width: 1024, height: 1366, touch: true },
  { name: "tablet-834x1194", width: 834, height: 1194, touch: true },
  { name: "tablet-768x1024", width: 768, height: 1024, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-390x844", width: 390, height: 844, touch: true },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function stableEvaluate(page, fn, arg) {
  for (let i = 0; i < 6; i += 1) {
    try {
      return arg === undefined ? await page.evaluate(fn) : await page.evaluate(fn, arg);
    } catch (error) {
      const msg = String(error);
      if (!msg.includes("Execution context was destroyed") && !msg.includes("Target closed")) {
        throw error;
      }
      await wait(500);
      await page.waitForLoadState("domcontentloaded").catch(() => {});
    }
  }
  throw new Error("stableEvaluate failed after retries");
}

async function boot(page) {
  await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector(".home-hero-container", { timeout: 60000 });
  await page.waitForFunction(
    () => {
      const st = window.ScrollTrigger;
      if (!st?.getById) return false;
      return Boolean(st.getById("hero-stage") || st.getById("ex-stack-scroll"));
    },
    { timeout: 60000 },
  );
  await wait(800);
}

async function metrics(page) {
  return stableEvaluate(page, () => {
    const st = window.ScrollTrigger;
    const all = st?.getAll?.() ?? [];
    const byId = (needle) =>
      all.filter((t) => String(t.vars?.id || "").includes(needle));
    const mode =
      window.__hathorScrollMode ||
      (window.__hathorLenis ? "lenis" : "native");
    const lenisCount =
      typeof window.__hathorLenisCount === "number"
        ? window.__hathorLenisCount
        : window.__hathorLenis
          ? 1
          : 0;
    const refresh = window.__hathorRefreshDebug ?? { requests: 0, actual: 0 };
    const hero = window.__hathorHeroDebug ?? {
      rebuilds: 0,
      rebuildsDuringActiveScroll: 0,
    };
    const fog = window.__hathorFogDebug ?? {
      rebuilds: 0,
      rebuildsDuringActiveScroll: 0,
    };
    const heroSt = st?.getById?.("hero-stage");
    const fogSt = st?.getById?.("ex-stack-scroll");
    return {
      scrollMode: mode,
      activeLenisInstances: lenisCount,
      heroTriggerCount: byId("hero-stage").length,
      fogTriggerCount: byId("ex-stack-scroll").length,
      pageTransitionTriggerCount: byId("page-scroll-transition").length,
      menuTimelineCount: window.__hathorMenuTimelineCount ?? null,
      refreshRequests: refresh.requests,
      actualRefreshes: refresh.actual,
      heroRebuilds: hero.rebuilds,
      heroRebuildsDuringActiveScroll: hero.rebuildsDuringActiveScroll,
      fogRebuilds: fog.rebuilds,
      fogRebuildsDuringActiveScroll: fog.rebuildsDuringActiveScroll,
      totalTriggers: all.length,
      heroStart: heroSt?.start ?? null,
      heroEnd: heroSt?.end ?? null,
      heroScrollDistance:
        heroSt && Number.isFinite(heroSt.start) && Number.isFinite(heroSt.end)
          ? heroSt.end - heroSt.start
          : null,
      fogStart: fogSt?.start ?? null,
      fogEnd: fogSt?.end ?? null,
      fogScrollDistance:
        fogSt && Number.isFinite(fogSt.start) && Number.isFinite(fogSt.end)
          ? fogSt.end - fogSt.start
          : null,
      maxScroll: Math.max(
        0,
        (document.documentElement.scrollHeight || 0) - window.innerHeight,
      ),
    };
  });
}

async function sampleFogAtProgress(page, unitProgress) {
  return stableEvaluate(page, (p) => {
    const st = window.ScrollTrigger?.getById?.("ex-stack-scroll");
    if (!st) return { error: "no-fog-trigger" };
    const y = st.start + (st.end - st.start) * (p / 7.16);
    window.scrollTo(0, y);
    window.ScrollTrigger?.update?.();
    const cards = [...document.querySelectorAll(".ex-stack-scroll__card")].map(
      (card, i) => {
        const style = getComputedStyle(card);
        return {
          index: i,
          opacity: Number(style.opacity),
          fogEdge: style.getPropertyValue("--stack-fog-edge").trim(),
          transform: style.transform,
        };
      },
    );
    const silk = document.querySelector(".ex-stack-scroll__silk");
    const panels = [...document.querySelectorAll(".ex-stack-scroll__copy-panel")].map(
      (panel, i) => ({
        index: i,
        opacity: Number(getComputedStyle(panel).opacity),
        visibility: getComputedStyle(panel).visibility,
        ariaHidden: panel.getAttribute("aria-hidden"),
      }),
    );
    return {
      unitProgress: p,
      scrollY: window.scrollY,
      triggerProgress: st.progress,
      silkOpacity: silk ? Number(getComputedStyle(silk).opacity) : null,
      cards,
      panels,
    };
  }, unitProgress);
}

async function scrubFogRanges(page) {
  const ranges = [0, 0.22, 0.44, 0.7, 0.96, 1.1, 1.62, 2.96, 4.3, 5.64, 5.94, 6.46, 7.16];
  const samples = [];
  for (const p of ranges) {
    samples.push(await sampleFogAtProgress(page, p));
    await wait(90);
  }
  for (const p of [...ranges].reverse()) {
    samples.push({ ...(await sampleFogAtProgress(page, p)), reverse: true });
    await wait(70);
  }
  return samples;
}

async function measureHeroPhases(page) {
  return stableEvaluate(page, () => {
    const st = window.ScrollTrigger?.getById?.("hero-stage");
    if (!st) return { error: "no-hero-trigger" };
    const runway = document.querySelector(".home-hero-runway");
    const samples = [];
    const points = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95, 1];
    for (const p of points) {
      const y = st.start + (st.end - st.start) * p;
      window.scrollTo(0, y);
      window.ScrollTrigger?.update?.();
      const logo = document.querySelector(
        ".home-hero-logo, .ex-hero-logo, [data-hero-logo], .hathor-logo-mark",
      );
      const cta = document.querySelector(
        ".home-hero-book, .specular-button, [data-book-now], .book-now-trigger",
      );
      const strip = document.querySelector(
        ".home-hero-blind, .venetian-strip, [data-hero-strip], .home-hero-strip",
      );
      samples.push({
        progress: p,
        scrollY: window.scrollY,
        logoOpacity: logo ? getComputedStyle(logo).opacity : null,
        logoTransform: logo ? getComputedStyle(logo).transform : null,
        ctaTransform: cta ? getComputedStyle(cta).transform : null,
        stripTransform: strip ? getComputedStyle(strip).transform : null,
      });
    }
    return {
      start: st.start,
      end: st.end,
      distance: st.end - st.start,
      runwayHeight: runway ? runway.getBoundingClientRect().height : null,
      runwayExists: Boolean(runway),
      pin: Boolean(st.pin),
      endString: String(st.vars?.end ?? ""),
      samples,
    };
  });
}

async function menuMatrix(page) {
  const btn = page.locator(".hathor-header__menu-btn").first();
  if ((await btn.count()) === 0) {
    // Menu button may only show on mobile header; try explore
    const explore = page.locator("button[aria-label='Open menu'], .hathor-header__menu-btn, button:has-text('Menu')").first();
    if ((await explore.count()) === 0) return { tested: false, reason: "no-menu-btn" };
  }

  const readState = () =>
    stableEvaluate(page, () => {
      const root = document.querySelector(".staggered-menu-wrapper");
      const layers = [...document.querySelectorAll(".sm-prelayer")].map((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          bg: s.backgroundColor,
          transform: s.transform,
          opacity: s.opacity,
          width: r.width,
          left: r.left,
        };
      });
      return {
        menuTimelineCount: window.__hathorMenuTimelineCount ?? null,
        isOpen: root?.classList.contains("is-open") ?? false,
        bodyOverflow:
          document.body.style.overflow || getComputedStyle(document.body).overflow,
        scrollY: window.scrollY,
        layers,
        lenisPresent: Boolean(window.__hathorLenis),
        scrollMode: window.__hathorScrollMode ?? null,
      };
    });

  const clickMenu = async () => {
    const b = page.locator(".hathor-header__menu-btn").first();
    await b.click({ force: true });
  };

  const results = {};

  await clickMenu();
  await wait(450);
  results.afterOpen = await readState();
  await page.keyboard.press("Escape");
  await wait(950);
  results.afterClose = await readState();

  await clickMenu();
  await wait(100);
  await page.keyboard.press("Escape");
  await wait(70);
  await clickMenu();
  await wait(550);
  results.openDuringClose = await readState();
  await page.keyboard.press("Escape");
  await wait(950);

  await clickMenu();
  await wait(70);
  await page.keyboard.press("Escape");
  await wait(950);
  results.closeDuringOpen = await readState();

  for (let i = 0; i < 5; i += 1) {
    await clickMenu();
    await wait(35);
  }
  await wait(1100);
  results.afterRapidToggle = await readState();
  if (results.afterRapidToggle.isOpen) {
    await page.keyboard.press("Escape");
    await wait(950);
  }

  await clickMenu();
  await wait(40);
  await page.keyboard.press("Escape");
  await wait(950);
  results.escapeDuringOpen = await readState();

  await clickMenu();
  await wait(1100);
  results.fullyOpen = await readState();
  await page.keyboard.press("Escape");
  await wait(950);
  results.escapeFullyOpen = await readState();

  await clickMenu();
  await wait(650);
  const backdrop = page.locator(".sm-backdrop").first();
  if ((await backdrop.count()) > 0) {
    await backdrop.click({ force: true });
    await wait(950);
  }
  results.backdropClose = await readState();

  await clickMenu();
  await wait(500);
  const savedScroll = await stableEvaluate(page, () => window.scrollY);
  await page.goto(SECONDARY, { waitUntil: "domcontentloaded", timeout: 30000 });
  await wait(500);
  results.navWhileOpen = {
    path: page.url(),
    ...(await readState()),
    savedScrollBeforeNav: savedScroll,
  };

  await page.goBack({ waitUntil: "domcontentloaded" });
  await wait(1000);
  results.browserBack = {
    path: page.url(),
    ...(await readState()),
    restoredScroll: await stableEvaluate(page, () => window.scrollY),
  };

  await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await boot(page);
  await clickMenu();
  await wait(160);
  results.midOpenLayers = await stableEvaluate(page, () =>
    [...document.querySelectorAll(".sm-prelayer")].map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        width: r.width,
        left: r.left,
        visible: r.width > 8 && Number(s.opacity) > 0.05,
        transform: s.transform,
      };
    }),
  );
  await page.keyboard.press("Escape");
  await wait(800);

  return { tested: true, results };
}

async function inputBehaviors(page, touch) {
  const before = await stableEvaluate(page, () => window.scrollY);
  await page.mouse.wheel(0, 80);
  await wait(120);
  const afterSlowWheel = await stableEvaluate(page, () => window.scrollY);
  await page.mouse.wheel(0, 1400);
  await wait(160);
  const afterFastWheel = await stableEvaluate(page, () => window.scrollY);
  await page.mouse.wheel(0, -1400);
  await wait(160);
  const afterReverse = await stableEvaluate(page, () => window.scrollY);

  await stableEvaluate(page, () => {
    const st = window.ScrollTrigger?.getById?.("hero-stage");
    if (!st) return;
    window.scrollTo(0, st.start + (st.end - st.start) * 0.5);
    window.ScrollTrigger?.update?.();
  });
  await wait(200);
  const midHero = await stableEvaluate(page, () => ({
    y: window.scrollY,
    p: window.ScrollTrigger?.getById?.("hero-stage")?.progress ?? null,
  }));

  let touchDrag = null;
  if (touch) {
    const vp = page.viewportSize();
    const x = Math.floor((vp?.width ?? 390) / 2);
    const y1 = Math.floor((vp?.height ?? 844) * 0.72);
    const y2 = Math.floor((vp?.height ?? 844) * 0.28);
    const yBefore = await stableEvaluate(page, () => window.scrollY);
    await page.mouse.move(x, y1);
    await page.mouse.down();
    await page.mouse.move(x, y2, { steps: 24 });
    await page.mouse.up();
    await wait(220);
    const yAfter = await stableEvaluate(page, () => window.scrollY);
    touchDrag = { yBefore, yAfter, delta: yAfter - yBefore };
  }

  return { before, afterSlowWheel, afterFastWheel, afterReverse, midHero, touchDrag };
}

async function cssOwnershipProbe(page) {
  return stableEvaluate(page, () => {
    const targets = [
      [".home-hero-blind, .venetian-strip, [data-hero-strip], .home-hero-strip", "hero-strips"],
      [".home-hero-logo, [data-hero-logo], .hathor-logo-mark", "hero-logo"],
      [".home-hero-book, [data-book-now], .specular-button, .book-now-trigger", "hero-cta"],
      [".ex-stack-scroll__card", "fog-cards"],
      [".ex-stack-scroll__copy-panel", "fog-copy"],
      [".sm-prelayer", "menu-layers"],
      [".sm-panel, .staggered-menu-panel", "menu-panel"],
      [".sm-row, .staggered-menu-item", "menu-rows"],
      ["[data-page-transition] .pt-strip, .pt-strip", "page-transition-strips"],
    ];
    return targets.map(([sel, label]) => {
      const el = document.querySelector(sel);
      if (!el) return { label, found: false };
      const tr = getComputedStyle(el).transitionProperty;
      return {
        label,
        found: true,
        transitionProperty: tr,
        hasAll: tr === "all" || tr.split(",").map((s) => s.trim()).includes("all"),
      };
    });
  });
}

async function staleAfterNav(page) {
  await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await boot(page);
  const before = await metrics(page);
  await page.goto(SECONDARY, { waitUntil: "domcontentloaded", timeout: 30000 });
  await wait(600);
  const mid = await stableEvaluate(page, () => {
    const all = window.ScrollTrigger?.getAll?.() ?? [];
    return {
      hero: all.filter((t) => String(t.vars?.id || "").includes("hero-stage")).length,
      fog: all.filter((t) => String(t.vars?.id || "").includes("ex-stack-scroll")).length,
      total: all.length,
    };
  });
  await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await boot(page);
  const after = await metrics(page);
  return {
    beforeHero: before.heroTriggerCount,
    beforeFog: before.fogTriggerCount,
    midOnSecondary: mid,
    afterHero: after.heroTriggerCount,
    afterFog: after.fogTriggerCount,
    staleHero: after.heroTriggerCount > 1,
    staleFog: after.fogTriggerCount > 1,
  };
}

async function runViewport(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.touch,
    isMobile: vp.touch && vp.width <= 480,
    ...(vp.touch && vp.width <= 480
      ? { ...devices["iPhone 13"], viewport: { width: vp.width, height: vp.height } }
      : {}),
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  const out = { viewport: vp.name, width: vp.width, height: vp.height };
  try {
    await boot(page);
    out.metrics = await metrics(page);
    out.cssOwnership = await cssOwnershipProbe(page);

    if (vp.name === "desktop-1440x900" || vp.name === "phone-390x844") {
      out.fogSamples = await scrubFogRanges(page);
    }
    if (vp.name.startsWith("tablet-") || vp.name === "desktop-1440x900") {
      out.heroPhases = await measureHeroPhases(page);
    }
    if (vp.name === "phone-430x932" || vp.name === "tablet-768x1024") {
      out.menu = await menuMatrix(page);
    }
    out.inputs = await inputBehaviors(page, vp.touch);
    if (vp.name === "desktop-1440x900") {
      out.routeNav = await staleAfterNav(page);
    }
  } catch (error) {
    out.error = String(error);
  } finally {
    out.consoleErrors = consoleErrors.slice(0, 12);
    await context.close();
  }
  return out;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = {
    base: HOME,
    startedAt: new Date().toISOString(),
    viewports: [],
  };
  try {
    // Warm compile once
    const warm = await browser.newPage();
    await warm.goto(HOME, { waitUntil: "domcontentloaded", timeout: 90000 });
    await wait(2000);
    await warm.close();

    for (const vp of VIEWPORTS) {
      console.log("testing", vp.name);
      const result = await runViewport(browser, vp);
      report.viewports.push(result);
      console.log("  metrics", JSON.stringify(result.metrics || result.error || {}));
    }
  } finally {
    await browser.close();
  }
  report.finishedAt = new Date().toISOString();
  const path = "scripts/_tmp-motion-validation-report.json";
  await writeFile(path, JSON.stringify(report, null, 2));
  console.log("wrote", path);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
