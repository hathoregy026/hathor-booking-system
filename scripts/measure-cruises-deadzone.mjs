import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3013/cruises", { waitUntil: "networkidle" });

const pinEnd = 800 * 4.2;
const checkpoints = [2000, 2600, 2800, 3000, 3200, pinEnd, pinEnd + 400];

for (const y of checkpoints) {
  await page.evaluate((scrollY) => scrollTo(0, scrollY), y);
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const title = document.querySelector(".cruises-sheet-follower .pt-sheet__landing-title");
    const grid = document.querySelector(".page-layout__grid");
    const sheet = document.querySelector(".cruises-sheet-runway");
    const t = title?.getBoundingClientRect();
    const g = grid?.getBoundingClientRect();
    const pastPin = document.querySelector("[data-cruises-transition]")?.classList.contains("hathor-page-scroll--past-pin");
    return {
      pastPin,
      sheetH: sheet?.offsetHeight,
      titleTop: t ? Math.round(t.top) : null,
      titleVisible: t ? t.top < 750 && t.bottom > 0 : false,
      gridTop: g ? Math.round(g.top) : null,
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log("scroll", y, m);
}

await browser.close();
