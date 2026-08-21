import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { chromium } from "playwright";

const OUT = path.resolve("public/media/hathor/scraped");
fs.mkdirSync(OUT, { recursive: true });

const MANIFEST = [
  // Cabins & Suites (/rooms) — card + hero
  {
    key: "suites-hero",
    url: "https://www.hathorcruise.com/storage/Czb4mqk92zpA5287dbpxUWaG0Is31QjcCyy2MQEw.jpg",
  },
  {
    key: "suites-luxury-rooms",
    url: "https://hathorcruise.com/storage/844/conversions/WhatsApp-Image-2026-04-30-at-12.02.29-PM.-webp.webp",
  },
  {
    key: "suites-luxury-suites",
    url: "https://hathorcruise.com/storage/697/conversions/PHOTO-2026-04-20-18-53-35-webp.webp",
  },
  {
    key: "suites-royal",
    url: "https://hathorcruise.com/storage/846/conversions/WhatsApp-Image-2026-04-30-at-1.19.43-PM.....-webp.webp",
  },
  // Luxury Suites dedicated page (Nile-Cruise-Luxury-Suites)
  {
    key: "luxsuite-1",
    url: "https://hathorcruise.com/storage/1181/conversions/Royal_suite_under_1020KB-webp.webp",
  },
  {
    key: "luxsuite-2",
    url: "https://hathorcruise.com/storage/1186/conversions/room_image_1020KB---webp.webp",
  },
  {
    key: "luxsuite-3",
    url: "https://hathorcruise.com/storage/1183/conversions/lounge_room_under_1020KB-webp.webp",
  },
  {
    key: "luxsuite-4",
    url: "https://hathorcruise.com/storage/1187/conversions/bathroom_under_1020KB-webp.webp",
  },
  {
    key: "luxsuite-5",
    url: "https://hathorcruise.com/storage/1273/conversions/bedroom_under_1020KB-webp.webp",
  },
  {
    key: "luxsuite-6",
    url: "https://hathorcruise.com/storage/958/conversions/WhatsApp-Image-2026-04-30-at-12.38.37-PM..---webp.webp",
  },
  // Royal Suites
  {
    key: "royal-1",
    url: "https://hathorcruise.com/storage/1211/conversions/WhatsApp-Image-2026-06-08-at-7.21.10-PM--webp.webp",
  },
  {
    key: "royal-2",
    url: "https://hathorcruise.com/storage/1269/conversions/Hathor_Room_Under_1024KB-webp.webp",
  },
  {
    key: "royal-3",
    url: "https://hathorcruise.com/storage/1209/conversions/jacuzzi_suite_under_1020KB-webp.webp",
  },
  {
    key: "royal-4",
    url: "https://hathorcruise.com/storage/1210/conversions/sunset_view_under_1020KB-webp.webp",
  },
  {
    key: "royal-5",
    url: "https://hathorcruise.com/storage/1212/conversions/Royal_suite_under_1020KB-webp.webp",
  },
  {
    key: "royal-6",
    url: "https://hathorcruise.com/storage/1216/conversions/suite_lounge_under_1020KB-webp.webp",
  },
  {
    key: "royal-7",
    url: "https://hathorcruise.com/storage/1213/conversions/bathroom_view_under_1020KB-webp.webp",
  },
  {
    key: "royal-8",
    url: "https://hathorcruise.com/storage/1219/conversions/breakfast_couple_under_1020KB-webp.webp",
  },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
          Referer: "https://www.hathorcruise.com/",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
        file.on("error", reject);
      },
    );
    req.on("error", reject);
  });
}

async function scrapeLuxuryCabinImages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  // warm
  await page.goto("https://www.hathorcruise.com/rooms", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(4000);
  await page.goto("https://www.hathorcruise.com/luxury-cabins-Nile-Cruise", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  for (let i = 0; i < 25; i++) {
    const t = await page.title();
    if (!/moment|cloudflare/i.test(t)) break;
    await page.waitForTimeout(2000);
  }
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await sleep(150);
    }
  });
  await page.waitForTimeout(2000);
  const urls = await page.evaluate(() => {
    const out = new Set();
    document.querySelectorAll("img").forEach((img) => {
      const s = img.currentSrc || img.src || "";
      if (/storage\/\d+|conversions/i.test(s)) out.add(s);
    });
    document.querySelectorAll("[style*='background']").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage || "";
      const m = bg.match(/url\(["']?(https?:[^"')]+)/i);
      if (m && /storage/i.test(m[1])) out.add(m[1]);
    });
    const og = document.querySelector('meta[property="og:image"]')?.content;
    if (og) out.add(og);
    return [...out];
  });
  await browser.close();
  return urls.slice(0, 12);
}

const results = [];
for (const item of MANIFEST) {
  const dest = path.join(OUT, `${item.key}.webp`);
  try {
    await download(item.url, dest);
    const size = fs.statSync(dest).size;
    console.log("OK", item.key, size);
    results.push({ ...item, dest, size, ok: size > 1000 });
  } catch (e) {
    console.error("FAIL", item.key, e.message);
    results.push({ ...item, ok: false, error: e.message });
  }
}

try {
  const cabinUrls = await scrapeLuxuryCabinImages();
  console.log("cabin urls", cabinUrls.length, cabinUrls);
  let i = 1;
  for (const url of cabinUrls) {
    const key = `cabin-${i}`;
    const dest = path.join(OUT, `${key}.webp`);
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log("OK", key, size);
      results.push({ key, url, dest, size, ok: size > 1000 });
      i++;
    } catch (e) {
      console.error("FAIL", key, e.message);
    }
  }
} catch (e) {
  console.error("cabin scrape fail", e.message);
}

fs.writeFileSync(
  path.join("scripts", "scraped-images-manifest.json"),
  JSON.stringify(results, null, 2),
);
console.log("DONE", results.filter((r) => r.ok).length, "/", results.length);
