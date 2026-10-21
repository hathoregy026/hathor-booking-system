# Received attachment downloads and dashboard removal

Received attachments in the Inbox and booking Conversation now use **Download &
remove**. The email record, subject, body, read status, booking and other files are
preserved. Sent attachments retain their existing behavior. This feature never
connects to Zoho or changes mailbox forwarding or MX records.

## Save and removal behavior

- Supporting browsers show a save dialog from the original employee click. The
  server checks and rebuilds the file before supplying it. Dashboard removal is
  requested only after the local file write and close complete.
- Other browsers start an ordinary download and show **I saved it — remove from
  dashboard**. Employees must verify that the file was saved before confirming.
  **Keep attachment in dashboard** cancels this removal step.
- Cancellation, a failed download, invalid response, or a failed disk write keeps
  the dashboard reference. No server can independently prove a hostile client's
  disk state; the audit records the client's confirmation method.
- If removal fails or its response is lost, **Retry dashboard removal** uses the
  same receipt without another download. The database operation is idempotent.
- Removal changes only the incoming message's attachment JSON. No received file
  payload is stored in the application database or copied into application object
  storage by this feature. The email remains, and its unique Resend ID prevents
  duplicate webhook deliveries from importing the attachment again.
- Formatted email views resolve CID images only for attachments still present in
  that message's database record. Open formatted views in the current component
  are reset after a removal. Copies already downloaded or rendered in other tabs
  cannot be recalled.

## Resend retention

The UI explicitly says that Resend's copy follows its retention policy. The
implementation never claims to delete it and sends no deletion request to Resend.
At implementation time, the published receiving API supports attachment retrieval
and listing, with no individual attachment deletion endpoint. Resend's policy
directs requests for early message removal to its support team. Zoho's original
email and attachment are unaffected; their continued presence depends on the
existing mailbox delivery/forwarding configuration.

References:

