import { createBookingAccessToken } from "@/lib/booking-access-token";
import { bookingCode, paymentPlan } from "@/lib/booking-code";
import { buildEmailDetailsFromConfirmBooking, emailMoney } from "@/lib/booking-email-details";
import { getBookingReservation, netPaid } from "@/lib/booking-engine";
import { CARD_SURCHARGE_PERCENT } from "@/lib/card-surcharge";
import {
  sendAdminAlertEmail,
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
  sendBookingInvoiceEmail,
  sendBookingMessageEmail,
  sendBookingReceivedEmail,
} from "@/lib/email";
import { bookingQuery } from "@/lib/booking-database";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BOOKING_MAIL_ORIGIN } from "@/lib/booking-email-routing";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
import { localizedHref, PUBLIC_LOCALES, type PublicLocale } from "@/lib/i18n/locale";
import type { ResendAttachment } from "@/lib/mail-attachments";

export type MailResult = { sent: boolean; to: string | null; error?: string };

/** Read through the booking engine's own connections, which survive the pooler dropping idle ones. */
async function loadBooking(id: string) {
  const booking = await getBookingReservation(id);
  if (!booking) throw new Error("Booking not found");
  return booking;
}

function stageWhen(milestone: string, dueAt: string | null, state: string, locale: PublicLocale): string {
  const copy = EMAIL_COPY[locale];
  if (state === "paid") return copy.stageWhen.paid;
  if (milestone === "INITIAL") return copy.stageWhen.initial;
  return dueAt ? copy.stageWhen.by(copy.date(new Date(dueAt))) : copy.stageWhen.beforeDeparture;
}

/** The language the guest booked in, saved with the request. Older bookings have none and read English. */
function bookingLocale(booking: object): PublicLocale {
  const stored = (booking as { locale?: unknown }).locale;
  return PUBLIC_LOCALES.find(locale => locale === stored) ?? "en";
}

type LoadedBooking = Awaited<ReturnType<typeof loadBooking>>;

/** Everything a guest email shows about a booking, including its code, tracking link and payment plan. */
export function buildBookingMailDetails(booking: LoadedBooking, token: string, locale: PublicLocale): BookingEmailDetails | null {
  const copy = EMAIL_COPY[locale];
  const money = (cents: number) => emailMoney(cents, locale);
  const base = buildEmailDetailsFromConfirmBooking({
    ...booking,
    locale,
    bookingTickets: [],
    bookingUrl: `${BOOKING_MAIL_ORIGIN}${localizedHref(`/booking/success?bookingId=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(token)}`, locale)}`,
  });
  if (!base) return null;

  const paid = netPaid(booking.payments);
  // What the guest owes: the cabin quote plus the card surcharge snapshotted with the request.
  const surcharge = booking.cardSurchargeCents ?? 0;
  const total = (booking.totalPriceCents ?? 0) + surcharge;
  const plan = paymentPlan(booking.paymentSchedule, paid);
  const dueIndex = plan.findIndex(stage => stage.state === "due");
  const next = dueIndex >= 0 ? plan[dueIndex + 1] : undefined;
  const details: BookingEmailDetails = {
    ...base,
    bookingCode: bookingCode(booking.id),
    adminUrl: `${BOOKING_MAIL_ORIGIN}/admin/bookings/${encodeURIComponent(booking.id)}`,
    roomType: booking.bookingRooms
      .map(line => `${line.room.roomType ?? line.room.name} (${copy.roomGuests(line.adults + line.children)})`)
      .join(", ") || base.roomType,
    totalPrice: money(total),
    cardSurcharge: surcharge > 0 ? copy.cardSurcharge(money(surcharge), CARD_SURCHARGE_PERCENT) : undefined,
    amountPaid: paid > 0 ? money(paid) : undefined,
    balanceDue: money(Math.max(0, total - paid)),
    remainingAfterDue: next
      ? { amount: money(Math.max(0, total - plan[dueIndex]!.cumulativeCents)), when: stageWhen(next.milestone, next.dueAt, next.state, locale) }
      : undefined,
    paymentPlan: plan.map(stage => ({
      title: copy.stageTitle(stage.milestone, plan.length),
      when: stageWhen(stage.milestone, stage.dueAt, stage.state, locale),
      amount: money(stage.amountCents),
      percent: total > 0 ? Math.round((stage.amountCents / total) * 100) : undefined,
      state: stage.state,
    })),
  };
  return details;
}

