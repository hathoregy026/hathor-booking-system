"use client";

import { Minus, Plus } from "lucide-react";
import {
  DEFAULT_ROOM_SEARCH_CONFIG,
  LUXURY_ROOM_TYPE_OPTIONS,
  type RoomSearchConfig,
} from "@/lib/booking-search-config";
import {
  clampRoomSearchConfig,
  getMaxCapacityForLuxuryType,
  getRoomGuestTotal,
} from "@/lib/room-capacity";

type BookingGuestsPanelProps = {
  rooms: RoomSearchConfig[];
  onChange: (rooms: RoomSearchConfig[]) => void;
  onDone: () => void;
  maxRooms?: number;
};

function CounterRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="booking-counter-btn"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="booking-counter-btn"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function BookingGuestsPanel({
  rooms,
  onChange,
  onDone,
  maxRooms = 5,
}: BookingGuestsPanelProps) {
  const updateRoom = (index: number, patch: Partial<RoomSearchConfig>) => {
    onChange(
      rooms.map((room, roomIndex) =>
        roomIndex === index
          ? clampRoomSearchConfig({ ...room, ...patch })
          : room,
      ),
    );
  };

  const addRoom = () => {
    if (rooms.length >= maxRooms) return;
    onChange([...rooms, { ...DEFAULT_ROOM_SEARCH_CONFIG }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length <= 1) return;
    onChange(rooms.filter((_, roomIndex) => roomIndex !== index));
  };

  return (
    <div className="booking-guests-panel">
      <div className="space-y-4">
        {rooms.map((room, index) => {
          const maxGuests = getMaxCapacityForLuxuryType(room.roomType);
          const guestTotal = getRoomGuestTotal(room);
          const remainingAdultSlots = Math.max(1, maxGuests - room.children);
          const remainingChildSlots = Math.max(0, maxGuests - room.adults);

          return (
            <div key={index} className="booking-guests-room">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--booking-muted)]">
                  Room {index + 1}
                </p>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="text-xs font-medium text-[var(--booking-muted)] transition hover:text-[var(--booking-navy)]"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor={`room-type-${index}`}
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--booking-muted)]"
                  >
                    Room Types
                  </label>
                  <select
                    id={`room-type-${index}`}
                    value={room.roomType}
                    onChange={(event) =>
                      updateRoom(index, {
                        roomType: event.target
                          .value as RoomSearchConfig["roomType"],
                      })
                    }
                    className="booking-widget-select w-full"
                  >
                    <option value="" disabled>
                      Select room type
                    </option>
                    {LUXURY_ROOM_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} (max{" "}
                        {getMaxCapacityForLuxuryType(option.value)} guests)
                      </option>
                    ))}
                  </select>
                </div>

                <CounterRow
                  label="Adults"
                  value={room.adults}
                  min={1}
                  max={remainingAdultSlots}
                  onChange={(adults) => updateRoom(index, { adults })}
                />
                <CounterRow
                  label="Children"
                  value={room.children}
                  min={0}
                  max={remainingChildSlots}
                  onChange={(children) => updateRoom(index, { children })}
                />

                <p className="text-[11px] text-[var(--booking-muted)]">
                  {guestTotal} of {maxGuests} guests allowed for this room type
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--booking-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addRoom}
          disabled={rooms.length >= maxRooms}
          className="booking-btn-outline px-4 py-2 text-sm disabled:opacity-50"
        >
          + Add Room
        </button>
        <button
          type="button"
          onClick={onDone}
          className="booking-btn-primary w-full px-8 py-3 text-sm tracking-wide uppercase sm:w-auto sm:py-2.5"
        >
          DONE
        </button>
      </div>
    </div>
  );
}
