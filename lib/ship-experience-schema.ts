import { z } from "zod";
import {
  DEFAULT_SHIP_EXPERIENCE,
  SHIP_DECK_IDS,
  SHIP_ROOM_IDS,
  SHIP_SLOT_IDS,
  SHIP_SPACE_IDS,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";

/* Server and dashboard only: the homepage deck plan reads the config the API
   has already parsed, and never needs zod in its bundle. */
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
}) satisfies z.ZodType<ShipExperienceConfig>;

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
