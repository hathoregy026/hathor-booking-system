import { chromium } from "playwright";
import fs from "fs";

const url = process.argv[2] || "http://localhost:3010/";
const outDir = "scripts/qa-gold-clear-out";
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900, watchMs: 15000 },
  { name: "tablet", width: 1024, height: 768, watchMs: 5000 },
  { name: "phone", width: 390, height: 844, watchMs: 5000 },
];

function clipAround(box) {
  return {
    x: Math.max(0, box.x - 40),
    y: Math.max(0, box.y - 30),
    width: Math.min(920, box.width + 80),
    height: Math.min(300, box.height + 60),
  };
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 60000 });
  await page.waitForTimeout(1000);

  const meta = await page.evaluate(() => {
    const el = document.querySelector(".luxuryGoldHeroTitle__text");
    const white = document.querySelector(".hero-line--right");
    const cs = getComputedStyle(el);
    return {
      animName: cs.animationName,
      animDuration: cs.animationDuration,
      blend: cs.backgroundBlendMode,
      layerCount: (cs.backgroundImage.match(/linear-gradient/g) || []).length,
      bgSize: cs.backgroundSize,
      fill: cs.webkitTextFillColor,
      font: cs.fontFamily,
      size: cs.fontSize,
      dataText: document.querySelectorAll("[data-text]").length,
      text: (el.textContent || "").trim(),
      white: white?.textContent?.trim() || "",
      whiteFill: white ? getComputedStyle(white).webkitTextFillColor : "",
    };
  });

  const captures = { pause: null, welcome: null, aboard: null };
  const start = Date.now();
  while (Date.now() - start < vp.watchMs) {
    const snap = await page.evaluate(() => {
      const el = document.querySelector(".luxuryGoldHeroTitle__text");
      const cs = getComputedStyle(el);
      const firstX = parseFloat(cs.backgroundPosition.split(",")[0]);
      return { firstX, pos: cs.backgroundPosition };
    });

    // Pause: reflection parked at ~135%
    if (!captures.pause && snap.firstX > 120) {
      const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
      const path = `${outDir}/${vp.name}-pause.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.pause = { path, firstX: snap.firstX };
    }
    // Crossing Welcome: mid-right of word (~70-95)
    if (!captures.welcome && snap.firstX > 70 && snap.firstX < 100) {
      const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
      const path = `${outDir}/${vp.name}-welcome.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.welcome = { path, firstX: snap.firstX };
    }
    // Crossing Aboard: mid-left (~10-40)
    if (!captures.aboard && snap.firstX > 5 && snap.firstX < 45) {
      const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
      const path = `${outDir}/${vp.name}-aboard.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.aboard = { path, firstX: snap.firstX };
    }

    if (captures.pause && captures.welcome && captures.aboard) break;
    await page.waitForTimeout(60);
  }

  // Force remaining captures if timing missed
  if (!captures.pause || !captures.welcome || !captures.aboard) {
    const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
    if (!captures.pause) {
      const path = `${outDir}/${vp.name}-pause.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.pause = { path, firstX: "forced" };
    }
    if (!captures.welcome) {
      const path = `${outDir}/${vp.name}-welcome.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.welcome = { path, firstX: "forced" };
    }
    if (!captures.aboard) {
      const path = `${outDir}/${vp.name}-aboard.png`;
      await page.screenshot({ path, clip: clipAround(box) });
      captures.aboard = { path, firstX: "forced" };
    }
  }

  report.push({ viewport: vp.name, meta, captures });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
