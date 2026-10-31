import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";
import { load } from "cheerio";
import { bulkTemplateDefaults, renderBulkMessage } from "../lib/bulk-email-render";
import { bulkFieldIssues, bulkMessageSchema, bulkTemplateSchema } from "../lib/bulk-email-validation";
import { BULK_JOURNAL_MESSAGE, BULK_JOURNAL_IMAGE_PATHS } from "../lib/bulk-email-journal";
import { getDefaultEmailTemplate } from "../lib/email-templates";
import { isolateBulkPreview } from "../lib/bulk-email-preview";

const root = process.cwd();
const theme = getDefaultEmailTemplate("BookingMessage");
const unchangedTheme = structuredClone(theme);
const defaults = bulkTemplateDefaults(theme);
assert.ok(bulkTemplateSchema.safeParse(defaults).success);
const original = await renderBulkMessage("Your private Nile journey", BULK_JOURNAL_MESSAGE, theme, "https://example.org/unsubscribe", defaults);
const markup = load(original.html);
assert.equal(markup("[data-bulk-section]").length, 6);
assert.equal(markup("img").length, 5);
assert.ok(original.html.includes("/email/bulk-journal/bar.jpg"));
assert.ok(original.html.includes("THE NILE,<br"));
assert.ok(original.text.includes("Only 32 guests"));
assert.deepEqual(theme, unchangedTheme);
assert.notEqual(bulkTemplateDefaults(theme).journal, defaults.journal);
for (const unsafe of ["javascript:alert(1)", "data:text/html,bad", "http://example.org/", "https://127.0.0.1/", "https://localhost/", "https://user:pass@example.org/"]) {
  const draft = structuredClone(defaults);
  draft.journal!.journeyButton.url = unsafe;
  assert.equal(bulkTemplateSchema.safeParse(draft).success, false);
}
const changed = structuredClone(defaults);
changed.journal!.journeyButton.url = "https://example.org/a-chosen-voyage";
changed.heading = '<script>alert("unsafe")</script>\nA longer introduction';
changed.journal!.galleryBody = "Room for a longer story.\n".repeat(100);
const changedHtml = (await renderBulkMessage("Independent subject", "Your\nplain message", theme, undefined, bulkTemplateSchema.parse(changed))).html;
assert.ok(changedHtml.includes('href="https://example.org/a-chosen-voyage"'));
assert.ok(changedHtml.includes("&lt;script&gt;"));
assert.ok(!changedHtml.includes("<script>"));
const hidden = structuredClone(defaults);
hidden.showBanner = false;
for (const key of ["introImage", "galleryMainImage", "galleryUpperImage", "galleryLowerImage"] as const) hidden.journal![key].show = false;
hidden.journal!.discoverButton.url = "";
hidden.journal!.journeyButton.url = "";
const hiddenHtml = (await renderBulkMessage("No photos", BULK_JOURNAL_MESSAGE, theme, undefined, hidden)).html;
for (const asset of Object.values(BULK_JOURNAL_IMAGE_PATHS)) assert.ok(!hiddenHtml.includes(asset));
assert.ok(!hiddenHtml.includes("EXPLORE VOYAGES"));
const legacy = { ...defaults, journal: undefined };
assert.ok((await renderBulkMessage("Legacy campaign", "Legacy message", theme, undefined, legacy)).html.includes("Legacy campaign"));

