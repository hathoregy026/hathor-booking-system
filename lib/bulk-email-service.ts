import { z } from "zod";
import { bulkCampaignSchema, bulkEmailAddress } from "@/lib/bulk-email-validation";
import { BULK_RECIPIENT_LIMIT, type BulkCampaign, type BulkCampaignView, type BulkSettings } from "@/lib/bulk-email-types";
import { listBulkRecords, openBulkValue, readBulkRecord, sealBulkValue, suppressedBulkEmails, suppressionId, updateBulkRecord } from "@/lib/bulk-email-store";
import { bulkBranding, renderBulkMessage } from "@/lib/bulk-email-render";
import { getResendFromAddress } from "@/lib/resend-config";
import { PublicRequestError } from "@/lib/public-api-security";
import type { EmailTemplateRecord } from "@/lib/email-templates";

const uuid = z.uuid();
export function bulkSettings(): BulkSettings {
  const mode = process.env.BULK_EMAIL_MODE === "send" ? "send" : "preview";
  return { mode, from: process.env.BULK_EMAIL_FROM_EMAIL?.trim() || getResendFromAddress(), replyTo: process.env.BULK_EMAIL_REPLY_TO?.trim() || process.env.RESEND_REPLY_TO?.trim() || "", recipientLimit: BULK_RECIPIENT_LIMIT };
}
export function campaignView(campaign: BulkCampaign): BulkCampaignView {
  // Never return the encrypted unsubscribe tokens or audit session to the browser.
  const { payload: _payload, createdBySession: _session, leaseUntil: _lease, previewHtml: _preview, ...view } = campaign;
  void _payload; void _session; void _lease; void _preview;
  return view;
}
export async function bulkHistory() { return (await listBulkRecords<BulkCampaign>()).map(campaignView); }
export async function getBulkCampaign(id: string) {
  uuid.parse(id);
  const campaign = await readBulkRecord<BulkCampaign>(`campaign:${id}`);
  if (!campaign) throw new PublicRequestError("Campaign not found.", 404);
  return campaign;
}

