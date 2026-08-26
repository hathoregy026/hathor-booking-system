"use client";

import type { ReactNode } from "react";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { SiteFloatingActions } from "@/components/public/SiteFloatingActions";

/**
 * Single site-wide booking modal host.
 * Page Book Now triggers and the floating FAB share one provider — never nest another.
 */
export function SiteBookingChrome({ children }: { children: ReactNode }) {
  return (
    <BookingModalProvider>
      {children}
      <SiteFloatingActions />
    </BookingModalProvider>
  );
}
