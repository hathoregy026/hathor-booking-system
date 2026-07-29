import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const paths = ["/", "/about", "/cruises"];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
});

const results = [];

for (const path of paths) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${base}${path}?heroScrollTest=${Date.now()}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForSelector(".home-hero-container", { timeout: 30_000 });
  await page.waitForFunction(
    () => document.documentElement.classList.contains("hero-motion-ready"),
    undefined,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(2_000);

  const hero = await page.evaluate(() => {
    const root = document.querySelector(".home-hero-container");
    const heading = root?.querySelector(".hero-heading");
    const button = root?.querySelector(".hero-button");
    const logo = root?.querySelector(".hathor-logo-split");
    const style = root ? getComputedStyle(root) : null;
    const visible = (element) => {
      if (!element) return false;
      const computed = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        computed.display !== "none" &&
        computed.visibility === "visible" &&
        Number(computed.opacity) >= 0.99 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    return {
      titleTexts: [...(heading?.querySelectorAll(".hero-line") ?? [])]
        .map((line) => line.textContent?.trim() ?? "")
        .filter(Boolean),
      headingVisible: visible(heading),
      buttonVisible: visible(button),
      desktopVariant: logo?.getAttribute("data-hathor-logo-parts") ?? null,
      mobileVariant:
        logo?.getAttribute("data-hathor-logo-parts-mobile") ?? null,
      tune: {
        size: style?.getPropertyValue("--hathor-logo-size").trim() ?? "",
        y: style?.getPropertyValue("--hathor-logo-y").trim() ?? "",
        ctaY:
          style?.getPropertyValue("--hathor-cta-y-nudge").trim() ?? "",
      },
      hasLenis: document.documentElement.classList.contains("lenis"),
    };
  });

  const sampling = page.evaluate(
    () =>
      new Promise((resolve) => {
        const samples = [];
        let frames = 0;
        const sample = (time) => {
          samples.push({ time, y: window.scrollY });
          frames += 1;
          if (frames < 140) requestAnimationFrame(sample);
          else resolve(samples);
        };
        requestAnimationFrame(sample);
      }),
  );
  await page.waitForTimeout(50);
  await page.mouse.wheel(0, 720);
  const samples = await sampling;

  const frameMoves = samples.slice(1).map((sample, index) => ({
    dy: sample.y - samples[index].y,
    dt: sample.time - samples[index].time,
  }));
  const reversals = frameMoves.filter(({ dy }) => dy < -0.5).length;
  const jumps = frameMoves.filter(({ dy }) => Math.abs(dy) > 80).length;
  const longFrames = frameMoves.filter(({ dt }) => dt > 50).length;
  const movingFrames = frameMoves.filter(({ dy }) => Math.abs(dy) > 0.1).length;
  const maxFrameDelta = Math.max(
    0,
    ...frameMoves.map(({ dy }) => Math.abs(dy)),
  );
  const maxVelocity = Math.max(
    0,
    ...frameMoves.map(({ dy, dt }) => (dt > 0 ? Math.abs(dy) / dt : 0)),
  );

  const failures = [];
  if (hero.titleTexts.length !== 2) failures.push("expected exactly two hero titles");
  if (!hero.headingVisible) failures.push("hero titles are not visible");
  if (!hero.buttonVisible) failures.push("Book Now is not visible");
  if (!hero.hasLenis) failures.push("Lenis is not active");
  if (pageErrors.length) failures.push("page emitted runtime errors");
  if (reversals > 0) failures.push(`scroll reversed on ${reversals} frames`);
  if (movingFrames < 15) failures.push("scroll did not animate smoothly");

  results.push({
    path,
    hero,
    scroll: {
      start: samples[0]?.y ?? 0,
      end: samples.at(-1)?.y ?? 0,
      reversals,
      jumps,
      longFrames,
      movingFrames,
      maxFrameDelta,
      maxVelocity,
    },
    pageErrors,
    failures,
  });

  await page.close();
}

const homepage = results[0]?.hero;
const homepageScroll = results[0]?.scroll;
for (const result of results.slice(1)) {
  if (result.hero.desktopVariant !== homepage.desktopVariant) {
    result.failures.push("desktop logo variant does not match homepage");
  }
  if (result.hero.mobileVariant !== homepage.mobileVariant) {
    result.failures.push("mobile logo variant does not match homepage");
  }
  if (JSON.stringify(result.hero.tune) !== JSON.stringify(homepage.tune)) {
    result.failures.push("logo tune does not match homepage");
  }
  if (result.scroll.maxVelocity > homepageScroll.maxVelocity * 1.2 + 0.1) {
    result.failures.push("scroll velocity is less stable than homepage");
  }
  if (
    Math.abs(result.scroll.movingFrames - homepageScroll.movingFrames) > 12
  ) {
    result.failures.push("scroll settling time does not match homepage");
  }
}

console.log(JSON.stringify({ base, results }, null, 2));
await browser.close();

if (results.some((result) => result.failures.length > 0)) {
  process.exitCode = 1;
}
