import { format } from "date-fns";
import { parseBookingCustomerName } from "@/lib/booking-guest-details";
import type { BookingEmailDetails } from "@/lib/email-types";
import { formatPrice } from "@/lib/client-dates";
import { BOOKING_COPY } from "@/lib/i18n/booking-copy";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { CheckoutBooking } from "@/lib/validations";

/** An amount as the guest's language writes it; every price is in USD. */
export function emailMoney(cents: number, locale: PublicLocale = "en"): string {
  return locale === "en" ? formatPrice(cents) : BOOKING_COPY[locale].money(cents);
}

export function parseGuestFromCustomerName(customerName: string) {
  const parsed = parseBookingCustomerName(customerName);
  return {
    guestName: parsed.guestName,
    guestPhone: parsed.guestPhone ?? undefined,
    guests:
      parsed.partyLabel !== "—" ? parsed.partyLabel : "Not specified",
  };
}

export function buildCheckoutEmailDetails(input: {
  bookingId: string;
  checkout: CheckoutBooking;
  cruiseName: string;
  departureTime: Date;
  arrivalTime: Date;
  roomLabel: string;
  totalPriceCents: number;
}): BookingEmailDetails {
  const guests = `${input.checkout.adults} adult${input.checkout.adults === 1 ? "" : "s"}, ${input.checkout.children} child${input.checkout.children === 1 ? "" : "ren"}`;

  return {
    bookingId: input.bookingId,
    guestName: input.checkout.fullName.trim(),
    guestEmail: input.checkout.email.trim(),
    guestPhone: input.checkout.phone.trim(),
    cruiseName: input.cruiseName,
    checkInDate: format(input.departureTime, "MMMM d, yyyy"),
    checkOutDate: format(input.arrivalTime, "MMMM d, yyyy"),
    roomType: input.roomLabel,
    guests,
    totalPrice: formatPrice(input.totalPriceCents),
  };
}

export function buildEmailDetailsFromConfirmBooking(booking: {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  adultCount: number | null;
  childCount: number | null;
  specialRequests: string | null;
  cruiseSchedule: {
    departureTime: Date;
    arrivalTime: Date;
    cruise: { name: string };
  };
  bookingRooms: {
    room: { name: string; roomType: string | null };
  }[];
  bookingTickets: {
    quantity: number;
    unitPriceCents: number | null;
    ticketType: { priceCents: number };
  }[];
  totalPriceCents: number | null;
  bookingUrl: string;
  paymentMethod?: string | null;
  locale?: PublicLocale;
}): BookingEmailDetails | null {
  const email = booking.customerEmail?.trim();
  if (!email) return null;

  const locale = booking.locale ?? "en";
  const copy = EMAIL_COPY[locale];
  const parsed = parseGuestFromCustomerName(booking.customerName ?? copy.guestFallback);
  const roomLabel = booking.bookingRooms.map(r => r.room.roomType ?? r.room.name).join(", ");
  const ticketFallbackCents = booking.bookingTickets.reduce(
    (sum, ticket) =>
      sum +
      ticket.quantity *
        (ticket.unitPriceCents ?? ticket.ticketType.priceCents),
    0,
  );
  const totalPriceCents = booking.totalPriceCents ?? ticketFallbackCents;

  return {
    ...(locale === "en" ? {} : { locale }),
    bookingId: booking.id,
    guestName: parsed.guestName,
    guestEmail: email,
    guestPhone: booking.customerPhone ?? parsed.guestPhone,
    cruiseName: copy.cruiseName(booking.cruiseSchedule.cruise.name),
    checkInDate: copy.date(booking.cruiseSchedule.departureTime),
    checkOutDate: copy.date(booking.cruiseSchedule.arrivalTime),
    roomType: roomLabel,
    guests:
      booking.adultCount !== null && booking.childCount !== null
        ? copy.party(booking.adultCount, booking.childCount)
        : locale === "en" ? parsed.guests : copy.notSpecified,
    totalPrice: emailMoney(totalPriceCents, locale),
    ratePlan: copy.ratePlan,
    specialRequests: booking.specialRequests ?? undefined,
    bookingUrl: booking.bookingUrl,
    paymentMethod: copy.paymentMethod(booking.paymentMethod === "BANK_TRANSFER"),
  };
}
