# Dashboard mailboxes

Administrators currently access all six mailboxes. Handler names identify who
manages a mailbox; they are labels, not login permissions.

Priority order: CEO, ACC, SALES, RESERVATIONS, RECEPTION, INFO. Each mailbox has an
uppercase role, colour, handler name, unread count, and received/sent history.
Existing general mail and booking conversations belong to RESERVATIONS. Controls
stay fixed while the message list and reader scroll independently.

Website Contact forms are saved directly in INFO after the team notification is
accepted, without depending on Zoho forwarding. The sender is the visitor's email,
so Reply from dashboard sends the branded response from INFO to that visitor.
Contact receipt replies also go to INFO. Charter requests remain in RESERVATIONS.
Team notifications and existing booking emails keep their current destinations.
Saving uses the provider notification ID, so importing that same notification
again does not duplicate it or restore a dashboard-deleted message.
Migration 20261003211000_dashboard_form_inquiries distinguishes form submissions
from provider-received mail. Existing messages default to EMAIL unchanged;
provider-received mail still requires a delivery ID. Form entries require the
correct destination mailbox and stored HTML, rendered through the same protected
viewer with scripts and external images blocked by default.

## Zoho forwarding

The main MX records point to Zoho. Bluehost manages DNS, not incoming mail.
Do not change the main MX records.

In Zoho Mail > Settings > Mail Accounts > source mailbox > Forwards, add and verify
its matching destination. Leave deletion of the original copy disabled:

- ceo@hathorcruise.com → ceo@reply.hathorcruise.com
- acc@hathorcruise.com → acc@reply.hathorcruise.com
- sales@hathorcruise.com → sales@reply.hathorcruise.com
- reservations@hathorcruise.com → reservations@reply.hathorcruise.com
- reception@hathorcruise.com → reception@reply.hathorcruise.com
- info@hathorcruise.com → info@reply.hathorcruise.com

Check Resend Receiving for Zoho verification messages. General mailbox mail,
including automatic invoices, receipts, and verification messages, appears in
Emails without generating reply/forwarding loops. Existing booking-token
automatic-message safeguards remain unchanged. Forwarding starts after
verification; old Zoho history is not imported. Sent records messages composed
here, not messages sent via Zoho.

Do not forward all six groups into reservations. Routing uses the verified
Resend webhook's delivery recipients, not sender-controlled To headers. BCC and
preserved original To headers are supported. Delivery IDs are deduplicated per
mailbox: multiple destinations are represented separately without retry duplicates.

## Sending and deletion

New mail uses the chosen mailbox for From, Reply-To, and the branded footer.
From ALL MAILBOXES, composing defaults to RESERVATIONS. Replies use the opened
message's mailbox. Handler names appear in new signatures; stored content remains
immutable during send retries.

Delete from dashboard hides a message from Emails, counts, and notifications.
It never calls Zoho or Resend deletion APIs. Original mail and booking
conversation records remain intact. Persistent deletion markers prevent webhook
replays from restoring hidden messages. Pending sends cannot be hidden until
their delivery status is resolved.

Apply migration 20261003140000_dashboard_mailboxes before deploying. It adds a
constrained mailbox ID, mailbox/delivery unique key, and dashboard deletion
markers. It does not alter bookings, payments, availability, or DNS.

The first migration keeps the legacy delivery-ID unique index so the previous
webhook continues working during rollout. Once the six-mailbox deployment is
live, apply 20261003210000_finalize_dashboard_mailboxes to remove that redundant
index. This second rollout stage changes only uniqueness metadata, not messages.
Only then enable all six forwarding routes. Incoming duplicates are unique per
mailbox. Rollbacks must retain the six-mailbox webhook, not the older single-key
handler. scripts/finalize-dashboard-mailboxes.sql contains the equivalent manual
metadata operation for an environment that has already completed stage one.

Reference: https://www.zoho.com/mail/help/email-forwarding.html
