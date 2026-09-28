import { z } from "zod";

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

const text = (max: number) => z.string().trim().min(1).max(max);
const deckSchema = z.object({ id: z.enum(SHIP_DECK_IDS), name: text(42), subtitle: text(90), description: text(220), visible: z.boolean() }).strict();
const roomSchema = z.object({
  slotId: z.enum(SHIP_SLOT_IDS), roomId: z.enum(SHIP_ROOM_IDS).nullable(),
  /* What the ship map shows: the number on the plan ("1", "S1"), the room's name
     there ("Room 1") and an optional line in its pop-up. The linked cabin's own
     name, type and price still come from the booking catalogue. */
  name: text(80), number: text(20), description: z.string().trim().max(600), visible: z.boolean(),
}).strict();
/** A named space on the plan; its default wording lives with the plan drawing. */
const spaceSchema = z.object({ id: z.enum(SHIP_SPACE_IDS), name: text(60), line: z.string().trim().max(240), visible: z.boolean() }).strict();
export const shipExperienceSchema = z.object({
  version: z.literal(3),
  kicker: text(80), eyebrow: text(48), title: text(80), introduction: text(260),
  decks: z.array(deckSchema).length(3),
  rooms: z.array(roomSchema).length(13),
  /* Only the spaces edited in the dashboard; every other space keeps its default wording. */
  spaces: z.array(spaceSchema).max(SHIP_SPACE_IDS.length),
}).strict().superRefine((value, context) => {
  if (new Set(value.decks.map(deck => deck.id)).size !== 3) context.addIssue({ code: "custom", path: ["decks"], message: "Every deck must appear once" });
  if (new Set(value.rooms.map(room => room.slotId)).size !== 13) context.addIssue({ code: "custom", path: ["rooms"], message: "Every plan room must appear once" });
  const linked = value.rooms.flatMap(room => room.roomId ? [room.roomId] : []);
  if (new Set(linked).size !== linked.length) context.addIssue({ code: "custom", path: ["rooms"], message: "A physical cabin can only be linked to one plan room" });
  if (!value.decks.some(deck => deck.visible)) context.addIssue({ code: "custom", path: ["decks"], message: "Keep at least one deck visible" });
  if (new Set(value.spaces.map(space => space.id)).size !== value.spaces.length) context.addIssue({ code: "custom", path: ["spaces"], message: "Each space can appear once" });
});
export type ShipExperienceConfig = z.infer<typeof shipExperienceSchema>;

/** Each booking cabin's name on the ship map ("Room 2", "Suite 1"), by cabin id. */
export function shipRoomNames(config: Pick<ShipExperienceConfig, "rooms">): Record<string, string> {
  return Object.fromEntries(config.rooms.flatMap(slot => slot.roomId ? [[slot.roomId, slot.name]] : []));
}
export type ShipPlanRoom = ShipExperienceConfig["rooms"][number];

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

/* Version 2: the same rooms and decks, before the kicker and the spaces were editable. */
const version2Schema = z.object({
  version: z.literal(2),
  eyebrow: text(48), title: text(80), introduction: text(260),
  decks: z.array(deckSchema).length(3),
  rooms: z.array(roomSchema).length(13),
}).strict();

// Upgrade saved text/visibility, not abstract coordinates or clickable facilities.
const legacySchema = z.object({
  eyebrow: text(48), title: text(80), introduction: text(260), decks: z.array(deckSchema).length(3),
  rooms: z.array(z.object({ roomId: z.enum(SHIP_ROOM_IDS), visible: z.boolean() })).length(12),
});
export function parseShipExperience(value: unknown): ShipExperienceConfig {
  const current = shipExperienceSchema.safeParse(value);
  if (current.success) return current.data;
  const version2 = version2Schema.safeParse(value);
  if (version2.success) {
    const candidate = shipExperienceSchema.safeParse({ ...version2.data, version: 3, kicker: DEFAULT_SHIP_EXPERIENCE.kicker, spaces: [] });
    if (candidate.success) return candidate.data;
  }
  const legacy = legacySchema.safeParse(value);
  if (legacy.success) {
    const candidate = shipExperienceSchema.safeParse({
      ...DEFAULT_SHIP_EXPERIENCE, ...legacy.data,
      rooms: DEFAULT_SHIP_EXPERIENCE.rooms.map(room => ({ ...room, visible: legacy.data.rooms.find(old => old.roomId === room.roomId)?.visible ?? room.visible })),
    });
    if (candidate.success) return candidate.data;
  }
  return DEFAULT_SHIP_EXPERIENCE;
}
