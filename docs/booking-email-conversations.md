# Booking email conversations

Guest email replies are received at `reply.hathorcruise.com`, saved against the
booking, and copied as plain text to `reservations@hathorcruise.com`. Booking emails
and dashboard replies are recorded in the same conversation. Existing emails sent
before this feature are not imported automatically.

## Activation

1. Keep the existing main-domain MX records and the verified receiving records on
   `reply.hathorcruise.com`.
2. Deploy the code and migration `20261002130000_booking_email_conversations`.
   The existing Vercel build command runs `prisma migrate deploy` before building.
   Leave `RESEND_INBOUND_ENABLED=false` for this first deployment.
3. In Resend, create an enabled webhook for only `email.received` at:
   `https://www.hathorcruise.com/api/webhooks/resend`. Use `www` because the live
   site's existing canonical-domain redirect otherwise returns 308 for this URL.
4. In Vercel production environment variables, set:
   - `RESEND_WEBHOOK_SECRET`: that webhook's signing secret, beginning `whsec_`.
   - `RESEND_INBOUND_ENABLED`: `true`.
   - `RESEND_FROM_EMAIL`: `Hathor Dahabiya <reservations@hathorcruise.com>`.
   - `RESEND_REPLY_TO`: `reservations@hathorcruise.com`.
   - `BOOKING_REPLY_NOTIFICATION_EMAIL`: `reservations@hathorcruise.com`.
5. Receiving API calls require a Full access Resend key. If the existing
   `RESEND_API_KEY` has Sending access only, create a Full access key and save it
   as `RESEND_RECEIVING_API_KEY` in Vercel. Keep both keys private.
6. Deploy these feature sources again to activate the new project variables,
   without a deployment-level `RESEND_INBOUND_ENABLED=false` override. Do not
   deploy an older Git checkout that lacks this feature. Until both the feature
   switch and signing secret are present, outgoing emails use the monitored
   mailbox as Reply-To.
7. Send a new booking email from the dashboard, inspect its Reply-To, and reply
   from the guest mailbox. Confirm the message is in Resend Receiving, in the
   booking's Conversation panel, and in the reservations mailbox. Attach a small
   PDF receipt and verify the authenticated dashboard attachment link.
8. Reply from the dashboard and verify the outgoing message and guest receipt.

## Operations

- Staff can use **Attach files** in both **Reply to guest** and **Confirm & send
  invoice**. Files are uploaded to the private `mail-attachments` storage bucket,
  validated before sending, and recorded on the outgoing conversation message.
  Supported files are PDF, JPG, PNG, WebP, GIF, TXT, CSV, DOCX, XLSX and PPTX;
  limits are 10 files, 10 MB per file, and 25 MB total. The server checks the
  booking folder, actual stored size, content type and file signature. These
  checks do not replace antivirus scanning or establish that a document is safe.
  Opening any conversation attachment requires dashboard authentication. The
  service-role storage key stays on the server; browser uploads use signed URLs.

- Every booking gets a persistent 192-bit random reply token. Tokens are not
  published on guest pages, included in booking lookup APIs, or written to logs.
- Sender addresses are not proof of identity. A reply from a different contact
  address is marked in the dashboard. Email never records payments or changes
  booking status automatically.
- Dashboard reads and attachment access require a valid admin session. Attachments
  remain in Resend and are opened with a freshly retrieved signed download link;
  their availability follows Resend's retention policy.
- Displayed email content is plain text, escaped by React. HTML-only messages are
  converted into text without rendering HTML, loading remote images, or executing
  email scripts.
- The webhook verifies the original request body using Resend's verifier and uses
  a unique Resend email ID to avoid duplicate conversation entries. Concurrent
  notification attempts use a database lease and a stable Resend idempotency key.
- An incoming message is saved before its notification is sent. Notification
  failures return 503 so Resend retries; an existing saved message is reused.
  Resend idempotency keys have a limited lifetime: a crash after notification send
  and retries outside that lifetime can produce a duplicate mailbox notification.
- Automatic replies and bulk mail are ignored to reduce email loops. Notifications
  contain the guest's message and a dashboard link; attachments are listed rather
  than copied into the notification email.
- These records hold guest correspondence. Apply the same database backup,
  encryption, access, and retention controls as booking contact information. The
  migration enables RLS without public policies on the two new tables.
- Requests are bounded: webhook metadata 64 KiB, fetched email response 2 MiB,
  stored text 64,000 characters, and at most 100 attachments. Processing failures
  remain visible in Resend's webhook attempts for manual investigation/replay.
- `/admin/inbox` lists received booking replies and general emails together, with
  sender/subject search, unread filtering, explicit read/unread controls, pagination,
  and authenticated attachment access. Booking replies remain in their original
  conversation; opening the booking lets staff reply with the existing tools.
- General emails are accepted at `reservations@reply.hathorcruise.com`. To include
  new mail sent to `reservations@hathorcruise.com`, add a Bluehost forwarding rule
  that sends a copy to this address while retaining the original mailbox delivery.
  Do not replace the main domain MX records. Forwarding is an external setup step,
  not automatically enabled by deploying the Inbox. Existing mail is not imported.
- General replies open the staff member's mail app and are not recorded as
  dashboard outbound messages. Old booking emails without token routing can appear
  as general emails if forwarded. Only new token-addressed booking emails link
  automatically to the relevant reservation. Sender addresses are not verified
  identities. Automatic/bulk messages are ignored, including dashboard-generated
  booking notification copies, which carry an Auto-Submitted header.
- The additive Inbox migration enables RLS and revokes public access on
  `InboxMessage`. Read/unread changes never alter reservation status or payments.
- To pause inbound routing, set `RESEND_INBOUND_ENABLED=false` and redeploy. Historical
  conversation records stay available, and new booking emails use the normal inbox.

Official references:
- https://resend.com/docs/receive-email
- https://resend.com/docs/webhooks/verify-webhooks-requests
- https://resend.com/docs/api-reference/emails/retrieve-received-email
