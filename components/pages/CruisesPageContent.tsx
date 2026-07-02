"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { CtaBand } from "@/components/pages/CtaBand";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/client-dates";
import type { HathorCruiseSeed } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

type CruiseListingItem = {
  key: string;
  cruiseName: string;
  departureDay: string;
  nights: number;
  days: number;
  roomName: string;
  roomType: string;
  description: string;
  priceCents: number;
  capacity: number;
  amenities: readonly string[];
  imageName: string;
  detailHref: string;
};

function roomImageName(roomType: string): string {
  if (roomType.includes("Royal")) return "room-royal";
  if (roomType.includes("Suite")) return "room-suite";
  return "room-luxury";
}

function roomDetailHref(roomType: string): string {
  if (roomType.includes("Royal")) {
    return "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise";
  }
  return "/rooms";
}

function flattenCruises(cruises: HathorCruiseSeed[]): CruiseListingItem[] {
  return cruises.flatMap((cruise) =>
    cruise.rooms.map((room) => ({
      key: `${cruise.slug}-${room.roomNumber}`,
      cruiseName: cruise.name,
      departureDay: cruise.departureDay,
      nights: cruise.nights,
      days: cruise.days,
      roomName: room.name,
      roomType: room.roomType,
      description: room.description,
      priceCents: room.priceCents,
      capacity: room.capacity,
      amenities: room.amenities.slice(0, 3),
      imageName: roomImageName(room.roomType),
      detailHref: roomDetailHref(room.roomType),
    })),
  );
}

type CruisesPageContentProps = {
  cruises: HathorCruiseSeed[];
};

export function CruisesPageContent({ cruises }: CruisesPageContentProps) {
  const items = useMemo(() => flattenCruises(cruises), [cruises]);
  const durations = useMemo(
    () => [...new Set(cruises.map((c) => c.nights))].sort((a, b) => a - b),
    [cruises],
  );
  const departures = useMemo(
    () => [...new Set(cruises.map((c) => c.departureDay))],
    [cruises],
  );

  const [durationFilter, setDurationFilter] = useState<number | "all">("all");
  const [departureFilter, setDepartureFilter] = useState<string | "all">("all");

  const filtered = items.filter((item) => {
    if (durationFilter !== "all" && item.nights !== durationFilter) return false;
    if (departureFilter !== "all" && item.departureDay !== departureFilter) {
      return false;
    }
    return true;
  });

  return (
    <PageScrollTransition
      title={CRUISES_PAGE.hero.title}
      subtitle={CRUISES_PAGE.hero.subtitle}
      breadcrumb="Cruises"
      imageName="cruises-hero"
    >

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <ScrollReveal>
            <div className="hathor-section-header">
              <h2 className="hathor-section-title">{CRUISES_PAGE.sectionTitle}</h2>
              <div className="hathor-gold-line" />
            </div>
          </ScrollReveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside className="hathor-filter-panel h-fit lg:sticky lg:top-28">
              <p className="hathor-section-eyebrow">Filters</p>

              <div className="mt-6">
                <p className="lux-label">Duration</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationFilter("all")}
                    className={`hathor-filter-btn ${durationFilter === "all" ? "hathor-filter-btn--active" : ""}`}
                  >
                    All
                  </button>
                  {durations.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDurationFilter(n)}
                      className={`hathor-filter-btn ${durationFilter === n ? "hathor-filter-btn--active" : ""}`}
                    >
                      {n} nights
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="lux-label">Departure</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDepartureFilter("all")}
                    className={`hathor-filter-btn ${departureFilter === "all" ? "hathor-filter-btn--active" : ""}`}
                  >
                    Any day
                  </button>
                  {departures.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDepartureFilter(day)}
                      className={`hathor-filter-btn ${departureFilter === day ? "hathor-filter-btn--active" : ""}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <BookNowTrigger className="public-btn-gold mt-8 w-full py-3 text-center text-xs">
                Check Availability
              </BookNowTrigger>
            </aside>

            <div>
              <p className="mb-6 text-sm text-[var(--public-muted)]">
                {filtered.length} listing{filtered.length !== 1 ? "s" : ""} available
              </p>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {filtered.map((item, index) => (
                  <ScrollReveal key={item.key} delay={index * 60}>
                    <article className="hathor-cruise-card group">
                      <div className="hathor-cruise-card__image">
                        <ManagedImage
                          name={item.imageName}
                          alt={`${item.roomName} — ${item.cruiseName}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <span className="hathor-cruise-card__badge">
                          {item.nights}N / {item.days}D
                        </span>
                      </div>
                      <div className="hathor-cruise-card__body">
                        <p className="hathor-cruise-card__meta">
                          Departs {item.departureDay}
                        </p>
                        <h3 className="hathor-cruise-card__title">{item.roomName}</h3>
                        <p className="hathor-cruise-card__route">{item.cruiseName}</p>
                        <p className="hathor-cruise-card__description">{item.description}</p>
                        <ul className="hathor-cruise-card__features">
                          {item.amenities.map((amenity) => (
                            <li key={amenity}>{amenity}</li>
                          ))}
                        </ul>
                        <p className="hathor-cruise-card__price">
                          {formatPrice(item.priceCents)}
                        </p>
                        <p className="hathor-cruise-card__capacity">
                          per cabin · up to {item.capacity} guests
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={item.detailHref}
                            className="public-btn-outline-gold flex-1 py-3 text-center text-xs"
                          >
                            View Details
                          </Link>
                          <BookNowTrigger className="public-btn-gold flex-1 py-3 text-xs">
                            Book Now
                          </BookNowTrigger>
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </PageScrollTransition>
  );
}
