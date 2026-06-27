"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  Suspense,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookingModal } from "@/components/booking/BookingModal";

type BookingModalContextValue = {
  openBooking: () => void;
  closeBooking: () => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

function BookModalAutoOpen({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("book") !== "1") return;
    onOpen();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("book");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [onOpen, pathname, router, searchParams]);

  return null;
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => setOpen(true), []);
  const closeBooking = useCallback(() => setOpen(false), []);

  return (
    <BookingModalContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <Suspense fallback={null}>
        <BookModalAutoOpen onOpen={openBooking} />
      </Suspense>
      <BookingModal open={open} onClose={closeBooking} />
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
