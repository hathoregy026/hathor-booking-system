import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import postcss, { type AcceptedPlugin } from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { NotificationSnapshot } from "../lib/admin-notification-types";
import { notificationDismissSchema } from "../lib/admin-notifications";

async function main() {
  const root = process.cwd();
  const bundle = await build({
    plugins: [{ name: "synthetic-navigation", setup(plugin) {
      plugin.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: "navigation", namespace: "synthetic" }));
      plugin.onLoad({ filter: /.*/, namespace: "synthetic" }, () => ({ contents: 'export function useRouter(){return {push:(href)=>window.location.assign(href)}}', loader: "js" }));
    } }],
    stdin: { contents: 'import React, {useCallback,useState} from "react"; import {createRoot} from "react-dom/client"; import {NotificationBell} from "./components/admin/NotificationBell"; import {DashboardInbox} from "./components/admin/DashboardInbox"; import {AdminThemeProvider} from "./components/admin/ThemeProvider"; import {ToastProvider} from "./components/admin/ToastProvider"; import {useAdminActivityRefresh} from "./hooks/useAdminActivityRefresh"; function Probe(){const[count,setCount]=useState(0);const[paused,setPaused]=useState(false);const refresh=useCallback(()=>setCount(value=>value+1),[]);useAdminActivityRefresh("bookings",refresh,paused);return <div><output aria-label="Booking refreshes">{count}</output><button onClick={()=>setPaused(value=>!value)}>{paused?"Resume updates":"Pause updates"}</button></div>} const params=new URLSearchParams(location.search); createRoot(document.getElementById("root")).render(<AdminThemeProvider><ToastProvider><NotificationBell/><Probe/><DashboardInbox requestedEmail={`${params.get("source")||""}/${params.get("message")||""}`}/></ToastProvider></AdminThemeProvider>);', resolveDir: root, loader: "tsx" },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  });
  const utilities = (await postcss([tailwindcss({ base: root }) as unknown as AcceptedPlugin]).process('@import "tailwindcss";', { from: path.join(root, "app/globals.css") })).css;
  const css = utilities + await readFile(path.join(root, "app/admin.css"), "utf8") + await readFile(path.join(root, "app/admin-shell.css"), "utf8") + await readFile(path.join(root, "app/admin/(panel)/inbox/inbox.css"), "utf8");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    await mkdir(path.join(root, "output/notification-qa"), { recursive: true });
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.clock.install({ time: new Date("2026-10-03T12:00:00.000Z") });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("dialog", dialog => dialog.accept());
      const emailId = randomUUID();
      const bookingId = randomUUID();
      const secondBookingId = randomUUID();
      const seen = new Set<string>();
      let polls = 0;
      let acknowledgments = 0;
      let unread = true;
      let failure = 0;
      let dismissFailure = false;
      let holdAcknowledgment = false;
      let releaseAcknowledgment: (() => void) | null = null;
      let hold = false;
      let release: (() => void) | null = null;
      const state: NotificationSnapshot = { unreadCount: 0, bookingCount: 0, emailCount: 0, bookingSeenThrough: "2026-10-03T12:00:00.000Z", items: [], activity: [] };
      await page.route("https://notification-test.hathor.local/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname === "/" || url.pathname === "/admin/inbox" || url.pathname.startsWith("/admin/bookings/")) return route.fulfill({ contentType: "text/html", body: '<!doctype html><html data-theme="night"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><main id="root" class="admin-shell" style="padding:24px;max-width:1280px;margin:auto"></main><script src="/app.js"></script></body></html>' });
        if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
        if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
        if (url.pathname === "/api/admin/notifications") {
          if (route.request().method() === "POST") {
            if (holdAcknowledgment) await new Promise<void>(resolve => { releaseAcknowledgment = resolve; });
            if (failure || dismissFailure) return route.fulfill({ status: failure || 503, json: { error: "Unavailable" } });
            acknowledgments += 1;
            const item = notificationDismissSchema.parse(route.request().postDataJSON()).notifications[0];
            seen.add(`${item.kind}/${item.source}/${item.id}`);
            if (item.kind === "booking") state.bookingCount -= 1;
            else state.emailCount -= 1;
            state.unreadCount = state.bookingCount + state.emailCount;
            state.items = state.items.filter(candidate => candidate.id !== item.id || candidate.kind !== item.kind || candidate.source !== item.source);
            return route.fulfill({ json: { ok: true } });
          }
          polls += 1;
          if (hold) await new Promise<void>(resolve => { release = resolve; });
          if (failure) return route.fulfill({ status: failure, json: { error: "Unavailable" } });
          return route.fulfill({ json: state });
        }
        const email = { id: emailId, source: "general", bookingId: null, sender: "guest@example.com", recipient: "reservations@hathorcruise.com", correspondentName: "Nile Guest", direction: "INBOUND", status: "RECEIVED", subject: "A new question", preview: "Hello Hathor", attachmentCount: 0, createdAt: "2026-10-03T12:00:00.000Z", readAt: unread ? null : "2026-10-03T12:01:00.000Z" };
        if (url.pathname === "/api/admin/inbox") return route.fulfill({ json: { messages: state.activity.length ? [email] : [], hasOlder: false, unreadCount: state.emailCount, counts: { all: state.activity.length ? 1 : 0, unread: state.emailCount, received: state.activity.length ? 1 : 0, sent: 0 } } });
        if (url.pathname === `/api/admin/inbox/general/${emailId}`) {
          if (route.request().method() === "PATCH") {
            unread = !route.request().postDataJSON().read;
            state.emailCount = unread && !seen.has(`email/general/${emailId}`) ? 1 : 0;
            state.unreadCount = state.bookingCount + state.emailCount;
            state.items = unread ? state.items : state.items.filter(item => item.kind !== "email");
            return route.fulfill({ json: { updated: true } });
          }
          return route.fulfill({ json: { message: { ...email, bodyText: "Hello Hathor", senderMatchesGuest: true, attachments: [] } } });
        }
        return route.fulfill({ status: 404, body: "Not found" });
      });
      await page.goto("https://notification-test.hathor.local/");
      await page.getByRole("button", { name: "Email notifications", exact: true }).waitFor();
      assert.equal(await page.getByRole("group", { name: "Booking and email notifications", exact: true }).getByRole("button").count(), 2);
      await page.waitForFunction(() => document.querySelector('section[aria-label="Email list"]')?.getAttribute("aria-busy") === "false");
      await page.getByRole("button", { name: "Email notifications", exact: true }).click();
      await page.getByText("You’re up to date", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Email notifications", exact: true }).click();
      await page.getByRole("button", { name: "Send new email", exact: true }).click();
      await page.getByRole("region", { name: "New email", exact: true }).getByLabel("Message", { exact: true }).fill("Keep my unsent draft while notifications arrive.");
      await page.evaluate(() => {
        const observed = window as unknown as { createdNotificationToasts: number };
        observed.createdNotificationToasts = 0;
        new MutationObserver(records => {
          for (const record of records) for (const node of record.addedNodes) {
            if (node instanceof HTMLElement && node.matches(".admin-toast")) observed.createdNotificationToasts++;
          }
        }).observe(document.querySelector(".admin-toast-viewport")!, { childList: true });
      });
      state.bookingCount = 2; state.emailCount = 1; state.unreadCount = 3;
      state.items = [{ id: bookingId, kind: "booking", source: "booking", name: "First Guest", description: "Nile voyage", createdAt: state.bookingSeenThrough }, { id: secondBookingId, kind: "booking", source: "booking", name: "Second Guest", description: "Nile voyage", createdAt: state.bookingSeenThrough }, { id: emailId, kind: "email", source: "general", name: "Nile Guest", description: "A new question", createdAt: state.bookingSeenThrough }];
      state.activity = [{ key: `booking/${bookingId}`, kind: "booking" }, { key: `booking/${secondBookingId}`, kind: "booking" }, { key: `email/general/${emailId}`, kind: "email" }];
      await page.getByRole("button", { name: "Pause updates", exact: true }).click();
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "2 unread booking notifications", exact: true }).waitFor();
      await page.getByRole("button", { name: "1 unread email notifications", exact: true }).waitFor();
      await page.getByText("New booking requests and emails received. Open Bookings or Emails notifications to view them.", { exact: true }).waitFor();
      assert.equal(acknowledgments, 0, "Opening the icon must not clear notifications or change email read status");
      assert.equal(await page.locator(".admin-toast").count(), 1);
      assert.equal(await page.locator(".admin-toast").first().innerText().then(text => text.includes("New booking")), true);
      assert.equal(await page.getByRole("region", { name: "New email", exact: true }).getByLabel("Message", { exact: true }).inputValue(), "Keep my unsent draft while notifications arrive.");
      assert.equal(await page.getByLabel("Booking refreshes").innerText(), "0", "Editing must defer list refreshes");
      await page.getByRole("button", { name: "Resume updates", exact: true }).click();
      await page.waitForFunction(() => document.querySelector('output[aria-label="Booking refreshes"]')?.textContent === "1");
      await page.getByRole("button", { name: "Close new email", exact: true }).click();
      await page.getByRole("button", { name: /A new question/ }).waitFor();
      await page.mouse.move(0, 0);
      const before = polls;
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "1 unread email notifications", exact: true }).waitFor();
      assert.ok(polls > before);
      await page.clock.runFor(1000);
      assert.equal(await page.evaluate(() => (window as unknown as { createdNotificationToasts: number }).createdNotificationToasts), 1, "Repeated snapshots must not create another alert, regardless of toast auto-dismiss/hover timing");
      await page.getByRole("button", { name: "2 unread booking notifications", exact: true }).click();
      const bookingsPanel = page.getByRole("dialog", { name: "Booking notifications", exact: true });
      assert.equal(await bookingsPanel.getByRole("link", { name: /Received email/ }).count(), 0, "Bookings icon must not mix in email alerts");
      await bookingsPanel.getByRole("link", { name: /Booking request First Guest/ }).waitFor();
      assert.equal(acknowledgments, 0, "Merely opening the panel must preserve both alerts");
      holdAcknowledgment = true;
      await bookingsPanel.getByRole("link", { name: /Booking request First Guest/ }).click();
      for (let attempt = 0; attempt < 100 && !releaseAcknowledgment; attempt += 1) await new Promise(resolve => setTimeout(resolve, 10));
      assert.ok(releaseAcknowledgment);
      const pollsWhileOpening = polls;
      await page.clock.runFor(15000);
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      assert.equal(polls, pollsWhileOpening, "Polling must pause while an alert is being acknowledged, preventing stale badge resurrection");
      holdAcknowledgment = false;
      (releaseAcknowledgment as () => void)();
      await page.waitForURL(`**/admin/bookings/${bookingId}`);
      await page.getByRole("button", { name: "1 unread booking notifications", exact: true }).click();
      assert.equal(await page.getByRole("dialog", { name: "Booking notifications", exact: true }).getByRole("link", { name: /First Guest/ }).count(), 0);
      await page.getByRole("dialog", { name: "Booking notifications", exact: true }).getByRole("link", { name: /Second Guest/ }).click();
      await page.waitForURL(`**/admin/bookings/${secondBookingId}`);
      await page.getByRole("button", { name: "Booking notifications", exact: true }).waitFor();
      await page.getByRole("button", { name: "1 unread email notifications", exact: true }).waitFor();
      assert.equal(acknowledgments, 2);
      assert.equal(unread, true);
      await page.screenshot({ path: path.join(root, `output/notification-qa/${width}-alerts.png`), fullPage: true });
      await page.getByRole("button", { name: "1 unread email notifications", exact: true }).click();
      const emailsPanel = page.getByRole("dialog", { name: "Email notifications", exact: true });
      assert.equal(await emailsPanel.getByRole("button", { name: "Clear booking alerts", exact: true }).count(), 0);
      assert.equal(await emailsPanel.getByRole("link", { name: /Booking request/ }).count(), 0, "Emails icon must not mix in booking alerts");
      const emailLink = emailsPanel.getByRole("link", { name: /Received email/ });
      const href = await emailLink.getAttribute("href");
      assert.equal(href, `/admin/inbox?source=general&message=${emailId}`);
      await emailLink.click();
      await page.waitForURL(`**${href}`);
      await page.getByRole("heading", { name: "A new question", exact: true }).waitFor();
      await page.getByRole("button", { name: "Email notifications", exact: true }).waitFor();
      assert.equal(unread, true, "Opening an email alert must not mark the email read");
      assert.equal(acknowledgments, 3);
      await page.reload();
      await page.getByRole("heading", { name: "A new question", exact: true }).waitFor();
      await page.getByRole("button", { name: "Email notifications", exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark read", exact: true }).click();
      await page.getByRole("button", { name: "Mark unread", exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark unread", exact: true }).click();
      await page.getByRole("button", { name: "Mark read", exact: true }).waitFor();
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Email notifications", exact: true }).waitFor();
      assert.equal(await page.locator(".admin-toast").count(), 0);
      const laterBooking = randomUUID();
      state.bookingCount = 1; state.unreadCount = 1;
      state.items.push({ id: laterBooking, kind: "booking", source: "booking", name: "Later Guest", description: "New voyage", createdAt: state.bookingSeenThrough });
      state.activity.push({ key: `booking/${laterBooking}`, kind: "booking" });
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "1 unread booking notifications", exact: true }).click();
      dismissFailure = true;
      await page.getByRole("dialog", { name: "Booking notifications", exact: true }).getByRole("link", { name: /Later Guest/ }).click();
      await page.waitForURL(`**/admin/bookings/${laterBooking}`);
      assert.equal(seen.has(`booking/booking/${laterBooking}`), false, "Failed acknowledgment must leave the alert available");
      dismissFailure = false;
      await page.getByRole("button", { name: "1 unread booking notifications", exact: true }).click();
      await page.getByRole("dialog", { name: "Booking notifications", exact: true }).getByRole("link", { name: /Later Guest/ }).click();
      await page.getByRole("button", { name: "Booking notifications", exact: true }).waitFor();
      assert.equal(seen.has(`booking/booking/${laterBooking}`), true);
      failure = 503;
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Email notifications unavailable", exact: true }).waitFor();
      await page.getByRole("button", { name: "Email notifications unavailable", exact: true }).click();
      await page.getByText("Alerts are temporarily unavailable. Retrying automatically.", { exact: true }).waitFor();
      failure = 0;
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Email notifications", exact: true }).waitFor();
      const hiddenPolls = polls;
      await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
      await page.clock.runFor(15000);
      assert.equal(polls, hiddenPolls, "Hidden tabs should use the slower schedule");
      await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
      await page.waitForResponse(response => response.url().endsWith("/api/admin/notifications"));
      assert.ok(polls > hiddenPolls, "Returning to the dashboard must check immediately");
      hold = true;
      const beforeSlow = polls;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      for (let attempt = 0; attempt < 100 && !release; attempt += 1) await new Promise(resolve => setTimeout(resolve, 10));
      assert.ok(release, "Slow notification fixture should be pending");
      await page.clock.runFor(15000);
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      assert.equal(polls, beforeSlow + 1, "Slow checks must never overlap, even on focus and timer ticks");
      hold = false;
      const released = page.waitForResponse(response => response.url().endsWith("/api/admin/notifications"));
      (release as () => void)();
      await released;
      failure = 401;
      await page.clock.runFor(15000);
      await page.getByText("Your session has expired. Sign in again to receive alerts.", { exact: true }).waitFor();
      const stopped = polls;
      await page.clock.runFor(60000);
      assert.equal(polls, stopped, "Expired sessions must stop polling");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Notifications browser QA passed at ${width}px: automatic booking/email alerts, deduplication, list refresh, draft/edit deferral, safe acknowledgment, deep link, reconnect and session expiry.`);
    }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
