"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { formatPrice } from "@/lib/client-dates";
import { HATHOR_CRUISES, type HathorCruiseSeed } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";
import {
  normalizeOptionalText,
  resolveCmsText,
} from "@/lib/website-text-shared";

type RoomCategory = "all" | "Luxury Room" | "Luxury Suite" | "Luxury Royal Suite";
type SortKey = "price-asc" | "price-desc" | "nights-asc" | "nights-desc";

type ListingItem = {
  key: string;
  cruiseName: string;
  departureDay: string;
  nights: number;
  days: number;
  roomName: string;
  roomType: string;
  roomNumber: string;
  description: string;
  priceCents: number;
  capacity: number;
  amenities: readonly string[];
  imageName: string;
  detailHref: string;
};

const ROOM_TYPES: { id: RoomCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Luxury Room", label: "Rooms" },
  { id: "Luxury Suite", label: "Suites" },
  { id: "Luxury Royal Suite", label: "Royal" },
];

const FEATURE_FILTERS = [
  { id: "nile", label: "Nile View", match: /nile view/i },
  { id: "jacuzzi", label: "Jacuzzi", match: /jacuzzi/i },
  { id: "bathtub", label: "Bathtub", match: /bathtub/i },
  { id: "wifi", label: "Wi-Fi", match: /wi-?fi|internet/i },
  { id: "minibar", label: "Minibar", match: /mini\s?bar/i },
  { id: "safe", label: "Safe", match: /safe/i },
] as const;

function roomImageName(roomType: string): string {
  if (roomType.includes("Royal")) return "room-royal";
  if (roomType.includes("Suite")) return "room-suite";
  return "room-luxury";
}

function roomDetailHref(roomType: string): string {
  if (roomType.includes("Royal")) {
    return "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise";
  }
  if (roomType.includes("Suite")) {
    return "/rooms#suites";
  }
  return "/luxury-cabins-Nile-Cruise";
}

function flattenCruises(cruises: HathorCruiseSeed[]): ListingItem[] {
  return cruises.flatMap((cruise) =>
    cruise.rooms.map((room) => ({
      key: `${cruise.slug}-${room.roomNumber}`,
      cruiseName: cruise.name,
      departureDay: cruise.departureDay,
      nights: cruise.nights,
      days: cruise.days,
      roomName: room.name,
      roomType: room.roomType,
      roomNumber: room.roomNumber,
      description: room.description,
      priceCents: room.priceCents,
      capacity: room.capacity,
      amenities: room.amenities,
      imageName: roomImageName(room.roomType),
      detailHref: roomDetailHref(room.roomType),
    })),
  );
}

function displayUnitCode(roomNumber: string): string {
  const parts = roomNumber.split("-");
  return parts[0] ?? roomNumber;
}

function DualRange({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  format,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: [number, number]) => void;
  format: (n: number) => string;
}) {
  const span = Math.max(max - min, 1);
  const left = ((valueMin - min) / span) * 100;
  const right = ((valueMax - min) / span) * 100;

  return (
    <div className="mr-range">
      <div className="mr-range__labels">
        <span>{format(valueMin)}</span>
        <span>{format(valueMax)}</span>
      </div>
      <div className="mr-range__track">
        <div
          className="mr-range__fill"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          aria-label="Minimum"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), valueMax);
            onChange([next, valueMax]);
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          aria-label="Maximum"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), valueMin);
            onChange([valueMin, next]);
          }}
        />
      </div>
    </div>
  );
}

