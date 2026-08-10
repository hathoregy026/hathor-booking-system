"use client";

import { useEffect, useState } from "react";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { FloatingActions } from "@/components/public/FloatingActions";

/**
 * Site-wide floating BOOK NOW / chat (root layout sibling — does not wrap pages).
 *
 * Client-only mount avoids root SSR bailout from BookingModal's `next/dynamic`
 * with `ssr: false`. Hidden on /booking, /book, and /admin via FloatingActions.
 */
export function GlobalFloatingActions() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <BookingModalProvider>
      <FloatingActions />
    </BookingModalProvider>
  );
}
