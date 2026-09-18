import { z } from "zod";
import type { NextRequest } from "next/server";
import { verifySessionToken, sessionIdFromToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { assertTrustedPublicJsonRequest, PublicRequestError } from "@/lib/public-api-security";
import { administerBooking } from "@/lib/booking-engine";
import { sendConfirmation, sendDeclined, sendInvoice, sendTeamReply, type MailResult } from "@/lib/booking-guest-mail";
import { fetchBookingStatus } from "@/lib/admin-bookings-fetch";

export function assertBookingAdmin(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) throw new PublicRequestError("Unauthorized",401);
  assertTrustedPublicJsonRequest(request);
}

/** Which staff session recorded an entry — the identity this setup can prove. */
export function bookingAdminSession(request: NextRequest) {
  return sessionIdFromToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

const teamText = z.string().trim().max(4000);

export const staffActionSchema = z.discriminatedUnion("type", [
  // Confirm: accept the request and email the invoice with these payment instructions.
  z.object({ type: z.literal("accept"), instructions: teamText.min(10).optional() }).strict(),
  z.object({ type: z.literal("decline"), message: teamText.optional(), notify: z.boolean().default(true) }).strict(),
  z.object({ type: z.literal("cancel"), reason: z.enum(["CANCELLATION","NO_SHOW","EARLY_DEPARTURE"]).default("CANCELLATION") }).strict(),
  z.object({ type: z.literal("record-payment"), payment: z.object({
    reference: z.string().trim().min(6).max(128),
    method: z.enum(["VISA","BANK_TRANSFER"]),
    amountCents: z.number().int().positive().max(20_000_000),
    kind: z.enum(["RECEIPT","REFUND"]),
    receivedAt: z.iso.datetime().transform(s => new Date(s)).refine(d => d <= new Date(), "Payment cannot be dated in the future."),
  }).strict() }).strict(),
  z.object({ type: z.literal("message"), subject: z.string().trim().max(200).optional(), message: teamText.min(2) }).strict(),
  z.object({ type: z.literal("send-confirmation") }).strict(),
]);

export type StaffActionResult = { email?: MailResult };

export async function applyStaffBookingAction(id: string, body: unknown, recordedBySession: string | null = null): Promise<StaffActionResult> {
  // Compatibility for the bulk list actions: confirm means accept the request,
  // never bypass the recorded-payment requirement.
  const legacy = z.object({ status: z.enum(["CONFIRMED","CANCELLED"]) }).strict().safeParse(body);
  const action = legacy.success
    ? legacy.data.status === "CONFIRMED" ? { type: "accept" as const } : { type: "cancel" as const }
    : staffActionSchema.parse(body);

  if (action.type === "message") {
    return { email: await sendTeamReply(id, action.message, action.subject) };
  }

  if (action.type === "send-confirmation") {
    if ((await fetchBookingStatus(id)) !== "CONFIRMED") throw new PublicRequestError("Only a confirmed booking has a confirmation to send.", 400);
    return { email: await sendConfirmation(id) };
  }

  if (action.type === "accept") {
    await administerBooking(id, { type: "accept" });
    return "instructions" in action && action.instructions ? { email: await sendInvoice(id, action.instructions) } : {};
  }

  if (action.type === "decline") {
    await administerBooking(id, { type: "decline" });
    return action.notify ? { email: await sendDeclined(id, action.message) } : {};
  }

  if (action.type === "cancel") {
    await administerBooking(id, action);
    return {};
  }

  const before = await fetchBookingStatus(id);
  const after = await administerBooking(id, { ...action, payment: { ...action.payment, recordedBySession: recordedBySession ?? undefined } });
  // The database confirms a booking once the recorded payments cover the deposit; tell the guest then.
  if (before !== "CONFIRMED" && after?.status === "CONFIRMED") return { email: await sendConfirmation(id) };
  return {};
}
