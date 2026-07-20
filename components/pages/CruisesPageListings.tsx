"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { formatPrice } from "@/lib/client-dates";
import type { HathorCruiseSeed } from "@/lib/hathor-catalog";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { refreshCruisesHeroStripes } from "@/hooks/useCruisesHeroStripes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

type CruisesListingContextValue = {
  durationFilter: number | "all";
  setDurationFilter: (value: number | "all") => void;
  departureFilter: string | "all";
  setDepartureFilter: (value: string | "all") => void;
  durations: number[];
  departures: string[];
  filtered: CruiseListingItem[];
};

const CruisesListingContext = createContext<CruisesListingContextValue | null>(
  null,
);

function useCruisesListing() {
  const ctx = useContext(CruisesListingContext);
  if (!ctx) {
    throw new Error("Cruises listing components must be used within CruisesListingProvider");
  }
  return ctx;
}

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

function stabilizeListingsLayoutDuringFilterChange() {
  const content = document.querySelector<HTMLElement>(".cruise-grid-section");
  if (content) {
    content.style.minHeight = `${content.offsetHeight}px`;
  }
  refreshCruisesHeroStripes();
  window.requestAnimationFrame(() => {
    if (content) content.style.minHeight = "";
    ScrollTrigger.refresh();
  });
}

type CruisesListingProviderProps = {
  cruises: HathorCruiseSeed[];
  children: ReactNode;
};

export function CruisesListingProvider({
  cruises,
  children,
}: CruisesListingProviderProps) {
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

  const value = useMemo(
    () => ({
      durationFilter,
      setDurationFilter,
      departureFilter,
      setDepartureFilter,
      durations,
      departures,
      filtered,
    }),
    [durationFilter, departureFilter, durations, departures, filtered],
  );

  return (
    <CruisesListingContext.Provider value={value}>
      {children}
    </CruisesListingContext.Provider>
  );
}

export function CruisesPageFilters() {
  const {
    durationFilter,
    setDurationFilter,
    departureFilter,
    setDepartureFilter,
    durations,
    departures,
  } = useCruisesListing();
  const pinnedScrollYRef = useRef<number | null>(null);

  const keepPinnedScrollStable = () => {
    pinnedScrollYRef.current = window.scrollY;
  };

  const applyFilter = (fn: () => void) => {
    fn();
    stabilizeListingsLayoutDuringFilterChange();
    pinnedScrollYRef.current = null;
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.from(".cruise-card", {
        opacity: 0.35,
        y: 20,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <div className="cruise-filter-inner" aria-label="Listing filters">
      <button
        type="button"
        onPointerDown={keepPinnedScrollStable}
        onClick={() =>
          applyFilter(() => {
            setDurationFilter("all");
            setDepartureFilter("all");
          })
        }
        className={`cruise-filter${durationFilter === "all" && departureFilter === "all" ? " is-active" : ""}`}
      >
        All Voyages
      </button>
      {durations.map((n) => (
        <button
          key={`n-${n}`}
          type="button"
          onPointerDown={keepPinnedScrollStable}
          onClick={() => applyFilter(() => setDurationFilter(n))}
          className={`cruise-filter${durationFilter === n ? " is-active" : ""}`}
        >
          {n} Nights
        </button>
      ))}
      {departures.map((day) => (
        <button
          key={`d-${day}`}
          type="button"
          onPointerDown={keepPinnedScrollStable}
          onClick={() => applyFilter(() => setDepartureFilter(day))}
          className={`cruise-filter${departureFilter === day ? " is-active" : ""}`}
        >
          {day}
        </button>
      ))}
      <BookNowTrigger className="cruise-filter cruise-filter--cta">
        Check Availability
      </BookNowTrigger>
    </div>
  );
}

export function CruisesPageListingsGrid() {
  const { filtered } = useCruisesListing();

  return (
    <div className="cruise-grid" aria-label="Cruise listings">
      {filtered.map((item) => (
        <article key={item.key} className="cruise-card">
          <div className="cruise-card-media">
            <ManagedImage
              name={item.imageName}
              alt={`${item.roomName} — ${item.cruiseName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              previewAnchor={false}
            />
            <div className="cruise-card-badge">
              {item.nights}N / {item.days}D
            </div>
            <div className="cruise-card-shine" aria-hidden="true" />
          </div>
          <div className="cruise-card-body">
            <p className="cruise-card-region">Departs {item.departureDay}</p>
            <h3 className="cruise-card-title">{item.roomName}</h3>
            <p className="cruise-card-meta">
              {item.cruiseName} · up to {item.capacity} guests
            </p>
            <p className="cruise-card-desc">{item.description}</p>
            <ul className="cruise-card-amenities">
              {item.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
            <div className="cruise-card-price">
              <span className="cruise-price-label">From</span>
              <span className="cruise-price-value">
                {formatPrice(item.priceCents)}
              </span>
              <span className="cruise-price-unit">/ cabin</span>
            </div>
            <div className="cruise-card-actions">
              <Link href={item.detailHref} className="btn btn-dark cruise-avail">
                View Details
              </Link>
              <BookNowTrigger className="btn btn-filled cruise-book">
                Book Now
              </BookNowTrigger>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
