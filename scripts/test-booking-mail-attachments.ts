import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReplyAttachments, readyAttachments } from "../components/admin/bookings/ReplyAttachments";
import { MAX_ATTACHMENT_BYTES, ATTACHMENT_ACCEPT, attachmentContentType, attachmentProblem, attachmentSignatureMatches, cleanAttachmentName } from "../lib/mail-attachment-rules";
import { attachmentStorageId, mailAttachmentRefsSchema, resolveAttachments, validateAttachmentMetadata } from "../lib/mail-attachments";
import { staffActionSchema } from "../lib/booking-admin-api";
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
  assert.equal(staffActionSchema.safeParse({ type: "message", message: "Test", subject: "Subject\r\nBcc: bad@example.com" }).success, false);
  assert.deepEqual(await resolveAttachments("test-booking", []), []);
  assert.deepEqual(readyAttachments([{ key: id, name: ref.name, size: 42, status: "ready", path: ref.path }]), [ref]);
  assert.deepEqual(readyAttachments([{ key: id, name: ref.name, size: 42, status: "failed" }]), []);
  const markup = renderToStaticMarkup(createElement(ReplyAttachments, { bookingId: "test-booking", items: [], onChange: () => {} }));
  assert.ok(markup.includes("Attach files"));
  assert.ok(markup.includes('type="file"'));
  assert.ok(markup.includes(`accept="${ATTACHMENT_ACCEPT}"`));
  const request = new NextRequest("https://www.hathorcruise.com/api/admin/bookings/test-booking/attachments", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "receipt.pdf", size: 42 }),
  });
  assert.equal((await POST(request, { params: Promise.resolve({ id: "test-booking" }) })).status, 401);
  console.log("PASS: attachment picker, supported types, file signatures, size limits, booking isolation, duplicate rejection, reply/invoice schemas, and upload authentication.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
