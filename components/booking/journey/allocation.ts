import {
  PARTY_MAX_ADULTS,
  PARTY_MAX_CHILDREN,
  PHYSICAL_ROOM_TYPES,
  roomCapacity,
  type PhysicalRoomType,
  type RequestedRoom,
} from "@/lib/physical-inventory";

/**
 * Guest-to-cabin arrangement for the Guests & Suites screen.
 *
 * Pure functions only. Guests are created by the Who Is Travelling counters
 * and wait there until they are put in a cabin. Every cabin on the sailing has
 * its own card ("Luxury King Cabin · Cabin 3"), and a guest goes into a cabin
 * by dragging (or tapping) or by that cabin's Adults/Children menu — two ways
 * of doing the same thing, sharing one count and one limit. Cabin numbers are
 * positions on screen, never physical cabins: the hold function picks the
 * actual cabin. The rules mirror what hathor_acquire_hold accepts:
 *   - King and Twin cabins sleep 2, both suites sleep 4
 *   - every cabin needs at least one adult (and so holds at most 3 children)
 *   - never more cabins of a type than are free on the sailing
 */

export type GuestKind = "adult" | "child";
export type Guest = { id: string; kind: GuestKind; number: number };

/** A cabin with guests in it. Empty cabins are not part of the arrangement. */
export type Cabin = { id: string; roomType: PhysicalRoomType; index: number };

export type Arrangement = {
  cabins: Cabin[];
  /** guestId → cabinId. A guest missing from the map is still waiting. */
  placement: Record<string, string>;
};

export type TypeOffer = { available: number; priceCents: number };
export type Offers = Partial<Record<PhysicalRoomType, TypeOffer>>;

export type CabinView = {
  id: string;
  roomType: PhysicalRoomType;
  label: string;
  capacity: number;
  priceCents: number | null;
  guests: Guest[];
};

export type PlaceResult = { next: Arrangement; cabinId: string } | { error: string };

export const MAX_ADULTS = PARTY_MAX_ADULTS;
export const MAX_CHILDREN = PARTY_MAX_CHILDREN;
export const MAX_CHILDREN_PER_CABIN = 3;
export const EMPTY_ARRANGEMENT: Arrangement = { cabins: [], placement: {} };

const SHORT_NAME: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "King Cabin",
  "Luxury Twin Cabin": "Twin Cabin",
  "Luxury Suite": "Luxury Suite",
  "Royal Suite": "Royal Suite",
};

export const shortName = (type: PhysicalRoomType) => SHORT_NAME[type];

/* ---------- cabins ---------- */

export const slotId = (roomType: PhysicalRoomType, index: number) => `${roomType}#${index}`;

export function parseSlot(id: string): { roomType: PhysicalRoomType; index: number } | null {
  const [type, raw] = id.split("#");
  const index = Number(raw);
  if (!(PHYSICAL_ROOM_TYPES as readonly string[]).includes(type) || !Number.isInteger(index) || index < 0) return null;
  return { roomType: type as PhysicalRoomType, index };
}

/** "King Cabin 3" — the cabin's card on screen, not a physical cabin number. */
export function cabinLabel(cabinId: string): string {
  const slot = parseSlot(cabinId);
  return slot ? `${SHORT_NAME[slot.roomType]} ${slot.index + 1}` : "that cabin";
}

const byTypeThenIndex = (a: Cabin, b: Cabin) =>
  PHYSICAL_ROOM_TYPES.indexOf(a.roomType) - PHYSICAL_ROOM_TYPES.indexOf(b.roomType) || a.index - b.index;

/* ---------- reading ---------- */

export function guestsFor(adults: number, children: number): Guest[] {
  return [
    ...Array.from({ length: adults }, (_, i) => ({ id: `adult-${i + 1}`, kind: "adult" as const, number: i + 1 })),
    ...Array.from({ length: children }, (_, i) => ({ id: `child-${i + 1}`, kind: "child" as const, number: i + 1 })),
  ];
}

