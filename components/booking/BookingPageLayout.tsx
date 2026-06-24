"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";

type BookingPageLayoutProps = {
  children: React.ReactNode;
  brandTitle?: string;
};

export function BookingPageLayout({
  children,
  brandTitle = "Hathor",
}: BookingPageLayoutProps) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="booking-page">
      {bannerVisible && (
        <div
          className="relative flex items-center justify-center px-10 py-2.5 text-center text-xs sm:text-sm"
          style={{ background: "var(--booking-gold-dark)", color: "#ffffff" }}
        >
          <p>
            Sign up for our weekly newsletter and get{" "}
            <span className="font-semibold">10% off</span> your next cruise.{" "}
            <button type="button" className="underline underline-offset-2">
              Sign up
            </button>
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
      )}

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
            className="booking-serif text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--booking-gold-dark)" }}
          >
            {brandTitle}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "var(--booking-gold-dark)", color: "#fff" }}
            aria-label="Booking cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </header>

        {menuOpen && (
          <nav
            className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8"
            aria-label="Mobile menu"
          >
            <div className="booking-card flex flex-col gap-1 p-3 text-sm">
              <Link
                href="/"
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
        )}
      </div>

      <div className="booking-wave-bg">
        <main className="booking-main mx-auto max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
