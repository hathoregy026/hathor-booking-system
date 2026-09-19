"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { itineraryFor } from "@/lib/booking-itineraries";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { MAX_ADULTS, MAX_CHILDREN, type CabinView } from "./allocation";
import { folioRange, money, plural, shortDate, type Sailing } from "./model";
import { IconCalendar, IconCard, IconCheck, IconChevron, IconClose, IconGuests } from "./icons";
import type { JourneyStep } from "./JourneyChrome";
import { SailingCalendar } from "./SailingCalendar";
import { Counter } from "./SuitesParts";

/*
 * Phone and tablet only (up to 1080px). Everything here is hidden on the
 * desktop journey by booking-journey-mobile.css; the booking state and its
 * rules stay in BookingJourneyFlow — these pieces only show it and call back.
 */

/** Same width as the journey's CSS: the desktop layout starts at 1081px. */
const COMPACT = "(max-width: 1080px)";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Brings a part of the step into view, gently unless the guest prefers no motion. */
export function reveal(target: Element | string | null, block: ScrollLogicalPosition = "start") {
  const node = typeof target === "string" ? document.querySelector(target) : target;
  node?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block });
}

const scrollToId = (id: string) => reveal(document.getElementById(id));

export const partyLine = (adults: number, children: number) =>
  [plural(adults, "Adult"), children > 0 ? plural(children, "Child", "Children") : null].filter(Boolean).join(" · ");

/* ---------- icons this layer adds (same 24px line style as icons.tsx) ---------- */

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg className="hj-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
      {children}
    </svg>
  );
}

export const IconList = () => (
  <Glyph>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="0.9" />
    <circle cx="4.5" cy="12" r="0.9" />
    <circle cx="4.5" cy="18" r="0.9" />
  </Glyph>
);

export const IconReceipt = () => (
  <Glyph>
    <path d="M6 3.5h12v17l-2.4-1.5-2.4 1.5-2.4-1.5-2.4 1.5L6 19V3.5Z" />
    <path d="M9 8h6M9 11.5h6M9 15h3.5" />
  </Glyph>
);

export const IconLead = () => (
  <Glyph>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </Glyph>
);

export const IconMap = () => (
  <Glyph>
    <path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.2" />
  </Glyph>
);

/* ---------- where the phone dock and this bar sit ---------- */

/**
 * The site's phone dock is fixed to the bottom of the screen up to 1024px.
 * Its real height (it grows with its labels and the safe area) is published
 * on the journey root as --hj-dock so the sticky bar and tray sit just above
 * it, never under it. (Not on <html>: the site rewrites that element's style.)
 */
function useDockOffset(anchor: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>(".hj");
    if (!root) return;
    let frame = 0;
    const read = () => {
      const dock = document.querySelector<HTMLElement>(".hathor-phone-dock");
      const shown = dock && window.getComputedStyle(dock).display !== "none";
      const top = shown ? dock.getBoundingClientRect().top : window.innerHeight;
      root.style.setProperty("--hj-dock", `${Math.max(0, Math.round(window.innerHeight - top))}px`);
      // The fixed site header differs by width; the sticky map sits under it.
      const header = document.querySelector<HTMLElement>(".hathor-header");
      const bottom = header ? Math.round(header.getBoundingClientRect().bottom) : 0;
      if (bottom > 0) root.style.setProperty("--hj-head", `${bottom}px`);
    };
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(read);
    };
    read();
    const late = window.setTimeout(read, 600);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    for (const node of document.querySelectorAll<HTMLElement>(".hathor-phone-dock, .hathor-header")) observer?.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(late);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [anchor]);
}

/**
 * When something the guest must read appears (an alert, a missing field), the
 * phone brings it into view: on a small screen it would otherwise sit far
 * above the sticky bar the guest just pressed.
 */
export function useRevealOnPhone(selector: string, trigger: unknown) {
  useEffect(() => {
    if (!trigger || !window.matchMedia(COMPACT).matches) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selector, trigger]);
}

