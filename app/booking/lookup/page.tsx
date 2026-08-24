"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingLookupPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to find reservation");
      router.push(`/booking/success?bookingId=${encodeURIComponent(result.bookingId)}&token=${encodeURIComponent(result.accessToken)}`);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Unable to find reservation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-16">
      <form onSubmit={submit} className="booking-card w-full space-y-5 p-6 sm:p-9">
        <div>
          <p className="text-xs uppercase tracking-[0.16em]">Hathor Dahabiya</p>
          <h1 className="booking-serif mt-2 text-3xl">Find your reservation</h1>
          <p className="mt-3 text-sm text-[var(--booking-muted)]">Enter the reference and email used when booking.</p>
        </div>
        <label className="block text-sm">Booking reference
          <input className="hathor-checkout-field mt-2 w-full border px-3 py-3" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required autoComplete="off" />
        </label>
        <label className="block text-sm">Email
          <input className="hathor-checkout-field mt-2 w-full border px-3 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button className="booking-btn-primary w-full px-6 py-3" disabled={loading}>{loading ? "Checking…" : "View Reservation"}</button>
        <Link href="/booking" className="block text-center text-sm underline">Start a new reservation</Link>
      </form>
    </main>
  );
}
