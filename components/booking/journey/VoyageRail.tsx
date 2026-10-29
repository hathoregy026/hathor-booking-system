"use client";

import { useRef, useState, type ReactNode } from "react";
import { ManagedSourceImage as Image } from "@/components/public/ManagedSourceImage";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingItinerary } from "@/lib/i18n/booking-itineraries-it";
import type { Sailing } from "./model";
import { CurrencyAmount, CurrencySettlementNote } from "@/components/public/CurrencyProvider";
import type { CabinView } from "./allocation";
import { IconBed, IconCalendar, IconChevron, IconGuests, IconPencil, IconTemple } from "./icons";
import type { JourneyStep } from "./JourneyChrome";
import { useStickyFit } from "./useStickyFit";
import { useBookingCopy } from "./useBookingCopy";

function Row({
  icon,
  label,
  children,
  onEdit,
  canEdit,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
  canEdit?: boolean;
}) {
  const t = useBookingCopy();
  return (
    <div className="hj-rail__row">
      <span className="hj-rail__icon" aria-hidden>{icon}</span>
      <span className="hj-rail__body">
        <span className="hj-rail__label">{label}</span>
        <span className="hj-rail__value">{children}</span>
      </span>
      {onEdit ? (
        <button type="button" className="hj-rail__edit" disabled={!canEdit} onClick={onEdit}>
          <IconPencil className="hj-rail__pencil" />
          <span className="hj-rail__edit-text">{t.edit}</span>
        </button>
      ) : null}
    </div>
  );
}

/**
 * The running summary. Rates come from the availability read; the total is
 * the sum of the chosen cabins' per-voyage rates, and the database recomputes
 * it when the request is sent.
 */
export function VoyageRail({
  duration,
  sailing,
  adults,
  childCount,
  cabins,
  totalCents,
  step,
  onJump,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  adults: number;
  childCount: number;
  cabins: CabinView[];
  totalCents: number | null;
  step: JourneyStep;
  onJump: (step: JourneyStep) => void;
}) {
  const t = useBookingCopy();
  const voyage = bookingItinerary(duration, t.locale);
  const railRef = useRef<HTMLElement | null>(null);
  useStickyFit(railRef);

  return (
    <aside className="hj-rail" aria-label={t.rail.summaryLabel} ref={railRef}>
      <div className="hj-rail__head">
        <h2 className="hj-rail__title">{t.rail.title}</h2>
        <span className="hj-rail__ankh" aria-hidden>☥</span>
      </div>
      <div className="hj-rail__rule" />
      <Image className="hj-rail__media" src={voyage.image} alt="" width={640} height={360} sizes="340px" />

      <Row icon={<IconTemple />} label={t.rail.journey} canEdit={step > 1} onEdit={() => onJump(1)}>
        {voyage.title} · {voyage.route}
      </Row>
      <Row icon={<IconCalendar />} label={t.rail.dates} canEdit={step > 1} onEdit={() => onJump(1)}>
        {sailing ? t.folioRange(sailing.departureTime, sailing.arrivalTime) : t.rail.selectDates}
      </Row>
      <Row icon={<IconGuests />} label={t.rail.guests} canEdit={step > 2} onEdit={() => onJump(2)}>
        {t.partyLine(adults, childCount)}
      </Row>
      <Row icon={<IconBed />} label={t.rail.accommodation} canEdit={step > 2} onEdit={() => onJump(2)}>
        {cabins.length === 0 ? (
          t.rail.notSelected
        ) : (
          <span className="hj-rail__cabins">
            {cabins.map(cabin => (
              <span key={cabin.id} className="hj-rail__cabin">
                <span>{cabin.label}</span>
                <span className="hj-rail__cabin-guests">
                  {cabin.guests.length === 0
                    ? t.rail.noGuests
                    : t.partyLine(
                        cabin.guests.filter(guest => guest.kind === "adult").length,
                        cabin.guests.filter(guest => guest.kind === "child").length,
                      )}
                </span>
              </span>
            ))}
          </span>
        )}
      </Row>

      <div className="hj-total-block">
        <CurrencySettlementNote cents={totalCents ?? undefined} />
        <span className="hj-total-block__label">{t.rail.total(cabins.length)}</span>
        {totalCents === null ? (
          <p className="hj-total-block__pending">{t.rail.pending}</p>
        ) : (
          <div className="hj-total-block__amount"><CurrencyAmount cents={totalCents} /></div>
        )}
        <p className="hj-deposit__fine">
          {totalCents === null ? t.rail.pendingFine : t.rail.fine(voyage.nights)}
        </p>
      </div>

      <p className="hj-rail__brand">Hathor</p>
      <span className="hj-rail__tagline">{t.rail.tagline}</span>
    </aside>
  );
}

/**
 * Desktop: the voyage along the bottom of every step. The toggle opens the
 * full summary (every row with its Edit); the button is the step's next action.
 * Request sent uses this frame directly with its own values and link.
 */
