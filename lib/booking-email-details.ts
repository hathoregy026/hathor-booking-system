import { format } from "date-fns";
import type { AdminBookingDto } from "@/lib/admin-bookings";
import type { BookingEmailDetails } from "@/lib/email-types";
import { formatPrice } from "@/lib/client-dates";
import type { CheckoutBooking } from "@/lib/validations";

export function parseGuestFromCustomerName(customerName: string) {
  const lines = customerName.split("\n");
  const guestName = lines[0]?.trim() || "Guest";
  const phoneLine = lines.find((line) => line.startsWith("Phone:"));
  const guestsLine = lines.find((line) => line.startsWith("Guests:"));

  return {
    guestName,
    guestPhone: phoneLine?.replace(/^Phone:\s*/, "").trim(),
    guests:
      guestsLine?.replace(/^Guests:\s*/, "").trim() ?? "Not specified",
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
    ticketType: { priceCents: number };
  }[];
}): BookingEmailDetails | null {
  const email = booking.customerEmail?.trim();
  if (!email) return null;

  const parsed = parseGuestFromCustomerName(booking.customerName ?? "Guest");
  const roomLabel =
    booking.bookingRooms[0]?.room.roomType ??
    booking.bookingRooms[0]?.room.name ??
    "Luxury accommodation";
  const totalPriceCents = booking.bookingTickets.reduce(
    (sum, ticket) => sum + ticket.quantity * ticket.ticketType.priceCents,
    0,
  );

  return {
    bookingId: booking.id,
    guestName: parsed.guestName,
    guestEmail: email,
    guestPhone: parsed.guestPhone,
    cruiseName: booking.cruiseSchedule.cruise.name,
    checkInDate: format(booking.cruiseSchedule.departureTime, "MMMM d, yyyy"),
    checkOutDate: format(booking.cruiseSchedule.arrivalTime, "MMMM d, yyyy"),
    roomType: roomLabel,
    guests: parsed.guests,
    totalPrice: formatPrice(totalPriceCents),
  };
}

export function buildEmailDetailsFromAdminBooking(
  booking: AdminBookingDto,
): BookingEmailDetails | null {
  const email = booking.customerEmail?.trim();
  if (!email || email === "—") return null;

  const parsed = parseGuestFromCustomerName(booking.customerName);

  return {
    bookingId: booking.id,
    guestName: parsed.guestName,
    guestEmail: email,
    guestPhone: parsed.guestPhone,
    cruiseName: booking.cruiseName,
    checkInDate: format(new Date(booking.departureTime), "MMMM d, yyyy"),
    checkOutDate: format(new Date(booking.arrivalTime), "MMMM d, yyyy"),
    roomType:
      booking.roomTypes[0] ?? booking.rooms[0] ?? "Luxury accommodation",
    guests: parsed.guests,
    totalPrice: formatPrice(booking.totalPriceCents),
  };
}
