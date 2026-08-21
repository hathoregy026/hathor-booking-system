import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/test-slide", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(4000);
const info = await page.evaluate(() => ({
  title: document.title,
  hasIntro: !!document.querySelector("#i-intro"),
  hasOpening: !!document.querySelector("#i-opening"),
  hasNature: !!document.querySelector("#i-nature"),
  openingText: document
    .querySelector("#i-opening h3")
    ?.textContent?.trim()
    ?.slice(0, 80),
  bg: getComputedStyle(document.body).backgroundColor,
  sections: [...document.querySelectorAll("[id^='i-']")].map((el) => el.id),
}));
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: ".tmp-test-slide-first.png" });
const opening = await page.evaluate(() => {
  const el = document.querySelector("#i-opening");
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
if (opening != null) {
  await page.evaluate((y) => window.scrollTo(0, y + 1000), opening);
  await page.waitForTimeout(800);
  await page.screenshot({ path: ".tmp-test-slide-opening.png" });
}
await browser.close();
