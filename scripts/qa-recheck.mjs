import { chromium } from "playwright";
import { join } from "node:path";

const OUT = join(process.cwd(), "scripts/qa-luxury-out");
const BASE = "http://127.0.0.1:3460";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const ov = await page.evaluate(() => ({
  site: getComputedStyle(document.querySelector(".public-site")).overflowX,
  main: getComputedStyle(document.querySelector(".public-main")).overflowX,
}));
console.log("overflow override", ov);

const hero = await page.evaluate(() => {
  const el = document.querySelector(".hl-hero__content");
  const r = el.getBoundingClientRect();
  return { left: Math.round(r.left), width: Math.round(r.width) };
});
console.log("hl hero box", hero);
await page.screenshot({ path: join(OUT, "highlights-hero-d1440.png") });

await page.locator("#highlight-introduction").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.screenshot({ path: join(OUT, "highlights-intro-d1440.png") });

const box = await page.locator(".hl-stories__runway").boundingBox();
for (let i = 0; i < 3; i++) {
  const progress = (i + 0.35) / 3;
  const y = box.y + box.height * progress;
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  const state = await page.evaluate(() => {
    const media = document.querySelector("[data-hl-stories-sticky]");
    const mr = media.getBoundingClientRect();
    const active = [...document.querySelectorAll("[data-hl-chapter]")].find(
      (c) => parseFloat(getComputedStyle(c).opacity) > 0.5,
    );
    return {
      stickyTop: Math.round(mr.top),
      counter: document.querySelector("[data-hl-counter]")?.textContent,
      title: active?.querySelector(".hl-stories__title")?.textContent,
    };
  });
  console.log("ch", i + 1, state);
  await page.screenshot({
    path: join(OUT, `highlights-ch${i + 1}-d1440.png`),
  });
}

await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const ch = await page.evaluate(() => {
  const el = document.querySelector(".ch-hero__content");
  const r = el.getBoundingClientRect();
  return { left: Math.round(r.left), width: Math.round(r.width) };
});
console.log("ch hero box", ch);
await page.screenshot({ path: join(OUT, "charter-hero-d1440.png") });

await page.locator("[data-ch-priv]").scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(500);
const priv = await page.evaluate(() => {
  const m = document.querySelector("[data-ch-priv-media]");
  return {
    top: Math.round(m.getBoundingClientRect().top),
    pos: getComputedStyle(m).position,
  };
});
console.log("priv", priv);
await page.screenshot({ path: join(OUT, "charter-priv-d1440.png") });

await page.locator("[data-ch-night]").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "charter-night-d1440.png") });

await page.locator("#charter-request").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: join(OUT, "charter-form-d1440.png") });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: join(OUT, "charter-hero-p390.png") });

await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: join(OUT, "highlights-hero-p390.png") });
await page.locator("[data-hl-stack-chapter]").nth(0).scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "highlights-chapter-p390.png") });

await page.setViewportSize({ width: 768, height: 1024 });
await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.locator("[data-hl-stack-chapter]").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "highlights-chapter-t768.png") });

await browser.close();
console.log("done");
