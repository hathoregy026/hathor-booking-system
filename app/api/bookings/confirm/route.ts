import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import { BookingConflictError, InvalidBookingError } from "@/lib/booking";
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

async function resolveTicketLines(
  cruiseId: string,
  roomCount: number,
  tickets: TicketInput[],
): Promise<TicketInput[]> {
  const [defaultType, cruiseTicketTypes] = await Promise.all([
    ensureDefaultTicketType(cruiseId),
    prisma.ticketType.findMany({
      where: { cruiseId },
      select: { id: true },
    }),
  ]);

  const validIds = new Set(cruiseTicketTypes.map((ticket) => ticket.id));
  const aggregated = new Map<string, number>();

  for (const ticket of tickets) {
    const ticketTypeId = validIds.has(ticket.ticketTypeId)
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
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = confirmBookingSchema.parse(body);

    const confirmedBooking = await withDb(async () => {
        const booking = await prisma.booking.findUnique({
          where: { id: parsed.bookingId },
          select: {
            id: true,
            status: true,
            holdExpiresAt: true,
            cruiseScheduleId: true,
            cruiseSchedule: {
              select: { cruiseId: true },
            },
          },
        });

        if (!booking || booking.status !== BookingStatus.PENDING_HOLD) {
          throw new InvalidBookingError();
        }

        if (booking.holdExpiresAt && booking.holdExpiresAt <= utcNow()) {
          await prisma.booking.update({
            where: { id: parsed.bookingId },
            data: { status: BookingStatus.EXPIRED },
          });
          throw new BookingConflictError("Hold has expired");
        }

        const [overlap, rooms] = await Promise.all([
          prisma.bookingRoom.findFirst({
            where: {
              roomId: { in: parsed.roomIds },
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
          }),
          prisma.room.findMany({
            where: { id: { in: parsed.roomIds } },
            select: { id: true },
          }),
        ]);

        if (overlap) {
          throw new BookingConflictError();
        }

        if (rooms.length !== parsed.roomIds.length) {
          throw new InvalidBookingError("One or more rooms are invalid");
        }

        await prisma.bookingRoom.createMany({
          data: parsed.roomIds.map((roomId) => ({
            bookingId: parsed.bookingId,
            roomId,
            cruiseScheduleId: booking.cruiseScheduleId,
          })),
        });

        const ticketLines = await resolveTicketLines(
          booking.cruiseSchedule.cruiseId,
          parsed.roomIds.length,
          parsed.tickets,
        );

        await prisma.bookingTicket.createMany({
          data: ticketLines.map((ticket) => ({
            bookingId: parsed.bookingId,
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity,
          })),
        });

        return prisma.booking.update({
          where: { id: parsed.bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            customerName: parsed.customerName,
            customerEmail: parsed.customerEmail,
            holdExpiresAt: null,
          },
          include: {
            bookingRooms: {
              select: {
                room: { select: { name: true, roomType: true } },
              },
            },
            bookingTickets: {
              select: {
                quantity: true,
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
    });

    const emailDetails = buildEmailDetailsFromConfirmBooking({
      id: confirmedBooking.id,
      customerName: confirmedBooking.customerName,
      customerEmail: confirmedBooking.customerEmail,
      cruiseSchedule: confirmedBooking.cruiseSchedule,
      bookingRooms: confirmedBooking.bookingRooms,
      bookingTickets: confirmedBooking.bookingTickets,
    });

    if (emailDetails) {
      try {
        console.log(
          "[email] confirm: sending booking confirmed email to",
          emailDetails.guestEmail,
        );
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
