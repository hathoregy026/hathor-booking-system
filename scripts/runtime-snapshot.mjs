import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:3010/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE_URL, { waitUntil: "commit", timeout: 45000 });
    await page.waitForTimeout(7000);
    const counts = await page.evaluate(() => {
      const st = window.ScrollTrigger;
      const all = st?.getAll?.() ?? [];
      return {
        lenis: Boolean(window.__hathorLenis),
        triggers: all.length,
        hero: all.filter((t) => String(t.vars?.id || "").includes("hero-stage")).length,
        fog: all.filter((t) => String(t.vars?.id || "").includes("ex-stack-scroll")).length,
        pageTransition: all.filter((t) => String(t.vars?.id || "").includes("page-scroll-transition")).length,
        refresh: window.__hathorRefreshDebug ?? null,
        heroDebug: window.__hathorHeroDebug ?? null,
        fogDebug: window.__hathorFogDebug ?? null,
      };
    });
    console.log(JSON.stringify(counts, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