export const guestLabel = (guest: Guest) => `${guest.kind === "adult" ? "Adult" : "Child"} ${guest.number}`;

export function occupants(arrangement: Arrangement, guests: Guest[], cabinId: string): Guest[] {
  return guests.filter(guest => arrangement.placement[guest.id] === cabinId);
}

export function unplacedGuests(arrangement: Arrangement, guests: Guest[]): Guest[] {
  const cabinIds = new Set(arrangement.cabins.map(cabin => cabin.id));
  return guests.filter(guest => !cabinIds.has(arrangement.placement[guest.id] ?? ""));
}

export function offersFromTypes(types: { roomType: PhysicalRoomType; availableCabins: number; priceCents: number }[]): Offers {
  return Object.fromEntries(types.map(type => [type.roomType, { available: type.availableCabins, priceCents: type.priceCents }]));
}

const isOpenSlot = (offers: Offers, cabinId: string) => {
  const slot = parseSlot(cabinId);
  return Boolean(slot && slot.index < (offers[slot.roomType]?.available ?? 0));
};

/** Drops cabins nobody is in, keeping each guest exactly where they were put. */
function normalise(arrangement: Arrangement): Arrangement {
  const used = new Set(Object.values(arrangement.placement));
  const cabins = arrangement.cabins.filter(cabin => used.has(cabin.id)).sort(byTypeThenIndex);
  const kept = new Set(cabins.map(cabin => cabin.id));
  const placement = Object.fromEntries(Object.entries(arrangement.placement).filter(([, id]) => kept.has(id)));
  return { cabins, placement };
}

function withCabin(arrangement: Arrangement, cabinId: string): Arrangement {
  if (arrangement.cabins.some(cabin => cabin.id === cabinId)) return arrangement;
  const slot = parseSlot(cabinId)!;
  return { ...arrangement, cabins: [...arrangement.cabins, { id: cabinId, ...slot }] };
}

/* ---------- putting guests in cabins ---------- */

/** Drag, tap, or a drop on a cabin: one guest into one cabin, within its limit. */
export function placeGuest(
  arrangement: Arrangement,
  guests: Guest[],
  guestId: string,
  target: { cabinId: string },
  offers: Offers,
): PlaceResult {
  const guest = guests.find(entry => entry.id === guestId);
  if (!guest) return { error: "That guest is no longer in your party." };
  const { cabinId } = target;
  const slot = parseSlot(cabinId);
  if (!slot || !isOpenSlot(offers, cabinId)) return { error: `${cabinLabel(cabinId)} is not available on this date.` };
  if (arrangement.placement[guestId] === cabinId) return { next: arrangement, cabinId };

  const withoutGuest: Record<string, string> = { ...arrangement.placement };
  delete withoutGuest[guestId];
  const inside = occupants({ ...arrangement, placement: withoutGuest }, guests, cabinId);
  const capacity = roomCapacity(slot.roomType);
  if (inside.length >= capacity) {
    return { error: `${cabinLabel(cabinId)} is full — it takes up to ${capacity} guests.` };
  }
  if (guest.kind === "child" && inside.filter(entry => entry.kind === "child").length >= MAX_CHILDREN_PER_CABIN) {
    return { error: `${cabinLabel(cabinId)} already has ${MAX_CHILDREN_PER_CABIN} children.` };
  }

  const next = normalise(withCabin({ ...arrangement, placement: { ...withoutGuest, [guestId]: cabinId } }, cabinId));
  return { next, cabinId };
}

export function unplaceGuest(arrangement: Arrangement, guestId: string): Arrangement {
  if (!(guestId in arrangement.placement)) return arrangement;
  const placement = { ...arrangement.placement };
  delete placement[guestId];
  return normalise({ ...arrangement, placement });
}

