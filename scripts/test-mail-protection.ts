import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { screenInquiry, screenMail } from "../lib/mail-screening";
import { processReceivedDashboardEmail } from "../lib/dashboard-inbound";
import { processReceivedBookingEmail } from "../lib/resend-inbound";
import { fetchDashboardInbox, inboxQuerySchema, inboxMutationSchema, setInboxFolder } from "../lib/dashboard-inbox";
import * as security from "../lib/public-api-security";
import { quarantineInquiry } from "../lib/inquiry-quarantine";
import { receivedEmailHtmlDocument } from "../lib/email-html-view";
import type { bookingQuery } from "../lib/booking-database";

const fixtureRequire = createRequire(`${process.cwd()}/package.json`);
const request = (overrides = {}) => new Request("https://hathor.test/api/contact", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://hathor.test" },
  body: JSON.stringify({ type: "contact", name: "Amira Hassan", email: "amira@example.com", message: "Please help us plan our anniversary voyage.", turnstileToken: "test-token", ...overrides }),
});

async function main() {
  assert.equal(screenInquiry({ name: "aWMGSbtjsBRBvpIxDqM", message: "BrvlSGUyuMdGiklsymjQFG" }).folder, "spam");
  for (const name of ["محمد علي", "李明", "Élodie D’Amour", "Ng", "aWMGSbtjsBRBvpIxDqM"]) {
    assert.equal(screenInquiry({ name, message: "Can I book?" }).folder, "inbox");
  }
  assert.equal(screenInquiry({ name: "Amira", message: "Hello", website: "bot.example" }).folder, "spam");
  assert.equal(screenMail({ subject: "Question", text: "Please send your password to verify." }).folder, "security");
  assert.equal(screenMail({ subject: "Question", text: "Please send your itinerary." }).folder, "inbox");
  assert.equal(screenMail({ subject: "Receipt", text: "Attached", attachments: [{ filename: "receipt.pdf.exe", content_type: "application/octet-stream" }] }).folder, "security");
  assert.equal(screenMail({ subject: "Receipt", text: "Attached", attachments: [{ filename: "receipt.pdf", content_type: "application/pdf" }] }).folder, "inbox");
  assert.equal(screenMail({ subject: "Reply", text: "Hello", authentication: { spf: "fail", dkim: "pass", dmarc: "pass" } }).folder, "inbox", "Forwarding-related SPF failure alone is not a threat verdict");
  assert.equal(screenMail({ subject: "Reply", text: "Hello", authentication: { spf: "pass", dkim: "fail", dmarc: "fail" } }).folder, "security");
  assert.equal(screenMail({ subject: "Reply", text: "Click here", html: '<a href="https://trusted.example@evil.example">Reservation</a>' }).folder, "security");
  assert.equal(screenMail({ subject: "Contact inquiry", text: "Name: aWMGSbtjsBRBvpIxDqM\nMessage:\nBrvlSGUyuMdGiklsymjQFG" }).folder, "spam");
  assert.equal(inboxMutationSchema.safeParse({ folder: "security", read: true }).success, false);
  assert.equal(inboxMutationSchema.safeParse({ folder: "deleted" }).success, false);
  assert.equal(inboxQuerySchema.parse({}).folder, "inbox");

  // Exercise the real endpoint with isolated providers; no mail or database I/O.
  let sent = 0, quarantined = 0;
  const code = ts.transpileModule(readFileSync("app/api/contact/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const routeExports: { POST?: (request: Request) => Promise<Response> } = {};
  const overrides: Record<string, unknown> = {
    "@/lib/inquiry-email": { sendInquiryEmail: async () => { sent++; return { receiptSent: true }; } },
    "@/lib/inquiry-quarantine": { quarantineInquiry: async () => { quarantined++; } },
    "@/lib/mail-screening": { screenInquiry },
    "@/lib/turnstile": { verifyInquiryTurnstile: async () => {} },
    "@/lib/public-api-security": { ...security, enforcePublicRateLimit: async () => {}, enforceKeyedRateLimit: async () => {} },
    "@/lib/selection-catalog": { isKnownResidenceSlug: () => false, isKnownVoyageSlug: () => false },
    "@/lib/selection-enquiry": { SELECTION_ENQUIRY_LIMITS: { maxSlugLength: 120, maxGuests: 50, maxFavorites: 10 } },
    "@/lib/page-content": { CHARTER_PAGE: { overview: { routes: [] } } },
  };
  runInNewContext(code, { exports: routeExports, console, require: (name: string) => overrides[name] ?? fixtureRequire(name), Buffer, URL });
  assert.equal((await routeExports.POST!(request())).status, 200); assert.equal(sent, 1);
  assert.equal((await routeExports.POST!(request({ website: "bot.example", turnstileToken: undefined }))).status, 200); assert.equal(sent, 1); assert.equal(quarantined, 1);
  assert.equal((await routeExports.POST!(request({ name: "aWMGSbtjsBRBvpIxDqM", message: "BrvlSGUyuMdGiklsymjQFG" }))).status, 200); assert.equal(sent, 1); assert.equal(quarantined, 2);
  assert.equal((await routeExports.POST!(request({ message: "Please send your password to confirm." }))).status, 200); assert.equal(sent, 1); assert.equal(quarantined, 3);

  const emailId = randomUUID();
  const base = { id: emailId, from: "sender@example.com", to: ["reservations@reply.hathorcruise.com"], subject: "Suspicious", text: "Please send your password.", html: null, message_id: "<mail@example.com>", created_at: new Date().toISOString(), headers: { "X-Spam-Status": "No" }, attachments: [] };
  let generalFolder: unknown;
  const generalQuery = (async (sql: string, values: unknown[] = []) => {
    if (sql.startsWith("SELECT")) return [];
    generalFolder = values[10]; return [];
  }) as typeof bookingQuery;
  await processReceivedDashboardEmail({ type: "email.received", data: { email_id: emailId, to: base.to } }, { query: generalQuery, request: async () => base });
  assert.equal(generalFolder, "security");

  let notifications = 0, stored: Record<string, unknown> | null = null;
  const address = `r-${"a".repeat(48)}@reply.hathorcruise.com`;
  const bookingDb = (async (sql: string, values: unknown[] = []) => {
    if (sql.includes('FROM "BookingEmailThread"')) return [{ bookingId: "fixture", customerEmail: "sender@example.com" }];
    if (sql.startsWith("SELECT")) return stored ? [stored] : [];
    if (sql.startsWith("INSERT")) { stored = { id: values[0], bookingId: "fixture", folder: values[12], notificationSentAt: null }; return [stored]; }
    throw new Error("A quarantined reply must never claim notification delivery");
  }) as typeof bookingQuery;
  const bookingProvider = async (_path: string, body?: unknown) => { if (body) notifications++; return { ...base, to: [address] }; };
  const bookingEvent = { type: "email.received" as const, data: { email_id: emailId, to: [address] } };
  await processReceivedBookingEmail(bookingEvent, { query: bookingDb, request: bookingProvider });
  await processReceivedBookingEmail(bookingEvent, { query: bookingDb, request: bookingProvider });
  assert.equal(notifications, 0);

  const sqlCalls: Array<{ sql: string; values: unknown[] }> = [];
  const query = (async (sql: string, values: unknown[] = []) => { sqlCalls.push({ sql, values }); return sql.includes("COUNT(*)") ? [{ count: 0 }] : []; }) as typeof bookingQuery;
  await fetchDashboardInbox(inboxQuerySchema.parse({ folder: "spam" }), query);
  assert.match(sqlCalls[0].sql, /folder = \$7/); assert.equal(sqlCalls[0].values[6], "spam");
  assert.match(sqlCalls[2].sql, /folder = 'inbox'/);
  await setInboxFolder("booking", emailId, "inbox", query);
  const restoreCall = sqlCalls.find(call => call.sql.startsWith('UPDATE "BookingMessage"'))!;
  assert.match(restoreCall.sql, /direction = 'INBOUND'/); assert.match(restoreCall.sql, /COALESCE/);
  await quarantineInquiry({ type: "contact", name: "Guest", email: "guest@example.com", phone: "+20 555 0100", message: "Hello", website: "trap" }, { folder: "spam", reasons: ["honeypot_filled"] }, query);
  const storedInquiry = sqlCalls.find(call => call.sql.startsWith('INSERT INTO "InboxMessage"'))!;
  assert.ok(!JSON.stringify(storedInquiry.values).includes("website"));
  assert.ok(!JSON.stringify(storedInquiry.values).includes("trap"));
  assert.match(String(storedInquiry.values[6]), /Phone: \+20 555 0100/);
  assert.match(String(storedInquiry.values[6]), /Message:\nHello/);
  assert.equal(storedInquiry.values[10], "spam");
  await assert.rejects(receivedEmailHtmlDocument("general", emailId, false, { query }), (error: unknown) => error instanceof security.PublicRequestError && error.status === 404);
  console.log("PASS: human inquiries, bot patterns, threats, trusted authentication, no-send quarantine, webhook retries, folder filtering, restore and protected text-only preview.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
