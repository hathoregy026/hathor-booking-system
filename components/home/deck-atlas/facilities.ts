import type { ShipDeckId, ShipExperienceConfig, ShipSpaceId } from "@/lib/ship-experience-shared";
import type { ShipSpaceImageName } from "@/lib/ship-space-images";

export type FacilityId = ShipSpaceId;

/**
 * Pixel bounds in the 1774 × 887 deck artwork. An area with `marker: false` only
 * completes the shape of an irregular space (the bow terrace narrowing to the
 * tip): it lights and responds with the rest, without a numbered disc of its own.
 */
export type Area = { x: number; y: number; width: number; height: number; marker?: false };

export type Facility = {
  id: FacilityId;
  deck: ShipDeckId;
  name: string;
  line: string;
  /** "crew" areas are shown and named, but are not open to guests. */
  kind: "guest" | "crew";
  /** Every place on the deck this space occupies (a staircase at each end, two gangways…). */
  areas: Area[];
  /** Its own photograph slot in the dashboard; null shows a close-up of the plan instead. */
  photoSlot: ShipSpaceImageName | null;
  /** False when the dashboard hides it from the plan. */
  visible?: boolean;
};

const area = (x: number, y: number, width: number, height: number): Area => ({ x, y, width, height });
const part = (x: number, y: number, width: number, height: number): Area => ({ x, y, width, height, marker: false });

/*
 * The spaces drawn on each deck plan, in the order the key numbers them
 * (stern to bow, guest spaces before crew areas). Bounds follow the deck
 * drawings' own walls, as marked on the owner's annotated plans.
 */