- [Resend receiving API specification](https://github.com/resend/resend-openapi/blob/main/resend.yaml)
- [Resend data retention](https://resend.com/security/gdpr)
- [Browser save dialog support](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker)

## Security boundaries

- Existing quarantine remains in force: received PDFs, Office documents,
  spreadsheets, archives and executables are not released. They need an approved
  private malware-scanning/sanitization pipeline before enabling more types.
- Permitted raster images are decoded with bounded dimensions and rebuilt as PNG;
  permitted text is checked as UTF-8. Files must fit the existing 4 MiB response
  limit. Server fetches remain restricted to the Resend inbound HTTPS CDN, without
  redirects, and responses force downloads with no-store, CSP and nosniff headers.
- The isolated release uses the live database-backed employee sessions and
  requires `inbox.manage` plus access to the specific mailbox for preparation and
  removal. Read-only employees can still download permitted files through the
  checked read endpoint; their downloads keep the dashboard copy. Matching Origin,
  bounded JSON, schema validation and throttling protect mutations. Mailbox
  placement, deleted-email records and inbound direction are checked both when
  preparing a download and when removing it. Existing login, MFA and permissions
  are preserved.
- A random receipt is issued only after successful validation/rebuilding and a
  second database check that the attachment is still present in the Inbox.
  Receipts are bound to a hash of the session identifier, message source, message
  ID and attachment ID. Unused receipts expire after one hour.
- Removal and its minimal audit update are one SQL statement, using row locks
  and the current attachment array to preserve concurrent changes. Ordinary GET
  and HEAD requests never remove files. Moving an email into quarantine prevents
  an outstanding, unused receipt from removing its files.
- `MailAttachmentDownload` has RLS enabled and no grants to PUBLIC, `anon` or
  `authenticated`. It stores opaque IDs, a session hash, timestamps and the save
  method; no file contents, filenames, email addresses, URLs or session cookies.
  Successful preparations clean at most 100 expired unused receipts or completed
  audit records older than 90 days. Cleanup is opportunistic, not a strict purge
  deadline. Database backups have their own retention.

## Rollout and validation

`20261021120000_attachment_download_removal` was applied to the verified Hathor
Supabase project on 21 October 2026 and registered in both migration histories.
Its SHA-256 is `f9f4cc995e1719e4fcaac4eb4de332b4f1b10da06ca5d00f797376e9cb039dca`.
The table has RLS enabled and no public, anon or authenticated access; verification
found zero receipts. No customer mail, files or existing migration entries were
changed. The security advisor's informational "RLS enabled, no policies" notice
is intentional for this server-only table; adding a public policy would weaken it.
See [Supabase's explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The main checkout contains unrelated unreleased changes. Deploy only the isolated
source `.tmp-attachment-release-source`, based on the current live commit
`7920267becb0db9e8f7f5c3d306b59532d8429bd`. It preserves the live MFA, roles,
mailboxes, composer, public pages, assets and migration history. The preparation
and guarded overlay scripts record this adaptation; the old bulk-mail release
copies and this dirty main checkout are not attachment release sources.

Before deployment, run `node scripts/check-attachment-release-scope.mjs` to recheck
the production-domain baseline. The ready-source seal records every source hash.
A new live deployment or any source change requires review and verification
before release. Production deployment has not been performed. No new environment
variables or Zoho configuration are required for this feature.

Checks:

```sh
node scripts/run-attachment-transfer-tests.mjs
node scripts/run-attachment-transfer-tests.mjs --sql
node scripts/run-attachment-transfer-tests.mjs --browser
node scripts/run-attachment-transfer-tests.mjs --concurrency
node scripts/run-attachment-transfer-tests.mjs --release-permissions
node scripts/run-mail-protection-tests.mjs
```

The default SQL test uses the PostgreSQL WASM engine already bundled in the locked
Prisma toolchain. It tests synthetic temporary tables, receipt expiry and binding,
preserved emails/sibling files, replay safety, and denied public access. It does
not load database credentials. `--sql --configured-database` is an explicit opt-in
for the same temporary-table tests using the configured database and verified TLS;
the configured connection did not complete during this work.

Browser tests use intercepted synthetic data in headless Edge at 390, 768 and
1440 pixels. They cover both entry points, save-before-removal ordering, fallback
confirmation, reload persistence, cancelled/failed saves, download failures and a
lost removal response. Save picker writes are mocked; the fallback browser
download is real synthetic content. No live email service is contacted.

The concurrency check starts an isolated, password-protected PostgreSQL 18 cluster
on a random loopback port, holds the email row until two independent connections
are waiting, then verifies simultaneous removal of different files and retries of
the same receipt. It stops the generated cluster and removes its test directory.
Set `POSTGRES_TEST_BIN` if the PostgreSQL binaries are installed elsewhere.

All checks above and lint of the touched files passed. The older main checkout's
missing `adminApiGuard` export was fixed using its existing session assertion;
the live release retains its newer permission-aware guard unchanged. Typecheck
passes in both checkouts.

The complete production build and an actual `next start` preview passed against a
disposable PostgreSQL 18 cluster with strict certificate verification and TLS 1.2+.
The test used the real MFA-session verification and role/mailbox guards with
synthetic sessions; only Resend's metadata/file responses were intercepted. It
verified read-only and wrong-mailbox denial, CSRF rejection, a real browser
download, no removal before confirmation, atomic removal, retained email body,
reload persistence and phone containment. The generated database and local
services were stopped and removed afterward. No customer data was used and no
real Resend or Zoho mutation was made. Evidence is in
`output/attachment-release-preview/`.

The native OS save picker was mocked in the earlier browser tests. After release,
the operator should save one harmless test attachment using their normal employee
browser and verify the local file. No manual infrastructure setup is needed;
employees who should remove attachments need Emails edit permission and mailbox
access through the existing People controls. PDFs and Office files remain
quarantined pending a separate scanning service.
