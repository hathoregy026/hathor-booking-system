/**
 * Real-route motion smoke for /, /cruises, /rooms.
 * Usage: node scripts/runtime-real-routes-motion.mjs
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.env.RUNTIME_AUDIT_BASE_URL || "http://127.0.0.1:3010";

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { name: "tablet-1024x1366", width: 1024, height: 1366, touch: true },
  { name: "tablet-768x1024", width: 768, height: 1024, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-390x844", width: 390, height: 844, touch: true },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function metrics(page) {
  return page.evaluate(() => {
    const st = window.ScrollTrigger;
    const all = st?.getAll?.() ?? [];
    const idOf = (t) => String(t.vars?.id || "");
    /** Exact primary owners — never substring-match (that double-counted hero-stage / ex-stack-scroll). */
    const heroPrimary = all.filter((t) => {
      const id = idOf(t);
      return id === "hero-stage" || id.startsWith("cruises-hero-");
    });
    const fogPrimary = all.filter((t) => idOf(t) === "ex-stack-scroll");
    const fogSupplementary = all.filter((t) => {
      const id = idOf(t);
      return id === "ex-stack-copy" || id === "ex-stack-text";
    });
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
    const consoleErrors = window.__hathorConsoleErrors ?? [];
    return {
      scrollMode: mode,
      lenisCount,
      heroPrimaryCount: heroPrimary.length,
      fogPrimaryCount: fogPrimary.length,
      fogSupplementaryCount: fogSupplementary.length,
      /** @deprecated ambiguous — use heroPrimaryCount */
      heroTriggers: heroPrimary.length,
      /** @deprecated ambiguous — use fogPrimaryCount */
      fogTriggers: fogPrimary.length,
      heroPrimaryIds: heroPrimary.map(idOf),
      fogPrimaryIds: fogPrimary.map(idOf),
      pageTransitionTriggers: all.filter((t) =>
        idOf(t).startsWith("page-scroll-transition-"),
      ).length,
      totalTriggers: all.length,
      refreshRequests: refresh.requests ?? 0,
      refreshActual: refresh.actual ?? 0,
      consoleErrors: consoleErrors.slice(0, 10),
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });
}

async function loadRoute(page, path) {
  const t0 = Date.now();
  const response = await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await wait(1200);
  const m = await metrics(page).catch((e) => ({ error: String(e) }));
  return {
    path,
    status: response?.status() ?? 0,
    loadMs: Date.now() - t0,
    ...m,
  };
}

async function testExplorePanel(page) {
  const results = { open: false, close: false, escape: false, errors: [] };
  try {
    const toggle = page.locator(
      'button[aria-label*="Explore" i], button[aria-label*="Menu" i], .site-nav-explore, [data-explore-toggle]',
    ).first();
    if (!(await toggle.count())) {
      results.skipped = "no explore toggle";
      return results;
    }
    await toggle.click({ timeout: 5000 });
    await wait(800);
    results.open = true;
    await page.keyboard.press("Escape");
    await wait(800);
    results.escape = true;
    results.close = true;
  } catch (error) {
    results.errors.push(String(error));
  }
  return results;
}

async function testPhoneMenu(page) {
  const results = { open: false, close: false, errors: [] };
  try {
    const burger = page.locator(
      'button[aria-label*="menu" i], .staggered-menu-btn, .sm-toggle, [data-menu-toggle]',
    ).first();
    if (!(await burger.count())) {
      results.skipped = "no phone menu toggle";
      return results;
    }
    await burger.click({ timeout: 5000 });
    await wait(1200);
    results.open = true;
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    results.bodyOverflowWhileOpen = overflow;
    await page.keyboard.press("Escape");
    await wait(1000);
    results.close = true;
    results.bodyOverflowAfter = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
  } catch (error) {
    results.errors.push(String(error));
  }
  return results;
}

async function testDesktopFog(page) {
  const out = { ok: false, notes: [] };
  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForFunction(
      () => Boolean(window.ScrollTrigger?.getById?.("ex-stack-scroll")),
      { timeout: 60000 },
    );
    const fog = page.locator("#ex-stack-scroll, .ex-stack-scroll").first();
    await fog.scrollIntoViewIfNeeded();
    await wait(400);
    for (let i = 0; i < 12; i += 1) {
      await page.mouse.wheel(0, 180);
      await wait(120);
    }
    await wait(500);
    for (let i = 0; i < 8; i += 1) {
      await page.mouse.wheel(0, -180);
      await wait(120);
    }
    out.ok = true;
    out.notes.push("slow wheel scrub completed without page crash");
  } catch (error) {
    out.notes.push(String(error));
  }
  return out;
}

const report = {
  base: BASE,
  at: new Date().toISOString(),
  routes: [],
  explorePanel: {},
  phoneMenu: {},
  desktopFog: {},
};

const browser = await chromium.launch({ headless: true });
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.touch,
      isMobile: vp.touch && vp.width <= 480,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__hathorConsoleErrors = [];
      const orig = console.error;
      console.error = (...args) => {
        window.__hathorConsoleErrors.push(args.map(String).join(" ").slice(0, 200));
        orig.apply(console, args);
      };
    });

    const routeResults = [];
    for (const path of ["/", "/cruises", "/rooms"]) {
      routeResults.push(await loadRoute(page, path));
    }
    report.routes.push({ viewport: vp.name, results: routeResults });

    if (vp.name.startsWith("tablet")) {
      report.explorePanel[vp.name] = await testExplorePanel(page);
    }
    if (vp.name.startsWith("phone")) {
      report.phoneMenu[vp.name] = await testPhoneMenu(page);
    }
    if (vp.name === "desktop-1440x900") {
      report.desktopFog = await testDesktopFog(page);
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const outPath = "scripts/_tmp-real-routes-motion-report.json";
await writeFile(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ wrote: outPath, summary: {
  routeCount: report.routes.length,
  desktopFog: report.desktopFog,
  exploreKeys: Object.keys(report.explorePanel),
  phoneKeys: Object.keys(report.phoneMenu),
  sample: report.routes[0]?.results,
}}, null, 2));
