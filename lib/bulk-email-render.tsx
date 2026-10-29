import { render, toPlainText } from "@react-email/render";
import BulkMessageEmail from "@/emails/BulkMessage";
import { getDefaultEmailTemplate, mergeEmailTemplate, type EmailTemplateRecord } from "@/lib/email-templates";
import { pickSharedEmailBrandingFromRows } from "@/lib/email-branding-shared";
import { DEFAULT_EMAIL_FOOTER, EMAIL_FOOTER_KEY, parseEmailFooter } from "@/lib/email-footer";
import { bulkQuery as bookingQuery } from "@/lib/bulk-email-database";
import type { BulkEmailTemplate } from "@/lib/bulk-email-types";
import { BULK_JOURNAL_DEFAULTS, BULK_JOURNAL_IMAGE_PATHS, bulkJournalAssetUrl } from "@/lib/bulk-email-journal";

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
  // Retain the API contract while keeping this design independent of shared emails.
  void theme;
  return {
    eyebrow: "A MORE PERSONAL WAY TO SEE EGYPT", heading: "THE NILE,\nIN PRIVATE.", signature: "", showBanner: true,
    primaryColor: "#b69f64", backgroundColor: "#ece8df",
    footer: { tagline: "The Nile in private.", email: "reservations@hathorcruise.com", phone: "+20 127 049 6896", replyNote: "", copyright: "© {year} HATHOR DAHABIYA · EGYPT" },
    journal: structuredClone(BULK_JOURNAL_DEFAULTS),
  };
}
export async function renderBulkMessage(subject: string, message: string, theme: EmailTemplateRecord, unsubscribeUrl?: string, template?: BulkEmailTemplate) {
  const campaignTemplate = template ?? bulkTemplateDefaults(theme);
  const html = await render(<BulkMessageEmail subject={subject} message={message} template={campaignTemplate} signature={campaignTemplate.signature} unsubscribeUrl={unsubscribeUrl} eyebrow={campaignTemplate.eyebrow} logoUrl={theme.logoUrl} heroImageUrl={campaignTemplate.showBanner === false ? "" : campaignTemplate.heroImageUrl || (campaignTemplate.journal ? bulkJournalAssetUrl(BULK_JOURNAL_IMAGE_PATHS.hero) : theme.heroImageUrl)} primaryColor={campaignTemplate.primaryColor} backgroundColor={campaignTemplate.backgroundColor} footer={{ ...(theme.footer || DEFAULT_EMAIL_FOOTER), ...campaignTemplate.footer }} />);
  return { html, text: toPlainText(html) };
}
