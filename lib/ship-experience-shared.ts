import { z } from "zod";

export const SHIP_DECK_IDS = ["lower", "main", "sun"] as const;
export type ShipDeckId = (typeof SHIP_DECK_IDS)[number];

export const SHIP_ROOM_IDS = [
  "S01", "S02", "K01", "K02", "K03", "K04", "K05", "K06", "T01", "T02", "R01", "R02",
] as const;

const shortText = (limit: number) => z.string().trim().min(1).max(limit);
const point = z.number().finite().min(8).max(92);

export const shipExperienceSchema = z.object({
  eyebrow: shortText(48),
  title: shortText(80),
  introduction: shortText(260),
  decks: z.array(z.object({
    id: z.enum(SHIP_DECK_IDS),
    name: shortText(42),
    subtitle: shortText(90),
    description: shortText(220),
    visible: z.boolean(),
  }).strict()).length(3),
  rooms: z.array(z.object({
    roomId: z.enum(SHIP_ROOM_IDS),
    deckId: z.enum(SHIP_DECK_IDS),
    x: point,
    y: point,
    label: z.string().trim().max(30),
    visible: z.boolean(),
  }).strict()).length(12),
  spaces: z.array(z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
    deckId: z.enum(SHIP_DECK_IDS),
    name: shortText(45),
    description: shortText(220),
    x: point,
    y: point,
    visible: z.boolean(),
  }).strict()).max(24),
}).strict().superRefine((value, context) => {
  for (const [field, ids] of [
    ["decks", value.decks.map(deck => deck.id)],
    ["rooms", value.rooms.map(room => room.roomId)],
    ["spaces", value.spaces.map(space => space.id)],
  ] as const) {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", path: [field], message: `Duplicate ${field} identifier` });
    }
  }
  if (!value.decks.some(deck => deck.visible)) {
    context.addIssue({ code: "custom", path: ["decks"], message: "Keep at least one deck visible" });
  }
});

export type ShipExperienceConfig = z.infer<typeof shipExperienceSchema>;

/** Conceptual plan positions only. Staff can correct them without a code change. */
export const DEFAULT_SHIP_EXPERIENCE: ShipExperienceConfig = {
  eyebrow: "Aboard Hathor",
  title: "The ship, unfolded",
  introduction: "Move between three intimate decks. Discover a cabin, choose a sailing, and see what is open for your journey.",
  decks: [
    { id: "lower", name: "Lower deck", subtitle: "Private rooms beside the river", description: "Cabins and suites unfold around the reception and quiet onboard spaces.", visible: true },
    { id: "main", name: "Main deck", subtitle: "Gather, dine, linger", description: "The Royal Suites sit alongside the shared rooms of the ship.", visible: true },
    { id: "sun", name: "Sun deck", subtitle: "Open to the Nile", description: "An open-air view of the pools, bar and places to pause.", visible: true },
  ],
  rooms: [
    { roomId: "S01", deckId: "lower", x: 16, y: 29, label: "Suite 1", visible: true },
    { roomId: "S02", deckId: "lower", x: 16, y: 70, label: "Suite 2", visible: true },
    { roomId: "K01", deckId: "lower", x: 37, y: 29, label: "", visible: true },
    { roomId: "K02", deckId: "lower", x: 37, y: 70, label: "", visible: true },
    { roomId: "K03", deckId: "lower", x: 48, y: 29, label: "", visible: true },
    { roomId: "K04", deckId: "lower", x: 48, y: 70, label: "", visible: true },
    { roomId: "K05", deckId: "lower", x: 59, y: 29, label: "", visible: true },
    { roomId: "K06", deckId: "lower", x: 59, y: 70, label: "", visible: true },
    { roomId: "T01", deckId: "lower", x: 70, y: 29, label: "", visible: true },
    { roomId: "T02", deckId: "lower", x: 70, y: 70, label: "", visible: true },
    { roomId: "R01", deckId: "main", x: 16, y: 29, label: "Royal Suite 1", visible: true },
    { roomId: "R02", deckId: "main", x: 16, y: 70, label: "Royal Suite 2", visible: true },
  ],
  spaces: [
    { id: "reception", deckId: "lower", name: "Reception", description: "Your welcome aboard Hathor.", x: 29, y: 51, visible: true },
    { id: "spa", deckId: "lower", name: "Wellness", description: "A quiet place to restore between shore days.", x: 83, y: 37, visible: true },
    { id: "library", deckId: "main", name: "Library", description: "A slower corner for reading and reflection.", x: 34, y: 51, visible: true },
    { id: "lounge", deckId: "main", name: "Lounge", description: "Gather over conversation and passing river views.", x: 52, y: 51, visible: true },
    { id: "restaurant", deckId: "main", name: "Restaurant", description: "Dining shaped by the rhythm of the Nile.", x: 73, y: 51, visible: true },
    { id: "open-air-dining", deckId: "main", name: "Open-air dining", description: "A table with the river close by.", x: 87, y: 51, visible: true },
    { id: "shade", deckId: "sun", name: "Shaded lounge", description: "A cool retreat under the open sky.", x: 22, y: 51, visible: true },
    { id: "bar", deckId: "sun", name: "Bar", description: "A place to settle in as the light changes.", x: 42, y: 51, visible: true },
    { id: "pools", deckId: "sun", name: "Pools", description: "Still water above the moving river.", x: 65, y: 51, visible: true },
    { id: "sun-loungers", deckId: "sun", name: "Sun loungers", description: "An unhurried view from the top deck.", x: 82, y: 51, visible: true },
  ],
};

export function parseShipExperience(value: unknown): ShipExperienceConfig {
  const parsed = shipExperienceSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_SHIP_EXPERIENCE;
}
