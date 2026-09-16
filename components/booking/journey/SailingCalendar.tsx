"use client";

import { useMemo, useState } from "react";
import { longDate, money, monthLabel, monthShort, utcParts, weekdayShort, type Sailing } from "./model";
import { IconInfo } from "./icons";

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * Only real bookable sailings from the availability service are selectable.
 * Every date is read in UTC, the way sailings are stored.
 */
export function SailingCalendar({
  sailings,
  loading,
  departureDay,
  selectedId,
  onSelect,
}: {
  sailings: Sailing[];
  loading: boolean;
  departureDay: string;
  selectedId: string;
  onSelect: (scheduleId: string) => void;
}) {
  const months = useMemo(() => {
    const seen = new Map<string, { year: number; month: number }>();
    for (const sailing of sailings) {
      const { year, month } = utcParts(sailing.departureTime);
      seen.set(`${year}-${month}`, { year, month });
    }
    return [...seen.values()];
  }, [sailings]);

  // Tracking the month by value, not by index: when the sailing list changes
  // the view falls back to the first open month without an extra render pass.
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const monthIndex = Math.max(0, months.findIndex(month => `${month.year}-${month.month}` === monthKey));
  const current = months[monthIndex] ?? null;
  const goToMonth = (next: number) => {
    const target = months[next];
    if (target) setMonthKey(`${target.year}-${target.month}`);
  };

  const byDay = useMemo(() => {
    const map = new Map<number, Sailing>();
    if (!current) return map;
    for (const sailing of sailings) {
      const parts = utcParts(sailing.departureTime);
      if (parts.year === current.year && parts.month === current.month) map.set(parts.day, sailing);
    }
    return map;
  }, [sailings, current]);

  const cells = useMemo(() => {
    if (!current) return [];
    const first = new Date(Date.UTC(current.year, current.month, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const length = new Date(Date.UTC(current.year, current.month + 1, 0)).getUTCDate();
    return [...Array.from({ length: lead }, () => 0), ...Array.from({ length }, (_, i) => i + 1)];
  }, [current]);

  if (loading) {
    return (
      <div className="hj-dates">
        <div className="hj-cal"><div className="hj-skeleton hj-skeleton--card" /></div>
        <div className="hj-sailings">
          <div className="hj-skeleton hj-skeleton--line" />
          <div className="hj-skeleton hj-skeleton--line" />
          <div className="hj-skeleton hj-skeleton--line" />
        </div>
      </div>
    );
  }

  return (
    <div className="hj-dates">
      <div className="hj-cal">
        <div className="hj-cal__head">
          <button
            type="button"
            className="hj-cal__nav"
            aria-label="Previous month"
            disabled={monthIndex <= 0}
            onClick={() => goToMonth(monthIndex - 1)}
          >
            ‹
          </button>
          <span className="hj-cal__title">{current ? monthLabel(current.year, current.month) : "No sailings"}</span>
          <button
            type="button"
            className="hj-cal__nav"
            aria-label="Next month"
            disabled={monthIndex >= months.length - 1}
            onClick={() => goToMonth(monthIndex + 1)}
          >
            ›
          </button>
        </div>

        <div className="hj-cal__grid">
          {DOW.map(day => <span key={day} className="hj-cal__dow">{day}</span>)}
          {cells.map((day, index) => {
            if (day === 0) return <span key={`pad-${index}`} className="hj-cal__day" aria-hidden />;
            const sailing = byDay.get(day);
            if (!sailing) return <span key={day} className="hj-cal__day">{day}</span>;
            return (
              <button
                key={day}
                type="button"
                className={`hj-cal__day hj-cal__day--open${selectedId === sailing.scheduleId ? " hj-cal__day--picked" : ""}`}
                aria-label={`Sailing departing ${longDate(sailing.departureTime)}`}
                aria-pressed={selectedId === sailing.scheduleId}
                onClick={() => onSelect(sailing.scheduleId)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hj-sailings">
        <span className="hj-sailings__label">Available sailing dates</span>
        {sailings.length === 0 ? (
          <p className="hj-sailings__empty">No sailings are open for this voyage at the moment. Choose another itinerary, or contact our reservations team.</p>
        ) : (
          <div className="hj-sailings__list">
            {sailings.map(sailing => {
              const from = Math.min(...sailing.types.map(type => type.priceCents));
              return (
                <button
                  key={sailing.scheduleId}
                  type="button"
                  className={`hj-sailing${selectedId === sailing.scheduleId ? " hj-sailing--on" : ""}`}
                  onClick={() => onSelect(sailing.scheduleId)}
                >
                  <span className="hj-sailing__date">
                    <span className="hj-sailing__dow">{weekdayShort(sailing.departureTime)}</span>
                    <span className="hj-sailing__num">{utcParts(sailing.departureTime).day}</span>
                    <span className="hj-sailing__mon">{monthShort(sailing.departureTime)}</span>
                  </span>
                  <span>
                    <span className="hj-sailing__line">Check-in: {longDate(sailing.departureTime)}</span>
                    <span className="hj-sailing__line">Check-out: {longDate(sailing.arrivalTime)}</span>
                    <span className="hj-sailing__from">
                      {sailing.soldOut ? "Fully booked" : `From ${money(from)} per cabin`}
                    </span>
                  </span>
                  <span className="hj-sailing__chev" aria-hidden>›</span>
                </button>
              );
            })}
          </div>
        )}
        <p className="hj-sailings__note"><IconInfo /> {departureDay} departures only.</p>
      </div>
    </div>
  );
}