// Real editor and real renderer, with synthetic local responses only. This
// never starts Next, contacts a database/provider, or sends a campaign.
const client = await build({ stdin: { contents: 'import React from "react";import {createRoot} from "react-dom/client";import {BulkEmails} from "./components/admin/BulkEmails";createRoot(document.getElementById("root")).render(<BulkEmails/>);', resolveDir: root, loader: "tsx" }, bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent" });
const css = await readFile(path.join(root, "app/admin/(panel)/bulk-emails/bulk-emails.css"), "utf8");
let origin = "";
const uploaded = `https://bulk-test.supabase.co/storage/v1/object/public/email-images/bulk-campaigns/${randomUUID()}/${randomUUID()}.jpg`;
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url!, origin);
    if (url.pathname === "/api/admin/bulk-emails") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ settings: { mode: "preview", from: "Synthetic test <test@example.org>", replyTo: "", recipientLimit: 100 }, campaigns: [], template: defaults })); return; }
    if (url.pathname === "/api/admin/bulk-emails/images") { for await (const _chunk of req) void _chunk; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ url: uploaded })); return; }
    if (url.pathname === "/api/admin/bulk-emails/import") { for await (const _chunk of req) void _chunk; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ emails: ["guest@example.org"], duplicates: 0, invalid: [], warnings: [] })); return; }
    if (url.pathname === "/api/admin/bulk-emails/preview") {
      const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const draft = bulkMessageSchema.parse(JSON.parse(Buffer.concat(chunks).toString()));
      const rendered = await renderBulkMessage(draft.subject, draft.message, theme, "https://example.org/unsubscribe", draft.template);
      res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ html: isolateBulkPreview(rendered.html, origin) })); return;
    }
    if (url.pathname === "/editor.js") { res.setHeader("Content-Type", "application/javascript"); res.end(client.outputFiles[0].text); return; }
    if (url.pathname === "/mail") { res.setHeader("Content-Type", "text/html"); res.end(isolateBulkPreview(original.html, origin)); return; }
    if (url.pathname === "/") { res.setHeader("Content-Type", "text/html"); res.end(`<html><head><style>:root{--bg-primary:#171811;--bg-secondary:#24251b;--bg-glass:#22231b;--text-primary:#ece8df;--text-secondary:#c0b9a7;--text-muted:#9b9483;--accent:#b69f64;--border:#49483b;}*{box-sizing:border-box}body{margin:0;padding:24px;background:var(--bg-primary);color:var(--text-primary)}button{background:transparent;color:inherit;border:0}input,textarea{border:1px solid var(--border)}.btn-outline{padding:12px 18px;border:1px solid var(--border)}${css}</style></head><body><div id="root"></div><script src="/editor.js"></script></body></html>`); return; }
    const allowed = new Set([...Object.values(BULK_JOURNAL_IMAGE_PATHS), "/email/bulk-journal/icon.png", "/fonts/more-fonts/Italiana-Regular.woff2", "/fonts/plus-jakarta-sans-login-latin.woff2"]);
    if (allowed.has(url.pathname as never)) { res.setHeader("Content-Type", url.pathname.endsWith(".woff2") ? "font/woff2" : url.pathname.endsWith(".png") ? "image/png" : "image/jpeg"); res.end(await readFile(path.join(root, "public", url.pathname))); return; }
    res.statusCode = 404; res.end();
  } catch { res.statusCode = 400; res.end(JSON.stringify({ error: "Check the template fields." })); }
});
await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await mkdir(".tmp-bulk-journal-qa", { recursive: true });
  for (const width of [1100, 680, 375, 320]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(`${origin}/mail`); await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal overflow at ${width}px`);
    assert.ok(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), "Exact photos load in isolated preview");
    await page.screenshot({ path: `.tmp-bulk-journal-qa/mail-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const uploadedImageBytes = await readFile(path.join(root, "public/email/bulk-journal/dining.jpg"));
  await page.route("https://bulk-test.supabase.co/**", route => route.fulfill({ contentType: "image/jpeg", body: uploadedImageBytes }));
  await page.goto(origin); await page.getByRole("button", { name: "Edit email", exact: true }).click();
  await page.locator("#bulk-subject").fill("A sender chosen subject");
  await page.getByText("Bulk preview up to date", { exact: true }).waitFor();
  const field = page.locator("#bulk-message"); const before = await field.evaluate(element => element.clientHeight);
  await field.fill("A longer introduction with room to breathe.\n".repeat(80));
  assert.ok(await field.evaluate(element => element.clientHeight) > before);
  assert.ok(await field.evaluate(element => element.scrollHeight <= element.clientHeight + 1), "Long copy is fully visible in its field");
  await page.locator("#bulk-journeyButton-url").fill("https://example.org/chosen-destination");
  await page.getByText("Bulk preview up to date", { exact: true }).waitFor();
  const preview = page.frameLocator('iframe[title="Branded bulk email preview"]');
  await preview.locator('a[href="https://example.org/chosen-destination"]').waitFor();
  await page.locator("#bulk-image-introImage").setInputFiles(path.join(root, "public/email/bulk-journal/dining.jpg"));
  await preview.locator(`img[src="${uploaded}"]`).waitFor();
  for (const name of ["Show hero banner", "Show dining image", "Show suite image", "Show sailing image", "Show bar image"]) await page.getByRole("checkbox", { name, exact: true }).uncheck();
  await page.getByText("Bulk preview up to date", { exact: true }).waitFor();
  assert.equal(await preview.locator("img").count(), 1, "Only the masthead mark remains when photos are hidden");
  assert.equal(await preview.locator("[background]").count(), 0);
  await page.getByRole("button", { name: "Use reference image" }).first().click();
  await preview.locator('img[src$="/email/bulk-journal/hero.jpg"]').waitFor();
  await page.screenshot({ path: ".tmp-bulk-journal-qa/editor.png", fullPage: true });

  // Every blocked step explains itself and names the field, instead of a silently disabled button.
  await page.goto(origin);
  const warning = page.locator(".bulk-emails__blockers");
  const next = page.getByRole("button", { name: "Write your message", exact: true });
  await next.click();
  await warning.getByText("Upload a list or add at least one email address.").waitFor();
  assert.equal(await page.locator("#bulk-paste").getAttribute("aria-invalid"), "true");
  await page.screenshot({ path: ".tmp-bulk-journal-qa/warning-recipients.png", fullPage: true });
  await page.locator("#bulk-paste").fill("guest@example.org");
  await warning.getByText("Select Add to include the addresses you pasted.").waitFor();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await warning.waitFor({ state: "detached" });
  await next.click();
  const review = page.getByRole("button", { name: "Review email", exact: true });
  await page.locator("#bulk-message").fill("");
  await review.click();
  await warning.getByText("2 things are needed before you can continue.").waitFor();
  await warning.getByRole("button", { name: /Email subject/ }).waitFor();
  await warning.getByRole("button", { name: /Introduction message/ }).click();
  await page.waitForFunction(() => document.activeElement?.id === "bulk-message");
  assert.equal(await page.locator("#bulk-subject").getAttribute("aria-invalid"), "true");
  await page.locator("#bulk-subject-issue").waitFor();
  await page.screenshot({ path: ".tmp-bulk-journal-qa/warning-message.png", fullPage: true });
  await page.locator("#bulk-subject").fill("A complete subject");
  await page.locator("#bulk-message").fill("A complete message");
  await warning.waitFor({ state: "detached" });
  await page.locator("#bulk-footer-email").fill("not-an-email");
  await page.locator("#bulk-discoverButton-url").fill("hathorcruise.com");
  await page.locator("#bulk-feature-0-title").fill("Tab\tinside");
  await review.click();
  await warning.getByRole("button", { name: /Footer email address/ }).getByText("Enter a valid email address, or leave this empty.").waitFor();
  await warning.getByRole("button", { name: /Discover button destination/ }).getByText("Use a public HTTPS destination", { exact: false }).waitFor();
  await warning.getByRole("button", { name: /Moment 01 title/ }).getByText("Remove tabs", { exact: false }).waitFor();
  // Optional fields really are optional: everything but subject and message may be empty.
  await page.locator("#bulk-feature-0-title").fill("");
  await page.locator("#bulk-discoverButton-url").fill("");
  await page.locator("#bulk-footer-email").fill(" reservations@hathorcruise.com \n");
  await warning.waitFor({ state: "detached" });
  for (const id of await page.locator(".bulk-emails__template-editor textarea").evaluateAll(fields => fields.map(field => field.id).filter(id => id !== "bulk-message"))) await page.locator(`#${id}`).fill("");
  await page.locator("#bulk-image-alt-introImage").fill("Two\nlines");
  // An uploaded photo must not read as invalid in the browser, where the storage host is unknown.
  await page.locator("#bulk-image-introImage").setInputFiles(path.join(root, "public/email/bulk-journal/dining.jpg"));
  await page.locator("#bulk-image-hero").setInputFiles(path.join(root, "public/email/bulk-journal/hero.jpg"));
  await page.frameLocator('iframe[title="Branded bulk email preview"]').locator(`img[src="${uploaded}"]`).first().waitFor();
  await page.getByText("Bulk preview up to date", { exact: true }).waitFor();
  await review.click();
  await page.getByRole("heading", { name: "Try your send.", exact: true }).waitFor();
  const run = page.getByRole("button", { name: "Run preview for 1 recipients", exact: true });
  assert.equal(await run.isDisabled(), false);
  await run.click();
  await warning.getByText("Tick the box to confirm", { exact: false }).waitFor();
  await page.screenshot({ path: ".tmp-bulk-journal-qa/warning-send.png", fullPage: true });
  await warning.getByRole("button", { name: /Permission/ }).click();
  await page.waitForFunction(() => document.activeElement?.id === "bulk-confirm");
  await page.locator("#bulk-confirm").check();
  await warning.waitFor({ state: "detached" });
  const issues = bulkFieldIssues(bulkMessageSchema.safeParse({ subject: " ", message: "", template: defaults }).error!.issues);
  assert.deepEqual(issues.map(issue => issue.label), ["Email subject", "Message"], "API errors name the fields too");
  console.log("Bulk journal tests passed: reference assets, responsive email, expanding editor, replacement/toggles, safe custom links, escaping and legacy isolation.");
} finally { await browser.close(); await new Promise<void>(resolve => server.close(() => resolve())); }
