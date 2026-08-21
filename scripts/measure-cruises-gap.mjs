import { chromium } from "playwright";

const url = "https://hathor-booking-system.vercel.app/cruises";
const logs = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", (msg) => {
  if (msg.text().includes("Dome bottom:")) logs.push(msg.text());
});

await page.goto(url, { waitUntil: "load", timeout: 90000 });
await page.waitForSelector("[data-cruises-scroll]", { timeout: 30000 });
await page.waitForTimeout(3000);

const metrics = await page.evaluate(async () => {
  const root = document.querySelector("[data-cruises-scroll]");
  const vh = window.innerHeight;
  const maxScroll = (root?.scrollHeight ?? 0) + vh * 2;
  for (let y = 0; y <= maxScroll; y += vh * 0.15) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => setTimeout(r, 800));

  const dome = root?.querySelector(".dome-container");
  const landing = root?.querySelector(".pt-sheet__landing");
  const next = document.querySelector(".next-section");
  const domeBottom =
    landing?.getBoundingClientRect().bottom ??
    dome?.getBoundingClientRect().bottom ??
    0;
  const nextTop = next?.getBoundingClientRect().top ?? 0;
  return {
    scrollY: window.scrollY,
    vh,
    sectionHeight: root?.getBoundingClientRect().height,
    sectionInlineHeight: root instanceof HTMLElement ? root.style.height : "",
    domeBottom,
    nextTop,
    gap: nextTop - domeBottom,
    marginTop: next ? getComputedStyle(next).marginTop : "",
    pastPin: root?.classList.contains("test-scroll-reveal--past-pin"),
  };
});

console.log(JSON.stringify({ logs, metrics }, null, 2));
await browser.close();
