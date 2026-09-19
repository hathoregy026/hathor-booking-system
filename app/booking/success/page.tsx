import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBookingSuccessDetails } from "@/lib/booking-success-details";
import { bookingCode } from "@/lib/booking-code";
import { HATHOR_ITINERARIES } from "@/lib/booking-itineraries";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { JourneyProgress, StepBanner, StepGuide } from "@/components/booking/journey/JourneyChrome";
import { folioRange, money, plural, shortDate } from "@/components/booking/journey/model";
import { VoyageBarFrame } from "@/components/booking/journey/VoyageRail";
import { PaymentPlan } from "@/components/booking/journey/PaymentPlan";
import { IconCalendar, IconMail, IconPhone } from "@/components/booking/journey/icons";

type PageProps = {
  searchParams: Promise<{ bookingId?: string; token?: string }>;
};

const FALLBACK_SCENE = "/media/hathor/optimized/cruises-hero.webp";

function Shell({ children, scene, wide, banner, bar, guide }: { children: ReactNode; scene?: string; wide?: boolean; banner?: ReactNode; bar?: ReactNode; guide?: ReactNode }) {
  const style = { "--hj-scene": `url("${scene ?? FALLBACK_SCENE}")` } as CSSProperties;
  return (
    <div className="hj hj--step-4" style={style}>
      <div className="hj-folio" id="hj-folio-top">
        {banner}
        <JourneyProgress step={4} />
        {guide ? <div className="hj-guidebar">{guide}</div> : null}
        <div className={wide ? "hj-stage hj-stage--success" : "hj-stage hj-stage--wide"}>{children}</div>
        {bar}
      </div>
    </div>
  );
}

function NotFound({ title, message }: { title: string; message: string }) {
  return (
    <Shell>
      <section className="hj-panel" style={{ maxWidth: "640px", margin: "0 auto" }}>
        <p className="hj-panel__kicker">Reservation</p>
        <h1 style={{ fontSize: "1.9rem" }}>{title}</h1>
        <p className="hj-ledger__note">{message}</p>
        <div className="hj-actions">
          <Link href="/booking" className="hj-btn hj-btn--quiet">Start a new search</Link>
          <Link href="/contact" className="hj-btn">Contact Hathor</Link>
        </div>
      </section>
    </Shell>
  );
}

