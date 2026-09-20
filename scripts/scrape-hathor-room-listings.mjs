import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PAGES = [
  "https://www.hathorcruise.com/luxury-cabins-Nile-Cruise",
  "https://www.hathorcruise.com/Nile-Cruise-Luxury-Suites",
  "https://www.hathorcruise.com/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "https://www.hathorcruise.com/rooms/Luxury-nile-sailing-Dahabiya",
  "https://www.hathorcruise.com/rooms/dahabiya-sailing-cruise-from-Luxor-to-Aswan",
  "https://www.hathorcruise.com/rooms/Luxury-small-boat-nile-cruise-price",
  "https://www.hathorcruise.com/rooms/dahabiya-nile-cruise-aswan-to-luxor",
  "https://www.hathorcruise.com/rooms/Traditional-Nile-River-boat",
  "https://www.hathorcruise.com/rooms/Dahabiya-nile",
  "https://www.hathorcruise.com/rooms/Best-nile-luxury-cruise",
  "https://www.hathorcruise.com/rooms/Luxury-nile-cruise-Luxor-Aswan-Luxor",
  "https://www.hathorcruise.com/rooms/Dahabiya-Nile-cruise-Cairo-to-Aswan",
  "https://www.hathorcruise.com/rooms/Luxury-Nile-Cruise-Cairo-to-Aswan",
  "https://www.hathorcruise.com/rooms/Best-Dahabiya-Nile-cruise",
  "https://www.hathorcruise.com/rooms/Luxury-small-boat-Nile-cruise",
  "https://www.hathorcruise.com/rooms/nile-sailing-cruise",
];

function keyFromUrl(url) {
  return url.split("/").filter(Boolean).pop();
}

async function waitForChallenge(page, maxMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const title = await page.title();
    if (!/just a moment|attention required|cloudflare/i.test(title)) {
      return title;
    }
    await page.waitForTimeout(1500);
  }
  return page.title();
}

async function scrapePage(page, url) {
  console.log("FETCH", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  const title = await waitForChallenge(page);
  await page.waitForTimeout(2500);

  const tabButtons = page.locator(
    "a, button, [role='tab']",
  ).filter({
    hasText: /overview|itinerary|include|exclude|availability/i,
  });
  const tabCount = await tabButtons.count();
  for (let i = 0; i < Math.min(tabCount, 12); i += 1) {
    try {
      await tabButtons.nth(i).click({ timeout: 1500 });
      await page.waitForTimeout(400);
    } catch {
      /* tab may be a hash link already in view */
    }
  }

  const data = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, [role='tab']"));
    const sections = {};
    const capture = (key, el) => {
      if (!el) return;
      const root = el.closest("section, article, .tab-pane, .panel, .bravo_content, .tour-detail") || el.parentElement;
      const text = (root?.innerText || el.innerText || "").trim().slice(0, 8000);
      if (text) sections[key] = text;
    };

    headings.forEach((el) => {
      const label = (el.textContent || "").trim().toLowerCase();
      if (/^overview\b/.test(label)) capture("overview", el);
      else if (/^itinerary\b/.test(label)) capture("itinerary", el);
      else if (/include/.test(label) && /exclude/.test(label)) capture("includeExclude", el);
      else if (/^availability\b|^cruise availability\b/.test(label)) capture("availability", el);
    });

    return {
      title: document.title,
      text: (document.body.innerText || "").slice(0, 20000),
      sections,
    };
  });

  return { url, title, ...data };
}

const outDir = path.resolve("_local/room-folio-scrape");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  locale: "en-US",
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

const results = {};
for (const url of PAGES) {
  const key = keyFromUrl(url);
  try {
    const data = await scrapePage(page, url);
    fs.writeFileSync(path.join(outDir, `${key}.json`), JSON.stringify(data, null, 2));
    results[key] = {
      title: data.title,
      textLen: data.text?.length || 0,
      sections: Object.keys(data.sections || {}),
    };
    console.log("OK", key, results[key]);
  } catch (error) {
    console.error("FAIL", url, error.message);
    results[key] = { error: error.message };
  }
}

fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(results, null, 2));
await browser.close();
console.log("DONE", results);
