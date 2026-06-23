import { create } from "zustand";
import {
  AvailabilityResponse,
  AvailableRoom,
  computeTotalPrice,
  flattenAvailableRooms,
  flattenPeriodSearchRooms,
  getScheduleIdForSelection,
} from "@/lib/booking-types";
import {
  createDefaultRoomConfigs,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { departureTimeToCheckInDate } from "@/lib/dates";
import type { CruiseSearchItem } from "@/lib/cruise-search";

export type BookingSearchMode = "exact" | "period";

export type PassengerDetails = {
  name: string;
  email: string;
};

type BookingStore = {
  step: 1 | 2 | 3;
  isSuccess: boolean;
  searchMode: BookingSearchMode;
  duration: StayDurationValue | "";
  checkInDate: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  roomConfigs: RoomSearchConfig[];
  searchAttempted: boolean;
  selectedCruiseId: string;
  startDate: string | null;
  endDate: string | null;
  availableSchedules: AvailabilityResponse["schedules"];
  availableRooms: AvailableRoom[];
  selectedRoomIds: string[];
  selectedScheduleId: string | null;
  passengerDetails: PassengerDetails;
  holdExpiresAt: string | null;
  bookingId: string | null;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;

  setStep: (step: 1 | 2 | 3) => void;
  setSearchMode: (mode: BookingSearchMode) => void;
  setDuration: (duration: StayDurationValue | "") => void;
  setCheckInDate: (iso: string | null) => void;
  setPeriodStart: (iso: string | null) => void;
  setPeriodEnd: (iso: string | null) => void;
  setRoomConfigs: (rooms: RoomSearchConfig[]) => void;
  setSearchAttempted: (attempted: boolean) => void;
  setSelectedCruiseId: (id: string) => void;
  setStartDate: (iso: string | null) => void;
  setEndDate: (iso: string | null) => void;
  setAvailability: (data: AvailabilityResponse) => void;
  setPeriodAvailability: (
    data: AvailabilityResponse & { cruises?: CruiseSearchItem[] },
  ) => void;
  toggleRoomSelection: (selectionKey: string) => void;
  setPassengerDetails: (details: Partial<PassengerDetails>) => void;
  setHoldExpiresAt: (iso: string | null) => void;
  setBookingId: (id: string | null) => void;
  setTotalPrice: (price: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  recalculateTotal: () => void;
  resetBooking: () => void;
};

const initialPassengerDetails: PassengerDetails = {
  name: "",
  email: "",
};

const initialState = {
  step: 1 as const,
  isSuccess: false,
  searchMode: "exact" as BookingSearchMode,
  duration: "" as StayDurationValue | "",
  checkInDate: null,
  periodStart: null,
  periodEnd: null,
  roomConfigs: createDefaultRoomConfigs(1),
  searchAttempted: false,
  selectedCruiseId: "",
  startDate: null,
  endDate: null,
  availableSchedules: [] as AvailabilityResponse["schedules"],
  availableRooms: [] as AvailableRoom[],
  selectedRoomIds: [] as string[],
  selectedScheduleId: null as string | null,
  passengerDetails: initialPassengerDetails,
  holdExpiresAt: null as string | null,
  bookingId: null as string | null,
  totalPrice: 0,
  isLoading: false,
  error: null as string | null,
};

function applySelectedSailingContext(
  room: AvailableRoom,
): Partial<BookingStore> {
  const updates: Partial<BookingStore> = {
    selectedScheduleId: room.scheduleId,
    startDate: room.departureTime,
    endDate: room.arrivalTime,
  };

  if (room.cruiseId) {
    updates.selectedCruiseId = room.cruiseId;
  }

  if (room.duration) {
    updates.duration = room.duration;
  }

  updates.checkInDate = departureTimeToCheckInDate(room.departureTime);

  return updates;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step, error: null }),

  setSearchMode: (mode) =>
    set({
      searchMode: mode,
      searchAttempted: false,
      error: null,
      availableSchedules: [],
      availableRooms: [],
      selectedRoomIds: [],
      selectedScheduleId: null,
      totalPrice: 0,
    }),

  setDuration: (duration) => set({ duration }),

  setCheckInDate: (iso) => set({ checkInDate: iso }),

  setPeriodStart: (iso) => set({ periodStart: iso }),

  setPeriodEnd: (iso) => set({ periodEnd: iso }),

  setRoomConfigs: (rooms) => set({ roomConfigs: rooms }),

  setSearchAttempted: (attempted) => set({ searchAttempted: attempted }),

  setSelectedCruiseId: (id) => set({ selectedCruiseId: id }),

  setStartDate: (iso) => set({ startDate: iso }),

  setEndDate: (iso) => set({ endDate: iso }),

  setAvailability: (data) => {
    const rooms = flattenAvailableRooms(data.schedules);
    set({
      availableSchedules: data.schedules,
      availableRooms: rooms,
      selectedRoomIds: [],
      selectedScheduleId: null,
      totalPrice: 0,
    });
  },

  setPeriodAvailability: (data) => {
    const rooms = data.cruises?.length
      ? flattenPeriodSearchRooms(data.cruises)
      : flattenAvailableRooms(data.schedules);

    set({
      availableSchedules: data.schedules,
      availableRooms: rooms,
      selectedRoomIds: [],
      selectedScheduleId: null,
      totalPrice: 0,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  },

  toggleRoomSelection: (selectionKey) => {
    const { selectedRoomIds, availableRooms, searchMode } = get();
    const nextIds = selectedRoomIds.includes(selectionKey)
      ? selectedRoomIds.filter((id) => id !== selectionKey)
      : [...selectedRoomIds, selectionKey];

    const scheduleId = getScheduleIdForSelection(availableRooms, nextIds);
    const selectedRoom = availableRooms.find(
      (room) => (room.selectionKey ?? room.id) === selectionKey || room.id === selectionKey,
    );

    const updates: Partial<BookingStore> = {
      selectedRoomIds: nextIds,
      selectedScheduleId: scheduleId,
      totalPrice: computeTotalPrice(availableRooms, nextIds),
    };

    if (searchMode === "period" && selectedRoom && nextIds.includes(selectionKey)) {
      Object.assign(updates, applySelectedSailingContext(selectedRoom));
    }

    set(updates);
  },

  setPassengerDetails: (details) =>
    set((state) => ({
      passengerDetails: { ...state.passengerDetails, ...details },
    })),

  setHoldExpiresAt: (iso) => set({ holdExpiresAt: iso }),

  setBookingId: (id) => set({ bookingId: id }),

  setTotalPrice: (price) => set({ totalPrice: price }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setSuccess: (success) => set({ isSuccess: success }),

  recalculateTotal: () => {
    const { availableRooms, selectedRoomIds } = get();
    set({ totalPrice: computeTotalPrice(availableRooms, selectedRoomIds) });
  },

  resetBooking: () => set({ ...initialState }),
}));

export function getSelectedRooms(
  availableRooms: AvailableRoom[],
  selectedKeys: string[],
): AvailableRoom[] {
  return availableRooms.filter((room) =>
    selectedKeys.some(
      (key) => (room.selectionKey ?? room.id) === key || room.id === key,
    ),
  );
}
