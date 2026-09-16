import assert from "node:assert/strict";
import {
  arrangementIssues,
  arrangementTotal,
  autoArrange,
  cabinCountLimit,
  cabinLabel,
  clearCabin,
  fitToOffers,
  guestsFor,
  occupants,
  passengersPayload,
  placeGuest,
  resizeParty,
  roomsPayload,
  setCabinCount,
  slotId,
  unplaceGuest,
  unplacedGuests,
  type Arrangement,
  type Offers,
} from "../components/booking/journey/allocation";
import { paymentSchedule } from "../lib/payment-schedule";
import { roomCapacity } from "../lib/physical-inventory";

/**
 * Guest-to-cabin rules behind the Guests & Suites screen. Pure logic only: no
 * database, no network. Dragging, tapping and the Adults/Children menus all go
 * through these functions, and every finished arrangement must be a rooms
 * payload the hold function accepts (1–4 adults, 0–3 children, within capacity).
 */

const offers: Offers = {
  "Luxury King Cabin": { available: 6, priceCents: 700_000 },
  "Luxury Twin Cabin": { available: 2, priceCents: 700_000 },
  "Luxury Suite": { available: 2, priceCents: 1_050_000 },
  "Royal Suite": { available: 2, priceCents: 1_260_000 },
};
const KING = (index: number) => slotId("Luxury King Cabin", index);
const SUITE = (index: number) => slotId("Luxury Suite", index);
const EMPTY: Arrangement = { cabins: [], placement: {} };

let passed = 0;
function check(name: string, run: () => void) {
  run();
  passed += 1;
  console.log(`ok - ${name}`);
}

function ok(result: ReturnType<typeof placeGuest>): Arrangement {
  assert.ok("next" in result, "error" in result ? result.error : "");
  return result.next;
}

function assertHoldable(arrangement: Arrangement, adults: number, children: number) {
  const guests = guestsFor(adults, children);
  assert.deepEqual(arrangementIssues(arrangement, guests), []);
  const rooms = roomsPayload(arrangement, guests);
  assert.equal(rooms.reduce((sum, room) => sum + room.adults, 0), adults);
  assert.equal(rooms.reduce((sum, room) => sum + room.children, 0), children);
  for (const room of rooms) {
    assert.ok(room.adults >= 1 && room.adults <= 4, "every cabin has 1–4 adults");
    assert.ok(room.children >= 0 && room.children <= 3, "at most 3 children per cabin");
    assert.ok(room.adults + room.children <= roomCapacity(room.roomType), "within capacity");
  }
}

check("two adults start in King Cabin 1", () => {
  const arrangement = autoArrange(guestsFor(2, 0), offers)!;
  assert.deepEqual(arrangement.cabins.map(cabin => cabin.id), [KING(0)]);
  assert.equal(cabinLabel(KING(0)), "King Cabin 1");
  assertHoldable(arrangement, 2, 0);
});

check("3 adults and 2 children get the lowest total that fits everyone", () => {
  const arrangement = autoArrange(guestsFor(3, 2), offers)!;
  assert.equal(arrangementTotal(arrangement, offers), 1_750_000);
  assertHoldable(arrangement, 3, 2);
});

check("a room type chosen elsewhere (room page or cart) is preferred", () => {
  const arrangement = autoArrange(guestsFor(2, 0), offers, "Royal Suite")!;
  assert.deepEqual(arrangement.cabins.map(cabin => cabin.roomType), ["Royal Suite"]);
});

check("sold-out types are never suggested, and impossible parties return null", () => {
  const tight: Offers = { "Luxury King Cabin": { available: 1, priceCents: 700_000 } };
  assert.equal(autoArrange(guestsFor(3, 0), tight), null);
});

check("one adult with three children fits a suite, never a child-only cabin", () => {
  const arrangement = autoArrange(guestsFor(1, 3), offers)!;
  assert.deepEqual(arrangement.cabins.map(cabin => cabin.roomType), ["Luxury Suite"]);
  assertHoldable(arrangement, 1, 3);
});

check("dropping a guest on a specific cabin places them exactly there", () => {
  const guests = guestsFor(2, 0);
  const next = ok(placeGuest(autoArrange(guests, offers)!, guests, "adult-2", { cabinId: KING(4) }, offers));
  assert.deepEqual(occupants(next, guests, KING(4)).map(guest => guest.id), ["adult-2"]);
  assert.equal(next.cabins.length, 2);
  const back = ok(placeGuest(next, guests, "adult-2", { cabinId: KING(0) }, offers));
  assert.equal(back.cabins.length, 1, "a cabin nobody is in leaves the selection");
});

check("dropping on a room type joins company before opening another cabin", () => {
  const guests = guestsFor(3, 0);
  let arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { roomType: "Luxury Suite" }, offers));
  arrangement = ok(placeGuest(arrangement, guests, "adult-2", { roomType: "Luxury Suite" }, offers));
  assert.equal(arrangement.cabins.length, 1);
  assert.equal(occupants(arrangement, guests, SUITE(0)).length, 2);
});

