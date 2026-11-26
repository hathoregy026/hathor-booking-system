import { trackGaEvent } from "@/lib/ga-browser";
import { trackMetaEvent } from "@/lib/meta-pixel";

/*
 * A booking request counts as a conversion exactly once: the journey marks the
 * request it just sent, and the success page reports it only when that mark
 * matches. Guests reopening the success page from their email, the booking
 * lookup, or a reload never count again. The booking id is a random reference,
 * not personal data.
 */

const PENDING_KEY = "hathor_pending_booking_conversion";
const SENT_KEY = "hathor_sent_booking_conversions";
const PENDING_MAX_AGE_MS = 6 * 60 * 60 * 1000;

type Pending = { bookingId: string; valueCents: number | null; currency: string; ts: number };

/** Called by the journey right before it opens the success page for a new request. */
export function rememberBookingConversion(bookingId: string, valueCents: number | null, currency = "USD"): void {
  try {
    const pending: Pending = { bookingId, valueCents, currency, ts: Date.now() };
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* storage blocked: the request still goes through */
  }
  /*
   * Meta hears about the request here, on the journey page, because the
   * success page address carries the guest's access token. The booking id is
   * the event id the server copy also uses, so Meta counts it once.
   */
  const params: Record<string, string | number> = { currency: currency || "USD", content_name: "booking_request" };
  if (typeof valueCents === "number" && valueCents > 0) params.value = Math.round(valueCents) / 100;
  trackMetaEvent("Purchase", params, bookingId);
}

function alreadySent(bookingId: string): boolean {
  try {
    const list = JSON.parse(window.localStorage.getItem(SENT_KEY) ?? "[]") as string[];
    return Array.isArray(list) && list.includes(bookingId);
  } catch {
    return false;
  }
}

function markSent(bookingId: string): void {
  try {
    const list = JSON.parse(window.localStorage.getItem(SENT_KEY) ?? "[]") as string[];
    const next = [...(Array.isArray(list) ? list : []), bookingId].slice(-20);
    window.localStorage.setItem(SENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Success page: report the request once, with its value, if this browser just sent it. */
export function reportBookingConversion(bookingId: string): void {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const pending = JSON.parse(raw) as Pending;
    if (!pending || pending.bookingId !== bookingId) return;
    window.sessionStorage.removeItem(PENDING_KEY);
    if (Date.now() - pending.ts > PENDING_MAX_AGE_MS || alreadySent(bookingId)) return;
    markSent(bookingId);
    const value = typeof pending.valueCents === "number" && pending.valueCents > 0 ? Math.round(pending.valueCents) / 100 : undefined;
    const params: Record<string, string | number> = { transaction_id: bookingId, currency: pending.currency || "USD" };
    if (value !== undefined) params.value = value;
    trackGaEvent("booking_request", params);
    trackGaEvent("purchase", params);
  } catch {
    /* tracking must never break the success page */
  }
}
