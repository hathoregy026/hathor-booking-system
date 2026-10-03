import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium } from "playwright";
import { readFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { NotificationSnapshot } from "../lib/admin-notification-types";

async function main() {
  const root = process.cwd();
  const bundle = await build({
    stdin: { contents: 'import React, {useCallback,useState} from "react"; import {createRoot} from "react-dom/client"; import {NotificationBell} from "./components/admin/NotificationBell"; import {DashboardInbox} from "./components/admin/DashboardInbox"; import {AdminThemeProvider} from "./components/admin/ThemeProvider"; import {ToastProvider} from "./components/admin/ToastProvider"; import {useAdminActivityRefresh} from "./hooks/useAdminActivityRefresh"; function Probe(){const[count,setCount]=useState(0);const[paused,setPaused]=useState(false);const refresh=useCallback(()=>setCount(value=>value+1),[]);useAdminActivityRefresh("bookings",refresh,paused);return <div><output aria-label="Booking refreshes">{count}</output><button onClick={()=>setPaused(value=>!value)}>{paused?"Resume updates":"Pause updates"}</button></div>} const params=new URLSearchParams(location.search); createRoot(document.getElementById("root")).render(<AdminThemeProvider><ToastProvider><NotificationBell/><Probe/><DashboardInbox requestedEmail={`${params.get("source")||""}/${params.get("message")||""}`}/></ToastProvider></AdminThemeProvider>);', resolveDir: root, loader: "tsx" },
    bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  });
  const chunkDirectory = path.join(root, ".next/static/chunks");
  const styles = await Promise.all((await readdir(chunkDirectory)).filter(file => file.endsWith(".css")).map(file => readFile(path.join(chunkDirectory, file), "utf8")));
  const utilities = styles.find(css => css.includes("--spacing") && css.includes(".flex"));
  assert.ok(utilities, "Compile Next first for project CSS");
  const css = utilities + await readFile(path.join(root, "app/admin.css"), "utf8") + await readFile(path.join(root, "app/admin-shell.css"), "utf8") + await readFile(path.join(root, "app/admin/(panel)/inbox/inbox.css"), "utf8");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    await mkdir(path.join(root, "output/notification-qa"), { recursive: true });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.clock.install({ time: new Date("2026-10-03T12:00:00.000Z") });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("dialog", dialog => dialog.accept());
      const emailId = randomUUID();
      let polls = 0;
      let acknowledgments = 0;
      let unread = true;
      let failure = 0;
      let hold = false;
      let release: (() => void) | null = null;
      const state: NotificationSnapshot = { unreadCount: 0, bookingCount: 0, emailCount: 0, bookingSeenThrough: "2026-10-03T12:00:00.000Z", items: [], activity: [] };
      await page.route("https://notification-test.hathor.local/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname === "/" || url.pathname === "/admin/inbox") return route.fulfill({ contentType: "text/html", body: '<!doctype html><html data-theme="night"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><main id="root" class="admin-shell" style="padding:24px;max-width:1280px;margin:auto"></main><script src="/app.js"></script></body></html>' });
        if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
        if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
        if (url.pathname === "/api/admin/notifications") {
          if (route.request().method() === "POST") {
            acknowledgments += 1;
            assert.equal(route.request().postDataJSON().seenThrough, state.bookingSeenThrough);
            state.bookingCount = 0;
            state.unreadCount = state.emailCount;
            state.items = state.items.filter(item => item.kind === "email");
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
            state.emailCount = unread ? 1 : 0;
            state.unreadCount = state.bookingCount + state.emailCount;
            state.items = unread ? state.items : state.items.filter(item => item.kind !== "email");
            return route.fulfill({ json: { updated: true } });
          }
          return route.fulfill({ json: { message: { ...email, bodyText: "Hello Hathor", senderMatchesGuest: true, attachments: [] } } });
        }
        return route.fulfill({ status: 404, body: "Not found" });
      });
      await page.goto("https://notification-test.hathor.local/");
      await page.getByRole("button", { name: "Notifications", exact: true }).waitFor();
      await page.waitForFunction(() => document.querySelector('section[aria-label="Email list"]')?.getAttribute("aria-busy") === "false");
      await page.getByRole("button", { name: "Notifications", exact: true }).click();
      await page.getByText("You’re up to date", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Notifications", exact: true }).click();
      await page.getByRole("button", { name: "Send new email", exact: true }).click();
      await page.getByRole("region", { name: "New email", exact: true }).getByLabel("Message", { exact: true }).fill("Keep my unsent draft while notifications arrive.");
      state.bookingCount = 1; state.emailCount = 1; state.unreadCount = 2;
      state.items = [{ id: "new-booking", kind: "booking", source: "booking", name: "Nile Guest", description: "Nile voyage", createdAt: state.bookingSeenThrough }, { id: emailId, kind: "email", source: "general", name: "Nile Guest", description: "A new question", createdAt: state.bookingSeenThrough }];
      state.activity = [{ key: "booking/new-booking", kind: "booking" }, { key: `email/general/${emailId}`, kind: "email" }];
      await page.getByRole("button", { name: "Pause updates", exact: true }).click();
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "2 unread booking and email notifications", exact: true }).waitFor();
      await page.getByText("New booking requests and emails received. Open the notification bell to view them.", { exact: true }).waitFor();
      assert.equal(acknowledgments, 0, "Opening the bell must not clear unseen requests or email read status");
      assert.equal(await page.locator(".admin-toast").count(), 1);
      assert.equal(await page.locator(".admin-toast").first().innerText().then(text => text.includes("New booking")), true);
      assert.equal(await page.getByRole("region", { name: "New email", exact: true }).getByLabel("Message", { exact: true }).inputValue(), "Keep my unsent draft while notifications arrive.");
      assert.equal(await page.getByLabel("Booking refreshes").innerText(), "0", "Editing must defer list refreshes");
      await page.getByRole("button", { name: "Resume updates", exact: true }).click();
      await page.waitForFunction(() => document.querySelector('output[aria-label="Booking refreshes"]')?.textContent === "1");
      await page.getByRole("button", { name: "Close new email", exact: true }).click();
      await page.getByRole("button", { name: /A new question/ }).waitFor();
      const before = polls;
      await page.clock.runFor(15000);
      await page.waitForFunction(() => !document.querySelector('[aria-label="Notifications"]')?.textContent?.includes("New booking requests"));
      assert.ok(polls > before);
      assert.equal(await page.locator(".admin-toast").count(), 0, "Repeated snapshots must not repeat alerts");
      await page.getByRole("button", { name: "2 unread booking and email notifications", exact: true }).click();
      await page.getByRole("button", { name: "Clear booking alerts", exact: true }).click();
      await page.getByRole("button", { name: "1 unread booking and email notifications", exact: true }).waitFor();
      assert.equal(acknowledgments, 1);
      assert.equal(unread, true);
      await page.screenshot({ path: path.join(root, `output/notification-qa/${width}-alerts.png`), fullPage: true });
      const emailLink = page.getByRole("dialog", { name: "Booking and email notifications" }).getByRole("link", { name: /Received email/ });
      const href = await emailLink.getAttribute("href");
      assert.equal(href, `/admin/inbox?source=general&message=${emailId}`);
      await page.goto(`https://notification-test.hathor.local${href}`);
      await page.getByRole("heading", { name: "A new question", exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark read", exact: true }).click();
      await page.getByRole("button", { name: "Mark unread", exact: true }).waitFor();
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Notifications", exact: true }).waitFor();
      assert.equal(await page.locator(".admin-toast").count(), 0);
      failure = 503;
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Notifications unavailable", exact: true }).waitFor();
      await page.getByRole("button", { name: "Notifications unavailable", exact: true }).click();
      await page.getByText("Alerts are temporarily unavailable. Retrying automatically.", { exact: true }).waitFor();
      failure = 0;
      await page.clock.runFor(15000);
      await page.getByRole("button", { name: "Notifications", exact: true }).waitFor();
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
