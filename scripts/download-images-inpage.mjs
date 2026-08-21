import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/media/hathor/scraped");
fs.mkdirSync(OUT, { recursive: true });

const MANIFEST = [
  ["suites-hero", "https://www.hathorcruise.com/storage/Czb4mqk92zpA5287dbpxUWaG0Is31QjcCyy2MQEw.jpg"],
  ["suites-luxury-rooms", "https://www.hathorcruise.com/storage/844/conversions/WhatsApp-Image-2026-04-30-at-12.02.29-PM.-webp.webp"],
  ["suites-luxury-suites", "https://www.hathorcruise.com/storage/697/conversions/PHOTO-2026-04-20-18-53-35-webp.webp"],
  ["suites-royal", "https://www.hathorcruise.com/storage/846/conversions/WhatsApp-Image-2026-04-30-at-1.19.43-PM.....-webp.webp"],
  ["luxsuite-1", "https://www.hathorcruise.com/storage/1181/conversions/Royal_suite_under_1020KB-webp.webp"],
  ["luxsuite-2", "https://www.hathorcruise.com/storage/1186/conversions/room_image_1020KB---webp.webp"],
  ["luxsuite-3", "https://www.hathorcruise.com/storage/1183/conversions/lounge_room_under_1020KB-webp.webp"],
  ["luxsuite-4", "https://www.hathorcruise.com/storage/1187/conversions/bathroom_under_1020KB-webp.webp"],
  ["luxsuite-5", "https://www.hathorcruise.com/storage/1273/conversions/bedroom_under_1020KB-webp.webp"],
  ["luxsuite-6", "https://www.hathorcruise.com/storage/958/conversions/WhatsApp-Image-2026-04-30-at-12.38.37-PM..---webp.webp"],
  ["royal-1", "https://www.hathorcruise.com/storage/1211/conversions/WhatsApp-Image-2026-06-08-at-7.21.10-PM--webp.webp"],
  ["royal-2", "https://www.hathorcruise.com/storage/1269/conversions/Hathor_Room_Under_1024KB-webp.webp"],
  ["royal-3", "https://www.hathorcruise.com/storage/1209/conversions/jacuzzi_suite_under_1020KB-webp.webp"],
  ["royal-4", "https://www.hathorcruise.com/storage/1210/conversions/sunset_view_under_1020KB-webp.webp"],
  ["royal-5", "https://www.hathorcruise.com/storage/1212/conversions/Royal_suite_under_1020KB-webp.webp"],
  ["royal-6", "https://www.hathorcruise.com/storage/1216/conversions/suite_lounge_under_1020KB-webp.webp"],
  ["royal-7", "https://www.hathorcruise.com/storage/1213/conversions/bathroom_view_under_1020KB-webp.webp"],
  ["royal-8", "https://www.hathorcruise.com/storage/1219/conversions/breakfast_couple_under_1020KB-webp.webp"],
  ["cabin-1", "https://www.hathorcruise.com/storage/1132/conversions/king_room_under_1020KB-webp.webp"],
  ["cabin-2", "https://www.hathorcruise.com/storage/1133/conversions/cabin_room_under_1020KB-webp.webp"],
  ["cabin-3", "https://www.hathorcruise.com/storage/1134/conversions/master_bedroom_under_1020KB-webp.webp"],
  ["cabin-4", "https://www.hathorcruise.com/storage/1135/conversions/room_1020KB-webp.webp"],
  ["cabin-5", "https://www.hathorcruise.com/storage/1138/conversions/twin_bedroom_under_1020KB-webp.webp"],
  ["cabin-6", "https://www.hathorcruise.com/storage/1139/conversions/twin_room_window_under_1020KB-webp.webp"],
  ["cabin-7", "https://www.hathorcruise.com/storage/1140/conversions/bathroom_under_1020KB-webp.webp"],
  ["cabin-8", "https://www.hathorcruise.com/storage/1130/conversions/bathroom_view_under_1020KB-webp.webp"],
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
});
const page = await context.newPage();
await page.goto("https://www.hathorcruise.com/rooms", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(2500);

const results = [];
for (const [key, url] of MANIFEST) {
  const dest = path.join(OUT, `${key}.webp`);
  try {
    const b64 = await page.evaluate(async (u) => {
      const res = await fetch(u, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return btoa(binary);
    }, url);
    const buf = Buffer.from(b64, "base64");
    fs.writeFileSync(dest, buf);
    console.log("OK", key, buf.length);
    results.push({ key, url, size: buf.length, ok: buf.length > 1000 });
  } catch (e) {
    console.error("FAIL", key, e.message);
    results.push({ key, url, ok: false, error: e.message });
  }
}

fs.writeFileSync(
  path.join("scripts", "scraped-images-manifest.json"),
  JSON.stringify(results, null, 2),
);
await browser.close();
console.log("DONE", results.filter((r) => r.ok).length, "/", results.length);
