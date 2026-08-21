import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:3460";
const OUT = join(process.cwd(), "scripts/qa-luxury-out");
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "d1600", w: 1600, h: 1000 },
  { name: "d1440", w: 1440, h: 900 },
  { name: "d1280", w: 1280, h: 800 },
  { name: "t1024", w: 1024, h: 1366 },
  { name: "t834", w: 834, h: 1194 },
  { name: "t768", w: 768, h: 1024 },
  { name: "p430", w: 430, h: 932 },
  { name: "p390", w: 390, h: 844 },
  { name: "p375", w: 375, h: 812 },
  { name: "p360", w: 360, h: 800 },
  { name: "p320", w: 320, h: 568 },
];

const charterShots = [
  { label: "hero", scroll: 0 },
  { label: "intro", sel: "#charter-introduction" },
  { label: "priv", sel: "[data-ch-priv]" },
  { label: "night", sel: "[data-ch-night]" },
  { label: "routes", sel: "#charter-itinerary" },
  { label: "form", sel: "#charter-request" },
];

const highlightsShots = [
  { label: "hero", scroll: 0 },
  { label: "intro", sel: "#highlight-introduction" },
  { label: "stories", sel: "#highlight-stories" },
  { label: "interlude", sel: "[data-hl-interlude]" },
  { label: "close", sel: ".hl-close" },
];

async function capture(page, vp, route, pageName, item) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1100);
  if (item.sel) {
    const el = page.locator(item.sel).first();
    if ((await el.count()) > 0) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    }
  } else if (typeof item.scroll === "number") {
    await page.evaluate((y) => window.scrollTo(0, y), item.scroll);
    await page.waitForTimeout(300);
  }
  const file = join(OUT, `${pageName}-${item.label}-${vp.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("ok", file);
  return file;
}

async function landmarkDesktop(page, vp) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(900);
  const runway = page.locator(".hl-stories__runway");
  if ((await runway.count()) === 0) return [];
  const box = await runway.boundingBox();
  if (!box) return [];
  const files = [];
  for (let i = 0; i < 3; i++) {
    const y = box.y + (box.height * (i + 0.35)) / 3;
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.max(0, y - vp.h * 0.2));
    await page.waitForTimeout(500);
    const file = join(OUT, `highlights-ch${i + 1}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log("ok", file);
    files.push(file);
  }
  return files;
}

async function motionCheck(page) {
  const report = {};
  for (const route of ["/charter", "/highlights"]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(800);
    const result = await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      const samples = [];
      for (const y of [0, max * 0.2, max * 0.45, max * 0.7, max * 0.9, max * 0.45, 0]) {
        window.scrollTo(0, y);
        await sleep(80);
        samples.push({
          y: Math.round(window.scrollY),
          triggers: window.ScrollTrigger?.getAll?.()?.length ?? null,
        });
      }
      const overflow =
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2;
      return {
        max: Math.round(max),
        overflow,
        motionAttr:
          document.querySelector("[data-charter-motion], [data-highlights-motion]")
            ?.getAttribute("data-charter-motion") ||
          document.querySelector("[data-highlights-motion]")?.getAttribute(
            "data-highlights-motion",
          ),
        samples,
      };
    });
    report[route] = result;
  }

  /* phone no pin check */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  report.phonePin = await page.evaluate(() => {
    const sticky = document.querySelector("[data-hl-stories-sticky]");
    const desktop = document.querySelector(".hl-stories__desktop");
    const style = desktop ? getComputedStyle(desktop) : null;
    return {
      desktopDisplay: style?.display ?? null,
      stickyExists: Boolean(sticky),
    };
  });

  writeFileSync(join(OUT, "motion-report.json"), JSON.stringify(report, null, 2));
  console.log("motion", JSON.stringify(report, null, 2));
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const focusVps = viewports.filter((v) =>
  ["d1600", "d1440", "t768", "p430", "p390", "p320"].includes(v.name),
);

for (const vp of focusVps) {
  for (const item of charterShots) {
    try {
      await capture(page, vp, "/charter", "charter", item);
    } catch (e) {
      console.error("FAIL charter", item.label, vp.name, e.message);
    }
  }
  for (const item of highlightsShots) {
    try {
      await capture(page, vp, "/highlights", "highlights", item);
    } catch (e) {
      console.error("FAIL highlights", item.label, vp.name, e.message);
    }
  }
  if (vp.w >= 1280) {
    try {
      await landmarkDesktop(page, vp);
    } catch (e) {
      console.error("FAIL landmarks", vp.name, e.message);
    }
  } else {
    /* tablet/phone stack chapter */
    try {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(800);
      const el = page.locator("[data-hl-stack-chapter]").first();
      if ((await el.count()) > 0) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const file = join(OUT, `highlights-chapter-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log("ok", file);
      }
    } catch (e) {
      console.error("FAIL stack chapter", vp.name, e.message);
    }
  }
}

await motionCheck(page);

/* overflow all phone widths */
for (const vp of viewports.filter((v) => v.w <= 430)) {
  for (const route of ["/charter", "/highlights"]) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2,
    }));
    console.log("overflow", route, vp.name, overflow);
  }
}

await browser.close();
console.log("done", OUT);
