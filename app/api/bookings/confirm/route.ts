import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  InvalidBookingError,
  lockBookingRow,
} from "@/lib/booking";
import {
  UnauthorizedBookingError,
  verifyHoldToken,
} from "@/lib/booking-hold-token";
import { assertHoldBookingRequest } from "@/lib/booking-validation";
import { buildEmailDetailsFromConfirmBooking } from "@/lib/booking-email-details";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import { withDb } from "@/lib/db-safe";
import { utcNow } from "@/lib/dates";
import {
  sendAdminAlertEmail,
  sendBookingConfirmedEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { confirmBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TicketInput = {
  ticketTypeId: string;
  quantity: number;
};

type ResolvedTicketLine = TicketInput & {
  unitPriceCents: number;
};

function roomIdsMatch(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((roomId, index) => roomId === sortedRight[index]);
}

async function resolveTicketLines(
  cruiseId: string,
  roomCount: number,
  tickets: TicketInput[],
): Promise<ResolvedTicketLine[]> {
  const [defaultType, cruiseTicketTypes] = await Promise.all([
    ensureDefaultTicketType(cruiseId),
    prisma.ticketType.findMany({
      where: { cruiseId },
      select: { id: true, priceCents: true },
    }),
  ]);

  const pricesById = new Map(
    cruiseTicketTypes.map((ticket) => [ticket.id, ticket.priceCents]),
  );
  const aggregated = new Map<string, number>();

  for (const ticket of tickets) {
    const ticketTypeId = pricesById.has(ticket.ticketTypeId)
      ? ticket.ticketTypeId
      : defaultType.id;
    aggregated.set(
      ticketTypeId,
      (aggregated.get(ticketTypeId) ?? 0) + ticket.quantity,
    );
  }

  if (aggregated.size === 0) {
    aggregated.set(defaultType.id, Math.max(roomCount, 1));
  }

  return [...aggregated.entries()].map(([ticketTypeId, quantity]) => ({
    ticketTypeId,
    quantity,
    unitPriceCents: pricesById.get(ticketTypeId) ?? defaultType.priceCents,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = confirmBookingSchema.parse(body);

    if (!verifyHoldToken(parsed.bookingId, parsed.holdSecret)) {
      throw new UnauthorizedBookingError();
    }

    const confirmedBooking = await withDb(async () =>
      prisma.$transaction(async (tx) => {
        const booking = await lockBookingRow(tx, parsed.bookingId);

        if (!booking || booking.status !== BookingStatus.PENDING_HOLD) {
          throw new InvalidBookingError();
        }

        if (booking.holdExpiresAt && booking.holdExpiresAt <= utcNow()) {
          await tx.booking.update({
            where: { id: parsed.bookingId },
            data: { status: BookingStatus.EXPIRED },
          });
          throw new BookingConflictError("Hold has expired");
        }

        const heldRooms = await tx.bookingRoom.findMany({
          where: { bookingId: parsed.bookingId },
          select: { roomId: true, unitPriceCents: true },
        });

        const heldRoomIds = heldRooms.map((entry) => entry.roomId);

        if (heldRoomIds.length === 0) {
          throw new InvalidBookingError("Hold has no reserved rooms");
        }

        if (!roomIdsMatch(heldRoomIds, parsed.roomIds)) {
          throw new InvalidBookingError(
            "Room selection does not match the active hold",
          );
        }

        const overlap = await tx.bookingRoom.findFirst({
          where: {
            roomId: { in: heldRoomIds },
            cruiseScheduleId: booking.cruiseScheduleId,
            bookingId: { not: parsed.bookingId },
            booking: {
              deletedAt: null,
              OR: [
                { status: BookingStatus.CONFIRMED },
                {
                  status: BookingStatus.PENDING_HOLD,
                  OR: [
                    { holdExpiresAt: null },
                    { holdExpiresAt: { gt: utcNow() } },
                  ],
                },
              ],
            },
          },
          select: { id: true },
        });

        if (overlap) {
          throw new BookingConflictError();
        }

        const schedule = await tx.cruiseSchedule.findUnique({
          where: { id: booking.cruiseScheduleId },
          select: {
            cruiseId: true,
            departureTime: true,
            arrivalTime: true,
          },
        });

        if (!schedule) {
          throw new InvalidBookingError("Cruise schedule not found");
        }

        await assertHoldBookingRequest(tx, {
          cruiseId: schedule.cruiseId,
          cruiseScheduleId: booking.cruiseScheduleId,
          roomIds: heldRoomIds,
          startDate: schedule.departureTime.toISOString(),
          endDate: schedule.arrivalTime.toISOString(),
          excludeBookingId: parsed.bookingId,
        });

        const ticketLines = await resolveTicketLines(
          schedule.cruiseId,
          heldRoomIds.length,
          parsed.tickets,
        );

        await tx.bookingTicket.deleteMany({
          where: { bookingId: parsed.bookingId },
        });

        await tx.bookingTicket.createMany({
          data: ticketLines.map((ticket) => ({
            bookingId: parsed.bookingId,
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity,
            unitPriceCents: ticket.unitPriceCents,
          })),
        });

        const totalPriceCents = heldRooms.reduce(
          (sum, room) => sum + (room.unitPriceCents ?? 0),
          0,
        );

        return tx.booking.update({
          where: { id: parsed.bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            customerName: parsed.customerName,
            customerEmail: parsed.customerEmail,
            holdExpiresAt: null,
            ...(booking.totalPriceCents === null
              ? {
                  totalPriceCents,
                  currency: "USD",
                  priceSnapshotAt: new Date(),
                }
              : {}),
          },
          include: {
            bookingRooms: {
              select: {
                unitPriceCents: true,
                room: { select: { name: true, roomType: true } },
              },
            },
            bookingTickets: {
              select: {
                quantity: true,
                unitPriceCents: true,
                ticketType: { select: { priceCents: true } },
              },
            },
            cruiseSchedule: {
              select: {
                departureTime: true,
                arrivalTime: true,
                cruise: { select: { name: true } },
              },
            },
          },
        });
      }),
    );

    const emailDetails = buildEmailDetailsFromConfirmBooking({
      id: confirmedBooking.id,
      customerName: confirmedBooking.customerName,
      customerEmail: confirmedBooking.customerEmail,
      cruiseSchedule: confirmedBooking.cruiseSchedule,
      bookingRooms: confirmedBooking.bookingRooms,
      bookingTickets: confirmedBooking.bookingTickets,
      totalPriceCents: confirmedBooking.totalPriceCents,
    });

    if (emailDetails) {
      try {
        console.log("[email] confirm: sending guest booking email");
        await sendBookingConfirmedEmail(
          emailDetails.guestEmail,
          emailDetails.guestName,
          emailDetails,
        );
        console.log("[email] confirm: guest confirmation email sent");
      } catch (emailError) {
        console.error(
          "[email] confirm: guest confirmation email failed:",
          emailError,
        );
      }

      try {
        console.log("[email] confirm: sending admin alert email");
        await sendAdminAlertEmail(emailDetails);
        console.log("[email] confirm: admin alert email sent");
      } catch (emailError) {
        console.error("[email] confirm: admin alert email failed:", emailError);
      }
    } else {
      console.warn(
        "[email] confirm: skipped emails — no guest email on booking",
        confirmedBooking.id,
      );
    }

    return NextResponse.json({
      bookingId: confirmedBooking.id,
      status: confirmedBooking.status,
      customerName: confirmedBooking.customerName,
      customerEmail: confirmedBooking.customerEmail,
      rooms: confirmedBooking.bookingRooms,
      tickets: confirmedBooking.bookingTickets,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
