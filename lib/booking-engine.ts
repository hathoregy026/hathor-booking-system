import { createHash } from "crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { bookingQuery } from "@/lib/booking-database";
import { BookingConflictError, InvalidBookingError } from "@/lib/booking";

import type { RequestedRoom } from "@/lib/physical-inventory";
export const HOLD_MINUTES = 15;
type Tx = Prisma.TransactionClient;
const dayMs = 86_400_000;

export async function lockVessel(tx: Tx) {
  await tx.$queryRaw`SELECT set_config('idle_in_transaction_session_timeout','30s',true)`;
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(734821901)`;
}
export async function expireHolds(tx: Tx) {
  await tx.$queryRaw`SELECT hathor_expire_holds()`;
}
export { paymentSchedule } from "@/lib/payment-schedule";
export function cancellationFee(total: number, departure: Date, now = new Date(), reason = "CANCELLATION") {
  const days = Math.round((Date.UTC(departure.getUTCFullYear(), departure.getUTCMonth(), departure.getUTCDate()) -
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / dayMs);
  return Math.ceil(total * (reason !== "CANCELLATION" || days <= 45 ? 1 : days <= 60 ? 0.5 : days < 90 ? 0.25 : 0));
}
export function netPaid(payments: { kind: string; amountCents: number }[]) {
  return payments.reduce((sum, p) => sum + (p.kind === "REFUND" ? -p.amountCents : p.amountCents), 0);
}
export const reservationInclude = {
  bookingRooms: { include: { room: true }, orderBy: { roomIndex: "asc" as const } },
  cruiseSchedule: { include: { cruise: true } },
  guests: true,
  payments: true,
  paymentSchedule: true,
} as const;

type Reservation = Prisma.BookingGetPayload<{include: typeof reservationInclude}>;
function hydrate<T>(input: unknown): T {
  function walk(value: unknown, key = ""): unknown {
    if (typeof value === "string" && /(?:At|Time)$/.test(key) && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value+"Z");
    if (Array.isArray(value)) return value.map(v=>walk(v));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v,k)]));
    return value;
  }
  return walk(input) as T;
}
function rethrowDatabaseRequest(error: unknown): never {
  const text = error instanceof Error ? error.message : "";
  if (text.includes("HB409") || (error as {code?: string})?.code === "HB409") throw new BookingConflictError("The requested rooms or hold are no longer available. Start a new selection.");
  if (text.includes("HB400") || (error as {code?: string})?.code === "HB400") throw new InvalidBookingError("The booking request is invalid or does not match this checkout attempt.");
  throw error;
}
export async function acquireBookingHold(input: {cruiseScheduleId:string;rooms:RequestedRoom[];idempotencyKey:string}) {
 const fingerprint=createHash("sha256").update(JSON.stringify({sailing:input.cruiseScheduleId,rooms:input.rooms.map(r=>[r.roomType,r.adults,r.children])})).digest("hex");
 try {
  const rows=await bookingQuery<{booking:unknown}>("SELECT hathor_acquire_hold($1,$2::jsonb,$3,$4) AS booking",[input.cruiseScheduleId,JSON.stringify(input.rooms),input.idempotencyKey,fingerprint]);
  return hydrate<Reservation>(rows[0].booking);
 } catch(error){rethrowDatabaseRequest(error);}
}

/** Frees a guest's own temporary hold now; sent requests are left untouched. */
export async function releaseBookingHold(id: string) {
  try {
    const rows = await bookingQuery<{ booking: unknown }>("SELECT hathor_release_hold($1) AS booking", [id]);
    return hydrate<Reservation>(rows[0].booking);
  } catch (error) { rethrowDatabaseRequest(error); }
}

export type GuestRequest = {
  bookingId: string; firstName: string; lastName: string; email: string; phone: string; country: string;
  paymentMethod: "VISA" | "BANK_TRANSFER"; specialRequests: string; marketingOptIn: boolean;
  passengers: { fullName: string; isChild: boolean; roomIndex: number }[];
};
export async function submitBookingRequest(input:GuestRequest,idempotencyKey:string) {
 try {
  const rows=await bookingQuery<{result:unknown}>("SELECT hathor_submit_request($1::jsonb,$2) AS result",[JSON.stringify(input),idempotencyKey]);
  return hydrate<{booking:Reservation;replay:boolean}>(rows[0].result);
 }catch(error){rethrowDatabaseRequest(error);}
}

export async function administerBooking(id: string, action: {
  type: "accept" | "decline" | "cancel" | "record-payment";
  reason?: "CANCELLATION" | "NO_SHOW" | "EARLY_DEPARTURE";
  payment?: { reference: string; method: "VISA" | "BANK_TRANSFER"; amountCents: number; kind: "RECEIPT" | "REFUND"; receivedAt: Date; recordedBySession?: string };
}) {
  try {
    const rows=await bookingQuery<{booking:unknown}>("SELECT hathor_administer_booking($1,$2::jsonb) AS booking",[id,JSON.stringify(action)]);
    return hydrate<Reservation>(rows[0].booking);
  }catch(error){
    // Staff see the database's own reason ("Only a request awaiting review can be declined").
    if ((error as {code?: string})?.code === "HB400" && error instanceof Error) throw new InvalidBookingError(error.message);
    rethrowDatabaseRequest(error);
  }
}

export async function getBookingReservation(id:string) {
 const rows=await bookingQuery<{booking:unknown}>("SELECT hathor_reservation_json($1) AS booking",[id]);
 const booking=hydrate<Reservation|null>(rows[0]?.booking);
 return booking?.deletedAt ? null : booking;
}
