// @ts-check
/**
 * Walks the live site and records which dashboard slot every photograph on it
 * belongs to, page by page, in the order the page paints them.
 *
 * It writes `lib/site-image-usage-map.generated.ts` — the map the Website
 * Images dashboard uses to group slots by page, to flag a photo that serves
 * more than one page, and to point “View on site” at a page that really shows
 * it. It also reports images the dashboard does not control yet, slots no page
 * renders any more, and the same photo used twice in a row.
 *
 *   node scripts/audit-site-images.mjs                     (localhost:3000)
 *   node scripts/audit-site-images.mjs --base https://…    (a deployment)
 *   node scripts/audit-site-images.mjs --report-only       (no file written)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "lib", "site-image-usage-map.generated.ts");
const REPORT_FILE = join(ROOT, "_local", "site-image-audit.json");

const args = process.argv.slice(2);
const readArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const BASE = readArg("--base", "http://localhost:3000").replace(/\/$/, "");
const REPORT_ONLY = args.includes("--report-only");

/** Every page a visitor can reach, in the order the dashboard should list them. */
const PAGES = [
  "/",
  "/voyages",
  "/voyages/luxor-to-aswan",
  "/voyages/aswan-to-luxor",
  "/cruises-list",
  "/suites",
  "/rooms",
  "/rooms/luxury-suite",
  "/luxury-cabins-Nile-Cruise",
  "/rooms/luxury-king-room",
  "/rooms/luxury-twin-room",
  "/royal-suites",
  "/rooms/royal-suite",
  "/gastronomy",
  "/wellness",
  "/highlights",
  "/charter",
  "/about",
  "/blogs",
  /* One article stands for every blog post — they all share the same slots. */
  "/blogs/the-magic-of-sleeping-on-the-nile-river",
  "/partners",
  "/contact",
  "/terms-and-conditions",
  "/booking",
  "/booking/lookup",
];

/** Pages whose photographs a visitor only sees after opening something. */
const OPENERS = {
  "/": ["[data-editorial-nav-open]", "button[aria-label*='Menu' i]"],
};

const IGNORED_FILE = /^\/branding\/|^\/_next\/static\/|\.svg$|\.mp4$/i;