/** Empties one cabin; its guests go back to wait in Who Is Travelling. */
export function clearCabin(arrangement: Arrangement, cabinId: string): Arrangement {
  const placement = Object.fromEntries(Object.entries(arrangement.placement).filter(([, id]) => id !== cabinId));
  return normalise({ ...arrangement, placement });
}

/**
 * A cabin's Adults or Children menu — the same as dragging. The cabin ends up
 * with that many: raising brings in guests who are waiting, lowering sends the
 * most recently numbered ones back to wait. Guests already in the cabin stay,
 * so dragging one guest in and choosing 2 gives two, never three.
 */
export function setCabinCount(
  arrangement: Arrangement,
  guests: Guest[],
  cabinId: string,
  kind: GuestKind,
  count: number,
  offers: Offers,
): PlaceResult {
  const slot = parseSlot(cabinId);
  if (!slot || !isOpenSlot(offers, cabinId)) return { error: `${cabinLabel(cabinId)} is not available on this date.` };
  const same = occupants(arrangement, guests, cabinId).filter(guest => guest.kind === kind);
  if (count === same.length) return { next: arrangement, cabinId };

  if (count < same.length) {
    let next = arrangement;
    for (const guest of [...same].sort((a, b) => b.number - a.number).slice(0, same.length - count)) {
      next = unplaceGuest(next, guest.id);
    }
    return { next, cabinId };
  }

  const options = cabinCountOptions(arrangement, guests, cabinId, kind);
  if (count > options.limit) {
    return { error: `${cabinLabel(cabinId)} takes up to ${roomCapacity(slot.roomType)} guests.` };
  }
  if (count > options.reachable) {
    const waiting = options.reachable - same.length;
    const noun = kind === "adult" ? (waiting === 1 ? "adult is" : "adults are") : waiting === 1 ? "child is" : "children are";
    return {
      error: waiting === 0
        ? `No ${kind === "adult" ? "adults" : "children"} are waiting. Add them in Who Is Travelling, or take one out of another cabin.`
        : `Only ${waiting} ${noun} waiting. Add more in Who Is Travelling first.`,
    };
  }

  let next = arrangement;
  for (const guest of unplacedGuests(arrangement, guests).filter(entry => entry.kind === kind).slice(0, count - same.length)) {
    const result = placeGuest(next, guests, guest.id, { cabinId }, offers);
    if ("error" in result) return result;
    next = result.next;
  }
  return { next, cabinId };
}

/**
 * What a cabin's menu can offer: `limit` is set by the cabin (its size, and at
 * most three children), `reachable` by the guests actually waiting. Numbers
 * above `reachable` are shown but cannot be chosen.
 */
export function cabinCountOptions(arrangement: Arrangement, guests: Guest[], cabinId: string, kind: GuestKind) {
  const slot = parseSlot(cabinId);
  if (!slot) return { current: 0, limit: 0, reachable: 0 };
  const inside = occupants(arrangement, guests, cabinId);
  const current = inside.filter(guest => guest.kind === kind).length;
  const others = inside.length - current;
  const room = roomCapacity(slot.roomType) - others;
  const limit = kind === "child" ? Math.min(room, MAX_CHILDREN_PER_CABIN) : room;
  const waiting = unplacedGuests(arrangement, guests).filter(guest => guest.kind === kind).length;
  return { current, limit, reachable: Math.min(limit, current + waiting) };
}

/**
 * The Who Is Travelling totals changed. New guests wait in the middle; when the
 * party shrinks, guests still waiting go first, then the most recently placed.
 */
export function resizeParty(arrangement: Arrangement, guests: Guest[], adults: number, children: number): Arrangement {
  const placement: Record<string, string> = {};
  for (const [kind, total] of [["adult", adults], ["child", children]] as const) {
    const ofKind = guests.filter(guest => guest.kind === kind);
    const placed = ofKind.filter(guest => arrangement.placement[guest.id]);
    if (total >= ofKind.length) {
      for (const guest of placed) placement[guest.id] = arrangement.placement[guest.id];
      continue;
    }
    placed.slice(0, total).forEach((guest, index) => {
      placement[`${kind}-${index + 1}`] = arrangement.placement[guest.id];
    });
  }
  return normalise({ cabins: arrangement.cabins, placement });
}

