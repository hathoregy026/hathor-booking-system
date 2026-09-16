import {
  canAssignRoomConfigs,
  resolveCruiseByDuration,
} from "@/lib/availability-search";
import {
  freeCabinsOf,
  getSailingAvailability,
  type SailingAvailability,
} from "@/lib/availability-service";
import {
  normalizeRoomConfigsForDuration,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import {
  departureDateKeyFromTime,
  departureWeekdayForDuration,
  isValidDepartureDateKey,
  utcDateKeyToDate,
} from "@/lib/departure-dates";
import { utcDateKeyFromDate, utcNow } from "@/lib/dates";

export type CruiseCalendarDayStatus = "available" | "booked" | "closed";

export type CruiseCalendarDay = {
  /** UTC calendar date key yyyy-MM-dd */
  date: string;
  priceCents: number;
  status: CruiseCalendarDayStatus;
};

const dayMs = 86_400_000;

function enumerateUtcDateKeys(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()),
  );
  const end = new Date(
    Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()),
  );

  while (cursor <= end) {
    keys.push(utcDateKeyFromDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

/** Cheapest cabin type that can actually host the request on this sailing. */
function priceForRequest(
  sailing: SailingAvailability,
  roomConfigs: RoomSearchConfig[],
): number | null {
  const fitting = sailing.types.filter(type =>
    roomConfigs.some(config => type.maxOccupancy >= config.adults + config.children),
  );
  const pool = fitting.length > 0 ? fitting : sailing.types;
  return pool.length > 0 ? Math.min(...pool.map(type => type.priceCents)) : null;
}

/**
 * Calendar days come from the same availability service as the booking flow,
 * so a day can never show "available" while checkout reports it sold out.
 */
export async function getCruiseCalendarDays(input: {
  duration: StayDurationValue;
  roomConfigs: RoomSearchConfig[];
  roomId?: string;
  from: Date;
  to: Date;
}): Promise<{
  days: CruiseCalendarDay[];
  departureDay: "Wednesday" | "Saturday";
  cruiseId: string | null;
}> {
  const departureDay = departureWeekdayForDuration(input.duration);
  const roomConfigs = normalizeRoomConfigsForDuration(
    input.duration,
    input.roomConfigs,
  );
  const todayKey = utcDateKeyFromDate(utcNow());
  const dateKeys = enumerateUtcDateKeys(input.from, input.to);
  const rangeStart = utcDateKeyToDate(dateKeys[0] ?? todayKey);
  const rangeEnd = new Date(
    utcDateKeyToDate(dateKeys[dateKeys.length - 1] ?? todayKey).getTime() + dayMs,
  );

  const sailings = await getSailingAvailability({
    duration: input.duration,
    from: rangeStart,
    to: rangeEnd,
    roomConfigs,
    roomId: input.roomId ?? null,
  });

  const sailingsByDate = new Map<string, SailingAvailability[]>();
  for (const sailing of sailings) {
    const key = departureDateKeyFromTime(new Date(sailing.departureTime));
    const bucket = sailingsByDate.get(key) ?? [];
    bucket.push(sailing);
    sailingsByDate.set(key, bucket);
  }

  const prices = sailings
    .map(sailing => priceForRequest(sailing, roomConfigs))
    .filter((price): price is number => price !== null);
  const indicativePriceCents = prices.length > 0 ? Math.min(...prices) : 0;

  const cruiseId =
    sailings[0]?.cruiseId ??
    (await resolveCruiseByDuration(input.duration))?.id ??
    null;

  const days: CruiseCalendarDay[] = dateKeys.map(date => {
    if (date < todayKey || !isValidDepartureDateKey(date, input.duration)) {
      return { date, priceCents: indicativePriceCents, status: "closed" };
    }

    const daySailings = sailingsByDate.get(date) ?? [];
    if (daySailings.length === 0) {
      return { date, priceCents: indicativePriceCents, status: "closed" };
    }

    const openSailing = daySailings.find(sailing =>
      canAssignRoomConfigs(freeCabinsOf(sailing), roomConfigs),
    );

    return {
      date,
      priceCents:
        priceForRequest(openSailing ?? daySailings[0], roomConfigs) ??
        indicativePriceCents,
      status: openSailing ? "available" : "booked",
    };
  });

  return { days, departureDay, cruiseId };
}

export function calendarMetaFromLocalDate(
  date: Date,
  daysByDate: Map<string, CruiseCalendarDay>,
): CruiseCalendarDay | undefined {
  const key = utcDateKeyFromDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
  return daysByDate.get(key);
}
