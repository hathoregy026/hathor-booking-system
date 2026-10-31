import { z } from "zod";
import { BULK_RECIPIENT_LIMIT, type BulkEmailTemplate, type BulkJournalImage, type RecipientImport } from "@/lib/bulk-email-types";
import { isBulkEmailBannerUrl } from "@/lib/bulk-email-images";
import { bulkJournalHttpsUrl } from "@/lib/bulk-email-journal";

export const bulkEmailAddress = z.email().max(254).transform(value => value.toLowerCase());
const HIDDEN_CHARACTERS = "Remove tabs or other hidden characters from this text.";
const safeLine = z.string().trim().min(1, "Enter a subject for this email.").max(180).refine(value => !/[\r\n\x00-\x1f\x7f]/.test(value), HIDDEN_CHARACTERS);
const multilineText = (maximum: number) => z.string().trim().max(maximum).refine(value => !/[\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/.test(value), HIDDEN_CHARACTERS);
const destination = z.string().trim().max(4096).refine(value => value === "" || bulkJournalHttpsUrl(value) !== null, "Use a public HTTPS destination, or leave it empty to hide the link.");
const journalImageSchema = z.object({
  show: z.boolean(),
  url: z.string().max(2048).refine(isBulkEmailBannerUrl, "Choose an image uploaded from Bulk emails.").optional(),
  alt: multilineText(500),
}).strict();
const journalButtonSchema = z.object({ label: multilineText(500), url: destination }).strict();
export const bulkJournalSchema = z.object({
  mastheadLabel: multilineText(500), mastheadLocation: multilineText(500),
  introImage: journalImageSchema,
  features: z.array(z.object({ title: multilineText(500), body: multilineText(12000) }).strict()).length(4),
  galleryHeading: multilineText(500), galleryBody: multilineText(12000), galleryCaption: multilineText(500),
  galleryMainImage: journalImageSchema, galleryUpperImage: journalImageSchema, galleryLowerImage: journalImageSchema,
  journeyHeading: multilineText(500), journeyBody: multilineText(12000),
  discoverButton: journalButtonSchema, journeyButton: journalButtonSchema,
  address: multilineText(2000), preferencesLabel: multilineText(500), preferencesUrl: destination,
}).strict().refine(value => JSON.stringify(value).length <= 64000, "The journal content is too long.");
export const bulkTemplateSchema = z.object({
  eyebrow: multilineText(500), heading: multilineText(500), showBanner: z.boolean(),
  heroImageUrl: z.string().max(2048).refine(isBulkEmailBannerUrl, "Choose a banner uploaded from Bulk emails.").optional(),
  signature: z.string().trim().max(2000).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value), HIDDEN_CHARACTERS).optional(),
  primaryColor: z.string().regex(/^#[a-f\d]{6}$/i, "Choose a valid colour."), backgroundColor: z.string().regex(/^#[a-f\d]{6}$/i, "Choose a valid colour."),
  footer: z.object({ tagline: multilineText(120), email: z.string().trim().max(120).refine(value => value === "" || z.email().safeParse(value).success, "Enter a valid email address, or leave this empty."), phone: multilineText(60), replyNote: multilineText(300), copyright: multilineText(120) }).strict(),
  journal: bulkJournalSchema.optional(),
}).strict();
export const bulkMessageSchema = z.object({
  subject: safeLine,
  message: z.string().trim().min(1, "Write the message for this email.").max(12000).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value), HIDDEN_CHARACTERS),
  template: bulkTemplateSchema.optional(),
}).strict();
export const bulkCampaignSchema = bulkMessageSchema.extend({
  id: z.uuid(),
  emails: z.array(bulkEmailAddress).min(1, "Add at least one email address.").max(BULK_RECIPIENT_LIMIT, `Select no more than ${BULK_RECIPIENT_LIMIT} recipients.`),
  confirmed: z.literal(true),
}).strict().refine(value => new Set(value.emails).size === value.emails.length, { message: "Duplicate recipients" });

