import type { Prisma } from "@/app/generated/prisma/client";
import { parseBookingCustomerName } from "@/lib/booking-guest-details";
import { bookingListSelect } from "@/lib/query-selects";

export type AdminBookingRecord = Prisma.BookingGetPayload<{
  select: typeof bookingListSelect;
}>;

export type AdminBookingDto = {
  id: string;
  customerName: string;
  guestName: string;
  guestPhone: string | null;
  partyLabel: string;
  partySize: number | null;
  specialRequests: string | null;
  customerEmail: string;
  status: string;
  cruiseName: string;
  checkInDate: string;
  checkOutDate: string;
  departureTime: string;
  arrivalTime: string;
  rooms: string[];
  roomTypes: string[];
  totalPriceCents: number;
  createdAt: string;
  deletedAt: string | null;
};

function withParsedGuest<T extends { customerName: string }>(
  row: T,
): T & {
  guestName: string;
  guestPhone: string | null;
  partyLabel: string;
  partySize: number | null;
  specialRequests: string | null;
} {
  const parsed = parseBookingCustomerName(row.customerName);
  return {
    ...row,
    guestName: parsed.guestName,
    guestPhone: parsed.guestPhone,
    partyLabel: parsed.partyLabel,
    partySize: parsed.partySize,
    specialRequests: parsed.specialRequests,
  };
}

function computeTotalCents(
  bookingTotalPriceCents: number | null,
  rooms: { unitPriceCents: number | null }[],
  tickets: {
    quantity: number;
    unitPriceCents: number | null;
    ticketType: { priceCents: number };
  }[],
) {
  if (bookingTotalPriceCents !== null) return bookingTotalPriceCents;
  const roomTotal = rooms.reduce(
    (sum, room) => sum + (room.unitPriceCents ?? 0),
    0,
  );
  if (roomTotal > 0) return roomTotal;
  return tickets.reduce(
    (sum, ticket) =>
      sum +
      ticket.quantity *
        (ticket.unitPriceCents ?? ticket.ticketType.priceCents),
    0,
  );
}

export function serializeAdminBooking(
  booking: AdminBookingRecord,
): AdminBookingDto {
  const departureTime = booking.cruiseSchedule.departureTime.toISOString();
  const arrivalTime = booking.cruiseSchedule.arrivalTime.toISOString();

  const legacy = withParsedGuest({
    id: booking.id,
    customerName: booking.customerName ?? "—",
    customerEmail: booking.customerEmail ?? "—",
    status: booking.status,
    cruiseName: booking.cruiseSchedule.cruise.name,
    checkInDate: departureTime,
    checkOutDate: arrivalTime,
    departureTime,
    arrivalTime,
    rooms: booking.bookingRooms.map((entry) => entry.room.name),
    roomTypes: booking.bookingRooms.map(
      (entry) => entry.room.roomType ?? entry.room.name,
    ),
    totalPriceCents: computeTotalCents(
      booking.totalPriceCents,
      booking.bookingRooms,
      booking.bookingTickets,
    ),
    createdAt: booking.createdAt.toISOString(),
    deletedAt: booking.deletedAt?.toISOString() ?? null,
  });
  const adults = booking.adultCount;
  const children = booking.childCount;
  return {
    ...legacy,
    guestPhone: booking.customerPhone ?? legacy.guestPhone,
    partyLabel:
      adults !== null && children !== null
        ? `${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"}`
        : legacy.partyLabel,
    partySize:
      adults !== null && children !== null ? adults + children : legacy.partySize,
    specialRequests: booking.specialRequests ?? legacy.specialRequests,
  };
}

/** True for checkout pending state (`PENDING` or legacy `PENDING_HOLD`). */
export function isPendingBookingStatus(status: string): boolean {
  const upper = status.toUpperCase();
  return upper === "PENDING" || upper === "PENDING_HOLD";
}

/** API accepts PENDING as alias for PENDING_HOLD (checkout pending state). */
export function normalizeAdminBookingStatus(
  value: string,
): "PENDING_HOLD" | "CONFIRMED" | "CANCELLED" | null {
  const upper = value.toUpperCase();
  if (isPendingBookingStatus(upper)) return "PENDING_HOLD";
  if (upper === "CONFIRMED") return "CONFIRMED";
  if (upper === "CANCELLED") return "CANCELLED";
  return null;
}

export function displayBookingStatus(status: string): string {
  if (isPendingBookingStatus(status)) return "Pending";
  return status.replace(/_/g, " ");
}
