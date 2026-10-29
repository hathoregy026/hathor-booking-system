/**
 * The footer every Hathor email ends with — the dark band under the message.
 * Its wording is edited once in Dashboard → Email Templates and applies to all
 * emails; the HATHOR wordmark, the layout and the colours are fixed in
 * `emails/components/EmailLayout.tsx`. An emptied field hides its line.
 */
export const EMAIL_FOOTER_KEY = "email-footer";

export type EmailFooterSettings = {
  /** Gold italic line under the wordmark. */
  tagline: string;
  /** Contact address, shown underlined (a mail link when it is an address). */
  email: string;
  phone: string;
  /** Guest emails that invite a reply (invoice, confirmation, team replies…). */
  replyNote: string;
  /** Small gold capitals at the bottom; {year} becomes the current year. */
  copyright: string;
  /** First line of the team's own alerts (new bookings, contact messages). */
  adminTitle: string;
};

export const DEFAULT_EMAIL_FOOTER: EmailFooterSettings = {
  tagline: "Luxury cruises on the Nile",
  email: "reservations@hathorcruise.com",
  phone: "+20 127 049 6896",
  replyNote: "Questions? Reply directly to this email — we are here to help.",
  copyright: "© {year} Hathor Cruise ®",
  adminTitle: "Hathor Dahabiya Admin",
};

export const EMAIL_FOOTER_LIMITS: Record<keyof EmailFooterSettings, number> = {
  tagline: 120,
  email: 120,
  phone: 60,
  replyNote: 300,
  copyright: 120,
  adminTitle: 80,
};

const FIELDS = Object.keys(DEFAULT_EMAIL_FOOTER) as (keyof EmailFooterSettings)[];

/**
 * Saved (or draft) footer wording, field by field: a missing field keeps its
 * default, an empty one stays empty so the line is left out.
 */
export function parseEmailFooter(raw: unknown): EmailFooterSettings {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const footer = { ...DEFAULT_EMAIL_FOOTER };
  for (const field of FIELDS) {
    const value = source[field];
    if (typeof value === "string") {
      footer[field] = value.replace(/\s+/g, " ").trim().slice(0, EMAIL_FOOTER_LIMITS[field]);
    }
  }
  return footer;
}

/** The first field longer than its limit, for the save route's error message. */
export function emailFooterTooLong(raw: unknown): keyof EmailFooterSettings | null {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return FIELDS.find((field) => {
    const value = source[field];
    return typeof value === "string" && value.trim().length > EMAIL_FOOTER_LIMITS[field];
  }) ?? null;
}

export function resolveEmailFooterCopyright(copyright: string, now = new Date()): string {
  return copyright.replace(/\{year\}/gi, String(now.getFullYear()));
}

/** A mail link only for something that is an email address. */
export function emailFooterMailto(email: string): string | null {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email) ? `mailto:${email}` : null;
}
