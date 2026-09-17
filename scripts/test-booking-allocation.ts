import assert from "node:assert/strict";
import {
  arrangementIssues,
  arrangementTotal,
  autoArrange,
  cabinCountOptions,
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
  unplacedGuests,
  type Arrangement,
  type Offers,
} from "../components/booking/journey/allocation";
import { internationalPhone } from "../components/booking/journey/model";
import { findCountry, COUNTRIES } from "../lib/countries";
import { paymentSchedule } from "../lib/payment-schedule";
import { roomCapacity } from "../lib/physical-inventory";

/**
 * Guest-to-cabin rules behind the Guests & Suites screen, plus the phone number
 * the details form sends. Pure logic only: no database, no network.
 *
 * Guests are created by the Who Is Travelling counters and wait there. Dragging
 * and a cabin's Adults/Children menu are two ways of doing the same thing: they
 * share one count and one limit, and neither can push a cabin past its size.
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

check("new guests wait in Who Is Travelling until they are placed", () => {
  const guests = guestsFor(2, 1);
  assert.equal(unplacedGuests(EMPTY, guests).length, 3);
  assert.deepEqual(arrangementIssues(EMPTY, guests), ["3 guests still need a cabin."]);
});

check("a guest goes exactly into the cabin card they were dropped on", () => {
  const guests = guestsFor(2, 0);
  const arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: KING(3) }, offers));
  assert.deepEqual(arrangement.cabins.map(cabin => cabin.id), [KING(3)]);
  assert.equal(cabinLabel(KING(3)), "King Cabin 4");
});

check("dragging and the menu share one count: drag one, choose 2, the cabin has 2", () => {
  const guests = guestsFor(3, 0);
  const dragged = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: KING(0) }, offers));
  const chosen = setCabinCount(dragged, guests, KING(0), "adult", 2, offers);
  assert.ok("next" in chosen);
  const inside = occupants(chosen.next, guests, KING(0));
  assert.equal(inside.length, 2);
  assert.ok(inside.some(guest => guest.id === "adult-1"), "the dragged guest stays");
});

check("neither way can go past a cabin's limit", () => {
  const guests = guestsFor(3, 0);
  const viaMenu = setCabinCount(EMPTY, guests, KING(0), "adult", 2, offers);
  assert.ok("next" in viaMenu);
  const dragThird = placeGuest(viaMenu.next, guests, "adult-3", { cabinId: KING(0) }, offers);
  assert.ok("error" in dragThird && /up to 2/.test(dragThird.error));
  const menuThree = setCabinCount(viaMenu.next, guests, KING(0), "adult", 3, offers);
  assert.ok("error" in menuThree);
  assert.equal(cabinCountOptions(viaMenu.next, guests, KING(0), "adult").limit, 2);
});

check("the menu uses guests who are waiting and never creates new ones", () => {
  const guests = guestsFor(1, 0);
  const options = cabinCountOptions(EMPTY, guests, SUITE(0), "adult");
  assert.deepEqual(options, { current: 0, limit: 4, reachable: 1 });
  const tooMany = setCabinCount(EMPTY, guests, SUITE(0), "adult", 2, offers);
  assert.ok("error" in tooMany && /Only 1 adult is waiting/.test(tooMany.error));
});

check("lowering the menu sends guests back to wait, not out of the party", () => {
  const guests = guestsFor(2, 0);
  const two = setCabinCount(EMPTY, guests, KING(0), "adult", 2, offers);
  assert.ok("next" in two);
  const one = setCabinCount(two.next, guests, KING(0), "adult", 1, offers);
  assert.ok("next" in one);
  assert.equal(occupants(one.next, guests, KING(0)).length, 1);
  assert.equal(unplacedGuests(one.next, guests).length, 1);
});

check("children follow the three-per-cabin rule and need an adult", () => {
  const guests = guestsFor(1, 4);
  assert.equal(cabinCountOptions(EMPTY, guests, SUITE(0), "child").limit, 3);
  const kids = setCabinCount(EMPTY, guests, SUITE(0), "child", 3, offers);
  assert.ok("next" in kids);
  assert.ok(arrangementIssues(kids.next, guests).some(issue => /needs at least one adult/.test(issue)));
  const withAdult = setCabinCount(kids.next, guests, SUITE(0), "adult", 1, offers);
  assert.ok("next" in withAdult);
  assert.equal(cabinCountOptions(withAdult.next, guests, SUITE(0), "child").limit, 3);
  assert.equal(cabinCountOptions(withAdult.next, guests, SUITE(0), "adult").limit, 1);
});

check("a cabin card that is not available on the date refuses guests", () => {
  const guests = guestsFor(1, 0);
  assert.ok("error" in placeGuest(EMPTY, guests, "adult-1", { cabinId: slotId("Luxury Twin Cabin", 2) }, offers));
  assert.ok("error" in setCabinCount(EMPTY, guests, slotId("Royal Suite", 5), "adult", 1, offers));
});

check("emptying a cabin sends its guests back to wait", () => {
  const guests = guestsFor(2, 0);
  const full = setCabinCount(EMPTY, guests, KING(2), "adult", 2, offers);
  assert.ok("next" in full);
  const cleared = clearCabin(full.next, KING(2));
  assert.equal(unplacedGuests(cleared, guests).length, 2);
  assert.equal(cleared.cabins.length, 0);
});

check("Arrange for me uses only the cabin types the guest chose", () => {
  const guests = guestsFor(3, 2);
  const suites = autoArrange(guests, offers, ["Luxury Suite"])!;
  assert.ok(suites.cabins.every(cabin => cabin.roomType === "Luxury Suite"));
  assertHoldable(suites, 3, 2);
  const kings = autoArrange(guests, offers, ["Luxury King Cabin"])!;
  assert.ok(kings.cabins.every(cabin => cabin.roomType === "Luxury King Cabin"));
  assertHoldable(kings, 3, 2);
  assert.equal(autoArrange(guestsFor(5, 0), offers, ["Luxury Twin Cabin"]), null, "two Twin Cabins cannot hold five");
  const mixed = autoArrange(guests, offers, ["Luxury King Cabin", "Luxury Suite"])!;
  assert.equal(arrangementTotal(mixed, offers), 1_750_000, "cheapest mix within the chosen types");
});

check("changing the party keeps placed guests; removals take waiting guests first", () => {
  const guests = guestsFor(3, 1);
  const placed = setCabinCount(EMPTY, guests, SUITE(0), "adult", 2, offers);
  assert.ok("next" in placed);
  const larger = resizeParty(placed.next, guests, 4, 1);
  assert.equal(occupants(larger, guestsFor(4, 1), SUITE(0)).length, 2);
  const smaller = resizeParty(placed.next, guests, 2, 0);
  assert.equal(occupants(smaller, guestsFor(2, 0), SUITE(0)).length, 2, "the waiting adult and child were removed");
});

check("fresh availability moves guests to a free card of the same type", () => {
  const guests = guestsFor(4, 0);
  let arrangement = ok(placeGuest(EMPTY, guests, "adult-1", { cabinId: KING(5) }, offers));
  arrangement = ok(placeGuest(arrangement, guests, "adult-2", { cabinId: KING(0) }, offers));
  const { next, removed } = fitToOffers(arrangement, { ...offers, "Luxury King Cabin": { available: 3, priceCents: 700_000 } });
  assert.deepEqual(removed, []);
  assert.deepEqual(next.cabins.map(cabin => cabin.id).sort(), [KING(0), KING(1)].sort());
  const gone = fitToOffers(arrangement, { ...offers, "Luxury King Cabin": { available: 1, priceCents: 700_000 } });
  assert.deepEqual(gone.removed, ["Luxury King Cabin"]);
  assert.equal(unplacedGuests(gone.next, guests).length, 3);
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

check("the country list carries dialling codes and the phone is sent in full", () => {
  assert.ok(COUNTRIES.length > 200);
  assert.equal(findCountry("EG")?.dial, "20");
  assert.equal(findCountry("US")?.dial, "1");
  assert.equal(findCountry("GB")?.dial, "44");
  assert.equal(internationalPhone("010 1234 5678", "20"), "+201012345678", "a leading trunk 0 is dropped");
  assert.equal(internationalPhone("+971 50 123 4567", "20"), "+971501234567", "a number typed with + wins");
});

check("the preview payment plan matches the database stages", () => {
  const departure = new Date("2027-03-06T00:00:00Z");
  const plan = paymentSchedule(1_750_000, departure, new Date("2026-09-16T12:00:00Z"));
  assert.deepEqual(plan.milestones.map(stage => stage.cumulativeCents), [525_000, 875_000, 1_750_000]);
  const late = paymentSchedule(1_750_000, departure, new Date("2027-02-01T12:00:00Z"));
  assert.deepEqual(late.milestones.map(stage => stage.cumulativeCents), [1_750_000]);
});

console.log(`\n${passed} allocation checks passed.`);
