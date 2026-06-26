import { HATHOR_AMENITIES, HATHOR_CRUISES } from "@/lib/hathor-catalog";
import {
  findStayDurationOption,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";

export type BookingRoomDetails = {
  roomId: string;
  cruiseId: string;
  title: string;
  meta: string;
  description: string;
  amenities: string[];
  priceCents: number;
  capacity: number;
  roomType: string | null;
  roomName: string;
  cruiseName: string;
  cruiseSlug: string;
  ports: string | null;
  departureDay: string | null;
  nights: number;
  days: number;
  imageUrl: string | null;
};

function formatRouteForTitle(ports: string | null): string {
  if (!ports) return "";
  return ports.replace(/\s*→\s*/g, " / ");
}

export function buildRoomDisplayTitle(
  roomName: string,
  ports: string | null,
): string {
  const route = formatRouteForTitle(ports);
  return route ? `${roomName} : ${route}` : roomName;
}

function parseAmenitiesFromDescription(description: string | null): string[] {
  if (!description) return [];

  const marker = "Amenities:";
  const index = description.indexOf(marker);
  if (index === -1) return [];

  return description
    .slice(index + marker.length)
    .split("\n")
    .map((line) => line.replace(/^•\s*/, "").trim())
    .filter(Boolean);
}

function amenitiesByRoomType(roomType: string | null): string[] {
  const normalized = roomType?.toLowerCase() ?? "";

  if (normalized.includes("royal")) {
    return [...HATHOR_AMENITIES.luxuryRoyalSuites];
  }

  if (normalized.includes("suite")) {
    return [...HATHOR_AMENITIES.luxurySuites];
  }

  return [...HATHOR_AMENITIES.luxuryRooms];
}

function resolveAmenities(input: {
  name: string;
  roomNumber: string | null;
  roomType: string | null;
  description: string | null;
  cruiseSlug: string;
}): string[] {
  const fromDescription = parseAmenitiesFromDescription(input.description);
  if (fromDescription.length > 0) return fromDescription;

  for (const cruise of HATHOR_CRUISES) {
    if (cruise.slug !== input.cruiseSlug) continue;

    const seedRoom = cruise.rooms.find(
      (room) =>
        (input.roomNumber && room.roomNumber === input.roomNumber) ||
        room.name === input.name,
    );

    if (seedRoom) return [...seedRoom.amenities];
  }

  return amenitiesByRoomType(input.roomType);
}

function resolveItineraryMeta(slug: string): {
  nights: number;
  days: number;
  departureDay: string | null;
} {
  const fromCatalog = HATHOR_CRUISES.find((cruise) => cruise.slug === slug);
  if (fromCatalog) {
    return {
      nights: fromCatalog.nights,
      days: fromCatalog.days,
      departureDay: fromCatalog.departureDay,
    };
  }

  const fromDuration = findStayDurationOption(slug as StayDurationValue);
  if (fromDuration) {
    return {
      nights: fromDuration.nights,
      days: fromDuration.nights + 1,
      departureDay: null,
    };
  }

  return { nights: 0, days: 0, departureDay: null };
}

function stripAmenitiesBlock(description: string | null): string {
  if (!description) return "";

  const marker = "\n\nAmenities:";
  const index = description.indexOf(marker);
  if (index === -1) return description.trim();

  return description.slice(0, index).trim();
}

export async function getBookingRoomDetails(
  roomId: string,
): Promise<BookingRoomDetails | null> {
  return withDb(async () => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      deletedAt: null,
      cruise: { deletedAt: null },
    },
    select: {
      id: true,
      name: true,
      roomNumber: true,
      roomType: true,
      capacity: true,
      description: true,
      priceMultiplier: true,
      cruise: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          ports: true,
          basePriceCents: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!room) return null;

  const multiplier = room.priceMultiplier > 0 ? room.priceMultiplier : 1;
  const priceCents = Math.round(room.cruise.basePriceCents * multiplier);
  const { nights, days, departureDay } = resolveItineraryMeta(room.cruise.slug);

  const metaParts = [
    nights > 0 ? `${nights} Nights / ${days} Days` : null,
    departureDay ? `Departs: ${departureDay}` : null,
  ].filter(Boolean);

  return {
    roomId: room.id,
    cruiseId: room.cruise.id,
    title: buildRoomDisplayTitle(room.name, room.cruise.ports),
    meta: metaParts.join(" "),
    description: stripAmenitiesBlock(room.description),
    amenities: resolveAmenities({
      name: room.name,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      description: room.description,
      cruiseSlug: room.cruise.slug,
    }),
    priceCents,
    capacity: room.capacity,
    roomType: room.roomType,
    roomName: room.name,
    cruiseName: room.cruise.name,
    cruiseSlug: room.cruise.slug,
    ports: room.cruise.ports,
    departureDay,
    nights,
    days,
    imageUrl: room.cruise.imageUrl,
  };
  });
}
