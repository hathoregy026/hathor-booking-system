"use client";

import { BookingGuestsPanel } from "@/components/booking/BookingGuestsPanel";
import type { RoomSearchConfig } from "@/lib/booking-search-config";

type GuestRoomSelectorProps = {
  rooms: RoomSearchConfig[];
  onChange: (rooms: RoomSearchConfig[]) => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function GuestRoomSelector({
  rooms,
  onChange,
  onConfirm,
  isLoading = false,
}: GuestRoomSelectorProps) {
  return (
    <div className="hathor-guest-selector">
      <div className="hathor-guest-selector__intro">
        <p className="hathor-guest-selector__eyebrow">Step 3</p>
        <h3 className="hathor-guest-selector__title">Guests &amp; Rooms</h3>
        <p className="hathor-guest-selector__text">
          Configure each cabin and guest count. Hathor offers up to four rooms per
          reservation.
        </p>
      </div>

      <BookingGuestsPanel
        rooms={rooms}
        onChange={onChange}
        onDone={onConfirm}
        maxRooms={4}
        doneLabel="Find Available Rooms"
      />

      {isLoading ? (
        <p className="hathor-guest-selector__loading" aria-live="polite">
          Checking availability…
        </p>
      ) : null}
    </div>
  );
}
