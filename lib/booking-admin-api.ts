import { z } from "zod";
import type { NextRequest } from "next/server";
import { verifySessionToken, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { assertTrustedPublicJsonRequest, PublicRequestError } from "@/lib/public-api-security";
import { administerBooking } from "@/lib/booking-engine";

export function assertBookingAdmin(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) throw new PublicRequestError("Unauthorized",401);
  assertTrustedPublicJsonRequest(request);
}
export const staffActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("accept") }).strict(),
  z.object({ type: z.literal("cancel"), reason: z.enum(["CANCELLATION","NO_SHOW","EARLY_DEPARTURE"]).default("CANCELLATION") }).strict(),
  z.object({ type: z.literal("record-payment"), payment: z.object({
    reference: z.string().trim().min(6).max(128),
    method: z.enum(["VISA","BANK_TRANSFER"]),
    amountCents: z.number().int().positive().max(20_000_000),
    kind: z.enum(["RECEIPT","REFUND"]),
    receivedAt: z.iso.datetime().transform(s => new Date(s)).refine(d => d <= new Date(), "Payment cannot be dated in the future."),
  }).strict() }).strict(),
]);
export async function applyStaffBookingAction(id: string, body: unknown) {
  // Compatibility for existing admin buttons: confirm means accept the request,
  // never bypass the recorded-payment requirement.
  const legacy = z.object({ status: z.enum(["CONFIRMED","CANCELLED"]) }).strict().safeParse(body);
  const action = legacy.success
    ? { type: legacy.data.status === "CONFIRMED" ? "accept" as const : "cancel" as const }
    : staffActionSchema.parse(body);
  return administerBooking(id, action);
}
