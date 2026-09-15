import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { lockVessel, expireHolds } from "@/lib/booking-engine";
import { InvalidBookingError } from "@/lib/booking";
import { readPublicJsonBody, requireIdempotencyKey } from "@/lib/public-api-security";
import { handleRouteError } from "@/lib/api";
const blockSchema = z.object({
  cruiseScheduleId: z.string().min(1).max(128),
  state: z.enum(["MANUAL_BLOCK","MAINTENANCE","CHARTER_BLOCK"]),
  roomIds: z.array(z.string().regex(/^(K0[1-6]|T0[12]|S0[12]|R0[12])$/)).min(1).max(12).optional(),
  reason: z.string().trim().min(1).max(500),
}).strict();
export async function POST(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const blockKey = requireIdempotencyKey(request);
    const input = blockSchema.parse(await readPublicJsonBody(request));
    const result = await prisma.$transaction(async tx => {
      await lockVessel(tx); await expireHolds(tx);
      const sailing = await tx.cruiseSchedule.findFirst({ where: { id: input.cruiseScheduleId, isBookable: true, cruise: { deletedAt: null } } });
      if (!sailing) throw new InvalidBookingError("Choose an existing valid sailing.");
      const rooms = await tx.room.findMany({ where: { voyages: { some: { id: sailing.cruiseId } }, ...(input.state === "CHARTER_BLOCK" ? {} : { id: { in: input.roomIds ?? [] } }) }, orderBy: { id: "asc" } });
      if (!rooms.length || (input.state === "CHARTER_BLOCK" && rooms.length !== 12)) throw new InvalidBookingError("Invalid physical inventory.");
      const existing = await tx.inventoryAllocation.findMany({ where: { blockKey }, orderBy: { roomId: "asc" } });
      if (existing.length) {
        if (existing.length !== rooms.length || existing.some((a,i) => a.roomId !== rooms[i].id || a.state !== input.state || a.startsAt.getTime() !== sailing.departureTime.getTime() || a.endsAt.getTime() !== sailing.arrivalTime.getTime() || a.reason !== input.reason)) throw new InvalidBookingError("Block key belongs to a different operation.");
        return existing;
      }
      await tx.inventoryAllocation.createMany({ data: rooms.map(r => ({ roomId: r.id, startsAt: sailing.departureTime, endsAt: sailing.arrivalTime, state: input.state, blockKey, reason: input.reason })) });
      return tx.inventoryAllocation.findMany({ where: { blockKey } });
    });
    return NextResponse.json({ allocations: result });
  } catch (error) { return handleRouteError(error); }
}
export async function DELETE(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const { blockKey } = z.object({ blockKey: z.string().min(16).max(128) }).strict().parse(await readPublicJsonBody(request));
    const result = await prisma.$transaction(async tx => {
      await lockVessel(tx);
      return tx.inventoryAllocation.updateMany({ where: { blockKey, bookingRoomId: null }, data: { active: false } });
    });
    return NextResponse.json({ released: result.count });
  } catch (error) { return handleRouteError(error); }
}
