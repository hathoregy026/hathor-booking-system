import { chromium } from "playwright";
import fs from "fs";
import sharp from "sharp";

const url = process.argv[2] || "https://hathor-booking-system.vercel.app/";
const out = "scripts/qa-gold-prod-out";
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
    const vb = (svg.getAttribute("viewBox") || "0 0 100 100")
      .split(/\s+/)
      .map(Number);
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
  { name: "desktop", width: 1440, height: 900, watch: 16000 },
  { name: "tablet", width: 1024, height: 768, watch: 8000 },
  { name: "phone", width: 390, height: 844, watch: 16000 },
  { name: "phone360", width: 360, height: 800, watch: 8000 },
]) {
  const errors = [];
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  page.on("pageerror", (e) => errors.push("page:" + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console:" + m.text());
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 90000 });
  await page.waitForTimeout(2000);

  const meta = await page.evaluate(() => {
    const svg = document.querySelector(".luxuryGoldHeroTitle__svg");
    const texts = document.querySelectorAll(".luxuryGoldHeroTitle__svg text");
    const white = document.querySelector(".hero-line--right");
    const left = document.querySelector(".hero-line--left");
    const t = texts[0];
    const b = t?.getBBox?.();
    const vb = (svg?.getAttribute("viewBox") || "").split(/\s+/).map(Number);
    const pads = b
      ? {
          left: b.x - vb[0],
          top: b.y - vb[1],
          right: vb[0] + vb[2] - (b.x + b.width),
          bottom: vb[1] + vb[3] - (b.y + b.height),
        }
      : null;
    return {
      deployHint: document.documentElement.innerHTML.includes("luxuryGoldHeroTitle__svg"),
      svgTextCount: texts.length,
      label: t?.textContent?.trim() || "",
      dataText: document.querySelectorAll("[data-text]").length,
      fill: t?.getAttribute("fill") || "",
      white: white?.textContent?.trim() || "",
      whiteColor: white ? getComputedStyle(white).color : "",
      leftClass: left?.className || "",
      hasLux: !!left?.querySelector(".luxuryGoldHeroTitle"),
      font: t ? getComputedStyle(t).fontFamily : "",
      fontSize: t ? getComputedStyle(t).fontSize : "",
      svgW: Number(svg?.getAttribute("width") || 0),
      svgH: Number(svg?.getAttribute("height") || 0),
      overflow: svg ? getComputedStyle(svg).overflow : "",
      pads,
      clipped:
        !!pads &&
        (pads.left < -1 || pads.top < -1 || pads.right < -1 || pads.bottom < -1),
      leftTransform: left ? getComputedStyle(left).transform : "",
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
  const positions = [];
  const t0 = Date.now();
  while (Date.now() - t0 < vp.watch) {
    await page.waitForTimeout(500);
    const sample = await page.evaluate(() => {
      const g = document.querySelector(
        ".luxuryGoldHeroTitle__svg linearGradient"
      );
      const left = document.querySelector(".hero-line--left");
      const svg = document.querySelector(".luxuryGoldHeroTitle__svg");
      const r = svg?.getBoundingClientRect();
      return {
        tx: g?.getAttribute("gradientTransform") || "",
        leftTf: left ? getComputedStyle(left).transform : "",
        x: r?.x || 0,
        y: r?.y || 0,
        w: r?.width || 0,
        h: r?.height || 0,
      };
    });
    transforms.push(sample.tx);
    positions.push({ x: sample.x, y: sample.y, w: sample.w, h: sample.h });
  }

  const uniqueTx = [...new Set(transforms.filter(Boolean))];
  const jump =
    positions.length > 1 &&
    positions.some(
      (p, i) =>
        i > 0 &&
        (Math.abs(p.x - positions[0].x) > 2 ||
          Math.abs(p.y - positions[0].y) > 2 ||
          Math.abs(p.w - positions[0].w) > 3 ||
          Math.abs(p.h - positions[0].h) > 3)
    );

  {
    const box = await page.locator(".luxuryGoldHeroTitle__svg").boundingBox();
    await page.screenshot({
      path: `${out}/${vp.name}-live.png`,
      clip: clip(box),
    });
    shots.live = `${out}/${vp.name}-live.png`;
  }

  report.push({
    viewport: vp.name,
    meta,
    shots,
    pixels,
    uniqueTxCount: uniqueTx.length,
    jump,
    errors: errors.filter(
      (e) =>
        !e.includes("400") &&
        !e.includes("favicon") &&
        !e.includes("net::ERR")
    ),
    rawErrorCount: errors.length,
  });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
