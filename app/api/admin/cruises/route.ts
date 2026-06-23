import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  archivedCruiseSlug,
  purgeCruiseIfAllowed,
  restoredCruiseSlug,
} from "@/lib/catalog-bin";
import { logDbError, withDb } from "@/lib/db-safe";
import { withDbRetry } from "@/lib/db-retry";
import { prisma } from "@/lib/prisma";
import { buildCruiseListSelect, roomAdminSelect } from "@/lib/query-selects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isSlugUniqueViolation(error: unknown): boolean {
  const prismaError = error as { code?: string; meta?: { target?: string[] } };
  return (
    prismaError.code === "P2002" &&
    Array.isArray(prismaError.meta?.target) &&
    prismaError.meta.target.includes("slug")
  );
}

function serializeCruise(
  cruise: Prisma.CruiseGetPayload<{
    select: ReturnType<typeof buildCruiseListSelect>;
  }>,
) {
  return {
    ...cruise,
    deletedAt: cruise.deletedAt?.toISOString() ?? null,
    rooms: cruise.rooms.map((room) => ({
      ...room,
      deletedAt: room.deletedAt?.toISOString() ?? null,
    })),
  };
}

function serializeOrphanRoom(
  room: Prisma.RoomGetPayload<{
    select: typeof roomAdminSelect & {
      cruise: { select: { id: true; name: true } };
    };
  }>,
) {
  return {
    id: room.id,
    name: room.name,
    roomNumber: room.roomNumber,
    roomType: room.roomType,
    priceMultiplier: room.priceMultiplier,
    capacity: room.capacity,
    description: room.description,
    deletedAt: room.deletedAt?.toISOString() ?? null,
    cruise: room.cruise,
  };
}

