export const SHIP_DECK_IDS = ["lower", "main", "sun"] as const;
export type ShipDeckId = (typeof SHIP_DECK_IDS)[number];
export const SHIP_ROOM_IDS = ["S01", "S02", "K01", "K02", "K03", "K04", "K05", "K06", "T01", "T02", "R01", "R02"] as const;
export const SHIP_SLOT_IDS = [...SHIP_ROOM_IDS, "ROOM09"] as const;
export type ShipSlotId = (typeof SHIP_SLOT_IDS)[number];
/** The named spaces on the deck plans (reception, stairs, pools…), stern to bow on each deck. */
export const SHIP_SPACE_IDS = [
  "fac-lower-entrance", "fac-reception", "fac-lower-stairs", "fac-massage", "fac-office", "fac-kitchen", "fac-crew", "fac-guides",
  "fac-main-entrance", "fac-library", "fac-main-stairs", "fac-gym", "fac-restroom", "fac-lounge", "fac-restaurant", "fac-terrace",
  "fac-shade", "fac-sun-stairs", "fac-bar", "fac-pools", "fac-loungers", "fac-sun-terrace",
] as const;
export type ShipSpaceId = (typeof SHIP_SPACE_IDS)[number];

/**
 * Deck artwork. The files are cached as immutable, so bump the version whenever
 * a deck drawing is replaced — otherwise returning visitors keep the old plan.
 */
export const SHIP_ART_VERSION = "2026-09-27b";
export const shipDeckArt = (deck: ShipDeckId) => `/media/hathor/ship/${deck}-deck.webp?v=${SHIP_ART_VERSION}`;

/**
 * Pixel bounds in the 1774 × 887 furnished artwork. Never movable onto a service space.
 * Lower deck, stern to bow: Suite 1 over Suite 2, then cabins numbered in pairs
 * across the corridor, as on the owner's room list: kings are Rooms 1, 3, 4, 5
 * and 6; twins are Rooms 2, 7 and 8; Room 9 (twin) is the guides' room and is
 * not sold. All four suites have a king bed. Main deck: Royal Suite 1 over Suite 2.
 */
export const SHIP_REGIONS: Record<ShipSlotId, { deck: ShipDeckId; x: number; y: number; width: number; height: number; edge: "top" | "bottom"; name: string; number: string }> = {
  S01: { deck: "lower", x: 55, y: 244, width: 300, height: 182, edge: "top", name: "Suite 1", number: "S1" },
  S02: { deck: "lower", x: 55, y: 495, width: 300, height: 190, edge: "bottom", name: "Suite 2", number: "S2" },
  K01: { deck: "lower", x: 572, y: 240, width: 126, height: 177, edge: "top", name: "Room 1", number: "1" },
  K02: { deck: "lower", x: 572, y: 509, width: 126, height: 181, edge: "bottom", name: "Room 2", number: "2" },
  K03: { deck: "lower", x: 707, y: 240, width: 126, height: 177, edge: "top", name: "Room 3", number: "3" },
  K04: { deck: "lower", x: 706, y: 510, width: 128, height: 179, edge: "bottom", name: "Room 4", number: "4" },
  K05: { deck: "lower", x: 841, y: 240, width: 125, height: 177, edge: "top", name: "Room 5", number: "5" },
  K06: { deck: "lower", x: 846, y: 510, width: 119, height: 181, edge: "bottom", name: "Room 6", number: "6" },
  T01: { deck: "lower", x: 972, y: 240, width: 133, height: 177, edge: "top", name: "Room 7", number: "7" },
  T02: { deck: "lower", x: 974, y: 510, width: 132, height: 179, edge: "bottom", name: "Room 8", number: "8" },
  ROOM09: { deck: "lower", x: 1116, y: 510, width: 126, height: 179, edge: "bottom", name: "Room 9", number: "9" },
  R01: { deck: "main", x: 72, y: 238, width: 303, height: 176, edge: "top", name: "Royal Suite 1", number: "R1" },
  R02: { deck: "main", x: 72, y: 481, width: 303, height: 175, edge: "bottom", name: "Royal Suite 2", number: "R2" },
};

/*
 * The saved ship-map config. Validation (zod) lives in
 * `ship-experience-schema.ts`, which only the server and the dashboard load —
 * this file is also part of the homepage deck plan.
 */
export type ShipDeckConfig = { id: ShipDeckId; name: string; subtitle: string; description: string; visible: boolean };
/* What the ship map shows: the number on the plan ("1", "S1"), the room's name
   there ("Room 1") and an optional line in its pop-up. The linked cabin's own
   name, type and price still come from the booking catalogue. */
export type ShipPlanRoom = {
  slotId: ShipSlotId; roomId: (typeof SHIP_ROOM_IDS)[number] | null;
  name: string; number: string; description: string; visible: boolean;
};
/** A named space on the plan; its default wording lives with the plan drawing. */
export type ShipSpaceConfig = { id: ShipSpaceId; name: string; line: string; visible: boolean };
export type ShipExperienceConfig = {
  version: 3;
  kicker: string; eyebrow: string; title: string; introduction: string;
  decks: ShipDeckConfig[];
  rooms: ShipPlanRoom[];
  /* Only the spaces edited in the dashboard; every other space keeps its default wording. */
  spaces: ShipSpaceConfig[];
};

/** Each booking cabin's name on the ship map ("Room 2", "Suite 1"), by cabin id. */
export function shipRoomNames(config: Pick<ShipExperienceConfig, "rooms">): Record<string, string> {
  return Object.fromEntries(config.rooms.flatMap(slot => slot.roomId ? [[slot.roomId, slot.name]] : []));
}

export const DEFAULT_SHIP_EXPERIENCE: ShipExperienceConfig = {
  version: 3,
  kicker: "Hathor · An intimate river residence",
  eyebrow: "The art of life aboard", title: "Your place on the Nile",
  introduction: "Three decks. A world of your own. Step inside Hathor, explore each room, and find the one that feels like yours.",
  decks: [
    { id: "lower", name: "Lower deck", subtitle: "A private world by the water", description: "Suites and rooms arranged around the heart of the ship. Select a room to look inside your next journey.", visible: true },
    { id: "main", name: "Main deck", subtitle: "Room to linger", description: "The Royal Suites, a quiet library, generous lounges and dining spaces opening toward the Nile.", visible: true },
    { id: "sun", name: "Sun deck", subtitle: "Nothing between you and the sky", description: "Shaded lounges, a circular bar and two pools. An open-air retreat, from the first light to the last.", visible: true },
  ],
  /* Room 9 is the guides' room: not sold, so it starts hidden and the plan names it as a crew area. */
  rooms: SHIP_SLOT_IDS.map(slotId => ({ slotId, roomId: slotId === "ROOM09" ? null : slotId, name: SHIP_REGIONS[slotId].name, number: SHIP_REGIONS[slotId].number, description: "", visible: slotId !== "ROOM09" })),
  spaces: [],
};
