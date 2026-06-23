import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { roomAdminSelect } from "@/lib/query-selects";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      roomNumber?: string;
      roomType?: string;
      priceMultiplier?: number;
      capacity?: number;
      description?: string;
      action?: "soft-delete" | "restore" | "purge";
    };

    if (body.action) {
      return NextResponse.json(
        { error: "Use PATCH /api/admin/rooms for bulk bin actions" },
        { status: 400 },
      );
    }

    const existing = await prisma.room.findUnique({
      where: { id },
      select: { deletedAt: true, cruise: { select: { deletedAt: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (existing.deletedAt || existing.cruise.deletedAt) {
      return NextResponse.json(
        { error: "Restore room from recycle bin before editing" },
        { status: 400 },
      );
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.roomNumber !== undefined
          ? { roomNumber: body.roomNumber.trim() || null }
          : {}),
        ...(body.roomType !== undefined
          ? { roomType: body.roomType.trim() || null }
          : {}),
        ...(body.priceMultiplier !== undefined
          ? { priceMultiplier: body.priceMultiplier }
          : {}),
        ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
        ...(body.description !== undefined
          ? { description: body.description.trim() || null }
          : {}),
      },
      select: roomAdminSelect,
    });

    return NextResponse.json({
      room: {
        ...room,
        deletedAt: room.deletedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
