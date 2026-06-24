"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  BedDouble,
  Loader2,
  Ship,
  Tag,
  Users,
  Wifi,
} from "lucide-react";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { getScheduleIdForSelection, type AvailableRoom } from "@/lib/booking-types";
import {
  findStayDurationOption,
  formatGuestsSummary,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import type { RoomSearchConfig } from "@/lib/booking-search-config";
import type { BookingSearchMode } from "@/store/bookingStore";

const ROOM_PLACEHOLDER =
  "linear-gradient(135deg, #8b6914 0%, #c9a96e 45%, #f5ecd8 100%)";

type BookingSearchResultsProps = {
  searchMode: BookingSearchMode;
  cruiseId: string;
  duration: StayDurationValue | "";
  checkInDate: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  startDate: string | null;
  endDate: string | null;
  roomConfigs: RoomSearchConfig[];
  availableRooms: AvailableRoom[];
  selectedRoomIds: string[];
  onToggleRoom: (roomId: string) => void;
  onContinue: () => void;
  isLoading: boolean;
  searchAttempted: boolean;
  error: string | null;
  heroImageUrl?: string | null;
};

export function BookingSearchResults({
  searchMode,
  cruiseId,
  duration,
  checkInDate,
  periodStart,
  periodEnd,
  startDate,
  endDate,
  roomConfigs,
  availableRooms,
  selectedRoomIds,
  onToggleRoom,
  onContinue,
  isLoading,
  searchAttempted,
  error,
  heroImageUrl = null,
}: BookingSearchResultsProps) {
  if (!searchAttempted && !isLoading) {
    return null;
  }

  const durationLabel = duration
    ? findStayDurationOption(duration)?.label
    : null;

  const resultsTitle =
    searchMode === "period"
      ? "Sailings in your period"
      : durationLabel ?? "Search results";

  return (
    <section
      id="booking-search-results"
      className="booking-search-results"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="booking-search-results__header">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--booking-muted)" }}
          >
            Available cruises & rooms
          </p>
          <h2 className="booking-serif mt-1 text-xl font-semibold sm:text-3xl">
            {resultsTitle}
          </h2>
          <p className="mt-2 break-words text-sm" style={{ color: "var(--booking-muted)" }}>
            {searchMode === "period" && periodStart && periodEnd ? (
              <>
                Travel period {formatUtcDate(periodStart)} –{" "}
                {formatUtcDate(periodEnd)}
              </>
            ) : checkInDate && startDate && endDate ? (
              <>
                Check-in {formatUtcDate(checkInDate)} · Stay{" "}
                {formatUtcDate(startDate)} – {formatUtcDate(endDate)}
              </>
            ) : (
              "Refine your search to see matching sailings."
            )}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--booking-muted)" }}>
            {formatGuestsSummary(roomConfigs)}
          </p>
        </div>

        {!isLoading && availableRooms.length > 0 && (
          <p
            className="booking-search-results__count"
            style={{ color: "var(--booking-navy)" }}
          >
            {availableRooms.length}{" "}
            {availableRooms.length === 1 ? "room" : "rooms"} available
          </p>
        )}
      </div>

      {isLoading && (
        <div
          className="booking-card flex items-center justify-center gap-3 px-6 py-14 text-sm"
          style={{ color: "var(--booking-muted)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Searching available sailings…
        </div>
      )}

      {!isLoading && searchAttempted && availableRooms.length === 0 && !error && (
        <div
          className="booking-card px-6 py-10 text-center text-sm"
          style={{ color: "var(--booking-muted)" }}
        >
          No rooms matched your search. Adjust your dates, room types, or guest
          count and try again.
        </div>
      )}

      {!isLoading && availableRooms.length > 0 && (
        <div className="space-y-5">
          {availableRooms.map((room) => {
            const selectionKey = room.selectionKey ?? room.id;
            const isSelected = selectedRoomIds.includes(selectionKey);
            const imageStyle = heroImageUrl
              ? { backgroundImage: `url(${heroImageUrl})` }
              : { background: ROOM_PLACEHOLDER };
            const roomTypeLabel = room.roomType ?? "Stateroom";
            const roomDuration = room.duration ?? duration;
            const roomCruiseId = room.cruiseId ?? cruiseId;

            const detailsParams = new URLSearchParams();
            if (checkInDate) detailsParams.set("checkInDate", checkInDate);
            if (roomDuration) detailsParams.set("duration", roomDuration);
            if (roomCruiseId) detailsParams.set("cruiseId", roomCruiseId);
            detailsParams.set("scheduleId", room.scheduleId);
            const adults = roomConfigs.reduce((sum, cfg) => sum + cfg.adults, 0);
            const children = roomConfigs.reduce(
              (sum, cfg) => sum + cfg.children,
              0,
            );
            detailsParams.set("adults", String(adults));
            detailsParams.set("children", String(children));
            const detailsHref = `/booking/cruise/${room.id}?${detailsParams.toString()}`;

            return (
              <article
                key={selectionKey}
                className={`booking-room-card ${
                  isSelected ? "booking-room-card--selected" : ""
                }`}
              >
                <div className="booking-room-card__image" style={imageStyle}>
                  <Link
                    href={detailsHref}
                    className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition hover:bg-white"
                    style={{ color: "var(--booking-navy)" }}
                  >
                    View Details
                  </Link>
                </div>

                <div className="flex min-w-0 flex-col justify-center gap-4 p-4 sm:p-6">
                  <div className="min-w-0">
                    {room.cruiseName && (
                      <p
                        className="truncate text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--booking-muted)" }}
                      >
                        {room.cruiseName}
                      </p>
                    )}
                    <h3 className="booking-serif text-lg font-semibold sm:text-2xl">
                      {room.name}
                    </h3>
                    <span
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "var(--booking-cream)",
                        color: "var(--booking-navy)",
                      }}
                    >
                      <Ship className="h-3 w-3" aria-hidden />
                      {roomTypeLabel}
                    </span>
                  </div>

                  <div
                    className="flex flex-col flex-wrap items-start gap-3 text-sm sm:flex-row sm:items-center sm:gap-4"
                    style={{ color: "var(--booking-muted)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" aria-hidden />
                      {roomTypeLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" aria-hidden />
                      Up to {room.capacity} guests
                    </span>
                  </div>

                  {room.description && (
                    <p
                      className="line-clamp-3 text-sm leading-relaxed sm:line-clamp-none"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      {room.description}
                    </p>
                  )}

                  <ul
                    className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm"
                    style={{ color: "var(--booking-muted)" }}
                  >
                    <li className="flex items-center gap-2">
                      <Wifi className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Wi-Fi included
                    </li>
                    <li className="flex items-center gap-2">
                      <Ship className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Nile views
                    </li>
                  </ul>
                </div>

                <div
                  className="flex flex-col justify-center gap-3 border-t p-4 sm:gap-4 sm:p-6 md:border-l md:border-t-0"
                  style={{ borderColor: "var(--booking-border)" }}
                >
                  <p className="text-xs" style={{ color: "var(--booking-muted)" }}>
                    Departs {format(parseISO(room.departureTime), "d MMM yyyy")}
                  </p>
                  <div>
                    <p className="booking-serif text-2xl font-semibold">
                      {formatPrice(room.minPriceCents)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--booking-muted)" }}
                    >
                      per room
                    </p>
                  </div>
                  <Link
                    href={detailsHref}
                    className="booking-btn-outline w-full px-6 py-3 text-center text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleRoom(selectionKey)}
                    className={`w-full px-6 py-3 text-sm ${
                      isSelected ? "booking-btn-outline" : "booking-btn-primary"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                  <p
                    className="flex items-start gap-1.5 text-[11px] leading-snug"
                    style={{ color: "var(--booking-muted)" }}
                  >
                    <Tag className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    We offer 10% off weeks paid in full at booking.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {error && (
        <p
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "#fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}

      {!isLoading && availableRooms.length > 0 && (
        <div className="flex justify-stretch pt-2 md:justify-end">
          <button
            type="button"
            onClick={onContinue}
            disabled={selectedRoomIds.length === 0}
            className="booking-btn-primary inline-flex w-full items-center justify-center gap-2 px-8 py-3 text-sm md:w-auto"
          >
            Continue with{" "}
            {selectedRoomIds.length > 0
              ? `${selectedRoomIds.length} selected`
              : "selection"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

export function validateRoomSelection(
  availableRooms: AvailableRoom[],
  selectedKeys: string[],
  roomConfigs: RoomSearchConfig[],
): string | null {
  if (selectedKeys.length === 0) {
    return "Please select at least one room.";
  }

  if (selectedKeys.length < roomConfigs.length) {
    return `Please select ${roomConfigs.length} room${roomConfigs.length === 1 ? "" : "s"} to match your guest configuration.`;
  }

  const scheduleId = getScheduleIdForSelection(availableRooms, selectedKeys);
  if (!scheduleId) {
    return "Selected rooms belong to different sailings. Please choose rooms from the same departure.";
  }

  return null;
}

export function getSelectedRoomIdsForCheckout(
  availableRooms: AvailableRoom[],
  selectedKeys: string[],
): string[] {
  return availableRooms
    .filter((room) =>
      selectedKeys.some(
        (key) => (room.selectionKey ?? room.id) === key || room.id === key,
      ),
    )
    .map((room) => room.id);
}
