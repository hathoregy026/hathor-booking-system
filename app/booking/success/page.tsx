import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { getBookingSuccessDetails } from "@/lib/booking-success-details";

type PageProps = {
  searchParams: Promise<{
    bookingId?: string;
    token?: string;
  }>;
};

function BookingSuccessError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-20 sm:px-6">
      <div className="booking-card w-full p-4 text-center sm:p-8">
        <h1 className="booking-serif text-xl font-semibold sm:text-2xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--booking-muted)" }}>
          {message}
        </p>
        <Link
          href="/book"
          className="booking-btn-primary mt-8 inline-flex px-8 py-3 text-sm"
        >
          Start a new search
        </Link>
      </div>
    </div>
  );
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const bookingId = query.bookingId?.trim();
  const token = query.token?.trim();

  if (!bookingId || !token) {
    return (
      <BookingSuccessError
        title="Booking not found"
        message="We could not find a booking reference. Please check your link or start a new search."
      />
    );
  }

  let details = null;

  try {
    details = await getBookingSuccessDetails(bookingId, token);
  } catch {
    return (
      <BookingSuccessError
        title="Unable to load booking"
        message="We had trouble loading your booking details. Please try again in a moment or contact our team for assistance."
      />
    );
  }

  if (!details) {
    return (
      <BookingSuccessError
        title="Booking not found"
        message="We could not find a booking with that reference. It may have expired or the link may be incorrect."
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-12 sm:px-6 sm:py-20">
      <div className="w-full space-y-6 text-center sm:space-y-8">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20"
          style={{ background: "var(--booking-gold-light)" }}
        >
          <CheckCircle2
            className="h-9 w-9 sm:h-11 sm:w-11"
            style={{ color: "var(--booking-gold-dark)" }}
            aria-hidden
          />
        </div>

        <div className="space-y-3">
          <h1 className="booking-serif text-2xl font-semibold sm:text-4xl">
            Reservation Confirmed
          </h1>
          <p
            className="mx-auto max-w-xl text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--booking-muted)" }}
          >
            Your cabin is reserved at the price below. No payment has been
            collected yet; the full balance remains pending.
          </p>
        </div>

        <div className="booking-card mx-auto max-w-lg space-y-5 p-4 text-left sm:p-8">
          <p
            className="text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--booking-muted)" }}
          >
            Booking summary
          </p>

          <dl className="space-y-4 text-sm">
            <div>
              <dt style={{ color: "var(--booking-muted)" }}>Booking reference</dt>
              <dd className="mt-0.5 font-mono text-xs font-medium sm:text-sm">
                {details.bookingId}
              </dd>
            </div>

            <div
              className="border-t pt-4"
              style={{ borderColor: "var(--booking-border)" }}
            >
              <dt style={{ color: "var(--booking-muted)" }}>Cruise</dt>
              <dd className="booking-serif mt-1 text-base font-semibold leading-snug">
                {details.cruiseTitle}
              </dd>
            </div>

            <div>
              <dt style={{ color: "var(--booking-muted)" }}>Rate</dt>
              <dd className="mt-0.5 font-medium">{details.ratePlanLabel}</dd>
            </div>

            {details.durationMeta && (
              <div>
                <dt style={{ color: "var(--booking-muted)" }}>
                  Duration &amp; departure
                </dt>
                <dd className="mt-0.5 font-medium">{details.durationMeta}</dd>
              </div>
            )}

            <div>
              <dt style={{ color: "var(--booking-muted)" }}>Check-in date</dt>
              <dd className="mt-0.5 font-medium">
                {formatUtcDate(details.checkInDate)}
              </dd>
            </div>

            {details.roomType && (
              <div>
                <dt style={{ color: "var(--booking-muted)" }}>Room type</dt>
                <dd className="mt-0.5 font-medium">{details.roomType}</dd>
              </div>
            )}

            <div>
              <dt style={{ color: "var(--booking-muted)" }}>Guests</dt>
              <dd className="mt-0.5 font-medium">{details.guestSummary}</dd>
            </div>

            <div
              className="flex items-center justify-between border-t pt-4"
              style={{ borderColor: "var(--booking-border)" }}
            >
              <dt className="font-medium" style={{ color: "var(--booking-muted)" }}>
                Total price
              </dt>
              <dd className="booking-serif text-xl font-semibold">
                {formatPrice(details.totalPriceCents)}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt style={{ color: "var(--booking-muted)" }}>Status</dt>
              <dd>
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--booking-gold-light)",
                    color: "var(--booking-gold-dark)",
                  }}
                >
                  {details.statusLabel}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {details.customerEmail && (
          <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
            Your confirmation was sent to{" "}
            <span className="font-medium">{details.customerEmail}</span>.
          </p>
        )}

        <Link
          href="/"
          className="booking-btn-primary inline-flex w-full max-w-xs px-8 py-3.5 text-sm font-semibold sm:w-auto"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
