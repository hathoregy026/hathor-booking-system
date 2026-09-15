"use client";
import Link from "next/link";
/** Retired single-room checkout; the shared reservation flow owns requests. */
export function BookingConfirmationColumns({ onBack }: { onBack: () => void }) {
  return <div><p>Continue through the reservation request form.</p><Link href="/booking">Continue reservation</Link><button onClick={onBack}>Back</button></div>;
}
