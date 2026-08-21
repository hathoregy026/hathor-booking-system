import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser
  .newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  })
  .then((c) => c.newPage());

await page.goto(
  `https://hathor-booking-system.vercel.app/?_v=${Date.now()}`,
  { waitUntil: "domcontentloaded", timeout: 60000 },
);
await page.waitForFunction(
  () =>
    window.__hathorLenis &&
    document.documentElement.classList.contains("has-ex-scroll-motion"),
  { timeout: 30000 },
);
await page.waitForTimeout(1500);

const hasSpacer = await page.evaluate(
  () => !!document.querySelector(".pin-spacer-hcta-stage"),
);
console.log("pinSpacer", hasSpacer);

for (const frac of [0, 0.15, 0.35, 0.55, 0.8, 0.95]) {
  await page.evaluate((f) => {
    const track = document.querySelector("[data-hcta-track]");
    const y =
      track.getBoundingClientRect().top +
      window.__hathorLenis.scroll +
      (track.offsetHeight - innerHeight) * f;
    window.__hathorLenis.scrollTo(y, { immediate: true });
  }, frac);
  await page.waitForTimeout(1300);
  const snap = await page.evaluate((f) => {
    const frame = document.querySelector("[data-hcta-frame]");
    const reveal = document.querySelector("[data-hcta-reveal]");
    const sc = document.querySelector(".hcta-silk-char");
    const style = reveal?.getAttribute("style") || "";
    const yPct =
      style.match(/translate\(([^)]+)\)/)?.[1] ||
      getComputedStyle(reveal).transform;
    const rr = reveal.getBoundingClientRect();
    return {
      f,
      frameTop: Math.round(frame.getBoundingClientRect().top),
      silk: sc ? getComputedStyle(sc).opacity : null,
      silkTxt: (document.querySelector("[data-hcta-silk]")?.innerText || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 28),
      revealY: yPct,
      revealVis: +(
        Math.max(0, Math.min(innerHeight, rr.bottom) - Math.max(0, rr.top)) /
        innerHeight
      ).toFixed(2),
      title: document.querySelector(".hcta-heading .hcta-char")
        ? getComputedStyle(
            document.querySelector(".hcta-heading .hcta-char"),
          ).opacity
        : null,
    };
  }, frac);
  console.log(JSON.stringify(snap));
}

await page.evaluate(() => {
  const track = document.querySelector("[data-hcta-track]");
  const y =
    track.getBoundingClientRect().top +
    window.__hathorLenis.scroll +
    (track.offsetHeight - innerHeight) * 0.2;
  window.__hathorLenis.scrollTo(y, { immediate: true });
});
await page.waitForTimeout(1500);
await page.screenshot({ path: "scripts/out-hcta-restored.png" });
await browser.close();