/** A booking's guest-email details, in the language it was requested in unless one is given. */
export async function bookingMailDetails(id: string, accessToken?: string, locale?: PublicLocale) {
  const booking = await loadBooking(id);
  const details = buildBookingMailDetails(booking, accessToken ?? createBookingAccessToken(booking.id), locale ?? bookingLocale(booking));
  return details ? { booking, details } : null;
}

async function deliver(id: string, send: (details: BookingEmailDetails) => Promise<void>): Promise<MailResult> {
  try {
    const loaded = await bookingMailDetails(id);
    if (!loaded) return { sent: false, to: null, error: "This booking has no guest email address." };
    await send(loaded.details);
    return { sent: true, to: loaded.details.guestEmail };
  } catch {
    console.error("[booking-mail] send failed");
    return { sent: false, to: null, error: "The email could not be sent. Please try again." };
  }
}

/** The invoice: the amount due now (worked out from the plan), the team's payment link and any note. */
export function sendInvoice(id: string, invoice: { paymentLink?: string; instructions?: string }, attachments: ResendAttachment[] = []) {
  return deliver(id, details => sendBookingInvoiceEmail(details.guestEmail, details.guestName, details, invoice, attachments));
}

export function sendConfirmation(id: string, attachments: ResendAttachment[] = []) {
  return deliver(id, details => sendBookingConfirmedEmail(details.guestEmail, details.guestName, details, attachments));
}

export function paymentReceiptMessage(payment: { amountCents: number; reference: string; kind: "RECEIPT" | "REFUND"; receivedAt: Date }, locale: PublicLocale = "en"): string {
  const copy = EMAIL_COPY[locale];
  return copy.receipt.message({
    refund: payment.kind === "REFUND",
    amount: emailMoney(payment.amountCents, locale),
    date: copy.date(payment.receivedAt),
    reference: payment.reference,
  });
}

export function sendPaymentReceipt(id: string, payment: Parameters<typeof paymentReceiptMessage>[0], recordedBySession?: string, attachments: ResendAttachment[] = []) {
  return deliver(id, details => {
    const subject = EMAIL_COPY[details.locale ?? "en"].receipt.subject(payment.kind === "REFUND", bookingCode(id));
    return sendBookingMessageEmail(details.guestEmail, details.guestName, { ...details, recordedBySession }, paymentReceiptMessage(payment, details.locale), subject, attachments);
  });
}

export function sendDeclined(id: string, message?: string) {
  return deliver(id, details => sendBookingDeclinedEmail(details.guestEmail, details.guestName, details, message));
}

export function sendTeamReply(id: string, message: string, subject?: string, recordedBySession?: string, attachments: ResendAttachment[] = []) {
  return deliver(id, details => sendBookingMessageEmail(details.guestEmail, details.guestName, { ...details, recordedBySession }, message, subject, attachments));
}

const GUEST_LANGUAGE_NAMES: Record<PublicLocale, string> = { en: "English", it: "Italian" };

/**
 * Saved for the emails the team sends later (invoice, confirmation, decline).
 * English stays NULL. A failed save must not cost the guest their receipt: this
 * email still goes out in the right language, and later ones fall back to English.
 */
async function rememberBookingLocale(id: string, locale: PublicLocale) {
  try {
    await bookingQuery(`UPDATE "Booking" SET "locale" = $2 WHERE id = $1`, [id, locale]);
  } catch {
    console.error("[booking] guest language could not be saved");
  }
}

/** The request emails (guest copy with its code, team alert), recording each outcome on the booking. */
export async function sendRequestEmails(id: string, accessToken: string, locale: PublicLocale = "en") {
  if (locale !== "en") await rememberBookingLocale(id, locale);
  const loaded = await bookingMailDetails(id, accessToken, locale);
  if (!loaded) return;
  // The team always reads English; only the guest's copy follows the guest's language.
  const teamDetails = locale === "en" ? loaded.details : {
    ...buildBookingMailDetails(loaded.booking, accessToken, "en")!,
    guestLanguage: GUEST_LANGUAGE_NAMES[locale],
  };
  for (const recipient of ["guest", "admin"] as const) {
    let status = "SENT";
    try {
      if (recipient === "guest") await sendBookingReceivedEmail(loaded.details.guestEmail, loaded.details.guestName, loaded.details);
      else await sendAdminAlertEmail(teamDetails);
    } catch {
      status = "FAILED";
      console.error("[booking] request notification failed", recipient);
    }
    await bookingQuery(
      recipient === "guest" ? `UPDATE "Booking" SET "guestEmailStatus" = $2 WHERE id = $1` : `UPDATE "Booking" SET "adminEmailStatus" = $2 WHERE id = $1`,
      [id, status],
    );
  }
}
