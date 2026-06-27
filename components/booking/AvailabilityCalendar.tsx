"use client";

import { useEffect, useMemo, useState } from "react";
import type { CruiseCalendarDay } from "@/lib/cruise-calendar";
import {
  BOOKING_MODAL_YEARS,
  type BookingModalYear,
  departureDayPlural,
  embarkationLabel,
  MONTH_ROW_LABELS,
} from "@/lib/booking-modal-helpers";
import { calendarDateToUtcIso, formatPrice, formatUtcDate } from "@/lib/client-dates";
import {
  normalizeRoomConfigsForDuration,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { checkInIsoFromDateKey, isValidDepartureDateKey } from "@/lib/departure-dates";

type AvailabilityCalendarProps = {
  duration: StayDurationValue;
  roomConfigs: RoomSearchConfig[];
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  year: BookingModalYear;
  onYearChange: (year: BookingModalYear) => void;
};

function monthPrefix(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  duration,
  roomConfigs,
  selectedDateKey,
  onSelectDate,
  year,
  onYearChange,
}: AvailabilityCalendarProps) {
  const [days, setDays] = useState<CruiseCalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedRooms = useMemo(
    () => normalizeRoomConfigsForDuration(duration, roomConfigs),
    [duration, roomConfigs],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadYear() {
      setIsLoading(true);
      setError(null);

      try {
        const from = new Date(Date.UTC(year, 0, 1));
        const to = new Date(Date.UTC(year, 11, 31));
        const params = new URLSearchParams({
          duration,
          rooms: JSON.stringify(normalizedRooms),
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
          throw new Error(data.error ?? "Failed to load availability calendar");
        }

        setDays(data.days ?? []);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setDays([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load availability calendar",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadYear();
    return () => controller.abort();
  }, [duration, normalizedRooms, year]);

  const monthRows = useMemo(() => {
    return MONTH_ROW_LABELS.map((label, monthIndex) => {
      const prefix = monthPrefix(year, monthIndex);
      const cells: CruiseCalendarDay[] = [];

      for (const day of days) {
        if (!day.date.startsWith(prefix)) continue;
        if (!isValidDepartureDateKey(day.date, duration)) continue;
        cells.push(day);
      }

      cells.sort((a, b) => a.date.localeCompare(b.date));
      return { label, monthIndex, cells };
    });
  }, [days, duration, year]);

  return (
    <div className="hathor-avail-calendar">
      <div className="hathor-avail-calendar__header">
        <div>
          <p className="hathor-avail-calendar__eyebrow">Select departure date</p>
          <h3 className="hathor-avail-calendar__title">{embarkationLabel(duration)}</h3>
        </div>
        <div className="hathor-avail-calendar__tabs" role="tablist" aria-label="Calendar year">
          {BOOKING_MODAL_YEARS.map((tabYear) => (
            <button
              key={tabYear}
              type="button"
              role="tab"
              aria-selected={year === tabYear}
              className={`hathor-avail-calendar__tab${
                year === tabYear ? " hathor-avail-calendar__tab--active" : ""
              }`}
              onClick={() => onYearChange(tabYear)}
            >
              {tabYear}
            </button>
          ))}
        </div>
      </div>

      <div className="hathor-avail-calendar__table-wrap">
        <table className="hathor-avail-calendar__table">
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">{departureDayPlural(duration)}</th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((row) => (
              <tr key={row.monthIndex}>
                <th scope="row">{row.label}</th>
                <td>
                  {row.cells.length === 0 ? (
                    <span className="hathor-avail-calendar__empty">—</span>
                  ) : (
                    <div className="hathor-avail-calendar__dates">
                      {row.cells.map((cell) => {
                        const dayNumber = Number(cell.date.slice(8, 10));
                        const isSelected = selectedDateKey === cell.date;
                        const isAvailable = cell.status === "available";
                        const title = `${formatUtcDate(checkInIsoFromDateKey(cell.date))}${
                          cell.priceCents > 0 ? ` · from ${formatPrice(cell.priceCents)}` : ""
                        }`;

                        return (
                          <button
                            key={cell.date}
                            type="button"
                            title={title}
                            disabled={!isAvailable}
                            aria-pressed={isSelected}
                            className={`hathor-avail-calendar__date hathor-avail-calendar__date--${cell.status}${
                              isSelected ? " hathor-avail-calendar__date--selected" : ""
                            }`}
                            onClick={() => {
                              if (isAvailable) onSelectDate(cell.date);
                            }}
                          >
                            <span className="hathor-avail-calendar__date-num">{dayNumber}</span>
                            {isAvailable && cell.priceCents > 0 ? (
                              <span className="hathor-avail-calendar__date-price">
                                {formatPrice(cell.priceCents)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <p className="hathor-avail-calendar__status" aria-live="polite">
          Loading sailings…
        </p>
      ) : null}
      {error ? (
        <p className="hathor-avail-calendar__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="hathor-avail-calendar__legend" aria-hidden>
        <span className="hathor-avail-calendar__legend-item hathor-avail-calendar__legend-item--available">
          Available
        </span>
        <span className="hathor-avail-calendar__legend-item hathor-avail-calendar__legend-item--booked">
          Booked
        </span>
      </div>
    </div>
  );
}
