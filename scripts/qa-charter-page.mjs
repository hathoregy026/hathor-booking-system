/**
 * Production QA for /charter — viewports, overflow, form, a11y, reduced-motion.
 * Usage: node scripts/qa-charter-page.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3457";
const OUT = path.join("scripts", "qa-charter-out");

const VIEWPORTS = [
  { name: "1600x1000", width: 1600, height: 1000 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1024x1366", width: 1024, height: 1366 },
  { name: "834x1194", width: 834, height: 1194 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "430x932", width: 430, height: 932 },
  { name: "390x844", width: 390, height: 844 },
  { name: "375x812", width: 375, height: 812 },
  { name: "360x800", width: 360, height: 800 },
  { name: "320x568", width: 320, height: 568 },
];

const report = {
  base: BASE,
  viewports: [],
  interactions: {},
  form: {},
  reducedMotion: {},
  console: [],
  errors: [],
};

async function measurePage(page, name) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;

    const nav = document.querySelector("header, [data-site-nav], .site-nav, nav");
    const heroContent = document.querySelector(".charter-hero__content");
    const heroH1 = document.querySelector(".charter-hero h1");
    let heroNavCollision = false;
    if (nav && heroContent) {
      const nr = nav.getBoundingClientRect();
      const hr = heroContent.getBoundingClientRect();
      heroNavCollision = hr.top < nr.bottom - 2;
    }

    const hiddenReveals = [...document.querySelectorAll("[data-charter-reveal]")].filter(
      (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.05,
    ).length;

    const inputs = [...document.querySelectorAll(".charter-form__input, .charter-form__textarea, .charter-form__select")];
    const smallInputs = inputs
      .map((el) => ({
        name: el.getAttribute("name"),
        fontSize: Number.parseFloat(getComputedStyle(el).fontSize),
      }))
      .filter((item) => item.fontSize > 0 && item.fontSize < 16);

    const finalImg = document.querySelector(".charter-final__img");
    const heroImg = document.querySelector(".charter-hero__img");
    const finalSrc = finalImg?.getAttribute("src") || "";
    const heroSrc = heroImg?.getAttribute("src") || "";

    return {
      overflowX,
      heroNavCollision,
      heroTop: heroContent?.getBoundingClientRect().top ?? null,
      navBottom: nav?.getBoundingClientRect().bottom ?? null,
      h1Text: heroH1?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      hiddenReveals,
      smallInputs,
      finalDistinct: Boolean(finalSrc) && Boolean(heroSrc) && finalSrc !== heroSrc,
      hasCharterRoot: Boolean(document.querySelector("[data-charter-page]")),
      hasFooter: Boolean(document.querySelector("footer, .lux-footer")),
      hasNewsletter: Boolean(
        document.querySelector(
          'form[aria-label*="newsletter" i], .lux-footer form, [data-footer-subscribe], input[name="email"]',
        ),
      ),
    };
  });

  return { name, ...metrics };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      report.console.push({ type: "error", text: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    report.errors.push(String(err));
  });

  // Viewport screenshots + metrics
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${BASE}/charter`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    // Scroll through page so once-reveals can fire.
    await page.evaluate(async () => {
      const step = Math.max(240, Math.floor(window.innerHeight * 0.65));
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForFunction(() => window.scrollY <= 1, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(250);
    const shot = path.join(OUT, `${vp.name}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    const metrics = await measurePage(page, vp.name);
    // Re-check reveals after scroll pass (at top: only near-fold must be visible)
    const afterScrollHidden = await page.evaluate(() => {
      return [...document.querySelectorAll("[data-charter-reveal]")].filter((el) => {
        const rect = el.getBoundingClientRect();
        const inOrAboveFold = rect.top < window.innerHeight * 0.95;
        const opacity = Number.parseFloat(getComputedStyle(el).opacity);
        return inOrAboveFold && opacity < 0.05;
      }).length;
    });
    report.viewports.push({
      ...metrics,
      hiddenRevealsInFold: afterScrollHidden,
      screenshot: shot,
    });
  }

  // Interaction tests at desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Keyboard route selection
  await page.locator("#charter-route-0").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const selectedAfterKeys = await page.evaluate(() => {
    const checked = document.querySelector(
      'input[name="charterPreferredRoute"]:checked',
    );
    const formSelect = document.querySelector('select[name="preferredRoute"]');
    return {
      radio: checked?.value ?? null,
      select: formSelect?.value ?? null,
      synced: checked?.value === formSelect?.value,
    };
  });
  report.interactions.keyboardRoutes = selectedAfterKeys;

  // Click another route and verify sync
  await page.locator('label[for="charter-route-3"]').click();
  const selectedAfterClick = await page.evaluate(() => {
    const checked = document.querySelector(
      'input[name="charterPreferredRoute"]:checked',
    );
    const formSelect = document.querySelector('select[name="preferredRoute"]');
    return {
      radio: checked?.value ?? null,
      select: formSelect?.value ?? null,
      synced: checked?.value === formSelect?.value,
    };
  });
  report.interactions.clickRouteSync = selectedAfterClick;

  // Invalid form → focus first invalid
  await page.locator("#charter-request").scrollIntoViewIfNeeded();
  await page.locator('button.charter-form__submit').click();
  await page.waitForTimeout(200);
  const invalidFocus = await page.evaluate(() => {
    const active = document.activeElement;
    const live = document.querySelector(".charter-form__status");
    return {
      activeName: active?.getAttribute("name") ?? active?.tagName ?? null,
      ariaLive: live?.getAttribute("aria-live") ?? null,
      statusText: live?.textContent?.trim() ?? "",
      roleStatus: live?.getAttribute("role") ?? null,
    };
  });
  report.form.invalidFocus = invalidFocus;

  // Valid submission (API may skip Resend)
  await page.fill('input[name="name"]', "QA Charter Guest");
  await page.fill('input[name="email"]', "qa-charter@example.com");
  await page.fill('textarea[name="message"]', "Private voyage inquiry for QA automation.");
  const routeValue = await page.locator('select[name="preferredRoute"]').inputValue();

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/contact") && res.request().method() === "POST"),
    page.locator('button.charter-form__submit').click(),
  ]);
  const apiJson = await response.json().catch(() => null);
  const postBody = response.request().postDataJSON();
  report.form.submit = {
    status: response.status(),
    ok: response.ok(),
    apiJson,
    preferredRouteInBody: postBody?.preferredRoute ?? null,
    expectedRoute: routeValue,
    preferredRouteMatched: postBody?.preferredRoute === routeValue,
  };
  await page.waitForTimeout(400);
  report.form.successUi = await page.evaluate(() => {
    const success = document.querySelector(".charter-form__success");
    return {
      visible: Boolean(success),
      ariaLive: success?.getAttribute("aria-live") ?? null,
      text: success?.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) ?? "",
    };
  });

  // Empty preferredRoute omission (API unit-ish via fetch)
  const omitRes = await page.evaluate(async () => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "charter",
        name: "Omit Route",
        email: "omit-route@example.com",
        message: "Testing empty preferred route omission path.",
        preferredRoute: "",
      }),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  });
  report.form.emptyPreferredRoute = omitRes;

  // Invalid preferredRoute rejected
  const badRoute = await page.evaluate(async () => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "charter",
        name: "Bad Route",
        email: "bad-route@example.com",
        message: "Testing invalid preferred route rejection path.",
        preferredRoute: "Not A Real Route",
      }),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  });
  report.form.invalidPreferredRoute = badRoute;

  // Reduced motion
  const rmContext = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE}/charter`, { waitUntil: "networkidle" });
  await rmPage.waitForTimeout(300);
  report.reducedMotion = await rmPage.evaluate(() => {
    const reveals = [...document.querySelectorAll("[data-charter-reveal]")];
    const hidden = reveals.filter(
      (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.95,
    ).length;
    const motionAttr = document
      .querySelector("[data-charter-page]")
      ?.getAttribute("data-charter-motion");
    return {
      revealCount: reveals.length,
      hiddenReveals: hidden,
      motionAttr: motionAttr ?? null,
    };
  });
  await rmPage.screenshot({
    path: path.join(OUT, "390x844-reduced-motion.png"),
    fullPage: false,
  });
  await rmContext.close();

  // Other route unaffected smoke
  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
  report.interactions.contactStillLoads = page.url().includes("/contact");

  await browser.close();

  const outFile = path.join(OUT, "report.json");
  await fs.writeFile(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outFile}`);

  const overflowFails = report.viewports.filter((v) => v.overflowX > 1);
  const collisionFails = report.viewports.filter(
    (v) => v.heroNavCollision && (v.heroTop ?? 0) >= 0,
  );
  const foldHiddenFails = report.viewports.filter(
    (v) => (v.hiddenRevealsInFold ?? 0) > 0,
  );
  if (
    overflowFails.length ||
    collisionFails.length ||
    foldHiddenFails.length ||
    report.errors.length
  ) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
