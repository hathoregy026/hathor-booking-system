/**
 * Precise ScrollTrigger inventory + route accumulation + nav matrix.
 * Does NOT use broad substring double-counting.
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.env.RUNTIME_AUDIT_BASE_URL || "http://127.0.0.1:3010";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { name: "tablet-1024x1366", width: 1024, height: 1366, touch: true },
  { name: "tablet-834x1194", width: 834, height: 1194, touch: true },
  { name: "tablet-768x1024", width: 768, height: 1024, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-390x844", width: 390, height: 844, touch: true },
];

const INVENTORY_SCRIPT = () => {
  const st = window.ScrollTrigger;
  const all = st?.getAll?.() ?? [];
  const classify = (id) => {
    const s = String(id || "");
    if (s === "hero-stage") return "hero-primary";
    if (s.startsWith("cruises-hero-")) return "hero-primary-cruises";
    if (s.includes("hero")) return "hero-related";
    if (s === "ex-stack-scroll") return "fog-primary";
    if (s === "ex-stack-copy" || s === "ex-stack-text") return "fog-supplementary";
    if (s.includes("stack") || s.includes("fog")) return "fog-related";
    if (s.startsWith("page-scroll-transition-")) return "page-transition";
    return "other";
  };

  const describe = (t) => {
    const el = t.trigger;
    const vars = t.vars || {};
    const id = String(vars.id || "");
    let selector = null;
    let dataAttrs = {};
    if (el && el.nodeType === 1) {
      selector =
        el.id
          ? `#${el.id}`
          : el.className && typeof el.className === "string"
            ? `.${String(el.className).trim().split(/\s+/).slice(0, 3).join(".")}`
            : el.tagName?.toLowerCase();
      for (const a of el.attributes || []) {
        if (a.name.startsWith("data-")) dataAttrs[a.name] = a.value;
      }
    }
    return {
      id: id || "(no-id)",
      class: classify(id),
      start: t.start,
      end: t.end,
      scrub: vars.scrub ?? null,
      pin: Boolean(vars.pin),
      pinSpacer: Boolean(
        el?.parentElement?.classList?.contains("pin-spacer") ||
          document.querySelector(`.pin-spacer [data-st-id="${id}"]`),
      ),
      triggerSelector: selector,
      dataAttrs,
      animation: Boolean(vars.animation || t.animation),
    };
  };

  const inventory = all.map(describe);
  const heroPrimary = inventory.filter((x) =>
    x.class.startsWith("hero-primary"),
  );
  const fogPrimary = inventory.filter((x) => x.class === "fog-primary");
  const fogSupp = inventory.filter((x) => x.class === "fog-supplementary");
  const pinSpacers = document.querySelectorAll(".pin-spacer").length;
  const menuTimelines =
    typeof window.__hathorMenuTimelineCount === "number"
      ? window.__hathorMenuTimelineCount
      : null;
  const exploreInstances =
    typeof window.__hathorExploreAnimCount === "number"
      ? window.__hathorExploreAnimCount
      : null;

  return {
    total: all.length,
    ids: inventory.map((x) => x.id),
    inventory,
    counts: {
      heroPrimary: heroPrimary.length,
      fogPrimary: fogPrimary.length,
      fogSupplementary: fogSupp.length,
      heroRelated: inventory.filter((x) => x.class === "hero-related").length,
      fogRelated: inventory.filter((x) => x.class === "fog-related").length,
    },
    pinSpacers,
    lenisCount:
      typeof window.__hathorLenisCount === "number"
        ? window.__hathorLenisCount
        : window.__hathorLenis
          ? 1
          : 0,
    scrollMode:
      window.__hathorScrollMode ||
      (window.__hathorLenis ? "lenis" : "native"),
    menuTimelines,
    exploreInstances,
    bodyOverflow: getComputedStyle(document.body).overflow,
    scrollY: window.scrollY || window.pageYOffset || 0,
  };
};

async function settle(page) {
  await wait(1400);
  await page.waitForFunction(
    () => Boolean(window.ScrollTrigger),
    { timeout: 30000 },
  ).catch(() => {});
  await wait(400);
}

async function snap(page, label) {
  const data = await page.evaluate(INVENTORY_SCRIPT);
  return { label, ...data };
}

async function testExploreMatrix(page) {
  const out = {
    openClose: false,
    rapidToggles: false,
    escapeDuringOpen: false,
    backdropClose: false,
    navigateWhileOpen: false,
    animationInstances: 0,
    errors: [],
  };
  const consoleErrs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrs.push(msg.text().slice(0, 200));
  });

  const menuBtn = () => page.locator("button.hathor-header__menu-btn").first();

  try {
    if (!(await menuBtn().count())) {
      out.skipped = "no menu button";
      return out;
    }

    out.scrollBefore = await page.evaluate(() => window.scrollY);
    out.overflowBefore = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );

    await menuBtn().click({ timeout: 5000 });
    await wait(500);
    out.openClose = true;
    out.overflowDuring = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    out.overlayCount = await page.locator(".hathor-explore").count();
    /* ExplorePanel is CSS mount/unmount — no GSAP timeline. */
    out.animationInstances = 0;

    await page.keyboard.press("Escape");
    await wait(700);
    out.overflowAfter = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    out.scrollAfterClose = await page.evaluate(() => window.scrollY);

    for (let i = 0; i < 5; i += 1) {
      await menuBtn().click({ timeout: 5000 });
      await wait(120);
      await page.keyboard.press("Escape");
      await wait(450);
    }
    out.rapidToggles = true;
    out.overlayAfterRapid = await page.locator(".hathor-explore").count();

    await menuBtn().click({ timeout: 5000 });
    await wait(80);
    await page.keyboard.press("Escape");
    await wait(600);
    out.escapeDuringOpen = true;

    await menuBtn().click({ timeout: 5000 });
    await wait(400);
    const backdrop = page.locator(".hathor-explore__backdrop").first();
    if (await backdrop.count()) {
      await backdrop.click({ force: true, timeout: 3000 });
      out.backdropClose = true;
    } else {
      await page.keyboard.press("Escape");
      out.backdropClose = "no-backdrop-escaped";
    }
    await wait(500);
    out.overflowFinal = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );

    await menuBtn().click({ timeout: 5000 });
    await wait(300);
    /* Navigate while open — do not re-click the covered menu button. */
    await page.goto(`${BASE}/cruises`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await settle(page);
    out.navigateWhileOpen = true;
    out.afterNavigate = await snap(page, "after-nav-while-open");
    out.overflowAfterNav = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );  } catch (e) {
    out.errors.push(String(e).slice(0, 300));
  }
  out.consoleErrors = consoleErrs.slice(0, 8);
  return out;
}

