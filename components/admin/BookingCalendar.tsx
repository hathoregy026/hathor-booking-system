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
import type { AdminBookingDto } from "@/lib/admin-bookings";
import { displayBookingStatus, isPendingBookingStatus } from "@/lib/admin-bookings";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/lib/client-dates";

type BookingCalendarProps = {
  bookings: AdminBookingDto[];
  isLoading?: boolean;
};

function bookingCoversDay(booking: AdminBookingDto, day: Date): boolean {
  const checkIn = startOfDay(parseISO(booking.checkInDate));
  const checkOut = startOfDay(parseISO(booking.checkOutDate));
  const current = startOfDay(day);

  return current >= checkIn && current < checkOut;
}

function eventStyles(status: string): CSSProperties {
  if (status === BookingStatus.CONFIRMED) {
    return {
      background:
        "color-mix(in srgb, var(--success) 18%, var(--bg-glass))",
      borderColor: "color-mix(in srgb, var(--success) 45%, transparent)",
      color: "var(--text-primary)",
    };
  }

  if (isPendingBookingStatus(status)) {
    return {
      background:
        "color-mix(in srgb, var(--warning) 20%, var(--bg-glass))",
      borderColor: "color-mix(in srgb, var(--warning) 45%, transparent)",
      color: "var(--text-primary)",
    };
  }

  return {
    background: "var(--bg-glass)",
    borderColor: "var(--border)",
    color: "var(--text-secondary)",
  };
}

export function BookingCalendar({ bookings, isLoading }: BookingCalendarProps) {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const calendarBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          !booking.deletedAt &&
          (booking.status === BookingStatus.CONFIRMED ||
            isPendingBookingStatus(booking.status)),
      ),
    [bookings],
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AdminBookingDto[]>();

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        calendarBookings.filter((booking) => bookingCoversDay(booking, day)),
      );
    }

    return map;
  }, [calendarBookings, days]);

  const monthBookings = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    return calendarBookings
      .filter((booking) => {
        const checkIn = startOfDay(parseISO(booking.checkInDate));
        return checkIn >= monthStart && checkIn <= monthEnd;
      })
      .sort(
        (left, right) =>
          parseISO(left.checkInDate).getTime() -
          parseISO(right.checkInDate).getTime(),
      );
  }, [calendarBookings, month]);

  if (isLoading) {
    return (
      <div className="admin-card p-6">
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
    <div className="admin-card overflow-hidden">
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
              : "Pending and confirmed reservations by check-in date"}
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
        className="flex flex-wrap gap-3 border-b px-4 py-3 text-xs sm:gap-4 sm:px-6"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm border"
            style={eventStyles(BookingStatus.CONFIRMED)}
          />
          Confirmed
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm border"
            style={eventStyles(BookingStatus.PENDING_HOLD)}
          />
          Pending
        </span>
      </div>

      {isMobile ? (
        <div className="space-y-3 p-4">
          {monthBookings.length === 0 ? (
            <p
              className="py-10 text-center text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              No pending or confirmed bookings this month.
            </p>
          ) : (
            monthBookings.map((booking) => (
              <article
                key={booking.id}
                className="admin-card rounded-xl border p-4"
                style={eventStyles(booking.status)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{booking.customerName}</p>
                    <p className="mt-1 text-xs opacity-80">
                      {format(parseISO(booking.checkInDate), "EEE, MMM d")} –{" "}
                      {format(parseISO(booking.checkOutDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide opacity-80">
                    {displayBookingStatus(booking.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm opacity-90">{booking.cruiseName}</p>
                <p className="mt-1 text-xs opacity-75">
                  {booking.roomTypes.join(", ") || booking.rooms.join(", ") || "Room"}
                  {" · "}
                  {formatPrice(booking.totalPriceCents)}
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
                  className="min-h-[7.5rem] border-b border-r p-2"
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
                    {dayEvents.map((booking) => (
                      <div
                        key={`${booking.id}-${key}`}
                        className="rounded-md border px-2 py-1.5 text-[11px] leading-snug"
                        style={eventStyles(booking.status)}
                        title={`${booking.customerName} · ${booking.roomTypes.join(", ") || booking.rooms.join(", ")}`}
                      >
                        <p className="truncate font-semibold">
                          {booking.customerName}
                        </p>
                        <p className="truncate opacity-80">
                          {booking.roomTypes[0] ?? booking.rooms[0] ?? "Room"}
                        </p>
                        <p className="truncate opacity-70">
                          {displayBookingStatus(booking.status)}
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
