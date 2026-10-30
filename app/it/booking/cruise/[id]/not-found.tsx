import Link from "next/link";
import { BOOKING_COPY } from "@/lib/i18n/booking-copy";

export default function ItalianBookingCruiseNotFound() {
  const t = BOOKING_COPY.it.roomGone;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-20">
      <h1 className="booking-serif text-xl font-semibold sm:text-2xl">{t.title}</h1>
      <p className="mt-3 text-sm" style={{ color: "var(--booking-muted)" }}>
        {t.text}
      </p>
      <Link
        href="/it/booking"
        className="booking-btn-primary mt-6 inline-flex px-6 py-3 text-sm font-semibold"
      >
        {t.link}
      </Link>
    </div>
  );
}
