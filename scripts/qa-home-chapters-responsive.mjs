import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
for (const v of [
  { n: "tablet", w: 768, h: 1024 },
  { n: "phone", w: 390, h: 844 },
]) {
  const page = await browser.newPage({
    viewport: { width: v.w, height: v.h },
    isMobile: v.n === "phone",
    hasTouch: v.n === "phone",
  });
  await page.goto("http://localhost:3100", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    scrollTo(0, 0);
  });
  await page.waitForTimeout(2200);
  const metas = await page.locator("[data-home-chapter]").evaluateAll((xs) =>
    xs.map((x) => ({
      layout: x.dataset.homeLayout,
      top: x.getBoundingClientRect().top + scrollY,
      h: x.offsetHeight,
    })),
  );
  for (const layout of [
    "cinematic",
    "split-right",
    "sunset-rail",
    "dining-card",
  ]) {
    const m = metas.find((x) => x.layout === layout);
    await page.evaluate((y) => scrollTo(0, y), m.top + m.h * 0.2);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `.tmp-ch-${v.n}-${layout}.png` });
  }
  await page.close();
}
await browser.close();
console.log("responsive chapters captured");
