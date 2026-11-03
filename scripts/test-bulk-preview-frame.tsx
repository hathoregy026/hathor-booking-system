import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import { isolateBulkPreview } from "../lib/bulk-email-preview";

/** Simulate a protected Preview asset: SameSite cookies must reach the generated mail frame. */
async function main() {
  const origin = "https://protected-mail-preview.test";
  const bundle = await build({ stdin: { contents: 'import React from "react";import {createRoot} from "react-dom/client";import {BulkEmails} from "./components/admin/BulkEmails";createRoot(document.getElementById("root")).render(<BulkEmails/>);', resolveDir: process.cwd(), loader: "tsx" }, bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" } });
  const html = isolateBulkPreview('<html><head></head><body><img alt="Hathor" src="https://www.hathorcruise.com/email/bulk-journal/icon.png"><p>Generated template</p><script>parent.bulkInjected=true</script></body></html>', origin);
  const image = await readFile("public/email/bulk-journal/icon.png");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies([{ name: "preview-auth", value: "synthetic", url: origin, sameSite: "Strict", secure: true }]);
    const page = await context.newPage();
    let authorizedImages = 0;
    await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.fulfill({ status: 403, body: "Unexpected origin" });
      if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
      if (url.pathname === "/api/admin/bulk-emails") return route.fulfill({ json: { settings: { mode: "preview", from: "team@example.com", replyTo: "team@example.com", recipientLimit: 100 }, campaigns: [], template: { eyebrow: "A note", heading: "Hathor", showBanner: true, primaryColor: "#b69f64", backgroundColor: "#faf8f5", signature: "The team", footer: { tagline: "The Nile", email: "team@example.com", phone: "", replyNote: "Reply", copyright: "Hathor" } } } });
      if (url.pathname === "/api/admin/bulk-emails/preview") return route.fulfill({ json: { html } });
      if (url.pathname === "/email/bulk-journal/icon.png") {
        if (!route.request().headers().cookie?.includes("preview-auth=synthetic")) return route.fulfill({ status: 401, body: "Protected image" });
        authorizedImages++;
        return route.fulfill({ contentType: "image/png", body: image });
      }
      if (url.pathname === "/admin/bulk-emails") return route.fulfill({ contentType: "text/html", body: '<html><head><meta charset="utf-8"></head><body><div id="root"></div><script src="/app.js"></script></body></html>' });
      return route.fulfill({ status: 404, body: "Not found" });
    });
    await page.goto(origin + "/admin/bulk-emails");
    await page.getByRole("button", { name: "Preview email template", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    const logo = page.frameLocator('iframe[title="Email template modal preview"]').getByRole("img", { name: "Hathor", exact: true });
    await logo.waitFor();
    for (let attempt = 0; attempt < 30 && !(await logo.evaluate((element: HTMLImageElement) => element.complete)); attempt++) await new Promise(resolve => setTimeout(resolve, 100));
    assert.ok(await logo.evaluate((element: HTMLImageElement) => element.naturalWidth > 0), "Protected images must load in the generated template preview");
    assert.ok(authorizedImages > 0, "The SameSite Preview credential reaches only its own asset origin");
    assert.equal(await page.evaluate(() => "bulkInjected" in window), false, "Template frames must never execute scripts");
    await context.close();
    console.log("Bulk preview frame tests passed: protected images load; scripts remain blocked; no email is sent.");
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : "Bulk preview frame test failed"); process.exitCode = 1; });
