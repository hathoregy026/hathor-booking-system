import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { handleRouteError } from "@/lib/api";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { prisma } from "@/lib/prisma";
import { PublicRequestError, readPublicJsonBody } from "@/lib/public-api-security";
import { revalidatePublicCatalog } from "@/lib/revalidate-public-catalog";
import { loadShipExperience, SHIP_EXPERIENCE_KEY } from "@/lib/ship-experience";
import { SHIP_ROOM_IDS, shipExperienceSchema } from "@/lib/ship-experience-shared";
import { PHYSICAL_ROOM_TYPES, roomCapacity } from "@/lib/physical-inventory";

export const dynamic = "force-dynamic";

const roomEditSchema = z.object({
  id: z.enum(SHIP_ROOM_IDS),
  name: z.string().trim().min(2).max(80),
  roomNumber: z.string().trim().min(1).max(20),
  roomType: z.enum(PHYSICAL_ROOM_TYPES),
  description: z.string().trim().max(600),
}).strict();

const saveSchema = z.object({
  config: shipExperienceSchema,
  rooms: z.array(roomEditSchema).length(12),
}).strict().superRefine((value, context) => {
  if (new Set(value.rooms.map(room => room.id)).size !== SHIP_ROOM_IDS.length) {
    context.addIssue({ code: "custom", path: ["rooms"], message: "Every physical room must appear once" });
  }
  if (new Set(value.rooms.map(room => room.roomNumber.toLowerCase())).size !== SHIP_ROOM_IDS.length) {
    context.addIssue({ code: "custom", path: ["rooms"], message: "Room numbers must be unique" });
  }
});

export async function GET(request: NextRequest) {
  try {
    if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await loadShipExperience(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const input = saveSchema.parse(await readPublicJsonBody(request));
    await prisma.$transaction(async tx => {
      const existing = await tx.room.findMany({
        where: { id: { in: [...SHIP_ROOM_IDS] }, deletedAt: null },
        select: { id: true, roomType: true, voyages: { select: { id: true } } },
      });
      if (existing.length !== SHIP_ROOM_IDS.length) throw new PublicRequestError("Physical cabin inventory is incomplete. Please check the room catalog before saving.", 409);
      const byId = new Map(existing.map(room => [room.id, room]));
      for (const edit of input.rooms) {
        const current = byId.get(edit.id)!;
        if (current.roomType !== edit.roomType) {
          const [hasBooking, rates] = await Promise.all([
            tx.bookingRoom.count({ where: { roomId: edit.id } }),
            tx.ticketType.count({ where: { cruiseId: { in: current.voyages.map(voyage => voyage.id) }, roomType: edit.roomType } }),
          ]);
          if (hasBooking) throw new PublicRequestError(`Cabin ${edit.id} has booking history; its booking type cannot be changed.`, 409);
          if (rates !== current.voyages.length) throw new PublicRequestError(`A rate for ${edit.roomType} is missing on a voyage using cabin ${edit.id}.`, 409);
        }
        await tx.room.update({
          where: { id: edit.id },
          data: {
            name: edit.name,
            roomNumber: edit.roomNumber,
            roomType: edit.roomType,
            description: edit.description || null,
            capacity: roomCapacity(edit.roomType),
          },
        });
      }
      await tx.siteSetting.upsert({
        where: { key: SHIP_EXPERIENCE_KEY },
        create: { key: SHIP_EXPERIENCE_KEY, value: JSON.stringify(input.config) },
        update: { value: JSON.stringify(input.config) },
      });
    });
    revalidatePublicCatalog();
    revalidatePath("/");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error);
  }
}
