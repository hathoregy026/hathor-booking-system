import Link from "next/link";

export default function BookingCruiseNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-20">
      <h1 className="booking-serif text-xl font-semibold sm:text-2xl">Cruise not found</h1>
      <p className="mt-3 text-sm" style={{ color: "var(--booking-muted)" }}>
        This sailing or room is no longer available. Try a new search.
      </p>
      <Link
        href="/book"
        className="booking-btn-primary mt-6 inline-flex px-6 py-3 text-sm font-semibold"
      >
        Back to search
      </Link>
    </div>
  );
}
