import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const roomSelect = {
  id: true,
  name: true,
  roomNumber: true,
  roomType: true,
  priceMultiplier: true,
  capacity: true,
  description: true,
} as const;

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: cruiseId } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      roomNumber?: string;
      roomType?: string;
      priceMultiplier?: number;
      capacity?: number;
      description?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const roomName = body.name.trim();

    const cruise = await prisma.cruise.findUnique({
      where: { id: cruiseId, deletedAt: null },
      select: { basePriceCents: true },
    });

    if (!cruise) {
      return NextResponse.json({ error: "Cruise not found" }, { status: 404 });
    }

    await ensureDefaultTicketType(cruiseId, cruise.basePriceCents);

    const room = await prisma.room.create({
      data: {
        cruiseId,
        name: roomName,
        roomNumber: body.roomNumber?.trim() || null,
        roomType: body.roomType?.trim() || null,
        priceMultiplier: body.priceMultiplier ?? 1,
        capacity: body.capacity ?? 2,
        description: body.description?.trim() || null,
      },
      select: roomSelect,
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
