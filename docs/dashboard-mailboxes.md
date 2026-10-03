# Dashboard mailboxes

Administrators currently access all six mailboxes. Handler names identify who
manages a mailbox; they are labels, not login permissions.

Priority order: CEO, ACC, SALES, RESERVATIONS, RECEPTION, INFO. Each mailbox has an
uppercase role, colour, handler name, unread count, and received/sent history.
Existing general mail and booking conversations belong to RESERVATIONS. Controls
stay fixed while the message list and reader scroll independently.

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

Check Resend Receiving for Zoho verification messages. Automatic emails do not
appear in dashboard Emails. Forwarding starts after verification; old Zoho history
is not imported. Sent records messages composed here, not messages sent via Zoho.

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

The migration keeps the legacy delivery-ID unique index so the current webhook
continues working during rollout. After the new deployment is ready, execute
scripts/finalize-dashboard-mailboxes.sql to remove that redundant index. Only then
enable all six forwarding routes. Incoming duplicates are now unique per mailbox.

Reference: https://www.zoho.com/mail/help/email-forwarding.html
