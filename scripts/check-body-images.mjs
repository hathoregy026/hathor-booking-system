import { chromium } from "playwright";

const urls = [
  "https://hathor-booking-system.vercel.app/rooms",
  "https://hathor-booking-system.vercel.app/luxury-cabins-Nile-Cruise",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const url of urls) {
  console.log("\n===", url);
  const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  console.log("nav status", res?.status(), "title", await page.title());
  if ((await page.title()).includes("Login")) {
    console.log("SSO login wall");
    continue;
  }
  await page.waitForTimeout(3000);
  // scroll into room stack
  await page.evaluate(() => {
    document.querySelector(".room-stack")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const slides = [...document.querySelectorAll(".room-fs-slide.is-first")].slice(0, 3);
    return slides.map((slide) => {
      const img = slide.querySelector("img");
      const cs = img ? getComputedStyle(img) : null;
      const sc = getComputedStyle(slide);
      return {
        slideOpacity: sc.opacity,
        slideVis: sc.visibility,
        slideWH: `${slide.clientWidth}x${slide.clientHeight}`,
        imgSrc: img?.currentSrc || img?.src || null,
        imgNatural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
        imgDisplay: cs?.display,
        imgOpacity: cs?.opacity,
        imgWH: img ? `${img.clientWidth}x${img.clientHeight}` : null,
        complete: img?.complete,
      };
    });
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({
    path: `scripts/out-body-${url.split("/").pop()}.png`,
    fullPage: false,
  });
}

await browser.close();
console.log("done");