function pageKey(route) {
  if (route === "/") return "home";
  return route
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Keep the generated usage input stable after page-owned aliases go live. */
function sourceSlotForRoute(route, slot) {
  const prefix = `page-${pageKey(route)}-`;
  return slot.startsWith(prefix) ? slot.slice(prefix.length) : slot;
}

function fileKey(url) {
  if (!url) return null;
  let value = String(url).trim().replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
  if (!value || value.startsWith("data:")) return null;
  try {
    const parsed = new URL(value, BASE);
    const inner = parsed.searchParams.get("url");
    if (inner) return decodeURIComponent(inner).split("?")[0];
    return parsed.pathname;
  } catch {
    return value.split("?")[0];
  }
}

/** Collected inside the page: every painted photo with the slot that owns it. */
const COLLECT = () => {
  const out = [];
  let order = 0;

  const walk = (doc, frame) => {
    const seen = new Set();
    for (const el of doc.querySelectorAll("img, video, [data-site-image], [class]")) {
      if (seen.has(el)) continue;
      seen.add(el);
      const slot =
        el.getAttribute("data-site-image") ||
        el.getAttribute("data-hathor-slot") ||
        el.closest("[data-site-image]")?.getAttribute("data-site-image") ||
        null;
      const rect = el.getBoundingClientRect();
      const painted = rect.width > 24 && rect.height > 24;
      if (el.tagName === "IMG") {
        const src = el.currentSrc || el.getAttribute("src");
        if (src) out.push({ order: order++, kind: "img", src, slot, painted, frame });
        continue;
      }
      if (el.tagName === "VIDEO") {
        const poster = el.getAttribute("poster");
        if (poster) out.push({ order: order++, kind: "poster", src: poster, slot, painted, frame });
        continue;
      }
      const style = getComputedStyle(el);
      const background = style.backgroundImage;
      if (background && background !== "none" && background.includes("url(")) {
        for (const match of background.matchAll(/url\((["']?)(.*?)\1\)/g)) {
          out.push({ order: order++, kind: "background", src: match[2], slot, painted, frame });
        }
        continue;
      }
      /* A photo handed to CSS as a custom property (chart ghost, hero cut-out).
         Read the element's own declaration — custom properties inherit, so a
         computed value would credit every child with its parent's photo. */
      if (el.getAttribute("data-site-image")) {
        const custom = Array.from(el.style)
          .filter((property) => property.startsWith("--"))
          .map((property) => el.style.getPropertyValue(property))
          .find((value) => value && value.includes("url("));
        const match = custom?.match(/url\((["']?)(.*?)\1\)/);
        out.push({
          order: order++,
          kind: "css-variable",
          src: match ? match[2] : "",
          slot,
          painted,
          frame,
        });
      }
    }
  };

  walk(document, null);
  for (const iframe of Array.from(document.querySelectorAll("iframe"))) {
    try {
      const inner = iframe.contentDocument;
      if (inner) walk(inner, iframe.getAttribute("src") || "frame");
    } catch {
      /* cross-origin frame */
    }
  }
  return out;
};

async function settle(page, route) {
  await page.waitForTimeout(3200);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(height, 60000); y += 640) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);

  for (const selector of OPENERS[route] ?? []) {
    try {
      const target = page.locator(selector).first();
      if (await target.count()) {
        await target.click({ timeout: 4000 });
        await page.waitForTimeout(1200);
      }
    } catch {
      /* the page does not offer it at this width */
    }
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("hathor-welcome-splash-seen", "1");
      sessionStorage.setItem("hathor-welcome-splash-seen", "1");
    } catch {
      /* private mode */
    }
  });
  const page = await context.newPage();

  /** slot -> pages, page -> rows */
  const usage = new Map();
  const pageRows = {};
  const unmanaged = new Map();
  const failures = [];

  for (const route of PAGES) {
    try {
      const response = await page.goto(BASE + route, {
        waitUntil: "domcontentloaded",
        timeout: 180000,
      });
      const status = response ? response.status() : 0;
      if (status >= 400 || status === 0) {
        failures.push(`${route} → ${status}`);
        console.log(`${route.padEnd(38)} ${status}`);
        continue;
      }
      await settle(page, route);
      const found = await page.evaluate(COLLECT);

      const rows = [];
      for (const item of found) {
        const file = fileKey(item.src);
        /* A marked element with no readable URL still proves the slot is live. */
        if (!file && !item.slot) continue;
        if (file && IGNORED_FILE.test(file)) continue;
        rows.push({ file, slot: item.slot, painted: item.painted, kind: item.kind });
        if (item.slot) {
          const pages = usage.get(item.slot) ?? new Set();
          pages.add(route);
          usage.set(item.slot, pages);
        } else if (item.painted) {
          const pages = unmanaged.get(file) ?? new Set();
          pages.add(route);
          unmanaged.set(file, pages);
        }
      }
      pageRows[route] = rows;
      const wired = rows.filter((row) => row.slot).length;
      console.log(
        `${route.padEnd(38)} ${status}  ${String(rows.length).padStart(3)} photos  ${String(wired).padStart(3)} on the dashboard`,
      );
    } catch (error) {
      failures.push(`${route} → ${String(error).split("\n")[0]}`);
      console.log(`${route.padEnd(38)} FAILED ${String(error).split("\n")[0]}`);
    }
  }
  await browser.close();

  /* The same photograph twice in a row reads as a mistake on the page.
     Only real pictures count: a poster, a CSS variable or a backdrop is the
     same photo as the image beside it, shown once. */
  const repeats = [];
  for (const [route, rows] of Object.entries(pageRows)) {
    const painted = rows.filter((row) => row.painted && row.file && row.kind === "img");
    for (let i = 1; i < painted.length; i += 1) {
      const current = painted[i];
      const previous = painted[i - 1];
      if (current.file !== previous.file) continue;
      repeats.push({
        route,
        file: current.file,
        slot: current.slot,
        previousSlot: previous.slot,
        /* One slot painted twice in a row, or two slots pointed at one file. */
        kind: current.slot && current.slot === previous.slot ? "same-slot" : "same-photo",
      });
    }
  }

  /* Each page's slots in the order the page paints them. */
  const pageSlots = {};
  for (const route of PAGES) {
    const rows = pageRows[route];
    if (!rows) continue;
    const ordered = [];
    const seen = new Set();
    for (const row of rows) {
      if (!row.slot) continue;
      const sourceSlot = sourceSlotForRoute(route, row.slot);
      if (seen.has(sourceSlot)) continue;
      seen.add(sourceSlot);
      ordered.push(sourceSlot);
    }
    if (ordered.length) pageSlots[route] = ordered;
  }

  const crawled = PAGES.filter((route) => pageRows[route]);
  const body = Object.entries(pageSlots)
    .map(
      ([route, slots]) =>
        `  ${JSON.stringify(route)}: [\n${slots.map((slot) => `    ${JSON.stringify(slot)},`).join("\n")}\n  ],`,
    )
    .join("\n");

  const file = `/**
 * Generated by scripts/audit-site-images.mjs — do not edit by hand.
 *
 * Every source image slot each live page paints, in the order a visitor meets
 * it. Shared source names are converted to page-owned dashboard slots at
 * runtime. Re-run the script (against a deployment) after changing where a photo
 * is used: \`node scripts/audit-site-images.mjs --base https://…\`.
 */

export const SITE_IMAGE_USAGE_SOURCE = ${JSON.stringify(BASE)};
export const SITE_IMAGE_USAGE_CRAWLED_AT = ${JSON.stringify(new Date().toISOString().slice(0, 10))};

/** Pages visited by the audit, in the order the dashboard lists them. */
export const SITE_IMAGE_PAGE_ORDER: readonly string[] = [
${crawled.map((page) => `  ${JSON.stringify(page)},`).join("\n")}
];

export const SITE_IMAGE_PAGE_SLOTS: Readonly<Record<string, readonly string[]>> = {
${body}
};
`;

  if (failures.length) {
    /* A page that did not answer would drop its photos from the map and make
       them look unused, so a partial crawl never rewrites it. */
    console.log("\nsome pages did not answer — the map on disk is left untouched");
  } else if (!REPORT_ONLY) {
    writeFileSync(OUT_FILE, file);
    console.log(
      `\nwrote ${OUT_FILE} (${usage.size} slots across ${crawled.length} pages)`,
    );
  }

  mkdirSync(dirname(REPORT_FILE), { recursive: true });
  writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        base: BASE,
        at: new Date().toISOString(),
        failures,
        unmanaged: [...unmanaged].map(([file, pages]) => ({ file, pages: [...pages] })),
        repeats,
        pages: pageRows,
      },
      null,
      1,
    ),
  );

  console.log(`\nphotos with no dashboard slot: ${unmanaged.size}`);
  for (const [image, pages] of unmanaged) {
    console.log(`  ${image}  ::  ${[...pages].join(" ")}`);
  }
  console.log(`\nsame photo twice in a row: ${repeats.length}`);
  for (const repeat of repeats) {
    const slots =
      repeat.kind === "same-slot"
        ? `${repeat.slot} twice`
        : `${repeat.previousSlot ?? "unmanaged"} → ${repeat.slot ?? "unmanaged"}`;
    console.log(`  ${repeat.route.padEnd(28)} ${repeat.file}  [${slots}]`);
  }
  if (failures.length) {
    console.log(`\npages that did not answer: ${failures.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
