/**
 * Focused motion frame capture + font audit (assumes server on :3460).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://127.0.0.1:3460";
const OUT = join(process.cwd(), "scripts/qa-final-out");
mkdirSync(join(OUT, "frames"), { recursive: true });

async function captureScrollFrames(page, { label, route, viewport, selector, steps = 14 }) {
  await page.setViewportSize(viewport);
  const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  console.log("goto", route, res?.status());
  await page.waitForTimeout(1400);
  const box = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { y: r.top + window.scrollY, height: Math.max(r.height, el.scrollHeight) };
  }, selector);
  if (!box) {
    console.log("MISSING", label, selector);
    return [];
  }
  console.log("box", label, box);
  const startY = Math.max(0, box.y - 20);
  const endY = box.y + Math.max(box.height * 0.85, viewport.height * 1.5);
  const paths = [];
  for (let i = 0; i <= steps; i++) {
    const y = startY + ((endY - startY) * i) / steps;
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(110);
    const file = join(OUT, "frames", `${label}-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    paths.push(file);
  }
  for (const frac of [0.85, 0.2, 0.7, 0.15, 0.95]) {
    await page.evaluate(([s, e, f]) => window.scrollTo(0, s + (e - s) * f), [startY, endY, frac]);
    await page.waitForTimeout(80);
  }
  const whip = join(OUT, "frames", `${label}-whip.png`);
  await page.screenshot({ path: whip, fullPage: false });
  paths.push(whip);
  /* reverse slow */
  for (let i = steps; i >= 0; i -= 2) {
    const y = startY + ((endY - startY) * i) / steps;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
    const file = join(OUT, "frames", `${label}-rev-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    paths.push(file);
  }
  console.log("ok frames", label, paths.length);
  return paths;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const report = { fonts: {}, frames: {}, status: {}, images: {}, reduced: {} };

for (const route of ["/highlights", "/charter"]) {
  const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  report.status[route] = res?.status() ?? null;
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
report.fonts.highlights = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, fontSize: cs.fontSize };
  };
  return {
    heroTitle: pick(".hl-hero h1"),
    timelineTitle: pick(".hl-timeline__title") || pick(".hl-chapter__title"),
    body: pick(".hl-intro__lead"),
    label: pick(".lx-label"),
    button: pick(".lx-btn"),
  };
});
report.images.highlights = await page.evaluate(() =>
  [...document.querySelectorAll(".hl-hero img, [data-hl-slide] img")].map((img) => ({
    alt: img.alt,
    slot: img.getAttribute("data-site-image") || img.closest("[data-site-image]")?.getAttribute("data-site-image"),
    src: (img.currentSrc || img.src).replace(location.origin, ""),
  })),
);

await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
report.fonts.charter = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, fontSize: cs.fontSize };
  };
  return {
    heroTitle: pick(".ch-hero h1"),
    script: pick(".ch-hero__script"),
    privilegeTitle: pick(".ch-chapters__title"),
    routeLabel: pick(".ch-routes__origin"),
    formLabel: pick(".ch-form__label"),
    formInput: pick(".ch-form__input"),
    formSubmit: pick(".ch-form button[type='submit'], .ch-form .lx-btn"),
  };
});
report.images.charter = await page.evaluate(() =>
  [...document.querySelectorAll(".ch-hero img, [data-ch-chapter-slide] img")].map((img) => ({
    alt: img.alt,
    slot: img.getAttribute("data-site-image") || img.closest("[data-site-image]")?.getAttribute("data-site-image"),
    src: (img.currentSrc || img.src).replace(location.origin, ""),
  })),
);

report.frames.hlTimelineDesktop = await captureScrollFrames(page, {
  label: "hl-timeline-d",
  route: "/highlights",
  viewport: { width: 1440, height: 900 },
  selector: ".hl-timeline__runway",
  steps: 16,
});
report.frames.chChaptersDesktop = await captureScrollFrames(page, {
  label: "ch-chapters-d",
  route: "/charter",
  viewport: { width: 1440, height: 900 },
  selector: "[data-ch-chapters]",
  steps: 16,
});
report.frames.hlChapterPhone = await captureScrollFrames(page, {
  label: "hl-chapter-p",
  route: "/highlights",
  viewport: { width: 390, height: 844 },
  selector: "[data-hl-stack-chapter]",
  steps: 10,
});
report.frames.chChapterPhone = await captureScrollFrames(page, {
  label: "ch-chapter-p",
  route: "/charter",
  viewport: { width: 390, height: 844 },
  selector: "[data-ch-chapters]",
  steps: 12,
});

const rm = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const rp = await rm.newPage();
await rp.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await rp.waitForTimeout(900);
report.reduced.highlights = await rp.evaluate(() => ({
  veil: document.querySelector("[data-hl-hero-veil]")
    ? getComputedStyle(document.querySelector("[data-hl-hero-veil]")).display
    : null,
  stack: document.querySelector(".hl-timeline__stack")
    ? getComputedStyle(document.querySelector(".hl-timeline__stack")).display
    : null,
  desktop: document.querySelector(".hl-timeline__desktop")
    ? getComputedStyle(document.querySelector(".hl-timeline__desktop")).display
    : null,
}));
await rp.screenshot({ path: join(OUT, "hl-reduced-motion.png") });
await rp.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await rp.waitForTimeout(900);
report.reduced.charter = await rp.evaluate(() => ({
  veil: document.querySelector("[data-ch-hero-veil]")
    ? getComputedStyle(document.querySelector("[data-ch-hero-veil]")).display
    : null,
  activeChapters: document.querySelectorAll(".ch-chapters__item.is-active").length,
}));
await rp.screenshot({ path: join(OUT, "ch-reduced-motion.png") });
await rm.close();

/* Viewport gallery */
const VIEWPORTS = [
  [1600, 1000, "d1600"],
  [1440, 900, "d1440"],
  [1280, 800, "d1280"],
  [1024, 1366, "t1024"],
  [834, 1194, "t834"],
  [768, 1024, "t768"],
  [430, 932, "p430"],
  [390, 844, "p390"],
  [375, 812, "p375"],
  [360, 800, "p360"],
  [320, 568, "p320"],
];
report.screenshots = [];
report.overflow = {};
for (const [w, h, name] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  for (const [route, prefix] of [
    ["/highlights", "hl"],
    ["/charter", "ch"],
  ]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(700);
    const file = join(OUT, `${prefix}-${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    report.screenshots.push(file);
    report.overflow[`${prefix}-${name}`] = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }));
  }
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.fonts, null, 2));
console.log("images", report.images);
console.log("reduced", report.reduced);
console.log("status", report.status);
console.log("overflow", Object.entries(report.overflow).filter(([, v]) => v.overflow));
console.log("done", OUT);
await browser.close();