export const SHIP_FACILITIES: Facility[] = [
  /* Lower deck */
  { id: "fac-lower-entrance", deck: "lower", kind: "guest", name: "Entrance", line: "The gangways on either side, where you step aboard from the river bank.",
    areas: [area(372, 204, 60, 42), area(372, 674, 60, 42)], photoSlot: null },
  { id: "fac-reception", deck: "lower", kind: "guest", name: "Reception", line: "The welcome desk at the heart of the lower deck, where every journey begins.",
    areas: [area(356, 245, 204, 437)], photoSlot: "ship-space-reception" },
  { id: "fac-lower-stairs", deck: "lower", kind: "guest", name: "Stairs", line: "Three staircases up to the main deck — beside reception and at the stern.",
    areas: [area(108, 428, 125, 66), area(443, 240, 58, 100), area(443, 577, 58, 103)], photoSlot: null },
  { id: "fac-massage", deck: "lower", kind: "guest", name: "Massage room", line: "Seneb Spa’s treatment room, for a massage between temple visits.",
    areas: [area(1258, 240, 133, 177)], photoSlot: "ship-space-massage" },
  { id: "fac-office", deck: "lower", kind: "crew", name: "Manager’s office", line: "The ship manager’s office, a few steps along from reception.",
    areas: [area(1118, 240, 126, 177)], photoSlot: null },
  { id: "fac-guides", deck: "lower", kind: "crew", name: "Guides’ room", line: "Room 9, where the Egyptologist guides stay. Not open to guests.",
    areas: [area(1116, 510, 126, 179)], photoSlot: null },
  { id: "fac-kitchen", deck: "lower", kind: "crew", name: "Kitchen", line: "The galley at the bow, where the chef prepares every meal aboard.",
    areas: [area(1403, 249, 170, 168)], photoSlot: "ship-space-kitchen" },
  { id: "fac-crew", deck: "lower", kind: "crew", name: "Crew quarters", line: "Cabins for the crew who look after you. Not open to guests.",
    areas: [area(1258, 510, 133, 181), area(1408, 509, 171, 170)], photoSlot: null },

  /* Main deck */
  { id: "fac-main-entrance", deck: "main", kind: "guest", name: "Entrance", line: "The main-deck gangway, opening onto the library hall.",
    areas: [area(415, 660, 50, 36)], photoSlot: null },
  { id: "fac-library", deck: "main", kind: "guest", name: "Library", line: "Shelves of books and reading chairs — the quiet corner of the ship.",
    areas: [area(382, 240, 186, 412)], photoSlot: "ship-space-library" },
  { id: "fac-main-stairs", deck: "main", kind: "guest", name: "Stairs", line: "Down to the lower deck and up to the sun deck, from either side of the library and at the stern.",
    areas: [area(118, 420, 127, 60), area(487, 224, 58, 92), area(487, 575, 58, 90)], photoSlot: null },
  { id: "fac-gym", deck: "main", kind: "guest", name: "Gym", line: "A treadmill, bike and weights, for a morning session with the Nile beside you.",
    areas: [area(573, 236, 110, 168)], photoSlot: "ship-space-gym" },
  { id: "fac-restroom", deck: "main", kind: "guest", name: "Restroom", line: "A guest restroom off the library hall, close to the lounge.",
    areas: [area(573, 466, 110, 100)], photoSlot: null },
  { id: "fac-lounge", deck: "main", kind: "guest", name: "Lounge", line: "Deep sofas, a bar counter and wide windows onto the Nile.",
    areas: [area(688, 236, 366, 425)], photoSlot: "ship-space-lounge" },
  { id: "fac-restaurant", deck: "main", kind: "guest", name: "Restaurant", line: "Breakfast to candlelit dinner, served beside panoramic windows.",
    areas: [area(1074, 236, 325, 420)], photoSlot: "ship-space-restaurant" },
  { id: "fac-terrace", deck: "main", kind: "guest", name: "Outdoor terrace", line: "Open-air tables at the bow for long lunches and evenings on the river.",
    areas: [area(1434, 243, 299, 427)], photoSlot: "ship-space-main-terrace" },

  /* Sun deck */
  { id: "fac-shade", deck: "sun", kind: "guest", name: "Shaded lounge", line: "Sofas and daybeds under the pergola, shaded through the midday heat.",
    areas: [area(92, 262, 345, 358)], photoSlot: "ship-space-shaded-lounge" },
  { id: "fac-sun-stairs", deck: "sun", kind: "guest", name: "Stairs", line: "Down to the main deck, beside the shaded lounge.",
    areas: [area(446, 238, 64, 98)], photoSlot: null },
  { id: "fac-bar", deck: "sun", kind: "guest", name: "Circular bar", line: "Drinks at sunset, served all the way around the round bar.",
    areas: [area(500, 350, 196, 188)], photoSlot: "ship-space-bar" },
  { id: "fac-pools", deck: "sun", kind: "guest", name: "Two pools", line: "Two pools set into the deck, with sun loungers on either side.",
    areas: [area(714, 364, 390, 160)], photoSlot: "ship-space-pools" },
  { id: "fac-loungers", deck: "sun", kind: "guest", name: "Sun loungers", line: "Rows of loungers either side of the pools and beside the terrace, for long afternoons in the sun.",
    areas: [area(712, 258, 318, 88), area(712, 540, 370, 85), area(1138, 318, 72, 220)], photoSlot: "ship-space-sun-loungers" },
  /* The bow terrace: between the two stairways down to it, then out to the tip. */
  { id: "fac-sun-terrace", deck: "sun", kind: "guest", name: "Outdoor terrace", line: "Tables under the parasols at the bow, looking ahead up the river.",
    areas: [area(1310, 255, 165, 377), part(1212, 318, 98, 244), part(1475, 262, 110, 364), part(1585, 330, 135, 230)], photoSlot: "ship-space-sun-terrace" },
];

export const FACILITY_BY_ID = Object.fromEntries(SHIP_FACILITIES.map(item => [item.id, item])) as Record<FacilityId, Facility>;
export const isFacilityId = (id: string | null | undefined): id is FacilityId => Boolean(id && id in FACILITY_BY_ID);

/**
 * The key letter of a space: its place among the spaces on its own deck. Rooms
 * carry the ship's own numbers (1–9, S1, R1…), so spaces are lettered, as on a
 * printed deck plan, and the two never read alike.
 */
export const facilityMark = (id: FacilityId): string => {
  const facility = FACILITY_BY_ID[id];
  return String.fromCharCode(65 + SHIP_FACILITIES.filter(item => item.deck === facility.deck).indexOf(facility));
};

/** The spaces with the dashboard's wording and visibility laid over the defaults. */
export function facilitiesWith(config: Pick<ShipExperienceConfig, "spaces">): Facility[] {
  return SHIP_FACILITIES.map(facility => {
    const edit = config.spaces.find(space => space.id === facility.id);
    return edit ? { ...facility, name: edit.name, line: edit.line, visible: edit.visible } : facility;
  });
}
