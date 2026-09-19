import { format } from "date-fns";
import { createBookingAccessToken } from "@/lib/booking-access-token";
import { bookingCode, paymentPlan, stageTitle } from "@/lib/booking-code";
import { buildEmailDetailsFromConfirmBooking } from "@/lib/booking-email-details";
import { getBookingReservation, netPaid } from "@/lib/booking-engine";
import { formatPrice } from "@/lib/client-dates";
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
import { getSiteBaseUrl } from "@/lib/public-url";

export type MailResult = { sent: boolean; to: string | null; error?: string };

/** Read through the booking engine's own connections, which survive the pooler dropping idle ones. */
async function loadBooking(id: string) {
  const booking = await getBookingReservation(id);
  if (!booking) throw new Error("Booking not found");
  return booking;
}

function stageWhen(milestone: string, dueAt: string | null, state: string): string {
  if (state === "paid") return "Received with thanks";
  if (milestone === "INITIAL") return "On receipt of your invoice";
  return dueAt ? `By ${format(new Date(dueAt), "MMMM d, yyyy")}` : "Before departure";
}

/** Everything a guest email shows about a booking, including its code, tracking link and payment plan. */
export async function bookingMailDetails(id: string, accessToken?: string) {
  const booking = await loadBooking(id);
  const token = accessToken ?? createBookingAccessToken(booking.id);
  const base = buildEmailDetailsFromConfirmBooking({
    ...booking,
    bookingTickets: [],
    bookingUrl: `${getSiteBaseUrl()}/booking/success?bookingId=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(token)}`,
  });
  if (!base) return null;

  const paid = netPaid(booking.payments);
  const total = booking.totalPriceCents ?? 0;
  const plan = paymentPlan(booking.paymentSchedule, paid);
  const details: BookingEmailDetails = {
    ...base,
    bookingCode: bookingCode(booking.id),
    adminUrl: `${getSiteBaseUrl()}/admin/bookings/${encodeURIComponent(booking.id)}`,
    roomType: booking.bookingRooms
      .map(line => `${line.room.roomType ?? line.room.name} (${line.adults + line.children} guest${line.adults + line.children === 1 ? "" : "s"})`)
      .join(", ") || base.roomType,
    amountPaid: paid > 0 ? formatPrice(paid) : undefined,
    balanceDue: formatPrice(Math.max(0, total - paid)),
    paymentPlan: plan.map(stage => ({
      title: stageTitle(stage.milestone, plan.length),
      when: stageWhen(stage.milestone, stage.dueAt, stage.state),
      amount: formatPrice(stage.amountCents),
      percent: total > 0 ? Math.round((stage.amountCents / total) * 100) : undefined,
      state: stage.state,
    })),
  };
  return { booking, details };
}

async function deliver(id: string, send: (details: BookingEmailDetails) => Promise<void>): Promise<MailResult> {
  try {
    const loaded = await bookingMailDetails(id);
    if (!loaded) return { sent: false, to: null, error: "This booking has no guest email address." };
    await send(loaded.details);
    return { sent: true, to: loaded.details.guestEmail };
  } catch (error) {
    console.error("[booking-mail] send failed", id, error);
    return { sent: false, to: null, error: error instanceof Error ? error.message : "The email could not be sent." };
  }
}

/** The invoice: the amount due now (worked out from the plan), the team's payment link and any note. */
export function sendInvoice(id: string, invoice: { paymentLink?: string; instructions?: string }) {
  return deliver(id, details => sendBookingInvoiceEmail(details.guestEmail, details.guestName, details, invoice));
}

export function sendConfirmation(id: string) {
  return deliver(id, details => sendBookingConfirmedEmail(details.guestEmail, details.guestName, details));
}

export function sendDeclined(id: string, message?: string) {
  return deliver(id, details => sendBookingDeclinedEmail(details.guestEmail, details.guestName, details, message));
}

export function sendTeamReply(id: string, message: string, subject?: string) {
  return deliver(id, details => sendBookingMessageEmail(details.guestEmail, details.guestName, details, message, subject));
}

/** The request emails (guest copy with its code, team alert), recording each outcome on the booking. */
export async function sendRequestEmails(id: string, accessToken: string) {
  const loaded = await bookingMailDetails(id, accessToken);
  if (!loaded) return;
  for (const recipient of ["guest", "admin"] as const) {
    let status = "SENT";
    try {
      if (recipient === "guest") await sendBookingReceivedEmail(loaded.details.guestEmail, loaded.details.guestName, loaded.details);
      else await sendAdminAlertEmail(loaded.details);
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
