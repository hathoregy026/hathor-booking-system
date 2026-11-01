import type { CSSProperties, ReactNode } from "react";
import { ManagedSourceImage as Image } from "@/components/public/ManagedSourceImage";
import Link from "next/link";
import { getBookingSuccessDetails } from "@/lib/booking-success-details";
import { bookingCode } from "@/lib/booking-code";
import { HATHOR_ITINERARIES } from "@/lib/booking-itineraries";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { BOOKING_COPY } from "@/lib/i18n/booking-copy";
import { bookingItinerary } from "@/lib/i18n/booking-itineraries";
import { localizedHref, type PublicLocale } from "@/lib/i18n/locale";
import { JourneyProgress, StepBanner, StepGuide } from "@/components/booking/journey/JourneyChrome";
import { CurrencyAmount } from "@/components/public/CurrencyProvider";
import { VoyageBarFrame } from "@/components/booking/journey/VoyageRail";
import { PaymentPlan } from "@/components/booking/journey/PaymentPlan";
import { IconCalendar, IconMail, IconPhone } from "@/components/booking/journey/icons";

export type BookingSuccessSearchParams = Promise<{ bookingId?: string; token?: string }>;

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

function NotFound({ title, message, locale }: { title: string; message: string; locale: PublicLocale }) {
  const t = BOOKING_COPY[locale].result;
  return (
    <Shell>
      <section className="hj-panel" style={{ maxWidth: "640px", margin: "0 auto" }}>
        <p className="hj-panel__kicker">{t.reservation}</p>
        <h1 style={{ fontSize: "1.9rem" }}>{title}</h1>
        <p className="hj-ledger__note">{message}</p>
        <div className="hj-actions">
          <Link href={localizedHref("/booking", locale)} className="hj-btn hj-btn--quiet">{t.newSearch}</Link>
          <Link href={localizedHref("/contact", locale)} className="hj-btn">{t.contact}</Link>
        </div>
      </section>
    </Shell>
  );
}

/**
 * Request-sent result, shared by /booking/success and /it/booking/success —
 * never implied as confirmed unless the booking status is CONFIRMED.
 */
