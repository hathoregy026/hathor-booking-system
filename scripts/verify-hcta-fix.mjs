import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser
  .newContext({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  })
  .then((c) => c.newPage());

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`https://hathor-booking-system.vercel.app/?_v=${Date.now()}`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForFunction(
  () =>
    window.__hathorLenis &&
    document.documentElement.classList.contains("has-ex-scroll-motion"),
  { timeout: 45000 },
);
await page.waitForTimeout(2000);

const pending = await page.evaluate(() => ({
  pending: document.documentElement.classList.contains("ex-pending"),
  ready: document.documentElement.classList.contains("ex-scroll-ready"),
  opacity: getComputedStyle(document.querySelector(".public-site")).opacity,
}));
console.log("GATE", JSON.stringify(pending));

await page.locator("[data-hcta-track]").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

// Nudge so track top hits viewport top
await page.evaluate(() => {
  const track = document.querySelector("[data-hcta-track]");
  const top = track.getBoundingClientRect().top;
  const cur =
    typeof window.__hathorLenis?.scroll === "number"
      ? window.__hathorLenis.scroll
      : window.scrollY;
  const y = cur + top;
  if (window.__hathorLenis?.scrollTo) {
    window.__hathorLenis.scrollTo(y, { immediate: true });
  } else {
    window.scrollTo(0, y);
  }
});
await page.waitForTimeout(600);
await page.screenshot({ path: "scripts/out-hcta-fix-0.png" });

for (const frac of [0, 0.2, 0.4, 0.6, 0.85]) {
  await page.evaluate((f) => {
    const track = document.querySelector("[data-hcta-track]");
    const cur =
      typeof window.__hathorLenis?.scroll === "number"
        ? window.__hathorLenis.scroll
        : window.scrollY;
    const top = track.getBoundingClientRect().top;
    const y = cur + top + (track.offsetHeight - innerHeight) * f;
    if (window.__hathorLenis?.scrollTo) {
      window.__hathorLenis.scrollTo(y, { immediate: true });
    } else {
      window.scrollTo(0, y);
    }
  }, frac);
  await page.waitForTimeout(500);
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
      trackTop: Math.round(
        document.querySelector("[data-hcta-track]").getBoundingClientRect().top,
      ),
      frameTop: Math.round(frame.getBoundingClientRect().top),
      silk: sc ? getComputedStyle(sc).opacity : null,
      silkTxt: (
        document.querySelector("[data-hcta-silk]")?.innerText || ""
      )
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
  if (frac === 0 || frac === 0.4) {
    await page.screenshot({ path: `scripts/out-hcta-fix-${frac}.png` });
  }
}

console.log("ERRORS", errors);
await browser.close();
