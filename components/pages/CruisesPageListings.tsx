"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { formatPrice } from "@/lib/client-dates";
import type { HathorCruiseSeed } from "@/lib/hathor-catalog";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  imageSrc: string;
  badge?: string;
  badgeSoft?: boolean;
  bookHref?: string;
};

type CruisesListingContextValue = {
  filter: VoyageFilter;
  setFilter: (value: VoyageFilter) => void;
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

const CARD_IMAGES = [
  "/pages-redesign/cruise-1.webp",
  "/pages-redesign/cruise-2.webp",
  "/pages-redesign/cruise-3.webp",
  "/pages-redesign/cruise-4.webp",
  "/pages-redesign/cruise-5.webp",
  "/pages-redesign/cruise-6.webp",
] as const;

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
    imageSrc: CARD_IMAGES[index % CARD_IMAGES.length]!,
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
  imageSrc: "/pages-redesign/cruise-5.webp",
  badge: "Exclusive",
  bookHref: "/charter",
};

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
    () => ({ filter, setFilter, filtered }),
    [filter, filtered],
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

  return (
    <div className="cruise-filter-inner">
      {FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          data-filter={item.id}
          onClick={() => {
            setFilter(item.id);
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
              gsap.from(".cruise-card:not(.is-filtered-out)", {
                opacity: 0.35,
                y: 20,
                duration: 0.45,
                stagger: 0.06,
                ease: "power2.out",
                overwrite: "auto",
              });
            });
          }}
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
    <div className="cruise-grid">
      {filtered.map((item) => (
        <article
          key={item.key}
          className="cruise-card"
          data-region={item.filterKey}
        >
          <div className="cruise-card-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageSrc} alt={`${item.title} — Hathor Dahabiya`} />
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
