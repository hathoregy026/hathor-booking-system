"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Ship,
  Tag,
  Users,
  Wifi,
} from "lucide-react";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { getScheduleIdForSelection } from "@/lib/booking-types";
import { buildAvailabilityQueryParams } from "@/lib/booking-search-config";
import { useBookingStore } from "@/store/bookingStore";
import { BookingSearchBar } from "./BookingSearchBar";

const ROOM_PLACEHOLDER =
  "linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 50%, #4a7c8f 100%)";

type RoomSelectionStepProps = {
  heroImageUrl?: string | null;
};

export function RoomSelectionStep({ heroImageUrl }: RoomSelectionStepProps) {
  const {
    availableRooms,
    selectedRoomIds,
    searchMode,
    duration,
    checkInDate,
    periodStart,
    periodEnd,
    roomConfigs,
    startDate,
    endDate,
    toggleRoomSelection,
    setStep,
    error,
    setError,
    isLoading,
    setIsLoading,
    setAvailability,
    setSelectedCruiseId,
    setStartDate,
    setEndDate,
    setDuration,
    setCheckInDate,
    setPeriodStart,
    setPeriodEnd,
    setSearchMode,
    setRoomConfigs,
  } = useBookingStore();

  const handleContinue = () => {
    if (selectedRoomIds.length === 0) {
      setError("Please select at least one room.");
      return;
    }

    const scheduleId = getScheduleIdForSelection(
      useBookingStore.getState().availableRooms,
      selectedRoomIds,
    );

    if (!scheduleId) {
      setError(
        "Selected rooms belong to different sailings. Please choose rooms from the same departure.",
      );
      return;
    }

    setError(null);
    setStep(3);
  };

  const handleSearch = async () => {
    if (!duration || !checkInDate || roomConfigs.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const params = buildAvailabilityQueryParams(
        duration,
        checkInDate,
        roomConfigs,
      );
      const response = await fetch(`/api/availability?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search failed");
      setSelectedCruiseId(data.cruiseId);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <BookingSearchBar
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        duration={duration}
        onDurationChange={setDuration}
        checkInDate={checkInDate}
        onCheckInDateChange={setCheckInDate}
        periodStart={periodStart}
        periodEnd={periodEnd}
        onPeriodChange={(start, end) => {
          setPeriodStart(start);
          setPeriodEnd(end);
        }}
        rooms={roomConfigs}
        onRoomsChange={setRoomConfigs}
        onSearch={handleSearch}
        isLoading={isLoading}
        searchLabel="Find Now"
        compact
      />

      <div className="space-y-2">
        <h2 className="booking-serif text-2xl font-semibold sm:text-3xl">
          Choose your stay
        </h2>
        <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
          {startDate && endDate
            ? `${formatUtcDate(startDate)} – ${formatUtcDate(endDate)}`
            : "Select staterooms for your voyage"}
        </p>
      </div>

      {availableRooms.length === 0 ? (
        <p
          className="booking-card px-4 py-8 text-center text-sm"
          style={{ color: "var(--booking-muted)" }}
        >
          No rooms available. Adjust your dates and search again.
        </p>
      ) : (
        <div className="space-y-5">
          {availableRooms.map((room) => {
            const selectionKey = room.selectionKey ?? room.id;
            const isSelected = selectedRoomIds.includes(selectionKey);
            const imageStyle = heroImageUrl
              ? { backgroundImage: `url(${heroImageUrl})` }
              : { background: ROOM_PLACEHOLDER };

            const detailsParams = new URLSearchParams();
            if (checkInDate) detailsParams.set("checkInDate", checkInDate);
            if (duration) detailsParams.set("duration", duration);
            if (room.cruiseId) detailsParams.set("cruiseId", room.cruiseId);
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
                <div
                  className="booking-room-card__image"
                  style={imageStyle}
                >
                  <Link
                    href={detailsHref}
                    className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition hover:bg-white"
                    style={{ color: "var(--booking-navy)" }}
                  >
                    More details
                  </Link>
                </div>

                <div className="flex flex-col justify-center gap-4 p-6">
                  <div>
                    <h3 className="booking-serif text-xl font-semibold sm:text-2xl">
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
                      Stateroom
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-4 text-sm"
                    style={{ color: "var(--booking-muted)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" aria-hidden />
                      Suite
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" aria-hidden />
                      Up to {room.capacity} guests
                    </span>
                  </div>

                  {room.description && (
                    <p
                      className="text-sm leading-relaxed"
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
                  className="flex flex-col justify-center gap-4 border-t p-6 md:border-l md:border-t-0"
                  style={{ borderColor: "var(--booking-border)" }}
                >
                  <p className="text-xs" style={{ color: "var(--booking-muted)" }}>
                    Departs{" "}
                    {format(parseISO(room.departureTime), "d MMM yyyy")}
                  </p>
                  <div>
                    <p className="booking-serif text-2xl font-semibold">
                      {formatPrice(room.minPriceCents)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--booking-muted)" }}>
                      per room
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRoomSelection(selectionKey)}
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

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="booking-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedRoomIds.length === 0}
          className="booking-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-sm"
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
