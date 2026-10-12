# Bulk emails — preview and activation

Dashboard route: `/admin/bulk-emails`. This feature is additive. Existing booking
emails, inbox forwarding, CAPTCHA, prices and public pages are unchanged.

## Preview

With `next dev`, the default is simulated delivery and encrypted local history
in `.tmp-bulk-email/` (gitignored and excluded from Vercel uploads). Imported
files are read in memory and discarded; extracted recipients and campaign
history are encrypted using AES-256-GCM. Preview history persists across reloads.
Real delivery is impossible with the local history adapter. No production
database schema is modified to run this preview.

The recipient step supports file uploads, a single-address input, and pasting
multiple addresses together. Files have individual removal controls; removing
a file preserves addresses also entered manually or supplied by another file.
The template preview button is available at every step, using labeled sample
content before a message is written. Saved campaigns retain their original
template snapshot. All cards and inputs have small rounded corners on all sides.

`Edit email` opens the message editor directly, including before recipients are
added. The preview dialog has its own edit button. The email subject is the only
heading in the message; there is no separate title. Body, small line, banner image, accent/background colours and footer wording
are editable for this campaign only. Inputs are validated on the server and
text stays escaped. A banner upload and multiline signature belong to the individual
campaign; they never write shared CMS templates or footer settings. The locked Hathor
logo and unsubscribe link stay in place. Uploaded images are decoded, stripped of
metadata and stored as unique JPEGs in `email-images/bulk-campaigns/`; shared images
are never overwritten or deleted. Only those uploaded banner URLs are accepted.
Reset restores shared Hathor defaults. Changes require a fresh preview and
review confirmation. `Use as new email` copies a historical message/template
and recipient list into a new draft, preserving the original frozen campaign.

The message step renders the actual outgoing HTML beside the editor and updates
after a short typing pause. Desktop/phone controls change the preview width. Focusing
message, signature, banner or footer controls shows that part of the email. The frame
blocks scripts, forms and link navigation. Obsolete rendering requests are cancelled;
a failed update labels the previous preview as stale. Review and send require the
current draft, not an earlier preview. Uploading a campaign banner preserves unsaved
message and signature text. A new campaign starts from the shared defaults; resetting
this draft does not change previous campaigns or any booking/contact email.

Upload an `.xlsx`, UTF-8 `.csv`, or text-based `.pdf` of up to 2 MB. All workbook
sheets are inspected. PDFs are limited to 50 pages; images/scanned documents
require OCR outside this tool. `.xls` should be saved as `.xlsx`. ZIP size,
expanded bytes, embedded objects, encryption, parsing time and worker memory
are bounded. The tool extracts addresses only; no PDF scripts or spreadsheet
formulas are evaluated. Invalid addresses and duplicates are reported, and a
campaign is limited to 1–100 unique recipients. Address syntax validation
cannot prove that a mailbox exists.

Messages use the existing shared Hathor logo, banner, colors and footer from
the dashboard email-template settings. Text is escaped through React Email;
the browser preview is in a sandbox without scripts, forms or top-level navigation.

## Steps left for real sending (do these after preview review)

Preview requires no manual setup. The Hathor domain was confirmed verified in
Resend using a read-only request, and bulk-only sender overrides use the existing
reservations mailbox. `node scripts/prepare-bulk-email-activation.mjs` prepares an
idempotent, gitignored `.tmp-bulk-activation.env` with the server-only encryption
key and deployment settings; it never uploads settings, sends emails or changes
the database. These prepared settings and the SQL below are applied together
only when activation/deployment is approved. The private history table has now
been created with RLS and revoked browser-role grants verified. Existing mail
and booking tables were not altered. An isolated cloud preview uses encrypted
PostgreSQL history and permits real sending only to the approved test mailboxes.
The local dashboard remains in simulated preview mode.

1. Keep the existing Resend API key and verified sending domain. Pro is optional
   for testing: the Free plan has 3,000 emails/month and a 100-email daily limit,
   shared with other outgoing emails on that account. Simulated preview consumes
   no quota. Upgrade only when the actual sending volume requires it.
2. Apply `docs/bulk-email-setup.sql` to the target database. It creates one
   private schema/table for encrypted campaign history and unsubscribe records.
   The existing server database connection must be the schema owner or have
   explicitly granted access. Do not expose `bulk_mail` in Supabase's Data API.
