import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(3500);

const oTop = await page.evaluate(() => {
  const el = document.querySelector("#home-am-opening");
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
if (oTop == null) {
  console.log("NO_OPENING");
  await browser.close();
  process.exit(1);
}
console.log("oTop", Math.round(oTop));

for (const dy of [700, 1000, 1300, 1600]) {
  await page.evaluate((y) => window.scrollTo(0, y), oTop + dy);
  await page.waitForTimeout(280);
  const m = await page.evaluate((dy) => {
    const opening = document.querySelector("#home-am-opening");
    const stage = opening?.querySelector(".home-am-chapter__stage");
    const slider = document.querySelector("[data-am-slider]");
    const cards = [...document.querySelectorAll("[data-am-opening-card]")].map(
      (c) => Math.round(c.getBoundingClientRect().top),
    );
    const at = (x, y) => {
      const el = document.elementFromPoint(x, y);
      if (el?.closest("[data-am-slider]")) return "slider";
      if (el?.closest("[data-am-opening-card]")) return "card";
      if (el?.closest(".home-am-opening__images")) return "photo";
      if (el?.closest("[data-am-opening-right]")) return "gold";
      if (el?.closest("[data-am-nature]")) return "nature";
      return "other";
    };
    return {
      dy,
      openZ: getComputedStyle(opening).zIndex,
      sliderZ: slider ? getComputedStyle(slider).zIndex : null,
      stagePos: stage ? getComputedStyle(stage).position : null,
      stageZ: stage ? stage.style.zIndex : null,
      openTf: getComputedStyle(opening).transform,
      cards,
      L: at(200, 450),
      R: at(1100, 400),
      R2: at(1100, 650),
    };
  }, dy);
  console.log(JSON.stringify(m));
}

await page.evaluate((y) => window.scrollTo(0, y), oTop + 1000);
await page.waitForTimeout(350);
await page.screenshot({ path: ".tmp-home-am-fix.png" });
await browser.close();
