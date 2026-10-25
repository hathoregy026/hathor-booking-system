"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalizedHref } from "@/hooks/usePublicLocale";

/** Book now opens the booking journey itself, on its first step, in the visitor's language. */
const BOOKING_HREF = "/booking";

type BookingModalContextValue = {
  openBooking: () => void;
  closeBooking: () => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

/** Old links ending in ?book=1 go to the booking journey too. */
function BookLinkRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const localHref = useLocalizedHref();

  useEffect(() => {
    if (searchParams.get("book") === "1") router.replace(localHref(BOOKING_HREF));
  }, [router, searchParams, localHref]);

  return null;
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const localHref = useLocalizedHref();
  const openBooking = useCallback(() => router.push(localHref(BOOKING_HREF)), [router, localHref]);
  const closeBooking = useCallback(() => {}, []);

  return (
    <BookingModalContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <Suspense fallback={null}>
        <BookLinkRedirect />
      </Suspense>
    </BookingModalContext.Provider>
  );
}

export function useBookNowModal(): BookingModalContextValue {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error("useBookNowModal must be used within BookingModalProvider");
  }
  return context;
}
