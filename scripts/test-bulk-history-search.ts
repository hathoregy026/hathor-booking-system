import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";
import { bulkTemplateDefaults } from "../lib/bulk-email-render";
import { getDefaultEmailTemplate } from "../lib/email-templates";
import type { BulkCampaignView } from "../lib/bulk-email-types";

// Real Email history page with synthetic campaigns. Never starts Next,
// contacts a database or provider, or sends anything.
const root = process.cwd();
const shots = process.env.QA_SHOTS || ".tmp-bulk-history-search";
const at = (daysAgo: number, time: string) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); const [h, m, s] = time.split(":").map(Number); d.setHours(h, m, s, 0); return d.toISOString(); };
const day = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const campaign = (id: string, subject: string, sentDaysAgo: number, time: string, emails: string[], mode: "send" | "preview" = "send"): BulkCampaignView => ({
  id, subject, message: "Synthetic message.", mode, status: mode === "send" ? "accepted" : "simulated",
  recipients: emails.map(email => ({ email, status: email.startsWith("left") ? "skipped" : mode === "send" ? "accepted" : "simulated" })),
  createdAt: at(sentDaysAgo, time), updatedAt: at(sentDaysAgo, time), firstAttemptAt: at(sentDaysAgo, time),
});
const campaigns = [
  campaign("00000000-0000-4000-8000-000000000003", "Christmas & New Year aboard Hathor", 1, "14:14:52", ["maria.guest@example.com", "left.guest@example.com", "third.guest@example.com"]),
  campaign("00000000-0000-4000-8000-000000000002", "The Freedom of an Exclusive Nile Experience", 6, "16:16:05", ["maria.guest@example.com", "other.guest@example.com"]),
  campaign("00000000-0000-4000-8000-000000000001", "20% off", 20, "19:08:40", ["solo.guest@example.com"]),
  campaign("00000000-0000-4000-8000-000000000004", "book now", 25, "22:24:35", ["maria.guest@example.com"], "preview"),
];
const theme = getDefaultEmailTemplate("BookingMessage");
const client = await build({ stdin: { contents: 'import React from "react";import {createRoot} from "react-dom/client";import {BulkEmails} from "./components/admin/BulkEmails";createRoot(document.getElementById("root")).render(<BulkEmails/>);', resolveDir: root, loader: "tsx" }, bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent" });
const css = await readFile(path.join(root, "app/admin/(panel)/bulk-emails/bulk-emails.css"), "utf8");
const server = createServer((req, res) => {
  const url = new URL(req.url!, "http://localhost");
  if (url.pathname === "/api/admin/bulk-emails") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ settings: { mode: "send", from: "Synthetic test <test@example.org>", replyTo: "", recipientLimit: 100 }, campaigns, template: bulkTemplateDefaults(theme) })); return; }
  if (url.pathname === "/editor.js") { res.setHeader("Content-Type", "application/javascript"); res.end(client.outputFiles[0].text); return; }
  if (url.pathname === "/") { res.setHeader("Content-Type", "text/html"); res.end(`<html><head><style>:root{--bg-primary:#0b0b0b;--bg-secondary:#161616;--bg-glass:#121212;--text-primary:#f2efe8;--text-secondary:#b9b3a6;--accent:#b69f64;--border:#2c2c2c;--border-strong:#3a3a3a;--success:#5fbf86;--success-bg:#173322;--warning:#e2b25a;--warning-bg:#3a2d12}*{box-sizing:border-box}body{margin:0;padding:24px;background:var(--bg-primary);color:var(--text-primary);font-family:sans-serif}button{background:transparent;color:inherit;border:0;font:inherit}input{border:1px solid var(--border);color:inherit;background:var(--bg-primary)}.btn-outline{padding:10px 16px;border:1px solid var(--border)}${css}</style></head><body><div id="root"></div><script src="/editor.js"></script></body></html>`); return; }
  res.statusCode = 404; res.end();
});
await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(origin);
    // The harness lacks the dashboard shell styles that reveal the header tools, so open history directly.
    await page.locator(".bulk-emails__history-link").evaluate((button: HTMLButtonElement) => button.click());
    const results = page.locator(".bulk-emails__history-search");
    await results.getByText("Who received what, and when").waitFor();
    const rows = page.locator(".bulk-emails__history-row");
    assert.equal(await rows.count(), 4);
    const search = page.locator("#bulk-history-search");

    // An address finds every email it received, with the exact send time and its outcome.
    await search.fill("MARIA.guest@");
    await results.getByText("3 matches").waitFor();
    assert.equal(await rows.count(), 3, "the list narrows to the emails she received");
    assert.match(await results.locator(".bulk-emails__search-when strong").first().innerText(), /14:14:52/);
    assert.equal(await results.locator(".bulk-emails__search-status").first().innerText(), "Accepted");
    await results.getByText("Preview · no email sent").waitFor();
    await page.screenshot({ path: `${shots}/history-search-${width}.png`, fullPage: true });

    // Real sends only.
    await page.getByRole("button", { name: "Real sends", exact: true }).click();
    await results.getByText("2 matches").waitFor();
    await page.getByRole("button", { name: "All", exact: true }).click();

    // Dates narrow by the sender's calendar day, inclusive at both ends.
    await page.locator("#bulk-history-from").fill(day(6));
    await page.locator("#bulk-history-to").fill(day(6));
    await results.getByText("1 match").waitFor();
    assert.match(await results.locator(".bulk-emails__search-what").first().innerText(), /Freedom of an Exclusive Nile/);
    await page.locator("#bulk-history-from").fill(day(0));
    await page.locator("#bulk-history-to").fill("");
    await results.getByText("No matches").waitFor();
    await rows.first().waitFor({ state: "detached" });

    // Dates alone list every email sent in the range.
    await search.fill("");
    await page.locator("#bulk-history-from").fill(day(30));
    await results.getByText("4 matches").waitFor();
    await results.getByText("All 3 recipients").waitFor();

    // Skipped recipients say so; subjects are searchable; unknown addresses say no.
    await search.fill("left.guest");
    await results.getByText("Skipped · unsubscribed").waitFor();
    await search.fill("20% off");
    await results.getByText("All 1 recipients").waitFor();
    await search.fill("nobody@example.com");
    await results.getByText("No bulk email in this history matches", { exact: false }).waitFor();

    // A result opens its email; the way back keeps the search.
    await search.fill("maria.guest@example.com");
    await results.locator(".bulk-emails__search-hits button").first().click();
    await page.locator(".bulk-emails__result").getByText(/^Sent .*14:14:52/).waitFor();
    await page.getByRole("button", { name: "Back to search results" }).click();
    await results.getByText("3 matches").waitFor();
    await page.getByRole("button", { name: "Clear search" }).click();
    await results.getByText("Who received what, and when").waitFor();
    assert.equal(await rows.count(), 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, "no sideways scroll");
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`${width}px passed`);
  }
  console.log("Bulk history search tests passed: address and subject search, exact send times, real-send filter, date range, outcomes, open and return.");
} finally { await browser.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
