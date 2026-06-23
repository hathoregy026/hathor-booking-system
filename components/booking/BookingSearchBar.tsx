"use client";

import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown, Loader2, Users, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { calendarDateToUtcIso } from "@/lib/client-dates";
import {
  formatGuestsSummary,
  STAY_DURATION_OPTIONS,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import type { BookingSearchMode } from "@/store/bookingStore";
import { BookingGuestsPanel } from "./BookingGuestsPanel";

type BookingSearchBarProps = {
  searchMode: BookingSearchMode;
  onSearchModeChange: (mode: BookingSearchMode) => void;
  duration: StayDurationValue | "";
  onDurationChange: (duration: StayDurationValue) => void;
  checkInDate: string | null;
  onCheckInDateChange: (iso: string | null) => void;
  periodStart: string | null;
  periodEnd: string | null;
  onPeriodChange: (start: string | null, end: string | null) => void;
  rooms: RoomSearchConfig[];
  onRoomsChange: (rooms: RoomSearchConfig[]) => void;
  onSearch: () => void;
  isLoading: boolean;
  searchLabel?: string;
  compact?: boolean;
};

function formatPeriodLabel(start: string | null, end: string | null): string {
  if (start && end) {
    return `${format(parseISO(start), "d MMM yyyy")} – ${format(parseISO(end), "d MMM yyyy")}`;
  }

  if (start) {
    return `${format(parseISO(start), "d MMM yyyy")} – Select end`;
  }

  return "Select travel period";
}

export function BookingSearchBar({
  searchMode,
  onSearchModeChange,
  duration,
  onDurationChange,
  checkInDate,
  onCheckInDateChange,
  periodStart,
  periodEnd,
  onPeriodChange,
  rooms,
  onRoomsChange,
  onSearch,
  isLoading,
  searchLabel = "Find Now",
  compact = false,
}: BookingSearchBarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const checkInLabel = checkInDate
    ? format(parseISO(checkInDate), "d MMM yyyy")
    : "Select date";

  const periodLabel = formatPeriodLabel(periodStart, periodEnd);
  const guestsSummary = formatGuestsSummary(rooms);

  const isSearchDisabled =
    isLoading ||
    rooms.length === 0 ||
    (searchMode === "exact"
      ? !duration || !checkInDate
      : !periodStart || !periodEnd);

  const selectedPeriod: DateRange | undefined =
    periodStart || periodEnd
      ? {
          from: periodStart ? parseISO(periodStart) : undefined,
          to: periodEnd ? parseISO(periodEnd) : undefined,
        }
      : undefined;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (isMobile && (calendarOpen || guestsOpen)) return;
      if (!widgetRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false);
        setGuestsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [calendarOpen, guestsOpen, isMobile]);

  useEffect(() => {
    if (!isMobile || (!calendarOpen && !guestsOpen)) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [calendarOpen, guestsOpen, isMobile]);

  const handleCheckInSelect = (date: Date | undefined) => {
    onCheckInDateChange(date ? calendarDateToUtcIso(date) : null);
    if (date) setCalendarOpen(false);
  };

  const handlePeriodSelect = (range: DateRange | undefined) => {
    const nextStart = range?.from ? calendarDateToUtcIso(range.from) : null;
    const nextEnd = range?.to ? calendarDateToUtcIso(range.to) : null;
    onPeriodChange(nextStart, nextEnd);

    if (range?.from && range?.to) {
      setCalendarOpen(false);
    }
  };

  const handleGuestsDone = () => {
    setGuestsOpen(false);
  };

  const calendarMonths = isMobile ? 1 : searchMode === "period" ? 2 : 1;

  const calendarContent =
    searchMode === "period" ? (
      <DayPicker
        mode="range"
        selected={selectedPeriod}
        onSelect={handlePeriodSelect}
        disabled={{ before: new Date() }}
        numberOfMonths={calendarMonths}
        className="rdp-root"
      />
    ) : (
      <DayPicker
        mode="single"
        selected={checkInDate ? parseISO(checkInDate) : undefined}
        onSelect={handleCheckInSelect}
        disabled={{ before: new Date() }}
        numberOfMonths={calendarMonths}
        className="rdp-root"
      />
    );

  return (
    <div ref={widgetRef} className="relative mx-auto w-full max-w-5xl space-y-3">
      <div className="booking-search-mode" role="tablist" aria-label="Search mode">
        <button
          type="button"
          role="tab"
          aria-selected={searchMode === "exact"}
          className={`booking-search-mode__button ${
            searchMode === "exact" ? "booking-search-mode__button--active" : ""
          }`}
          onClick={() => onSearchModeChange("exact")}
        >
          Specific cruise
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={searchMode === "period"}
          className={`booking-search-mode__button ${
            searchMode === "period" ? "booking-search-mode__button--active" : ""
          }`}
          onClick={() => onSearchModeChange("period")}
        >
          Browse by period
        </button>
      </div>

      <div className={`booking-widget ${compact ? "booking-widget--compact" : ""}`}>
        <div
          className={`booking-widget-grid ${
            searchMode === "period" ? "booking-widget-grid--period" : ""
          }`}
        >
          {searchMode === "exact" ? (
            <div className="booking-widget-field">
              <label
                htmlFor="booking-duration"
                className="booking-widget-label"
              >
                Length of Stay
              </label>
              <div className="booking-widget-control">
                <select
                  id="booking-duration"
                  value={duration}
                  onChange={(event) =>
                    onDurationChange(event.target.value as StayDurationValue)
                  }
                  className="booking-widget-select"
                >
                  <option value="" disabled>
                    Select duration
                  </option>
                  {STAY_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--booking-muted)]"
                  aria-hidden
                />
              </div>
            </div>
          ) : null}

          <div className="booking-widget-field relative">
            <span className="booking-widget-label">
              {searchMode === "period" ? "Travel Period" : "Check-In Date"}
            </span>
            <button
              type="button"
              onClick={() => {
                setGuestsOpen(false);
                setCalendarOpen((open) => !open);
              }}
              className="booking-widget-trigger"
              aria-expanded={calendarOpen}
              aria-haspopup="dialog"
            >
              <CalendarDays
                className="h-4 w-4 shrink-0 text-[var(--booking-muted)]"
                aria-hidden
              />
              <span className="truncate text-sm font-medium">
                {searchMode === "period" ? periodLabel : checkInLabel}
              </span>
            </button>

            {calendarOpen && !isMobile && (
              <div className="booking-widget-popover booking-widget-popover--calendar">
                <div className="booking-card p-4 shadow-xl">{calendarContent}</div>
              </div>
            )}
          </div>

          <div className="booking-widget-field relative">
            <span className="booking-widget-label">Guests</span>
            <button
              type="button"
              onClick={() => {
                setCalendarOpen(false);
                setGuestsOpen((open) => !open);
              }}
              className="booking-widget-trigger"
              aria-expanded={guestsOpen}
              aria-haspopup="dialog"
            >
              <Users
                className="h-4 w-4 shrink-0 text-[var(--booking-muted)]"
                aria-hidden
              />
              <span className="truncate text-sm font-medium">{guestsSummary}</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 shrink-0 text-[var(--booking-muted)] transition-transform duration-200 ${
                  guestsOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            {guestsOpen && !isMobile && (
              <div className="booking-widget-popover booking-widget-popover--guests">
                <BookingGuestsPanel
                  rooms={rooms}
                  onChange={onRoomsChange}
                  onDone={handleGuestsDone}
                />
              </div>
            )}
          </div>

          <div className="booking-widget-action">
            <button
              type="button"
              onClick={onSearch}
              disabled={isSearchDisabled}
              className="booking-btn-primary booking-widget-submit flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold"
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              {searchLabel}
            </button>
          </div>
        </div>
      </div>

      {calendarOpen && isMobile && (
        <div className="booking-mobile-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="booking-mobile-sheet__backdrop"
            aria-label="Close calendar"
            onClick={() => setCalendarOpen(false)}
          />
          <div className="booking-mobile-sheet__panel">
            <div className="booking-mobile-sheet__handle" aria-hidden />
            <div className="booking-mobile-sheet__header">
              <p className="booking-mobile-sheet__title">
                {searchMode === "period" ? "Travel period" : "Check-in date"}
              </p>
              <button
                type="button"
                className="booking-mobile-sheet__close"
                onClick={() => setCalendarOpen(false)}
                aria-label="Close calendar"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="booking-mobile-sheet__body">
              <div className="booking-card p-3 shadow-none">{calendarContent}</div>
            </div>
          </div>
        </div>
      )}

      {guestsOpen && isMobile && (
        <div className="booking-mobile-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="booking-mobile-sheet__backdrop"
            aria-label="Close guests panel"
            onClick={() => setGuestsOpen(false)}
          />
          <div className="booking-mobile-sheet__panel">
            <div className="booking-mobile-sheet__handle" aria-hidden />
            <div className="booking-mobile-sheet__header">
              <p className="booking-mobile-sheet__title">Guests & rooms</p>
              <button
                type="button"
                className="booking-mobile-sheet__close"
                onClick={() => setGuestsOpen(false)}
                aria-label="Close guests panel"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="booking-mobile-sheet__body">
              <BookingGuestsPanel
                rooms={rooms}
                onChange={onRoomsChange}
                onDone={handleGuestsDone}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
