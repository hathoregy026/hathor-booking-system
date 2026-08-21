import { chromium } from "playwright";

const base = process.argv[2] ?? "https://hathor-booking-system.vercel.app";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`${base}/cruises`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("[data-cruises-transition]", { timeout: 30000 });
await page.waitForTimeout(2500);

const st = await page.evaluate(() => {
  const root = document.querySelector("[data-cruises-transition]");
  const top = root.getBoundingClientRect().top + window.scrollY;
  const pinDist = window.innerHeight * 4.2 * 0.7;
  return { top, pinDist };
});

console.log("base", base, st);

for (const pct of [0.7, 0.85, 0.95, 0.98, 0.995, 1.0]) {
  await page.evaluate(
    (args) => window.scrollTo(0, args.top + args.pinDist * args.pct),
    { ...st, pct },
  );
  await page.waitForTimeout(500);
  const snap = await page.evaluate(() => {
    const root = document.querySelector("[data-cruises-transition]");
    const sheet = document.querySelector(".cruises-sheet-runway");
    const followerTitle = document.querySelector(
      ".cruises-sheet-follower .pt-sheet__landing-title",
    );
    const contentTitle = document.querySelector(
      ".cruises-content-layer .pt-sheet__landing-title",
    );
    const filters = document.querySelector(".cruises-content-layer .pt-sheet__filters");
    const content = document.querySelector(".cruises-content-layer");
    const cs = sheet ? getComputedStyle(sheet) : null;
    const contentVis = content ? getComputedStyle(content).visibility : "n/a";
    const title = contentVis === "visible" ? contentTitle : followerTitle;
    return {
      sheetTop: sheet?.getBoundingClientRect().top?.toFixed(1),
      radius: cs?.borderTopLeftRadius,
      sheetOp: cs?.opacity,
      titleTop: title?.getBoundingClientRect().top?.toFixed(1),
      filtersTop: filters?.getBoundingClientRect().top?.toFixed(1),
      gap:
        title && filters && contentVis === "visible"
          ? (
              filters.getBoundingClientRect().top -
              title.getBoundingClientRect().bottom
            ).toFixed(1)
          : null,
      gold: root?.classList.contains("hathor-page-scroll--gold-complete"),
      pastPin: root?.classList.contains("hathor-page-scroll--past-pin"),
      contentVis,
      contentMargin: content ? getComputedStyle(content).marginTop : null,
    };
  });
  console.log("pct", pct, JSON.stringify(snap));
}

await browser.close();
