import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SHIP_EXPERIENCE,
  parseShipExperience,
  SHIP_ROOM_IDS,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";

export const SHIP_EXPERIENCE_KEY = "ship-experience-v1";

export type ShipRoom = {
  id: string;
  name: string;
  roomNumber: string | null;
  roomType: string | null;
  description: string | null;
  capacity: number;
  sizeSqm: number;
};

export async function loadShipExperience(): Promise<{
  config: ShipExperienceConfig;
  rooms: ShipRoom[];
}> {
  const [setting, rooms] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: SHIP_EXPERIENCE_KEY }, select: { value: true } }),
    prisma.room.findMany({
      where: {
        id: { in: [...SHIP_ROOM_IDS] },
        deletedAt: null,
      },
      select: {
        id: true, name: true, roomNumber: true, roomType: true,
        description: true, capacity: true, sizeSqm: true,
      },
      orderBy: { id: "asc" },
    }),
  ]);

  let config = DEFAULT_SHIP_EXPERIENCE;
  if (setting) {
    try {
      config = parseShipExperience(JSON.parse(setting.value));
    } catch {
      // A corrupt setting must never take the homepage down.
    }
  }
  return { config, rooms };
}
