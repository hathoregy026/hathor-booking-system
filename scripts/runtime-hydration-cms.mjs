/**
 * Capture hydration warnings + CMS image URL consistency on real routes.
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.env.RUNTIME_AUDIT_BASE_URL || "http://127.0.0.1:3010";

const VIEWPORTS = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024, hasTouch: true },
  { name: "phone-390x844", width: 390, height: 844, hasTouch: true, isMobile: true },
];

const report = { base: BASE, at: new Date().toISOString(), cases: [] };

const browser = await chromium.launch({ headless: true });
try {
  for (const vp of VIEWPORTS) {
    for (const path of ["/", "/cruises", "/rooms"]) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        hasTouch: Boolean(vp.hasTouch),
        isMobile: Boolean(vp.isMobile),
      });
      const page = await context.newPage();
      const hydration = [];
      page.on("console", (msg) => {
        const text = msg.text();
        if (
          text.includes("Hydration") ||
          text.includes("hydrated but") ||
          text.includes("did not match")
        ) {
          hydration.push(text.slice(0, 1200));
        }
      });
      page.on("pageerror", (err) => {
        hydration.push(`pageerror: ${String(err).slice(0, 400)}`);
      });

      const response = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await page.waitForTimeout(1500);

      const html = await response?.text().catch(() => "");
      const serverImgs = [...(html?.matchAll(/src="([^"]+)"/g) || [])]
        .map((m) => m[1])
        .filter((s) => s.includes("/media/") || s.includes("supabase") || s.includes("/branding/"))
        .slice(0, 12);

      const client = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll("img")]
          .map((img) => img.getAttribute("src") || img.currentSrc)
          .filter(Boolean)
          .slice(0, 12);
        return {
          imgs,
          htmlTouch: document.documentElement.classList.contains("is-touch-device"),
          bodyTouch: document.body.classList.contains("is-touch-device"),
        };
      });

      report.cases.push({
        viewport: vp.name,
        path,
        status: response?.status() ?? 0,
        hydrationWarnings: hydration,
        serverSample: serverImgs,
        clientSample: client.imgs,
        touchClass: { html: client.htmlTouch, body: client.bodyTouch },
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  "scripts/_tmp-hydration-cms-report.json",
  JSON.stringify(report, null, 2),
);
const withWarn = report.cases.filter((c) => c.hydrationWarnings.length);
console.log(
  JSON.stringify(
    {
      wrote: "scripts/_tmp-hydration-cms-report.json",
      cases: report.cases.length,
      withHydrationWarnings: withWarn.length,
      samples: withWarn.slice(0, 3).map((c) => ({
        viewport: c.viewport,
        path: c.path,
        warning: c.hydrationWarnings[0]?.slice(0, 300),
      })),
    },
    null,
    2,
  ),
);
