"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatCountdown, getRemainingSeconds } from "@/lib/client-dates";
import { useBookingStore } from "@/store/bookingStore";

type CountdownTimerProps = {
  onExpired: () => void;
};

export function CountdownTimer({ onExpired }: CountdownTimerProps) {
  const holdExpiresAt = useBookingStore((state) => state.holdExpiresAt);
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(holdExpiresAt),
  );

  useEffect(() => {
    if (!holdExpiresAt) return;

    setRemaining(getRemainingSeconds(holdExpiresAt));

    const interval = setInterval(() => {
      const next = getRemainingSeconds(holdExpiresAt);
      setRemaining(next);

      if (next <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, onExpired]);

  if (!holdExpiresAt) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium"
      style={{
        borderColor: "var(--booking-border)",
        background: "var(--booking-cream)",
        color: "var(--booking-navy)",
      }}
    >
      <Clock className="h-4 w-4" aria-hidden />
      <span>
        Your rooms are held for:{" "}
        <span className="font-semibold tabular-nums">
          {formatCountdown(remaining)}
        </span>
      </span>
    </div>
  );
}
