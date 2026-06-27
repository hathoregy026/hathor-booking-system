"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CruiseCalendarDay } from "@/lib/cruise-calendar";
import { calendarDateToUtcIso, formatPrice } from "@/lib/client-dates";
import {
  formatCheckInFromDateKey,
  formatCheckoutFromDateKey,
} from "@/lib/booking-modal-helpers";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";
import { checkInIsoFromDateKey, isValidDepartureDateKey } from "@/lib/departure-dates";
import { findStayDurationOption } from "@/lib/booking-search-config";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

function localDateKey(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
    .toISOString()
    .slice(0, 10);
}

function mondayBasedPadding(year: number, monthIndex: number): number {
  const dow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  return dow === 0 ? 6 : dow - 1;
}

function buildMonthCells(year: number, monthIndex: number) {
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const padding = mondayBasedPadding(year, monthIndex);
  const cells: Array<{ dateKey: string | null; day: number | null }> = [];

  for (let i = 0; i < padding; i += 1) {
    cells.push({ dateKey: null, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const month = String(monthIndex + 1).padStart(2, "0");
    const dayPart = String(day).padStart(2, "0");
    cells.push({ dateKey: `${year}-${month}-${dayPart}`, day });
  }

  return cells;
}

type CheckoutCalendarProps = {
  duration: StayDurationValue;
  roomConfigs: RoomSearchConfig[];
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  onGoBack: () => void;
  onUpdateDates: () => void;
  isUpdating?: boolean;
  canUpdate?: boolean;
};

function MonthPanel({
  year,
  monthIndex,
  dayMeta,
  duration,
  selectedDateKey,
  checkOutDateKey,
  onSelectDate,
}: {
  year: number;
  monthIndex: number;
  dayMeta: Map<string, CruiseCalendarDay>;
  duration: StayDurationValue;
  selectedDateKey: string | null;
  checkOutDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const cells = buildMonthCells(year, monthIndex);
  const monthLabel = format(new Date(Date.UTC(year, monthIndex, 1)), "MMMM yyyy");

  return (
    <div className="historia-cal-month">
      <h3 className="historia-cal-month__title">{monthLabel}</h3>
      <div className="historia-cal-month__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="historia-cal-month__grid">
        {cells.map((cell, index) => {
          if (!cell.dateKey || !cell.day) {
            return (
              <span
                key={`empty-${monthIndex}-${index}`}
                className="historia-cal-day historia-cal-day--empty"
                aria-hidden
              />
            );
          }

          const meta = dayMeta.get(cell.dateKey);
          const isDepartureDay = isValidDepartureDateKey(cell.dateKey, duration);
          const isAvailable = meta?.status === "available" && isDepartureDay;

          const isCheckIn = selectedDateKey === cell.dateKey;
          const isCheckOut = checkOutDateKey === cell.dateKey;
          const isInStay =
            selectedDateKey &&
            checkOutDateKey &&
            cell.dateKey > selectedDateKey &&
            cell.dateKey < checkOutDateKey;

          let statusClass = "historia-cal-day--unavailable";
          if (isAvailable) statusClass = "historia-cal-day--available";

          return (
            <button
              key={cell.dateKey}
              type="button"
              disabled={!isAvailable}
              aria-pressed={isCheckIn || isCheckOut}
              title={
                meta && isAvailable
                  ? `${formatCheckInFromDateKey(cell.dateKey)} · from ${formatPrice(meta.priceCents)}`
                  : undefined
              }
              className={`historia-cal-day ${statusClass}${
                isCheckIn ? " historia-cal-day--check-in" : ""
              }${isCheckOut ? " historia-cal-day--check-out" : ""}${
                isInStay ? " historia-cal-day--in-range" : ""
              }`}
              onClick={() => {
                if (isAvailable) onSelectDate(cell.dateKey!);
              }}
            >
              <span className="historia-cal-day__num">{cell.day}</span>
              {isCheckIn ? (
                <span className="historia-cal-day__tag">CHECK-IN</span>
              ) : null}
              {isCheckOut ? (
                <span className="historia-cal-day__tag">CHECK-OUT</span>
              ) : null}
              {isAvailable && meta && meta.priceCents > 0 && !isCheckIn && !isCheckOut ? (
                <span className="historia-cal-day__price">
                  {formatPrice(meta.priceCents)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CheckoutCalendar({
  duration,
  roomConfigs,
  selectedDateKey,
  onSelectDate,
  onGoBack,
  onUpdateDates,
  isUpdating = false,
  canUpdate = false,
}: CheckoutCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [days, setDays] = useState<CruiseCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthA = visibleMonth;
  const monthB = addMonths(visibleMonth, 1);

  const checkOutDateKey = useMemo(() => {
    if (!selectedDateKey) return null;
    const option = findStayDurationOption(duration);
    if (!option) return null;
    const checkIn = parseISO(checkInIsoFromDateKey(selectedDateKey));
    const end = new Date(checkIn);
    end.setUTCDate(end.getUTCDate() + option.nights);
    return localDateKey(end);
  }, [duration, selectedDateKey]);

  const rangeLabel = useMemo(() => {
    if (!selectedDateKey) return "Select your check-in date";
    const checkInLabel = formatCheckInFromDateKey(selectedDateKey);
    const checkOutLabel = formatCheckoutFromDateKey(selectedDateKey, duration);
    return `${checkInLabel} – ${checkOutLabel}`;
  }, [duration, selectedDateKey]);

  useEffect(() => {
    const controller = new AbortController();
    const from = startOfMonth(monthA);
    const to = endOfMonth(monthB);

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          duration,
          rooms: JSON.stringify(roomConfigs),
          from: calendarDateToUtcIso(from),
          to: calendarDateToUtcIso(to),
        });

        const response = await fetch(`/api/cruises/calendar?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          days?: CruiseCalendarDay[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load calendar");
        }

        setDays(data.days ?? []);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load calendar",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [duration, monthA, monthB, roomConfigs]);

  const dayMeta = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );

  return (
    <section
      className="historia-checkout-calendar"
      aria-busy={isLoading}
    >
      <div className="historia-checkout-calendar__stay-labels">
        <span
          className={`historia-checkout-calendar__stay-label${
            selectedDateKey ? " historia-checkout-calendar__stay-label--active" : ""
          }`}
        >
          Check in
        </span>
        <span
          className={`historia-checkout-calendar__stay-label${
            checkOutDateKey ? " historia-checkout-calendar__stay-label--active" : ""
          }`}
        >
          Check out
        </span>
      </div>

      <div className="historia-checkout-calendar__range">
        <p className="historia-checkout-calendar__range-label">{rangeLabel}</p>
        <div className="historia-checkout-calendar__nav">
          <button
            type="button"
            className="historia-checkout-calendar__nav-btn"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            aria-label="Previous months"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="historia-checkout-calendar__nav-btn"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            aria-label="Next months"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className={`historia-checkout-calendar__months${
          isLoading ? " historia-checkout-calendar__months--loading" : ""
        }`}
      >
        <MonthPanel
          year={monthA.getFullYear()}
          monthIndex={monthA.getMonth()}
          dayMeta={dayMeta}
          duration={duration}
          selectedDateKey={selectedDateKey}
          checkOutDateKey={checkOutDateKey}
          onSelectDate={onSelectDate}
        />
        <MonthPanel
          year={monthB.getFullYear()}
          monthIndex={monthB.getMonth()}
          dayMeta={dayMeta}
          duration={duration}
          selectedDateKey={selectedDateKey}
          checkOutDateKey={checkOutDateKey}
          onSelectDate={onSelectDate}
        />
      </div>

      <div className="historia-checkout-calendar__status-slot" aria-live="polite">
        {error ? (
          <p className="historia-checkout-calendar__error" role="alert">
            {error}
          </p>
        ) : isLoading ? (
          <p className="historia-checkout-calendar__status">Loading sailings…</p>
        ) : (
          <span className="historia-checkout-calendar__status-placeholder" aria-hidden />
        )}
      </div>

      <div className="historia-checkout-calendar__legend" aria-hidden>
        <span className="historia-checkout-calendar__legend-item historia-checkout-calendar__legend-item--available">
          Available
        </span>
        <span className="historia-checkout-calendar__legend-item historia-checkout-calendar__legend-item--unavailable">
          No availability
        </span>
      </div>

      <div className="historia-checkout-calendar__actions">
        <button
          type="button"
          className="historia-btn historia-btn--ghost"
          onClick={onGoBack}
          disabled={isUpdating}
        >
          Go Back
        </button>
        <button
          type="button"
          className="historia-btn historia-btn--primary"
          onClick={onUpdateDates}
          disabled={!canUpdate || isUpdating}
        >
          {isUpdating ? "Updating…" : "Update Dates of Stay"}
        </button>
      </div>
    </section>
  );
}
