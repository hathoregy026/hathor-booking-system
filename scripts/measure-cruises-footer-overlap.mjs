import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3013/cruises", { waitUntil: "networkidle" });

for (const y of [2200, 2600, 3000, 4000]) {
  await page.evaluate((scrollY) => scrollTo(0, scrollY), y);
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const title = document.querySelector(".pt-sheet__landing-title");
    const grid = document.querySelector(".page-layout__grid");
    const footer = document.querySelector(".cruises-footer");
    const t = title?.getBoundingClientRect();
    const g = grid?.getBoundingClientRect();
    const f = footer?.getBoundingClientRect();
    const overlap =
      t && f && g
        ? f.top < g.bottom && f.bottom > g.top
        : null;
    return {
      titleVisible: t ? t.top < 700 && t.bottom > 0 : false,
      gridVisible: g ? g.top < 700 && g.bottom > 0 : false,
      gridTop: g ? Math.round(g.top) : null,
      footerTop: f ? Math.round(f.top) : null,
      footerInsideFollower: !!footer?.closest(".cruises-sheet-follower"),
      overlap,
    };
  });
  console.log("scroll", y, m);
}

await browser.close();