3. Add server-only environment variables on the deployment target:
   - `BULK_EMAIL_STORAGE=postgres`
   - `BULK_EMAIL_ENCRYPTION_KEY=<64 hex characters from 32 cryptographically random bytes>`
   - `BULK_EMAIL_BASE_URL=https://www.hathorcruise.com`
   - `BULK_EMAIL_MODE=preview` during final staging tests, then `send` when approved.
   Keep the encryption key backed up in your secret manager. Losing/changing it
   makes history and existing unsubscribe links unreadable. Never use a
   `NEXT_PUBLIC_` prefix for it. Existing `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   and `RESEND_REPLY_TO` supply the sender and reply address. Optional server-only
   `BULK_EMAIL_FROM_EMAIL` and `BULK_EMAIL_REPLY_TO` override those for this feature
   alone, without changing booking or direct mail settings.
   The PDF parser requires Node 22.13 or later in the 22 release line, or Node
   24 and later. The local preview was verified on Node 26.
4. Test a real send to your own controlled addresses before a customer campaign.
   Verify branding, reply routing, unsubscribe and delivery in Resend. Keep
   unsubscribe query strings out of any external access logs. Development
   request logging already excludes this route.
5. Deploy only the reviewed feature diff when authorized. This task does not deploy.

## Delivery behavior

Each recipient receives a separate email, never a shared To/CC list. The API
creates immutable campaign content, records a claim before sending, and uses
one Resend batch (maximum 100 emails) with a stable idempotency key. Duplicate
clicks and concurrent requests share the same campaign. Retry safely reuses
the exact payload and provider key, including after an unknown network result.
Automatic send retries stop after 23 hours, before Resend's 24-hour idempotency
retention expires; an operator must reconcile older uncertain results in
Resend before proceeding. Confirmed campaigns are never sent again.

The page remains open while the batch is submitted. Reloaded/queued campaigns
can be resumed from Email history. History separates real campaigns and simulated
previews, shows each recipient's result, and reopens the saved message/template.
A queued campaign can be cancelled before
its first attempt. Once handed to Resend, emails cannot be recalled.

“Accepted by Resend” is not “delivered to inbox.” Per-recipient provider IDs are
stored; actual deliveries/bounces are checked in Resend. A failed request and an
unknown result have different labels. The tool never asserts that an unknown
result means zero emails were sent. Every campaign includes an unsubscribe link:
GET opens a confirmation page, POST records the opt-out, and later campaigns
skip suppressed addresses. Booking and direct emails are not suppressed.
Both List-Unsubscribe headers are supplied. Mail-provider one-click POSTs require
the valid encrypted recipient capability and exact RFC 8058 form value, while
normal browser confirmation retains same-origin checks. GET never opts anyone out.

## Security and boundaries

All dashboard endpoints require the existing valid admin session. Every state
change and import requires a same-origin request, bounded request body and
server schema validation. Rate limits use the existing durable rate-limit table
on deployed instances; a local limiter is used only for simulated development.
Campaign history is private, encrypted at rest and never logged. PostgreSQL
writes use parameterized statements and optimistic version checks across
instances. The private schema has RLS enabled and no frontend-role grants.

The preview-only filesystem adapter uses exclusive locks and atomic file writes.
It must not be used on Vercel or for real sending. If a local dev process is
killed mid-write and leaves a `.lock`, stop all preview processes before removing
that stale lock. Do not remove the local `key` file while retaining history.

Dependencies are pinned in package.json and the lockfile. The import worker and
parser dependencies are traced into the deployment output by next.config.ts.
No cron, scheduler, automatic customer send or public upload endpoint is added.

## Verification

`node scripts/run-bulk-email-tests.mjs` checks real file imports, malformed files,
ZIP expansion limits, privacy, encryption, unsubscribe suppression, concurrent
preview sends, stable provider requests, interrupted results, authentication,
request origin checks and body limits. The provider is mocked: no live email is sent.

`node scripts/run-bulk-email-browser-tests.mjs` checks the actual local dashboard
at 1440px and 390px, including a 100-recipient simulation, branded images, escaped
text, history after reload, overflow and browser errors. It also tests the real
local unsubscribe confirmation page and skipped-recipient behavior. All pass.

`npx tsc --project tsconfig.bulk-emails.json --noEmit` and scoped ESLint pass.
The production dependency audit reported zero vulnerabilities. Existing mail
protection regression checks also pass. The full repository typecheck now passes
after repairing relative imports and the context type in the existing attachment
QA file. The complete local and cloud production builds now pass. Large saved
CMS results use a bounded, authenticated HTTPS fallback if the PostgreSQL path
stalls; blog reads prefer their existing HTTPS path for Supabase poolers too.
The generated sitemap retains all 44 published blog entries. The fallback checks
project identity, key allowlists, Unicode/text preservation and response limits.
No worker-count reduction or build-time content defaults were used.

The cloud preview snapshot overrides the build command to `npm run build` and
excludes cron jobs, so it cannot automatically apply unrelated Prisma migrations
to the shared database. An initial build attempted an already-present mail
migration and failed before its first schema change. Its failed migration record
was marked rolled back; there are no unresolved failed migrations. Production
aliases still point to the existing live deployment.

Real delivery was authorized and tested on 2026-10-11: Resend confirmed both
messages delivered. The authenticated preview API stored encrypted history and
provider IDs, rejected an unapproved recipient, and returned the same IDs on a
repeat send request without another delivery. A synthetic cloud unsubscribe test
verified scanner-safe GET, provider one-click POST without browser credentials,
and encrypted suppression; its record was removed afterward. The actual test
recipients were not opted out. Vercel protects the cloud preview with sign-in;
customer-facing unsubscribe links use the public site after production release.
Local `/admin/bulk-emails` remains simulated. No production release was made.

Production release preparation completed on 2026-10-11. Six production-only
bulk settings are saved in Vercel, including the established encryption key
as a Sensitive variable; delivery remains in simulation mode. The isolated
`.tmp-bulk-release-source/` copy starts from the verified current live commit
and retains its canonical migration history, existing dashboard and booking
features. All 31 canonical migrations are already applied; the obsolete local
mail-screening migration is excluded. An older, already-existing inventory
migration checksum warning is preserved and documented rather than rewriting
history. The release copy's full build, typecheck, bulk tests and CMS fallback
tests pass; its sitemap retains all 44 blog entries. Activation and deployment
await separate user authorization. See
`output/bulk-email-release-preparation-2026-10-11.md` for the exact release scope.
