import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { chromium } from "playwright";
import { buildEmailHtmlDocument, emailFrameHeaders } from "../lib/email-html-view";
import { render } from "@react-email/render";
import PrivateMessageEmail from "../emails/PrivateMessage";
import { getDefaultEmailTemplate, buildEmailSendTheme } from "../lib/email-templates";

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
    for (const [width, theme] of [[1440, "night"], [1440, "day"], [768, "night"], [390, "night"], [390, "day"]] as const) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      const emailId = randomUUID();
      const messageId = randomUUID();
      const fileId = randomUUID();
      let read = false;
      let searches = 0;
      let older = 0;
      let imageRequests = 0;
      let sendCalls = 0;
      let sentMessage: { id: string; to: string; recipientName: string; subject: string; message: string; requestId: string } | null = null;
      let originalSend: string | null = null;
      const senderName = "Amira Nassar";
      await page.context().addCookies([{ name: "admin_session", value: "synthetic-session", domain: "inbox-test.hathor.local", path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
      await page.route("https://images.company.com/**", route => {
        imageRequests += 1;
        return route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") });
      });
      const summary = () => ({ id: messageId, source: "general", bookingId: null, sender: "guest@example.com", recipient: "reservations@hathorcruise.com", correspondentName: senderName, direction: "INBOUND", status: "RECEIVED", subject: "A question about our Nile voyage", preview: "Could you help us plan our trip?", attachmentCount: 1, createdAt: "2026-10-02T12:00:00.000Z", readAt: read ? "2026-10-02T13:00:00.000Z" : null });
      const sentSummary = () => sentMessage ? ({ id: sentMessage.id, source: "general", bookingId: null, sender: "Hathor Dahabiya <reservations@hathorcruise.com>", recipient: sentMessage.to, correspondentName: sentMessage.recipientName, direction: "OUTBOUND", status: sendCalls > 1 ? "SENT" : "PENDING", subject: sentMessage.subject, preview: sentMessage.message, attachmentCount: 0, createdAt: "2026-10-03T12:00:00.000Z", readAt: null }) : null;
      await page.route("https://inbox-test.hathor.local/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname === "/") return route.fulfill({ contentType: "text/html", headers: { "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; frame-src 'self'" }, body: `<!doctype html><html data-theme="${theme}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><main id="root" class="admin-shell" style="padding:24px;max-width:1280px;margin:auto"></main><script src="/app.js"></script></body></html>` });
        if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
        if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
        if (url.pathname === "/api/admin/inbox") {
          if (url.searchParams.get("q")) searches += 1;
          if (url.searchParams.get("before")) older += 1;
          const filter = url.searchParams.get("filter");
          const sent = sentSummary();
          const rows = filter === "sent" ? sent ? [sent] : [] : filter === "unread" && read ? [] : filter === "all" && sent ? [sent, summary()] : [summary()];
          return route.fulfill({ json: { messages: url.searchParams.has("before") ? [] : rows, hasOlder: !url.searchParams.has("before") && filter !== "sent", unreadCount: read ? 0 : 1, counts: { all: sent ? 2 : 1, unread: read ? 0 : 1, received: 1, sent: sent ? 1 : 0 } } });
        }
        if (url.pathname === "/api/admin/inbox/preview") {
          assert.equal(route.request().method(), "POST");
          const content = route.request().postDataJSON();
          const html = await render(PrivateMessageEmail({ ...content, ...buildEmailSendTheme(getDefaultEmailTemplate("BookingMessage")) }));
          return route.fulfill({ contentType: "text/html", headers: emailFrameHeaders(false), body: buildEmailHtmlDocument(html) });
        }
        if (url.pathname === "/api/admin/inbox/send") {
          assert.equal(route.request().method(), "POST");
          const content = route.request().postDataJSON();
          if (originalSend) assert.equal(route.request().postData(), originalSend, "Uncertain retries must preserve the exact draft and request ID");
          else originalSend = route.request().postData();
          sentMessage = { ...content, id: content.requestId };
          sendCalls += 1;
          return route.fulfill({ status: sendCalls === 1 ? 202 : 200, json: { id: content.requestId, status: sendCalls === 1 ? "PENDING" : "SENT" } });
        }
        if (sentMessage && url.pathname === `/api/admin/inbox/general/${sentMessage.id}`) return route.fulfill({ json: { message: { ...sentSummary(), bodyText: sentMessage.message, attachments: [], senderMatchesGuest: true } } });
        if (url.pathname === `/api/admin/inbox/general/${messageId}`) {
          if (route.request().method() === "PATCH") {
            assert.equal(route.request().headers()["content-type"], "application/json");
            read = route.request().postDataJSON().read;
            return route.fulfill({ json: { updated: true } });
          }
          return route.fulfill({ json: { message: { ...summary(), resendEmailId: emailId, recipient: "reservations@hathorcruise.com", bodyText: '<script>window.inboxInjected = true</script>\nCould you help us plan our trip?\n' + "LongUnbrokenCustomerText".repeat(18) + '\n\nOn Fri, 2 Oct 2026 at 14:45, Team <team@example.com> wrote:\n> ' + '\u200c\u200b\u200d\u200e\u200f\ufeff '.repeat(50) + '\n> Previous invoice content', attachments: [{ id: fileId, filename: "itinerary.pdf", contentType: "application/pdf" }], senderMatchesGuest: true } } });
        }
        if (url.pathname === `/api/admin/inbox/general/${messageId}/formatted`) {
          assert.ok(route.request().headers().cookie?.includes("admin_session=synthetic-session"), "The isolated iframe must authenticate using the normal session cookie");
          const images = url.searchParams.get("images") === "load";
          const html = '<table style="background-color:#b69f64;color:#ffffff;width:600px"><tr><td><h2>Company signature</h2></td></tr></table><p>Company contact details</p><img src="https://images.company.com/logo.png" alt="Company logo" width="160"><script>parent.inboxInjected = true</script><p style="background-image:url(https://images.company.com/track)">Safe footer</p>';
          return route.fulfill({ headers: emailFrameHeaders(images), body: buildEmailHtmlDocument(html, images) });
        }
        return route.fulfill({ status: 404, body: "Not found" });
      });
      await page.goto("https://inbox-test.hathor.local/");
      await page.getByRole("heading", { name: "Emails", exact: true }).waitFor();
      await page.getByRole("button", { name: "Refresh emails", exact: true }).waitFor();
      assert.equal(await page.getByRole("group", { name: "Filter emails" }).getByRole("button").count(), 4);
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).waitFor({ timeout: 10000 }).catch(async () => {
        await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-failure.png`), fullPage: true });
        throw new Error(`Fixture page failed: ${errors.join("; ")} ${await page.locator("body").innerText()}`);
      });
      assert.equal(await page.locator(".emails-message__name").first().innerText(), senderName);
      const unreadColor = await page.locator('.dashboard-inbox__message[data-tone="unread"]').evaluate(element => getComputedStyle(element).borderLeftColor);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-organized.png`), fullPage: true });
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).click();
      await page.getByRole("heading", { name: "A question about our Nile voyage" }).waitFor();
      assert.equal(await page.getByText("Previous invoice content", { exact: false }).first().isVisible(), false);
      await page.getByText("Show previous messages", { exact: true }).click();
      assert.equal(await page.locator("blockquote").isVisible(), true);
      await page.getByText("Show previous messages", { exact: true }).click();
      assert.equal(await page.locator("iframe").count(), 0);
      assert.equal(imageRequests, 0);
      await page.getByRole("button", { name: "View formatted email", exact: true }).click();
      await page.frameLocator("iframe").getByRole("heading", { name: "Company signature" }).waitFor();
      assert.equal(imageRequests, 0);
      assert.equal(await page.frameLocator("iframe").locator("script, form, iframe, img[src]").count(), 0);
      assert.equal(await page.evaluate(() => {
        try { return Boolean(document.querySelector("iframe")?.contentWindow?.document); } catch { return false; }
      }), false, "Formatted email must have an opaque origin");
      await page.getByRole("button", { name: "Load images for this email", exact: true }).click();
      await page.frameLocator("iframe").getByRole("img", { name: "Company logo" }).waitFor();
      await page.waitForFunction(() => document.querySelector("iframe")?.getAttribute("src")?.includes("images=load"));
      assert.equal(imageRequests, 1);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-formatted.png`), fullPage: true });
      await page.getByRole("button", { name: "Close formatted view", exact: true }).click();
      assert.equal(await page.evaluate(() => (window as unknown as { inboxInjected?: boolean }).inboxInjected), undefined);
      assert.match(await page.getByRole("link", { name: "itinerary.pdf" }).getAttribute("href") ?? "", new RegExp(`/api/admin/inbox/general/${messageId}/attachments/${fileId}`));
      await page.getByRole("button", { name: "Reply from dashboard", exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark read", exact: true }).click();
      await page.getByRole("button", { name: "Mark unread", exact: true }).waitFor();
      assert.equal(read, true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `No horizontal overflow at ${width}px`);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-detail.png`), fullPage: true });
      await page.getByRole("button", { name: "Back to emails", exact: true }).click();
      await page.getByRole("button", { name: "Load older emails" }).click();
      await page.waitForFunction(() => document.querySelector('section[aria-label="Email list"]')?.getAttribute("aria-busy") === "false");
      assert.equal(older, 1);
      await page.getByRole("searchbox", { name: "Search name, email, or subject" }).fill("guest");
      await Promise.all([
        page.waitForResponse(response => new URL(response.url()).searchParams.get("q") === "guest"),
        page.getByRole("button", { name: "Search", exact: true }).click(),
      ]);
      assert.ok(searches > 0);
      await page.getByRole("group", { name: "Filter emails" }).getByRole("button", { name: /^Unread/ }).click();
      await page.getByText("No emails here yet", { exact: true }).waitFor();
      await page.getByRole("group", { name: "Filter emails" }).getByRole("button", { name: /^Received/ }).click();
      await page.getByRole("button", { name: /A question about our Nile voyage/ }).waitFor();
      const receivedColor = await page.locator('.dashboard-inbox__message[data-tone="received"]').evaluate(element => getComputedStyle(element).borderLeftColor);
      assert.notEqual(unreadColor, receivedColor);
      await page.getByRole("button", { name: "Send new email", exact: true }).click();
      const composer = page.getByRole("region", { name: "New email", exact: true });
      await composer.getByLabel("To", { exact: true }).fill("private@example.com");
      await composer.getByLabel("Recipient name", { exact: false }).fill("Nile Partners");
      await composer.getByLabel("Subject", { exact: true }).fill("Your private Hathor note");
      await composer.getByLabel("Message", { exact: true }).fill("Hello from Hathor.\n\nThis is a private message.");
      await composer.getByRole("button", { name: "Preview branding", exact: true }).click();
      await page.frameLocator('iframe[title="Branded email preview"]').getByText("Your private Hathor note", { exact: true }).waitFor();
      await page.locator('iframe[title="Branded email preview"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.locator('iframe[title="Branded email preview"]').screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-preview.png`) });
      assert.equal(await page.frameLocator('iframe[title="Branded email preview"]').locator("script, form, img[src]").count(), 0);
      assert.equal(sendCalls, 0, "Preview must never send email");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-composer.png`), fullPage: true });
      await composer.getByRole("button", { name: "Send email", exact: true }).click();
      await composer.getByRole("button", { name: "Check sending status", exact: true }).waitFor();
      assert.equal(await composer.getByLabel("To", { exact: true }).isDisabled(), true);
      await composer.getByRole("button", { name: "Check sending status", exact: true }).click();
      await page.getByRole("heading", { name: "Your private Hathor note", exact: true }).waitFor();
      assert.equal(sendCalls, 2);
      assert.equal(await page.getByRole("button", { name: "Mark read", exact: true }).count(), 0);
      await page.getByRole("button", { name: "Back to emails", exact: true }).click();
      await page.locator('.dashboard-inbox__message[data-tone="sent"]').waitFor();
      const sentColor = await page.locator('.dashboard-inbox__message[data-tone="sent"]').evaluate(element => getComputedStyle(element).borderLeftColor);
      assert.notEqual(sentColor, receivedColor);
      assert.notEqual(sentColor, unreadColor);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-list.png`), fullPage: true });
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Emails browser QA passed at ${width}px (${theme}): clear names, distinct unread/received/sent colours, filters, branded compose preview, safe retry, sent history, protected HTML, attachments and responsive containment.`);
    }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
