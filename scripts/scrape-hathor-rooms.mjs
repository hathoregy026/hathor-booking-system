import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PAGES = [
  "https://www.hathorcruise.com/luxury-cabins-Nile-Cruise",
  "https://www.hathorcruise.com/rooms",
  "https://www.hathorcruise.com/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
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
  // scroll to trigger lazy images
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await sleep(200);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const abs = (u) => {
      try {
        return new URL(u, location.origin).href;
      } catch {
        return u;
      }
    };
    const images = [];
    const push = (src, alt = "", kind = "img") => {
      if (!src || src.startsWith("data:")) return;
      const clean = src.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
      if (!clean || clean === "none") return;
      images.push({ src: abs(clean.split(" ")[0]), alt, kind });
    };

    document.querySelectorAll("img").forEach((img) => {
      push(img.currentSrc || img.src || img.getAttribute("data-src") || "", img.alt || "", "img");
      const ds = img.getAttribute("data-srcset") || img.getAttribute("srcset");
      if (ds) push(ds.split(",")[0], img.alt || "", "srcset");
    });
    document.querySelectorAll("[style*='background']").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") push(bg, "", "bg");
    });
    document.querySelectorAll("[data-bg], [data-background], [data-src]").forEach((el) => {
      push(
        el.getAttribute("data-bg") ||
          el.getAttribute("data-background") ||
          el.getAttribute("data-src") ||
          "",
        "",
        "data"
      );
    });

    const og = document.querySelector('meta[property="og:image"]')?.content || "";
    const links = Array.from(document.querySelectorAll("a[href*='/rooms/'], a[href*='cruises']"))
      .map((a) => ({ href: a.href, text: (a.innerText || "").trim() }))
      .filter((l) => l.text)
      .slice(0, 80);

    // card-like blocks
    const cards = Array.from(
      document.querySelectorAll(
        ".rooms-one, .room-card, .tour-card, .rooms-card, article, .tour-block, .rooms-block"
      )
    )
      .slice(0, 30)
      .map((c) => {
        const img =
          c.querySelector("img")?.currentSrc ||
          c.querySelector("img")?.src ||
          c.querySelector("[style*='background']")?.style?.backgroundImage ||
          "";
        return {
          text: (c.innerText || "").trim().slice(0, 1200),
          img: img ? abs(img.replace(/^url\(["']?/, "").replace(/["']?\)$/, "")) : "",
        };
      });

    return {
      title: document.title,
      text: document.body.innerText,
      og: og ? abs(og) : "",
      images: images.filter((i) => /storage|uploads|rooms|suite|cabin|media|wp-content/i.test(i.src)),
      allImages: images.slice(0, 120),
      links,
      cards,
    };
  });

  return { url, title, ...data };
}

const outDir = path.resolve("scripts");
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
  try {
    const data = await scrapePage(page, url);
    const key = keyFromUrl(url);
    const out = path.join(outDir, `scrape-${key}.json`);
    fs.writeFileSync(out, JSON.stringify(data, null, 2));
    results[key] = {
      title: data.title,
      textLen: data.text?.length || 0,
      images: data.images?.length || 0,
      cards: data.cards?.length || 0,
      og: data.og,
    };
    console.log("OK", key, results[key]);
  } catch (e) {
    console.error("FAIL", url, e.message);
    results[keyFromUrl(url)] = { error: e.message };
  }
}

fs.writeFileSync(path.join(outDir, "scrape-summary.json"), JSON.stringify(results, null, 2));
await browser.close();
console.log("DONE", results);
