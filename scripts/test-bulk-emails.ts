import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { NextRequest } from "next/server";
import { zipSync, strToU8 } from "fflate";
import { extractBulkRecipients, bulkCampaignSchema, bulkTemplateSchema } from "../lib/bulk-email-validation";
import { bulkTemplateDefaults } from "../lib/bulk-email-render";
import { importBulkRecipients } from "../lib/bulk-email-import";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "../lib/admin-auth";
import { getDefaultEmailTemplate } from "../lib/email-templates";
import { bulkUnsubscribe, campaignView, createBulkCampaign, getBulkCampaign, processBulkCampaign, sendBulkBatch } from "../lib/bulk-email-service";
import { readBulkRecord, suppressedBulkEmails, updateBulkRecord } from "../lib/bulk-email-store";
import { POST as importRoute } from "../app/api/admin/bulk-emails/import/route";
import { POST as createRoute } from "../app/api/admin/bulk-emails/route";
import { POST as sendRoute } from "../app/api/admin/bulk-emails/[id]/route";
import type { BulkCampaignView } from "../lib/bulk-email-types";
import { combineBulkRecipientSources, type BulkRecipientSource } from "../lib/bulk-email-recipient-sources";
import { POST as savedPreviewRoute } from "../app/api/admin/bulk-emails/[id]/preview/route";
import { GET as unsubscribeGet, POST as unsubscribePost } from "../app/bulk-email/unsubscribe/route";
import { POST as imageRoute } from "../app/api/admin/bulk-emails/images/route";
import { bulkBannerPreviewSrc, standardBulkBannerPreviewUrl } from "../lib/bulk-email-images";
import sharp from "sharp";

