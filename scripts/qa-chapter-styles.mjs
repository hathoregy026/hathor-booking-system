import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100", { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
  scrollTo(0, 0);
});
await page.waitForTimeout(2000);

const metas = await page.locator("[data-home-chapter]").evaluateAll((xs) =>
  xs.map((x) => ({
    layout: x.dataset.homeLayout,
    top: x.getBoundingClientRect().top + scrollY,
    h: x.offsetHeight,
  })),
);

for (const layout of ["split-right", "editorial-card", "dining-card"]) {
  const target = metas.find((m) => m.layout === layout);
  await page.evaluate((y) => scrollTo(0, y), target.top + target.h * 0.2);
  await page.waitForTimeout(700);
  const info = await page
    .locator(`[data-home-layout="${layout}"]`)
    .first()
    .evaluate((chapter) => {
      const title = chapter.querySelector(".home-chapter__title");
      const body = chapter.querySelector(".home-chapter__body");
      const frame = chapter.querySelector(".home-chapter__media-frame");
      const copy = chapter.querySelector(".home-chapter__copy");
      const cs = (el) => {
        if (!el) return null;
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          color: c.color,
          fill: c.webkitTextFillColor,
          left: c.left,
          right: c.right,
          top: c.top,
          bottom: c.bottom,
          inset: c.inset,
          width: r.width,
          height: r.height,
          x: r.x,
          y: r.y,
        };
      };
      return { title: cs(title), body: cs(body), frame: cs(frame), copy: cs(copy) };
    });
  console.log(layout, JSON.stringify(info, null, 2));
}

await browser.close();
