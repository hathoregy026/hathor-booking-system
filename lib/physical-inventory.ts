export const PHYSICAL_ROOM_TYPES = ["Luxury King Cabin", "Luxury Twin Cabin", "Luxury Suite", "Royal Suite"] as const;
export type PhysicalRoomType = typeof PHYSICAL_ROOM_TYPES[number];
export type RequestedRoom = { roomType: PhysicalRoomType; adults: number; children: number };
export const roomCapacity = (type: PhysicalRoomType) => type === "Luxury King Cabin" || type === "Luxury Twin Cabin" ? 2 : 4;

/** Largest party one booking request carries: 12 cabins, each with an adult. */
export const PARTY_MAX_ADULTS = 24;
export const PARTY_MAX_CHILDREN = 8;
