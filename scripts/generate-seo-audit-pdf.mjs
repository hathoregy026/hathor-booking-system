import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "..", "docs", "seo", "audit-report.html");
const pdfPath = path.join(here, "..", "docs", "seo", "EasyTravEgypt-SEO-Audit-Report.pdf");

await mkdir(path.dirname(pdfPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
await browser.close();

console.log(`Wrote ${pdfPath}`);
