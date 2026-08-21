import { chromium } from "playwright";

const url = `${process.argv[2] ?? "http://localhost:3010"}/cruises`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("[data-page-transition]");
await page.waitForTimeout(1500);

const vh = 800;
const targets = [0, vh * 0.5, vh * 1.4, vh * 2.8, vh * 3.2];

for (const y of targets) {
  await page.evaluate((s) => window.scrollTo(0, s), Math.round(y));
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const landing = document.querySelector(".pt-sheet__landing");
    const cream = document.querySelector(".hathor-page-cream-floor");
    const spacer = document.querySelector(".pin-spacer");
    const stage = document.querySelector(".pt-stage");
    const sheet = document.querySelector(".pt-sheet");
    return {
      scrollY: window.scrollY,
      landingBottom: landing?.getBoundingClientRect().bottom,
      creamTop: cream?.getBoundingClientRect().top,
      gap: (cream?.getBoundingClientRect().top ?? 0) - (landing?.getBoundingClientRect().bottom ?? 0),
      spacerHeight: spacer?.getBoundingClientRect().height,
      stageBottom: stage?.getBoundingClientRect().bottom,
      sheetTransform: sheet ? getComputedStyle(sheet).transform : null,
      riseCapHeight: document.querySelector(".pt-sheet__rise-cap")?.getBoundingClientRect().height,
    };
  });
  console.log(JSON.stringify(info));
}

await browser.close();
