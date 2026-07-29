#!/usr/bin/env node
/**
 * Focused phone hero + mid-scroll QA for the homepage.
 * Usage: node scripts/qa-home-phone-scroll.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = (process.argv[2] ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const out = path.resolve(".next", "mobile-qa", "home-scroll");
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`${base}/?qa=${Date.now()}`, {
  waitUntil: "domcontentloaded",
  timeout: 90_000,
});
await page.waitForTimeout(2500);

const fold = await page.evaluate(() => {
  const hero = document.querySelector(".home-hero-container");
  const logo = hero?.querySelector(".hero-logo-mark");
  const cta = hero?.querySelector(".hero-cta");
  const stripes = document.querySelectorAll(".blind-strip-v--mobile");
  const cover = document.querySelector(".home-hero-cover");
  const isVisible = (el) => {
    if (!(el instanceof HTMLElement)) return false;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return (
      s.display !== "none" &&
      s.visibility !== "hidden" &&
      Number(s.opacity) > 0.05 &&
      r.width > 0 &&
      r.height > 0
    );
  };
  return {
    overflow: Math.max(
      0,
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
        document.documentElement.clientWidth,
    ),
    pins: document.querySelectorAll(".pin-spacer").length,
    lenis: document.documentElement.classList.contains("lenis"),
    stripes: stripes.length,
    coverVisible: isVisible(cover),
    logoVisible: isVisible(logo),
    ctaVisible: isVisible(cta),
    logoRect: logo?.getBoundingClientRect().toJSON?.() ?? null,
    ctaRect: cta?.getBoundingClientRect().toJSON?.() ?? null,
    heroH: hero?.getBoundingClientRect().height ?? 0,
  };
});

await page.screenshot({ path: path.join(out, "fold.png"), fullPage: false });

// Scroll through hero and mid page
for (const y of [200, 600, 1200, 2400, 4000]) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await page.waitForTimeout(500);
}

const mid = await page.evaluate(() => {
  const cover = document.querySelector(".home-hero-cover");
  const stripes = [...document.querySelectorAll(".blind-strip-v--mobile")];
  const opaqueStripes = stripes.filter((el) => {
    const s = getComputedStyle(el);
    return Number(s.opacity) > 0.2 && s.visibility !== "hidden";
  }).length;
  return {
    scrollY: window.scrollY,
    coverChildren: cover?.children.length ?? 0,
    opaqueStripes,
    pins: document.querySelectorAll(".pin-spacer").length,
  };
});

await page.screenshot({ path: path.join(out, "mid.png"), fullPage: false });

console.log(JSON.stringify({ fold, mid, errors: errors.slice(0, 5) }, null, 2));

const fail =
  !fold.logoVisible ||
  !fold.ctaVisible ||
  fold.overflow > 2 ||
  fold.lenis ||
  mid.opaqueStripes > 0 ||
  mid.coverChildren > 0;

await browser.close();
if (fail) {
  console.error("HOME PHONE QA FAILED");
  process.exit(1);
}
console.log("HOME PHONE QA OK");