export async function BookingSuccess({ searchParams, locale }: { searchParams: BookingSuccessSearchParams; locale: PublicLocale }) {
  const copy = BOOKING_COPY[locale];
  const t = copy.result;
  const query = await searchParams;
  const bookingId = query.bookingId?.trim();
  const token = query.token?.trim();

  if (!bookingId || !token) {
    return <NotFound locale={locale} title={t.notFound} message={t.noReference} />;
  }

  let details = null;
  try {
    details = await getBookingSuccessDetails(bookingId, token);
  } catch {
    return <NotFound locale={locale} title={t.loadFailed} message={t.loadFailedText} />;
  }

  if (!details) {
    return <NotFound locale={locale} title={t.notFound} message={t.noBooking} />;
  }

  const requested = details.status === "REQUESTED";
  const confirmed = details.status === "CONFIRMED";
  const voyage = details.durationSlug in HATHOR_ITINERARIES
    ? bookingItinerary(details.durationSlug as keyof typeof HATHOR_ITINERARIES, locale)
    : null;
  const method = t.method(details.paymentMethod);
  const statusLabel = t.status[details.status] ?? details.statusLabel;
  const route = details.route === null ? null : t.route(details.route);
  const guestSummary = t.guestSummary(details.adultCount, details.childCount, details.guestSummary);
  const roomVisual = details.roomType ? getBookingRoomVisuals(details.roomType, details.roomType) : null;

  const guide = (
    <StepGuide
      heading={t.guideHeading}
      items={[
        { ...t.guide[0], done: requested || confirmed },
        { ...t.guide[1], done: confirmed || details.invoiceSent },
        { ...t.guide[2], done: confirmed },
        { ...t.guide[3], done: confirmed },
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
            route={route ?? voyage.route}
            dateMain={copy.shortDate(details.checkInDate)}
            dateSub={copy.rail.to(copy.shortDate(details.returnDate))}
            partyMain={guestSummary}
            partySub={details.roomType ? copy.cabinsTitle(details.roomType.split(", ").length) : t.cabinsToConfirm}
            totalLabel={t.booking(bookingCode(details.bookingId))}
            totalValue={<CurrencyAmount cents={details.totalPriceCents} />}
            action={
              <Link href={localizedHref("/", locale)} className="hj-voyagebar__go">
                {t.returnHome} <span aria-hidden>→</span>
              </Link>
            }
          />
        ) : null
      }
      banner={
        <StepBanner
          step={4}
          kicker={requested ? t.requestSent : statusLabel}
          title={requested ? t.titleSent : confirmed ? t.titleConfirmed : t.titleOther}
          lede={requested ? t.ledeSent : t.ledeOther}
          quote={t.quote}
        />
      }
    >
      <section className="hj-panel">
        <p className="hj-panel__kicker">{copy.stepOf(4, 4)}</p>
        <div className="hj-sent">
          <span className="hj-sent__mark" aria-hidden>✓</span>
          <span>
            <strong>{requested ? t.requestSent : statusLabel}</strong>
            <span className="hj-ledger__note" style={{ marginTop: "0.2rem" }}>
              {requested ? t.submitted : confirmed ? t.confirmedText : t.currentStatus}
            </span>
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)", lineHeight: 1.15 }}>
          {requested ? t.headingSent : confirmed ? t.headingConfirmed : t.headingOther}
        </h1>
        <p className="hj-ledger__note">
          {requested ? t.sentNote : confirmed ? t.confirmedText : t.currentStatus}
        </p>

        <div className="hj-ref">
          <span className="hj-ref__label">{t.code}</span>
          <span className="hj-ref__value">{bookingCode(details.bookingId)}</span>
        </div>

        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconMail /></span>
          <span>
            {details.emailStatus === "SENT"
              ? t.emailed(details.customerEmail)
              : details.emailStatus === "FAILED"
                ? t.emailFailed
                : t.emailPending}
          </span>
        </p>
        {method !== "—" ? (
          <p className="hj-contact-line">
            <span>
              {t.preferredMethod}<br />
              <strong>{method}</strong>
            </span>
          </p>
        ) : null}

        <span className="hj-step-label">{t.next}</span>
        <ol className="hj-timeline">
          <li data-state={requested && !details.invoiceSent ? "now" : "done"}>
            <span className="hj-timeline__dot">1</span>
            <span><strong>{t.reviewTitle}</strong><span>{t.reviewText}</span></span>
          </li>
          <li data-state={confirmed ? "done" : details.invoiceSent ? "now" : "next"}>
            <span className="hj-timeline__dot">2</span>
            <span>
              <strong>{details.invoiceSent && !confirmed ? t.invoiceSent : t.invoiceComing}</strong>
              <span>{details.invoiceSent && !confirmed ? t.invoiceCheck(details.customerEmail) : t.invoiceBy}</span>
            </span>
          </li>
          <li data-state={confirmed ? "now" : "next"}>
            <span className="hj-timeline__dot">3</span>
            <span><strong>{t.confirmedTitle}</strong><span>{t.confirmedTextNext}</span></span>
          </li>
        </ol>
      </section>

      <section className="hj-panel">
        <span className="hj-step-label">{t.summary}</span>
        {voyage ? (
          <div className="hj-summary-thumbs">
            <Image src={voyage.image} alt="" width={144} height={104} sizes="72px" />
            <span>
              <span className="hj-rail__label">{copy.rail.journey}</span>
              <span className="hj-rail__value">{voyage.title} · {route ?? voyage.route}</span>
            </span>
          </div>
        ) : null}
        <div className="hj-summary-thumbs">
          <span className="hj-rail__icon" aria-hidden><IconCalendar /></span>
          <span>
            <span className="hj-rail__label">{copy.rail.dates}</span>
            <span className="hj-rail__value">{copy.folioRange(details.checkInDate, details.returnDate)}</span>
          </span>
        </div>
        <div className="hj-summary-thumbs">
          <span />
          <span>
            <span className="hj-rail__label">{copy.rail.guests}</span>
            <span className="hj-rail__value">{guestSummary}</span>
          </span>
        </div>
        {details.roomType && roomVisual ? (
          <div className="hj-summary-thumbs">
            <Image src={roomVisual.cover} alt="" width={144} height={104} sizes="72px" />
            <span>
              <span className="hj-rail__label">{copy.rail.accommodation}</span>
              <span className="hj-rail__value">{details.roomType}</span>
            </span>
          </div>
        ) : null}

        <div className="hj-total-block">
          <span className="hj-total-block__label">{t.total}</span>
          <div className="hj-total-block__amount"><CurrencyAmount cents={details.totalPriceCents} /></div>
          <p className="hj-deposit__fine">
            {details.cardSurchargeCents > 0 ? t.surchargeTaxes(copy.money(details.cardSurchargeCents)) : t.taxes}
          </p>
        </div>

        <span className="hj-step-label">{t.timeline}</span>
        <PaymentPlan stages={details.paymentSchedule} paidCents={details.amountPaidCents} locale={locale} />
      </section>

      <section className="hj-panel">
        <span className="hj-step-label">{t.here}</span>
        <p className="hj-ledger__note" style={{ marginTop: 0 }}>
          {t.concierge}
        </p>
        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconPhone /></span>
          <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
        </p>
        <p className="hj-note">{t.hours || `${PUBLIC_CONTACT.workingHours}. ${PUBLIC_CONTACT.dayOff}.`}</p>
        <p className="hj-contact-line">
          <span className="hj-assist__icon" aria-hidden><IconMail /></span>
          <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
        </p>
        <p className="hj-ledger__note">{t.reply}</p>

        <div className="hj-actions" style={{ justifyContent: "flex-start" }}>
          <Link href={localizedHref("/", locale)} className="hj-btn">{t.returnHome} <span aria-hidden>→</span></Link>
          <Link href={localizedHref("/booking/lookup", locale)} className="hj-btn hj-btn--quiet">{t.viewRequest}</Link>
        </div>
      </section>
    </Shell>
  );
}
