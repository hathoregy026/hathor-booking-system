/**
 * Room-type classification checks (no test framework, matching the project's
 * existing verify-* convention).
 *
 * Guards the fix for the Royal Suite classification bug: the alias table is
 * matched by substring and "luxury-suites" lists the generic alias "Suite", so
 * a scan in object order classified "Luxury Royal Suite" as an ordinary suite
 * and made the "luxury-royal-suites" branch unreachable.
 *
 * Run: npm run verify:room-types
 */

import {
  classifyDbRoomType,
  dbRoomTypeMatchesLuxuryType,
  describeRoomTypesOnCruise,
  durationSupportsRoomType,
  luxuryRoomTypeForDbRoomType,
  LUXURY_TO_DB_ROOM_TYPES,
  STAY_DURATION_OPTIONS,
  type LuxuryRoomTypeValue,
  type StayDurationValue,
} from "../lib/booking-search-config";
import {
  getMaxCapacityForDbRoomType,
  MAX_GUESTS_PER_ROOM,
  resolveLuxuryTypeFromDbRoomType,
} from "../lib/room-capacity";
import { roomMatchesLuxuryType } from "../lib/availability-search";
import {
  getCanonicalPriceCents,
  getCanonicalPriceCentsForLuxuryType,
  RAW_DATA_CATEGORY_INVENTORY,
  RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD,
} from "../lib/booking-validation";
import {
  HATHOR_CRUISES,
  HATHOR_FOUR_NIGHT_CABIN_PRICES_USD,
} from "../lib/hathor-catalog";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("ok:", message);
  }
}

const ALL_LUXURY_TYPES: LuxuryRoomTypeValue[] = [
  "luxury-rooms",
  "luxury-suites",
  "luxury-royal-suites",
];

/* ------------------------------------------------------------------ */
/* 1. Classification — most specific category always wins              */
/* ------------------------------------------------------------------ */

const CASES: [string | null, LuxuryRoomTypeValue | null][] = [
  ["Luxury Room", "luxury-rooms"],
  ["Luxury King Bed", "luxury-rooms"],
  ["Luxury Twin Bed", "luxury-rooms"],

  ["Luxury Suite", "luxury-suites"],
  ["Suite", "luxury-suites"],
  ["Deluxe", "luxury-suites"],

  /* The regression this fix exists for — previously both "luxury-suites". */
  ["Luxury Royal Suite", "luxury-royal-suites"],
  ["Royal Suite", "luxury-royal-suites"],
  ["Presidential", "luxury-royal-suites"],

  /* Unmatched / absent input. */
  [null, null],
  ["", null],
  ["   ", null],
  ["Cabin", null],

  /*
   * Marketing ROOM_SHOWCASES display names — deliberately NOT aliases. Adding
   * them would change getMaxCapacityForDbRoomType from 4 to 2 for these labels,
   * which is a capacity change and a separate decision.
   */
  ["Luxury King Room", null],
  ["Luxury Twin Room", null],
];

for (const [label, expected] of CASES) {
  const actual = classifyDbRoomType(label);
  assert(
    actual === expected,
    `classifyDbRoomType(${JSON.stringify(label)}) === ${String(expected)} (got ${String(actual)})`,
  );
}

/* Case-insensitive and whitespace tolerant, as before. */
assert(
  classifyDbRoomType("  luxury royal suite  ") === "luxury-royal-suites",
  "classifier trims and lowercases",
);

/* ------------------------------------------------------------------ */
/* 2. Wrapper contracts unchanged                                      */
/* ------------------------------------------------------------------ */

assert(
  luxuryRoomTypeForDbRoomType("Cabin") === "luxury-rooms",
  "luxuryRoomTypeForDbRoomType keeps its luxury-rooms fallback",
);
assert(
  luxuryRoomTypeForDbRoomType(null) === "luxury-rooms",
  "luxuryRoomTypeForDbRoomType(null) keeps its luxury-rooms fallback",
);
assert(
  resolveLuxuryTypeFromDbRoomType("Cabin") === null,
  "resolveLuxuryTypeFromDbRoomType keeps its null contract",
);
assert(
  resolveLuxuryTypeFromDbRoomType(null) === null,
  "resolveLuxuryTypeFromDbRoomType(null) keeps its null contract",
);
assert(
  luxuryRoomTypeForDbRoomType("Luxury Royal Suite") === "luxury-royal-suites",
  "luxuryRoomTypeForDbRoomType classifies Royal Suite correctly (booking pre-selection)",
);

