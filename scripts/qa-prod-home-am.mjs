import { chromium } from "playwright";

const url = "https://www.easytravegypt.com/?fresh=1";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const opening = document.querySelector("#home-am-opening");
  const comingSoon = !!document.querySelector("[data-coming-soon], .site-coming-soon");
  return {
    title: document.title,
    comingSoon,
    hasOpening: !!opening,
    openZ: opening ? getComputedStyle(opening).zIndex : null,
    sliderZ: document.querySelector("[data-am-slider]")
      ? getComputedStyle(document.querySelector("[data-am-slider]")).zIndex
      : null,
  };
});
console.log(JSON.stringify(info, null, 2));

if (info.hasOpening) {
  const oTop = await page.evaluate(() => {
    const el = document.querySelector("#home-am-opening");
    return el.getBoundingClientRect().top + window.scrollY;
  });
  await page.evaluate((y) => window.scrollTo(0, y), oTop + 1000);
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const stage = document.querySelector("#home-am-opening .home-am-chapter__stage");
    const cards = [...document.querySelectorAll("[data-am-opening-card]")].map((c) =>
      Math.round(c.getBoundingClientRect().top),
    );
    return {
      stagePos: stage ? getComputedStyle(stage).position : null,
      stageZ: stage?.style.zIndex || null,
      cards,
      openTf: getComputedStyle(document.querySelector("#home-am-opening")).transform,
    };
  });
  console.log(JSON.stringify(m));
  await page.screenshot({ path: ".tmp-prod-home-am.png" });
}
await browser.close();
