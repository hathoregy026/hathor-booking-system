import { chromium } from "playwright";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet-land", width: 1024, height: 768 },
  { name: "tablet-port", width: 768, height: 1024 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-360", width: 360, height: 800 },
];

const url = process.argv[2] || "http://localhost:3000/";

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
  });
  await page.goto(url, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForSelector(".luxuryGoldHeroTitle__text", { timeout: 60000 });
  await page.waitForTimeout(1500);

  const sampleMs = vp.name === "desktop" ? 12000 : 4000;
  const samples = [];
  const start = Date.now();
  while (Date.now() - start < sampleMs) {
    const snap = await page.evaluate(() => {
      const textEl = document.querySelector(".luxuryGoldHeroTitle__text");
      const wrap = document.querySelector(".luxuryGoldHeroTitle");
      const outer = document.querySelector(".hero-line--left");
      const white = document.querySelector(".hero-line--right");
      if (!textEl || !wrap || !outer) return null;
      const cs = getComputedStyle(textEl);
      const before = getComputedStyle(textEl, "::before");
      const after = getComputedStyle(textEl, "::after");
      const wrapBefore = getComputedStyle(wrap, "::before");
      const wrapAfter = getComputedStyle(wrap, "::after");
      const title = (textEl.textContent || "").trim();
      return {
        text: title,
        dataTextCount: document.querySelectorAll("[data-text]").length,
        animName: cs.animationName,
        animDuration: cs.animationDuration,
        bgSize: cs.backgroundSize,
        bgPos: cs.backgroundPosition,
        fill: cs.webkitTextFillColor,
        bgImageCount: (cs.backgroundImage.match(/linear-gradient/g) || [])
          .length,
        beforeContent: before.content,
        afterContent: after.content,
        wrapBefore: wrapBefore.content,
        wrapAfter: wrapAfter.content,
        whiteText: white?.textContent?.trim() || "",
        whiteFill: white ? getComputedStyle(white).webkitTextFillColor : null,
        whiteColor: white ? getComputedStyle(white).color : null,
      };
    });
    if (snap) samples.push(snap);
    await page.waitForTimeout(400);
  }

  const first = samples[0];
  const positions = [...new Set(samples.map((s) => s.bgPos))];
  const xs = positions.map((p) => parseFloat(String(p).split(" ")[0]));
  const layer1Moved =
    positions.length > 2 &&
    xs.some((x) => x >= 100) &&
    xs.some((x) => x <= 0);

  const noneish = (v) => v === "none" || v === "normal";
  const ok =
    !!first &&
    first.animName.includes("luxuryGoldHeroShimmer") &&
    first.bgImageCount >= 2 &&
    String(first.fill).includes("0, 0, 0, 0") &&
    first.dataTextCount === 0 &&
    noneish(first.beforeContent) &&
    noneish(first.afterContent) &&
    noneish(first.wrapBefore) &&
    noneish(first.wrapAfter) &&
    layer1Moved &&
    !!first.whiteText &&
    !String(first.whiteFill || "").includes("0, 0, 0, 0");

  results.push({
    viewport: vp.name,
    ok,
    sampleMs,
    text: first?.text,
    animName: first?.animName,
    animDuration: first?.animDuration,
    bgSize: first?.bgSize,
    bgImageCount: first?.bgImageCount,
    fill: first?.fill,
    dataTextCount: first?.dataTextCount,
    uniqueBgPositions: positions.slice(0, 12),
    positionCount: positions.length,
    layer1Moved,
    beforeContent: first?.beforeContent,
    afterContent: first?.afterContent,
    whiteText: first?.whiteText,
    whiteFill: first?.whiteFill,
  });

  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
process.exit(results.every((r) => r.ok) ? 0 : 1);
