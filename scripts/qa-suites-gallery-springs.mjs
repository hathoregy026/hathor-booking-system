import { chromium } from "playwright";
import fs from "fs";

const local = process.env.SUITES_URL || "http://127.0.0.1:3000/suites-springs/index.html";
const springs =
  process.env.SPRINGS_URL ||
  "https://springs.estate/";

async function measure(page, label) {
  await page.waitForTimeout(2500);
  return page.evaluate((label) => {
    const items = [...document.querySelectorAll(".js-gallery-item")];
    const content = document.querySelector(".l-gallery__content");
    const gallery = document.querySelector(".l-gallery");
    const cs = content ? getComputedStyle(content) : null;
    const rows = { 1: [], 2: [], 3: [] };
    items.forEach((el, i) => {
      const lane = i >= 13 ? 3 : i >= 6 ? 2 : 1;
      const r = el.getBoundingClientRect();
      const t = el.style.transform || "";
      rows[lane].push({
        i,
        t,
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        visible:
          r.bottom > 0 &&
          r.right > 0 &&
          r.top < window.innerHeight &&
          r.left < window.innerWidth,
      });
    });
    const imgs = [...document.querySelectorAll(".l-gallery__item picture.img-full img")].slice(0, 6).map((img) => ({
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      src: (img.currentSrc || img.src || "").slice(-60),
      complete: img.complete,
    }));
    return {
      label,
      vw: window.innerWidth,
      vh: window.innerHeight,
      itemCount: items.length,
      content: cs
        ? {
            width: cs.width,
            height: cs.height,
            top: cs.top,
            left: cs.left,
            transform: cs.transform,
            transformOrigin: cs.transformOrigin,
            opacity: cs.opacity,
          }
        : null,
      gallery: gallery
        ? {
            w: gallery.getBoundingClientRect().width,
            h: gallery.getBoundingClientRect().height,
          }
        : null,
      rows,
      imgs,
      firstHeight: items[0]?.offsetHeight ?? null,
    };
  }, label);
}

const browser = await chromium.launch({ headless: true });
const results = {};

for (const [label, url] of [
  ["local", local],
  ["springs", springs],
]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // dismiss cookie if any
    await page.waitForTimeout(1000);
    results[label] = await measure(page, label);
    await page.screenshot({
      path: `scripts/out-${label}-gallery.png`,
      fullPage: false,
    });
  } catch (e) {
    results[label] = { error: String(e) };
  }
  await page.close();
}

fs.writeFileSync("scripts/out-gallery-compare.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