/* ---------- top of each step ---------- */

const BACK_TO: Record<number, string> = { 2: "Journey", 3: "Guests & suites" };

/** A plain way back to the previous step, above the progress line. */
export function MobileBack({ step, onJump }: { step: JourneyStep; onJump: (step: JourneyStep) => void }) {
  if (step === 1) return null;
  return (
    <div className="hj-mback">
      <button type="button" className="hj-mback__btn" onClick={() => onJump((step - 1) as JourneyStep)}>
        <IconChevron direction="left" />
        <span>{BACK_TO[step]}</span>
      </button>
      <span className="hj-mback__of">Step {step} of 4</span>
    </div>
  );
}

export type SectionTab = {
  id: string;
  label: string;
  status?: string;
  done?: boolean;
  icon: ReactNode;
};

/**
 * The step's map on phone and tablet: the same points as the desktop map,
 * as one row of tabs. A finished point carries a tick, the next one to do is
 * marked, a tap scrolls to its part of the page, and the tab of the part on
 * screen is outlined. The page scrolls naturally; nothing here scrolls on its own.
 */
export function SectionTabs({ items, label = "Your map for this step" }: { items: SectionTab[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const ids = items.map(item => item.id).join("|");
  const now = items.findIndex(item => !item.done);

  useEffect(() => {
    const list = ids.split("|");
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const line = window.innerHeight * 0.38;
        let current = list[0];
        for (const id of list) {
          const node = document.getElementById(id);
          if (node && node.getBoundingClientRect().top <= line) current = id;
        }
        const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        setActive(atEnd ? list[list.length - 1] : current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  return (
    <nav className="hj-mtabs" aria-label={label} style={{ "--hj-mtabs-n": items.length } as CSSProperties}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`hj-mtab${active === item.id ? " hj-mtab--on" : ""}${item.done ? " hj-mtab--done" : ""}${index === now ? " hj-mtab--now" : ""}`}
          aria-current={active === item.id ? "true" : undefined}
          onClick={() => {
            setActive(item.id);
            scrollToId(item.id);
          }}
        >
          <span className="hj-mtab__icon" aria-hidden>
            {item.icon}
            {item.done ? <span className="hj-mtab__tick"><IconCheck /></span> : null}
          </span>
          <span className="hj-mtab__label">{item.label}</span>
          {item.status ? <span className="hj-mtab__status">{item.status}</span> : null}
          {item.done ? <span className="hj-sr">(done)</span> : index === now ? <span className="hj-sr">(next to do)</span> : null}
        </button>
      ))}
    </nav>
  );
}

/* ---------- the bar along the bottom ---------- */

/**
 * The step's summary and its one next action, kept above the phone dock
 * while the page scrolls. A short note above it says what still stops the
 * guest from going on.
 */
export function ActionBar({
  label,
  amount,
  sub,
  note,
  action,
  onAction,
  disabled,
  busy,
  busyLabel,
  ariaLabel,
}: {
  label?: string;
  amount: string;
  sub?: string;
  note?: string | null;
  action: string;
  onAction: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  ariaLabel?: string;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  useDockOffset(barRef);
  return (
    <div className="hj-mbar" role="region" aria-label="Your voyage and next step" ref={barRef}>
      {note ? <p className="hj-mbar__note" role="status">{note}</p> : null}
      <div className="hj-mbar__row">
        <span className="hj-mbar__sum">
          {label ? <span className="hj-mbar__label">{label}</span> : null}
          <span className="hj-mbar__amount">{amount}</span>
          {sub ? <span className="hj-mbar__sub">{sub}</span> : null}
        </span>
        <button type="button" className="hj-mbar__go" disabled={disabled || busy} aria-label={ariaLabel} onClick={onAction}>
          <span>{busy ? busyLabel ?? "One moment…" : action}</span>
          {busy ? null : <IconChevron direction="right" />}
        </button>
      </div>
    </div>
  );
}

/* ---------- bottom sheet ---------- */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A sheet that rises from the bottom for one focused choice (a date, the
 * party). It is portalled to the page body so it covers the header and the
 * dock, carries the journey's fonts with it, locks the page behind it, keeps
 * focus inside, and closes on Escape, the scrim, the close button or a swipe
 * down on its handle.
 */
export function Sheet({
  open,
  onClose,
  title,
  lede,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lede?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [drag, setDrag] = useState<{ start: number; dy: number } | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    // The journey's type faces are next/font variables set above the page;
    // the portal sits outside them, so it takes the resolved families along.
    const journey = document.querySelector<HTMLElement>(".hj");
    if (journey && rootRef.current) {
      const style = window.getComputedStyle(journey);
      for (const name of ["--hj-display", "--hj-body"]) {
        rootRef.current.style.setProperty(name, style.getPropertyValue(name));
      }
    }
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockBodyScroll("journey-sheet");
    const focus = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(node => node.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener("keydown", onKey, true);
      unlockBodyScroll("journey-sheet");
      if (returnTo && document.contains(returnTo)) returnTo.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const offset = drag ? Math.max(0, drag.dy) : 0;

  return createPortal(
    <div className="hj-sheet" ref={rootRef}>
      <div className="hj-sheet__scrim" aria-hidden onClick={onClose} />
      <div
        ref={panelRef}
        className={`hj-sheet__panel${drag ? " hj-sheet__panel--drag" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}
      >
        <div
          className="hj-sheet__handle"
          aria-hidden
          onPointerDown={event => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDrag({ start: event.clientY, dy: 0 });
          }}
          onPointerMove={event => {
            if (drag) setDrag({ start: drag.start, dy: event.clientY - drag.start });
          }}
          onPointerUp={() => {
            if (drag && drag.dy > 90) onClose();
            setDrag(null);
          }}
          onPointerCancel={() => setDrag(null)}
        >
          <span className="hj-sheet__grab" />
        </div>
        <header className="hj-sheet__head">
          <span>
            <h2 className="hj-sheet__title" id={titleId}>{title}</h2>
            {lede ? <span className="hj-sheet__lede">{lede}</span> : null}
          </span>
          <button ref={closeRef} type="button" className="hj-sheet__close" aria-label="Close" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="hj-sheet__body">{children}</div>
        {footer ? <div className="hj-sheet__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- step 1: the date and party tiles ---------- */

/** The two choices that follow the voyage, each opening its own sheet. */
export function PlanTiles({
  sailing,
  loading,
  adults,
  childCount,
  onDates,
  onGuests,
}: {
  sailing: Sailing | null;
  loading: boolean;
  adults: number;
  childCount: number;
  onDates: () => void;
  onGuests: () => void;
}) {
  return (
    <div className="hj-mtiles">
      <button type="button" className={`hj-mtile${sailing ? "" : " hj-mtile--todo"}`} onClick={onDates}>
        <span className="hj-mtile__icon" aria-hidden><IconCalendar /></span>
        <span className="hj-mtile__text">
          <span className="hj-mtile__label">Departure</span>
          <span className="hj-mtile__value">
            {sailing ? shortDate(sailing.departureTime) : loading ? "Loading dates…" : "Choose a date"}
          </span>
        </span>
        <IconChevron direction="right" />
      </button>
      <button type="button" className="hj-mtile" onClick={onGuests}>
        <span className="hj-mtile__icon" aria-hidden><IconGuests /></span>
        <span className="hj-mtile__text">
          <span className="hj-mtile__label">Guests</span>
          <span className="hj-mtile__value">{partyLine(adults, childCount)}</span>
        </span>
        <IconChevron direction="right" />
      </button>
    </div>
  );
}

/**
 * Keeps a sheet's choice as a draft until the guest applies it, so closing
 * the sheet leaves the booking exactly as it was.
 */
function useDraft<T>(value: T, open: boolean): [T, (next: T) => void] {
  const [draft, setDraft] = useState(value);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }
  return [draft, setDraft];
}

/**
 * The departure calendar in a sheet. The date is a draft until "Apply date",
 * which hands it to the journey exactly as a tap on the calendar would.
 */
export function DateSheet({
  open,
  onClose,
  sailings,
  loading,
  departureDay,
  voyageTitle,
  selectedId,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  sailings: Sailing[];
  loading: boolean;
  departureDay: string;
  voyageTitle: string;
  selectedId: string;
  onApply: (scheduleId: string) => void;
}) {
  const [draft, setDraft] = useDraft(selectedId, open);
  const chosen = sailings.find(entry => entry.scheduleId === draft) ?? null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Select departure date"
      lede={voyageTitle}
      footer={
        <>
          <p className="hj-sheet__pick" aria-live="polite">
            {chosen ? folioRange(chosen.departureTime, chosen.arrivalTime) : "Tap one of the dates marked in gold."}
          </p>
          <button
            type="button"
            className="hj-mbtn"
            disabled={!draft && !selectedId}
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            {draft || !selectedId ? "Apply date" : "Clear date"}
          </button>
          {draft ? (
            <button type="button" className="hj-mlink" onClick={() => setDraft("")}>
              Clear selection
            </button>
          ) : null}
        </>
      }
    >
      <div className="hj-datesheet">
        <SailingCalendar
          sailings={sailings}
          loading={loading}
          departureDay={departureDay}
          selectedId={draft}
          onSelect={setDraft}
          openOnSelected
        />
      </div>
    </Sheet>
  );
}

/** Who is travelling, from the journey step: the same counts the next step uses. */
export function GuestsSheet({
  open,
  onClose,
  adults,
  childCount,
  onCounts,
}: {
  open: boolean;
  onClose: () => void;
  adults: number;
  childCount: number;
  onCounts: (adults: number, children: number) => void;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Who is travelling"
      lede="You place everyone in a cabin on the next step."
      footer={
        <button type="button" className="hj-mbtn" onClick={onClose}>
          Done · {partyLine(adults, childCount)}
        </button>
      }
    >
      <div className="hj-counters hj-guestsheet">
        <Counter label="Adults" hint="12 years and over" value={adults} min={1} max={MAX_ADULTS} onChange={next => onCounts(next, childCount)} />
        <Counter label="Children" hint="Aged 2 – 11 years" value={childCount} min={0} max={MAX_CHILDREN} onChange={next => onCounts(adults, next)} />
      </div>
    </Sheet>
  );
}

/* ---------- the review cards ---------- */

type EditAction = { label?: string; onEdit: () => void } | null;

function ReviewCard({
  icon,
  media,
  label,
  edit,
  wide,
  children,
}: {
  icon?: ReactNode;
  media?: ReactNode;
  label: string;
  edit?: EditAction;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`hj-mcard${wide ? " hj-mcard--wide" : ""}`}>
      <span className="hj-mcard__top">
        {/* A photograph or an icon, in one frame size, so every label lines up. */}
        <span className={`hj-mcard__badge${media ? " hj-mcard__badge--photo" : ""}`} aria-hidden>{media ?? icon}</span>
        <span className="hj-mcard__label">{label}</span>
        {edit ? (
          <button type="button" className="hj-mcard__edit" aria-label={edit.label ?? `Edit ${label.toLowerCase()}`} onClick={edit.onEdit}>
            Edit
          </button>
        ) : null}
      </span>
      <span className="hj-mcard__body">{children}</span>
    </div>
  );
}

/**
 * The voyage so far as a set of cards, each with its own Edit that returns to
 * the step where it was chosen. Carries the same facts as the desktop rail.
 */
export function ReviewCards({
  id,
  title,
  lede,
  duration,
  sailing,
  adults,
  childCount,
  cabins,
  totalCents,
  step,
  onJump,
  payment,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  duration: StayDurationValue;
  sailing: Sailing | null;
  adults: number;
  childCount: number;
  cabins: CabinView[];
  totalCents: number | null;
  step: JourneyStep;
  onJump: (step: JourneyStep) => void;
  payment?: { label: string; sub: string; onEdit: () => void } | null;
  children?: ReactNode;
}) {
  const voyage = itineraryFor(duration);
  const toJourney: EditAction = step > 1 ? { onEdit: () => onJump(1) } : null;
  const toSuites: EditAction = step > 2 ? { onEdit: () => onJump(2) } : null;
  const cover = cabins[0] ? getBookingRoomVisuals(cabins[0].roomType, cabins[0].roomType).cover : null;

  return (
    <section className="hj-mreview" id={id} aria-labelledby={`${id}-title`}>
      <h2 className="hj-msection__title" id={`${id}-title`}>{title}</h2>
      {lede ? <p className="hj-msection__lede">{lede}</p> : null}
      <div className="hj-mreview__grid">
        <ReviewCard
          label="Journey"
          edit={toJourney}
          media={<Image className="hj-mcard__img" src={voyage.image} alt="" width={160} height={120} sizes="64px" />}
        >
          <span className="hj-mcard__value">{voyage.title}</span>
          <span className="hj-mcard__sub">{voyage.route}</span>
        </ReviewCard>
        <ReviewCard label="Dates" icon={<IconCalendar />} edit={toJourney}>
          <span className="hj-mcard__value">{sailing ? folioRange(sailing.departureTime, sailing.arrivalTime) : "Choose a date"}</span>
          <span className="hj-mcard__sub">{plural(voyage.nights, "night")} · {voyage.departureDay}</span>
        </ReviewCard>
        <ReviewCard label="Guests" icon={<IconGuests />} edit={toSuites}>
          <span className="hj-mcard__value">{partyLine(adults, childCount)}</span>
          <span className="hj-mcard__sub">{cabins.length === 0 ? "No cabin yet" : plural(cabins.length, "cabin")}</span>
        </ReviewCard>
        <ReviewCard
          label="Accommodation"
          edit={toSuites}
          media={cover ? <Image className="hj-mcard__img" src={cover} alt="" width={160} height={120} sizes="64px" /> : undefined}
        >
          {cabins.length === 0 ? (
            <span className="hj-mcard__value hj-mcard__value--soft">Not selected yet</span>
          ) : (
            cabins.map(cabin => (
              <span key={cabin.id} className="hj-mcard__cabin">
                <span className="hj-mcard__value">{cabin.label}</span>
                <span className="hj-mcard__sub">
                  {cabin.guests.length === 0
                    ? "No guests yet"
                    : partyLine(
                        cabin.guests.filter(guest => guest.kind === "adult").length,
                        cabin.guests.filter(guest => guest.kind === "child").length,
                      )}
                </span>
              </span>
            ))
          )}
        </ReviewCard>
        {payment ? (
          <ReviewCard label="Payment" icon={<IconCard />} edit={{ onEdit: payment.onEdit, label: "Change payment preference" }}>
            <span className="hj-mcard__value">{payment.label}</span>
            <span className="hj-mcard__sub">{payment.sub}</span>
          </ReviewCard>
        ) : null}
        <ReviewCard label={cabins.length > 1 ? `Total · ${plural(cabins.length, "cabin")}` : "Voyage total"} icon={<IconReceipt />} wide={!payment}>
          {totalCents === null ? (
            <span className="hj-mcard__value hj-mcard__value--soft">Select accommodation</span>
          ) : (
            <span className="hj-mcard__amount">{money(totalCents)}</span>
          )}
          <span className="hj-mcard__sub">
            {totalCents === null
              ? "The voyage total appears once your guests have a cabin."
              : `Entire ${voyage.nights}-night voyage, per cabin rates. Taxes and service charges included.`}
          </span>
        </ReviewCard>
      </div>
      {children}
    </section>
  );
}

