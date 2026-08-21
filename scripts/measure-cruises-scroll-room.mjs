import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3013/cruises", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

for (const y of [0, 2200, 2600, 4000, 6000]) {
  await page.evaluate((scrollY) => scrollTo(0, scrollY), y);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const pin = document.querySelector(".pin-spacer");
    const follower = document.querySelector(".cruises-sheet-follower");
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    return {
      scrollY: window.scrollY,
      maxScroll: Math.round(maxScroll),
      roomLeft: Math.round(maxScroll - window.scrollY),
      pinPadding: pin ? getComputedStyle(pin).paddingBottom : null,
      followerH: follower?.scrollHeight,
      pastPin: document
        .querySelector("[data-cruises-transition]")
        ?.classList.contains("hathor-page-scroll--past-pin"),
    };
  });
  console.log("at", y, m);
}

await browser.close();
