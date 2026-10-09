import { z } from "zod";
import type { NextRequest } from "next/server";
import { adminIdentityFromRequest, type AdminIdentity } from "@/lib/admin-server-auth";
import { assertTrustedPublicJsonRequest, PublicRequestError } from "@/lib/public-api-security";
import { administerBooking } from "@/lib/booking-engine";
import { sendConfirmation, sendDeclined, sendInvoice, sendPaymentReceipt, sendTeamReply, type MailResult } from "@/lib/booking-guest-mail";
import { fetchBookingStatus } from "@/lib/admin-bookings-fetch";
import { mailAttachmentRefsSchema, resolveAttachments } from "@/lib/mail-attachments";

/**
 * Live, database-checked staff session plus same-origin JSON. Must be awaited:
 * the returned identity's `sessionId` is what audit columns record.
 */
export async function assertBookingAdmin(request: NextRequest): Promise<AdminIdentity> {
  const identity = await adminIdentityFromRequest(request);
  if (!identity) throw new PublicRequestError("Unauthorized",401);
  assertTrustedPublicJsonRequest(request);
  return identity;
}

const teamText = z.string().trim().max(4000);

function isSecureLink(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const staffActionSchema = z.discriminatedUnion("type", [
  // Confirm: accept the request and email the invoice with the payment link and/or payment instructions.
  z.object({
    type: z.literal("accept"),
    instructions: teamText.min(10).optional(),
    paymentLink: z.string().trim().max(2000).refine(isSecureLink, "Paste the full secure payment link (it starts with https://).").optional(),
    attachments: mailAttachmentRefsSchema.optional(),
    // Before any payment: how the guest pays (Visa adds the 2.5% card surcharge), and the team's own first payment.
    paymentMethod: z.enum(["VISA","BANK_TRANSFER"]).optional(),
    split: z.object({
      firstCents: z.number().int().positive().max(20_000_000),
      balanceDueOn: z.iso.date().optional(),
    }).strict().optional(),
  }).strict(),
  z.object({ type: z.literal("decline"), message: teamText.optional(), notify: z.boolean().default(true) }).strict(),
  z.object({ type: z.literal("cancel"), reason: z.enum(["CANCELLATION","NO_SHOW","EARLY_DEPARTURE"]).default("CANCELLATION") }).strict(),
  z.object({ type: z.literal("record-payment"), payment: z.object({
    reference: z.string().trim().min(6).max(128),
    method: z.enum(["VISA","BANK_TRANSFER"]),
    amountCents: z.number().int().positive().max(20_000_000),
    kind: z.enum(["RECEIPT","REFUND"]),
    receivedAt: z.iso.datetime().transform(s => new Date(s)).refine(d => d <= new Date(), "Payment cannot be dated in the future."),
  }).strict(), attachments: mailAttachmentRefsSchema.optional() }).strict(),
  z.object({ type: z.literal("message"), subject: z.string().trim().max(200).regex(/^[^\r\n\u0000]*$/).optional(), message: teamText.min(2), attachments: mailAttachmentRefsSchema.optional() }).strict(),
  z.object({ type: z.literal("send-confirmation"), attachments: mailAttachmentRefsSchema.optional() }).strict(),
]);

export type StaffActionResult = { email?: MailResult };

export async function applyStaffBookingAction(id: string, body: unknown, recordedBySession: string | null = null, dependencies: {
  resolveAttachments?: typeof resolveAttachments; administerBooking?: typeof administerBooking;
  fetchBookingStatus?: typeof fetchBookingStatus; sendConfirmation?: typeof sendConfirmation; sendPaymentReceipt?: typeof sendPaymentReceipt;
} = {}): Promise<StaffActionResult> {
  const resolve = dependencies.resolveAttachments ?? resolveAttachments;
  const administer = dependencies.administerBooking ?? administerBooking;
  const status = dependencies.fetchBookingStatus ?? fetchBookingStatus;
  const confirm = dependencies.sendConfirmation ?? sendConfirmation;
  // Compatibility for the bulk list actions: confirm means accept the request,
  // never bypass the recorded-payment requirement.
  const legacy = z.object({ status: z.enum(["CONFIRMED","CANCELLED"]) }).strict().safeParse(body);
  const action = legacy.success
    ? legacy.data.status === "CONFIRMED" ? { type: "accept" as const } : { type: "cancel" as const }
    : staffActionSchema.parse(body);

  if (action.type === "message") {
    const attachments = await resolve(id, action.attachments ?? []);
    return { email: await sendTeamReply(id, action.message, action.subject, recordedBySession ?? undefined, attachments) };
  }

  if (action.type === "send-confirmation") {
    if ((await status(id)) !== "CONFIRMED") throw new PublicRequestError("Only a confirmed booking has a confirmation to send.", 400);
    return { email: await confirm(id, await resolve(id, action.attachments ?? [])) };
  }

  if (action.type === "accept") {
    const attachments = await resolve(id, "attachments" in action ? action.attachments ?? [] : []);
    await administer(id, {
      type: "accept",
      ...("paymentMethod" in action && action.paymentMethod ? { paymentMethod: action.paymentMethod } : {}),
      ...("split" in action && action.split ? { split: action.split } : {}),
    });
    const invoice = "instructions" in action ? { instructions: action.instructions, paymentLink: action.paymentLink } : {};
    return invoice.instructions || invoice.paymentLink ? { email: await sendInvoice(id, invoice, attachments) } : {};
  }

  if (action.type === "decline") {
    await administer(id, { type: "decline" });
    return action.notify ? { email: await sendDeclined(id, action.message) } : {};
  }

  if (action.type === "cancel") {
    await administer(id, action);
    return {};
  }

  const attachments = await resolve(id, action.attachments ?? []);
  const before = await status(id);
  const after = await administer(id, { type: "record-payment", payment: { ...action.payment, recordedBySession: recordedBySession ?? undefined } });
  // The database confirms a booking once the recorded payments cover the deposit; tell the guest then.
  if (before !== "CONFIRMED" && after?.status === "CONFIRMED") return { email: await confirm(id, attachments) };
  return { email: await (dependencies.sendPaymentReceipt ?? sendPaymentReceipt)(id, action.payment, recordedBySession ?? undefined, attachments) };
}
