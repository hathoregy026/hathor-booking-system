"use client";

import type { ReactNode } from "react";
import { PublicThemeProvider } from "@/components/public/PublicThemeProvider";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

type BookingPageLayoutProps = {
  children: ReactNode;
};

/**
 * Booking shell with the same public chrome nav as every other page.
 * Does not alter the booking engine / store / Supabase flows.
 */
export function BookingPageLayout({ children }: BookingPageLayoutProps) {
  return (
    <PublicThemeProvider>
      <div className="public-site booking-public-shell">
        <PublicNavbar />
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
