import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3013/cruises", { waitUntil: "networkidle" });

const samples = [];
for (let y = 1200; y <= 2800; y += 100) {
  await page.evaluate((scrollY) => scrollTo(0, scrollY), y);
  await page.waitForTimeout(350);
  const m = await page.evaluate(() => {
    const title = document.querySelector(".pt-sheet__landing-title");
    const t = title?.getBoundingClientRect();
    const pastPin = document.querySelector("[data-cruises-transition]")?.classList.contains("hathor-page-scroll--past-pin");
    const pinH = document.querySelector(".pin-spacer")?.offsetHeight;
    return {
      pastPin,
      pinH,
      titleTop: t ? Math.round(t.top) : null,
    };
  });
  samples.push({ y, ...m });
}

// Detect frozen stretches (same titleTop for consecutive samples)
let frozen = 0;
let maxFrozen = 0;
for (let i = 1; i < samples.length; i++) {
  if (samples[i].titleTop === samples[i - 1].titleTop && samples[i].titleTop !== null) {
    frozen++;
    maxFrozen = Math.max(maxFrozen, frozen);
  } else {
    frozen = 0;
  }
}

console.log("pinSpacerH", samples.at(-1)?.pinH);
console.log("maxConsecutiveFrozenSteps", maxFrozen);
console.log("samples", samples.filter((_, i) => i % 2 === 0));

await browser.close();
