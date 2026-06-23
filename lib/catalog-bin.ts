import { prisma } from "@/lib/prisma";

const DELETED_SLUG_SUFFIX = "__deleted__";

export function archivedCruiseSlug(slug: string, id: string): string {
  return `${slug}${DELETED_SLUG_SUFFIX}${id}`;
}

export function restoredCruiseSlug(slug: string, id: string): string {
  const suffix = `${DELETED_SLUG_SUFFIX}${id}`;
  if (slug.endsWith(suffix)) {
    return slug.slice(0, -suffix.length);
  }
  return slug;
}

export async function cruiseHasBookings(cruiseId: string): Promise<boolean> {
  const count = await prisma.booking.count({
    where: { cruiseSchedule: { cruiseId } },
  });
  return count > 0;
}

export async function roomHasBookings(roomId: string): Promise<boolean> {
  const count = await prisma.bookingRoom.count({
    where: { roomId },
  });
  return count > 0;
}

export async function purgeCruiseIfAllowed(cruiseId: string): Promise<boolean> {
  if (await cruiseHasBookings(cruiseId)) {
    return false;
  }

  await prisma.cruise.delete({ where: { id: cruiseId } });
  return true;
}

export async function purgeRoomIfAllowed(roomId: string): Promise<boolean> {
  if (await roomHasBookings(roomId)) {
    return false;
  }

  await prisma.room.delete({ where: { id: roomId } });
  return true;
}
