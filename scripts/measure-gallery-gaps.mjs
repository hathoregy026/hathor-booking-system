import { chromium } from "playwright";

const url =
  process.env.GALLERY_URL ||
  "https://hathor-booking-system.vercel.app/#gallery";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector(".gallery-item img", { timeout: 60000 });
await page.waitForTimeout(3000);

// Pause animation so rects are stable
await page.addStyleTag({
  content: `
    .gallery-marquee__track { animation: none !important; transform: none !important; }
  `,
});
await page.waitForTimeout(300);

const data = await page.evaluate(() => {
  const group = document.querySelector(".gallery-marquee__group");
  const items = [...(group?.querySelectorAll(".gallery-item") ?? [])];
  const rects = items.map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      i,
      left: +r.left.toFixed(2),
      right: +r.right.toFixed(2),
      top: +r.top.toFixed(2),
      width: +r.width.toFixed(2),
      height: +r.height.toFixed(2),
    };
  });
  const gaps = [];
  for (let i = 0; i < rects.length - 1; i++) {
    gaps.push({
      between: `${i}-${i + 1}`,
      gap: +(rects[i + 1].left - rects[i].right).toFixed(2),
      topDelta: +(rects[i + 1].top - rects[i].top).toFixed(2),
      widthDiff: +(rects[i + 1].width - rects[i].width).toFixed(2),
    });
  }
  const imgs = [...(group?.querySelectorAll(".gallery-item img") ?? [])].map(
    (img) => ({
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      display: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`,
      tag: img.tagName,
      src: (img.currentSrc || img.src).slice(0, 100),
    }),
  );
  const band = document.querySelector(".gallery-marquee__band");
  return {
    gaps,
    gapValues: gaps.map((g) => g.gap),
    gapSpread:
      gaps.length > 0
        ? +(Math.max(...gaps.map((g) => g.gap)) - Math.min(...gaps.map((g) => g.gap))).toFixed(2)
        : null,
    rects,
    imgs,
    bandTransform: band ? getComputedStyle(band).transform : null,
    groupGap: group ? getComputedStyle(group).gap : null,
  };
});

console.log(JSON.stringify(data, null, 2));
await page.screenshot({
  path: "scripts/out-gallery-measure.png",
  clip: { x: 0, y: 180, width: 1440, height: 520 },
});
await browser.close();
