"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import type { AdminBookingDto, AdminClosureBooking } from "@/lib/admin-bookings";
import { displayBookingStatus, isPendingBookingStatus } from "@/lib/admin-bookings";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/lib/client-dates";

type BookingCalendarProps = {
  bookings: AdminBookingDto[];
  /** Cabins closed on Availability: bookings added by hand, charters, and closures still waiting for guest details. */
  closures?: AdminClosureBooking[];
  closuresFailed?: boolean;
  isLoading?: boolean;
};

/** Where an entry on the calendar came from, and so how it looks. */
type EventKind = "confirmed" | "pending" | "manual" | "charter" | "closed";

type CalendarEvent = {
  key: string;
  kind: EventKind;
  title: string;
  detail: string;
  status: string;
  cruise: string | null;
  startsAt: string;
  endsAt: string;
  priceCents: number | null;
  tooltip: string;
};

const KIND_ORDER: Record<EventKind, number> = { confirmed: 0, pending: 1, manual: 2, charter: 3, closed: 4 };

const LEGEND: { kind: EventKind; label: string }[] = [
  { kind: "confirmed", label: "Confirmed" },
  { kind: "pending", label: "Pending" },
  { kind: "manual", label: "Added by hand" },
  { kind: "charter", label: "Charter" },
  { kind: "closed", label: "Closed, no guest details" },
];

/** Availability's default notes say nothing about the guest. */
const DEFAULT_NOTES = new Set(["Closed from the dashboard", "Private charter"]);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function cabinsDetail(roomNames: string[], wholeShip: boolean): string {
  if (wholeShip) return "Whole ship";
  return roomNames.length === 1 ? roomNames[0]! : plural(roomNames.length, "cabin");
}

function websiteEvent(booking: AdminBookingDto): CalendarEvent {
  const rooms = booking.roomTypes.join(", ") || booking.rooms.join(", ");
  return {
    key: `booking-${booking.id}`,
    kind: booking.status === BookingStatus.CONFIRMED ? "confirmed" : "pending",
    title: booking.guestName,
    detail: booking.roomTypes[0] ?? booking.rooms[0] ?? "Room",
    status: displayBookingStatus(booking.status),
    cruise: booking.cruiseName,
    startsAt: booking.checkInDate,
    endsAt: booking.checkOutDate,
    priceCents: booking.totalPriceCents,
    tooltip: `${booking.guestName} · ${rooms} · Website booking`,
  };
}

/**
 * A closure with a guest (Add booking, or guest details saved on Availability)
 * is a booking of its own. Closures still waiting for guest details are
 * gathered per sailing, so a busy day reads as one line instead of six.
 */
function closureEvents(closures: AdminClosureBooking[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const waiting = new Map<string, AdminClosureBooking[]>();

  for (const closure of closures) {
    const charter = closure.state === "CHARTER_BLOCK";
    const sale = closure.sale;
    const cabins = closure.roomNames.join(", ");

    if (sale) {
      events.push({
        key: `closure-${closure.blockKey}`,
        kind: charter ? "charter" : "manual",
        title: sale.guestName,
        detail: cabinsDetail(closure.roomNames, closure.wholeShip),
        status: charter ? "Charter" : `Added by hand · ${sale.source}`,
        cruise: closure.voyage,
        startsAt: closure.startsAt,
        endsAt: closure.endsAt,
        priceCents: sale.totalPriceCents,
        tooltip: `${sale.guestName} · ${closure.wholeShip ? "Whole ship" : cabins} · ${charter ? "Charter" : `Added by hand (${sale.source})`}`,
      });
    } else if (charter) {
      const note = closure.note && !DEFAULT_NOTES.has(closure.note) ? closure.note : null;
      events.push({
        key: `closure-${closure.blockKey}`,
        kind: "charter",
        title: note ?? "Private charter",
        detail: "Whole ship",
        status: "Charter",
        cruise: closure.voyage,
        startsAt: closure.startsAt,
        endsAt: closure.endsAt,
        priceCents: null,
        tooltip: `${note ?? "Private charter"} · Whole ship · Charter`,
      });
    } else {
      const sailing = `${closure.startsAt}|${closure.endsAt}`;
      waiting.set(sailing, [...(waiting.get(sailing) ?? []), closure]);
    }
  }

  for (const [sailing, group] of waiting) {
    const roomNames = group.flatMap((closure) => closure.roomNames);
    const first = group[0]!;
    events.push({
      key: `closed-${sailing}`,
      kind: "closed",
      title: "Closed on Availability",
      detail: cabinsDetail(roomNames, roomNames.length >= 12),
      status: "No guest details yet",
      cruise: first.voyage,
      startsAt: first.startsAt,
      endsAt: first.endsAt,
      priceCents: null,
      tooltip: `Closed on Availability · ${roomNames.join(", ")} · Add the guest under Via Availability`,
    });
  }

  return events;
}

function eventCoversDay(event: CalendarEvent, day: Date): boolean {
  const checkIn = startOfDay(parseISO(event.startsAt));
  const checkOut = startOfDay(parseISO(event.endsAt));
  const current = startOfDay(day);

  return current >= checkIn && current < checkOut;
}

const byStart = (left: CalendarEvent, right: CalendarEvent) =>
  parseISO(left.startsAt).getTime() - parseISO(right.startsAt).getTime() || KIND_ORDER[left.kind] - KIND_ORDER[right.kind];

function eventStyles(kind: EventKind): CSSProperties {
  switch (kind) {
    case "confirmed":
      return {
        background: "color-mix(in srgb, var(--success) 18%, var(--bg-glass))",
        borderColor: "color-mix(in srgb, var(--success) 45%, transparent)",
        color: "var(--text-primary)",
      };
    case "pending":
      return {
        background: "color-mix(in srgb, var(--warning) 20%, var(--bg-glass))",
        borderColor: "color-mix(in srgb, var(--warning) 45%, transparent)",
        color: "var(--text-primary)",
      };
    case "manual":
      return {
        background: "color-mix(in srgb, var(--info) 18%, var(--bg-glass))",
        borderColor: "color-mix(in srgb, var(--info) 45%, transparent)",
        color: "var(--text-primary)",
      };
    case "charter":
      return {
        background: "color-mix(in srgb, var(--accent) 20%, var(--bg-glass))",
        borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)",
        color: "var(--text-primary)",
      };
    default:
      return {
        background: "transparent",
        borderColor: "color-mix(in srgb, var(--text-muted) 55%, transparent)",
        borderStyle: "dashed",
        color: "var(--text-secondary)",
      };
  }
}

