import { z } from "zod";

export const SHIP_DECK_IDS = ["lower", "main", "sun"] as const;
export type ShipDeckId = (typeof SHIP_DECK_IDS)[number];
export const SHIP_ROOM_IDS = ["S01", "S02", "K01", "K02", "K03", "K04", "K05", "K06", "T01", "T02", "R01", "R02"] as const;
export const SHIP_SLOT_IDS = [...SHIP_ROOM_IDS, "ROOM09"] as const;
export type ShipSlotId = (typeof SHIP_SLOT_IDS)[number];

/** Pixel bounds in the 1774 × 887 furnished artwork. Never movable onto a service space. */
export const SHIP_REGIONS: Record<ShipSlotId, { deck: ShipDeckId; x: number; y: number; width: number; height: number; edge: "top" | "bottom"; name: string; number: string }> = {
  S01: { deck: "lower", x: 65, y: 248, width: 297, height: 178, edge: "top", name: "Suite 1", number: "S1" },
  S02: { deck: "lower", x: 65, y: 499, width: 297, height: 176, edge: "bottom", name: "Suite 2", number: "S2" },
  K01: { deck: "lower", x: 591, y: 247, width: 130, height: 176, edge: "top", name: "Room 1", number: "1" },
  K02: { deck: "lower", x: 591, y: 506, width: 130, height: 171, edge: "bottom", name: "Room 2", number: "2" },
  K03: { deck: "lower", x: 730, y: 247, width: 128, height: 176, edge: "top", name: "Room 3", number: "3" },
  K04: { deck: "lower", x: 730, y: 506, width: 128, height: 171, edge: "bottom", name: "Room 4", number: "4" },
  K05: { deck: "lower", x: 866, y: 247, width: 126, height: 176, edge: "top", name: "Room 5", number: "5" },
  K06: { deck: "lower", x: 866, y: 506, width: 126, height: 171, edge: "bottom", name: "Room 6", number: "6" },
  T01: { deck: "lower", x: 1001, y: 247, width: 127, height: 176, edge: "top", name: "Room 7", number: "7" },
  T02: { deck: "lower", x: 1001, y: 506, width: 127, height: 171, edge: "bottom", name: "Room 8", number: "8" },
  ROOM09: { deck: "lower", x: 1138, y: 506, width: 125, height: 171, edge: "bottom", name: "Room 9", number: "9" },
  R02: { deck: "main", x: 78, y: 238, width: 292, height: 177, edge: "top", name: "Royal Suite 2", number: "R2" },
  R01: { deck: "main", x: 78, y: 485, width: 292, height: 169, edge: "bottom", name: "Royal Suite 1", number: "R1" },
};

const text = (max: number) => z.string().trim().min(1).max(max);
const deckSchema = z.object({ id: z.enum(SHIP_DECK_IDS), name: text(42), subtitle: text(90), description: text(220), visible: z.boolean() }).strict();
export const shipExperienceSchema = z.object({
  version: z.literal(2),
  eyebrow: text(48), title: text(80), introduction: text(260),
  decks: z.array(deckSchema).length(3),
  rooms: z.array(z.object({
    slotId: z.enum(SHIP_SLOT_IDS), roomId: z.enum(SHIP_ROOM_IDS).nullable(),
    // Used only for an unlinked plan room. Linked cabins read the real Room catalog.
    name: text(80), number: text(20), description: z.string().trim().max(600), visible: z.boolean(),
  }).strict()).length(13),
}).strict().superRefine((value, context) => {
  if (new Set(value.decks.map(deck => deck.id)).size !== 3) context.addIssue({ code: "custom", path: ["decks"], message: "Every deck must appear once" });
  if (new Set(value.rooms.map(room => room.slotId)).size !== 13) context.addIssue({ code: "custom", path: ["rooms"], message: "Every plan room must appear once" });
  const linked = value.rooms.flatMap(room => room.roomId ? [room.roomId] : []);
  if (new Set(linked).size !== linked.length) context.addIssue({ code: "custom", path: ["rooms"], message: "A physical cabin can only be linked to one plan room" });
  if (!value.decks.some(deck => deck.visible)) context.addIssue({ code: "custom", path: ["decks"], message: "Keep at least one deck visible" });
});
export type ShipExperienceConfig = z.infer<typeof shipExperienceSchema>;
export type ShipPlanRoom = ShipExperienceConfig["rooms"][number];

export const DEFAULT_SHIP_EXPERIENCE: ShipExperienceConfig = {
  version: 2,
  eyebrow: "The art of life aboard", title: "Your place on the Nile",
  introduction: "Three decks. A world of your own. Step inside Hathor, explore each room, and find the one that feels like yours.",
  decks: [
    { id: "lower", name: "Lower deck", subtitle: "A private world by the water", description: "Suites and rooms arranged around the heart of the ship. Select a room to look inside your next journey.", visible: true },
    { id: "main", name: "Main deck", subtitle: "Room to linger", description: "The Royal Suites, a quiet library, generous lounges and dining spaces opening toward the Nile.", visible: true },
    { id: "sun", name: "Sun deck", subtitle: "Nothing between you and the sky", description: "Shaded lounges, a circular bar and two pools. An open-air retreat, from the first light to the last.", visible: true },
  ],
  rooms: SHIP_SLOT_IDS.map(slotId => ({ slotId, roomId: slotId === "ROOM09" ? null : slotId, name: SHIP_REGIONS[slotId].name, number: SHIP_REGIONS[slotId].number, description: "", visible: true })),
};

// Upgrade saved text/visibility, not abstract coordinates or clickable facilities.
const legacySchema = z.object({
  eyebrow: text(48), title: text(80), introduction: text(260), decks: z.array(deckSchema).length(3),
  rooms: z.array(z.object({ roomId: z.enum(SHIP_ROOM_IDS), visible: z.boolean() })).length(12),
});
export function parseShipExperience(value: unknown): ShipExperienceConfig {
  const current = shipExperienceSchema.safeParse(value);
  if (current.success) return current.data;
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
