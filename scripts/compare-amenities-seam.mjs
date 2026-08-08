/**
 * Seam + layout clone audit: homepage amenities vs /test-slide Springs source.
 * Samples the 50vw join, dumps computed layout, and lists structural misses.
 *
 *   node scripts/compare-amenities-seam.mjs
 *   node scripts/compare-amenities-seam.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import fs from "node:fs";

const baseArg = process.argv.find((a) => a.startsWith("--base="));
const BASE = (baseArg?.split("=")[1] || "https://hathor-booking-system.vercel.app").replace(
  /\/$/,
  "",
);
const stamp = Date.now();

function isCream(r, g, b) {
  return r > 215 && g > 205 && b > 195 && Math.abs(r - g) < 35;
}
function isGold(r, g, b) {
  return r > 140 && r < 230 && g > 110 && g < 210 && b < 150 && r >= g - 5 && g > b;
}

async function loadAndScroll(page, url, findY) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3500);
  const y = await page.evaluate(findY);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  return y;
}

async function seamScan(page, browser, label) {
  const shot = `.tmp-seam-audit-${label}.png`;
  await page.screenshot({
    path: shot,
    animations: "disabled",
    timeout: 20000,
  });

  const dom = await page.evaluate(() => {
    const vw = window.innerWidth;
    const mid = Math.round(vw / 2);
    const xs = [];
    for (let x = mid - 12; x <= mid + 12; x++) xs.push(x);

    const rows = [180, 280, 400, 520, 680];
    const samples = [];
    for (const y of rows) {
      const row = [];
      for (const x of xs) {
        const el = document.elementFromPoint(x, y);
        const hit = el
          ? `${el.tagName}.${(el.className || "").toString().slice(0, 42)}`
          : "none";
        row.push({ x, hit });
      }
      samples.push({ y, row });
    }

    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel,
        left: Math.round(r.left * 100) / 100,
        width: Math.round(r.width * 100) / 100,
        right: Math.round(r.right * 100) / 100,
        bg: cs.backgroundColor,
        display: cs.display,
        flex: cs.flex,
        maxWidth: cs.maxWidth,
        marginLeft: cs.marginLeft,
        marginRight: cs.marginRight,
        clip: cs.clipPath,
        pos: cs.position,
        z: cs.zIndex,
      };
    };

    return {
      vw,
      mid,
      samples,
      hathor: {
        darkBand: box(".home-am-dark-band"),
        sliderRow: box(".home-am-slider__row"),
        captionCol: box(".home-am-slider__caption-col"),
        imagesCol: box(".home-am-slider__images-col"),
        openingImages: box(".home-am-opening__images"),
        openingCaption: box(".home-am-opening__caption"),
        openingRC: box(".home-am-opening__right-column"),
        openingInner: box(".home-am-opening__right-inner"),
        sequence: box(".home-am-sequence"),
      },
      springs: {
        section: box("section.ui-dark-background"),
        sliderContent: box(".i-slider__content"),
        sliderCaption: box(".i-slider__caption"),
        sliderImages: box(".i-slider__images"),
        openingImages: box(".i-opening__images"),
        openingCaption: box(".i-opening__caption"),
        openingRC: box(".i-opening__right-column"),
        openingOffset: box(
          ".i-opening__right-column .offset--lg-6, .i-opening__right-column .col--lg-6",
        ),
        intro: box("#i-intro"),
      },
    };
  });

  /* Pixel seam from screenshot via a dedicated page */
  const buf = fs.readFileSync(shot);
  const b64 = buf.toString("base64");
  const p = await browser.newPage();
  await p.setContent(
    `<canvas id="c"></canvas><script>
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        window.__ready = true;
      };
      img.src = "data:image/png;base64,${b64}";
      </script>`,
    { waitUntil: "load" },
  );
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
  const pixels = await p.evaluate(() => {
    const c = document.getElementById("c");
    const ctx = c.getContext("2d");
    const mid = Math.round(c.width / 2);
    const rows = [180, 280, 400, 520, 680].filter((y) => y < c.height);
    const out = [];
    for (const y of rows) {
      const line = [];
      for (let x = mid - 10; x <= mid + 10; x++) {
        const d = ctx.getImageData(x, y, 1, 1).data;
        line.push({ x, rgb: [d[0], d[1], d[2]] });
      }
      out.push({ y, line });
    }
    return { mid, out, w: c.width, h: c.height };
  });
  await p.close();

  const seamRows = pixels.out.map((row) => {
    const cream = row.line.filter((pt) => {
      const [r, g, b] = pt.rgb;
      return r > 215 && g > 205 && b > 195 && Math.abs(r - g) < 35;
    });
    const gold = row.line.filter((pt) => {
      const [r, g, b] = pt.rgb;
      return r > 140 && r < 230 && g > 110 && g < 210 && b < 150 && r >= g - 5;
    });
    return {
      y: row.y,
      creamCount: cream.length,
      goldCount: gold.length,
      creamXs: cream.map((pt) => pt.x),
      center: row.line.find((pt) => pt.x === pixels.mid)?.rgb || null,
      left: row.line.find((pt) => pt.x === pixels.mid - 3)?.rgb || null,
      right: row.line.find((pt) => pt.x === pixels.mid + 3)?.rgb || null,
    };
  });

  return { label, shot, dom, pixels: { mid: pixels.mid, seamRows } };
}

