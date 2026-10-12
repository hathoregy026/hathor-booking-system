import { render, toPlainText } from "@react-email/render";
import BulkMessageEmail from "@/emails/BulkMessage";
import { getDefaultEmailTemplate, mergeEmailTemplate, type EmailTemplateRecord } from "@/lib/email-templates";
import { pickSharedEmailBrandingFromRows } from "@/lib/email-branding-shared";
import { DEFAULT_EMAIL_FOOTER, EMAIL_FOOTER_KEY, parseEmailFooter } from "@/lib/email-footer";
import { bulkQuery as bookingQuery } from "@/lib/bulk-email-database";
import type { BulkEmailTemplate } from "@/lib/bulk-email-types";

const cache = globalThis as unknown as { bulkBrandingCache?: { value: EmailTemplateRecord; expires: number; pending?: Promise<EmailTemplateRecord> } };
export async function bulkBranding(): Promise<EmailTemplateRecord> {
  const existing = cache.bulkBrandingCache;
  if (existing && existing.expires > Date.now()) return existing.value;
  const entry = existing || { value: { ...getDefaultEmailTemplate("BookingMessage"), footer: DEFAULT_EMAIL_FOOTER }, expires: 0 };
  cache.bulkBrandingCache = entry;
  if (!entry.pending) {
    entry.pending = (async () => {
      const [rows, footerRows] = await Promise.all([
        bookingQuery<EmailTemplateRecord>('SELECT * FROM "EmailTemplate"'),
        bookingQuery<{ value: string }>('SELECT value FROM "SiteSetting" WHERE key = $1', [EMAIL_FOOTER_KEY]),
      ]);
      const row = rows.find(value => value.name === "BookingMessage");
      const template = mergeEmailTemplate("BookingMessage", row, pickSharedEmailBrandingFromRows(rows));
      entry.value = { ...template, footer: footerRows[0] ? parseEmailFooter(JSON.parse(footerRows[0].value)) : DEFAULT_EMAIL_FOOTER };
      return entry.value;
    })().catch(() => entry.value).finally(() => { entry.expires = Date.now() + 60000; entry.pending = undefined; });
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([entry.pending, new Promise<EmailTemplateRecord>(resolve => { timer = setTimeout(() => { entry.expires = Date.now() + 15000; resolve(entry.value); }, 6000); })]);
  } finally { if (timer) clearTimeout(timer); }
}
export function bulkTemplateDefaults(theme: EmailTemplateRecord): BulkEmailTemplate {
  const { tagline, email, phone, replyNote, copyright } = theme.footer || DEFAULT_EMAIL_FOOTER;
  return { eyebrow: "A note from Hathor", heading: "", signature: "", showBanner: true, primaryColor: theme.primaryColor, backgroundColor: theme.backgroundColor, footer: { tagline, email, phone, replyNote, copyright } };
}
export async function renderBulkMessage(subject: string, message: string, theme: EmailTemplateRecord, unsubscribeUrl?: string, template?: BulkEmailTemplate) {
  const html = await render(<BulkMessageEmail subject={subject} message={message} signature={template?.signature} unsubscribeUrl={unsubscribeUrl} eyebrow={template?.eyebrow} logoUrl={theme.logoUrl} heroImageUrl={template?.showBanner === false ? "" : template?.heroImageUrl || theme.heroImageUrl} primaryColor={template?.primaryColor || theme.primaryColor} backgroundColor={template?.backgroundColor || theme.backgroundColor} footer={template ? { ...(theme.footer || DEFAULT_EMAIL_FOOTER), ...template.footer } : theme.footer} />);
  return { html, text: toPlainText(html) };
}