export function BookingCalendar({ bookings, closures = [], closuresFailed, isLoading }: BookingCalendarProps) {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const events = useMemo(
    () =>
      [
        ...bookings
          .filter(
            (booking) =>
              !booking.deletedAt &&
              (booking.status === BookingStatus.CONFIRMED ||
                isPendingBookingStatus(booking.status)),
          )
          .map(websiteEvent),
        ...closureEvents(closures),
      ].sort(byStart),
    [bookings, closures],
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        events.filter((event) => eventCoversDay(event, day)),
      );
    }

    return map;
  }, [events, days]);

  const monthEvents = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    return events.filter((event) => {
      const checkIn = startOfDay(parseISO(event.startsAt));
      return checkIn >= monthStart && checkIn <= monthEnd;
    });
  }, [events, month]);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg"
              style={{ background: "var(--border)", opacity: 0.4 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div
        className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
        style={{
          borderColor: "color-mix(in srgb, var(--border) 50%, transparent)",
        }}
      >
        <div>
          <h2 className="admin-heading text-base sm:text-lg">Booking calendar</h2>
          <p className="admin-subheading mt-0.5 text-xs sm:text-sm">
            {isMobile
              ? "Upcoming sailings this month"
              : "Website bookings, bookings added by hand and charters, by sailing date"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, -1))}
            className="admin-header-icon-btn min-h-11 min-w-11"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-semibold">
            {format(month, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, 1))}
            className="admin-header-icon-btn min-h-11 min-w-11"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-xs sm:gap-4 sm:px-6"
        style={{ borderColor: "var(--border)" }}
      >
        {LEGEND.map((entry) => (
          <span key={entry.kind} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm border"
              style={eventStyles(entry.kind)}
            />
            {entry.label}
          </span>
        ))}
        {closuresFailed ? (
          <span style={{ color: "var(--danger)" }}>
            Bookings added by hand could not load. Press Refresh to try again.
          </span>
        ) : null}
      </div>

      {isMobile ? (
        <div className="space-y-3 p-4">
          {monthEvents.length === 0 ? (
            <p
              className="py-10 text-center text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              No bookings this month.
            </p>
          ) : (
            monthEvents.map((event) => (
              <article
                key={event.key}
                className="card rounded-xl border p-4"
                style={eventStyles(event.kind)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-xs opacity-80">
                      {format(parseISO(event.startsAt), "EEE, MMM d")} –{" "}
                      {format(parseISO(event.endsAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="max-w-[7.5rem] shrink-0 text-right text-xs font-semibold uppercase tracking-wide opacity-80">
                    {event.status}
                  </span>
                </div>
                {event.cruise ? <p className="mt-2 text-sm opacity-90">{event.cruise}</p> : null}
                <p className="mt-1 text-xs opacity-75">
                  {event.detail}
                  {event.priceCents != null ? ` · ${formatPrice(event.priceCents)}` : ""}
                </p>
              </article>
            ))
          )}
        </div>
      ) : (
        <>
          <div
            className="hidden grid-cols-7 border-b text-center text-xs font-semibold uppercase tracking-wide md:grid"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
              <div key={label} className="px-2 py-3">
                {label}
              </div>
            ))}
          </div>

          <div className="hidden grid-cols-7 md:grid">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={key}
                  className="min-h-[7.5rem] min-w-0 border-b border-r p-2"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--border) 60%, transparent)",
                    background: inMonth
                      ? "transparent"
                      : "color-mix(in srgb, var(--border) 12%, transparent)",
                    opacity: inMonth ? 1 : 0.55,
                  }}
                >
                  <div
                    className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? "text-white" : ""
                    }`}
                    style={
                      isToday
                        ? { background: "var(--accent)" }
                        : { color: "var(--text-secondary)" }
                    }
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={`${event.key}-${key}`}
                        className="rounded-md border px-2 py-1.5 text-[11px] leading-snug"
                        style={eventStyles(event.kind)}
                        title={event.tooltip}
                      >
                        <p className="truncate font-semibold">
                          {event.title}
                        </p>
                        <p className="truncate opacity-80">
                          {event.detail}
                        </p>
                        <p className="truncate opacity-70">
                          {event.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