async function testPhoneMenuMatrix(page) {
  const out = {
    openClose: false,
    rapidToggles: false,
    escapeDuringOpen: false,
    errors: [],
  };
  const menuBtn = () => page.locator("button.hathor-header__menu-btn").first();
  try {
    if (!(await menuBtn().count())) {
      out.skipped = "no phone menu";
      return out;
    }

    out.scrollBefore = await page.evaluate(() => window.scrollY);
    await menuBtn().click({ timeout: 5000 });
    await wait(1100);
    out.openClose = true;
    out.overflowDuring = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    out.menuTimelineDuring = await page.evaluate(
      () => window.__hathorMenuTimelineCount ?? null,
    );

    await page.keyboard.press("Escape");
    await wait(1000);
    out.overflowAfter = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );

    for (let i = 0; i < 5; i += 1) {
      await menuBtn().click({ timeout: 5000 });
      await wait(150);
      await page.keyboard.press("Escape");
      await wait(700);
    }
    out.menuTimelineAfterRapid = await page.evaluate(
      () => window.__hathorMenuTimelineCount ?? null,
    );
    out.rapidToggles = true;

    await menuBtn().click({ timeout: 5000 });
    await wait(120);
    await page.keyboard.press("Escape");
    await wait(1000);
    out.escapeDuringOpen = true;
    out.menuTimelineFinal = await page.evaluate(
      () => window.__hathorMenuTimelineCount ?? null,
    );
  } catch (e) {
    out.errors.push(String(e).slice(0, 300));
  }
  return out;
}

async function routeAccumulation(page) {
  const steps = [];
  const go = async (path, label) => {
    await page.goto(`${BASE}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    await settle(page);
    steps.push(await snap(page, label));
  };

  await go("/", "load-/");
  await go("/cruises", "nav-/cruises");
  await go("/rooms", "nav-/rooms");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await settle(page);
  steps.push(await snap(page, "back-to-/cruises"));
  await page.goBack({ waitUntil: "domcontentloaded" });
  await settle(page);
  steps.push(await snap(page, "back-to-/"));
  await page.goForward({ waitUntil: "domcontentloaded" });
  await settle(page);
  steps.push(await snap(page, "forward-/cruises"));
  await go("/", "return-/");
  return steps;
}

const report = {
  base: BASE,
  at: new Date().toISOString(),
  counterBugNote:
    "Prior hero=2/fog=2 came from substring byId('hero')+getById('hero-stage') double-count",
  viewports: {},
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
    const entry = { accumulation: [], explore: null, phoneMenu: null };

    entry.accumulation = await routeAccumulation(page);

    if (vp.name.startsWith("tablet")) {
      await page.goto(`${BASE}/`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await settle(page);
      entry.explore = await testExploreMatrix(page);
    }
    if (vp.name.startsWith("phone")) {
      await page.goto(`${BASE}/`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await settle(page);
      entry.phoneMenu = await testPhoneMenuMatrix(page);
    }

    report.viewports[vp.name] = entry;
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(
  "scripts/_tmp-trigger-inventory-report.json",
  JSON.stringify(report, null, 2),
);

const first = report.viewports["desktop-1440x900"]?.accumulation?.[0];
console.log(
  JSON.stringify(
    {
      wrote: "scripts/_tmp-trigger-inventory-report.json",
      desktopHome: first
        ? {
            counts: first.counts,
            ids: first.ids,
            lenis: first.lenisCount,
            pinSpacers: first.pinSpacers,
          }
        : null,
      desktopCruises: report.viewports["desktop-1440x900"]?.accumulation?.find(
        (s) => s.label === "nav-/cruises",
      )?.counts,
      desktopRooms: report.viewports["desktop-1440x900"]?.accumulation?.find(
        (s) => s.label === "nav-/rooms",
      )?.counts,
    },
    null,
    2,
  ),
);
