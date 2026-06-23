import type { Prisma } from "@/app/generated/prisma/client";
import { bookingListSelect } from "@/lib/query-selects";

export type AdminBookingRecord = Prisma.BookingGetPayload<{
  select: typeof bookingListSelect;
}>;

export type AdminBookingDto = {
  id: string;
  customerName: string;
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

function computeTotalCents(
  tickets: {
    quantity: number;
    ticketType: { priceCents: number };
  }[],
) {
  return tickets.reduce(
    (sum, ticket) => sum + ticket.quantity * ticket.ticketType.priceCents,
    0,
  );
}

export function serializeAdminBooking(
  booking: AdminBookingRecord,
): AdminBookingDto {
  const departureTime = booking.cruiseSchedule.departureTime.toISOString();
  const arrivalTime = booking.cruiseSchedule.arrivalTime.toISOString();

  return {
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
    totalPriceCents: computeTotalCents(booking.bookingTickets),
    createdAt: booking.createdAt.toISOString(),
    deletedAt: booking.deletedAt?.toISOString() ?? null,
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
