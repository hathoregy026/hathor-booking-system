/**
 * Compare homepage amenities region vs /test-slide (Springs source of truth).
 *
 * Usage:
 *   npm run compare:amenities
 *   npm run compare:amenities -- --base=http://localhost:3000
 */
import { chromium } from "playwright";
import fs from "node:fs";

const baseArg = process.argv.find((a) => a.startsWith("--base="));
const BASE = (baseArg?.split("=")[1] || "https://hathor-booking-system.vercel.app").replace(
  /\/$/,
  "",
);
const stamp = Date.now();

async function inspect(page, label, url, findScrollY) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror:${e.message || e}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console:${m.text().slice(0, 180)}`);
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3000);

  const y = await page.evaluate(findScrollY);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(600);

  const mount = await page.evaluate(() => {
    const iframe = document.querySelector(
      ".home-am-springs-frame, iframe[title='Hathor amenities']",
    );
    const host = document.querySelector(
      "[data-home-amenities-springs], .home-am-springs-host",
    );
    const react = {
      sequence: !!document.querySelector(".home-am-sequence"),
      intro: !!document.querySelector("#home-am-intro"),
      video: !!document.querySelector("#home-am-video"),
      slider: !!document.querySelector("#home-am-slider"),
      opening: !!document.querySelector("#home-am-opening"),
      nature: !!document.querySelector("#home-am-nature"),
      darkBand: !!document.querySelector(".home-am-dark-band"),
    };
    const springs = {
      intro: !!document.querySelector("#i-intro"),
      video: !!document.querySelector("#i-video"),
      slider: !!document.querySelector("#i-slider"),
      opening: !!document.querySelector("#i-opening"),
      nature: !!document.querySelector("#i-nature"),
    };
    const visibleImgs = [...document.querySelectorAll("img")].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width > 48 && r.height > 48 && r.bottom > 0 && r.top < innerHeight;
    }).length;

    let mode = "unknown";
    if (iframe) mode = "iframe-clone";
    else if (react.sequence || react.slider || react.opening) mode = "react-sequence";
    else if (springs.intro || springs.slider) mode = "springs-document";

    /* Sample center/mid colors via elements under points */
    const points = [
      [200, 200],
      [720, 400],
      [1200, 400],
      [720, 700],
    ].map(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { x, y, hit: "none" };
      return {
        x,
        y,
        hit: `${el.tagName}.${(el.className || "").toString().slice(0, 48)}`,
        bg: getComputedStyle(el).backgroundColor,
      };
    });

    return {
      mode,
      iframeSrc: iframe?.getAttribute("src") || null,
      hostH: host ? Math.round(host.getBoundingClientRect().height) : 0,
      react,
      springs,
      visibleImgs,
      points,
      readyClass: document.documentElement.className.includes("not-ready"),
      scrollH: document.documentElement.scrollHeight,
    };
  });

  const shot = `.tmp-compare-${label}.png`;
  try {
    await page.screenshot({
      path: shot,
      fullPage: false,
      timeout: 20000,
      animations: "disabled",
    });
  } catch {
    /* non-fatal */
  }

  page.removeAllListeners("pageerror");
  page.removeAllListeners("console");

  return {
    label,
    url: url.split("?")[0],
    scrollY: y,
    mount,
    errors: [...new Set(errors)].slice(0, 10),
    screenshot: fs.existsSync(shot) ? shot : null,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const home = await inspect(page, "home", `${BASE}/?fresh=${stamp}`, () => {
  const el =
    document.querySelector("[data-home-amenities-springs], .home-am-springs-host") ||
    document.querySelector(".home-am-sequence, #home-am-intro, #home-am-slider");
  if (!el) return Math.round(document.body.scrollHeight * 0.45);
  return Math.round(el.getBoundingClientRect().top + window.scrollY + 240);
});

const testSlide = await inspect(
  page,
  "test-slide",
  `${BASE}/test-slide?fresh=${stamp}`,
  () => {
    const el =
      document.querySelector("#i-video") ||
      document.querySelector("#i-intro") ||
      document.querySelector("#i-slider");
    if (!el) return 800;
    return Math.round(el.getBoundingClientRect().top + window.scrollY + 400);
  },
);

const clone = await inspect(
  page,
  "clone-direct",
  `${BASE}/home-amenities-springs/index.html?fresh=${stamp}`,
  () => {
    const el = document.querySelector("#i-intro, #i-video");
    if (!el) return 200;
    return Math.round(el.getBoundingClientRect().top + window.scrollY + 300);
  },
);

await browser.close();

const diagnosis = [];
if (home.mount.mode === "iframe-clone") {
  diagnosis.push(
    "Homepage mounts iframe-clone. Blank cream voids usually mean Springs not-ready inside the iframe — not hero/carousel covering amenities.",
  );
}
if (home.mount.mode === "react-sequence") {
  diagnosis.push(
    "Homepage is back on react-sequence (HomeAmenitiesSequence).",
  );
}
if (testSlide.mount.mode === "springs-document" && testSlide.mount.visibleImgs > 0) {
  diagnosis.push(
    "OK: /test-slide Springs document paints images — source page is healthy.",
  );
}
if (
  home.mount.mode === "iframe-clone" &&
  clone.mount.visibleImgs === 0 &&
  testSlide.mount.visibleImgs > 0
) {
  diagnosis.push(
    "Clone HTML is blank while /test-slide works — problem is the built clone slice/theme, not unrelated homepage elements.",
  );
}
if (
  home.mount.mode === "iframe-clone" &&
  clone.mount.visibleImgs > 0 &&
  home.mount.visibleImgs === 0
) {
  diagnosis.push(
    "Clone works opened directly but not inside homepage iframe — embed/Lenis/host interaction, not missing Springs assets.",
  );
}
if (!home.mount.react.sequence && home.mount.mode === "iframe-clone") {
  diagnosis.push(
    "React amenities chapters are absent — blank block is the clone host itself.",
  );
}
if (home.mount.react.darkBand) {
  diagnosis.push("React dark-band (gap underlay) is present.");
}

const report = { base: BASE, stamped: stamp, home, testSlide, clone, diagnosis };
fs.writeFileSync(".tmp-amenities-compare-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
