import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://127.0.0.1:3460";
const OUT = join(process.cwd(), "scripts/qa-cinema-out");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

async function shot(name, w, h, route, prep) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1200);
  if (prep) await prep();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
  console.log("ok", name);
}

await shot("hl-hero-d1440", 1440, 900, "/highlights");
await shot("hl-intro-d1440", 1440, 900, "/highlights", async () => {
  await page.locator("#highlight-introduction").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -80));
  await page.waitForTimeout(900);
});
await shot("hl-timeline-d1440", 1440, 900, "/highlights", async () => {
  const box = await page.locator(".hl-timeline__runway").boundingBox();
  if (box) {
    await page.evaluate((y) => window.scrollTo(0, y), box.y + box.height * 0.28);
  }
  await page.waitForTimeout(700);
});
await shot("hl-close-d1440", 1440, 900, "/highlights", async () => {
  await page.locator(".hl-close").scrollIntoViewIfNeeded();
});

await shot("ch-hero-d1440", 1440, 900, "/charter");
await shot("ch-chapters-d1440", 1440, 900, "/charter", async () => {
  await page.locator("[data-ch-chapters]").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 500));
});
await shot("ch-night-d1440", 1440, 900, "/charter", async () => {
  await page.locator("[data-ch-night]").scrollIntoViewIfNeeded();
});
await shot("ch-routes-d1440", 1440, 900, "/charter", async () => {
  await page.locator("#charter-itinerary").scrollIntoViewIfNeeded();
});
await shot("ch-form-d1440", 1440, 900, "/charter", async () => {
  await page.locator("#charter-request").scrollIntoViewIfNeeded();
});

await shot("hl-hero-t768", 768, 1024, "/highlights");
await shot("hl-chapter-t768", 768, 1024, "/highlights", async () => {
  await page.locator("[data-hl-stack-chapter]").first().scrollIntoViewIfNeeded();
});
await shot("ch-hero-t768", 768, 1024, "/charter");

await shot("hl-hero-p390", 390, 844, "/highlights");
await shot("hl-chapter-p390", 390, 844, "/highlights", async () => {
  await page.locator("[data-hl-stack-chapter]").first().scrollIntoViewIfNeeded();
});
await shot("ch-hero-p390", 390, 844, "/charter");
await shot("ch-form-p390", 390, 844, "/charter", async () => {
  await page.locator("#charter-request").scrollIntoViewIfNeeded();
});
await shot("hl-hero-p320", 320, 568, "/highlights");
await shot("ch-hero-p320", 320, 568, "/charter");

for (const route of ["/charter", "/highlights"]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => ({
    overflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 2,
  }));
  console.log("overflow", route, overflow);
}

const fonts = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  return h1 ? getComputedStyle(h1).fontFamily : null;
});
console.log("title font", fonts);

await browser.close();
console.log("done", OUT);