const browser = await chromium.launch({ headless: true });
const homePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const springsPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const homeY = await loadAndScroll(
  homePage,
  `${BASE}/?fresh=${stamp}`,
  () => {
    const slider = document.querySelector("#home-am-slider");
    const opening = document.querySelector("#home-am-opening");
    /* Prefer opening handoff (known gap zone), else slider mid */
    const el = opening || slider;
    if (!el) return 4000;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.round(top + (opening ? 1100 : 2400));
  },
);

const springsY = await loadAndScroll(
  springsPage,
  `${BASE}/test-slide?fresh=${stamp}`,
  () => {
    const opening = document.querySelector("#i-opening");
    const slider = document.querySelector("#i-slider");
    const el = opening || slider;
    if (!el) return 2000;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.round(top + (opening ? 900 : 2000));
  },
);

const home = await seamScan(homePage, browser, "home");
home.scrollY = homeY;
const springs = await seamScan(springsPage, browser, "springs");
springs.scrollY = springsY;

/* Layout join math */
function joinReport(side, boxes, isSprings) {
  if (isSprings) {
    const cap = boxes.sliderCaption;
    const imgs = boxes.sliderImages;
    const rc = boxes.openingRC;
    const oi = boxes.openingImages;
    const issues = [];
    if (cap && imgs) {
      const gap = imgs.left - cap.right;
      issues.push({
        where: "slider caption|images",
        gapPx: Math.round(gap * 100) / 100,
        capRight: cap.right,
        imgLeft: imgs.left,
        expected: "0 (flush at 50vw)",
      });
    }
    if (oi && rc) {
      issues.push({
        where: "opening images|RC",
        imagesRight: oi.right,
        rcLeft: rc.left,
        rcClip: rc.clip,
        rcBg: rc.bg,
        sectionBg: boxes.section?.bg,
      });
    }
    return issues;
  }
  const cap = boxes.captionCol;
  const imgs = boxes.imagesCol;
  const oi = boxes.openingImages;
  const rc = boxes.openingRC;
  const issues = [];
  if (cap && imgs) {
    const gap = imgs.left - cap.right;
    issues.push({
      where: "slider caption|images",
      gapPx: Math.round(gap * 100) / 100,
      capRight: cap.right,
      imgLeft: imgs.left,
      capW: cap.width,
      imgW: imgs.width,
      marginRight: cap.marginRight,
      darkBandBg: boxes.darkBand?.bg,
      sequenceBg: boxes.sequence?.bg,
    });
  }
  if (oi && rc) {
    issues.push({
      where: "opening images|RC",
      imagesRight: oi.right,
      imagesW: oi.width,
      rcLeft: rc.left,
      rcClip: rc.clip,
      rcBg: rc.bg,
      darkBandBg: boxes.darkBand?.bg,
      innerML: boxes.openingInner?.marginLeft,
    });
  }
  return issues;
}

const homeJoins = joinReport("home", home.dom.hathor, false);
const springsJoins = joinReport("springs", springs.dom.springs, true);

