"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingCopy } from "@/components/booking/journey/useBookingCopy";
import { formValidityIn } from "@/lib/i18n/form-validity";
import { localizedHref } from "@/lib/i18n/locale";

/** Shared by /booking/lookup and /it/booking/lookup: the language follows the address. */
export default function BookingLookupPage() {
  const copy = useBookingCopy();
  const t = copy.lookup;
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
      if (!response.ok) throw new Error(result.error ? copy.serverMessage(result.error) : t.notFound);
      router.push(localizedHref(`/booking/success?bookingId=${encodeURIComponent(result.bookingId)}&token=${encodeURIComponent(result.accessToken)}`, copy.locale));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : t.notFound);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-16">
      <form onSubmit={submit} className="booking-card w-full space-y-5 p-6 sm:p-9" {...formValidityIn(copy.locale)}>
        <div>
          <p className="text-xs uppercase tracking-[0.16em]">Hathor Dahabiya</p>
          <h1 className="booking-serif mt-2 text-3xl">{t.title}</h1>
          <p className="mt-3 text-sm text-[var(--booking-muted)]">{t.lede}</p>
        </div>
        <label className="block text-sm">{t.code}
          <input className="hathor-checkout-field mt-2 w-full border px-3 py-3 uppercase" value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="HB-XXXXXXXX" required autoComplete="off" spellCheck={false} />
        </label>
        <label className="block text-sm">{t.email}
          <input className="hathor-checkout-field mt-2 w-full border px-3 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button className="booking-btn-primary w-full px-6 py-3" disabled={loading}>{loading ? t.checking : t.track}</button>
        <Link href={localizedHref("/booking", copy.locale)} className="block text-center text-sm underline">{t.newReservation}</Link>
      </form>
    </main>
  );
}