export type BulkFieldIssue = { id: string; label: string; message: string };
const JOURNAL_IMAGES: Record<string, string> = { introImage: "Dining image", galleryMainImage: "Suite image", galleryUpperImage: "Sailing image", galleryLowerImage: "Bar image" };
const BULK_FIELDS: Record<string, [id: string, label: string]> = {
  subject: ["bulk-subject", "Email subject"], message: ["bulk-message", "Message"], emails: ["bulk-paste", "Recipients"],
  "template.eyebrow": ["bulk-eyebrow", "Small line above the subject"], "template.heading": ["bulk-heading", "Introduction heading"], "template.signature": ["bulk-signature", "Signature"],
  "template.primaryColor": ["bulk-accent", "Accent colour"], "template.backgroundColor": ["bulk-background", "Background colour"], "template.heroImageUrl": ["bulk-banner", "Banner image"],
  "template.footer.tagline": ["bulk-footer-tagline", "Footer tagline"], "template.footer.email": ["bulk-footer-email", "Footer email address"], "template.footer.phone": ["bulk-footer-phone", "Footer phone"], "template.footer.replyNote": ["bulk-footer-replyNote", "Footer reply note"], "template.footer.copyright": ["bulk-footer-copyright", "Footer copyright"],
  "template.journal": ["bulk-masthead-label", "Journal content"], "template.journal.mastheadLabel": ["bulk-masthead-label", "Journal label"], "template.journal.mastheadLocation": ["bulk-masthead-location", "Location line"],
  "template.journal.galleryHeading": ["bulk-gallery-heading", "Gallery heading"], "template.journal.galleryBody": ["bulk-gallery-body", "Gallery description"], "template.journal.galleryCaption": ["bulk-gallery-caption", "Gallery caption"],
  "template.journal.journeyHeading": ["bulk-journey-heading", "Journey heading"], "template.journal.journeyBody": ["bulk-journey-body", "Journey description"],
  "template.journal.discoverButton.label": ["bulk-discoverButton-label", "Discover button label"], "template.journal.discoverButton.url": ["bulk-discoverButton-url", "Discover button destination"],
  "template.journal.journeyButton.label": ["bulk-journeyButton-label", "Voyages button label"], "template.journal.journeyButton.url": ["bulk-journeyButton-url", "Voyages button destination"],
  "template.journal.address": ["bulk-footer-address", "Postal address"], "template.journal.preferencesLabel": ["bulk-preferences-label", "Email preferences label"], "template.journal.preferencesUrl": ["bulk-preferences-url", "Email preferences destination"],
};
function bulkField(key: string, journal: boolean): [id: string, label: string] {
  if (journal && key === "message") return ["bulk-message", "Introduction message"];
  if (journal && key === "template.eyebrow") return ["bulk-eyebrow", "Small introduction line"];
  if (journal && key === "template.heroImageUrl") return ["bulk-image-hero", "Hero banner"];
  if (key.startsWith("emails.")) return BULK_FIELDS.emails;
  const feature = /^template\.journal\.features\.(\d+)\.(title|body)$/.exec(key);
  if (feature) return [`bulk-feature-${feature[1]}-${feature[2]}`, `Moment 0${Number(feature[1]) + 1} ${feature[2] === "title" ? "title" : "description"}`];
  const image = /^template\.journal\.(\w+)\.(alt|url)$/.exec(key);
  if (image && JOURNAL_IMAGES[image[1]]) return image[2] === "alt" ? [`bulk-image-alt-${image[1]}`, `${JOURNAL_IMAGES[image[1]]} description`] : [`bulk-image-${image[1]}`, JOURNAL_IMAGES[image[1]]];
  return BULK_FIELDS[key] || ["", "This email"];
}
/** Name each rejected field in the sender's words, one entry per field. */
export function bulkFieldIssues(issues: readonly z.core.$ZodIssue[], journal = false): BulkFieldIssue[] {
  const fields = new Map<string, BulkFieldIssue>();
  for (const issue of issues) {
    const key = issue.path.join(".");
    const [id, label] = bulkField(key, journal);
    const message = issue.code === "too_big" && issue.origin === "string" ? `Use no more than ${Number(issue.maximum).toLocaleString("en")} characters.` : issue.message;
    if (!fields.has(id || key)) fields.set(id || key, { id, label, message });
  }
  return [...fields.values()];
}
/** Upload URLs are checked against a server-only setting, so the browser leaves them to the API. */
function withoutUploadUrls(template: BulkEmailTemplate): BulkEmailTemplate {
  const { heroImageUrl: _hero, journal, ...rest } = template;
  void _hero;
  if (!journal) return rest;
  const image = ({ show, alt }: BulkJournalImage) => ({ show, alt });
  return { ...rest, journal: { ...journal, introImage: image(journal.introImage), galleryMainImage: image(journal.galleryMainImage), galleryUpperImage: image(journal.galleryUpperImage), galleryLowerImage: image(journal.galleryLowerImage) } };
}
export function bulkDraftIssues(subject: string, message: string, template: BulkEmailTemplate | null): BulkFieldIssue[] {
  const result = bulkMessageSchema.safeParse({ subject, message, ...(template ? { template: withoutUploadUrls(template) } : {}) });
  return result.success ? [] : bulkFieldIssues(result.error.issues, Boolean(template?.journal));
}

/** Extract plain addresses only. Names, spreadsheet formulas and HTML are never executed. */
export function extractBulkRecipients(parts: string[]): RecipientImport {
  const emails = new Set<string>();
  const invalid = new Set<string>();
  let duplicates = 0;
  let candidates = 0;
  for (const part of parts) {
    for (const token of part.split(/[\s,;<>\[\]()"\u00a0]+/)) {
      if (!token.includes("@")) continue;
      if (++candidates > 5000) throw new Error("The list is too large. Upload a smaller file.");
      const cleaned = token.replace(/^mailto:/i, "").replace(/[.:!?]+$/, "");
      const result = bulkEmailAddress.safeParse(cleaned);
      if (!result.success) { if (invalid.size < 100) invalid.add(cleaned.slice(0, 300)); continue; }
      if (emails.has(result.data)) duplicates++;
      else emails.add(result.data);
    }
  }
  return { emails: [...emails], duplicates, invalid: [...invalid], warnings: [] };
}
