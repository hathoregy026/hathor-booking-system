import { bookingQuery } from "@/lib/booking-database";
import { SHIP_EXPERIENCE_KEY } from "@/lib/ship-experience";
import { DEFAULT_SHIP_EXPERIENCE, shipRoomNames } from "@/lib/ship-experience-shared";
import { parseShipExperience } from "@/lib/ship-experience-schema";

/** Each cabin's name on the ship map, from the same settings the homepage map reads. */
export async function readShipRoomNames(): Promise<Record<string, string>> {
  const rows = await bookingQuery<{ value: string }>(`SELECT value FROM "SiteSetting" WHERE key = $1`, [SHIP_EXPERIENCE_KEY]);
  try {
    return shipRoomNames(rows[0] ? parseShipExperience(JSON.parse(rows[0].value)) : DEFAULT_SHIP_EXPERIENCE);
  } catch {
    return shipRoomNames(DEFAULT_SHIP_EXPERIENCE);
  }
}
