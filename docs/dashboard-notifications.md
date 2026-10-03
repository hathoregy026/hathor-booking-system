# Dashboard booking and email alerts

- The authenticated header bell checks on entry, every 15 seconds while the tab
  is visible, every 60 seconds while hidden, and when focus/connectivity returns.
  This is automatic polling, not guaranteed instant push delivery. Closed or
  browser-suspended dashboards do not receive background push notifications.
- The badge combines unseen submitted booking requests and unread incoming
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
- Opening the bell never changes email read status or clears booking alerts.
  Clear booking alerts acknowledges only the booking timestamp in the displayed
  snapshot, never the current clock time. Newer arrivals remain unseen. This uses
  the existing shared staff-profile watermark; email read status remains shared.
- Notification links open the booking or the particular received email. General
  mail still requires the existing Bluehost copy-forwarding setup to reach the
  dashboard. Notification polling cannot retrieve mail not delivered to Resend.
- The API verifies the admin session, enforces durable throttling, returns
  private/no-store responses, and restricts acknowledgments to validated
  same-origin JSON. Counts and rows come from one parameterized SQL snapshot.
  No booking lifecycle, availability, price, email sending, or schema changes.
