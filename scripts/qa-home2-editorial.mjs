import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3000/home-2";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
  { name: "short-phone", width: 375, height: 667 },
];

const browser = await chromium.launch({ headless: true });
let failed = false;

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);

  const audit = await page.evaluate(() => {
    const root = document.querySelector(".home2-editorial");
    const scenes = [...document.querySelectorAll(".h2-scene")];
    const buttons = [...document.querySelectorAll(".h2-btn")].map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      root: Boolean(root),
      scenes: scenes.length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      buttonHeights: [...new Set(buttons.map((button) => Math.round(button.height)))],
      zeroSize: [...document.querySelectorAll(".h2-display, .h2-copy, .h2-btn, .h2-media")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width < 1 || rect.height < 1;
        })
        .map((element) => element.className),
    };
  });

  if (!audit.root || audit.scenes < 30 || audit.scrollWidth > audit.clientWidth + 1 || audit.buttonHeights.length !== 1 || audit.zeroSize.length) {
    failed = true;
  }
  if (errors.length) failed = true;
  console.log(viewport.name, JSON.stringify({ ...audit, errors }));
  await page.screenshot({ path: `.tmp-home2-${viewport.name}.png`, fullPage: false });
  const checkpoints = viewport.width > 950 ? [0, 0.34, 0.68, 1] : [0, 0.45, 0.9];
  const run = await page.locator(".h2-run").boundingBox();
  const epilogue = await page.locator(".h2-epilogue").boundingBox();
  if (run && epilogue) {
    for (const [index, progress] of checkpoints.entries()) {
      const y = run.y + Math.max(0, epilogue.y - run.y - viewport.height) * progress;
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(350);
      await page.screenshot({ path: `.tmp-home2-${viewport.name}-${index}.png`, fullPage: false });
    }
  }
  await page.close();
}

await browser.close();
if (failed) process.exit(1);
