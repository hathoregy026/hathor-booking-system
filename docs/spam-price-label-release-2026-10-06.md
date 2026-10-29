# Spam folders and price units — phase one

Based on the exact currently deployed commit b8258cc00e288783a1f9eb676f81db442ad29fce, rather than the older shared local checkout.

Changes: room/suite/royal-suite price unit labels; contact and charter honeypot/no-send quarantine; conservative inbound message screening; Inbox/Spam/Security views, manual flag and restore; held-message notifications and attachments suppressed.

Preserved: six mailboxes and assignments, composer, bulk filing/deletion, inquiry history and branded receipts, booking replies, checkout calculations and card surcharge, invoice behavior, site/footer/hero editor, frozen scroll references, locked phone hero source. All pricing changes are display labels only. Existing messages remain saved and initially default to Inbox.

One additive migration (`20261006190000_mail_folders`) adds folder/reason metadata and indexes to InboxMessage and BookingMessage; it does not remove records or change booking/inventory data. Verified that no other migrations were pending.

CAPTCHA is deferred at the user's explicit request. No Turnstile scripts, tokens, CSP edits or key requirements are active in this phase. Prepared follow-up files are saved in the original checkout's ignored `_local/deferred-turnstile-current-live/` folder.

Validation: full TypeScript check; eight mail fixture suites covering screening, no-send quarantine, retry safety, folder filtering, restore, six mailboxes, bulk operations, composer, inquiry history/receipts, booking replies and HTML authorization. No live emails were sent by these tests. Changed spam code passes ESLint. The local production compilation/typecheck succeeds; full local prerender encountered database connection timeouts, so the unaliased Vercel production candidate is the final build gate.

Screening is conservative and recoverable. Security flags indicate suspicious patterns; they are not antivirus or proof of malware. Zoho's Spam folder is not synchronized with this application's folder selection. Future incoming mail is screened through the current Resend path; human review can correct a classification.
