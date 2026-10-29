import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { createAttachmentUpload, privateEmailAttachmentDownloadUrl, privateEmailAttachmentScope, resolveAttachments, resolvePrivateEmailAttachments, MAIL_ATTACHMENT_BUCKET } from "../lib/mail-attachments";
import { createSupabaseStorageAdminClient } from "../lib/supabase-server";

async function main() {
  config({ path: ".env.local", quiet: true });
  config({ path: ".env", quiet: true });
  const bookingId = `qa-mail-${randomUUID()}`;
  const storage = createSupabaseStorageAdminClient().storage;
  const paths: string[] = [];
  try {
    for (const valid of [true, false]) {
      const body = new TextEncoder().encode(valid ? "%PDF-1.4\n% Synthetic attachment upload test\n%%EOF\n" : "<html>This is not a PDF</html>");
      const ticket = await createAttachmentUpload(bookingId, { name: valid ? "qa-receipt.pdf" : "qa-invalid.pdf", size: body.byteLength });
      paths.push(ticket.path);
      const uploaded = await fetch(ticket.signedUrl, {
        method: "PUT", headers: { "Content-Type": ticket.contentType, "x-upsert": "false" }, body,
        signal: AbortSignal.timeout(20000),
      });
      assert.equal(uploaded.ok, true, `Signed upload failed (${uploaded.status})`);
      const ref = { path: ticket.path, name: ticket.name };
      if (valid) {
        const attachments = await resolveAttachments(bookingId, [ref]);
        assert.equal(attachments.length, 1);
        assert.equal(attachments[0]!.filename, "qa-receipt.pdf");
        assert.equal(attachments[0]!.storagePath, ticket.path);
        assert.equal(attachments[0]!.contentType, "application/pdf");
        const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${MAIL_ATTACHMENT_BUCKET}/${ticket.path}`;
        const publicResponse = await fetch(publicUrl, { signal: AbortSignal.timeout(15000) });
        assert.equal(publicResponse.ok, false, "Attachment must not be publicly accessible");
      } else {
        await assert.rejects(resolveAttachments(bookingId, [ref]), /content does not match/);
      }
    }
    const scope = privateEmailAttachmentScope("synthetic-storage-session", randomUUID());
    const body = new TextEncoder().encode("%PDF-1.4\n% Synthetic private email attachment\n%%EOF\n");
    const ticket = await createAttachmentUpload(scope, { name: "qa-private-receipt.pdf", size: body.length });
    paths.push(ticket.path);
    const uploaded = await fetch(ticket.signedUrl, { method: "PUT", headers: { "Content-Type": ticket.contentType, "x-upsert": "false" }, body, signal: AbortSignal.timeout(20000) });
    assert.equal(uploaded.ok, true);
    const refs = [{ path: ticket.path, name: ticket.name }];
    const first = await resolvePrivateEmailAttachments(scope, refs);
    const second = await resolvePrivateEmailAttachments(scope, refs);
    assert.equal(first[0].content, Buffer.from(body).toString("base64"));
    assert.equal(first[0].content, second[0].content, "Provider attachment content stays stable across retries");
    assert.equal(first[0].contentHash, second[0].contentHash);
    await assert.rejects(resolvePrivateEmailAttachments(privateEmailAttachmentScope("another-session", randomUUID()), refs));
    assert.ok((await privateEmailAttachmentDownloadUrl(ticket.path)).startsWith(process.env.SUPABASE_URL!));
    await assert.rejects(privateEmailAttachmentDownloadUrl(paths[0]));
    console.log("PASS: real private storage, signed upload, stored metadata, verified download links, public-access rejection, and disguised-file rejection. No emails sent.");
  } finally {
    if (paths.length) {
      const result = await storage.from(MAIL_ATTACHMENT_BUCKET).remove(paths);
      if (result.error) throw new Error("Synthetic attachment cleanup failed");
    }
  }
}

main().catch(() => { console.error("Attachment storage integration failed; no credentials or signed URLs logged."); process.exitCode = 1; });
