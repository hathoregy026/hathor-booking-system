import { chromium } from "playwright";
import fs from "fs";

const url = process.argv[2] || "http://localhost:3010/";
const out = "scripts/qa-gold-base-out";
fs.mkdirSync(out, { recursive: true });

function clip(box) {
  return {
    x: Math.max(0, box.x - 40),
    y: Math.max(0, box.y - 30),
    width: Math.min(920, box.width + 80),
    height: Math.min(300, box.height + 60),
  };
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 60000 });
  await page.waitForTimeout(800);

  const meta = await page.evaluate(() => {
    const el = document.querySelector(".luxuryGoldHeroTitle__text");
    const cs = getComputedStyle(el);
    const after = getComputedStyle(el, "::after");
    const white = document.querySelector(".hero-line--right");
    return {
      text: (el.textContent || "").trim(),
      textNodes: el.childNodes.length,
      dataText: document.querySelectorAll("[data-text]").length,
      afterContent: after.content,
      afterAnim: after.animationName,
      afterBgPos: after.backgroundPosition,
      afterBgSize: after.backgroundSize,
      afterClip: after.webkitBackgroundClip || after.backgroundClip,
      baseBg: cs.backgroundImage.slice(0, 180),
      baseLayers: (cs.backgroundImage.match(/linear-gradient/g) || []).length,
      font: cs.fontFamily,
      size: cs.fontSize,
      white: white?.textContent?.trim(),
      whiteFill: white ? getComputedStyle(white).webkitTextFillColor : "",
    };
  });

  // Pause: ::after reflection parked (~130%)
  let pauseShot = null;
  let sweepShot = null;
  const start = Date.now();
  while (Date.now() - start < 12000) {
    const pos = await page.evaluate(() => {
      const after = getComputedStyle(
        document.querySelector(".luxuryGoldHeroTitle__text"),
        "::after",
      );
      return parseFloat(after.backgroundPosition);
    });
    const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
    if (!pauseShot && pos > 100) {
      const path = `${out}/${vp.name}-pause.png`;
      await page.screenshot({ path, clip: clip(box) });
      pauseShot = { path, pos };
    }
    if (!sweepShot && pos > 20 && pos < 80) {
      const path = `${out}/${vp.name}-sweep.png`;
      await page.screenshot({ path, clip: clip(box) });
      sweepShot = { path, pos };
    }
    if (pauseShot && sweepShot) break;
    await page.waitForTimeout(70);
  }

  if (!pauseShot || !sweepShot) {
    const box = await page.locator(".luxuryGoldHeroTitle__text").boundingBox();
    if (!pauseShot) {
      const path = `${out}/${vp.name}-pause.png`;
      await page.screenshot({ path, clip: clip(box) });
      pauseShot = { path, pos: "forced" };
    }
    if (!sweepShot) {
      const path = `${out}/${vp.name}-sweep.png`;
      await page.screenshot({ path, clip: clip(box) });
      sweepShot = { path, pos: "forced" };
    }
  }

  results.push({ viewport: vp.name, meta, pauseShot, sweepShot });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
