"use client";

import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";

type BookingPageLayoutProps = {
  children: ReactNode;
};

/**
 * Booking shell only — no public navbar, hero, or marketing chrome.
 * Does not alter the booking engine / store / Supabase flows.
 */
export function BookingPageLayout({ children }: BookingPageLayoutProps) {
  return (
    <PublicThemeProvider>
      <div className="booking-public-shell">
        <div className="booking-page booking-page--checkout-focus">
          <div className="booking-shell-bg">
            <main className="booking-main mx-auto max-w-[1400px] px-4 pb-16 pt-0 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PublicThemeProvider>
  );
}
