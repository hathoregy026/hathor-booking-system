import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import postcss, { type AcceptedPlugin } from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { buildEmailHtmlDocument, emailFrameHeaders } from "../lib/email-html-view";
import { render } from "@react-email/render";
import PrivateMessageEmail from "../emails/PrivateMessage";
import { getDefaultEmailTemplate, buildEmailSendTheme } from "../lib/email-templates";
import { EMAIL_MAILBOXES } from "../lib/email-mailboxes";
import { dashboardEmailActionSchema } from "../lib/dashboard-email-actions";

async function main() {
  const root = process.cwd();
  const bundle = await build({
    stdin: { contents: 'import React from "react"; import { createRoot } from "react-dom/client"; import { DashboardInbox } from "./components/admin/DashboardInbox"; createRoot(document.getElementById("root")).render(<DashboardInbox />);', resolveDir: root, loader: "tsx" },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  });
  const utilities = (await postcss([tailwindcss({ base: root }) as unknown as AcceptedPlugin]).process('@import "tailwindcss";', { from: path.join(root, "app/globals.css") })).css;
  const css = utilities + await readFile(path.join(root, "app/admin.css"), "utf8") + await readFile(path.join(root, "app/admin-shell.css"), "utf8") + await readFile(path.join(root, "app/admin/(panel)/inbox/inbox.css"), "utf8");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    await mkdir(path.join(root, "output/inbox-qa"), { recursive: true });
    for (const [width, theme] of [[1440, "night"], [1440, "day"], [768, "night"], [390, "night"], [390, "day"], [320, "night"]] as const) {
      const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 900 } });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      const emailId = randomUUID();
      const messageId = randomUUID();
      const fileId = randomUUID();
      let read = false;
      let grouped = false;
      const deleted = new Set<string>();
      const placements = new Map<string, string>();
      let bulkCalls = 0;
      let rejectBulk = false;
      const handlers: Record<string, string> = {};
      const groupedRows = EMAIL_MAILBOXES.flatMap(mailbox => Array.from({ length: 30 }, (_, index) => ({
        id: randomUUID(), source: "general", mailboxId: mailbox.id, bookingId: null, sender: `partner-${index}@example.com`,
        recipient: mailbox.address, correspondentName: `Nile Partner ${index + 1}`, direction: index % 3 === 2 ? "OUTBOUND" : "INBOUND", status: index % 3 === 2 ? "SENT" : "RECEIVED",
        subject: `${mailbox.label} inquiry ${index + 1}`, preview: "Please help with this inquiry.", attachmentCount: 0,
        createdAt: new Date(Date.parse("2026-10-03T12:00:00.000Z") - index * 60000).toISOString(), readAt: index % 3 === 1 ? "2026-10-03T13:00:00.000Z" : null,
      })));
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
        if (url.pathname === "/") return route.fulfill({ contentType: "text/html", headers: { "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; frame-src 'self'" }, body: `<!doctype html><html data-theme="${theme}"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><div class="admin-shell" data-theme="${theme}" data-emails-workspace="true"><div class="admin-shell__stage flex flex-col"><header class="admin-header shrink-0">Hathor dashboard</header><main id="root" class="admin-main" style="padding-inline:20px"></main></div></div><script src="/app.js"></script></body></html>` });
        if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
        if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
        if (url.pathname === "/api/admin/inbox") {
          const displayed = groupedRows.map(row => ({ ...row, mailboxId: placements.get(row.id) ?? row.mailboxId }));
          const mailboxes = EMAIL_MAILBOXES.map(item => ({ ...item, handlerName: handlers[item.id] ?? "", total: grouped ? displayed.filter(row => row.mailboxId === item.id && !deleted.has(row.id)).length : item.id === "reservations" ? sentMessage ? 2 : 1 : 0, unread: grouped ? displayed.filter(row => row.mailboxId === item.id && !deleted.has(row.id) && row.direction === "INBOUND" && !row.readAt).length : item.id === "reservations" && !read ? 1 : 0 }));
          if (grouped) {
            const rows = displayed.filter(row => !deleted.has(row.id) && (url.searchParams.get("mailbox") === "all" || row.mailboxId === url.searchParams.get("mailbox"))).sort((first, second) => second.createdAt.localeCompare(first.createdAt) || second.id.localeCompare(first.id));
            const filter = url.searchParams.get("filter");
            const query = url.searchParams.get("q")?.toLowerCase();
            const filtered = rows.filter(row => (!query || row.subject.toLowerCase().includes(query)) && (filter === "all" || (filter === "sent" ? row.direction === "OUTBOUND" : row.direction === "INBOUND" && (filter !== "unread" || !row.readAt))));
            return route.fulfill({ json: { messages: filtered.slice(0, 25), hasOlder: false, unreadCount: rows.filter(row => row.direction === "INBOUND" && !row.readAt).length, counts: { all: rows.length, unread: rows.filter(row => row.direction === "INBOUND" && !row.readAt).length, received: rows.filter(row => row.direction === "INBOUND").length, sent: rows.filter(row => row.direction === "OUTBOUND").length }, mailboxes } });
          }
          if (url.searchParams.get("q")) searches += 1;
          if (url.searchParams.get("before")) older += 1;
          const filter = url.searchParams.get("filter");
          const sent = sentSummary();
          const rows = filter === "sent" ? sent ? [sent] : [] : filter === "unread" && read ? [] : filter === "all" && sent ? [sent, summary()] : [summary()];
          return route.fulfill({ json: { messages: url.searchParams.has("before") ? [] : rows, hasOlder: !url.searchParams.has("before") && filter !== "sent", unreadCount: read ? 0 : 1, counts: { all: sent ? 2 : 1, unread: read ? 0 : 1, received: 1, sent: sent ? 1 : 0 }, mailboxes } });
        }
        if (url.pathname === "/api/admin/inbox/mailboxes") {
          assert.equal(route.request().method(), "PATCH");
          const content = route.request().postDataJSON();
          handlers[content.mailboxId] = content.handlerName;
          return route.fulfill({ json: { updated: true } });
        }
        if (url.pathname === "/api/admin/inbox/bulk") {
          assert.equal(route.request().method(), "POST");
          const content = dashboardEmailActionSchema.parse(route.request().postDataJSON());
          bulkCalls++;
          if (rejectBulk) return route.fulfill({ status: 409, json: { error: "Unavailable selection" } });
          for (const message of content.messages) {
            assert.equal(message.source, "general");
            assert.ok(groupedRows.some(row => row.id === message.id));
            if (content.action === "move") placements.set(message.id, content.mailboxId);
            else deleted.add(message.id);
          }
          return route.fulfill({ json: { affected: content.messages.length } });
        }
        const groupedMessage = groupedRows.find(row => url.pathname === `/api/admin/inbox/general/${row.id}`);
        if (groupedMessage) {
          if (route.request().method() === "DELETE") {
            assert.equal(route.request().postDataJSON().confirm, true);
            deleted.add(groupedMessage.id);
            return route.fulfill({ json: { deleted: true } });
          }
          return route.fulfill({ json: { message: { ...groupedMessage, mailboxId: placements.get(groupedMessage.id) ?? groupedMessage.mailboxId, bodyText: "Private incoming message.\n\n" + "Readable details. ".repeat(200), attachments: [], senderMatchesGuest: true } } });
        }
        if (url.pathname === "/api/admin/inbox/preview") {
          assert.equal(route.request().method(), "POST");
          const content = route.request().postDataJSON();
          const mailbox = EMAIL_MAILBOXES.find(item => item.id === content.mailboxId)!;
          const html = await render(PrivateMessageEmail({ ...content, contactEmail: mailbox.address, signatureName: handlers[mailbox.id], ...buildEmailSendTheme(getDefaultEmailTemplate("BookingMessage")) }));
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
      await page.getByText("No emails match your search", { exact: true }).waitFor();
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
      grouped = true;
      await page.getByRole("group", { name: "Filter emails" }).getByRole("button", { name: /^All emails/ }).click();
      const navigation = page.getByRole("navigation", { name: "Choose mailbox" });
      assert.deepEqual(await navigation.locator(".emails-mailbox__role").allTextContents(), ["ALL MAILBOXES", ...EMAIL_MAILBOXES.map(item => item.label)]);
      for (const mailbox of EMAIL_MAILBOXES) {
        await Promise.all([
          page.waitForResponse(response => new URL(response.url()).searchParams.get("mailbox") === mailbox.id),
          navigation.getByRole("button", { name: new RegExp(`^${mailbox.label} `) }).click(),
        ]);
        await page.waitForFunction(() => document.querySelector('section[aria-label="Email list"]')?.getAttribute("aria-busy") === "false");
        assert.ok((await page.locator(".emails-message__top .emails-mailbox-chip").allTextContents()).every(value => value === mailbox.label));
        const filterButtons = page.getByRole("group", { name: "Filter emails" });
        assert.equal(await filterButtons.getByRole("button", { name: /^All emails/ }).getAttribute("aria-pressed"), "true", "Switching mailboxes must remove previous status filters");
        assert.ok(await page.locator(".dashboard-inbox__message").count());
        for (const filter of ["Unread", "Received", "Sent", "All emails"]) {
          await Promise.all([
            page.waitForResponse(response => new URL(response.url()).pathname === "/api/admin/inbox" && new URL(response.url()).searchParams.get("filter") === (filter === "All emails" ? "all" : filter.toLowerCase())),
            filterButtons.getByRole("button", { name: new RegExp(`^${filter}`) }).click(),
          ]);
          await page.waitForFunction(() => document.querySelector('section[aria-label="Email list"]')?.getAttribute("aria-busy") === "false");
          const tones = await page.locator(".dashboard-inbox__message").evaluateAll(elements => elements.map(element => element.getAttribute("data-tone")));
          assert.ok(tones.length, `Mailbox ${mailbox.label} must have ${filter} fixture emails`);
          if (filter === "Unread") assert.ok(tones.every(tone => tone === "unread"));
          if (filter === "Received") assert.ok(tones.every(tone => tone === "unread" || tone === "received"));
          if (filter === "Sent") assert.ok(tones.every(tone => tone === "sent"));
        }
        await Promise.all([
          page.waitForResponse(response => new URL(response.url()).pathname === "/api/admin/inbox" && new URL(response.url()).searchParams.get("mailbox") === mailbox.id),
          navigation.getByRole("button", { name: new RegExp(`^${mailbox.label} `) }).click(),
        ]);
        await page.locator(".dashboard-inbox__message").first().waitFor();
        assert.ok(await page.locator(".dashboard-inbox__message").count(), "Clicking an already-selected mailbox must not blank the list");
        await filterButtons.getByRole("button", { name: /^Sent/ }).click();
      }
      await page.getByRole("searchbox", { name: "Search name, email, or subject" }).fill("no fixture matches");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await page.getByText("No emails match your search", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Show all INFO emails", exact: true }).click();
      await page.getByRole("button", { name: /INFO inquiry 1/ }).first().waitFor();
      assert.equal(await page.getByRole("searchbox", { name: "Search name, email, or subject" }).inputValue(), "");
      await Promise.all([
        page.waitForResponse(response => new URL(response.url()).pathname === "/api/admin/inbox" && new URL(response.url()).searchParams.get("mailbox") === "info" && new URL(response.url()).searchParams.get("filter") === "all"),
        page.getByRole("group", { name: "Filter emails" }).getByRole("button", { name: /^All emails/ }).click(),
      ]);
      await page.locator(".dashboard-inbox__message").first().waitFor();
      assert.ok(await page.locator(".dashboard-inbox__message").count(), "Clicking the current status filter must refresh, not blank the list");
      await page.getByRole("searchbox", { name: "Search name, email, or subject" }).fill("no fixture matches");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await page.getByText("No emails match your search", { exact: true }).waitFor();
      await navigation.getByRole("button", { name: /^CEO / }).click();
      await page.getByRole("button", { name: /CEO inquiry 1/ }).first().waitFor();
      assert.equal(await page.getByRole("searchbox", { name: "Search name, email, or subject" }).inputValue(), "", "Search from a previous mailbox must not hide the newly chosen mailbox");
      await page.getByRole("button", { name: "Add handler name", exact: true }).click();
      await page.getByLabel("Who handles CEO?").fill("Nile Director");
      await page.getByRole("button", { name: "Save name", exact: true }).click();
      await navigation.getByText("Nile Director", { exact: true }).waitFor({ state: "attached" });
      if (await page.getByRole("button", { name: "Expand email controls", exact: true }).isVisible()) await page.getByRole("button", { name: "Expand email controls", exact: true }).click();
      await navigation.getByText("Nile Director", { exact: true }).waitFor();
      const controlsBefore = await page.locator(".emails-controls").boundingBox();
      const workspaceBefore = await page.locator(".dashboard-inbox__workspace").boundingBox();
      await page.locator(".emails-list-scroll").evaluate(element => { element.scrollTop = 800; });
      await page.locator('.emails-page[data-compact="true"]').waitFor();
      const scrollTop = await page.locator(".emails-list-scroll").evaluate(element => element.scrollTop);
      assert.ok(scrollTop > 0, "Only the message list must scroll");
      assert.equal((await page.locator(".emails-controls").boundingBox())?.y, controlsBefore?.y);
      assert.ok((await page.locator(".emails-controls").boundingBox())!.height < controlsBefore!.height - 40, "Controls must collapse to give emails more space");
      assert.ok((await page.locator(".dashboard-inbox__workspace").boundingBox())!.height > workspaceBefore!.height + 40);
      const compactFilters = await page.getByRole("group", { name: "Filter emails" }).boundingBox();
      await page.locator(".emails-list-scroll").evaluate(element => { element.scrollTop += 200; });
      assert.equal((await page.getByRole("group", { name: "Filter emails" }).boundingBox())?.y, compactFilters?.y, "Collapsed filters stay fixed while email content scrolls");
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-compact-controls.png`), fullPage: true });
      assert.equal(await page.evaluate(() => window.scrollY), 0);
      await page.getByRole("button", { name: "Expand email controls", exact: true }).click();
      await page.locator('.emails-page[data-compact="false"]').waitFor();
      await page.locator(".emails-list-scroll").evaluate(element => { element.scrollTop = 0; });
      await page.locator(".dashboard-inbox__message").first().click();
      await page.getByRole("heading", { name: "CEO inquiry 1", exact: true }).waitFor();
      assert.equal(await page.locator(".emails-detail-metadata > div").count(), 4);
      await page.getByText("Nile Director", { exact: true }).last().waitFor();
      await page.getByRole("region", { name: "Email details", exact: true }).evaluate(element => { element.scrollTop = 0; });
      if (await page.getByRole("button", { name: "Expand email controls", exact: true }).isVisible()) await page.getByRole("button", { name: "Expand email controls", exact: true }).click();
      const readerControlsBefore = await page.locator(".emails-controls").boundingBox();
      await page.getByRole("region", { name: "Email details", exact: true }).evaluate(element => { element.scrollTop = 100; });
      await page.locator('.emails-page[data-compact="true"]').waitFor();
      assert.ok((await page.locator(".emails-controls").boundingBox())!.height < readerControlsBefore!.height - 40, "Scrolling an opened email must also compact the controls");
      await page.getByRole("button", { name: "Expand email controls", exact: true }).click();
      await page.getByRole("region", { name: "Email details", exact: true }).evaluate(element => { element.scrollTop = 0; });
      page.once("dialog", dialog => void dialog.accept());
      await page.getByRole("button", { name: "Delete from dashboard", exact: true }).click();
      await page.getByText("Removed from dashboard Emails. Your original mailbox history is unchanged.", { exact: true }).waitFor();
      assert.equal(deleted.size, 1);
      assert.equal(groupedRows.filter(item => item.mailboxId === "ceo").length, 30, "Deletion preserves the original mailbox fixture");
      await navigation.getByRole("button", { name: /^INFO / }).click();
      const firstInfo = page.getByRole("checkbox", { name: "Select email: INFO inquiry 1", exact: true });
      await firstInfo.waitFor();
      await firstInfo.check();
      await page.getByRole("checkbox", { name: "Select email: INFO inquiry 2", exact: true }).check();
      await page.getByText("2 selected", { exact: true }).waitFor();
      await page.getByLabel("Move selected emails to", { exact: true }).selectOption("ceo");
      await page.getByRole("button", { name: "Move selected", exact: true }).click();
      await page.getByText("2 emails moved to CEO in the dashboard. Original mailbox history is unchanged.", { exact: true }).waitFor();
      assert.equal(placements.size, 2);
      assert.equal(groupedRows.filter(row => row.mailboxId === "info").length, 30, "Moving does not mutate provider/original routing");
      await navigation.getByRole("button", { name: /^CEO / }).click();
      await page.getByRole("button", { name: /INFO inquiry 1/ }).click();
      await page.getByRole("heading", { name: "INFO inquiry 1", exact: true }).waitFor();
      assert.equal(await page.locator(".emails-detail-contact .emails-mailbox-chip").innerText(), "CEO");
      await page.getByRole("button", { name: "Reply from dashboard", exact: true }).click();
      assert.match(await page.getByRole("region", { name: "New email", exact: true }).innerText(), /ceo@hathorcruise\.com/);
      await page.getByRole("button", { name: "Close new email", exact: true }).click();
      await page.getByRole("checkbox", { name: "Select email: INFO inquiry 1", exact: true }).check();
      await page.getByRole("checkbox", { name: "Select email: INFO inquiry 2", exact: true }).check();
      const beforeCancel = bulkCalls;
      page.once("dialog", dialog => void dialog.dismiss());
      await page.getByRole("button", { name: "Delete selected", exact: true }).click();
      assert.equal(bulkCalls, beforeCancel, "Canceled confirmation must not send a deletion request");
      page.once("dialog", dialog => void dialog.accept());
      await page.getByRole("button", { name: "Delete selected", exact: true }).click();
      await page.getByText("2 emails removed from the dashboard only. Original mailbox history is unchanged.", { exact: true }).waitFor();
      assert.equal(deleted.size, 3);
      assert.equal(groupedRows.length, 180, "All original email bodies remain available in the source fixture");
      await navigation.getByRole("button", { name: /^INFO / }).click();
      await page.getByRole("checkbox", { name: "Select email: INFO inquiry 4", exact: true }).check();
      await page.getByText("1 selected", { exact: true }).waitFor();
      await page.getByLabel("Move selected emails to", { exact: true }).selectOption("sales");
      rejectBulk = true;
      await page.getByRole("button", { name: "Move selected", exact: true }).click();
      await page.getByRole("alert").waitFor();
      assert.equal(await page.getByRole("checkbox", { name: "Select email: INFO inquiry 4", exact: true }).isChecked(), true, "Rejected batches retain the selection for review");
      rejectBulk = false;
      await page.getByRole("button", { name: "Move selected", exact: true }).click();
      await page.getByText("1 email moved to SALES in the dashboard. Original mailbox history is unchanged.", { exact: true }).waitFor();
      await page.getByRole("checkbox", { name: "Select loaded emails (up to 100)", exact: true }).check();
      await page.getByRole("group", { name: "Selected email actions", exact: true }).waitFor();
      assert.ok(await page.locator('.emails-selectable-row[data-checked="true"]').count());
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-bulk-controls.png`), fullPage: true });
      await page.getByRole("button", { name: "Clear selection", exact: true }).click();
      await page.screenshot({ path: path.join(root, `output/inbox-qa/${width}-${theme}-mailboxes.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1), true, "Emails must not move the dashboard header or filters off screen");
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Emails browser QA passed at ${width}px (${theme}): clear names, distinct unread/received/sent colours, filters, branded compose preview, safe retry, sent history, protected HTML, attachments and responsive containment.`);
    }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
