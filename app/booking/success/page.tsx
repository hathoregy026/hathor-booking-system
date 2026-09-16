import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBookingSuccessDetails } from "@/lib/booking-success-details";
import { HATHOR_ITINERARIES } from "@/lib/booking-itineraries";
import { JourneyProgress } from "@/components/booking/journey/JourneyChrome";
import { PaymentJourney } from "@/components/booking/journey/PaymentJourney";
import { longDate, money, stageLabel } from "@/components/booking/journey/model";

type PageProps = {
  searchParams: Promise<{ bookingId?: string; token?: string }>;
};

const FALLBACK_SCENE = "/media/hathor/optimized/cruises-hero.webp";

function Shell({ children, scene }: { children: ReactNode; scene?: string }) {
  const style = { "--hj-scene": `url("${scene ?? FALLBACK_SCENE}")` } as CSSProperties;
  return (
    <div className="hj" style={style}>
      <div className="hj-stage hj-stage--wide">{children}</div>
      <JourneyProgress step={5} />
    </div>
  );
}

function NotFound({ title, message }: { title: string; message: string }) {
  return (
    <Shell>
      <section className="hj-panel" style={{ maxWidth: "640px", margin: "0 auto" }}>
        <header className="hj-panel__head">
          <h1>{title}</h1>
          <p>{message}</p>
          <div className="hj-ornament" aria-hidden><span>◆</span></div>
        </header>
        <div className="hj-actions">
          <Link href="/booking" className="hj-btn">Start a new search</Link>
          <Link href="/contact" className="hj-btn hj-btn--quiet">Contact Hathor</Link>
        </div>
      </section>
    </Shell>
  );
}

/** Screen 04 result — the request is with Hathor Reservations, never "confirmed". */
export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const bookingId = query.bookingId?.trim();
  const token = query.token?.trim();

  if (!bookingId || !token) {
    return <NotFound title="Booking not found" message="We could not find a booking reference. Please check your link or start a new search." />;
  }

  let details = null;
  try {
    details = await getBookingSuccessDetails(bookingId, token);
  } catch {
    return <NotFound title="Unable to load your booking" message="We had trouble loading your details. Please try again in a moment, or contact our reservations team." />;
  }

  if (!details) {
    return <NotFound title="Booking not found" message="We could not find a booking with that reference. It may have expired, or the link may be incomplete." />;
  }

  const requested = details.status === "REQUESTED";
  const confirmed = details.status === "CONFIRMED";
  const voyage = HATHOR_ITINERARIES[details.durationSlug as keyof typeof HATHOR_ITINERARIES] ?? null;
  const method = details.paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : details.paymentMethod === "VISA" ? "Visa" : "—";
  const dueNow = details.paymentSchedule[0]?.cumulativeCents ?? null;
  const balance = Math.max(0, details.totalPriceCents - details.amountPaidCents);

  return (
    <Shell scene={voyage?.image}>
      <div className="hj-duo">
        <section className="hj-card">
          <span className="hj-card__eyebrow">{requested ? "Request received" : details.statusLabel}</span>
          <h1 className="hj-card__title" style={{ fontSize: "1.95rem" }}>
            {requested
              ? "Your booking request has been sent."
              : confirmed
                ? "Your reservation is confirmed."
                : "Your reservation."}
          </h1>
          <p className="hj-ledger__note" style={{ marginTop: 0 }}>
            {requested
              ? "Hathor Reservations has your request. Our team will review it and email you the invoice and payment instructions. This is not a confirmed reservation, and no payment was collected on this website."
              : confirmed
                ? "Hathor has accepted your reservation and recorded the required payment."
                : "This is the current status of your reservation."}
          </p>

          {requested && dueNow !== null ? (
            <div className="hj-deposit">
              <span className="hj-deposit__label">Nothing has been charged</span>
              <p className="hj-deposit__fine" style={{ marginTop: "0.2rem" }}>
                After our team accepts your request we will invoice {money(dueNow)} to confirm the booking, for your
                preferred method: {method}.
              </p>
            </div>
          ) : null}

          <span className="hj-step-label">Your payment journey</span>
          <PaymentJourney current={confirmed ? 5 : 3} />

          <div className="hj-actions">
            <Link href="/booking/lookup" className="hj-btn hj-btn--solid">View reservation</Link>
            <Link href="/contact" className="hj-btn">Contact reservations</Link>
          </div>
          <p className="hj-note">
            {details.emailStatus === "SENT"
              ? `A copy of this request was emailed to ${details.customerEmail}.`
              : details.emailStatus === "FAILED"
                ? "Your request is saved, but our confirmation email could not be delivered. Please contact us so we can reach you."
                : "Your request is saved. The confirmation email is on its way."}
          </p>
        </section>

        <section className="hj-card">
          <span className="hj-card__eyebrow">Your request</span>
          <h2 className="hj-card__title">{details.voyageName}</h2>
          {voyage ? (
            <Image
              src={voyage.image}
              alt=""
              width={640}
              height={360}
              sizes="(max-width: 1080px) 100vw, 330px"
              style={{ width: "100%", height: "auto", borderRadius: "4px", display: "block", marginBottom: "0.8rem" }}
            />
          ) : null}

          <div className="hj-ledger">
            <div className="hj-ledger__row"><span>Reference</span><span>{details.bookingId}</span></div>
            {details.route ? <div className="hj-ledger__row"><span>Route</span><span>{details.route}</span></div> : null}
            <div className="hj-ledger__row"><span>Check-in</span><span>{longDate(details.checkInDate)}</span></div>
            <div className="hj-ledger__row"><span>Check-out</span><span>{longDate(details.returnDate)}</span></div>
            {details.roomType ? <div className="hj-ledger__row"><span>Accommodation</span><span>{details.roomType}</span></div> : null}
            <div className="hj-ledger__row"><span>Guests</span><span>{details.guestSummary}</span></div>
            <div className="hj-ledger__row"><span>Preferred method</span><span>{method}</span></div>
          </div>

          <div className="hj-total-block">
            <span className="hj-total-block__label">Voyage total</span>
            <div className="hj-total-block__amount">{money(details.totalPriceCents)}</div>
            <p className="hj-deposit__fine">Taxes and service charges included.</p>
          </div>

          <span className="hj-step-label">Payment plan</span>
          <div className="hj-ledger">
            {details.paymentSchedule.map(stage => (
              <div className="hj-ledger__row" key={stage.milestone}>
                <span>{stageLabel(stage)}</span>
                <span>{money(stage.cumulativeCents)}</span>
              </div>
            ))}
            <div className="hj-ledger__row"><span>Recorded so far</span><span>{money(details.amountPaidCents)}</span></div>
            <div className="hj-ledger__row"><span>Remaining</span><span>{money(balance)}</span></div>
          </div>

          <div className="hj-deposit" style={{ background: "none", border: 0, padding: "0.6rem 0 0" }}>
            <span className="hj-deposit__label">Booking status</span>
            <span className="hj-rail__value">{requested ? "Awaiting Hathor review" : details.statusLabel}</span>
          </div>
        </section>
      </div>
    </Shell>
  );
}
