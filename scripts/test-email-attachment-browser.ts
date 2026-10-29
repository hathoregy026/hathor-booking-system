import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import postcss, { type AcceptedPlugin } from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import type { AdminBookingDto } from "../lib/admin-bookings";

async function main() {
  const root = process.cwd();
  const booking: AdminBookingDto = {
    id: randomUUID(), code: "HB-12345678", stage: "invoiced", customerName: "Synthetic Guest", guestName: "Synthetic Guest", guestPhone: null,
    partyLabel: "1 guest", partySize: 1, specialRequests: null, customerEmail: "guest@example.com", country: null, status: "REQUESTED",
    cruiseName: "Synthetic Nile voyage", checkInDate: "2026-12-19", checkOutDate: "2026-12-26", departureTime: "2026-12-19T12:00:00Z", arrivalTime: "2026-12-26T12:00:00Z",
    rooms: [], roomTypes: [], cabins: [], totalPriceCents: 700000, cardSurchargeCents: 0, paidCents: 0, depositCents: 150000,
    paymentSchedule: [{ milestone: "INITIAL", cumulativeCents: 150000, dueAt: null }, { milestone: "BALANCE", cumulativeCents: 700000, dueAt: "2026-12-01T00:00:00Z" }],
    paymentMethod: "BANK_TRANSFER", requestedAt: "2026-10-04T10:00:00Z", acceptedAt: "2026-10-04T10:01:00Z", confirmedAt: null, cancelledAt: null,
    cancellationReason: null, guestEmailStatus: "SENT", adminEmailStatus: "SENT", createdAt: "2026-10-04T10:00:00Z", deletedAt: null,
  };
  const code = `import React from "react"; import {createRoot} from "react-dom/client"; import {EmailComposer} from "./components/admin/EmailComposer"; import {BookingActionDialog} from "./components/admin/bookings/BookingActions"; import {ToastProvider} from "./components/admin/ToastProvider"; import {AdminThemeProvider} from "./components/admin/ThemeProvider";
    const params=new URLSearchParams(location.search); const stage=params.get("stage"); const booking=${JSON.stringify(booking)};
    if(stage==="requested") booking.acceptedAt=null;
    if(stage==="installment" || stage==="final" || stage==="confirmation") {booking.status="CONFIRMED"; booking.paidCents=stage==="final" ? 500000 : 150000;}
    if(stage==="refund") {booking.status="CANCELLED"; booking.paidCents=150000;}
    const done=()=>{document.body.dataset.completed="true";};
    createRoot(document.getElementById("root")).render(<AdminThemeProvider><ToastProvider>{stage ? <BookingActionDialog booking={booking} kind={stage==="confirmation" ? "send-confirmation" : "payment"} onClose={()=>{}} onDone={done}/> : <EmailComposer initial={{to:"guest@example.com",recipientName:"Synthetic Guest",subject:"Attachment test",mailboxId:"info"}} onClose={()=>{}} onSent={done}/>}</ToastProvider></AdminThemeProvider>);`;
  const bundle = await build({ stdin: { contents: code, resolveDir: root, loader: "tsx" }, bundle: true, write: false, platform: "browser", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" } });
  const utilities = (await postcss([tailwindcss({ base: root }) as unknown as AcceptedPlugin]).process('@import "tailwindcss";', { from: path.join(root, "app/globals.css") })).css;
  const css = utilities + await readFile(path.join(root, "app/admin.css"), "utf8") + await readFile(path.join(root, "app/admin-shell.css"), "utf8") + await readFile(path.join(root, "app/admin/(panel)/inbox/inbox.css"), "utf8");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    await mkdir(path.join(root, "output/attachment-qa"), { recursive: true });
    for (const width of [1440, 768, 390]) {
      for (const stage of ["", "requested", "deposit", "installment", "final", "refund", "confirmation"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        let sent = 0;
        let requests = 0;
        let pending = false;
        let sendBody: string | null = null;
        let uploaded = "";
        let finishUpload!: () => void;
        const uploadGate = new Promise<void>(resolve => { finishUpload = resolve; });
        await page.route("https://attachments.hathor.local/**", async route => {
          const url = new URL(route.request().url());
          if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: '<html data-theme="night"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body class="admin-theme"><div class="admin-shell"><main id="root" style="padding:20px"></main></div><script src="/app.js"></script></body></html>' });
          if (url.pathname === "/app.js") return route.fulfill({ contentType: "text/javascript", body: bundle.outputFiles[0].text });
          if (url.pathname === "/style.css") return route.fulfill({ contentType: "text/css", body: css });
          if (url.pathname.endsWith("/attachments")) {
            const input = route.request().postDataJSON();
            assert.equal(input.name, "receipt.pdf");
            if (!stage) assert.match(input.draftId, /^[a-f0-9-]{36}$/);
            uploaded = `bookings/${stage ? booking.id : "synthetic-private"}/${randomUUID()}-receipt.pdf`;
            return route.fulfill({ json: { path: uploaded, name: "receipt.pdf", contentType: "application/pdf", signedUrl: "https://attachments.hathor.local/storage-upload" } });
          }
          if (url.pathname === "/storage-upload") {
            assert.equal(route.request().method(), "PUT");
            assert.equal(route.request().headers()["x-upsert"], "false");
            await uploadGate;
            return route.fulfill({ json: { uploaded: true } });
          }
          if (url.pathname === "/api/admin/inbox/send" || url.pathname === `/api/admin/bookings/${booking.id}`) {
            requests++;
            const input = route.request().postDataJSON();
            assert.deepEqual(input.attachments, [{ path: uploaded, name: "receipt.pdf" }]);
            if (stage) {
              assert.equal(input.type, stage === "confirmation" ? "send-confirmation" : "record-payment");
              if (stage !== "confirmation") assert.equal(input.payment.kind, stage === "refund" ? "REFUND" : "RECEIPT");
              sent++;
              return route.fulfill({ json: { booking, email: { sent: true, to: "guest@example.com" } } });
            }
            assert.equal(input.mailboxId, "info");
            if (sendBody) assert.equal(route.request().postData(), sendBody, "Pending retries retain attachment paths and the request UUID");
            sendBody = route.request().postData();
            pending = !pending;
            if (!pending) sent++;
            return route.fulfill({ status: pending ? 202 : 200, json: { id: input.requestId, status: pending ? "PENDING" : "SENT" } });
          }
          return route.fulfill({ status: 404, body: "Not found" });
        });
        await page.goto(`https://attachments.hathor.local/${stage ? `?stage=${stage}` : ""}`);
        await page.getByRole("button", { name: "Attach files", exact: true }).waitFor();
        if (stage && stage !== "confirmation") await page.getByLabel("Bank / processor reference", { exact: false }).fill("SYNTHETIC-REFERENCE");
        if (!stage) await page.getByLabel("Message", { exact: true }).fill("Synthetic message with receipt.");
        await page.locator('input[type="file"]').setInputFiles({ name: "receipt.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nSynthetic receipt\n%%EOF") });
        await page.getByLabel("Uploading", { exact: true }).waitFor();
        const submit = page.getByRole("button", { name: stage === "refund" ? "Record refund" : stage === "confirmation" ? "Send confirmation" : stage ? "Record payment" : "Send email", exact: true });
        assert.equal(await submit.isDisabled(), true);
        assert.equal(requests, 0, "Uploading files cannot submit a payment or email");
        finishUpload();
        await page.getByLabel("Uploading", { exact: true }).waitFor({ state: "detached" });
        await page.getByRole("button", { name: "Remove receipt.pdf", exact: true }).waitFor();
        assert.equal(await submit.isEnabled(), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
        if (stage === "deposit" || !stage) await page.screenshot({ path: path.join(root, `output/attachment-qa/${width}-${stage || "composer"}.png`), fullPage: true });
        await submit.click();
        if (!stage) {
          await page.getByRole("button", { name: "Check sending status", exact: true }).waitFor();
          assert.equal(await page.getByRole("button", { name: "Attach files", exact: true }).isDisabled(), true);
          assert.equal(await page.getByRole("button", { name: "Remove receipt.pdf", exact: true }).isDisabled(), true);
          await page.getByRole("button", { name: "Check sending status", exact: true }).click();
        }
        await page.waitForFunction(() => document.body.dataset.completed === "true");
        assert.equal(sent, 1);
        assert.deepEqual(errors, [], `No browser errors at ${width}px / ${stage || "composer"}`);
        await page.close();
      }
    }
    console.log("PASS: attachment upload/send in new emails and every payment/confirmation dialog at desktop, tablet and phone widths; upload blocking, private mailbox sender, immutable pending retries and no browser errors. No live emails or payments.");
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Attachment browser test failed"); process.exitCode = 1; });
