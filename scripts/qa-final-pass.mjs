/**
 * Final production-readiness QA for /highlights and /charter.
 * Fonts, screenshots, motion frame sequences, a11y smoke, route health.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE || "http://127.0.0.1:3460";
const OUT = join(process.cwd(), "scripts/qa-final-out");
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "frames"), { recursive: true });

const VIEWPORTS = [
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

const FONT_SELECTORS = {
  highlights: {
    "hero-title": ".hl-hero h1",
    "timeline-title": ".hl-timeline__title, .hl-chapter__title",
    "body-copy": ".hl-intro__lead, .lx-copy",
    "label": ".lx-label",
    "button": ".lx-btn",
  },
  charter: {
    "hero-title": ".ch-hero h1",
    "script": ".ch-hero__script, .lx-script",
    "privilege-title": ".ch-chapters__title",
    "route-label": ".ch-routes__origin, .ch-routes__dest",
    "form-label": ".ch-form__label",
    "form-input": ".ch-form__input",
    "form-submit": ".ch-form button[type='submit'], .ch-form .lx-btn",
  },
};

async function resolvedFonts(page, map) {
  const out = {};
  for (const [role, sel] of Object.entries(map)) {
    out[role] = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontStyle: cs.fontStyle,
        fontSize: cs.fontSize,
      };
    }, sel);
  }
  return out;
}

async function shot(page, name, route, prep) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(900);
  if (prep) await prep(page);
  await page.waitForTimeout(350);
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function captureScrollFrames(page, {
  label,
  route,
  viewport,
  selector,
  steps = 14,
  reverse = true,
}) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1000);
  const box = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { y: r.top + window.scrollY, height: r.height, width: r.width };
  }, selector);
  if (!box || box.height < 40) {
    console.log("skip frames", label, "no target", selector);
    return [];
  }
  const startY = Math.max(0, box.y - 40);
  const endY = box.y + box.height * 0.92;
  const paths = [];
  for (let i = 0; i <= steps; i++) {
    const y = startY + ((endY - startY) * i) / steps;
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
    const file = join(OUT, "frames", `${label}-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    paths.push(file);
  }
  if (reverse) {
    for (let i = steps; i >= 0; i -= 2) {
      const y = startY + ((endY - startY) * i) / steps;
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(70);
      const file = join(
        OUT,
        "frames",
        `${label}-rev-${String(i).padStart(2, "0")}.png`,
      );
      await page.screenshot({ path: file, fullPage: false });
      paths.push(file);
    }
  }
  /* Rapid direction changes */
  for (const frac of [0.2, 0.8, 0.35, 0.9, 0.1]) {
    await page.evaluate(
      ([s, e, f]) => window.scrollTo(0, s + (e - s) * f),
      [startY, endY, frac],
    );
    await page.waitForTimeout(60);
  }
  const whip = join(OUT, "frames", `${label}-whip.png`);
  await page.screenshot({ path: whip, fullPage: false });
  paths.push(whip);
  console.log("frames", label, paths.length);
  return paths;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const report = {
  fonts: {},
  screenshots: [],
  frames: {},
  status: {},
  overflow: {},
  reducedMotion: {},
  pinsAtPhone: {},
  imageSlots: {},
};

