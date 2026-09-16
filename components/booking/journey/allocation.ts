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
 * Pure functions only. Every cabin free on the sailing is shown as its own
 * slot ("King Cabin 3"), and guests are placed into slots by dragging, tapping
 * or the Adults/Children menus — three ways of calling the same functions.
 * Slots are display positions, never physical cabins: the hold function picks
 * the actual cabin. The rules mirror what hathor_acquire_hold accepts, so a
 * finished arrangement is exactly the rooms payload the database allocates:
 *   - King and Twin cabins sleep 2, both suites sleep 4
 *   - every cabin needs at least one adult (and so holds at most 3 children)
 *   - never more cabins of a type than are free on the sailing
 */

export type GuestKind = "adult" | "child";
export type Guest = { id: string; kind: GuestKind; number: number };

/** A slot in use. Slots with nobody in them are not part of the arrangement. */
export type Cabin = { id: string; roomType: PhysicalRoomType; index: number };

export type Arrangement = {
  cabins: Cabin[];
  /** guestId → cabinId. A guest missing from the map is still to be placed. */
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
export const kindLabel = (kind: GuestKind, count = 2) =>
  kind === "adult" ? (count === 1 ? "adult" : "adults") : count === 1 ? "child" : "children";

/* ---------- slots ---------- */

export const slotId = (roomType: PhysicalRoomType, index: number) => `${roomType}#${index}`;

export function parseSlot(id: string): { roomType: PhysicalRoomType; index: number } | null {
  const [type, raw] = id.split("#");
  const index = Number(raw);
  if (!(PHYSICAL_ROOM_TYPES as readonly string[]).includes(type) || !Number.isInteger(index) || index < 0) return null;
  return { roomType: type as PhysicalRoomType, index };
}

/** "Luxury Suite 2" — the slot's position on screen, not a cabin number. */
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

/** Drops cabins nobody is in and keeps a stable order for the rooms payload. */
function normalise(arrangement: Arrangement): Arrangement {
  const used = new Set(Object.values(arrangement.placement));
  const cabins = arrangement.cabins.filter(cabin => used.has(cabin.id)).sort(byTypeThenIndex);
  const placement = Object.fromEntries(Object.entries(arrangement.placement).filter(([, id]) => cabins.some(cabin => cabin.id === id)));
  return { cabins, placement };
}

function withCabin(arrangement: Arrangement, cabinId: string): Arrangement {
  if (arrangement.cabins.some(cabin => cabin.id === cabinId)) return arrangement;
  const slot = parseSlot(cabinId)!;
  return { ...arrangement, cabins: [...arrangement.cabins, { id: cabinId, ...slot }] };
}

/* ---------- moving guests ---------- */

export function placeGuest(
  arrangement: Arrangement,
  guests: Guest[],
  guestId: string,
  target: { cabinId: string } | { roomType: PhysicalRoomType },
  offers: Offers,
): PlaceResult {
  const guest = guests.find(entry => entry.id === guestId);
  if (!guest) return { error: "That guest is no longer in your party." };

  const withoutGuest: Record<string, string> = { ...arrangement.placement };
  delete withoutGuest[guestId];
  const base: Arrangement = { ...arrangement, placement: withoutGuest };
  const seated = (cabinId: string) => occupants(base, guests, cabinId);

  let cabinId: string;
  if ("cabinId" in target) {
    cabinId = target.cabinId;
    if (!isOpenSlot(offers, cabinId)) return { error: `${cabinLabel(cabinId)} is no longer free on this sailing.` };
    if (arrangement.placement[guestId] === cabinId) return { next: arrangement, cabinId };
  } else {
    const { roomType } = target;
    const available = offers[roomType]?.available ?? 0;
    if (available === 0) return { error: `${SHORT_NAME[roomType]} is not available on this sailing.` };
    const current = arrangement.placement[guestId];
    if (current && parseSlot(current)?.roomType === roomType) return { next: arrangement, cabinId: current };

    const slots = Array.from({ length: available }, (_, index) => slotId(roomType, index));
    const withSpace = slots.filter(id => seated(id).length > 0 && seated(id).length < roomCapacity(roomType));
    // A child joins an adult; an adult fills a cabin missing one, then joins
    // company; only then does the next free cabin of this type open.
    const hasAdult = (id: string) => seated(id).some(entry => entry.kind === "adult");
    const empty = slots.find(id => seated(id).length === 0);
    const chosen = guest.kind === "child"
      ? withSpace.find(hasAdult) ?? empty ?? withSpace[0]
      : withSpace.find(id => !hasAdult(id)) ?? withSpace[0] ?? empty;
    if (!chosen) {
      return {
        error: available === 1
          ? `The only free ${SHORT_NAME[roomType]} on this sailing is already full.`
          : `All ${available} free ${SHORT_NAME[roomType]}s on this sailing are already full.`,
      };
    }
    cabinId = chosen;
  }

  const slot = parseSlot(cabinId)!;
  const inside = seated(cabinId);
  if (inside.length >= roomCapacity(slot.roomType)) {
    return { error: `${cabinLabel(cabinId)} is full. It sleeps ${roomCapacity(slot.roomType)}.` };
  }
  if (guest.kind === "child" && inside.filter(entry => entry.kind === "child").length >= MAX_CHILDREN_PER_CABIN) {
    return { error: `${cabinLabel(cabinId)} already has ${MAX_CHILDREN_PER_CABIN} children.` };
  }

  const next = normalise(withCabin({ ...base, placement: { ...withoutGuest, [guestId]: cabinId } }, cabinId));
  return { next, cabinId };
}

export function unplaceGuest(arrangement: Arrangement, guestId: string): Arrangement {
  if (!(guestId in arrangement.placement)) return arrangement;
  const placement = { ...arrangement.placement };
  delete placement[guestId];
  return normalise({ ...arrangement, placement });
}

/** Empties one cabin; its guests wait for another. */
export function clearCabin(arrangement: Arrangement, cabinId: string): Arrangement {
  const placement = Object.fromEntries(Object.entries(arrangement.placement).filter(([, id]) => id !== cabinId));
  return normalise({ ...arrangement, placement });
}

/**
 * The dropdown path: how many adults or children should be in this cabin.
 * It moves guests exactly as a drag would — raising takes guests who are still
 * waiting, lowering sends guests back to wait — so both methods stay in step.
 */
export function setCabinCount(
  arrangement: Arrangement,
  guests: Guest[],
  cabinId: string,
  kind: GuestKind,
  count: number,
  offers: Offers,
): PlaceResult {
  if (!isOpenSlot(offers, cabinId)) return { error: `${cabinLabel(cabinId)} is no longer free on this sailing.` };
  const inside = occupants(arrangement, guests, cabinId).filter(guest => guest.kind === kind);
  if (count === inside.length) return { next: arrangement, cabinId };

  if (count < inside.length) {
    let next = arrangement;
    for (const guest of [...inside].sort((a, b) => b.number - a.number).slice(0, inside.length - count)) {
      next = unplaceGuest(next, guest.id);
    }
    return { next, cabinId };
  }

  const waiting = unplacedGuests(arrangement, guests).filter(guest => guest.kind === kind);
  const needed = count - inside.length;
  if (waiting.length < needed) {
    return {
      error: waiting.length === 0
        ? `Every ${kindLabel(kind, 1)} already has a cabin. Add more ${kindLabel(kind)} above, or lower another cabin first.`
        : `Only ${waiting.length} ${kindLabel(kind, waiting.length)} ${waiting.length === 1 ? "is" : "are"} waiting for a cabin.`,
    };
  }
  let next = arrangement;
  for (const guest of waiting.slice(0, needed)) {
    const result = placeGuest(next, guests, guest.id, { cabinId }, offers);
    if ("error" in result) return result;
    next = result.next;
  }
  return { next, cabinId };
}

/** The largest number the Adults or Children menu can offer for a cabin. */
export function cabinCountLimit(arrangement: Arrangement, guests: Guest[], cabinId: string, kind: GuestKind): number {
  const slot = parseSlot(cabinId);
  if (!slot) return 0;
  const inside = occupants(arrangement, guests, cabinId);
  const same = inside.filter(guest => guest.kind === kind).length;
  const other = inside.length - same;
  const waiting = unplacedGuests(arrangement, guests).filter(guest => guest.kind === kind).length;
  const room = roomCapacity(slot.roomType) - other;
  const cap = kind === "child" ? Math.min(room, MAX_CHILDREN_PER_CABIN) : room;
  return Math.max(same, Math.min(cap, same + waiting));
}

/**
 * The party size changed. Guests are anonymous until the details step, so the
 * ones removed are those still waiting first, then the most recently placed;
 * everyone else keeps their cabin.
 */
export function resizeParty(arrangement: Arrangement, guests: Guest[], adults: number, children: number): Arrangement {
  const placement: Record<string, string> = {};
  for (const [kind, total] of [["adult", adults], ["child", children]] as const) {
    const ofKind = guests.filter(guest => guest.kind === kind);
    const placed = ofKind.filter(guest => arrangement.placement[guest.id]);
    if (total >= ofKind.length) {
      // Growing: everyone keeps their tile and cabin; the newcomers wait.
      for (const guest of placed) placement[guest.id] = arrangement.placement[guest.id];
      continue;
    }
    placed.slice(0, total).forEach((guest, index) => {
      placement[`${kind}-${index + 1}`] = arrangement.placement[guest.id];
    });
  }
  return normalise({ cabins: arrangement.cabins, placement });
}

/** After a fresh availability read: keep cabins inside the free slots, closing any gaps. */
export function fitToOffers(arrangement: Arrangement, offers: Offers): { next: Arrangement; removed: PhysicalRoomType[] } {
  if (arrangement.cabins.every(cabin => isOpenSlot(offers, cabin.id))) return { next: arrangement, removed: [] };

  const removed: PhysicalRoomType[] = [];
  const cabins: Cabin[] = [];
  const renamed: Record<string, string> = {};
  for (const type of PHYSICAL_ROOM_TYPES) {
    const allowed = offers[type]?.available ?? 0;
    arrangement.cabins.filter(cabin => cabin.roomType === type).sort(byTypeThenIndex).forEach((cabin, position) => {
      if (position < allowed) {
        const id = slotId(type, position);
        renamed[cabin.id] = id;
        cabins.push({ id, roomType: type, index: position });
      } else {
        removed.push(type);
      }
    });
  }
  const placement = Object.fromEntries(
    Object.entries(arrangement.placement).filter(([, id]) => renamed[id]).map(([guest, id]) => [guest, renamed[id]]),
  );
  return { next: normalise({ cabins, placement }), removed };
}

/* ---------- a ready-made start ---------- */

/** Lexicographic: the first differing position decides. */
function ranksBefore(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

/**
 * So nobody has to drag to continue: the lowest voyage total that fits
 * everyone, then the fewest cabins, preferring the cabin type the guest chose
 * elsewhere (a room page or the cart) when there is one.
 */
export function autoArrange(guests: Guest[], offers: Offers, preferred: PhysicalRoomType | null = null): Arrangement | null {
  const adults = guests.filter(guest => guest.kind === "adult");
  const children = guests.filter(guest => guest.kind === "child");
  if (guests.length === 0) return EMPTY_ARRANGEMENT;

  const limit = (type: PhysicalRoomType) => Math.min(offers[type]?.available ?? 0, adults.length);
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
          const usesPreferred = preferred ? counts[PHYSICAL_ROOM_TYPES.indexOf(preferred)] > 0 : true;
          const total = k * price(king) + t * price(twin) + s * price(suite) + r * price(royal);
          const key = [usesPreferred ? 0 : 1, total, cabins, t, r];
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
    else if (inside.length > roomCapacity(cabin.roomType)) issues.push(`${label} sleeps ${roomCapacity(cabin.roomType)}.`);
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
