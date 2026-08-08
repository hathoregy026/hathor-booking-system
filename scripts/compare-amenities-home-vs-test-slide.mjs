/**
 * Compare homepage amenities region vs /test-slide (Springs source of truth).
 *
 * Reports:
 * - Whether homepage still mounts the React sequence or the iframe clone
 * - Visible media / gold / cream coverage at key scroll samples
 * - Whether blank cream is the iframe host vs missing React chapters
 * - Console/page errors on each URL
 *
 * Usage:
 *   node scripts/compare-amenities-home-vs-test-slide.mjs
 *   node scripts/compare-amenities-home-vs-test-slide.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import fs from "node:fs";

const baseArg = process.argv.find((a) => a.startsWith("--base="));
const BASE = (baseArg?.split("=")[1] || "https://hathor-booking-system.vercel.app").replace(
  /\/$/,
  "",
);
const stamp = Date.now();

function isCream([r, g, b]) {
  return r > 210 && g > 200 && b > 190 && Math.abs(r - g) < 35;
}
function isGold([r, g, b]) {
  return r > 140 && r < 220 && g > 120 && g < 200 && b < 140 && r > g && g > b;
}

async function samplePage(page, label, url, findScrollY) {
  const errors = [];
  const onErr = (e) => errors.push(`pageerror:${e.message || e}`);
  const onCon = (m) => {
    if (m.type() === "error") errors.push(`console:${m.text()}`);
  };
  page.on("pageerror", onErr);
  page.on("console", onCon);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3500);

  const mount = await page.evaluate(() => {
    const iframe = document.querySelector(
      ".home-am-springs-frame, iframe[title='Hathor amenities']",
    );
    const host = document.querySelector(
      "[data-home-amenities-springs], .home-am-springs-host",
    );
    const reactRoot = document.querySelector(
      ".home-am-sequence, #home-am-slider, #home-am-opening, #home-am-intro",
    );
    const springsIntro = document.querySelector("#i-intro, #i-video, #i-slider");
    return {
      mode: iframe
        ? "iframe-clone"
        : reactRoot
          ? "react-sequence"
          : springsIntro
            ? "springs-document"
            : "unknown",
      iframeSrc: iframe?.getAttribute("src") || null,
      hostH: host ? Math.round(host.getBoundingClientRect().height) : 0,
      reactPresent: !!reactRoot,
      springsPresent: !!springsIntro,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });

  const y = await page.evaluate(findScrollY);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(500);

  const shot = `.tmp-compare-${label}.png`;
  await page.screenshot({ path: shot, fullPage: false });

  const pixels = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const w = 1440;
    const h = 900;
    /* approximate via elementFromPoint grid — no screenshot decode needed */
    const cells = [];
    for (let py = 120; py < 820; py += 80) {
      for (let px = 40; px < 1400; px += 80) {
        const el = document.elementFromPoint(px, py);
        if (!el) continue;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        const tag = el.tagName;
        const cls = (el.className || "").toString().slice(0, 40);
        cells.push({ px, py, tag, cls, bg });
      }
    }
    const imgs = [...document.querySelectorAll("img")].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < innerHeight;
    }).length;
    const videos = document.querySelectorAll("video, iframe").length;
    return { cells: cells.slice(0, 40), visibleImgs: imgs, embeds: videos };
  });

  /* Pixel cream/gold from screenshot */
  const buf = await page.screenshot();
  const b64 = buf.toString("base64");
  await page.setContent(`<img id="i" src="data:image/png;base64,${b64}"/>`);
  const coverage = await page.evaluate(async () => {
    const img = document.getElementById("i");
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let cream = 0;
    let gold = 0;
    let other = 0;
    const step = 24;
    for (let y = 80; y < c.height - 40; y += step) {
      for (let x = 20; x < c.width - 20; x += step) {
        const d = ctx.getImageData(x, y, 1, 1).data;
        const rgb = [d[0], d[1], d[2]];
        const creamish =
          rgb[0] > 210 &&
          rgb[1] > 200 &&
          rgb[2] > 190 &&
          Math.abs(rgb[0] - rgb[1]) < 35;
        const goldish =
          rgb[0] > 140 &&
          rgb[0] < 220 &&
          rgb[1] > 120 &&
          rgb[1] < 200 &&
          rgb[2] < 140 &&
          rgb[0] > rgb[1];
        if (creamish) cream++;
        else if (goldish) gold++;
        else other++;
      }
    }
    const total = cream + gold + other || 1;
    return {
      creamPct: Math.round((cream / total) * 100),
      goldPct: Math.round((gold / total) * 100),
      otherPct: Math.round((other / total) * 100),
    };
  });

  page.removeListener("pageerror", onErr);
  page.removeListener("console", onCon);

  return {
    label,
    url: url.split("?")[0],
    scrollY: y,
    mount,
    coverage,
    visibleImgs: pixels.visibleImgs,
    embeds: pixels.embeds,
    errors: errors.slice(0, 12),
    screenshot: shot,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const home = await samplePage(
  page,
  "home",
  `${BASE}/?fresh=${stamp}`,
  () => {
    const host =
      document.querySelector("[data-home-amenities-springs], .home-am-springs-host") ||
      document.querySelector(".home-am-sequence, #home-am-intro, #home-am-slider");
    if (!host) return Math.round(document.body.scrollHeight * 0.45);
    return Math.round(host.getBoundingClientRect().top + window.scrollY + 200);
  },
);

const testSlide = await samplePage(
  page,
  "test-slide",
  `${BASE}/test-slide?fresh=${stamp}`,
  () => {
    const el =
      document.querySelector("#i-video") ||
      document.querySelector("#i-intro") ||
      document.querySelector("#i-slider");
    if (!el) return 800;
    return Math.round(el.getBoundingClientRect().top + window.scrollY + 400);
  },
);

const clone = await samplePage(
  page,
  "clone-direct",
  `${BASE}/home-amenities-springs/index.html?fresh=${stamp}`,
  () => {
    const el = document.querySelector("#i-intro, #i-video");
    if (!el) return 200;
    return Math.round(el.getBoundingClientRect().top + window.scrollY + 300);
  },
);

await browser.close();

const report = {
  base: BASE,
  stamped: stamp,
  home,
  testSlide,
  clone,
  diagnosis: [],
};

if (home.mount.mode === "iframe-clone" && home.coverage.creamPct > 70) {
  report.diagnosis.push(
    "CRITICAL: Homepage mounts iframe clone but viewport is mostly cream — clone likely stuck on Springs not-ready/preloader or iframe failed to paint.",
  );
}
if (home.mount.mode === "iframe-clone") {
  report.diagnosis.push(
    "Homepage is using iframe-clone mode (not react-sequence). /test-slide remains the working Springs oracle.",
  );
}
if (testSlide.coverage.otherPct + testSlide.coverage.goldPct > 40) {
  report.diagnosis.push(
    "OK: /test-slide shows substantial non-cream content (source page still healthy).",
  );
}
if (clone.coverage.creamPct > 70 && testSlide.coverage.creamPct < 50) {
  report.diagnosis.push(
    "Clone HTML direct URL is blank-cream while /test-slide is not — build slice or theme CSS broke the clone document (not other homepage elements).",
  );
}
if (clone.coverage.otherPct + clone.coverage.goldPct > 40) {
  report.diagnosis.push(
    "Clone document itself paints content when opened directly — homepage blank is likely host/embed/Lenis interaction, not missing Springs assets.",
  );
}
if (!home.mount.reactPresent && home.mount.mode === "iframe-clone") {
  report.diagnosis.push(
    "React amenities chapters are absent on homepage — blank region is the clone host, not an unrelated hero/carousel element covering amenities.",
  );
}

const out = ".tmp-amenities-compare-report.json";
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`\nWrote ${out}`);
console.log("Screenshots:", home.screenshot, testSlide.screenshot, clone.screenshot);
