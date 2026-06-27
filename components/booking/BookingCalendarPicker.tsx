"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { DayPicker, type DateRange, type DayButtonProps } from "react-day-picker";
import type { CruiseCalendarDay } from "@/lib/cruise-calendar";
import { calendarDateToUtcIso, formatPrice } from "@/lib/client-dates";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";

type BookingCalendarPickerProps = {
  mode: "single" | "range";
  duration?: StayDurationValue | "";
  rooms: RoomSearchConfig[];
  selected?: Date;
  selectedRange?: DateRange;
  onSelect?: (date: Date | undefined) => void;
  onRangeSelect?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
};

function localDateKey(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
    .toISOString()
    .slice(0, 10);
}

function HathorCalendarDayButton({
  dayMeta,
  day,
  ...buttonProps
}: DayButtonProps & { dayMeta: Map<string, CruiseCalendarDay> }) {
  const dateKey = localDateKey(day.date);
  const meta = dayMeta.get(dateKey);

  return (
    <button
      {...buttonProps}
      type="button"
      className={`${buttonProps.className ?? ""} hathor-calendar-day`.trim()}
      data-status={meta?.status ?? "closed"}
    >
      <span className="hathor-calendar-day__number">{day.date.getDate()}</span>
      {meta && meta.status === "available" && meta.priceCents > 0 ? (
        <span className="hathor-calendar-day__price">
          {formatPrice(meta.priceCents)}
        </span>
      ) : null}
      {meta?.status === "booked" ? (
        <span className="hathor-calendar-day__label" aria-hidden>
          Booked
        </span>
      ) : null}
    </button>
  );
}

export function BookingCalendarPicker({
  mode,
  duration,
  rooms,
  selected,
  selectedRange,
  onSelect,
  onRangeSelect,
  numberOfMonths = 1,
}: BookingCalendarPickerProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [days, setDays] = useState<CruiseCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dayMeta = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );

  useEffect(() => {
    if (mode !== "single" || !duration || rooms.length === 0) {
      setDays([]);
      return;
    }

    const controller = new AbortController();
    const from = startOfMonth(visibleMonth);
    const to = endOfMonth(addMonths(visibleMonth, numberOfMonths - 1));

    async function loadCalendar() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          duration: duration as StayDurationValue,
          rooms: JSON.stringify(rooms),
          from: calendarDateToUtcIso(from),
          to: calendarDateToUtcIso(to),
        });

        const response = await fetch(`/api/cruises/calendar?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { days?: CruiseCalendarDay[] };

        if (!response.ok) {
          setDays([]);
          return;
        }

        setDays(data.days ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setDays([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCalendar();
    return () => controller.abort();
  }, [duration, mode, numberOfMonths, rooms, visibleMonth]);

  const disabledMatcher = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (mode === "single" && duration) {
      const meta = dayMeta.get(localDateKey(date));
      if (!meta) return false;
      return meta.status !== "available";
    }

    return false;
  };

  const sharedProps = {
    numberOfMonths,
    className: "rdp-root hathor-calendar",
    month: visibleMonth,
    onMonthChange: setVisibleMonth,
    disabled: disabledMatcher,
    components: {
      DayButton: (props: DayButtonProps) => (
        <HathorCalendarDayButton {...props} dayMeta={dayMeta} />
      ),
    },
  } as const;

  return (
    <div className="relative">
      {isLoading ? (
        <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-[var(--booking-muted)]">
          Loading availability…
        </p>
      ) : null}

      {mode === "range" ? (
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={onRangeSelect}
          {...sharedProps}
        />
      ) : (
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={onSelect}
          {...sharedProps}
        />
      )}

      {mode === "single" && duration ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--booking-border)] pt-3 text-[10px] uppercase tracking-wider text-[var(--booking-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="hathor-calendar-legend hathor-calendar-legend--available" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="hathor-calendar-legend hathor-calendar-legend--booked" />
            Booked
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function parseCalendarSelectedDate(iso: string | null): Date | undefined {
  return iso ? parseISO(iso) : undefined;
}