function unsubscribeBaseUrl(origin?: string) {
  if (process.env.NODE_ENV === "development" && origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  const value = process.env.BULK_EMAIL_BASE_URL || "https://www.hathorcruise.com";
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("A secure bulk email base URL is required.");
  return url.origin;
}

export async function createBulkCampaign(body: unknown, session: string, origin?: string, template?: EmailTemplateRecord): Promise<BulkCampaign> {
  const input = bulkCampaignSchema.parse(body);
  // Optional staging guard: a real-send preview can only reach explicitly
  // approved test mailboxes. This is checked before looking up a campaign.
  const testRecipients = process.env.BULK_EMAIL_TEST_RECIPIENTS?.trim();
  if (bulkSettings().mode === "send" && testRecipients) {
    const allowed = new Set(testRecipients.split(",").map(value => bulkEmailAddress.parse(value.trim())));
    if (input.emails.some(email => !allowed.has(email))) throw new PublicRequestError("This preview can send only to the approved test addresses.", 403);
  }
  const existing = await readBulkRecord<BulkCampaign>(`campaign:${input.id}`);
  if (existing) {
    if (existing.subject !== input.subject || existing.message !== input.message || JSON.stringify(existing.template) !== JSON.stringify(input.template) || existing.recipients.map(row => row.email).join("\n") !== input.emails.join("\n")) throw new PublicRequestError("This campaign already exists with different content. Start a new message.", 409);
    return existing;
  }
  const settings = bulkSettings();
  if (settings.mode === "send" && (!process.env.RESEND_API_KEY || settings.from.includes("@resend.dev") || /[\r\n]/.test(settings.from))) throw new PublicRequestError("Configure your verified Hathor sender before enabling bulk delivery.", 503);
  if (settings.replyTo) bulkEmailAddress.parse(settings.replyTo);
  const marker = `https://bulk.invalid/${input.id}`;
  const rendered = await renderBulkMessage(input.subject, input.message, template || await bulkBranding(), marker, input.template);
  const baseUrl = unsubscribeBaseUrl(origin);
  const recipients = input.emails.map(email => ({ email, status: "pending" as const }));
  const payload = await Promise.all(input.emails.map(async email => {
    const token = await sealBulkValue({ email }, "bulk-unsubscribe");
    const link = `${baseUrl}/bulk-email/unsubscribe?token=${token}`;
    return { from: settings.from, to: email, subject: input.subject, html: rendered.html.replaceAll(marker, link), text: rendered.text.replaceAll(marker, link),
      ...(settings.replyTo ? { reply_to: settings.replyTo } : {}),
      headers: { "List-Unsubscribe": `<${link}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    };
  }));
  const timestamp = new Date().toISOString();
  const campaign: BulkCampaign = { id: input.id, subject: input.subject, message: input.message, ...(input.template ? { template: input.template } : {}), mode: settings.mode, status: "queued", recipients, payload, previewHtml: rendered.html.replaceAll(marker, "https://www.hathorcruise.com/bulk-email/unsubscribe"), createdAt: timestamp, updatedAt: timestamp, createdBySession: session };
  return updateBulkRecord<BulkCampaign>(`campaign:${input.id}`, current => {
    if (current && (current.subject !== campaign.subject || current.message !== campaign.message || JSON.stringify(current.template) !== JSON.stringify(campaign.template) || current.recipients.map(row => row.email).join("\n") !== input.emails.join("\n"))) throw new PublicRequestError("Campaign content has changed. Start a new message.", 409);
    return current || campaign;
  });
}

type BatchResult = { kind: "accepted"; ids: string[] } | { kind: "failed" | "uncertain"; error: string };
export type BulkBatchSender = (campaign: BulkCampaign) => Promise<BatchResult>;
export const sendBulkBatch: BulkBatchSender = async campaign => {
  try {
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `hathor-bulk/${campaign.id}` },
      body: JSON.stringify(campaign.payload), signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      if ([400, 401, 403, 404, 422, 429].includes(response.status)) return { kind: "failed", error: response.status === 429 ? "Resend's sending limit was reached. Wait, then retry this campaign." : "Resend rejected this batch. Check your account and verified sender, then retry this campaign." };
      return { kind: "uncertain", error: "Resend did not confirm the result. Use Retry safely to check the same batch without sending duplicates." };
    }
    const body: unknown = await response.json();
    const result = z.object({ data: z.array(z.object({ id: z.string().min(1).max(200) })) }).safeParse(body);
    if (!result.success || result.data.data.length !== campaign.payload.length) return { kind: "uncertain", error: "The batch result could not be confirmed. Retry safely; do not create a duplicate campaign." };
    return { kind: "accepted", ids: result.data.data.map(row => row.id) };
  } catch { return { kind: "uncertain", error: "The connection was interrupted. Retry safely to check the same batch without sending duplicates." }; }
};

/** Claim durably before sending; every recovery uses the exact frozen payload and same provider key. */
export async function processBulkCampaign(id: string, sender: BulkBatchSender = sendBulkBatch): Promise<BulkCampaign> {
  const before = await getBulkCampaign(id);
  const testRecipients = process.env.BULK_EMAIL_TEST_RECIPIENTS?.trim();
  if (before.mode === "send" && testRecipients) {
    const allowed = new Set(testRecipients.split(",").map(value => bulkEmailAddress.parse(value.trim())));
    if (before.recipients.some(row => !allowed.has(row.email))) throw new PublicRequestError("This preview can send only to the approved test addresses.", 403);
  }
  if (["accepted", "simulated", "cancelled"].includes(before.status)) return before;
  if (before.mode !== bulkSettings().mode) throw new PublicRequestError("Delivery mode has changed. This campaign cannot be sent in the new mode.", 409);
  if (before.mode === "send" && !process.env.RESEND_API_KEY) throw new PublicRequestError("Resend is not configured.", 503);
  if (before.firstAttemptAt && Date.now() - Date.parse(before.firstAttemptAt) >= 23 * 60 * 60 * 1000) throw new PublicRequestError("The safe retry window has ended. Check this batch in Resend before sending anything again.", 409);
  const suppressed = before.firstAttemptAt ? new Set<string>() : await suppressedBulkEmails(before.recipients.map(row => row.email));
  let claimed = false;
  const campaign = await updateBulkRecord<BulkCampaign>(`campaign:${id}`, current => {
    claimed = false;
    if (!current) throw new PublicRequestError("Campaign not found.", 404);
    if (["accepted", "simulated", "cancelled"].includes(current.status) || (current.leaseUntil || 0) > Date.now()) return current;
    claimed = true;
    if (!current.firstAttemptAt) {
      current.payload = current.payload.filter(row => !suppressed.has(row.to));
      current.recipients = current.recipients.map(row => suppressed.has(row.email) ? { ...row, status: "skipped" } : row);
    }
    return { ...current, status: "sending", leaseUntil: Date.now() + 60000, firstAttemptAt: current.firstAttemptAt || new Date().toISOString(), updatedAt: new Date().toISOString(), error: undefined };
  });
  if (!claimed) return campaign;
  let result: BatchResult;
  try { result = campaign.mode === "preview" || campaign.payload.length === 0 ? { kind: "accepted", ids: campaign.payload.map((_, i) => `preview-${id}-${i}`) } : await sender(campaign); }
  catch { result = { kind: "uncertain", error: "The batch result is unknown. Retry safely to recover this campaign." }; }
  return updateBulkRecord<BulkCampaign>(`campaign:${id}`, current => {
    if (!current) throw new PublicRequestError("Campaign not found.", 404);
    // A delayed uncertain response must never overwrite a confirmed result
    // recorded by another recovery of the same provider idempotency key.
    if (["accepted", "simulated", "cancelled"].includes(current.status)) return current;
    if (result.kind === "accepted") {
      const ids = new Map(campaign.payload.map((row, index) => [row.to, result.ids[index]]));
      return { ...current, status: campaign.mode === "preview" ? "simulated" : "accepted", leaseUntil: undefined, updatedAt: new Date().toISOString(), error: undefined,
        recipients: current.recipients.map(row => ids.has(row.email) ? { ...row, status: campaign.mode === "preview" ? "simulated" : "accepted", providerId: ids.get(row.email) } : row) };
    }
    return { ...current, status: result.kind, error: result.error, leaseUntil: undefined, updatedAt: new Date().toISOString() };
  });
}

export async function cancelBulkCampaign(id: string) {
  uuid.parse(id);
  return updateBulkRecord<BulkCampaign>(`campaign:${id}`, current => {
    if (!current) throw new PublicRequestError("Campaign not found.", 404);
    if (current.firstAttemptAt) throw new PublicRequestError("This batch was already attempted and cannot be recalled.", 409);
    return { ...current, status: "cancelled", updatedAt: new Date().toISOString() };
  });
}
export async function bulkUnsubscribe(token: string) {
  if (!/^[A-Za-z\d_-]{40,1200}$/.test(token)) throw new PublicRequestError("Invalid unsubscribe link.", 400);
  let email: string;
  try { email = bulkEmailAddress.parse((await openBulkValue<{ email: string }>(token, "bulk-unsubscribe")).email); }
  catch { throw new PublicRequestError("Invalid unsubscribe link.", 400); }
  await updateBulkRecord(await suppressionId(email), current => current || { email, unsubscribedAt: new Date().toISOString() });
}