export function MaskRevealPageContent() {
  const { pages } = useWebsiteText();
  const cruisesText = pages.cruises;

  const pageTitle = resolveCmsText(
    cruisesText.overviewTitle,
    CRUISES_PAGE.sectionTitle,
  );
  const overviewIntro = normalizeOptionalText(cruisesText.overviewIntro);
  const continueTitle = resolveCmsText(
    cruisesText.continueTitle,
    "Continue exploring\naboard Hathor",
  );
  const continueBody = normalizeOptionalText(cruisesText.continueBody);
  const ctaTitle = resolveCmsText(cruisesText.ctaTitle, "Reserve your voyage");
  const ctaBody = normalizeOptionalText(cruisesText.ctaBody);

  const items = useMemo(() => flattenCruises(HATHOR_CRUISES), []);
  const durations = useMemo(
    () => [...new Set(items.map((i) => i.nights))].sort((a, b) => a - b),
    [items],
  );
  const departures = useMemo(
    () => [...new Set(items.map((i) => i.departureDay))],
    [items],
  );

  const priceBounds = useMemo(() => {
    const prices = items.map((i) => i.priceCents);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [items]);

  const [sort, setSort] = useState<SortKey>("price-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [roomType, setRoomType] = useState<RoomCategory>("all");
  const [durationFilter, setDurationFilter] = useState<number | "all">("all");
  const [departureFilter, setDepartureFilter] = useState<string | "all">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);
  const [features, setFeatures] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<Set<string>>(() => new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = items.filter((item) => {
      if (roomType !== "all" && item.roomType !== roomType) return false;
      if (durationFilter !== "all" && item.nights !== durationFilter) return false;
      if (departureFilter !== "all" && item.departureDay !== departureFilter) {
        return false;
      }
      if (item.priceCents < priceRange[0] || item.priceCents > priceRange[1]) {
        return false;
      }
      if (features.length > 0) {
        const joined = item.amenities.join(" ");
        const ok = features.every((id) => {
          const rule = FEATURE_FILTERS.find((f) => f.id === id);
          return rule ? rule.match.test(joined) : true;
        });
        if (!ok) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return b.priceCents - a.priceCents;
        case "nights-asc":
          return a.nights - b.nights || a.priceCents - b.priceCents;
        case "nights-desc":
          return b.nights - a.nights || a.priceCents - b.priceCents;
        case "price-asc":
        default:
          return a.priceCents - b.priceCents;
      }
    });

    return list;
  }, [
    items,
    roomType,
    durationFilter,
    departureFilter,
    priceRange,
    features,
    sort,
  ]);

  const sortLabel =
    sort === "price-asc"
      ? "Lowest Price"
      : sort === "price-desc"
        ? "Highest Price"
        : sort === "nights-asc"
          ? "Shortest Voyage"
          : "Longest Voyage";

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleFavourite = (key: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetFilters = () => {
    setRoomType("all");
    setDurationFilter("all");
    setDepartureFilter("all");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setFeatures([]);
    setSort("price-asc");
  };

  const renderFilters = (instance: "desktop" | "mobile") => (
    <aside
      key={instance}
      className="mr-filters"
      aria-label="Voyage filters"
    >
      <div className="mr-filters__title-row">
        <h1 className="mr-filters__title">{pageTitle}</h1>
        {instance === "mobile" ? (
          <button
            type="button"
            className="mr-filters__close"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            Close
          </button>
        ) : null}
      </div>

      {overviewIntro ? (
        <p className="mr-filters__intro">{overviewIntro}</p>
      ) : null}

      <div className="mr-sort">
        <button
          type="button"
          className="mr-sort__trigger"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen((v) => !v)}
        >
          <span>{sortLabel}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path
              d="M1 1.25 5 4.75 9 1.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        </button>
        {sortOpen ? (
          <div className="mr-sort__menu" role="listbox">
            {(
              [
                ["price-asc", "Lowest Price"],
                ["price-desc", "Highest Price"],
                ["nights-asc", "Shortest Voyage"],
                ["nights-desc", "Longest Voyage"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={sort === key}
                className={sort === key ? "is-active" : undefined}
                onClick={() => {
                  setSort(key);
                  setSortOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mr-choices" role="group" aria-label="Cabin type">
        {ROOM_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`mr-pill${roomType === type.id ? " is-active" : ""}`}
            onClick={() => setRoomType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="mr-choices mr-choices--nights" role="group" aria-label="Duration">
        <button
          type="button"
          className={`mr-pill mr-pill--round${durationFilter === "all" ? " is-active" : ""}`}
          onClick={() => setDurationFilter("all")}
        >
          All
        </button>
        {durations.map((n) => (
          <button
            key={n}
            type="button"
            className={`mr-pill mr-pill--round${durationFilter === n ? " is-active" : ""}`}
            onClick={() => setDurationFilter(n)}
          >
            {n}N
          </button>
        ))}
        <span className="mr-choices__label">Nights</span>
      </div>

      <div className="mr-choices" role="group" aria-label="Departure day">
        <button
          type="button"
          className={`mr-pill${departureFilter === "all" ? " is-active" : ""}`}
          onClick={() => setDepartureFilter("all")}
        >
          Any Day
        </button>
        {departures.map((day) => (
          <button
            key={day}
            type="button"
            className={`mr-pill${departureFilter === day ? " is-active" : ""}`}
            onClick={() => setDepartureFilter(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="mr-range-block">
        <p className="mr-range-block__label">Price</p>
        <DualRange
          min={priceBounds.min}
          max={priceBounds.max}
          valueMin={priceRange[0]}
          valueMax={priceRange[1]}
          onChange={setPriceRange}
          format={(n) => formatPrice(n)}
        />
      </div>

      <div className="mr-features" role="group" aria-label="Amenities">
        {FEATURE_FILTERS.map((feature) => (
          <button
            key={feature.id}
            type="button"
            className={`mr-feature${features.includes(feature.id) ? " is-active" : ""}`}
            onClick={() => toggleFeature(feature.id)}
          >
            {feature.label}
          </button>
        ))}
      </div>

      <div className="mr-filters__actions">
        <button type="button" className="mr-btn mr-btn--ghost" onClick={resetFilters}>
          Reset
        </button>
        <BookNowTrigger className="mr-btn mr-btn--solid">
          Check Availability
        </BookNowTrigger>
      </div>

      <nav className="mr-explore" aria-label="Continue exploring">
        <p className="mr-explore__eyebrow">Onboard</p>
        <p className="mr-explore__title">
          {continueTitle.split("\n").map((line) => (
            <span key={line}>{line.trim()}</span>
          ))}
        </p>
        {continueBody ? <p className="mr-explore__body">{continueBody}</p> : null}
        <ul>
          <li>
            <Link href="/luxury-cabins-Nile-Cruise">Luxury Rooms</Link>
          </li>
          <li>
            <Link href="/rooms">Luxury Suites</Link>
          </li>
          <li>
            <Link href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise">
              Royal Suites
            </Link>
          </li>
          <li>
            <Link href="/gastronomy">Dining — Hathor Flavors</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );

  return (
    <div className="mask-reveal-page">
      <div className="mr-gradient" aria-hidden="true">
        <div />
        <div />
        <div />
        <div />
      </div>

      <div className="mr-shell">
        <div className="mr-mobile-bar">
          <button
            type="button"
            className="mr-btn mr-btn--outline"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
          </button>
          <p className="mr-mobile-bar__count">
            {filtered.length} cabin{filtered.length === 1 ? "" : "s"}
          </p>
          <BookNowTrigger className="mr-btn mr-btn--solid">Book Now</BookNowTrigger>
        </div>

        <div className="mr-filters-desktop">{renderFilters("desktop")}</div>

        {mobileFiltersOpen ? (
          <div className="mr-filters-drawer is-open">
            <button
              type="button"
              className="mr-filters-drawer__backdrop"
              aria-label="Dismiss filters"
              onClick={() => setMobileFiltersOpen(false)}
            />
            {renderFilters("mobile")}
          </div>
        ) : null}

        <section className="mr-results" aria-label="Cruise listings">
          {filtered.length === 0 ? (
            <div className="mr-empty">
              <h2>No cabins match</h2>
              <p>Adjust filters or reset to see all Hathor voyages.</p>
              <button type="button" className="mr-btn mr-btn--outline" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="mr-grid">
              {filtered.map((item) => {
                const featuredAmenities = item.amenities.slice(0, 3);
                const favoured = favourites.has(item.key);
                return (
                  <li key={item.key}>
                    <article className="mr-card">
                      <div className="mr-card__top">
                        <div className="mr-card__features">
                          {featuredAmenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="mr-card__feature"
                              title={amenity}
                            >
                              {amenity.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className={`mr-card__fav${favoured ? " is-active" : ""}`}
                          aria-label={
                            favoured
                              ? `Remove ${item.roomName} from favourites`
                              : `Save ${item.roomName}`
                          }
                          aria-pressed={favoured}
                          onClick={() => toggleFavourite(item.key)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M12 20.5s-7.2-4.35-9.4-8.2C.8 9.2 2.1 5.8 5.4 5.2c1.9-.35 3.7.55 4.7 2 1-1.45 2.8-2.35 4.7-2 3.3.6 4.6 4 2.8 7.1C19.2 16.15 12 20.5 12 20.5Z"
                              fill={favoured ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="1.4"
                            />
                          </svg>
                        </button>
                      </div>

                      <Link
                        href={item.detailHref}
                        className="mr-card__plan"
                        aria-label={`View details: ${item.roomName}`}
                      >
                        <ManagedImage
                          name={item.imageName}
                          alt={`${item.roomName} — ${item.cruiseName}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          previewAnchor={false}
                        />
                      </Link>

                      <div className="mr-card__footer">
                        <div className="mr-card__price-row">
                          <div>
                            <p className="mr-card__price-meta">
                              {item.nights}N / {item.days}D · {item.roomType}
                            </p>
                            <p className="mr-card__price">{formatPrice(item.priceCents)}</p>
                          </div>
                          <p className="mr-card__finish">per cabin</p>
                        </div>

                        <div className="mr-card__meta-row">
                          <div className="mr-card__meta">
                            <p>{item.roomName}</p>
                            <p>up to {item.capacity} guests</p>
                            <p>Departs {item.departureDay}</p>
                          </div>
                          <p className="mr-card__unit">{displayUnitCode(item.roomNumber)}</p>
                        </div>

                        <div className="mr-card__actions">
                          <Link href={item.detailHref} className="mr-btn mr-btn--outline">
                            View Details
                          </Link>
                          <BookNowTrigger className="mr-btn mr-btn--solid">
                            Book Now
                          </BookNowTrigger>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="mr-cta">
            {ctaTitle ? <h2>{ctaTitle}</h2> : null}
            {ctaBody ? <p>{ctaBody}</p> : null}
            <div className="mr-cta__actions">
              <BookNowTrigger className="mr-btn mr-btn--solid">Book Now</BookNowTrigger>
              <Link className="mr-btn mr-btn--outline" href="/luxury-cabins-Nile-Cruise">
                Luxury Rooms
              </Link>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