/**
 * After a fresh availability read. A cabin card that no longer exists (another
 * guest booked one of that type) moves its guests to a free card of the same
 * type if there is one; otherwise they go back to wait.
 */
export function fitToOffers(arrangement: Arrangement, offers: Offers): { next: Arrangement; removed: PhysicalRoomType[] } {
  const lost = arrangement.cabins.filter(cabin => !isOpenSlot(offers, cabin.id));
  if (lost.length === 0) return { next: arrangement, removed: [] };

  const placement = { ...arrangement.placement };
  const cabins = arrangement.cabins.filter(cabin => isOpenSlot(offers, cabin.id));
  const removed: PhysicalRoomType[] = [];
  for (const cabin of lost) {
    const available = offers[cabin.roomType]?.available ?? 0;
    const freeIndex = Array.from({ length: available }, (_, index) => index)
      .find(index => !cabins.some(entry => entry.id === slotId(cabin.roomType, index)));
    if (freeIndex === undefined) {
      removed.push(cabin.roomType);
      for (const [guest, id] of Object.entries(placement)) if (id === cabin.id) delete placement[guest];
      continue;
    }
    const moved = slotId(cabin.roomType, freeIndex);
    cabins.push({ id: moved, roomType: cabin.roomType, index: freeIndex });
    for (const [guest, id] of Object.entries(placement)) if (id === cabin.id) placement[guest] = moved;
  }
  return { next: normalise({ cabins, placement }), removed };
}

/* ---------- Arrange for me ---------- */

