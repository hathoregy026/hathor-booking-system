import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/homepage-2`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(3000);

const report = await page.evaluate(async () => {
  const footer = document.querySelector(".owo-footer");
  const creamFloor = document.querySelector(".homepage-2-cream-floor");
  const pinSpacer = document.querySelector(".pin-spacer");
  const backLogo = document.querySelector(".homepage-2-back-logo");
  const main = document.querySelector(".public-main");

  const maxScroll = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );

  const samples = [];
  for (const ratio of [0.55, 0.72, 0.88, 1]) {
    window.scrollTo(0, Math.round(maxScroll * ratio));
    await new Promise((r) => setTimeout(r, 250));
    const footerRect = footer?.getBoundingClientRect();
    const creamRect = creamFloor?.getBoundingClientRect();
    const probeY = Math.min(
      window.innerHeight - 120,
      Math.max(120, (footerRect?.top ?? window.innerHeight) - 4),
    );
    const el = document.elementFromPoint(window.innerWidth / 2, probeY);
    samples.push({
      ratio,
      scrollY: window.scrollY,
      creamToFooterGap:
        footerRect && creamRect ? footerRect.top - creamRect.bottom : null,
      probeY,
      probeEl: el ? `${el.tagName}.${String(el.className).slice(0, 80)}` : null,
      probeBg: el ? getComputedStyle(el).backgroundColor : null,
      pinSpacerBg: pinSpacer ? getComputedStyle(pinSpacer).backgroundColor : null,
      stageBg: document.querySelector(".pt-stage")
        ? getComputedStyle(document.querySelector(".pt-stage")).backgroundColor
        : null,
    });
  }

  window.scrollTo(0, maxScroll);
  await new Promise((r) => setTimeout(r, 400));

  const footerRect = footer?.getBoundingClientRect();
  const creamRect = creamFloor?.getBoundingClientRect();
  const gapProbeY = (footerRect?.top ?? 0) - 2;
  const elAtGap = document.elementFromPoint(window.innerWidth / 2, gapProbeY);
  const styles = elAtGap ? getComputedStyle(elAtGap) : null;

  return {
    hasCreamFloor: Boolean(creamFloor),
    hasBackLogo: Boolean(backLogo),
    backLogoDisplay: backLogo ? getComputedStyle(backLogo).display : null,
    backLogoOpacity: backLogo ? getComputedStyle(backLogo).opacity : null,
    pinSpacerBg: pinSpacer ? getComputedStyle(pinSpacer).backgroundColor : null,
    mainBg: main ? getComputedStyle(main).backgroundColor : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    footerTop: footerRect?.top,
    creamBottom: creamRect?.bottom,
    creamToFooterGap: footerRect && creamRect ? footerRect.top - creamRect.bottom : null,
    elementAboveFooter: elAtGap
      ? `${elAtGap.tagName}.${elAtGap.className}`.slice(0, 120)
      : null,
    elementAboveFooterBg: styles?.backgroundColor ?? null,
    scrollHeight: document.documentElement.scrollHeight,
    maxScroll,
    samples,
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