for (const route of ["/highlights", "/charter", "/about"]) {
  const res = await page.goto(`${BASE}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  report.status[route] = res?.status() ?? null;
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
report.fonts.highlights = await resolvedFonts(page, FONT_SELECTORS.highlights);
report.imageSlots.highlights = await page.evaluate(() =>
  [...document.querySelectorAll("[data-hl-slide] img, .hl-hero img")].map((img) => ({
    alt: img.alt,
    src: img.currentSrc || img.src,
    slot: img.getAttribute("data-site-image") || img.closest("[data-site-image]")?.getAttribute("data-site-image"),
  })),
);

await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
report.fonts.charter = await resolvedFonts(page, FONT_SELECTORS.charter);
report.imageSlots.charter = await page.evaluate(() =>
  [...document.querySelectorAll("[data-ch-chapter-slide] img, .ch-hero img")].map(
    (img) => ({
      alt: img.alt,
      src: img.currentSrc || img.src,
      slot:
        img.getAttribute("data-site-image") ||
        img.closest("[data-site-image]")?.getAttribute("data-site-image"),
    }),
  ),
);

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  for (const route of ["/highlights", "/charter"]) {
    const key = `${route === "/highlights" ? "hl" : "ch"}-${vp.name}`;
    const path = await shot(page, key, route);
    report.screenshots.push(path);

    const overflow = await page.evaluate(() => ({
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    report.overflow[key] = overflow;

    if (vp.w <= 1024) {
      const pin = await page.evaluate(() => {
        const pinned = [...document.querySelectorAll(".pin-spacer")];
        return {
          pinSpacers: pinned.length,
          desktopTimeline:
            getComputedStyle(
              document.querySelector(".hl-timeline__desktop") || document.body,
            ).display !== "none" && !!document.querySelector(".hl-timeline__desktop"),
        };
      });
      report.pinsAtPhone[key] = pin;
    }
  }
}

/* Signature motion frame sequences */
report.frames.hlTimelineDesktop = await captureScrollFrames(page, {
  label: "hl-timeline-d",
  route: "/highlights",
  viewport: { width: 1440, height: 900 },
  selector: ".hl-timeline__runway, [data-hl-timeline-stack], .hl-timeline",
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
  selector: "[data-hl-stack-chapter], .hl-chapter",
  steps: 10,
});

report.frames.chChapterPhone = await captureScrollFrames(page, {
  label: "ch-chapter-p",
  route: "/charter",
  viewport: { width: 390, height: 844 },
  selector: "[data-ch-chapters]",
  steps: 12,
});

/* Reduced motion */
const rm = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 1440, height: 900 },
});
const rp = await rm.newPage();
await rp.goto(`${BASE}/highlights`, { waitUntil: "networkidle" });
await rp.waitForTimeout(800);
report.reducedMotion.highlights = await rp.evaluate(() => {
  const veil = document.querySelector("[data-hl-hero-veil]");
  const stack = document.querySelector(".hl-timeline__stack");
  const desktop = document.querySelector(".hl-timeline__desktop");
  return {
    veilDisplay: veil ? getComputedStyle(veil).display : null,
    stackDisplay: stack ? getComputedStyle(stack).display : null,
    desktopDisplay: desktop ? getComputedStyle(desktop).display : null,
    heroTitleVisible: !!document.querySelector(".hl-hero h1")?.textContent?.trim(),
  };
});
await rp.screenshot({ path: join(OUT, "hl-reduced-motion.png") });
await rp.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await rp.waitForTimeout(800);
report.reducedMotion.charter = await rp.evaluate(() => {
  const veil = document.querySelector("[data-ch-hero-veil]");
  return {
    veilDisplay: veil ? getComputedStyle(veil).display : null,
    chaptersActive: document.querySelectorAll(".ch-chapters__item.is-active").length,
    heroTitle: document.querySelector(".ch-hero h1")?.textContent?.trim() || null,
  };
});
await rp.screenshot({ path: join(OUT, "ch-reduced-motion.png") });
await rm.close();

/* Keyboard routes */
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
await page.locator("#charter-itinerary").scrollIntoViewIfNeeded();
const radios = page.locator('.ch-routes__input, input[type="radio"]');
const radioCount = await radios.count();
if (radioCount > 1) {
  await radios.nth(1).focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
}
report.keyboardRoutes = {
  radioCount,
  checked: await page.evaluate(
    () =>
      document.querySelector(".ch-routes__list li.is-active, input[type=radio]:checked")
        ?.textContent?.trim()
        ?.slice(0, 80) || null,
  ),
};

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log("status", report.status);
console.log("fonts.hl", JSON.stringify(report.fonts.highlights, null, 2));
console.log("fonts.ch", JSON.stringify(report.fonts.charter, null, 2));
console.log("images.hl", report.imageSlots.highlights);
console.log("images.ch", report.imageSlots.charter);
console.log("reduced", report.reducedMotion);
console.log("overflow flags", Object.entries(report.overflow).filter(([, v]) => v.overflow));
console.log("done", OUT);
await browser.close();
