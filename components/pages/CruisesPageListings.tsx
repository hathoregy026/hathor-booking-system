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

type VoyageFilter = "all" | "3" | "4" | "7" | "charter";

type VoyageCard = {
  key: string;
  filterKey: VoyageFilter;
  region: string;
  title: string;
  meta: string;
  description: string;
  priceCents: number | null;
  priceUnit: string;
  imageName: string;
  badge?: string;
  badgeSoft?: boolean;
  bookHref?: string;
};

type CruisesListingContextValue = {
  filter: VoyageFilter;
  setFilter: (value: VoyageFilter) => void;
  voyages: VoyageCard[];
  filtered: VoyageCard[];
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

const VOYAGE_IMAGES = ["cruises-hero", "room-suite", "room-royal", "room-luxury"] as const;

function shortVoyageTitle(cruise: HathorCruiseSeed): string {
  if (cruise.nights === 3) return "Aswan to Luxor";
  if (cruise.nights === 4) return "Luxor to Aswan";
  return "Classic Nile Loop";
}

function cruiseToVoyage(cruise: HathorCruiseSeed, index: number): VoyageCard {
  const fromPrice = Math.min(...cruise.rooms.map((r) => r.priceCents));
  const filterKey = String(cruise.nights) as "3" | "4" | "7";

  return {
    key: cruise.slug,
    filterKey,
    region: "Nile Dahabiya",
    title: shortVoyageTitle(cruise),
    meta: `${cruise.nights} nights · ${cruise.days} days · Every ${cruise.departureDay}`,
    description: cruise.description,
    priceCents: fromPrice,
    priceUnit: "/ cabin",
    imageName: VOYAGE_IMAGES[index % VOYAGE_IMAGES.length] ?? "cruises-hero",
    badge: index === 0 ? "Featured" : cruise.nights === 7 ? "Signature" : undefined,
    badgeSoft: cruise.nights === 4,
  };
}

const CHARTER_VOYAGE: VoyageCard = {
  key: "private-charter",
  filterKey: "charter",
  region: "Private Charter",
  title: "The Hathor",
  meta: "Custom · Full ship · Your itinerary",
  description:
    "The entire Dahabiya, your route, and a private crew — a voyage written only for you on the Nile.",
  priceCents: null,
  priceUnit: "/ charter",
  imageName: "room-royal",
  badge: "Exclusive",
  bookHref: "/charter",
};

function stabilizeListingsLayoutDuringFilterChange() {
  const content = document.querySelector<HTMLElement>(".cruise-grid-section");
  if (content) {
    content.style.minHeight = `${content.offsetHeight}px`;
  }

  refreshCruisesHeroStripes();

  window.requestAnimationFrame(() => {
    if (content) {
      content.style.minHeight = "";
    }
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
  const voyages = useMemo(
    () => [...cruises.map(cruiseToVoyage), CHARTER_VOYAGE],
    [cruises],
  );

  const [filter, setFilter] = useState<VoyageFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return voyages;
    return voyages.filter((v) => v.filterKey === filter);
  }, [filter, voyages]);

  const value = useMemo(
    () => ({
      filter,
      setFilter,
      voyages,
      filtered,
    }),
    [filter, voyages, filtered],
  );

  return (
    <CruisesListingContext.Provider value={value}>
      {children}
    </CruisesListingContext.Provider>
  );
}

const FILTERS: { id: VoyageFilter; label: string }[] = [
  { id: "all", label: "All Voyages" },
  { id: "3", label: "3 Nights" },
  { id: "4", label: "4 Nights" },
  { id: "7", label: "7 Nights" },
  { id: "charter", label: "Private Charter" },
];

export function CruisesPageFilters() {
  const { filter, setFilter } = useCruisesListing();
  const pinnedScrollYRef = useRef<number | null>(null);

  const keepPinnedScrollStable = () => {
    pinnedScrollYRef.current = window.scrollY;
  };

  const updateFilter = (value: VoyageFilter) => {
    setFilter(value);
    stabilizeListingsLayoutDuringFilterChange();
    pinnedScrollYRef.current = null;
  };

  return (
    <div className="cruise-filter-inner">
      {FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          tabIndex={-1}
          data-filter={item.id}
          onPointerDown={keepPinnedScrollStable}
          onMouseDown={keepPinnedScrollStable}
          onClick={() => updateFilter(item.id)}
          className={`cruise-filter${filter === item.id ? " is-active" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function CruisesPageListingsGrid() {
  const { filtered } = useCruisesListing();

  return (
    <div className="cruise-grid" aria-label="Cruise voyages">
      {filtered.map((item) => (
        <article
          key={item.key}
          className="cruise-card"
          data-region={item.filterKey}
        >
          <div className="cruise-card-media">
            <ManagedImage
              name={item.imageName}
              alt={`${item.title} — Hathor Dahabiya`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {item.badge ? (
              <div
                className={`cruise-card-badge${item.badgeSoft ? " cruise-card-badge--soft" : ""}`}
              >
                {item.badge}
              </div>
            ) : null}
            <div className="cruise-card-shine" aria-hidden="true" />
          </div>
          <div className="cruise-card-body">
            <p className="cruise-card-region">{item.region}</p>
            <h3 className="cruise-card-title">{item.title}</h3>
            <p className="cruise-card-meta">{item.meta}</p>
            <p className="cruise-card-desc">{item.description}</p>
            <div className="cruise-card-price">
              <span className="cruise-price-label">From</span>
              <span className="cruise-price-value">
                {item.priceCents != null ? formatPrice(item.priceCents) : "Inquire"}
              </span>
              <span className="cruise-price-unit">{item.priceUnit}</span>
            </div>
            <div className="cruise-card-actions">
              {item.bookHref ? (
                <Link href={item.bookHref} className="btn btn-filled cruise-book">
                  Book Now
                </Link>
              ) : (
                <BookNowTrigger className="btn btn-filled cruise-book">
                  Book Now
                </BookNowTrigger>
              )}
              {item.bookHref ? (
                <Link href={item.bookHref} className="btn btn-dark cruise-avail">
                  Check Availability
                </Link>
              ) : (
                <BookNowTrigger className="btn btn-dark cruise-avail">
                  Check Availability
                </BookNowTrigger>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
