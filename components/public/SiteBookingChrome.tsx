"use client";

import type { ReactNode } from "react";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { SiteFloatingActions } from "@/components/public/SiteFloatingActions";
import { SitePhoneDock } from "@/components/public/SitePhoneDock";
import { SelectionPanel } from "@/components/selection/FavoritesPanel";

/**
 * Single site-wide booking modal host.
 * Page Book Now triggers and the floating FAB share one provider — never nest another.
 * Phone Saved/Voyage/Language dock mounts here so every public route gets it.
 */
export function SiteBookingChrome({ children }: { children: ReactNode }) {
  return (
    <BookingModalProvider>
      {children}
      <SiteFloatingActions />
      {/* One host for the selection sheet — every route, public and standalone. */}
      <SelectionPanel />
      {/* Phone dock — root-level so it is not tied to PublicNavbar per page. */}
      <SitePhoneDock />
    </BookingModalProvider>
  );
}
