import type { ReactNode } from "react";
import Link from "next/link";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { getBookingSuccessDetails } from "@/lib/booking-success-details";

type PageProps = {
  searchParams: Promise<{
    bookingId?: string;
    token?: string;
  }>;
};

function BookingSuccessShell({
  eyebrow,
  title,
  titleEm,
  lede,
  error,
  children,
}: {
  eyebrow: string;
  title: string;
  titleEm?: string;
  lede: string;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`booking-success${error ? " booking-success--error" : ""}`}>
      <div className="booking-success__stage">
        <p className="booking-success__eyebrow">{eyebrow}</p>
        <h1 className="booking-success__title">
          {title}
          {titleEm ? (
            <>
              {" "}
              <em>{titleEm}</em>
            </>
          ) : null}
        </h1>
        <p className="booking-success__lede">{lede}</p>
        {children}
      </div>
    </section>
  );
}

function BookingSuccessError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <BookingSuccessShell
      error
      eyebrow="Reservation"
      title={title}
      lede={message}
    >
      <div className="booking-success__actions">
        <Link href="/book" className="public-btn-gold">
          Start a new search
        </Link>
      </div>
    </BookingSuccessShell>
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
    <BookingSuccessShell
      eyebrow="Confirmed"
      title="Reservation"
      titleEm="received"
      lede="Your cabin is reserved at the price below. No payment has been collected yet; the full balance remains pending."
    >
      <article className="booking-success__summary">
        <p className="booking-success__kicker">Booking summary</p>
        <dl className="booking-success__facts">
          <div className="booking-success__fact booking-success__fact--wide">
            <dt>Booking reference</dt>
            <dd className="booking-success__ref">{details.bookingId}</dd>
          </div>
          <div className="booking-success__fact booking-success__fact--wide">
            <dt>Cruise</dt>
            <dd className="booking-success__cruise">{details.cruiseTitle}</dd>
          </div>
          <div className="booking-success__fact">
            <dt>Rate</dt>
            <dd>{details.ratePlanLabel}</dd>
          </div>
          {details.durationMeta ? (
            <div className="booking-success__fact">
              <dt>Duration &amp; departure</dt>
              <dd>{details.durationMeta}</dd>
            </div>
          ) : null}
          <div className="booking-success__fact">
            <dt>Check-in date</dt>
            <dd>{formatUtcDate(details.checkInDate)}</dd>
          </div>
          {details.roomType ? (
            <div className="booking-success__fact">
              <dt>Room type</dt>
              <dd>{details.roomType}</dd>
            </div>
          ) : null}
          <div className="booking-success__fact">
            <dt>Guests</dt>
            <dd>{details.guestSummary}</dd>
          </div>
        </dl>
        <div className="booking-success__total">
          <div>
            <p className="booking-success__total-label">Total price</p>
            <p className="booking-success__price">
              {formatPrice(details.totalPriceCents)}
            </p>
          </div>
          <span className="booking-success__status">{details.statusLabel}</span>
        </div>
      </article>

      {details.customerEmail ? (
        <p className="booking-success__note">
          Your confirmation was sent to{" "}
          <strong>{details.customerEmail}</strong>.
        </p>
      ) : null}

      <div className="booking-success__actions">
        <Link href="/" className="public-btn-gold">
          Back to Home
        </Link>
      </div>
    </BookingSuccessShell>
  );
}
