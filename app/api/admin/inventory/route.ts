import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { lockVessel, expireHolds } from "@/lib/booking-engine";
import { InvalidBookingError } from "@/lib/booking";
import { readPublicJsonBody, requireIdempotencyKey } from "@/lib/public-api-security";
import { handleRouteError } from "@/lib/api";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
const blockSchema = z.object({
  cruiseScheduleId: z.string().min(1).max(128),
  state: z.enum(["MANUAL_BLOCK","MAINTENANCE","CHARTER_BLOCK"]),
  roomIds: z.array(z.string().regex(/^(K0[1-6]|T0[12]|S0[12]|R0[12])$/)).min(1).max(12).optional(),
  reason: z.string().trim().min(1).max(500),
}).strict();

export async function GET(request: NextRequest) {
  try {
    if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const scheduleId = z.string().min(1).max(128).parse(request.nextUrl.searchParams.get("cruiseScheduleId"));
    const sailing = await prisma.cruiseSchedule.findUnique({
      where: { id: scheduleId }, select: { departureTime: true, arrivalTime: true },
    });
    if (!sailing) return NextResponse.json({ error: "Sailing not found" }, { status: 404 });
    const allocations = await prisma.inventoryAllocation.findMany({
      where: {
        active: true,
        startsAt: { lt: sailing.arrivalTime },
        endsAt: { gt: sailing.departureTime },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { roomId: true, state: true, blockKey: true, reason: true },
    });
    const shipBlockKeys = allocations.filter(allocation => allocation.state === "MANUAL_BLOCK" && allocation.reason === "Ship Explorer" && allocation.blockKey).map(allocation => allocation.blockKey!);
    const sharedBlocks = shipBlockKeys.length ? await prisma.inventoryAllocation.findMany({
      where: { active: true, blockKey: { in: shipBlockKeys } },
      select: { blockKey: true },
    }) : [];
    const blockCounts = new Map<string, number>();
    for (const allocation of sharedBlocks) {
      if (allocation.blockKey) blockCounts.set(allocation.blockKey, (blockCounts.get(allocation.blockKey) ?? 0) + 1);
    }
    return NextResponse.json({ allocations: allocations.map(allocation => ({
      ...allocation,
      releasable: allocation.state === "MANUAL_BLOCK" && allocation.reason === "Ship Explorer" && !!allocation.blockKey && blockCounts.get(allocation.blockKey) === 1,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}
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
