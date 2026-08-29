import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3000/home-2";
const allViewports = [
  { name: "wide-desktop", width: 1920, height: 1080 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "large-tablet", width: 1024, height: 1366 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "phone", width: 390, height: 844 },
  { name: "short-phone", width: 375, height: 667 },
  { name: "narrow-phone", width: 360, height: 800 },
];
const viewports = process.env.H2_QA_VIEWPORT
  ? allViewports.filter(({ name }) => name === process.env.H2_QA_VIEWPORT)
  : allViewports;

const heroSelectors = [
  ".home-hero-container",
  ".hero-media",
  ".hero-logo-mark",
  ".hero-heading",
  ".hero-button",
  ".hero-scroll-hint",
  ".luxury-marquee",
];

const heroSignature = async (page) => page.evaluate((selectors) => Object.fromEntries(
  selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return [selector, null];
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [selector, {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      display: style.display,
      position: style.position,
      transform: style.transform,
    }];
  }),
), heroSelectors);

const browser = await chromium.launch({ headless: true });
let failed = false;

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(new URL("/", base).href, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);
  const mainHero = await heroSignature(page);
  await page.goto(base, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);
  const home2Hero = await heroSignature(page);
  const heroMatch = JSON.stringify(mainHero) === JSON.stringify(home2Hero);
  if (!heroMatch) {
    console.log(`${viewport.name}-hero-diff`, JSON.stringify({ mainHero, home2Hero }));
  }

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
      wheelSceneHeight: Math.round(document.querySelector(".h2-helm")?.getBoundingClientRect().height || 0),
      wheelSceneWidth: Math.round(document.querySelector(".h2-helm")?.getBoundingClientRect().width || 0),
      wheelStageHeight: Math.round(document.querySelector(".h2-helm__stage")?.getBoundingClientRect().height || 0),
    };
  });

  const wheelHasHold = viewport.width > 950
    ? audit.wheelSceneWidth > viewport.width
    : audit.wheelSceneHeight > audit.wheelStageHeight;
  if (!heroMatch || !wheelHasHold || !audit.root || audit.scenes < 30 || audit.scrollWidth > audit.clientWidth + 1 || audit.buttonHeights.length !== 1 || audit.zeroSize.length) {
    failed = true;
  }
  if (errors.length) failed = true;
  console.log(viewport.name, JSON.stringify({ ...audit, heroMatch, wheelHasHold, errors }));
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
  const wheelScrollY = await page.evaluate(() => {
    const runElement = document.querySelector(".h2-run");
    const trackElement = document.querySelector(".h2-track");
    const helmElement = document.querySelector(".h2-helm");
    if (!(runElement instanceof HTMLElement) || !(trackElement instanceof HTMLElement) || !(helmElement instanceof HTMLElement)) return null;
    if (window.innerWidth <= 950) {
      const helmTop = window.scrollY + helmElement.getBoundingClientRect().top;
      return helmTop + Math.max(0, helmElement.offsetHeight - window.innerHeight) * 0.52;
    }
    const travel = Math.max(1, trackElement.scrollWidth - window.innerWidth);
    const holdCenter = helmElement.offsetLeft + Math.max(0, helmElement.offsetWidth - window.innerWidth) * 0.52;
    const runTop = window.scrollY + runElement.getBoundingClientRect().top;
    return runTop + (holdCenter / travel) * travel * 0.74;
  });
  if (wheelScrollY !== null) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), wheelScrollY);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `.tmp-home2-${viewport.name}-wheel.png`, fullPage: false });
  }
  await page.close();
}

await browser.close();
if (failed) process.exit(1);