/* Skipped Springs structure checklist on homepage DOM */
const skipped = await homePage.evaluate(() => {
  const need = [
    [".home-am-dark-band", "Springs section.ui-dark-background underlay"],
    [".home-am-slider__caption-col", "i-slider__caption col--md-6"],
    [".home-am-slider__images-col", "i-slider__images col--md-6"],
    [".home-am-opening__right-column", "i-opening__right-column ui-background"],
    [".home-am-opening__images", "i-opening__images col--lg-6"],
    ['[data-parallax-pattern="videoCaptionMoveUp"]', "videoCaptionMoveUp pattern"],
    ['[data-parallax-pattern="infrastructureSliderScroll"]', "infrastructureSliderScroll pattern"],
    [".home-am-video__caption", "i-video__caption"],
  ];
  return need.map(([sel, springs]) => ({
    sel,
    springs,
    present: !!document.querySelector(sel),
  }));
});

const springsHas = await springsPage.evaluate(() => {
  const need = [
    ["section.ui-dark-background", "dark section wrap"],
    [".i-slider__caption.ui-background", "slider caption ui-background"],
    [".i-slider__caption.col--md-6", "slider caption 50vw col"],
    [".i-opening__right-column.ui-background", "RC ui-background"],
    ['[data-parallax-pattern*="videoCaptionMoveUp"]', "videoCaptionMoveUp"],
    ['[data-parallax-pattern*="infrastructureSliderScroll"]', "infrastructureSliderScroll"],
    [".col--md-6", "50vw columns"],
  ];
  return need.map(([sel, label]) => ({
    sel,
    label,
    present: !!document.querySelector(sel),
    count: document.querySelectorAll(sel).length,
  }));
});

await browser.close();

const homeSeamCream = home.pixels.seamRows.reduce((a, r) => a + r.creamCount, 0);
const springsSeamCream = springs.pixels.seamRows.reduce((a, r) => a + r.creamCount, 0);

const diagnosis = [];
if (homeSeamCream > 0 && springsSeamCream === 0) {
  diagnosis.push(
    `GAP CONFIRMED on homepage: ${homeSeamCream} cream seam pixels near 50vw; Springs has ${springsSeamCream}.`,
  );
}
if (homeSeamCream > 0) {
  const band = home.dom.hathor.darkBand;
  if (!band) {
    diagnosis.push("MISSING: .home-am-dark-band (Springs section.ui-dark-background). Cream page shows through 50vw hairline.");
  } else if (!band.bg.includes("182") && !band.bg.includes("b69") && band.bg.includes("0, 0, 0, 0")) {
    diagnosis.push(`dark-band background is transparent/wrong: ${band.bg}`);
  } else {
    diagnosis.push(
      `dark-band exists (bg=${band.bg}) but cream still samples at 50vw — hairline is likely ABOVE the band in z-order (fixed stages / clip hole), or columns don't meet (see join gaps).`,
    );
  }
}
for (const j of homeJoins) {
  if (typeof j.gapPx === "number" && Math.abs(j.gapPx) > 0.5) {
    diagnosis.push(
      `SLIDER JOIN GAP: ${j.gapPx}px between caption.right (${j.capRight}) and images.left (${j.imgLeft}). Springs col--md-6 is exact 50vw+50vw.`,
    );
  }
}
const miss = skipped.filter((s) => !s.present);
if (miss.length) {
  diagnosis.push(
    `SKIPPED/MISCLONED on homepage: ${miss.map((m) => `${m.sel} (${m.springs})`).join("; ")}`,
  );
}
if (springsHas.every((s) => s.present)) {
  diagnosis.push("Springs /test-slide has all expected structural selectors.");
}

const report = {
  base: BASE,
  stamped: stamp,
  home: {
    scrollY: home.scrollY,
    shot: home.shot,
    seamCreamPixels: homeSeamCream,
    seamRows: home.pixels.seamRows,
    joins: homeJoins,
    boxes: home.dom.hathor,
  },
  springs: {
    scrollY: springs.scrollY,
    shot: springs.shot,
    seamCreamPixels: springsSeamCream,
    seamRows: springs.pixels.seamRows,
    joins: springsJoins,
    boxes: springs.dom.springs,
  },
  skippedOnHome: skipped,
  springsChecklist: springsHas,
  diagnosis,
};

fs.writeFileSync(".tmp-seam-audit-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log("\n=== DIAGNOSIS ===");
diagnosis.forEach((d) => console.log("-", d));
