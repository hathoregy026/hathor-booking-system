import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";

async function main() {
  const root = process.cwd();
  const bundle = await build({
    stdin: { contents: 'import React from "react"; import { createRoot } from "react-dom/client"; import { DashboardInbox } from "./components/admin/DashboardInbox"; createRoot(document.getElementById("root")).render(<DashboardInbox />);', resolveDir: root, loader: "tsx" },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  });
  const chunkDirectory = path.join(root, ".next/static/chunks");
  const chunks = await readdir(chunkDirectory);
  const styles = await Promise.all(chunks.filter(file => file.endsWith(".css")).map(file => readFile(path.join(chunkDirectory, file), "utf8")));
  const utilities = styles.find(css => css.includes("--spacing") && css.includes(".flex"));
  assert.ok(utilities, "Run a Next build once to provide existing Tailwind CSS for this isolated UI test");
  const css = utilities + await readFile(path.join(root, "app/admin.css"), "utf8") + await readFile(path.join(root, "app/admin/(panel)/inbox/inbox.css"), "utf8");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    await mkdir(path.join(root, "output/inbox-qa"), { recursive: true });
    for (const width of [1440, 768, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      const emailId = randomUUID();
      const messageId = randomUUID();
      const fileId = randomUUID();
      let read = false;
      let searches = 0;
      let older = 0;
      const summary = () => ({ id: messageId, source: "general", bookingId: null, sender: "guest@example.com", subject: "A question about our Nile voyage", preview: "Could you help us plan our trip?", attachmentCount: 1, createdAt: "2026-10-02T12:00:00.000Z", readAt: read ? "2026-10-02T13:00:00.000Z" : null });
      await page.route("https://inbox-test.hathor.local/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: '<!doctype html><html data-theme="day"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><main id="root" class="admin-shell" style="padding:24px;max-width:1280px;margin:auto"></main><script src="/app.js"></script></body></html>' });
        if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
        if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
        if (url.pathname === "/api/admin/inbox") {
          if (url.searchParams.get("q")) searches += 1;
          if (url.searchParams.get("before")) older += 1;
          return route.fulfill({ json: { messages: url.searchParams.has("before") ? [] : url.searchParams.get("filter") === "unread" && read ? [] : [summary()], hasOlder: !url.searchParams.has("before"), unreadCount: read ? 0 : 1 } });
        }
        if (url.pathname === `/api/admin/inbox/general/${messageId}`) {
          if (route.request().method() === "PATCH") {
            assert.equal(route.request().headers()["content-type"], "application/json");
            read = route.request().postDataJSON().read;
            return route.fulfill({ json: { updated: true } });
          }
          return route.fulfill({ json: { message: { ...summary(), resendEmailId: emailId, recipient: "reservations@hathorcruise.com", bodyText: '<script>window.inboxInjected = true</script>\nCould you help us plan our trip?\n' + "LongUnbrokenCustomerText".repeat(18), attachments: [{ id: fileId, filename: "itinerary.pdf", contentType: "application/pdf" }], senderMatchesGuest: true } } });
        }
        return route.fulfill({ status: 404, body: "Not found" });
      });
      await page.goto("https://inbox-test.hathor.local/");
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).waitFor({ timeout: 10000 }).catch(async () => {
        await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-failure.png`), fullPage: true });
        throw new Error(`Fixture page failed: ${errors.join("; ")} ${await page.locator("body").innerText()}`);
      });
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).click();
      await page.getByRole("heading", { name: "A question about our Nile voyage" }).waitFor();
      assert.equal(await page.evaluate(() => (window as unknown as { inboxInjected?: boolean }).inboxInjected), undefined);
      assert.match(await page.getByRole("link", { name: "itinerary.pdf" }).getAttribute("href") ?? "", new RegExp(`/api/admin/inbox/general/${messageId}/attachments/${fileId}`));
      assert.match(await page.getByRole("link", { name: "Reply in your mail app" }).getAttribute("href") ?? "", /^mailto:/);
      await page.getByRole("button", { name: "Mark read", exact: true }).click();
      await page.getByRole("button", { name: "Mark unread", exact: true }).waitFor();
      assert.equal(read, true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `No horizontal overflow at ${width}px`);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-detail.png`), fullPage: true });
      await page.getByRole("button", { name: "Back to inbox" }).click();
      await page.getByRole("button", { name: "Load older emails" }).click();
      await page.waitForFunction(() => !document.querySelector('section[aria-label="Received emails"]')?.getAttribute("aria-busy") || document.querySelector('section[aria-label="Received emails"]')?.getAttribute("aria-busy") === "false");
      assert.equal(older, 1);
      await page.getByRole("searchbox", { name: "Search sender or subject" }).fill("guest");
      await Promise.all([
        page.waitForResponse(response => new URL(response.url()).searchParams.get("q") === "guest"),
        page.getByRole("button", { name: "Search", exact: true }).click(),
      ]);
      assert.ok(searches > 0);
      await page.getByLabel("Filter emails").selectOption("unread");
      await page.getByText("No emails here yet", { exact: true }).waitFor();
      await page.getByLabel("Filter emails").selectOption("all");
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).waitFor();
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-list.png`), fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Inbox browser QA passed at ${width}px: safe text, attachment links, read state, search, pagination, filters and containment.`);
    }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