export function xlsxFixture() {
  const files = {
    "[Content_Types].xml": '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels": '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml": '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Guests" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels": '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Email</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>guest@example.com</t></is></c></row><row r="3"><c r="A3" t="inlineStr"><is><t>GUEST@example.com</t></is></c></row><row r="4"><c r="A4" t="inlineStr"><is><t>second@example.com</t></is></c></row><row r="5"><c r="A5" t="inlineStr"><is><t>broken@</t></is></c></row></sheetData></worksheet>',
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])));
}
export function pdfFixture(text = "pdfguest@example.com") {
  const stream = `BT /F1 12 Tf 50 700 Td (${text}) Tj ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

async function main() {
  Object.assign(process.env, { NODE_ENV: "test", BULK_EMAIL_STORAGE: "local", BULK_EMAIL_MODE: "preview" });
  process.env.BULK_EMAIL_MODE = "send";
  process.env.BULK_EMAIL_TEST_RECIPIENTS = "allowed@example.com";
  await assert.rejects(() => createBulkCampaign({ id: randomUUID(), confirmed: true, subject: "Staging guard", message: "This must not send.", emails: ["unapproved@example.com"] }, "synthetic-session"), /approved test addresses/);
  delete process.env.BULK_EMAIL_TEST_RECIPIENTS;
  process.env.BULK_EMAIL_MODE = "preview";
  process.env.BULK_EMAIL_LOCAL_DIRECTORY = `.tmp-bulk-email-tests-${randomUUID()}`;
  process.env.ADMIN_SESSION_SECRET = "synthetic-bulk-test-secret-not-used-by-the-application";
  process.env.SUPABASE_URL = "https://bulk-test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-storage-key-for-local-test-only";
  const theme = getDefaultEmailTemplate("BookingMessage");
  const defaultTemplate = bulkTemplateDefaults(theme);
  const customTemplate = { ...defaultTemplate, heading: '<script>parent.templateInjected=true</script>', eyebrow: "Invitation from Hathor", showBanner: false, primaryColor: "#9f7c41", backgroundColor: "#efe5d5", footer: { ...defaultTemplate.footer, replyNote: "A custom bulk-only footer note" } };
  assert.equal(bulkTemplateSchema.safeParse({ ...customTemplate, primaryColor: "red;background:url(https://evil.test)" }).success, false);
  assert.equal(bulkTemplateSchema.safeParse({ ...customTemplate, footer: { ...customTemplate.footer, email: "javascript:alert(1)" } }).success, false);
  assert.equal(bulkTemplateSchema.safeParse({ ...customTemplate, heroImageUrl: "https://evil.test/track" }).success, false);
  const campaignImage = `https://bulk-test.supabase.co/storage/v1/object/public/email-images/bulk-campaigns/${randomUUID()}/${randomUUID()}.jpg`;
  assert.equal(bulkBannerPreviewSrc("javascript:alert(1)"), "");
  assert.equal(bulkBannerPreviewSrc("https://evil.test/email/hathor-email-hero.jpg"), "/email/hathor-email-hero.jpg");
  assert.equal(bulkBannerPreviewSrc(campaignImage + "?tracking=1"), "");
  assert.equal(bulkBannerPreviewSrc(campaignImage), campaignImage);
  assert.equal(standardBulkBannerPreviewUrl("https://other.supabase.co/storage/v1/object/public/email-images/hero.jpg"), "");
  assert.equal(standardBulkBannerPreviewUrl("https://bulk-test.supabase.co/storage/v1/object/public/email-images/hero.jpg"), "https://bulk-test.supabase.co/storage/v1/object/public/email-images/hero.jpg");
  for (const invalid of ["javascript:alert(1)", "data:image/svg+xml,test", campaignImage.replace("bulk-test", "other-project"), campaignImage + "?tracking=1", campaignImage.replace("bulk-campaigns/", "hero-/"), campaignImage.replace(".jpg", ".svg")]) {
    assert.equal(bulkTemplateSchema.safeParse({ ...customTemplate, heroImageUrl: invalid }).success, false, "Untrusted bulk image destinations are rejected");
  }
  const imageTemplate = { ...defaultTemplate, heroImageUrl: campaignImage, signature: "Warm regards,\nBulk correspondence team\n<script>unsafe</script>" };
  const themedBefore = structuredClone(theme);
  const imageCampaign = await createBulkCampaign({ id: randomUUID(), confirmed: true, subject: "Private campaign design", message: "Only this bulk email", emails: ["image@example.com"], template: imageTemplate }, "synthetic-session", undefined, theme);
  assert.ok(imageCampaign.payload[0].html.includes(campaignImage));
  assert.ok(imageCampaign.payload[0].html.includes("Bulk correspondence team<br"));
  assert.ok(imageCampaign.payload[0].html.includes("&lt;script&gt;unsafe&lt;/script&gt;"));
  assert.deepEqual(theme, themedBefore, "Campaign banner and signature cannot mutate shared template data");
  assert.deepEqual(imageCampaign.template, imageTemplate, "History stores this campaign's independent design");
  const storageFetch = globalThis.fetch;
  const uploaded: string[] = [];
  try {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input instanceof Request ? input.url : input);
      assert.ok(url.startsWith("https://bulk-test.supabase.co/storage/v1/object/email-images/bulk-campaigns/"), "Upload only creates a new campaign image");
      uploaded.push(url);
      return new Response(JSON.stringify({ Key: "test-only" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#b69f64" } }).png().toBuffer();
    const form = new FormData(); form.set("file", new File([new Uint8Array(image)], "test.png", { type: "image/png" }));
    const response = await imageRoute(new NextRequest("http://localhost:3010/api/admin/bulk-emails/images", { method: "POST", headers: { Origin: "http://localhost:3010", Cookie: `${ADMIN_SESSION_COOKIE}=${createSessionToken()}` }, body: form }));
    assert.equal(response.status, 200); assert.equal(uploaded.length, 1);
    assert.match((await response.json()).url, /\/bulk-campaigns\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/);
  } finally { globalThis.fetch = storageFetch; }
  const badImage = new FormData(); badImage.set("file", new File(["<svg><script>bad</script></svg>"], "bad.svg", { type: "image/svg+xml" }));
  assert.equal((await imageRoute(new NextRequest("http://localhost:3010/api/admin/bulk-emails/images", { method: "POST", headers: { Origin: "http://localhost:3010", Cookie: `${ADMIN_SESSION_COOKIE}=${createSessionToken()}` }, body: badImage }))).status, 400);
  assert.equal((await imageRoute(new NextRequest("http://localhost:3010/api/admin/bulk-emails/images", { method: "POST" }))).status, 401);
  const customInput = { id: randomUUID(), subject: "Template editor preview", message: "Custom content", emails: ["template@example.com"], confirmed: true, template: customTemplate };
  const customCampaign = await createBulkCampaign(customInput, "synthetic-session", undefined, theme);
  assert.match(customCampaign.payload[0].html, /class="email-heading"[^>]*>Template editor preview<\/p>/, "The subject is the email heading");
  assert.ok(!customCampaign.payload[0].html.includes("parent.templateInjected"), "Legacy title values cannot override the subject");
  assert.ok(customCampaign.payload[0].html.includes("A custom bulk-only footer note"));
  assert.ok(customCampaign.payload[0].html.includes("#efe5d5"));
  assert.ok(!customCampaign.payload[0].html.includes('alt="Luxury Hathor'));
  assert.ok(customCampaign.payload[0].html.includes('alt="Hathor"'));
  assert.ok(customCampaign.payload[0].html.includes("Unsubscribe from bulk emails"));
  assert.deepEqual(bulkTemplateDefaults(theme), defaultTemplate, "Customizing bulk content never mutates shared branding");
  await assert.rejects(() => createBulkCampaign({ ...customInput, template: { ...customTemplate, heading: "Changed" } }, "synthetic-session", undefined, theme), /different content/);
  const fileSource: BulkRecipientSource = { id: "file", kind: "file", name: "guests.xlsx", emails: ["shared@example.com", "file@example.com"], duplicates: 0, invalid: [], warnings: [] };
  const manualSource: BulkRecipientSource = { ...fileSource, id: "manual", kind: "manual", name: "Manual", emails: ["shared@example.com", "manual@example.com"] };
  assert.equal(combineBulkRecipientSources([fileSource, manualSource]).duplicates, 1);
  assert.deepEqual(combineBulkRecipientSources([manualSource]).emails, ["shared@example.com", "manual@example.com"], "Removing a file preserves manually entered overlaps");
  assert.deepEqual(combineBulkRecipientSources([fileSource, manualSource], ["shared@example.com"]).emails, ["file@example.com", "manual@example.com"]);
  const extracted = extractBulkRecipients(["One <Person+tag@example.com>; PERSON+TAG@example.com, invalid@\nsecond@example.com."]);
  assert.deepEqual(extracted.emails, ["person+tag@example.com", "second@example.com"]); assert.equal(extracted.duplicates, 1); assert.deepEqual(extracted.invalid, ["invalid@"]);
  assert.equal(bulkCampaignSchema.safeParse({ id: randomUUID(), subject: "x\r\nBcc: attacker@example.com", message: "text", emails: ["a@example.com"], confirmed: true }).success, false);
  assert.equal(bulkCampaignSchema.safeParse({ id: randomUUID(), subject: "x", message: "text", emails: Array.from({ length: 101 }, (_, i) => `person${i}@example.com`), confirmed: true }).success, false);
  const csv = await importBulkRecipients(new File(["Email\nfirst@example.com\nFIRST@example.com\nbad@"], "guests.csv")); assert.equal(csv.emails.length, 1); assert.equal(csv.duplicates, 1);
  const xlsx = await importBulkRecipients(new File([Buffer.from(xlsxFixture())], "guests.xlsx")); assert.deepEqual(xlsx.emails, ["guest@example.com", "second@example.com"]); assert.equal(xlsx.duplicates, 1); assert.deepEqual(xlsx.invalid, ["broken@"]);
  const pdf = await importBulkRecipients(new File([pdfFixture()], "guests.pdf")); assert.deepEqual(pdf.emails, ["pdfguest@example.com"]);
  await assert.rejects(() => importBulkRecipients(new File(["<script>bad</script>"], "fake.pdf")), /not a valid PDF/);
  await assert.rejects(() => importBulkRecipients(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.csv")), /smaller than/);
  const bomb = zipSync({ "xl/workbook.xml": strToU8("a".repeat(21 * 1024 * 1024)) }); await assert.rejects(() => importBulkRecipients(new File([Buffer.from(bomb)], "bomb.xlsx")), /too large/);

  const id = randomUUID();
  const input = { id, subject: "A Hathor test", message: '<script>parent.injected=true</script>\nHello from Hathor.', emails: Array.from({ length: 100 }, (_, i) => `guest${i}@example.com`), confirmed: true };
  const campaign = await createBulkCampaign(input, "synthetic-session", undefined, theme);
  assert.equal(campaign.payload.length, 100); assert.ok(campaign.payload[0].html.includes("&lt;script&gt;")); assert.ok(!campaign.payload[0].html.includes("<script>parent.injected"));
  assert.equal(campaign.payload[0].to, "guest0@example.com"); assert.equal(campaign.payload[1].to, "guest1@example.com"); assert.ok(!campaign.payload[0].html.includes("guest1@example.com"));
  assert.equal("payload" in campaignView(campaign), false);
  assert.equal("previewHtml" in campaignView(campaign), false);
  const previewRequest = new NextRequest("http://localhost:3010/api/admin/bulk-emails/preview", { method: "POST", headers: { Origin: "http://localhost:3010", Cookie: `${ADMIN_SESSION_COOKIE}=${createSessionToken()}` } });
  const savedPreview = await savedPreviewRoute(previewRequest, { params: Promise.resolve({ id }) });
  assert.equal(savedPreview.status, 200);
  const savedHtml = (await savedPreview.json()).html;
  assert.ok(savedHtml.includes("Hello from Hathor.")); assert.ok(savedHtml.includes("Content-Security-Policy"));
  assert.ok(!savedHtml.includes("?token="), "History preview never exposes recipient unsubscribe capabilities");
  assert.equal((await savedPreviewRoute(new NextRequest("http://localhost:3010/api/admin/bulk-emails/preview", { method: "POST", headers: { Origin: "http://localhost:3010" } }), { params: Promise.resolve({ id }) })).status, 401);
  const token = new URL(campaign.payload[0].headers["List-Unsubscribe"].slice(1, -1)).searchParams.get("token")!;
  assert.equal(campaign.payload[0].headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  const oneClickUrl = `http://localhost:3010/bulk-email/unsubscribe?token=${token}`;
  assert.equal((await unsubscribeGet(new NextRequest(oneClickUrl))).status, 200);
  assert.equal((await suppressedBulkEmails(["guest0@example.com"])).size, 0, "Scanners following GET cannot unsubscribe");
  assert.equal((await unsubscribePost(new NextRequest(oneClickUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=Not-One-Click" }))).status, 400);
  assert.equal((await unsubscribePost(new NextRequest("http://localhost:3010/bulk-email/unsubscribe?token=invalid", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" }))).status, 400);
  assert.equal((await unsubscribePost(new NextRequest(oneClickUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" }))).status, 200);
  assert.equal((await suppressedBulkEmails(["guest0@example.com"])).size, 1, "Provider one-click works with a valid capability and no Origin header");
  await bulkUnsubscribe(token); assert.equal((await suppressedBulkEmails(["guest0@example.com", "guest1@example.com"])).size, 1);
  await assert.rejects(() => bulkUnsubscribe(token.slice(0, -2) + "xx"));
  const again = await createBulkCampaign(input, "other-session", undefined, theme); assert.deepEqual(again.payload, campaign.payload);
  await assert.rejects(() => createBulkCampaign({ ...input, subject: "changed" }, "synthetic-session", undefined, theme), /different content/);
  let attemptedNetwork = 0;
  const fake = async () => { attemptedNetwork++; return { kind: "accepted" as const, ids: [] }; };
  await Promise.all(Array.from({ length: 4 }, () => processBulkCampaign(id, fake)));
  const completed = await getBulkCampaign(id);
  assert.equal(completed.status, "simulated"); assert.equal(completed.recipients.filter(row => row.status === "simulated").length, 99); assert.equal(completed.recipients[0].status, "skipped"); assert.equal(attemptedNetwork, 0);
  assert.equal((await processBulkCampaign(id, fake)).status, "simulated");
  const encryptedFiles = (await readdir(process.env.BULK_EMAIL_LOCAL_DIRECTORY)).filter(name => name.endsWith(".json"));
  for (const filename of encryptedFiles) assert.ok(!(await readFile(`${process.env.BULK_EMAIL_LOCAL_DIRECTORY}/${filename}`, "utf8")).includes("guest0@example.com"));
  const expired = { ...campaign, id: randomUUID(), status: "uncertain" as const, firstAttemptAt: new Date(Date.now() - 24 * 3600000).toISOString() };
  await updateBulkRecord(`campaign:${expired.id}`, () => expired); await assert.rejects(() => processBulkCampaign(expired.id), /safe retry window/);

  const originalFetch = globalThis.fetch; const keys: string[] = []; const payloads: string[] = [];
  globalThis.fetch = async (_url, init) => { keys.push((init!.headers as Record<string, string>)["Idempotency-Key"]); payloads.push(String(init!.body)); return Response.json({ data: campaign.payload.map((_, i) => ({ id: `provider-${i}` })) }); };
  try {
    assert.equal((await sendBulkBatch({ ...campaign, mode: "send" })).kind, "accepted"); await sendBulkBatch({ ...campaign, mode: "send" }); assert.equal(keys[0], keys[1]); assert.equal(payloads[0], payloads[1]);
    globalThis.fetch = async () => { throw new Error("synthetic network loss"); }; assert.equal((await sendBulkBatch(campaign)).kind, "uncertain");
    globalThis.fetch = async () => Response.json({}, { status: 429 }); assert.equal((await sendBulkBatch(campaign)).kind, "failed");
  } finally { globalThis.fetch = originalFetch; }
  const cookie = `${ADMIN_SESSION_COOKIE}=${createSessionToken()}`;
  const req = (body: unknown, origin = "http://localhost:3010", withAuth = true) => new NextRequest("http://localhost:3010/api/admin/bulk-emails", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...(withAuth ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
  assert.equal((await createRoute(req(input, "http://localhost:3010", false))).status, 401);
  assert.equal((await createRoute(req(input, "https://attacker.example"))).status, 403);
  assert.equal((await createRoute(req({ ...input, emails: ["bad@"] }))).status, 400);
  assert.equal((await importRoute(req({ text: "a@example.com" }))).status, 200);
  assert.equal((await importRoute(req({ text: "x".repeat(110000) }))).status, 413);
  assert.equal((await sendRoute(req({ action: "send" }, "https://attacker.example"), { params: Promise.resolve({ id }) })).status, 403);
  assert.equal((await readBulkRecord<BulkCampaignView>(`campaign:${id}`))!.status, "simulated");
  await mkdir("output/bulk-emails", { recursive: true });
  await writeFile("output/bulk-emails/sample-recipients.xlsx", xlsxFixture()); await writeFile("output/bulk-emails/sample-recipients.pdf", pdfFixture());
  console.log("PASS: PDF/Excel/CSV imports, ZIP limits, 100-recipient preview, privacy, escaping, encryption, unsubscribes, concurrent sends, stable retries, expired recovery, authentication, origin and body limits.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