/* ------------------------------------------------------------------ */
/* 3. Every classifier and predicate agrees — one shared rule           */
/* ------------------------------------------------------------------ */

const ALL_LABELS: (string | null)[] = [
  ...CASES.map(([label]) => label),
  ...Object.values(LUXURY_TO_DB_ROOM_TYPES).flat(),
  ...HATHOR_CRUISES.flatMap((cruise) =>
    cruise.rooms.map((room) => room.roomType),
  ),
];

for (const label of ALL_LABELS) {
  const expected = classifyDbRoomType(label);

  assert(
    resolveLuxuryTypeFromDbRoomType(label) === expected,
    `resolveLuxuryTypeFromDbRoomType agrees for ${JSON.stringify(label)}`,
  );

  if (label !== null) {
    assert(
      luxuryRoomTypeForDbRoomType(label) === (expected ?? "luxury-rooms"),
      `luxuryRoomTypeForDbRoomType agrees for ${JSON.stringify(label)}`,
    );
  }

  for (const type of ALL_LUXURY_TYPES) {
    const shared = dbRoomTypeMatchesLuxuryType(label, type);
    assert(
      shared === (expected === type),
      `dbRoomTypeMatchesLuxuryType(${JSON.stringify(label)}, ${type}) agrees`,
    );
    assert(
      roomMatchesLuxuryType(label, type) === shared,
      `availability roomMatchesLuxuryType(${JSON.stringify(label)}, ${type}) agrees`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 4. Real catalog data                                                 */
/* ------------------------------------------------------------------ */

for (const cruise of HATHOR_CRUISES) {
  const classified = cruise.rooms.map((room) => ({
    roomType: room.roomType,
    luxuryType: classifyDbRoomType(room.roomType),
  }));

  for (const entry of classified) {
    assert(
      entry.luxuryType !== null,
      `${cruise.slug}: "${entry.roomType}" classifies to a category`,
    );
  }

  for (const type of ALL_LUXURY_TYPES) {
    assert(
      classified.some((entry) => entry.luxuryType === type),
      `${cruise.slug}: offers ${type}`,
    );
    assert(
      durationSupportsRoomType(cruise.slug as StayDurationValue, type),
      `${cruise.slug}: durationSupportsRoomType(${type})`,
    );
  }

  const royal = classified.filter(
    (entry) => entry.luxuryType === "luxury-royal-suites",
  );
  assert(
    royal.length === 1 && royal[0].roomType === "Luxury Royal Suite",
    `${cruise.slug}: exactly one Royal Suite category room`,
  );
}

for (const option of STAY_DURATION_OPTIONS) {
  const described = describeRoomTypesOnCruise(option.value);
  assert(
    described.includes("Luxury Rooms") &&
      described.includes("Luxury Suites") &&
      described.includes("Luxury Royal Suites"),
    `describeRoomTypesOnCruise(${option.value}) lists all three categories`,
  );
}

/* ------------------------------------------------------------------ */
/* 5. PRICE REGRESSION — the 4-night Royal Suite must stay $7,200       */
/* ------------------------------------------------------------------ */

const FOUR_NIGHT = "4-nights-luxor-aswan" as const;
const ROYAL_4N_EXPECTED_CENTS = 7200 * 100;

assert(
  HATHOR_FOUR_NIGHT_CABIN_PRICES_USD.luxuryRoyalSuite === 7200,
  "published 4-night Royal Suite catalog price is $7,200",
);
assert(
  RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD === 7200,
  "RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD is pinned to the published $7,200",
);
assert(
  getCanonicalPriceCents(FOUR_NIGHT, "Luxury Royal Suite") ===
    ROYAL_4N_EXPECTED_CENTS,
  "getCanonicalPriceCents(4-night, Luxury Royal Suite) === 720000 cents ($7,200)",
);
assert(
  getCanonicalPriceCentsForLuxuryType(FOUR_NIGHT, "luxury-royal-suites") ===
    ROYAL_4N_EXPECTED_CENTS,
  "getCanonicalPriceCentsForLuxuryType(4-night, royal) === 720000 cents ($7,200)",
);

/* No other price moved: every catalog room still prices to its catalog value. */
for (const cruise of HATHOR_CRUISES) {
  for (const room of cruise.rooms) {
    assert(
      getCanonicalPriceCents(cruise.slug as StayDurationValue, room.roomType) ===
        room.priceCents,
      `${cruise.slug}: "${room.roomType}" canonical price === ${room.priceCents} cents`,
    );
  }
}

/* Every category on every itinerary now resolves a price (royal was null). */
for (const cruise of HATHOR_CRUISES) {
  for (const type of ALL_LUXURY_TYPES) {
    assert(
      getCanonicalPriceCentsForLuxuryType(cruise.slug as StayDurationValue, type) !== null,
      `${cruise.slug}: ${type} has a canonical price`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 6. INVENTORY — Suites and Royal Suites are separate buckets          */
/* ------------------------------------------------------------------ */

assert(
  RAW_DATA_CATEGORY_INVENTORY["luxury-rooms"] === 8,
  "inventory: 8 Luxury Cabins",
);
assert(
  RAW_DATA_CATEGORY_INVENTORY["luxury-suites"] === 2,
  "inventory: 2 Luxury Suites",
);
assert(
  RAW_DATA_CATEGORY_INVENTORY["luxury-royal-suites"] === 2,
  "inventory: 2 Royal Suites",
);
assert(
  classifyDbRoomType("Luxury Suite") !== classifyDbRoomType("Luxury Royal Suite"),
  "inventory: Suites and Royal Suites no longer share one bucket",
);
assert(
  !dbRoomTypeMatchesLuxuryType("Luxury Royal Suite", "luxury-suites"),
  "inventory: a Royal Suite no longer consumes Luxury Suite inventory",
);
assert(
  dbRoomTypeMatchesLuxuryType("Luxury Royal Suite", "luxury-royal-suites"),
  "inventory: a Royal Suite consumes Royal Suite inventory",
);

/* ------------------------------------------------------------------ */
/* 7. Search / filter behaviour                                         */
/* ------------------------------------------------------------------ */

assert(
  roomMatchesLuxuryType("Luxury Royal Suite", "luxury-suites") === false,
  "search: a Suite filter no longer returns Royal Suites",
);
assert(
  roomMatchesLuxuryType("Luxury Royal Suite", "luxury-royal-suites") === true,
  "search: a Royal Suite filter returns Royal Suites",
);
assert(
  roomMatchesLuxuryType("Luxury Suite", "luxury-suites") === true,
  "search: a Suite filter still returns Luxury Suites (unchanged)",
);
assert(
  roomMatchesLuxuryType("Luxury King Bed", "luxury-rooms") === true,
  "search: a Rooms filter still returns Luxury Rooms (unchanged)",
);
assert(
  roomMatchesLuxuryType(null, "luxury-rooms") === false,
  "search: a null roomType stays unmatched (unchanged)",
);

/* ------------------------------------------------------------------ */
/* 8. Capacity must NOT have changed                                    */
/* ------------------------------------------------------------------ */

assert(
  getMaxCapacityForDbRoomType("Luxury Room") === 2,
  "capacity: Luxury Room still 2",
);
assert(
  getMaxCapacityForDbRoomType("Luxury Suite") === 4,
  "capacity: Luxury Suite still 4",
);
assert(
  getMaxCapacityForDbRoomType("Luxury Royal Suite") === 4,
  "capacity: Luxury Royal Suite still 4 (suites and royal suites share a limit)",
);
assert(
  getMaxCapacityForDbRoomType("Luxury King Room") === MAX_GUESTS_PER_ROOM,
  "capacity: unmatched labels still fall back to MAX_GUESTS_PER_ROOM",
);

if (process.exitCode) {
  console.error("\nRoom-type classification verification failed.");
} else {
  console.log("\nRoom-type classification verification passed.");
}
