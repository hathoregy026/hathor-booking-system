import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReplyAttachments, readyAttachments } from "../components/admin/bookings/ReplyAttachments";
import { MAX_ATTACHMENT_BYTES, ATTACHMENT_ACCEPT, attachmentContentType, attachmentProblem, attachmentSignatureMatches, cleanAttachmentName } from "../lib/mail-attachment-rules";
import { attachmentStorageId, mailAttachmentRefsSchema, privateEmailAttachmentScope, resolveAttachments, validateAttachmentMetadata } from "../lib/mail-attachments";
import { staffActionSchema, applyStaffBookingAction } from "../lib/booking-admin-api";
import { administerBooking } from "../lib/booking-engine";
import { paymentReceiptMessage } from "../lib/booking-guest-mail";
import { POST } from "../app/api/admin/bookings/[id]/attachments/route";

async function main() {
  const id = randomUUID();
  const ref = { path: `bookings/test-booking/${id}-receipt.pdf`, name: "receipt.pdf" };
  assert.equal(attachmentStorageId("test-booking", ref.path), id);
  for (const path of [ref.path.replace("test-booking", "other-booking"), `bookings/test-booking/../${id}-receipt.pdf`, "https://example.com/receipt.pdf", `${ref.path}/extra.pdf`]) {
    assert.throws(() => attachmentStorageId("test-booking", path));
  }
  assert.equal(cleanAttachmentName("C:\\private\\receipt.pdf"), "receipt.pdf");
  assert.equal(attachmentContentType("receipt.PDF"), "application/pdf");
  for (const name of ["script.exe", "photo.svg", "page.html", "payload.js", "macro.docm", "unknown", "file.zip", "__proto__"]) {
    assert.ok(attachmentProblem({ name, size: 10 }));
  }
  for (const size of [0, -1, NaN, Infinity, 1.5, MAX_ATTACHMENT_BYTES + 1]) {
    assert.ok(attachmentProblem({ name: "receipt.pdf", size }));
  }
  assert.equal(attachmentProblem({ name: "receipt.pdf", size: MAX_ATTACHMENT_BYTES }), null);
  assert.equal(attachmentSignatureMatches("receipt.pdf", new TextEncoder().encode("%PDF-1.4")), true);
  assert.equal(attachmentSignatureMatches("receipt.pdf", new TextEncoder().encode("<script>bad</script>")), false);
  assert.equal(attachmentSignatureMatches("photo.png", Uint8Array.from([137,80,78,71,13,10,26,10])), true);
  assert.equal(attachmentSignatureMatches("photo.jpg", Uint8Array.from([255,216,255])), true);
  assert.equal(attachmentSignatureMatches("office.docx", Uint8Array.from([80,75,3,4])), true);
  assert.equal(attachmentSignatureMatches("notes.txt", Uint8Array.from([77,90,0])), false);
  assert.equal(validateAttachmentMetadata("test-booking", ref, 42, "application/pdf").id, id);
  assert.throws(() => validateAttachmentMetadata("test-booking", ref, 42, "image/png"));
  assert.throws(() => validateAttachmentMetadata("test-booking", { ...ref, name: "photo.png" }, 42, "image/png"));
  assert.throws(() => validateAttachmentMetadata("test-booking", ref, MAX_ATTACHMENT_BYTES + 1, "application/pdf"));
  assert.equal(mailAttachmentRefsSchema.safeParse([ref, ref]).success, false);
  assert.equal(mailAttachmentRefsSchema.safeParse(Array.from({ length: 11 }, () => ({ ...ref, path: randomUUID() }))).success, false);
  assert.equal(staffActionSchema.safeParse({ type: "message", message: "Here is your invoice", attachments: [ref] }).success, true);
  assert.equal(staffActionSchema.safeParse({ type: "accept", instructions: "Please use this invoice", attachments: [ref] }).success, true);
  assert.equal(staffActionSchema.safeParse({ type: "send-confirmation", attachments: [ref] }).success, true);
  const payment = { reference: "RECEIPT-12345", method: "BANK_TRANSFER" as const, amountCents: 150000, kind: "RECEIPT" as const, receivedAt: new Date(Date.now() - 60000).toISOString() };
  assert.equal(staffActionSchema.safeParse({ type: "record-payment", payment, attachments: [ref] }).success, true);
  const draft = randomUUID();
  const scope = privateEmailAttachmentScope("session-one", draft);
  assert.notEqual(scope, privateEmailAttachmentScope("session-two", draft));
  assert.notEqual(scope, privateEmailAttachmentScope("session-one", randomUUID()));
  assert.throws(() => privateEmailAttachmentScope("session-one", "invalid"));
  assert.throws(() => attachmentStorageId(scope, ref.path));
  assert.match(paymentReceiptMessage({ ...payment, receivedAt: new Date(payment.receivedAt) }), /recorded your payment of \$1,500\.00/);
  assert.match(paymentReceiptMessage({ ...payment, kind: "REFUND", receivedAt: new Date(payment.receivedAt) }), /recorded your refund/);
  for (const [before, after, kind] of [["INVOICED", "CONFIRMED", "RECEIPT"], ["INVOICED", "INVOICED", "RECEIPT"], ["CONFIRMED", "CONFIRMED", "RECEIPT"], ["CANCELLED", "CANCELLED", "REFUND"]] as const) {
    const calls: string[] = [];
    const attachments = [{ id, filename: ref.name, storagePath: ref.path, path: "https://example.com/file.pdf", contentType: "application/pdf" }];
    const result = await applyStaffBookingAction("test-booking", { type: "record-payment", payment: { ...payment, kind }, attachments: [ref] }, "session", {
      resolveAttachments: async (bookingId, refs) => { assert.equal(bookingId, "test-booking"); assert.deepEqual(refs, [ref]); calls.push("resolve"); return attachments; },
      fetchBookingStatus: async () => before,
      administerBooking: async (bookingId, action) => { assert.equal(bookingId, "test-booking"); assert.equal(action.type, "record-payment"); assert.equal(action.payment?.amountCents, payment.amountCents); assert.equal(action.payment?.recordedBySession, "session"); assert.ok(!("attachments" in action)); calls.push("record"); return { status: after } as Awaited<ReturnType<typeof administerBooking>>; },
      sendConfirmation: async (bookingId, files) => { assert.equal(bookingId, "test-booking"); assert.deepEqual(files, attachments); calls.push("confirmation"); return { sent: true, to: "guest@example.com" }; },
      sendPaymentReceipt: async (bookingId, entry, session, files) => { assert.equal(bookingId, "test-booking"); assert.equal(entry.kind, kind); assert.equal(session, "session"); assert.deepEqual(files, attachments); calls.push("receipt"); return { sent: false, to: null, error: "Synthetic send failure" }; },
    });
    assert.deepEqual(calls, ["resolve", "record", before !== "CONFIRMED" && after === "CONFIRMED" ? "confirmation" : "receipt"]);
    assert.ok(result.email, "Every payment stage must report email delivery separately from recording");
  }
  let recorded = false;
  await assert.rejects(applyStaffBookingAction("test-booking", { type: "record-payment", payment, attachments: [ref] }, "session", {
    resolveAttachments: async () => { throw new Error("Invalid attachment"); },
    administerBooking: async () => { recorded = true; throw new Error("Must not record"); },
  }));
  assert.equal(recorded, false, "Invalid files must never record a payment");
  assert.equal(staffActionSchema.safeParse({ type: "message", message: "Test", subject: "Subject\r\nBcc: bad@example.com" }).success, false);
  assert.deepEqual(await resolveAttachments("test-booking", []), []);
  assert.deepEqual(readyAttachments([{ key: id, name: ref.name, size: 42, status: "ready", path: ref.path }]), [ref]);
  assert.deepEqual(readyAttachments([{ key: id, name: ref.name, size: 42, status: "failed" }]), []);
  const markup = renderToStaticMarkup(createElement(ReplyAttachments, { bookingId: "test-booking", items: [], onChange: () => {} }));
  assert.ok(markup.includes("Attach files"));
  assert.ok(markup.includes('type="file"'));
  assert.ok(markup.includes(`accept="${ATTACHMENT_ACCEPT}"`));
  const composerPicker = renderToStaticMarkup(createElement(ReplyAttachments, { draftId: draft, items: [], onChange: () => {} }));
  assert.ok(composerPicker.includes("Attach files"));
  const request = new NextRequest("https://www.hathorcruise.com/api/admin/bookings/test-booking/attachments", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "receipt.pdf", size: 42 }),
  });
  assert.equal((await POST(request, { params: Promise.resolve({ id: "test-booking" }) })).status, 401);
  console.log("PASS: attachment picker, supported types, file signatures, size limits, booking isolation, duplicate rejection, reply/invoice schemas, and upload authentication.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
