import { z } from "zod";
import { BULK_RECIPIENT_LIMIT, type RecipientImport } from "@/lib/bulk-email-types";
import { isBulkEmailBannerUrl } from "@/lib/bulk-email-images";

export const bulkEmailAddress = z.email().max(254).transform(value => value.toLowerCase());
const safeLine = z.string().trim().min(1).max(180).refine(value => !/[\r\n\x00-\x1f\x7f]/.test(value));
const templateText = (maximum: number) => z.string().trim().max(maximum).refine(value => !/[\x00-\x1f\x7f]/.test(value));
export const bulkTemplateSchema = z.object({
  eyebrow: templateText(120), heading: templateText(180), showBanner: z.boolean(),
  heroImageUrl: z.string().max(2048).refine(isBulkEmailBannerUrl, "Choose a banner uploaded from Bulk emails.").optional(),
  signature: z.string().trim().max(2000).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)).optional(),
  primaryColor: z.string().regex(/^#[a-f\d]{6}$/i), backgroundColor: z.string().regex(/^#[a-f\d]{6}$/i),
  footer: z.object({ tagline: templateText(120), email: z.union([z.literal(""), z.email().max(120)]), phone: templateText(60), replyNote: templateText(300), copyright: templateText(120) }).strict(),
}).strict();
export const bulkMessageSchema = z.object({
  subject: safeLine,
  message: z.string().trim().min(1).max(12000).refine(value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)),
  template: bulkTemplateSchema.optional(),
}).strict();
export const bulkCampaignSchema = bulkMessageSchema.extend({
  id: z.uuid(),
  emails: z.array(bulkEmailAddress).min(1).max(BULK_RECIPIENT_LIMIT),
  confirmed: z.literal(true),
}).strict().refine(value => new Set(value.emails).size === value.emails.length, { message: "Duplicate recipients" });

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