check("a cabin that is not free on the sailing, or is full, refuses the guest", () => {
  const guests = guestsFor(3, 0);
  const closed = placeGuest(EMPTY, guests, "adult-1", { cabinId: slotId("Luxury Twin Cabin", 2) }, offers);
  assert.ok("error" in closed);
  let arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: KING(0) }, offers));
  arrangement = ok(placeGuest(arrangement, guests, "adult-2", { cabinId: KING(0) }, offers));
  const full = placeGuest(arrangement, guests, "adult-3", { cabinId: KING(0) }, offers);
  assert.ok("error" in full && /full/i.test(full.error));
});

check("children alone in a cabin block the request until an adult joins", () => {
  const guests = guestsFor(1, 1);
  const withChild = ok(placeGuest(EMPTY, guests, "child-1", { cabinId: SUITE(0) }, offers));
  const issues = arrangementIssues(withChild, guests);
  assert.ok(issues.some(issue => /needs at least one adult/.test(issue)));
  assert.ok(issues.some(issue => /1 guest still needs a cabin/.test(issue)));
});

check("emptying a cabin sends its guests back to wait", () => {
  const guests = guestsFor(2, 0);
  const cleared = clearCabin(autoArrange(guests, offers)!, KING(0));
  assert.equal(unplacedGuests(cleared, guests).length, 2);
  assert.equal(cleared.cabins.length, 0);
});

check("menus move guests the same way a drag does", () => {
  const guests = guestsFor(3, 0);
  const start = autoArrange(guests, offers)!; // one suite with all three adults
  const suite = start.cabins[0].id;
  const lowered = ok(setCabinCount(start, guests, suite, "adult", 1, offers));
  assert.equal(unplacedGuests(lowered, guests).length, 2, "lowering sends guests to wait");
  const raised = ok(setCabinCount(lowered, guests, KING(1), "adult", 2, offers));
  assert.equal(occupants(raised, guests, KING(1)).length, 2, "raising takes waiting guests");
  assertHoldable(raised, 3, 0);
  const tooMany = setCabinCount(raised, guests, KING(2), "adult", 1, offers);
  assert.ok("error" in tooMany, "no waiting adult means no raise");
});

check("menu limits respect capacity, waiting guests and the three-child rule", () => {
  const guests = guestsFor(1, 4);
  let arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: SUITE(0) }, offers));
  assert.equal(cabinCountLimit(arrangement, guests, SUITE(0), "child"), 3);
  assert.equal(cabinCountLimit(arrangement, guests, KING(0), "adult"), 0);
  arrangement = ok(setCabinCount(arrangement, guests, SUITE(0), "child", 3, offers));
  assert.equal(cabinCountLimit(arrangement, guests, SUITE(0), "child"), 3);
  const fourth = placeGuest(arrangement, guests, "child-4", { cabinId: SUITE(0) }, offers);
  assert.ok("error" in fourth);
});

check("shrinking the party removes waiting guests first; growing keeps every tile", () => {
  const guests = guestsFor(3, 1);
  let arrangement = autoArrange(guests, offers)!;
  arrangement = unplaceGuest(arrangement, "adult-2");
  const smaller = resizeParty(arrangement, guests, 2, 1);
  assert.equal(unplacedGuests(smaller, guestsFor(2, 1)).length, 0, "the waiting adult was the one removed");
  const larger = resizeParty(arrangement, guests, 4, 1);
  assert.equal(larger.placement["adult-3"], arrangement.placement["adult-3"], "growing does not renumber");
  assert.equal(unplacedGuests(larger, guestsFor(4, 1)).length, 2);
});

check("fresh availability closes gaps and trims cabins another guest just booked", () => {
  const guests = guestsFor(4, 0);
  let arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: KING(5) }, offers));
  arrangement = ok(placeGuest(arrangement, guests, "adult-2", { cabinId: KING(3) }, offers));
  const { next, removed } = fitToOffers(arrangement, { ...offers, "Luxury King Cabin": { available: 1, priceCents: 700_000 } });
  assert.deepEqual(removed, ["Luxury King Cabin"]);
  assert.deepEqual(next.cabins.map(cabin => cabin.id), [KING(0)]);
});

check("passenger rows point at the same room index the hold stores", () => {
  const guests = guestsFor(3, 2);
  const arrangement = autoArrange(guests, offers)!;
  const names = Object.fromEntries(guests.map(guest => [guest.id, `Guest ${guest.id}`]));
  const passengers = passengersPayload(arrangement, guests, names);
  const rooms = roomsPayload(arrangement, guests);
  assert.equal(passengers.length, 5);
  rooms.forEach((room, index) => {
    const inRoom = passengers.filter(passenger => passenger.roomIndex === index);
    assert.equal(inRoom.filter(passenger => !passenger.isChild).length, room.adults);
    assert.equal(inRoom.filter(passenger => passenger.isChild).length, room.children);
  });
});

check("the preview payment plan matches the database stages", () => {
  const departure = new Date("2027-03-06T00:00:00Z");
  const plan = paymentSchedule(1_750_000, departure, new Date("2026-09-16T12:00:00Z"));
  assert.deepEqual(plan.milestones.map(stage => stage.cumulativeCents), [525_000, 875_000, 1_750_000]);
  const late = paymentSchedule(1_750_000, departure, new Date("2027-02-01T12:00:00Z"));
  assert.deepEqual(late.milestones.map(stage => stage.cumulativeCents), [1_750_000]);
});

console.log(`\n${passed} allocation checks passed.`);
