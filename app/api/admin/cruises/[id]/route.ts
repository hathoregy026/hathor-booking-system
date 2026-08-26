import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { buildCruiseListSelect } from "@/lib/query-selects";
import { revalidatePublicCatalog } from "@/lib/revalidate-public-catalog";
import { purgeReplacedWebsiteImage } from "@/lib/website-image-storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      imageUrl?: string | null;
      basePriceCents?: number;
      ports?: string;
    };

    const existing = await prisma.cruise.findUnique({
      where: { id },
      select: { deletedAt: true, imageUrl: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cruise not found" }, { status: 404 });
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "Restore cruise from recycle bin before editing" },
        { status: 400 },
      );
    }

    const nextImageUrl =
      body.imageUrl !== undefined ? body.imageUrl?.trim() || null : undefined;
    if (nextImageUrl !== undefined && nextImageUrl !== existing.imageUrl) {
      await purgeReplacedWebsiteImage({
        previousUrl: existing.imageUrl,
        nextUrl: nextImageUrl,
      });
    }

    const cruise = await prisma.cruise.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description.trim() || null }
          : {}),
        ...(body.basePriceCents !== undefined
          ? { basePriceCents: body.basePriceCents }
          : {}),
        ...(body.ports !== undefined
          ? { ports: body.ports.trim() || null }
          : {}),
        ...(body.imageUrl !== undefined
          ? { imageUrl: nextImageUrl }
          : {}),
      },
      select: buildCruiseListSelect({ bin: false }),
    });

    revalidatePublicCatalog();
    return NextResponse.json({
      cruise: {
        ...cruise,
        deletedAt: cruise.deletedAt?.toISOString() ?? null,
        rooms: cruise.rooms.map((room) => ({
          ...room,
          deletedAt: room.deletedAt?.toISOString() ?? null,
        })),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
