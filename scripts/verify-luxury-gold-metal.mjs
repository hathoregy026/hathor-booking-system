import { chromium } from "playwright";

const viewports = [
  { name: "desktop", width: 1440, height: 900, sampleMs: 15000 },
  { name: "tablet-land", width: 1024, height: 768, sampleMs: 5000 },
  { name: "tablet-port", width: 768, height: 1024, sampleMs: 5000 },
  { name: "phone-390", width: 390, height: 844, sampleMs: 5000 },
  { name: "phone-360", width: 360, height: 800, sampleMs: 5000 },
];

const url = process.argv[2] || "http://localhost:3010/";

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 60000 });
  await page.waitForTimeout(1200);

  const samples = [];
  const start = Date.now();
  while (Date.now() - start < vp.sampleMs) {
    const snap = await page.evaluate(() => {
      const textEl = document.querySelector(".luxuryGoldHeroTitle__text");
      const white = document.querySelector(".hero-line--right");
      const outer = document.querySelector(".hero-line--left");
      if (!textEl || !outer) return null;
      const cs = getComputedStyle(textEl);
      const before = getComputedStyle(textEl, "::before");
      const after = getComputedStyle(textEl, "::after");
      return {
        text: (textEl.textContent || "").trim(),
        dataText: document.querySelectorAll("[data-text]").length,
        animName: cs.animationName,
        animDuration: cs.animationDuration,
        bgSize: cs.backgroundSize,
        bgPos: cs.backgroundPosition,
        blend: cs.backgroundBlendMode,
        fill: cs.webkitTextFillColor,
        gradCount: (cs.backgroundImage.match(/linear-gradient/g) || []).length,
        before: before.content,
        after: after.content,
        filter: cs.filter,
        textShadow: cs.textShadow,
        whiteText: white?.textContent?.trim() || "",
        whiteFill: white ? getComputedStyle(white).webkitTextFillColor : "",
        whiteColor: white ? getComputedStyle(white).color : "",
      };
    });
    if (snap) samples.push(snap);
    await page.waitForTimeout(400);
  }

  const first = samples[0];
  const positions = [...new Set(samples.map((s) => s.bgPos))];
  const firstLayerXs = positions.map((p) => parseFloat(String(p).split(",")[0]));
  const moved =
    positions.length > 2 &&
    firstLayerXs.some((x) => x >= 100) &&
    firstLayerXs.some((x) => x <= 0);

  const noneish = (v) => v === "none" || v === "normal";
  const ok =
    !!first &&
    first.animName.includes("luxuryGoldMetalSweep") &&
    first.gradCount >= 5 &&
    String(first.fill).includes("0, 0, 0, 0") &&
    first.dataText === 0 &&
    noneish(first.before) &&
    noneish(first.after) &&
    (first.filter === "none" || !first.filter) &&
    (first.textShadow === "none" || first.textShadow === "") &&
    moved &&
    !!first.whiteText &&
    !String(first.whiteFill || "").includes("0, 0, 0, 0") &&
    String(first.blend).includes("screen");

  results.push({
    viewport: vp.name,
    ok,
    sampleMs: vp.sampleMs,
    text: first?.text,
    animName: first?.animName,
    animDuration: first?.animDuration,
    bgSize: first?.bgSize,
    gradCount: first?.gradCount,
    blend: first?.blend,
    positionCount: positions.length,
    uniqueBgPositions: positions.slice(0, 8),
    moved,
    whiteText: first?.whiteText,
    whiteFill: first?.whiteFill,
  });

  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