/** Request-sent result — never implied as confirmed unless the booking status is CONFIRMED. */
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
  const roomVisual = details.roomType ? getBookingRoomVisuals(details.roomType, details.roomType) : null;

  const guide = (
    <StepGuide
      heading="What happens from here"
      items={[
        { label: "Request sent", hint: "Nothing was charged", done: requested || confirmed },
        { label: "Hathor reviews it", hint: "We confirm cabins and total", done: confirmed || details.invoiceSent },
        { label: "Invoice and payment", hint: "By email, for your method", done: confirmed },
        { label: "Booking confirmed", hint: "Once payment is recorded", done: confirmed },
      ]}
    />
  );

  return (
    <Shell
      scene={voyage?.image}
      wide
      guide={guide}
      bar={
        voyage ? (
          <VoyageBarFrame
            image={voyage.image}
            title={voyage.title}
            route={details.route ?? voyage.route}
            dateMain={shortDate(details.checkInDate)}
            dateSub={`to ${shortDate(details.returnDate)}`}
            partyMain={details.guestSummary}
            partySub={details.roomType ? plural(details.roomType.split(", ").length, "Cabin") : "Cabins to confirm"}
            totalLabel={`Booking ${bookingCode(details.bookingId)}`}
            totalValue={money(details.totalPriceCents)}
            action={
              <Link href="/" className="hj-voyagebar__go">
                Return to Hathor <span aria-hidden>→</span>
              </Link>
            }
          />
        ) : null
      }
      banner={
        <StepBanner
          step={4}
          kicker={requested ? "Request sent" : details.statusLabel}
          title={requested ? "Request Sent" : confirmed ? "Reservation Confirmed" : "Your Reservation"}
          lede={requested ? "Thank you for choosing Hathor. We will be in touch with your invoice." : "The current status of your Nile voyage."}
          quote="Luxury. Heritage. Belonging."
        />
      }
    >
      <section className="hj-panel">
        <p className="hj-panel__kicker">Step 4 of 4</p>
        <div className="hj-sent">
          <span className="hj-sent__mark" aria-hidden>✓</span>
          <span>
            <strong>{requested ? "Request sent" : details.statusLabel}</strong>
            <span className="hj-ledger__note" style={{ marginTop: "0.2rem" }}>
              {requested
                ? "Your reservation request has been successfully submitted."
                : confirmed
                  ? "Hathor has accepted your reservation and recorded the required payment."
                  : "This is the current status of your reservation."}
            </span>
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)", lineHeight: 1.15 }}>
          {requested
            ? "Your Reservation Request Has Been Sent"
            : confirmed
              ? "Your reservation is confirmed."
              : "Your reservation."}
        </h1>
        <p className="hj-ledger__note">
          {requested
            ? "Thank you for choosing Hathor. Our reservations team will review your request and contact you with invoice and payment instructions. This is not a confirmed reservation, and no payment was collected on this website."
            : confirmed
              ? "Hathor has accepted your reservation and recorded the required payment."
              : "This is the current status of your reservation."}
        </p>

        <div className="hj-ref">
          <span className="hj-ref__label">Booking code · use it to track this booking</span>
          <span className="hj-ref__value">{bookingCode(details.bookingId)}</span>
        </div>

        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconMail /></span>
          <span>
            {details.emailStatus === "SENT"
              ? `A copy of this request was emailed to ${details.customerEmail}.`
              : details.emailStatus === "FAILED"
                ? "Your request is saved, but our confirmation email could not be delivered. Please contact us so we can reach you."
                : "Your request is saved. The confirmation email is on its way."}
          </span>
        </p>
        {method !== "—" ? (
          <p className="hj-contact-line">
            <span>
              Preferred payment method<br />
              <strong>{method}</strong>
            </span>
          </p>
        ) : null}

        <span className="hj-step-label">What happens next?</span>
        <ol className="hj-timeline">
          <li data-state={requested && !details.invoiceSent ? "now" : "done"}>
            <span className="hj-timeline__dot">1</span>
            <span><strong>Hathor Reservations reviews your request</strong><span>We verify the cabin and the final voyage total.</span></span>
          </li>
          <li data-state={confirmed ? "done" : details.invoiceSent ? "now" : "next"}>
            <span className="hj-timeline__dot">2</span>
            <span>
              <strong>{details.invoiceSent && !confirmed ? "Your invoice has been sent" : "You receive invoice and payment instructions"}</strong>
              <span>{details.invoiceSent && !confirmed ? `Check ${details.customerEmail ?? "your email"} for the amount due and how to pay.` : "Sent by email for your preferred method."}</span>
            </span>
          </li>
          <li data-state={confirmed ? "now" : "next"}>
            <span className="hj-timeline__dot">3</span>
            <span><strong>Reservation confirmed after payment is recorded</strong><span>Once Hathor accepts the request and the required payment is recorded.</span></span>
          </li>
        </ol>
      </section>

      <section className="hj-panel">
        <span className="hj-step-label">Your booking summary</span>
        {voyage ? (
          <div className="hj-summary-thumbs">
            <Image src={voyage.image} alt="" width={144} height={104} sizes="72px" />
            <span>
              <span className="hj-rail__label">Journey</span>
              <span className="hj-rail__value">{voyage.title} · {details.route ?? voyage.route}</span>
            </span>
          </div>
        ) : null}
        <div className="hj-summary-thumbs">
          <span className="hj-rail__icon" aria-hidden><IconCalendar /></span>
          <span>
            <span className="hj-rail__label">Dates</span>
            <span className="hj-rail__value">{folioRange(details.checkInDate, details.returnDate)}</span>
          </span>
        </div>
        <div className="hj-summary-thumbs">
          <span />
          <span>
            <span className="hj-rail__label">Guests</span>
            <span className="hj-rail__value">{details.guestSummary}</span>
          </span>
        </div>
        {details.roomType && roomVisual ? (
          <div className="hj-summary-thumbs">
            <Image src={roomVisual.cover} alt="" width={144} height={104} sizes="72px" />
            <span>
              <span className="hj-rail__label">Accommodation</span>
              <span className="hj-rail__value">{details.roomType}</span>
            </span>
          </div>
        ) : null}

        <div className="hj-total-block">
          <span className="hj-total-block__label">Total booking amount</span>
          <div className="hj-total-block__amount">{money(details.totalPriceCents)}</div>
          <p className="hj-deposit__fine">Taxes and service charges included.</p>
        </div>

        <span className="hj-step-label">Payment timeline</span>
        <PaymentPlan stages={details.paymentSchedule} paidCents={details.amountPaidCents} />
      </section>

      <section className="hj-panel">
        <span className="hj-step-label">We are here for you</span>
        <p className="hj-ledger__note" style={{ marginTop: 0 }}>
          Our concierge team is always happy to assist you with any questions.
        </p>
        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconPhone /></span>
          <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
        </p>
        <p className="hj-note">{PUBLIC_CONTACT.workingHours}. {PUBLIC_CONTACT.dayOff}.</p>
        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconMail /></span>
          <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
        </p>
        <p className="hj-ledger__note">Or reply directly to your confirmation email.</p>

        <div className="hj-actions" style={{ justifyContent: "flex-start" }}>
          <Link href="/" className="hj-btn">Return to Hathor <span aria-hidden>→</span></Link>
          <Link href="/booking/lookup" className="hj-btn hj-btn--quiet">View my request</Link>
        </div>
      </section>
    </Shell>
  );
}
