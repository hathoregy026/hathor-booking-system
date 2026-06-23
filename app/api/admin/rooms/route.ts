import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { purgeRoomIfAllowed } from "@/lib/catalog-bin";
import { prisma } from "@/lib/prisma";
import { roomAdminSelect } from "@/lib/query-selects";

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ids?: string[];
      action?: "soft-delete" | "restore" | "purge";
    };

    if (!body.action || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "Action and ids are required" },
        { status: 400 },
      );
    }

    if (body.action === "soft-delete") {
      const result = await prisma.room.updateMany({
        where: {
          id: { in: body.ids },
          deletedAt: null,
          cruise: { deletedAt: null },
        },
        data: { deletedAt: new Date() },
      });

      return NextResponse.json({ updated: result.count });
    }

    if (body.action === "restore") {
      const result = await prisma.room.updateMany({
        where: {
          id: { in: body.ids },
          deletedAt: { not: null },
          cruise: { deletedAt: null },
        },
        data: { deletedAt: null },
      });

      return NextResponse.json({ updated: result.count });
    }

    if (body.action === "purge") {
      let deleted = 0;
      let skipped = 0;

      for (const id of body.ids) {
        const room = await prisma.room.findFirst({
          where: { id, deletedAt: { not: null } },
          select: { id: true },
        });

        if (!room) continue;

        const purged = await purgeRoomIfAllowed(id);
        if (purged) deleted += 1;
        else skipped += 1;
      }

      return NextResponse.json({ deleted, skipped });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error);
  }
}
