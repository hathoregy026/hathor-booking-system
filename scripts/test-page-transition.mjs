import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3005/about";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: "networkidle" });

const hasRoot = await page.locator("[data-page-transition]").count();
const stripCountBefore = await page.locator(".pt-mask__strip").count();

await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
await page.waitForTimeout(800);

const stripCountAfter = await page.locator(".pt-mask__strip").count();
const maskActive = await page.locator(".pt-mask.is-active").count();
const sheetTransform = await page.locator(".pt-sheet").evaluate((el) => getComputedStyle(el).transform);

console.log(JSON.stringify({
  url,
  hasRoot,
  stripCountBefore,
  stripCountAfter,
  maskActive,
  sheetTransform,
}, null, 2));

await browser.close();
