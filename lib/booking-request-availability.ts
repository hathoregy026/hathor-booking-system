import { bookingQuery } from "@/lib/booking-database";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";

/** One read-only statement. Counts refer to shared physical rooms, including both 7N sectors. */
export async function getRequestAvailability(duration: StayDurationValue) {
  const rows = await bookingQuery<{
    scheduleId: string; cruiseId: string; voyage: string; route: string | null;
    departureTime: Date; arrivalTime: Date; roomType: PhysicalRoomType;
    capacity: number; sizeSqm: number; priceCents: number; available: number;
  }>(`
    SELECT s.id AS "scheduleId",c.id AS "cruiseId",c.name AS voyage,c.ports AS route,
      s."departureTime",s."arrivalTime",r."roomType",r.capacity,r."sizeSqm",t."priceCents",
      (count(*) FILTER(WHERE NOT EXISTS (
        SELECT 1 FROM "InventoryAllocation" a
        WHERE a."roomId"=r.id AND a.active AND a."startsAt"<s."arrivalTime" AND a."endsAt">s."departureTime"
        AND (a."expiresAt" IS NULL OR a."expiresAt">clock_timestamp())
      )))::integer AS available
    FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id=s."cruiseId"
    JOIN "_CruiseRooms" cr ON cr."A"=c.id JOIN "Room" r ON r.id=cr."B"
    JOIN "TicketType" t ON t."cruiseId"=c.id AND t."roomType"=r."roomType"
    WHERE c.slug=$1 AND c."deletedAt" IS NULL AND s."isBookable"
      AND s."departureTime">clock_timestamp() AND r."deletedAt" IS NULL
    GROUP BY s.id,c.id,r."roomType",r.capacity,r."sizeSqm",t."priceCents"
    ORDER BY s."departureTime",r."roomType"
  `, [duration]);
  const sailings = new Map<string, {
    scheduleId: string; cruiseId: string; voyage: string; route: string | null;
    departureTime: string; arrivalTime: string;
    types: { roomType: PhysicalRoomType; capacity: number; sizeSqm: number; priceCents: number; available: number }[];
  }>();
  for (const row of rows) {
    const sailing = sailings.get(row.scheduleId) ?? { scheduleId: row.scheduleId, cruiseId: row.cruiseId, voyage: row.voyage, route: row.route,
      departureTime: row.departureTime.toISOString(), arrivalTime: row.arrivalTime.toISOString(), types: [] };
    sailing.types.push({ roomType: row.roomType, capacity: row.capacity, sizeSqm: row.sizeSqm, priceCents: row.priceCents, available: row.available });
    sailings.set(row.scheduleId, sailing);
  }
  return [...sailings.values()];
}
