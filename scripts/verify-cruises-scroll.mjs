import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3013";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const path of ["/cruises", "/about"]) {
  await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector("[data-page-transition]", { timeout: 30000 });
  await page.waitForTimeout(2000);

  const vh = 800;
  let best = { titleToContentGap: Infinity, scrollY: 0 };

  for (let y = 0; y <= vh * 3.2; y += 20) {
    await page.evaluate((s) => window.scrollTo(0, s), y);
    await page.waitForTimeout(40);

    const snap = await page.evaluate(() => {
      const root = document.querySelector("[data-page-transition]");
      const landing = document.querySelector(".pt-sheet__landing");
      const body = document.querySelector(".pt-sheet__body");
      const filters = document.querySelector(
        ".page-layout__filters, .hathor-page-cream-floor > *:first-child",
      );
      const contentTop = filters?.getBoundingClientRect().top ?? body?.getBoundingClientRect().top ?? 0;
      const titleBottom = landing?.getBoundingClientRect().bottom ?? 0;
      const gap = contentTop - titleBottom;
      const pastPin = root?.classList.contains("hathor-page-scroll--past-pin");
      const filtersHidden = (() => {
        const stage = document.querySelector(".pt-stage");
        const f = filters?.getBoundingClientRect();
        const s = stage?.getBoundingClientRect();
        return !!(f && s && f.top < s.bottom - 2 && f.bottom > s.top && getComputedStyle(stage).overflow === "hidden");
      })();
      return { scrollY: window.scrollY, gap, pastPin, titleBottom, contentTop, filtersHidden, hasBodyInSheet: !!body };
    });

    if (snap.pastPin && snap.gap < best.titleToContentGap) {
      best = { titleToContentGap: snap.gap, scrollY: snap.scrollY, ...snap };
    }
  }

  console.log(JSON.stringify({ path, best }, null, 2));
}

await browser.close();
