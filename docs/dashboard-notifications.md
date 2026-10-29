# Dashboard booking and email alerts

- Separate booking-ticket and email-envelope icons show independent badges and
  panels. Each panel lists up to ten recent items of its own kind, so an email
  burst does not hide booking alerts. Both icons share one polling loop.
- The authenticated header checks on entry, every 15 seconds while the tab
  is visible, every 60 seconds while hidden, and when focus/connectivity returns.
  This is automatic polling, not guaranteed instant push delivery. Closed or
  browser-suspended dashboards do not receive background push notifications.
- The badges count unseen submitted booking requests and unacknowledged unread incoming
  general emails/booking replies. Checkout holds and outbound email are excluded.
  Failed checks preserve previous results and show connection status; an expired
  session stops polling. Requests do not overlap and rate-limit backoff is honoured.
- Newly observed arrivals trigger the existing dashboard toast and refresh the
  relevant booking/dashboard/email lists. Initial history does not generate a
  burst of alerts. A bounded in-memory activity tracker avoids repeating alerts
  after read/unread changes. At most 50 latest arrivals per kind are tracked per
  snapshot; large bursts still produce an alert and accurate total badge counts.
- Background list updates preserve email drafts, booking selections, and open
  booking action dialogs. Refreshes deferred during booking editing run afterward.
- Opening an icon only previews its alerts. Clicking an individual notification
  persists that alert's identity in `DashboardNotificationSeen` and opens its
  booking or email. Only that alert disappears, including after a reload; other
  alerts remain. Dashboard records, mailbox routing and email read status stay
  unchanged. If acknowledgment fails, the record still opens and the alert remains
  available for retry. The new table has RLS and no public policies.
- Acknowledgment is identity-based, not a blanket timestamp. Late-forwarded email
  still creates an alert even if its original date precedes earlier acknowledgments.
  Marking a dismissed email unread does not recreate its old alert. Shared staff
  acknowledgment/read state is retained. The previous watermark endpoint remains
  compatible with older tabs; the current interface does not clear whole categories.
- Notification links open the booking or the particular received email. General
  mail still requires the existing Zoho copy-forwarding setup to reach the
  dashboard. Notification polling cannot retrieve mail not delivered to Resend.
- The API verifies the admin session, enforces durable throttling, returns
  private/no-store responses, and restricts acknowledgments to validated
  same-origin JSON. Counts and rows come from one parameterized SQL snapshot.
  No booking lifecycle, availability, price, or email-sending changes.
