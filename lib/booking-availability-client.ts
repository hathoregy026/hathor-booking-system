import {
  AvailabilityResponse,
  flattenPeriodSearchRooms,
  type AvailableRoom,
} from "@/lib/booking-types";
import {
  buildAvailabilityQueryParams,
  buildPeriodSearchQueryParams,
  describeRoomTypesOnCruise,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import type { CruiseSearchResponse } from "@/lib/cruise-search";

export function getAvailabilityErrorMessage(
  reason?: AvailabilityResponse["reason"],
  duration?: StayDurationValue | "",
): string {
  switch (reason) {
    case "NO_ROOMS":
      return "This cruise has no rooms yet. Add rooms in the admin dashboard, then search again.";
    case "NO_MATCHING_ROOMS":
      if (duration) {
        return `No rooms match your selected room type or guest count. This itinerary offers ${describeRoomTypesOnCruise(duration)} — try one of those, or reduce guests.`;
      }
      return "No rooms match your selected room types or guest count. Try different room types or fewer guests.";
    case "FULLY_BOOKED":
      return "All matching rooms are booked for the selected dates. Try different dates or room types.";
    case "NO_SCHEDULES":
      return "No sailings are scheduled within your selected travel period. Try different dates.";
    case "CRUISE_NOT_FOUND":
      return "No cruise matches the selected length of stay.";
    default:
      return "No rooms available for the selected dates. Try different dates.";
  }
}

function toAvailabilityResponse(
  data: CruiseSearchResponse,
): AvailabilityResponse & { error?: string; cruises?: CruiseSearchResponse["cruises"] } {
  return {
    cruiseId: data.cruiseId,
    startDate: data.startDate,
    endDate: data.endDate,
    schedules: data.schedules,
    reason: data.reason,
    cruises: data.cruises,
  };
}

export async function fetchAvailabilitySearch(
  duration: StayDurationValue,
  checkInDate: string,
  roomConfigs: RoomSearchConfig[],
): Promise<
  AvailabilityResponse & {
    error?: string;
    cruises?: CruiseSearchResponse["cruises"];
  }
> {
  const params = buildAvailabilityQueryParams(
    duration,
    checkInDate,
    roomConfigs,
  );

  const response = await fetch(`/api/cruises?${params.toString()}`);
  const data = (await response.json()) as CruiseSearchResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to check availability");
  }

  return toAvailabilityResponse(data);
}

export async function fetchPeriodAvailabilitySearch(
  periodStart: string,
  periodEnd: string,
  roomConfigs: RoomSearchConfig[],
): Promise<
  AvailabilityResponse & {
    error?: string;
    cruises?: CruiseSearchResponse["cruises"];
    availableRooms?: AvailableRoom[];
  }
> {
  const params = buildPeriodSearchQueryParams(
    periodStart,
    periodEnd,
    roomConfigs,
  );

  const response = await fetch(`/api/cruises?${params.toString()}`);
  const data = (await response.json()) as CruiseSearchResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to check availability");
  }

  const availableRooms = flattenPeriodSearchRooms(data.cruises ?? []);
  const schedules = data.schedules ?? [];

  return {
    ...toAvailabilityResponse(data),
    cruises: data.cruises,
    availableRooms,
    schedules,
    cruiseId: data.cruises?.[0]?.id ?? data.cruiseId,
  };
}
