// Shared display metadata. Keep mail parsing libraries out of the browser.
export type MailFolder = "inbox" | "spam" | "security";
export type MailScreening = { folder: MailFolder; reasons: string[] };

export const MAIL_REASON_LABELS: Record<string, string> = {
  dangerous_attachment: "An attachment has an executable, active-content or misleading file type.",
  sender_authentication_failed: "The receiving server could not authenticate the sender's domain (DMARC failed).",
  credential_request: "The message asks for a password, login code or card security code.",
  suspicious_link: "The message contains a link with concealed credentials or an unsafe scheme.",
  automated_gibberish: "The inquiry contains the random name and message pattern used by form bots.",
  repeated_promotion: "The message contains several promotional links and bulk marketing language.",
  honeypot_filled: "The hidden form field was filled in.",
  manual_spam: "Marked as spam by your team.",
  manual_security: "Flagged as a security threat by your team.",
  manual_restore: "Restored to Inbox by your team.",
};
