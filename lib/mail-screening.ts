import { z } from "zod";
import { load } from "cheerio";
import type { MailScreening } from "@/lib/mail-folders";
export type { MailFolder, MailScreening } from "@/lib/mail-folders";
export { MAIL_REASON_LABELS } from "@/lib/mail-folders";

export const mailFolderSchema = z.enum(["inbox", "spam", "security"]);
export const mailAuthenticationSchema = z.object({
  spf: z.enum(["pass", "fail", "gray", "processing_failed", "unknown"]),
  dkim: z.enum(["pass", "fail", "gray", "processing_failed", "unknown"]),
  dmarc: z.enum(["pass", "fail", "gray", "processing_failed", "unknown"]),
}).nullable().optional();

// Require both a random-looking name and message. A name, language, short
// message or sender mismatch alone must never decide whether an inquiry is spam.
function randomWord(value: string): boolean {
  const word = value.trim();
  return /^[A-Za-z]{14,80}$/.test(word) && /[a-z]/.test(word) && /[A-Z]/.test(word)
    && (word.match(/[a-z][A-Z]|[A-Z][a-z]/g)?.length ?? 0) >= 5;
}

export function screenInquiry(input: { name: string; message: string; website?: string }): MailScreening {
  if (input.website) return { folder: "spam", reasons: ["honeypot_filled"] };
  const content = screenMail({ subject: "", text: input.message });
  if (content.folder !== "inbox") return content;
  return randomWord(input.name) && randomWord(input.message)
    ? { folder: "spam", reasons: ["automated_gibberish"] }
    : { folder: "inbox", reasons: [] };
}

export function screenMail(input: {
  subject: string; text: string; html?: string | null;
  authentication?: z.infer<typeof mailAuthenticationSchema>;
  attachments?: Array<{ filename: string | null; content_type: string }>;
}): MailScreening {
  const reasons: string[] = [];
  const content = `${input.subject}\n${input.text}`.slice(0, 66000);
  const dangerous = /\.(?:exe|com|scr|bat|cmd|ps1|vbs|js|jse|msi|dll|hta|jar|lnk|html?|svg|docm|xlsm|pptm)(?:[ .]*)$/i;
  if (input.attachments?.some(file => dangerous.test(file.filename ?? "")
    || /[\u202a-\u202e\u2066-\u2069]/.test(file.filename ?? "")
    || /^(?:application\/(?:x-msdownload|x-dosexec|javascript)|text\/(?:javascript|html)|image\/svg\+xml)$/i.test(file.content_type))) reasons.push("dangerous_attachment");
  // Use Resend's server-computed authentication object, never attacker-supplied
  // Authentication-Results / X-Spam headers. Forwarding can break SPF alone.
  if (input.authentication?.dmarc === "fail") reasons.push("sender_authentication_failed");
  if (/\b(?:send|share|provide|enter|confirm|verify)\b[^\n.!?]{0,70}\b(?:password|one[- ]time (?:code|password)|otp|cvv|cvc)\b/i.test(content)) reasons.push("credential_request");
  const links: string[] = Array.from(content.match(/(?:https?:\/\/|javascript:|data:text\/html)[^\s<>"']{1,2048}/gi) ?? []);
  if (input.html) {
    // Inspect link targets without rendering, loading images or fetching URLs.
    const document = load(input.html.slice(0, 512000));
    document("a[href]").slice(0, 200).each((_, element) => {
      const href = document(element).attr("href");
      if (href && /^(?:https?:|javascript:|data:)/i.test(href)) links.push(href.slice(0, 2048));
    });
  }
  if (links.some(link => {
    try { const url = new URL(link); return !["http:", "https:"].includes(url.protocol) || Boolean(url.username || url.password); }
    catch { return false; }
  })) reasons.push("suspicious_link");
  if (reasons.length) return { folder: "security", reasons };
  // Detect the site's own contact alert after it has been forwarded, without
  // trusting From or blocking every message sent by the Hathor mail service.
  const name = content.match(/(?:^|\n)Name:\s*([^\n]+)/i)?.[1];
  const message = content.match(/(?:^|\n)Message:\s*([^\n]+)/i)?.[1];
  if (name && message && randomWord(name) && randomWord(message)) return { folder: "spam", reasons: ["automated_gibberish"] };
  if (links.length >= 4 && /\b(?:seo services|backlinks|buy followers|guaranteed rankings)\b/i.test(content)) return { folder: "spam", reasons: ["repeated_promotion"] };
  return { folder: "inbox", reasons: [] };
}