export async function GET(request: NextRequest) {
  try {
    const bin = new URL(request.url).searchParams.get("bin") === "true";
    const select = buildCruiseListSelect({ bin });

    const [cruises, deletedRooms] = await Promise.all([
      withDb(() =>
        prisma.cruise.findMany({
          where: { deletedAt: bin ? { not: null } : null },
          orderBy: bin ? { deletedAt: "desc" } : { name: "asc" },
          select,
        }),
      ),
      bin
        ? withDb(() =>
            prisma.room.findMany({
              where: {
                deletedAt: { not: null },
                cruise: { deletedAt: null },
              },
              orderBy: { deletedAt: "desc" },
              select: {
                ...roomAdminSelect,
                cruise: { select: { id: true, name: true } },
              },
            }),
          )
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      cruises: cruises.map(serializeCruise),
      deletedRooms: deletedRooms.map(serializeOrphanRoom),
    });
  } catch (error) {
    logDbError("admin.cruises.GET", error);
    return NextResponse.json(
      {
        error: "Could not load cruises.",
        cruises: [],
        deletedRooms: [],
      },
      { status: 503 },
    );
  }
}

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
      const now = new Date();
      let updated = 0;

      const cruises = await prisma.cruise.findMany({
        where: { id: { in: body.ids }, deletedAt: null },
        select: { id: true, slug: true },
      });

      for (const cruise of cruises) {
        await withDbRetry(async () => {
          await prisma.cruise.update({
            where: { id: cruise.id },
            data: {
              deletedAt: now,
              slug: archivedCruiseSlug(cruise.slug, cruise.id),
            },
          });
          await prisma.room.updateMany({
            where: { cruiseId: cruise.id, deletedAt: null },
            data: { deletedAt: now },
          });
        });

        updated += 1;
      }

      return NextResponse.json({ updated });
    }

    if (body.action === "restore") {
      let updated = 0;

      const cruises = await prisma.cruise.findMany({
        where: { id: { in: body.ids }, deletedAt: { not: null } },
        select: { id: true, slug: true },
      });

      for (const cruise of cruises) {
        const targetSlug = restoredCruiseSlug(cruise.slug, cruise.id);
        const slugTaken = await prisma.cruise.findFirst({
          where: {
            slug: targetSlug,
            id: { not: cruise.id },
            deletedAt: null,
          },
          select: { id: true },
        });

        if (slugTaken) {
          return NextResponse.json(
            {
              error: `Cannot restore cruise: slug "${targetSlug}" is already in use`,
            },
            { status: 409 },
          );
        }

        await withDbRetry(async () => {
          await prisma.cruise.update({
            where: { id: cruise.id },
            data: { deletedAt: null, slug: targetSlug },
          });
          await prisma.room.updateMany({
            where: { cruiseId: cruise.id, deletedAt: { not: null } },
            data: { deletedAt: null },
          });
        });

        updated += 1;
      }

      return NextResponse.json({ updated });
    }

    if (body.action === "purge") {
      let deleted = 0;
      let skipped = 0;

      for (const id of body.ids) {
        const cruise = await prisma.cruise.findFirst({
          where: { id, deletedAt: { not: null } },
          select: { id: true },
        });

        if (!cruise) continue;

        const purged = await purgeCruiseIfAllowed(id);
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

export async function POST(request: NextRequest) {
  console.log("=== CREATE CRUISE DEBUG ===");
  console.log("Request received");

  let body: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string | null;
    basePriceCents?: number;
    ports?: string;
  };

  try {
    body = await request.json();
  } catch (parseError) {
    console.error("Failed to parse request JSON:", parseError);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log("Body:", JSON.stringify(body, null, 2));

  const requiredFields = ["name"] as const;
  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missingFields.length > 0) {
    console.error("Missing fields:", missingFields);
    return NextResponse.json(
      { error: "Missing required fields", fields: missingFields },
      { status: 400 },
    );
  }

  const name = body.name!.trim();

  const clientSlug = body.slug?.trim()
    ? body.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

  const baseSlug =
    clientSlug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    `cruise-${Date.now()}`;

  console.log("Client slug:", body.slug ?? "(not provided)");
  console.log("Base slug resolved:", baseSlug);

  const cruiseData = {
    name,
    description: body.description?.trim() || null,
    imageUrl: body.imageUrl?.trim() || null,
    basePriceCents: Number(body.basePriceCents) || 0,
    ports: body.ports?.trim() || null,
  };

  try {
    console.log(
      "Attempting to create cruise in database...",
      JSON.stringify({ ...cruiseData, slug: baseSlug }, null, 2),
    );

    let lastError: unknown;

    for (let suffix = 0; suffix < 20; suffix += 1) {
      const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`;

      try {
        const cruise = await prisma.cruise.create({
          data: {
            ...cruiseData,
            slug,
            ticketTypes: {
              create: {
                name: "Standard",
                description: "Standard cabin fare",
                priceCents: cruiseData.basePriceCents,
              },
            },
          },
          select: buildCruiseListSelect({ bin: false }),
        });

        console.log("Cruise created successfully:", cruise);
        return NextResponse.json(
          { cruise: serializeCruise(cruise) },
          { status: 201 },
        );
      } catch (error) {
        lastError = error;
        if (isSlugUniqueViolation(error) && suffix < 19) {
          console.log("Slug taken, retrying with:", `${baseSlug}-${suffix + 1}`);
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new Error("Could not generate a unique slug");
  } catch (error: unknown) {
    console.error("=== DATABASE ERROR ===");
    const prismaError = error as {
      code?: string;
      message?: string;
      meta?: unknown;
    };
    console.error("Error code:", prismaError.code);
    console.error("Error message:", prismaError.message);
    console.error("Full error:", error);
    console.error("Error meta:", prismaError.meta);

    return NextResponse.json(
      {
        error: "Failed to create cruise",
        message: prismaError.message ?? String(error),
        code: prismaError.code,
        meta: prismaError.meta,
      },
      { status: 500 },
    );
  }
}