export function VoyageBarFrame({
  image,
  title,
  route,
  dateMain,
  dateSub,
  partyMain,
  partySub,
  totalLabel,
  totalValue,
  details,
  onEdit,
  action,
  nudge,
}: {
  image: string;
  title: string;
  route: string;
  dateMain: string;
  dateSub: string;
  partyMain: string;
  partySub: string;
  totalLabel: string;
  totalValue: ReactNode;
  /** The full voyage summary, opened from the bar. */
  details?: ReactNode;
  onEdit?: () => void;
  /** The step's next action (a button or a link). */
  action: ReactNode;
  /** A reminder of what is still missing, shown above the action. */
  nudge?: string | null;
}) {
  const t = useBookingCopy();
  const [open, setOpen] = useState(false);
  return (
    <section className={`hj-voyagebar${open ? " hj-voyagebar--open" : ""}${details ? "" : " hj-voyagebar--plain"}`} aria-label={t.rail.barLabel}>
      {open && details ? <div className="hj-voyagebar__panel" id="hj-voyagebar-panel">{details}</div> : null}
      {details ? (
        <button
          type="button"
          className="hj-voyagebar__toggle"
          aria-expanded={open}
          aria-controls="hj-voyagebar-panel"
          onClick={() => setOpen(current => !current)}
        >
          <span className="hj-voyagebar__title">{t.rail.title}</span>
          <IconChevron direction={open ? "down" : "up"} />
        </button>
      ) : (
        <span className="hj-voyagebar__toggle">
          <span className="hj-voyagebar__title">{t.rail.title}</span>
        </span>
      )}
      <Image className="hj-voyagebar__img" src={image} alt="" width={240} height={140} sizes="120px" />
      <span className="hj-voyagebar__cell">
        <span className="hj-voyagebar__main">{title}</span>
        <span className="hj-voyagebar__sub">{route}</span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled">
        <IconCalendar />
        <span>
          <span className="hj-voyagebar__main">{dateMain}</span>
          <span className="hj-voyagebar__sub">{dateSub}</span>
        </span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled">
        <IconGuests />
        <span>
          <span className="hj-voyagebar__main">{partyMain}</span>
          <span className="hj-voyagebar__sub">{partySub}</span>
        </span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled hj-voyagebar__total">
        <span className="hj-voyagebar__sub">{totalLabel}</span>
        <span className="hj-voyagebar__amount">{totalValue}</span>
      </span>
      {onEdit ? <button type="button" className="hj-voyagebar__edit" onClick={onEdit}>{t.edit}</button> : <span />}
      <span className="hj-voyagebar__act">
        {nudge ? <span className="hj-voyagebar__nudge" role="status">{nudge}</span> : null}
        {action}
      </span>
    </section>
  );
}

/**
 * The journey's bar: the summary of the voyage so far and the step's next
 * action. When something is still missing, the action says exactly what
 * instead of doing nothing.
 */
export function VoyageBar({
  duration,
  sailing,
  adults,
  childCount,
  cabins,
  totalCents,
  pendingTotal,
  onEdit,
  details,
  label,
  ariaLabel,
  blocker,
  busy,
  busyLabel,
  onContinue,
  onBlocked,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  adults: number;
  childCount: number;
  cabins: CabinView[];
  totalCents: number | null;
  /** What the total says before there is one ("From USD 3,000", "Place your guests"). */
  pendingTotal: string;
  onEdit?: () => void;
  details: ReactNode;
  label: string;
  ariaLabel: string;
  /** What is still missing for this step, or null when the action can go ahead. */
  blocker: string | null;
  busy: boolean;
  busyLabel: string;
  onContinue: () => void;
  /** Brings the missing part into view. */
  onBlocked?: () => void;
}) {
  const t = useBookingCopy();
  const voyage = bookingItinerary(duration, t.locale);
  const [nudge, setNudge] = useState<string | null>(null);
  const [nudgeFor, setNudgeFor] = useState(blocker);
  // A reminder goes as soon as the missing part is done (or another one takes its place).
  if (blocker !== nudgeFor) {
    setNudgeFor(blocker);
    setNudge(null);
  }
  return (
    <VoyageBarFrame
      image={voyage.image}
      title={voyage.title}
      route={voyage.route}
      dateMain={sailing ? t.shortDate(sailing.departureTime) : t.rail.chooseDate}
      dateSub={sailing ? t.rail.to(t.shortDate(sailing.arrivalTime)) : t.voyage.departsOn(voyage.departureDay)}
      partyMain={t.partyLine(adults, childCount)}
      partySub={cabins.length === 0 ? t.rail.noCabin : t.cabinsTitle(cabins.length)}
      totalLabel={t.rail.total(cabins.length)}
      totalValue={totalCents === null ? pendingTotal : <CurrencyAmount cents={totalCents} />}
      details={details}
      onEdit={onEdit}
      nudge={nudge}
      action={
        <button
          type="button"
          className={`hj-voyagebar__go${blocker ? " hj-voyagebar__go--waiting" : ""}`}
          aria-label={ariaLabel}
          aria-disabled={busy || undefined}
          onClick={() => {
            if (busy) return;
            if (blocker) {
              setNudge(blocker);
              onBlocked?.();
              return;
            }
            onContinue();
          }}
        >
          {busy ? busyLabel : label} <IconChevron direction="right" />
        </button>
      }
    />
  );
}
