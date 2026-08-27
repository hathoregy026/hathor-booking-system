#!/usr/bin/env node
/**
 * Responsive public-site QA.
 *
 * Usage:
 *   node scripts/qa-mobile-site.mjs [baseUrl] [viewport names]
 *
 * Examples:
 *   node scripts/qa-mobile-site.mjs https://example.com phone-390,tablet-768
 *   node scripts/qa-mobile-site.mjs http://localhost:3000 all
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const requested = process.argv[3] ?? "all";
const outputRoot = path.resolve(".next", "mobile-qa");

const ROUTES = [
  "/",
  "/cruises",
  "/rooms",
  "/luxury-cabins-Nile-Cruise",
  "/royal-suites",
  "/highlights",
  "/about",
  "/gastronomy",
  "/wellness",
  "/charter",
  "/partners",
  "/contact",
  "/blogs",
  "/blogs/secret-spots-between-luxor-and-aswan",
  "/book",
  "/booking",
];

const VIEWPORTS = {
  "phone-320": { width: 320, height: 568, isMobile: true, hasTouch: true },
  "phone-390": { width: 390, height: 844, isMobile: true, hasTouch: true },
  "phone-480": { width: 480, height: 900, isMobile: true, hasTouch: true },
  "tablet-768": { width: 768, height: 1024, isMobile: true, hasTouch: true },
  "tablet-1024": { width: 1024, height: 768, isMobile: true, hasTouch: true },
  "desktop-1440": {
    width: 1440,
    height: 900,
    isMobile: false,
    hasTouch: false,
  },
};

const selectedNames =
  requested === "all"
    ? Object.keys(VIEWPORTS)
    : requested
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value in VIEWPORTS);

if (selectedNames.length === 0) {
  throw new Error(`Unknown viewport selection: ${requested}`);
}

function routeSlug(route) {
  return route === "/"
    ? "home"
    : route
        .replace(/^\/|\/$/g, "")
        .replaceAll("/", "--")
        .replaceAll(/[^a-zA-Z0-9-]/g, "-");
}

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewportName of selectedNames) {
  const viewport = VIEWPORTS[viewportName];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    reducedMotion: "no-preference",
    colorScheme: "light",
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    let status = 0;
    let navigationError = null;
    try {
      const response = await page.goto(
        `${base}${route}${route.includes("?") ? "&" : "?"}mobileQa=${Date.now()}`,
        { waitUntil: "domcontentloaded", timeout: 120_000 },
      );
      status = response?.status() ?? 0;
      await page.waitForTimeout(1_800);
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
    }

    let metrics = null;
    if (!navigationError) {
      try {
        await page.waitForTimeout(1_200);
        metrics = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const isVisible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) > 0.01 &&
              rect.width > 0 &&
              rect.height > 0
            );
          };
          const selectorFor = (element) => {
            if (!(element instanceof Element)) return "";
            if (element.id) return `#${element.id}`;
            const classes = [...element.classList].slice(0, 3).join(".");
            return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}`;
          };

          const overflowElements = [...document.querySelectorAll("body *")]
            .filter((element) => {
              if (!isVisible(element)) return false;
              const style = getComputedStyle(element);
              if (style.position === "fixed") return false;
              const rect = element.getBoundingClientRect();
              return rect.left < -2 || rect.right > viewportWidth + 2;
            })
            .slice(0, 30)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                selector: selectorFor(element),
                left: Math.round(rect.left * 10) / 10,
                right: Math.round(rect.right * 10) / 10,
                width: Math.round(rect.width * 10) / 10,
              };
            });

          const smallControls = [
            ...document.querySelectorAll(
              "button, [role='button'], input:not([type='hidden']), select, textarea",
            ),
          ]
            .filter(isVisible)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width < 44 || rect.height < 44;
            })
            .slice(0, 30)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                selector: selectorFor(element),
                width: Math.round(rect.width * 10) / 10,
                height: Math.round(rect.height * 10) / 10,
              };
            });

          const undersizedInputs = [
            ...document.querySelectorAll(
              "input:not([type='hidden']), select, textarea",
            ),
          ]
            .filter(isVisible)
            .filter(
              (element) => Number.parseFloat(getComputedStyle(element).fontSize) < 16,
            )
            .map((element) => ({
              selector: selectorFor(element),
              fontSize: getComputedStyle(element).fontSize,
            }));

          const hero = document.querySelector(".home-hero-container");
          const heroRect = hero?.getBoundingClientRect();
          const logo = hero?.querySelector(".hero-logo-mark");
          const cta = hero?.querySelector(".hero-cta");

          return {
            viewport: { width: viewportWidth, height: viewportHeight },
            document: {
              clientWidth: root.clientWidth,
              scrollWidth: Math.max(
                root.scrollWidth,
                body?.scrollWidth ?? 0,
              ),
              scrollHeight: Math.max(
                root.scrollHeight,
                body?.scrollHeight ?? 0,
              ),
              horizontalOverflow: Math.max(
                0,
                Math.max(root.scrollWidth, body?.scrollWidth ?? 0) -
                  root.clientWidth,
              ),
            },
            bodyFontSize: getComputedStyle(body).fontSize,
            touchClass:
              root.classList.contains("is-touch-device") ||
              body.classList.contains("is-touch-device"),
            lenis: root.classList.contains("lenis"),
            pinSpacers: document.querySelectorAll(".pin-spacer").length,
            mobileStripes: document.querySelectorAll(
              ".blind-strip-v--mobile",
            ).length,
            hero: heroRect
              ? {
                  height: Math.round(heroRect.height),
                  logoVisible: isVisible(logo),
                  ctaVisible: isVisible(cta),
                }
              : null,
            overflowElements,
            smallControls,
            undersizedInputs,
          };
        });
      } catch (error) {
        navigationError =
          error instanceof Error ? error.message : String(error);
      }
    }

    const slug = routeSlug(route);
    const screenshotDir = path.join(outputRoot, viewportName);
    await mkdir(screenshotDir, { recursive: true });

    if (!navigationError) {
      try {
        await page.screenshot({
          path: path.join(screenshotDir, `${slug}--fold.png`),
          fullPage: false,
          animations: "disabled",
        });
      } catch (error) {
        navigationError =
          error instanceof Error ? error.message : String(error);
      }
    }

    results.push({
      viewport: viewportName,
      route,
      status,
      navigationError,
      pageErrors,
      consoleErrors,
      metrics,
    });

    const overflow = metrics?.document.horizontalOverflow ?? 0;
    const failReasons = [];
    if (navigationError) failReasons.push(`nav:${navigationError.slice(0, 80)}`);
    if (status >= 400 || status === 0) failReasons.push(`status=${status}`);
    if (pageErrors.length) failReasons.push(`pageErrors=${pageErrors.length}`);
    if (overflow > 2) failReasons.push(`overflow=${overflow}`);
    if ((metrics?.undersizedInputs.length ?? 0) > 0) {
      failReasons.push(`inputs<16px=${metrics.undersizedInputs.length}`);
    }
    const mark = failReasons.length ? "FAIL" : "OK";
    console.log(
      `[${mark}] ${viewportName.padEnd(11)} ${route.padEnd(48)} ` +
        `status=${status} overflow=${overflow}px pins=${metrics?.pinSpacers ?? "-"} ` +
        `heroLogo=${metrics?.hero?.logoVisible ?? "-"} cta=${metrics?.hero?.ctaVisible ?? "-"}` +
        (failReasons.length ? ` :: ${failReasons.join("; ")}` : ""),
    );

    await page.close();
  }

  await context.close();
}

await browser.close();

const reportPath = path.join(outputRoot, "report.json");
await writeFile(reportPath, JSON.stringify({ base, results }, null, 2));
console.log(`\nReport: ${reportPath}`);

const hardFailures = results.filter(
  (result) =>
    result.navigationError ||
    result.status >= 400 ||
    result.pageErrors.length > 0 ||
    (result.metrics?.document.horizontalOverflow ?? 0) > 2 ||
    (result.metrics?.undersizedInputs.length ?? 0) > 0,
);

if (hardFailures.length > 0) {
  process.exitCode = 1;
}