/** Lexicographic: the first differing position decides. */
function ranksBefore(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

/**
 * Places everyone using only the cabin types the guest chose, within each
 * cabin's limit: the lowest voyage total, then the fewest cabins. Returns null
 * when those types cannot hold the whole party on this date.
 */
export function autoArrange(guests: Guest[], offers: Offers, allowed: readonly PhysicalRoomType[] = PHYSICAL_ROOM_TYPES): Arrangement | null {
  const adults = guests.filter(guest => guest.kind === "adult");
  const children = guests.filter(guest => guest.kind === "child");
  if (guests.length === 0) return EMPTY_ARRANGEMENT;

  const limit = (type: PhysicalRoomType) => (allowed.includes(type) ? Math.min(offers[type]?.available ?? 0, adults.length) : 0);
  const price = (type: PhysicalRoomType) => offers[type]?.priceCents ?? 0;
  const [king, twin, suite, royal] = PHYSICAL_ROOM_TYPES;

  let best: { counts: number[]; key: number[] } | null = null;
  for (let k = 0; k <= limit(king); k += 1) {
    for (let t = 0; t <= limit(twin); t += 1) {
      for (let s = 0; s <= limit(suite); s += 1) {
        for (let r = 0; r <= limit(royal); r += 1) {
          const cabins = k + t + s + r;
          if (cabins === 0 || cabins > adults.length) continue;
          if (2 * (k + t) + 4 * (s + r) < guests.length) continue;
          const counts = [k, t, s, r];
          const total = k * price(king) + t * price(twin) + s * price(suite) + r * price(royal);
          const key = [total, cabins, t, r];
          if (!best || ranksBefore(key, best.key)) best = { counts, key };
        }
      }
    }
  }
  if (!best) return null;

  // Larger cabins first, so families land together in the suites.
  const cabins: Cabin[] = [];
  for (const type of [royal, suite, king, twin]) {
    for (let index = 0; index < best.counts[PHYSICAL_ROOM_TYPES.indexOf(type)]; index += 1) {
      cabins.push({ id: slotId(type, index), roomType: type, index });
    }
  }

  const placement: Record<string, string> = {};
  const seated = (cabin: Cabin) => Object.values(placement).filter(id => id === cabin.id).length;
  const kids = (cabin: Cabin) => children.filter(child => placement[child.id] === cabin.id).length;
  cabins.forEach((cabin, index) => { placement[adults[index].id] = cabin.id; });
  for (const child of children) {
    const cabin = cabins.find(entry => seated(entry) < roomCapacity(entry.roomType) && kids(entry) < MAX_CHILDREN_PER_CABIN);
    if (!cabin) return null;
    placement[child.id] = cabin.id;
  }
  for (const adult of adults.slice(cabins.length)) {
    const cabin = cabins.find(entry => seated(entry) < roomCapacity(entry.roomType));
    if (!cabin) return null;
    placement[adult.id] = cabin.id;
  }

  return normalise({ cabins, placement });
}

/* ---------- checking and sending ---------- */

/** Everything that would stop the request, worded for the guest. Empty when ready. */
export function arrangementIssues(arrangement: Arrangement, guests: Guest[]): string[] {
  const issues: string[] = [];
  const waiting = unplacedGuests(arrangement, guests).length;
  if (waiting > 0) issues.push(`${waiting === 1 ? "1 guest still needs" : `${waiting} guests still need`} a cabin.`);
  for (const cabin of arrangement.cabins) {
    const inside = occupants(arrangement, guests, cabin.id);
    const label = cabinLabel(cabin.id);
    if (!inside.some(guest => guest.kind === "adult")) issues.push(`${label} needs at least one adult.`);
    else if (inside.length > roomCapacity(cabin.roomType)) issues.push(`${label} takes up to ${roomCapacity(cabin.roomType)} guests.`);
  }
  return issues;
}

export function cabinViews(arrangement: Arrangement, guests: Guest[], offers: Offers): CabinView[] {
  return arrangement.cabins.map(cabin => ({
    id: cabin.id,
    roomType: cabin.roomType,
    label: cabinLabel(cabin.id),
    capacity: roomCapacity(cabin.roomType),
    priceCents: offers[cabin.roomType]?.priceCents ?? null,
    guests: occupants(arrangement, guests, cabin.id),
  }));
}

export function arrangementTotal(arrangement: Arrangement, offers: Offers): number | null {
  if (arrangement.cabins.length === 0) return null;
  let total = 0;
  for (const cabin of arrangement.cabins) {
    const offer = offers[cabin.roomType];
    if (!offer) return null;
    total += offer.priceCents;
  }
  return total;
}

/** The rooms array hathor_acquire_hold receives; index = BookingRoom.roomIndex. */
export function roomsPayload(arrangement: Arrangement, guests: Guest[]): RequestedRoom[] {
  return arrangement.cabins.map(cabin => {
    const inside = occupants(arrangement, guests, cabin.id);
    return {
      roomType: cabin.roomType,
      adults: inside.filter(guest => guest.kind === "adult").length,
      children: inside.filter(guest => guest.kind === "child").length,
    };
  });
}

export function passengersPayload(arrangement: Arrangement, guests: Guest[], names: Record<string, string>) {
  return arrangement.cabins.flatMap((cabin, roomIndex) =>
    occupants(arrangement, guests, cabin.id).map(guest => ({
      fullName: (names[guest.id] ?? "").trim(),
      isChild: guest.kind === "child",
      roomIndex,
    })),
  );
}

/** Guests in a sentence: "Adult 3", "Adult 3 and Child 1", "Adult 3, Child 1 and Child 2". */
export function guestList(list: Guest[]): string {
  const labels = list.map(guestLabel);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** What still stops Guests & Suites from continuing, said exactly; null when nothing does. */
export function placementReminder(arrangement: Arrangement, guests: Guest[]): string | null {
  const waiting = unplacedGuests(arrangement, guests);
  if (waiting.length > 0) return `${guestList(waiting)} ${waiting.length === 1 ? "still needs" : "still need"} a cabin.`;
  return arrangementIssues(arrangement, guests)[0] ?? null;
}
