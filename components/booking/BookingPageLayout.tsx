"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { HathorBrandMark } from "@/components/booking/HathorBrandMark";
import { formatPrice } from "@/lib/client-dates";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { getSelectedRooms, useBookingStore } from "@/store/bookingStore";

type BookingPageLayoutProps = {
  children: React.ReactNode;
};

const NEWSLETTER_SIGNUP_HREF = `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent(
  "Newsletter signup — 10% off",
)}&body=${encodeURIComponent(
  "I would like to sign up for the Hathor weekly newsletter and the 10% cruise offer.",
)}`;

export function BookingPageLayout({
  children,
}: BookingPageLayoutProps) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartPanelId = useId();
  const cartRef = useRef<HTMLDivElement>(null);

  const itineraryConfigured = useBookingStore((state) => state.itineraryConfigured);
  const checkoutStep = useBookingStore((state) => state.checkoutStep);
  const isSuccess = useBookingStore((state) => state.isSuccess);
  const availableRooms = useBookingStore((state) => state.availableRooms);
  const selectedRoomIds = useBookingStore((state) => state.selectedRoomIds);
  const totalPrice = useBookingStore((state) => state.totalPrice);

  const selectedRooms = getSelectedRooms(availableRooms, selectedRoomIds);
  const selectedCount = selectedRooms.length;

  const isFocusedCheckout =
    (itineraryConfigured && checkoutStep >= 2) || isSuccess;

  useEffect(() => {
    if (!cartOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!cartRef.current?.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cartOpen]);

  const handleCartClick = () => {
    if (selectedCount === 0) {
      const results = document.getElementById("booking-search-results");
      if (results) {
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setCartOpen(true);
      return;
    }

    setCartOpen((open) => !open);
  };

  return (
    <div
      className={`booking-page${isFocusedCheckout ? " booking-page--checkout-focus" : ""}`}
    >
      {!isFocusedCheckout && bannerVisible ? (
        <div
          className="relative flex items-center justify-center px-10 py-2.5 text-center text-xs sm:text-sm"
          style={{ background: "var(--booking-gold-dark)", color: "#ffffff" }}
        >
          <p>
            Sign up for our weekly newsletter and get{" "}
            <span className="font-semibold">10% off</span> your next cruise.{" "}
            <a href={NEWSLETTER_SIGNUP_HREF} className="underline underline-offset-2">
              Sign up
            </a>
          </p>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-80 hover:opacity-100"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {!isFocusedCheckout ? (
        <div className="booking-header-bar">
          <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-black/5"
              aria-label="Menu"
              style={{ color: "var(--booking-gold-dark)" }}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link
              href="/"
              className="flex min-w-0 items-center justify-center"
            >
              <HathorBrandMark
                variant="on-light"
                className="h-10 w-auto max-w-[11rem] object-contain sm:h-11"
              />
            </Link>

            <div ref={cartRef} className="relative">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--booking-gold-dark)", color: "#fff" }}
                aria-label={
                  selectedCount > 0
                    ? `Booking cart, ${selectedCount} selected`
                    : "Booking cart"
                }
                aria-expanded={cartOpen}
                aria-controls={cartPanelId}
                onClick={handleCartClick}
              >
                <ShoppingBag className="h-4 w-4" />
                {selectedCount > 0 ? (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                    style={{ background: "var(--booking-navy)", color: "#fff" }}
                  >
                    {selectedCount}
                  </span>
                ) : null}
              </button>

              {cartOpen ? (
                <div
                  id={cartPanelId}
                  role="region"
                  aria-label="Selected rooms"
                  className="booking-card absolute right-0 z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] p-3 text-sm shadow-lg"
                >
                  {selectedCount === 0 ? (
                    <p style={{ color: "var(--booking-muted)" }}>
                      No rooms selected yet. Search sailings and choose a cabin
                      to add it here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <ul className="max-h-56 space-y-2 overflow-y-auto">
                        {selectedRooms.map((room) => (
                          <li
                            key={room.selectionKey ?? room.id}
                            className="flex items-start justify-between gap-3 border-b pb-2"
                            style={{ borderColor: "var(--booking-border)" }}
                          >
                            <span className="min-w-0 font-medium leading-snug">
                              {room.name}
                            </span>
                            <span
                              className="shrink-0 text-xs"
                              style={{ color: "var(--booking-muted)" }}
                            >
                              {formatPrice(room.minPriceCents)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <a
                        href="#booking-search-results"
                        className="booking-btn-outline block w-full px-3 py-2 text-center text-xs"
                        onClick={() => setCartOpen(false)}
                      >
                        Review selection
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </header>

          {menuOpen ? (
            <nav
              className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8"
              aria-label="Mobile menu"
            >
              <div className="booking-card flex flex-col gap-1 p-3 text-sm">
                <Link
                  href="/book"
                  className="rounded-xl px-4 py-2.5 font-medium hover:bg-black/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Book a Cruise
                </Link>
                <Link
                  href="/admin"
                  className="rounded-xl px-4 py-2.5 font-medium hover:bg-black/5"
                  style={{ color: "var(--booking-muted)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              </div>
            </nav>
          ) : null}
        </div>
      ) : null}

      <div className="booking-wave-bg">
        <main className="booking-main mx-auto max-w-[1400px] px-4 pb-20 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
