import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3013";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`${base}/cruises`, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(3000);
await page.waitForSelector(".cruises-content-section .hathor-cruise-card", {
  timeout: 60000,
});

const vh = 800;
const revealEnd = Math.round(vh * 2.94);
const scrollPositions = [
  revealEnd + 100,
  revealEnd + 400,
  revealEnd + 800,
  revealEnd + 1200,
];

const results = [];

for (const scrollY of scrollPositions) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(300);

  const card = page.locator(".cruises-content-section .hathor-cruise-card").first();
  const count = await card.count();
  if (!count) {
    results.push({ scrollY, error: "no card" });
    continue;
  }

  const box = await card.boundingBox();
  if (!box) {
    results.push({ scrollY, error: "no box" });
    continue;
  }

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx, cy);
  await page.waitForTimeout(100);

  const before = await card.boundingBox();
  await page.evaluate(() => window.scrollBy(0, 40));
  await page.waitForTimeout(150);
  const after = await card.boundingBox();

  const meta = await card.evaluate((el) => {
    let node = el.parentElement;
    let parentTransform = null;
    while (node) {
      const t = getComputedStyle(node).transform;
      if (t && t !== "none") {
        parentTransform = { className: node.className, transform: t };
        break;
      }
      node = node.parentElement;
    }
    return {
      inFollower: !!el.closest(".cruises-sheet-follower, .cruises-reveal-follower"),
      inContentSection: !!el.closest(".cruises-content-section"),
      parentTransform,
    };
  });

  const drift = Math.abs((after?.y ?? 0) - (before?.y ?? 0) - 40);

  results.push({
    scrollY,
    ...meta,
    hoverDriftPx: drift,
    stable: meta.inContentSection && !meta.inFollower && !meta.parentTransform && drift < 8,
  });
}

console.log(JSON.stringify({ revealEnd, results }, null, 2));
await browser.close();
