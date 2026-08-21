import { chromium, devices } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE_URL = process.env.RUNTIME_AUDIT_BASE_URL || "http://127.0.0.1:3010";
const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900, touch: false },
  { name: "tablet-1024x1366", width: 1024, height: 1366, touch: true },
  { name: "tablet-768x1024", width: 768, height: 1024, touch: true },
  { name: "phone-430x932", width: 430, height: 932, touch: true },
  { name: "phone-390x844", width: 390, height: 844, touch: true },
];
const QUICK_MODE = process.env.QUICK_RUNTIME_AUDIT === "1";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRuntimeCounts(page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await page.evaluate(() => {
        const st = window.ScrollTrigger;
        const all = st?.getAll?.() ?? [];
        const byId = (needle) =>
          all.filter((trigger) => String(trigger.vars?.id || "").includes(needle));
        const menuTimeline =
          window.__hathorMenuTimelineCount ??
          document.querySelectorAll(".staggered-menu-wrapper").length;
        const refreshDebug = window.__hathorRefreshDebug ?? {
          requests: 0,
          actual: 0,
        };
        const heroDebug = window.__hathorHeroDebug ?? {
          rebuilds: 0,
          rebuildsDuringActiveScroll: 0,
        };
        const fogDebug = window.__hathorFogDebug ?? {
          rebuilds: 0,
          rebuildsDuringActiveScroll: 0,
        };

        return {
          lenisMode: window.__hathorLenis ? "lenis" : "native",
          activeTriggers: all.length,
          heroTriggers: byId("hero-stage").length,
          fogTriggers: byId("ex-stack-scroll").length,
          pageTransitionTriggers: byId("page-scroll-transition").length,
          menuTimelines: menuTimeline,
          refreshRequests: refreshDebug.requests,
          refreshActual: refreshDebug.actual,
          heroRebuilds: heroDebug.rebuilds,
          heroRebuildsDuringActiveScroll: heroDebug.rebuildsDuringActiveScroll,
          fogRebuilds: fogDebug.rebuilds,
          fogRebuildsDuringActiveScroll: fogDebug.rebuildsDuringActiveScroll,
        };
      });
    } catch {
      await wait(600);
    }
  }
  return {
    lenisMode: "unknown",
    activeTriggers: -1,
    heroTriggers: -1,
    fogTriggers: -1,
    pageTransitionTriggers: -1,
    menuTimelines: -1,
    refreshRequests: -1,
    refreshActual: -1,
    heroRebuilds: -1,
    heroRebuildsDuringActiveScroll: -1,
    fogRebuilds: -1,
    fogRebuildsDuringActiveScroll: -1,
  };
}

async function simulateInputs(page, touch) {
  await page.mouse.wheel(0, 120);
  await page.mouse.wheel(0, 900);
  await page.mouse.wheel(0, -700);
  await page.keyboard.press("PageDown");
  await page.keyboard.press("PageUp");
  if (touch) {
    const viewport = page.viewportSize();
    const x = Math.floor((viewport?.width ?? 390) / 2);
    const y = Math.floor((viewport?.height ?? 844) * 0.65);
    await page.touchscreen.tap(x, y);
    await page.mouse.wheel(0, 500);
    await page.mouse.wheel(0, -500);
  }
  await wait(300);
}

async function verifyMenu(page, touch) {
  if (!touch) return { tested: false };
  const menuButton = page.locator(".hathor-header__menu-btn").first();
  if ((await menuButton.count()) === 0) return { tested: false };

  await menuButton.click();
  await wait(250);
  await menuButton.click({ trial: true }).catch(() => {});
  await page.keyboard.press("Escape");
  await wait(220);
  await menuButton.click();
  await wait(200);
  await page.locator(".sm-backdrop").click({ force: true });
  await wait(240);
  return { tested: true };
}

async function testViewport(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    ...(vp.touch ? { ...devices["iPhone 13"], viewport: { width: vp.width, height: vp.height } } : {}),
  });
  const page = await context.newPage();
  const result = { viewport: vp.name };

  await page.goto(`${BASE_URL}/`, {
    waitUntil: "domcontentloaded",
    timeout: 150000,
  });
  await wait(900);
  const initialCounts = await getRuntimeCounts(page);

  await simulateInputs(page, vp.touch);
  const menu = await verifyMenu(page, vp.touch);
  const afterInputs = await getRuntimeCounts(page);

  await page.goto(`${BASE_URL}/cruises`, {
    waitUntil: "domcontentloaded",
    timeout: 150000,
  });
  await wait(800);
  const cruisesCounts = await getRuntimeCounts(page);

  await page.goBack({ waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(700);
  const backCounts = await getRuntimeCounts(page);

  await page.goForward({ waitUntil: "domcontentloaded", timeout: 120000 });
  await wait(700);
  const forwardCounts = await getRuntimeCounts(page);

  result.initialCounts = initialCounts;
  result.afterInputs = afterInputs;
  result.cruisesCounts = cruisesCounts;
  result.backCounts = backCounts;
  result.forwardCounts = forwardCounts;
  result.menu = menu;

  await context.close();
  return result;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const targets = QUICK_MODE ? VIEWPORTS.slice(0, 2) : VIEWPORTS;
  for (const vp of targets) {
    results.push(await testViewport(browser, vp));
  }
  await browser.close();
  await writeFile(
    new URL("./runtime-scroll-audit-output.json", import.meta.url),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8",
  );
  console.log("runtime-scroll-audit complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
