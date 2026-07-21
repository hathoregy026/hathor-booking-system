"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/client-dates";
import type { HathorCruiseSeed } from "@/lib/hathor-catalog";
import { ScrollReveal } from "./ScrollReveal";

const CRUISE_PLACEHOLDER =
  "linear-gradient(135deg, #2a2218 0%, #5c4a2e 40%, #1a1a1a 100%)";

type CruiseListingItem = {
  key: string;
  cruiseName: string;
  cruiseSlug: string;
  departureDay: string;
  nights: number;
  days: number;
  roomName: string;
  description: string;
  priceCents: number;
  capacity: number;
  amenities: readonly string[];
};

function flattenCruises(cruises: HathorCruiseSeed[]): CruiseListingItem[] {
  return cruises.flatMap((cruise) =>
    cruise.rooms.map((room) => ({
      key: `${cruise.slug}-${room.roomNumber}`,
      cruiseName: cruise.name,
      cruiseSlug: cruise.slug,
      departureDay: cruise.departureDay,
      nights: cruise.nights,
      days: cruise.days,
      roomName: room.name,
      description: room.description,
      priceCents: room.priceCents,
      capacity: room.capacity,
      amenities: room.amenities,
    })),
  );
}

type CruisesListingProps = {
  cruises: HathorCruiseSeed[];
};

export function CruisesListing({ cruises }: CruisesListingProps) {
  const items = useMemo(() => flattenCruises(cruises), [cruises]);
  const durations = useMemo(
    () => [...new Set(cruises.map((c) => c.nights))].sort((a, b) => a - b),
    [cruises],
  );

  const [durationFilter, setDurationFilter] = useState<number | "all">("all");
  const [departureFilter, setDepartureFilter] = useState<string | "all">("all");

  const departures = useMemo(
    () => [...new Set(cruises.map((c) => c.departureDay))],
    [cruises],
  );

  const filtered = items.filter((item) => {
    if (durationFilter !== "all" && item.nights !== durationFilter) return false;
    if (departureFilter !== "all" && item.departureDay !== departureFilter)
      return false;
    return true;
  });

  return (
    <div className="lux-container pb-20">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="lux-filter h-fit lg:sticky lg:top-28">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--lux-gold)]">
            Filters
          </p>

          <div className="mt-5">
            <p className="lux-label">Duration</p>
            <button
              type="button"
              onClick={() => setDurationFilter("all")}
              className={`lux-filter__option mt-1 ${durationFilter === "all" ? "lux-filter__option--active" : ""}`}
            >
              All durations
            </button>
            {durations.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDurationFilter(n)}
                className={`lux-filter__option ${durationFilter === n ? "lux-filter__option--active" : ""}`}
              >
                {n} nights
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="lux-label">Departure day</p>
            <button
              type="button"
              onClick={() => setDepartureFilter("all")}
              className={`lux-filter__option mt-1 ${departureFilter === "all" ? "lux-filter__option--active" : ""}`}
            >
              Any day
            </button>
            {departures.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setDepartureFilter(day)}
                className={`lux-filter__option ${departureFilter === day ? "lux-filter__option--active" : ""}`}
              >
                {day}
              </button>
            ))}
          </div>

          <Link href="/book" className="public-btn-gold mt-6 w-full text-center">
            Check Availability
          </Link>
        </aside>

        <div>
          <p className="mb-6 text-sm text-[var(--public-muted)]">
            {filtered.length} cabin{filtered.length !== 1 ? "s" : ""} available
          </p>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.key} delay={i * 80}>
                <article className="lux-cruise-card flex h-full flex-col">
                  <div
                    className="lux-cruise-card__image"
                    style={{ background: CRUISE_PLACEHOLDER }}
                  >
                    <span className="lux-cruise-card__badge">
                      {item.nights}N / {item.days}D
                    </span>
                  </div>
                  <div className="lux-cruise-card__body flex flex-1 flex-col">
                    <p className="text-xs uppercase tracking-wider text-[var(--lux-text-grey)]">
                      Departs {item.departureDay}
                    </p>
                    <h3 className="lux-cruise-card__name mt-2">{item.roomName}</h3>
                    <p className="mt-2 line-clamp-2 text-sm font-light text-[var(--lux-text-grey)]">
                      {item.cruiseName}
                    </p>
                    <p className="lux-cruise-card__price mt-auto pt-4">
                      {formatPrice(item.priceCents)}
                    </p>
                    <p className="text-xs text-[var(--lux-text-grey)]">
                      per cabin · up to {item.capacity} guests
                    </p>
                    <Link
                      href="/book"
                      className="public-btn-outline-gold mt-4 w-full py-3 text-center text-xs text-[var(--lux-gold-cream)]"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
