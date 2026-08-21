import { chromium } from "playwright";
import fs from "fs";
import sharp from "sharp";

const url = process.argv[2] || "http://localhost:3010/";
const out = "scripts/qa-gold-svg-out";
fs.mkdirSync(out, { recursive: true });

function clip(box) {
  return {
    x: Math.max(0, box.x - 40),
    y: Math.max(0, box.y - 30),
    width: Math.min(1100, box.width + 80),
    height: Math.min(340, box.height + 70),
  };
}

async function analyzePng(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let n = 0,
    whiteish = 0,
    bright = 0,
    mid = 0,
    dark = 0,
    maxL = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = info.channels === 4 ? data[i + 3] : 255;
    if (a < 50) continue;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (r < 8 && g < 8 && b < 8) continue;
    n++;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (L > maxL) maxL = L;
    if (L > 230 && b > 180) whiteish++;
    else if (L > 175) bright++;
    else if (L > 90) mid++;
    else dark++;
  }
  return {
    n,
    whiteish,
    bright,
    mid,
    dark,
    maxL: +maxL.toFixed(1),
    whitePct: n ? +(whiteish / n).toFixed(3) : 0,
    brightPct: n ? +(bright / n).toFixed(3) : 0,
    darkPct: n ? +(dark / n).toFixed(3) : 0,
  };
}

async function freezePhase(page, phase) {
  await page.evaluate((p) => {
    const grad = document.querySelector(
      ".luxuryGoldHeroTitle__svg linearGradient"
    );
    const svg = document.querySelector(".luxuryGoldHeroTitle__svg");
    if (!grad || !svg) return;
    const w = Number(svg.getAttribute("width") || 700);
    const period = Math.max(40, w * 0.11);
    const pauseTx = -period * 0.42;
    const travel = w * 1.05;
    const map = {
      pause: pauseTx,
      welcome: pauseTx - travel * 0.3,
      aboard: pauseTx - travel * 0.68,
    };
    grad.setAttribute("data-freeze-tx", String(map[p] ?? pauseTx));
  }, phase);
  await page.waitForTimeout(120);
}

async function withBlackBackdrop(page, fn) {
  await page.evaluate(() => {
    const svg = document.querySelector(".luxuryGoldHeroTitle__svg");
    if (!svg || svg.querySelector("[data-probe-bg]")) return;
    const vb = (svg.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(Number);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("data-probe-bg", "1");
    rect.setAttribute("x", String(vb[0]));
    rect.setAttribute("y", String(vb[1]));
    rect.setAttribute("width", String(vb[2]));
    rect.setAttribute("height", String(vb[3]));
    rect.setAttribute("fill", "#000");
    svg.insertBefore(rect, svg.firstChild);
  });
  const result = await fn();
  await page.evaluate(() => {
    document.querySelector("[data-probe-bg]")?.remove();
  });
  return result;
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 60000 });
  await page.waitForTimeout(1600);

  const meta = await page.evaluate(() => {
    const texts = document.querySelectorAll(".luxuryGoldHeroTitle__svg text");
    const white = document.querySelector(".hero-line--right");
    const t = texts[0];
    return {
      svgTextCount: texts.length,
      label: t?.textContent?.trim() || "",
      dataText: document.querySelectorAll("[data-text]").length,
      font: getComputedStyle(t).fontFamily,
      fontSize: getComputedStyle(t).fontSize,
      white: white?.textContent?.trim() || "",
    };
  });

  const shots = {};
  const pixels = {};
  for (const phase of ["pause", "welcome", "aboard"]) {
    await freezePhase(page, phase);
    const box = await page.locator(".luxuryGoldHeroTitle__svg").boundingBox();
    const path = `${out}/${vp.name}-${phase}.png`;
    await page.screenshot({ path, clip: clip(box) });
    shots[phase] = path;

    pixels[phase] = await withBlackBackdrop(page, async () => {
      const buf = await page.locator(".luxuryGoldHeroTitle__svg").screenshot();
      fs.writeFileSync(`${out}/${vp.name}-${phase}-probe.png`, buf);
      return await analyzePng(buf);
    });
  }

  await page.evaluate(() => {
    document
      .querySelector(".luxuryGoldHeroTitle__svg linearGradient")
      ?.removeAttribute("data-freeze-tx");
  });

  const transforms = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(450);
    transforms.push(
      await page.evaluate(
        () =>
          document
            .querySelector(".luxuryGoldHeroTitle__svg linearGradient")
            ?.getAttribute("gradientTransform") || ""
      )
    );
  }
  {
    const box = await page.locator(".luxuryGoldHeroTitle__svg").boundingBox();
    await page.screenshot({
      path: `${out}/${vp.name}-live.png`,
      clip: clip(box),
    });
    shots.live = `${out}/${vp.name}-live.png`;
  }

  report.push({ viewport: vp.name, meta, shots, pixels, transforms });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
