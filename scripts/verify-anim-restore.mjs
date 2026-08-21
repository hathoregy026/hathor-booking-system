import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  reducedMotion: "no-preference",
});
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

const res = await page.goto(
  `https://hathor-booking-system.vercel.app/?_v=${Date.now()}`,
  { waitUntil: "domcontentloaded", timeout: 60000 },
);
console.log("status", res.status());
console.log("clear-site-data", res.headers()["clear-site-data"] || null);

await page.waitForSelector(".radius-heading h2", { timeout: 30000 });
await page.waitForTimeout(3000);

await page.evaluate(() => window.scrollTo(0, 1600));
await page.waitForTimeout(500);
await page.locator(".radius-heading").scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const h2 = document.querySelector(".radius-heading h2");
  if (!h2) return { missing: true };
  return {
    chars: h2.querySelectorAll(".char").length,
    html: h2.innerHTML.slice(0, 200),
    text: h2.innerText.replace(/\s+/g, " ").trim(),
    color: getComputedStyle(h2).color,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
});
console.log(JSON.stringify(info, null, 2));

const chunkUrls = await page.evaluate(() =>
  [...document.querySelectorAll("script[src]")]
    .map((s) => s.getAttribute("src"))
    .filter(Boolean),
);

let found = false;
for (const url of chunkUrls) {
  const abs = new URL(url, page.url()).toString();
  const body = await (await page.request.get(abs)).text();
  if (body.includes("radius-heading") && body.includes("SplitType")) {
    found = true;
    console.log("CHUNK", url);
    console.log("HAS_CHARS_TYPE", /types:\s*["']chars["']/.test(body));
    console.log("HAS_WHOLE_ELEMENT", body.includes("whole-element"));
    console.log("HAS_STAGGER", body.includes("stagger"));
    break;
  }
}
if (!found) {
  // search all homepage-linked chunks for the marker string
  for (const url of chunkUrls) {
    const abs = new URL(url, page.url()).toString();
    const body = await (await page.request.get(abs)).text();
    if (body.includes("initRadiusHeadingPara") || body.includes("radius-heading")) {
      console.log("NEAR", url, {
        whole: body.includes("whole-element"),
        chars: /types:\s*["']chars["']/.test(body),
        stagger: body.includes("stagger:0.05") || body.includes("stagger: 0.05"),
      });
    }
  }
}

await page
  .locator("#about .about-layout > div:last-child")
  .screenshot({ path: "scripts/out-prod-anim-restored.png" });
await browser.close();
