import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100", {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
  scrollTo(0, 0);
});
await page.waitForTimeout(2500);

const metas = await page.locator("[data-home-chapter]").evaluateAll((xs) =>
  xs.map((x, i) => ({
    i,
    layout: x.dataset.homeLayout,
    top: x.getBoundingClientRect().top + scrollY,
    h: x.offsetHeight,
    title: x.querySelector(".home-chapter__title")?.textContent ?? "",
  })),
);
console.log(metas);

const chapters = page.locator("[data-home-chapter]");
for (const m of metas) {
  await page.evaluate(({ y }) => scrollTo(0, y), { y: m.top + m.h * 0.2 });
  await page.waitForTimeout(1200);
  const img = await chapters
    .nth(m.i)
    .locator("img")
    .first()
    .evaluate((x) => ({ w: x.naturalWidth, complete: x.complete }));
  console.log("shot", m.i, m.layout, m.title, img);
  await page.screenshot({ path: `.tmp-ch-${m.i}-${m.layout}.png` });
}

await browser.close();
