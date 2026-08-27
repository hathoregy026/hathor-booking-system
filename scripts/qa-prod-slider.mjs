import { chromium } from "playwright";

const urls = [
  "https://www.hathorcruise.com/?fresh=1",
  "https://hathor-booking-system-h9qw8j11r-hathor1.vercel.app/?fresh=1",
  "https://hathor-booking-system-pg0u44q62-hathor1.vercel.app/?fresh=1",
];

const browser = await chromium.launch({ headless: true });

for (const url of urls) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    const meta = await page.evaluate(() => {
      const slider = document.querySelector("[data-am-slider]");
      const coming = !!document.querySelector(".site-coming-soon");
      if (!slider) return { url: location.href, coming, hasSlider: false };
      const stage = slider.querySelector(".home-am-chapter__stage");
      const row = slider.querySelector(".home-am-slider__row");
      const imgs = slider.querySelector(".home-am-slider__images-col");
      const cap = slider.querySelector(".home-am-slider__caption-col");
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return {
          h: Math.round(r.height),
          w: Math.round(r.width),
          top: Math.round(r.top),
          pos: s.position,
          clip: s.clipPath.slice(0, 70),
          inlineH: el.style.height,
        };
      };
      return {
        coming,
        hasSlider: true,
        sliderTop: Math.round(slider.getBoundingClientRect().top + scrollY),
        sliderH: slider.offsetHeight,
        stage: box(stage),
        row: box(row),
        imgs: box(imgs),
        cap: box(cap),
        openZ: document.querySelector("#home-am-opening")
          ? getComputedStyle(document.querySelector("#home-am-opening")).zIndex
          : null,
      };
    });
    console.log("\nURL", url);
    console.log(JSON.stringify(meta, null, 2));

    if (meta.hasSlider) {
      const sTop = meta.sliderTop;
      for (const dy of [200, 800, 1600, 2400]) {
        await page.evaluate((y) => scrollTo(0, y), sTop + dy);
        await page.waitForTimeout(250);
        const snap = await page.evaluate((dy) => {
          const slider = document.querySelector("[data-am-slider]");
          const stage = slider.querySelector(".home-am-chapter__stage");
          const opening = document.querySelector("#home-am-opening");
          const openStage = opening?.querySelector(".home-am-chapter__stage");
          const imgs = slider.querySelector(".home-am-slider__images-col");
          const row = slider.querySelector(".home-am-slider__row");
          return {
            dy,
            stagePos: getComputedStyle(stage).position,
            stageH: Math.round(stage.getBoundingClientRect().height),
            rowH: Math.round(row.getBoundingClientRect().height),
            imgsH: Math.round(imgs.getBoundingClientRect().height),
            imgsClip: getComputedStyle(imgs).clipPath.slice(0, 60),
            openStagePos: openStage ? getComputedStyle(openStage).position : null,
            openTop: opening ? Math.round(opening.getBoundingClientRect().top) : null,
          };
        }, dy);
        console.log(JSON.stringify(snap));
      }
      await page.evaluate((y) => scrollTo(0, y), sTop + 800);
      await page.waitForTimeout(300);
      const name = url.includes("hathorcruise.com")
        ? ".tmp-prod-slider-domain.png"
        : url.includes("h9qw")
          ? ".tmp-prod-slider-h9.png"
          : ".tmp-prod-slider-pg.png";
      await page.screenshot({ path: name });
    }
  } catch (e) {
    console.log("ERR", url, e.message);
  }
  await page.close();
}

await browser.close();
