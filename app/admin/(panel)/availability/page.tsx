"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Anchor,
  CalendarOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  LockOpen,
  RotateCcw,
  Ship,
  Wrench,
  X,
} from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import { PHYSICAL_ROOM_TYPES } from "@/lib/physical-inventory";
import "./availability.css";

/* ---------- data ---------- */

type Occupancy = {
  kind: "booking" | "closure";
  state: string;
  blockKey: string | null;
  reason: string | null;
  createdAt: string;
  expiresAt: string | null;
  bookingId: string | null;
  bookingCode: string | null;
  bookingStatus: string | null;
  guestName: string | null;
  sameSailing: boolean;
  source: { voyage: string | null; slug: string | null; departure: string; arrival: string };
};
type Room = { id: string; name: string; roomType: string; capacity: number };
type Overlap = { voyage: string; slug: string; departure: string; arrival: string };
type Sailing = { scheduleId: string; departure: string; arrival: string; overlaps: Overlap[]; cabins: Record<string, Occupancy[]> };
type Board = { voyage: { slug: string; name: string }; month: string; rooms: Room[]; sailings: Sailing[] };
type Closure = {
  blockKey: string;
  state: string;
  reason: string | null;
  createdAt: string;
  startsAt: string;
  endsAt: string;
  roomIds: string[];
  voyage: string | null;
  slug: string | null;
};
type DateOption = { scheduleId: string; departure: string; arrival: string };
type CloseResult = { scheduleId: string; departure: string | null; closed: string[]; skipped: { roomId: string; why: string }[]; error?: string };
type ClosureState = "MANUAL_BLOCK" | "MAINTENANCE" | "CHARTER_BLOCK";

const VOYAGES = [
  { slug: "7-nights-luxor-aswan-luxor", nights: "7 nights", route: "Luxor → Aswan → Luxor" },
  { slug: "4-nights-luxor-aswan", nights: "4 nights", route: "Luxor → Aswan" },
  { slug: "3-nights-aswan-luxor", nights: "3 nights", route: "Aswan → Luxor" },
] as const;
type VoyageSlug = (typeof VOYAGES)[number]["slug"];

const TYPE_SHORT: Record<string, string> = {
  "Luxury King Cabin": "King cabins",
  "Luxury Twin Cabin": "Twin cabins",
  "Luxury Suite": "Luxury suites",
  "Royal Suite": "Royal suites",
};

const DEFAULT_REASONS = new Set(["Closed from the dashboard", "Maintenance", "Private charter"]);

/** Every King shares one name in the database; the booking calls them King Cabin 1–6. */
const CABIN_PREFIX: Record<string, string> = { K: "King Cabin", T: "Twin Cabin", S: "Luxury Suite", R: "Royal Suite" };
function cabinLabel(id: string, fallback?: string) {
  const match = /^([KTSR])0?(\d+)$/.exec(id);
  return match ? `${CABIN_PREFIX[match[1]]} ${Number(match[2])}` : fallback || id;
}

/* ---------- dates (sailings are stored as UTC days) ---------- */

const fmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-GB", { timeZone: "UTC", ...options });
const shortDay = (iso: string) => fmt(iso, { weekday: "short", day: "numeric", month: "short" });
const longDay = (iso: string) => fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dayNumber = (iso: string) => fmt(iso, { day: "numeric" });
const weekday = (iso: string) => fmt(iso, { weekday: "short" });
const monthLabel = (month: string) => fmt(`${month}-01T00:00:00Z`, { month: "long", year: "numeric" });
const monthOf = (iso: string) => iso.slice(0, 7);
function shiftMonth(month: string, offset: number) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7);
}
const thisMonth = () => new Date().toISOString().slice(0, 7);

/* ---------- cabin status ---------- */

type StatusKey = "open" | "booked" | "requested" | "held" | "closed" | "maintenance" | "charter";
type CabinStatus = { key: StatusKey; label: string; occupancy: Occupancy | null; reopenable: boolean };

const STATUS_RANK: Record<string, number> = { CONFIRMED: 0, REQUESTED: 1, HELD: 2, CHARTER_BLOCK: 3, MAINTENANCE: 4, MANUAL_BLOCK: 5 };
const STATUS_OF: Record<string, [StatusKey, string]> = {
  CONFIRMED: ["booked", "Booked"],
  REQUESTED: ["requested", "Requested"],
  HELD: ["held", "On hold"],
  CHARTER_BLOCK: ["charter", "Charter"],
  MAINTENANCE: ["maintenance", "Maintenance"],
  MANUAL_BLOCK: ["closed", "Closed"],
};

function statusOf(list: Occupancy[] | undefined): CabinStatus {
  if (!list?.length) return { key: "open", label: "Open", occupancy: null, reopenable: false };
  const first = [...list].sort((a, b) => (STATUS_RANK[a.state] ?? 9) - (STATUS_RANK[b.state] ?? 9))[0];
  const [key, label] = STATUS_OF[first.state] ?? ["closed", "Closed"];
  const reopenable = list.every(entry => entry.kind === "closure" && entry.blockKey);
  return { key, label, occupancy: first, reopenable };
}

const voyageShort = (slug: string | null, fallback: string | null) =>
  VOYAGES.find(voyage => voyage.slug === slug)?.nights ?? fallback ?? "another voyage";

/* ---------- small building blocks ---------- */

function StatusPill({ status }: { status: CabinStatus["key"] }) {
  const label = { open: "Open", booked: "Booked", requested: "Requested", held: "On hold", closed: "Closed", maintenance: "Maintenance", charter: "Charter" }[status];
  return <span className={`cav-pill cav-pill--${status}`}>{label}</span>;
}

function Modal({ title, onClose, children, footer, busy }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  busy?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus], button, textarea")?.focus(), 40);
    return () => { document.removeEventListener("keydown", onKey); window.clearTimeout(focus); };
  }, [busy, onClose]);
  // At the top of the page, so the phone's bottom navigation never covers it.
  return createPortal(
    <div className="cav cav-modal" role="presentation">
      <div className="cav-modal__scrim" aria-hidden onClick={() => { if (!busy) onClose(); }} />
      <div className="cav-modal__panel" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <header className="cav-modal__head">
          <h2 className="cav-modal__title">{title}</h2>
          <button type="button" className="cav-icon-btn" aria-label="Close" onClick={onClose} disabled={busy}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="cav-modal__body">{children}</div>
        <footer className="cav-modal__foot">{footer}</footer>
      </div>
    </div>,
    // The shell carries the day/night theme tokens; the page area sits under the nav.
    document.querySelector(".admin-shell") ?? document.body,
  );
}

/* ---------- page ---------- */

export default function AdminAvailabilityPage() {
  const { showToast } = useToast();
  const [voyage, setVoyage] = useState<VoyageSlug>("7-nights-luxor-aswan-luxor");
  const [month, setMonth] = useState(thisMonth);
  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [closures, setClosures] = useState<Closure[] | null>(null);
  const [closuresError, setClosuresError] = useState<string | null>(null);
  const [onlyThisVoyage, setOnlyThisVoyage] = useState(false);
  const [dialog, setDialog] = useState<null | { kind: "close"; charter: boolean } | { kind: "reopen" } | { kind: "reopen-block"; closure: Closure }>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const pendingSailing = useRef<string | null>(null);
  /** Months the first load may skip forward to find departures (per voyage change). */
  const autoAdvance = useRef(2);

  const reload = useCallback(() => setReloadKey(key => key + 1), []);

  // The month's sailings and what occupies every cabin.
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setBoardLoading(true); setBoardError(null); } });
    adminFetch(`/api/admin/cabin-closures?voyage=${voyage}&month=${month}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load the cabins.");
        return body as Board;
      })
      .then(next => {
        if (controller.signal.aborted) return;
        // A closure picked from the list names its departure; open that sailing.
        const wanted = pendingSailing.current;
        pendingSailing.current = null;
        const target = wanted ? next.sailings.find(sailing => sailing.departure === wanted)?.scheduleId : undefined;
        // The current month can have no departures left: open on the next one that does.
        if (!next.sailings.length && autoAdvance.current > 0) {
          autoAdvance.current -= 1;
          setMonth(current => shiftMonth(current, 1));
          return;
        }
        autoAdvance.current = 0;
        setBoard(next);
        setScheduleId(current => target ?? (next.sailings.some(sailing => sailing.scheduleId === current) ? current : next.sailings[0]?.scheduleId ?? ""));
      })
      .catch(error => { if (!controller.signal.aborted) setBoardError(error instanceof Error ? error.message : "Could not load the cabins."); })
      .finally(() => { if (!controller.signal.aborted) setBoardLoading(false); });
    return () => controller.abort();
  }, [voyage, month, reloadKey]);

  // Every closure still ahead, across the three voyages.
  useEffect(() => {
    const controller = new AbortController();
    adminFetch("/api/admin/cabin-closures?view=upcoming", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load closures.");
        return body as { closures: Closure[] };
      })
      .then(body => { if (!controller.signal.aborted) { setClosures(body.closures); setClosuresError(null); } })
      .catch(error => { if (!controller.signal.aborted) setClosuresError(error instanceof Error ? error.message : "Could not load closures."); });
    return () => controller.abort();
  }, [reloadKey]);

  const sailing = board?.sailings.find(entry => entry.scheduleId === scheduleId) ?? null;
  const rooms = useMemo(() => board?.rooms ?? [], [board]);
  const roomName = useCallback((id: string) => cabinLabel(id, rooms.find(room => room.id === id)?.name), [rooms]);

  const groups = useMemo(() => {
    const order = [...PHYSICAL_ROOM_TYPES, ...new Set(rooms.map(room => room.roomType).filter(type => !PHYSICAL_ROOM_TYPES.includes(type as never)))];
    return order.map(type => ({ type, rooms: rooms.filter(room => room.roomType === type) })).filter(group => group.rooms.length);
  }, [rooms]);

  const statuses = useMemo(() => {
    const map = new Map<string, CabinStatus>();
    for (const room of rooms) map.set(room.id, statusOf(sailing?.cabins[room.id]));
    return map;
  }, [rooms, sailing]);

  const counts = useMemo(() => {
    const result = { open: 0, taken: 0, closed: 0 };
    for (const status of statuses.values()) {
      if (status.key === "open") result.open += 1;
      else if (status.key === "booked" || status.key === "requested" || status.key === "held") result.taken += 1;
      else result.closed += 1;
    }
    return result;
  }, [statuses]);

  const mode: "close" | "reopen" | null = selected.length
    ? statuses.get(selected[0])?.key === "open" ? "close" : "reopen"
    : null;

  function toggle(roomId: string) {
    const status = statuses.get(roomId);
    if (!status) return;
    const kind = status.key === "open" ? "close" : status.reopenable ? "reopen" : null;
    if (!kind) return;
    setSelected(current => {
      if (current.includes(roomId)) return current.filter(id => id !== roomId);
      // Closing and reopening are separate actions: a tile of the other kind starts a new choice.
      return mode && mode !== kind ? [roomId] : [...current, roomId];
    });
  }

  function selectGroup(ids: string[]) {
    const open = ids.filter(id => statuses.get(id)?.key === "open");
    if (!open.length) return;
    setSelected(current => {
      const base = mode === "close" ? current : [];
      const allIn = open.every(id => base.includes(id));
      return allIn ? base.filter(id => !open.includes(id)) : [...new Set([...base, ...open])];
    });
  }

  function chooseSailing(id: string) {
    setScheduleId(id);
    setSelected([]);
  }

  function changeVoyage(slug: VoyageSlug) {
    setVoyage(slug);
    setSelected([]);
    if (month === thisMonth()) autoAdvance.current = 2;
  }

  function changeMonth(offset: number) {
    setMonth(current => shiftMonth(current, offset));
    setSelected([]);
  }

  /** From the closures list: open that voyage, month and sailing. */
  function jumpTo(closure: Closure) {
    const slug = VOYAGES.find(entry => entry.slug === closure.slug)?.slug;
    if (!slug) return;
    setSelected([]);
    const targetMonth = monthOf(closure.startsAt);
    if (slug === voyage && targetMonth === month && board) {
      const match = board.sailings.find(entry => entry.departure === closure.startsAt);
      if (match) setScheduleId(match.scheduleId);
    } else {
      pendingSailing.current = closure.startsAt;
      setVoyage(slug);
      setMonth(targetMonth);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const visibleClosures = useMemo(
    () => (closures ?? []).filter(closure => !onlyThisVoyage || closure.slug === voyage),
    [closures, onlyThisVoyage, voyage],
  );

  const takenOnSailing = counts.taken > 0;

  return (
    <div className="cav space-y-4 sm:space-y-6">
      <div className="cav-head">
        <div>
          <h1 className="admin-page-title">Availability</h1>
          <p className="admin-page-subtitle">
            Close cabins on a sailing and they leave the booking at once. Booked and requested cabins are never touched.
          </p>
        </div>
      </div>

      <div className="cav-layout">
        <section className="cav-main" aria-label="Cabins by sailing">
          {/* Voyage and month */}
          <div className="admin-card cav-controls">
            <div className="cav-segment" role="radiogroup" aria-label="Voyage">
              {VOYAGES.map(entry => (
                <button
                  key={entry.slug}
                  type="button"
                  role="radio"
                  aria-checked={voyage === entry.slug}
                  className={`cav-segment__item${voyage === entry.slug ? " is-on" : ""}`}
                  onClick={() => changeVoyage(entry.slug)}
                >
                  <span className="cav-segment__main">{entry.nights}</span>
                  <span className="cav-segment__sub">{entry.route}</span>
                </button>
              ))}
            </div>
            <div className="cav-month">
              <button type="button" className="cav-icon-btn" aria-label="Previous month" onClick={() => changeMonth(-1)} disabled={month <= thisMonth()}>
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <span className="cav-month__label" aria-live="polite">{monthLabel(month)}</span>
              <button type="button" className="cav-icon-btn" aria-label="Next month" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Sailings in the month */}
          <div className="admin-card cav-card">
            <div className="cav-card__head">
              <h2 className="admin-heading text-sm">Departures in {monthLabel(month)}</h2>
              {boardLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" /> : null}
            </div>
            {boardError ? (
              <div className="cav-empty">
                <p style={{ color: "var(--danger)" }}>{boardError}</p>
                <ActionButton variant="outline" icon={RotateCcw} onClick={reload}>Try again</ActionButton>
              </div>
            ) : board && !board.sailings.length && !boardLoading ? (
              <div className="cav-empty">
                <p>No open departures for this voyage in {monthLabel(month)}.</p>
                <ActionButton variant="outline" icon={ChevronRight} onClick={() => changeMonth(1)}>Next month</ActionButton>
              </div>
            ) : (
              <div className="cav-dates" role="radiogroup" aria-label="Departure date">
                {(board?.sailings ?? []).map(entry => {
                  const entryStatuses = (board?.rooms ?? []).map(room => statusOf(entry.cabins[room.id]).key);
                  const open = entryStatuses.filter(key => key === "open").length;
                  const closed = entryStatuses.filter(key => key === "closed" || key === "maintenance" || key === "charter").length;
                  const on = entry.scheduleId === scheduleId;
                  return (
                    <button
                      key={entry.scheduleId}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`cav-date${on ? " is-on" : ""}`}
                      onClick={() => chooseSailing(entry.scheduleId)}
                    >
                      <span className="cav-date__day">{dayNumber(entry.departure)}</span>
                      <span className="cav-date__text">
                        <span className="cav-date__week">{weekday(entry.departure)} → {shortDay(entry.arrival)}</span>
                        <span className="cav-date__meta">
                          <b>{open}</b> of {entryStatuses.length} open
                          {closed ? <span className="cav-date__closed">{closed} closed</span> : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* The cabins on the chosen sailing */}
          {sailing ? (
            <div className="admin-card cav-card">
              <div className="cav-sailing">
                <div className="cav-sailing__text">
                  <p className="cav-eyebrow">{VOYAGES.find(entry => entry.slug === voyage)?.nights} · {VOYAGES.find(entry => entry.slug === voyage)?.route}</p>
                  <h2 className="cav-sailing__title">{longDay(sailing.departure)}</h2>
                  <p className="cav-sailing__sub">Returns {longDay(sailing.arrival)}</p>
                </div>
                <div className="cav-sailing__stats" aria-label="Cabin summary">
                  <span><b>{counts.open}</b> open</span>
                  <span><b>{counts.taken}</b> with guests</span>
                  <span><b>{counts.closed}</b> closed</span>
                </div>
                <div className="cav-sailing__actions">
                  <ActionButton
                    variant="outline"
                    icon={Anchor}
                    disabled={takenOnSailing || counts.open === 0}
                    onClick={() => { setSelected([]); setDialog({ kind: "close", charter: true }); }}
                  >
                    Close whole ship
                  </ActionButton>
                </div>
              </div>
              {takenOnSailing ? (
                <p className="cav-note">A private charter needs every cabin free; guests already have cabins on this sailing.</p>
              ) : null}

              <div className="cav-legend" aria-hidden>
                {(["open", "booked", "requested", "held", "closed", "maintenance", "charter"] as const).map(key => (
                  <span key={key} className="cav-legend__item"><StatusPill status={key} /></span>
                ))}
              </div>

              {groups.map(group => {
                const ids = group.rooms.map(room => room.id);
                const open = ids.filter(id => statuses.get(id)?.key === "open");
                const allChosen = open.length > 0 && mode === "close" && open.every(id => selected.includes(id));
                return (
                  <section key={group.type} className="cav-group" aria-label={group.type}>
                    <div className="cav-group__head">
                      <h3 className="cav-group__title">
                        {TYPE_SHORT[group.type] ?? group.type}
                        <span className="cav-group__count">{open.length} of {ids.length} open</span>
                      </h3>
                      <button type="button" className="cav-link" disabled={!open.length} onClick={() => selectGroup(ids)}>
                        {allChosen ? "Clear" : "Select all open"}
                      </button>
                    </div>
                    <div className="cav-tiles">
                      {group.rooms.map(room => {
                        const status = statuses.get(room.id)!;
                        const chosen = selected.includes(room.id);
                        const occupancy = status.occupancy;
                        const fromOther = occupancy && !occupancy.sameSailing;
                        const selectable = status.key === "open" || status.reopenable;
                        const detail = occupancy?.kind === "booking"
                          ? occupancy.guestName || "Guest"
                          : occupancy?.reason && !DEFAULT_REASONS.has(occupancy.reason) ? occupancy.reason : null;
                        const body = (
                          <>
                            <span className="cav-tile__top">
                              <span className="cav-tile__name">{cabinLabel(room.id, room.name)}</span>
                              {selectable ? (
                                <span className={`cav-check${chosen ? " is-on" : ""}`} aria-hidden>{chosen ? <Check className="h-3 w-3" /> : null}</span>
                              ) : null}
                            </span>
                            <span className="cav-tile__meta">{room.id} · up to {room.capacity}</span>
                            <span className="cav-tile__status">
                              <StatusPill status={status.key} />
                              {occupancy?.kind === "booking" && occupancy.bookingCode ? <span className="cav-tile__code">{occupancy.bookingCode}</span> : null}
                            </span>
                            {detail ? <span className="cav-tile__detail">{detail}</span> : null}
                            {fromOther ? (
                              <span className="cav-tile__detail">
                                Set on {voyageShort(occupancy.source.slug, occupancy.source.voyage)} · {shortDay(occupancy.source.departure)}
                              </span>
                            ) : null}
                          </>
                        );
                        if (occupancy?.kind === "booking" && occupancy.bookingId) {
                          return (
                            <Link key={room.id} href={`/admin/bookings/${occupancy.bookingId}`} className={`cav-tile cav-tile--${status.key}`} title="Open this booking">
                              {body}
                            </Link>
                          );
                        }
                        return (
                          <button
                            key={room.id}
                            type="button"
                            className={`cav-tile cav-tile--${status.key}${chosen ? " is-chosen" : ""}`}
                            aria-pressed={selectable ? chosen : undefined}
                            disabled={!selectable}
                            onClick={() => toggle(room.id)}
                          >
                            {body}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {/* What to do with the choice */}
          {selected.length && sailing ? (
            <div className="cav-bar" role="region" aria-label="Selected cabins">
              <span className="cav-bar__text">
                <b>{selected.length} {selected.length === 1 ? "cabin" : "cabins"}</b> selected · {shortDay(sailing.departure)}
              </span>
              <div className="cav-bar__actions">
                <ActionButton variant="outline" onClick={() => setSelected([])}>Clear</ActionButton>
                {mode === "close" ? (
                  <ActionButton icon={Lock} onClick={() => setDialog({ kind: "close", charter: false })}>Close cabins</ActionButton>
                ) : (
                  <ActionButton icon={LockOpen} onClick={() => setDialog({ kind: "reopen" })}>Reopen</ActionButton>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Closures ahead */}
        <aside className="admin-card cav-card cav-side" aria-label="Upcoming closures">
          <div className="cav-card__head">
            <h2 className="admin-heading text-sm">
              Upcoming closures
              {closures ? <span className="cav-count">{visibleClosures.length}</span> : null}
            </h2>
            <label className="cav-switch">
              <input type="checkbox" checked={onlyThisVoyage} onChange={event => setOnlyThisVoyage(event.target.checked)} />
              <span>This voyage only</span>
            </label>
          </div>
          {closuresError ? (
            <div className="cav-empty">
              <p style={{ color: "var(--danger)" }}>{closuresError}</p>
              <ActionButton variant="outline" icon={RotateCcw} onClick={reload}>Try again</ActionButton>
            </div>
          ) : !closures ? (
            <div className="cav-empty"><Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" /></div>
          ) : !visibleClosures.length ? (
            <div className="cav-empty">
              <CalendarOff className="h-5 w-5" aria-hidden />
              <p>No cabins are closed{onlyThisVoyage ? " on this voyage" : ""}. Everything open follows bookings only.</p>
            </div>
          ) : (
            <ol className="cav-list">
              {visibleClosures.map((closure, index) => {
                const closureMonth = monthOf(closure.startsAt);
                const newMonth = index === 0 || monthOf(visibleClosures[index - 1].startsAt) !== closureMonth;
                const [key, label] = STATUS_OF[closure.state] ?? ["closed", "Closed"];
                return (
                  <li key={closure.blockKey} className="cav-list__entry">
                    {newMonth ? <p className="cav-list__month">{monthLabel(closureMonth)}</p> : null}
                    <div className="cav-closure">
                      <button type="button" className="cav-closure__main" onClick={() => jumpTo(closure)} disabled={!closure.slug}>
                        <span className="cav-closure__when">{shortDay(closure.startsAt)} → {shortDay(closure.endsAt)}</span>
                        <span className="cav-closure__voyage">
                          {voyageShort(closure.slug, closure.voyage)}
                          <span className={`cav-pill cav-pill--${key}`}>{label}</span>
                        </span>
                        <span className="cav-closure__rooms">
                          {closure.roomIds.length === rooms.length && rooms.length ? "Whole ship" : closure.roomIds.map(roomName).join(", ")}
                        </span>
                        {closure.reason && !DEFAULT_REASONS.has(closure.reason) ? <span className="cav-closure__note">{closure.reason}</span> : null}
                      </button>
                      <button
                        type="button"
                        className="cav-icon-btn cav-closure__reopen"
                        aria-label={`Reopen ${closure.roomIds.length} cabins from ${shortDay(closure.startsAt)}`}
                        title="Reopen"
                        onClick={() => setDialog({ kind: "reopen-block", closure })}
                      >
                        <LockOpen className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>

      {dialog?.kind === "close" && sailing ? (
        <CloseDialog
          voyage={voyage}
          sailing={sailing}
          rooms={dialog.charter ? rooms : rooms.filter(room => selected.includes(room.id))}
          charter={dialog.charter}
          onClose={() => setDialog(null)}
          onDone={(message, tone) => {
            showToast(tone, message);
            setDialog(null);
            setSelected([]);
            reload();
          }}
          roomName={roomName}
        />
      ) : null}

      {dialog?.kind === "reopen" && sailing ? (
        <ReopenDialog
          title={`Reopen ${selected.length} ${selected.length === 1 ? "cabin" : "cabins"}`}
          lines={selected.map(id => {
            const occupancy = statuses.get(id)?.occupancy;
            const elsewhere = occupancy && !occupancy.sameSailing
              ? ` (closed on ${voyageShort(occupancy.source.slug, occupancy.source.voyage)} · ${shortDay(occupancy.source.departure)})`
              : "";
            return `${roomName(id)}${elsewhere}`;
          })}
          when={shortDay(sailing.departure)}
          requests={Object.entries(
            selected.reduce<Record<string, string[]>>((acc, id) => {
              for (const occupancy of sailing.cabins[id] ?? []) {
                if (occupancy.kind === "closure" && occupancy.blockKey) (acc[occupancy.blockKey] ??= []).push(id);
              }
              return acc;
            }, {}),
          ).map(([blockKey, roomIds]) => ({ blockKey, roomIds }))}
          onClose={() => setDialog(null)}
          onDone={(message, tone) => {
            showToast(tone, message);
            setDialog(null);
            setSelected([]);
            reload();
          }}
        />
      ) : null}

      {dialog?.kind === "reopen-block" ? (
        <ReopenDialog
          title={dialog.closure.roomIds.length === rooms.length ? "Reopen the whole ship" : `Reopen ${dialog.closure.roomIds.length} ${dialog.closure.roomIds.length === 1 ? "cabin" : "cabins"}`}
          lines={dialog.closure.roomIds.map(roomName)}
          when={`${voyageShort(dialog.closure.slug, dialog.closure.voyage)} · ${shortDay(dialog.closure.startsAt)}`}
          requests={[{ blockKey: dialog.closure.blockKey }]}
          onClose={() => setDialog(null)}
          onDone={(message, tone) => {
            showToast(tone, message);
            setDialog(null);
            setSelected([]);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------- close ---------- */

function CloseDialog({ voyage, sailing, rooms, charter, onClose, onDone, roomName }: {
  voyage: VoyageSlug;
  sailing: Sailing;
  rooms: Room[];
  charter: boolean;
  onClose: () => void;
  onDone: (message: string, tone: "success" | "warning" | "error") => void;
  roomName: (id: string) => string;
}) {
  const [state, setState] = useState<ClosureState>(charter ? "CHARTER_BLOCK" : "MANUAL_BLOCK");
  const [note, setNote] = useState("");
  const [dates, setDates] = useState<DateOption[] | null>(null);
  const [extra, setExtra] = useState<string[]>([]);
  const [earlier, setEarlier] = useState(false);
  const [busy, setBusy] = useState(false);
  const operation = useRef(crypto.randomUUID());

  useEffect(() => {
    const controller = new AbortController();
    adminFetch(`/api/admin/cabin-closures?voyage=${voyage}&view=dates`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load dates.");
        return body as { dates: DateOption[] };
      })
      .then(body => { if (!controller.signal.aborted) setDates(body.dates.filter(date => date.scheduleId !== sailing.scheduleId)); })
      .catch(() => { if (!controller.signal.aborted) setDates([]); });
    return () => controller.abort();
  }, [voyage, sailing.scheduleId]);

  // A new choice of dates or cabins is a new operation; a retry of the same one is safe.
  useEffect(() => { operation.current = crypto.randomUUID(); }, [extra, state, note]);

  const dateCount = 1 + extra.length;
  // Closures usually run forward from the chosen sailing; earlier dates are one tap away.
  const after = (dates ?? []).filter(date => date.departure > sailing.departure);
  const before = (dates ?? []).filter(date => date.departure < sailing.departure);
  const shownDates = earlier ? [...before, ...after] : after;
  const title = charter ? "Close the whole ship" : `Close ${rooms.length} ${rooms.length === 1 ? "cabin" : "cabins"}`;

  async function submit() {
    setBusy(true);
    try {
      const response = await adminFetch("/api/admin/cabin-closures", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": operation.current },
        body: JSON.stringify({
          scheduleIds: [sailing.scheduleId, ...extra],
          roomIds: rooms.map(room => room.id),
          state,
          note: note.trim() || undefined,
        }),
      }, 60_000);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Could not close the cabins.");
      const results = (body as { results: CloseResult[] }).results;
      const done = results.filter(result => result.closed.length);
      const closedCabins = done.reduce((sum, result) => sum + result.closed.length, 0);
      const problems = results.flatMap(result => [
        ...(result.error ? [`${result.departure ? shortDay(result.departure) : "One date"}: ${result.error}`] : []),
        ...result.skipped.map(skip => `${result.departure ? shortDay(result.departure) : ""} ${roomName(skip.roomId)} is ${skip.why}`.trim()),
      ]);
      if (!closedCabins) {
        onDone(problems.length ? `Nothing was closed. ${problems.slice(0, 3).join(" · ")}` : "Nothing was closed.", "warning");
        return;
      }
      const summary = `Closed ${closedCabins} ${closedCabins === 1 ? "cabin" : "cabins"} on ${done.length} ${done.length === 1 ? "date" : "dates"}. They are off sale now.`;
      onDone(problems.length ? `${summary} Left as they were: ${problems.slice(0, 3).join(" · ")}${problems.length > 3 ? ` and ${problems.length - 3} more` : ""}.` : summary, problems.length ? "warning" : "success");
    } catch (error) {
      onDone(error instanceof Error ? error.message : "Could not close the cabins.", "error");
    } finally {
      setBusy(false);
    }
  }

  const reasons: { value: ClosureState; label: string; hint: string; icon: typeof Lock }[] = charter
    ? [{ value: "CHARTER_BLOCK", label: "Private charter", hint: "The whole ship for one party", icon: Ship }]
    : [
        { value: "MANUAL_BLOCK", label: "Closed", hint: "Sold elsewhere, held for someone, or not for sale", icon: Lock },
        { value: "MAINTENANCE", label: "Maintenance", hint: "The cabin cannot be used", icon: Wrench },
      ];

  return (
    <Modal
      title={title}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <ActionButton variant="outline" onClick={onClose} disabled={busy}>Cancel</ActionButton>
          <ActionButton icon={Lock} loading={busy} loadingLabel="Closing…" onClick={() => void submit()}>
            {charter ? "Charter" : "Close"} on {dateCount} {dateCount === 1 ? "date" : "dates"}
          </ActionButton>
        </>
      }
    >
      <div className="cav-form">
        <div className="cav-summary">
          <p className="cav-eyebrow">{longDay(sailing.departure)}</p>
          <div className="cav-chips">
            {charter ? <span className="cav-chip">All {rooms.length} cabins</span> : rooms.map(room => <span key={room.id} className="cav-chip">{cabinLabel(room.id, room.name)}</span>)}
          </div>
        </div>

        <fieldset className="cav-fieldset">
          <legend className="cav-label">Why</legend>
          <div className="cav-reasons">
            {reasons.map(reason => {
              const Icon = reason.icon;
              return (
                <label key={reason.value} className={`cav-reason${state === reason.value ? " is-on" : ""}`}>
                  <input type="radio" name="cav-reason" value={reason.value} checked={state === reason.value} onChange={() => setState(reason.value)} />
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>
                    <b>{reason.label}</b>
                    <span>{reason.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="cav-fieldset">
          <label className="cav-label" htmlFor="cav-note">Note <span className="cav-optional">optional · shown only in the dashboard</span></label>
          <textarea
            id="cav-note"
            className="admin-input cav-textarea"
            maxLength={300}
            rows={2}
            placeholder="e.g. Booked by phone for the Adel family"
            value={note}
            onChange={event => setNote(event.target.value)}
          />
        </div>

        <div className="cav-fieldset">
          <div className="cav-label-row">
            <span className="cav-label">Also close on</span>
            {dates && dates.length ? (
              <button type="button" className="cav-link" onClick={() => setExtra(current => current.length ? [] : after.slice(0, 4).map(date => date.scheduleId))}>
                {extra.length ? "Clear" : "Next 4 departures"}
              </button>
            ) : null}
          </div>
          {!dates ? (
            <p className="cav-note"><Loader2 className="inline h-3 w-3 animate-spin" aria-hidden /> Loading departures…</p>
          ) : !dates.length ? (
            <p className="cav-note">No other departures are open on this voyage.</p>
          ) : (
            <div className="cav-date-pick" role="group" aria-label="More departure dates">
              {!shownDates.length ? <p className="cav-note">No later departures are open on this voyage.</p> : null}
              {shownDates.map(date => {
                const on = extra.includes(date.scheduleId);
                return (
                  <button
                    key={date.scheduleId}
                    type="button"
                    aria-pressed={on}
                    className={`cav-date-chip${on ? " is-on" : ""}`}
                    onClick={() => setExtra(current => on ? current.filter(id => id !== date.scheduleId) : [...current, date.scheduleId])}
                  >
                    {on ? <Check className="h-3 w-3" aria-hidden /> : null}
                    {shortDay(date.departure)}
                  </button>
                );
              })}
              {before.length ? (
                <button type="button" className="cav-link" onClick={() => setEarlier(value => !value)}>
                  {earlier ? "Hide earlier dates" : `Show ${before.length} earlier ${before.length === 1 ? "date" : "dates"}`}
                </button>
              ) : null}
            </div>
          )}
          <p className="cav-note">On each date, a cabin a guest already has is left as it is and listed afterwards.</p>
        </div>

        {sailing.overlaps.length ? (
          <div className="cav-callout">
            <p>
              <b>One boat, one cabin.</b> The same {charter ? "cabins" : rooms.length === 1 ? "cabin" : "cabins"} also go off sale on the
              overlapping {sailing.overlaps.length === 1 ? "sailing" : "sailings"}:{" "}
              {sailing.overlaps.map(entry => `${voyageShort(entry.slug, entry.voyage)} · ${shortDay(entry.departure)}`).join(", ")}
              {extra.length ? ", and the matching sailings of the other dates" : ""}.
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

/* ---------- reopen ---------- */

function ReopenDialog({ title, lines, when, requests, onClose, onDone }: {
  title: string;
  lines: string[];
  when: string;
  requests: { blockKey: string; roomIds?: string[] }[];
  onClose: () => void;
  onDone: (message: string, tone: "success" | "warning" | "error") => void;
}) {
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      let released = 0;
      for (const request of requests) {
        const response = await adminFetch("/api/admin/cabin-closures", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not reopen.");
        released += (body as { released: number }).released;
      }
      onDone(
        released ? `Reopened ${released} ${released === 1 ? "cabin" : "cabins"}. Guests can book ${released === 1 ? "it" : "them"} now.` : "Those cabins were already open.",
        released ? "success" : "warning",
      );
    } catch (error) {
      onDone(error instanceof Error ? error.message : "Could not reopen.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <ActionButton variant="outline" onClick={onClose} disabled={busy}>Cancel</ActionButton>
          <ActionButton icon={LockOpen} loading={busy} loadingLabel="Reopening…" onClick={() => void submit()}>Reopen</ActionButton>
        </>
      }
    >
      <div className="cav-form">
        <p className="cav-eyebrow">{when}</p>
        <ul className="cav-lines">
          {lines.map(line => <li key={line}>{line}</li>)}
        </ul>
        <p className="cav-note">
          They go back on sale at once. A closure set on another voyage&rsquo;s sailing reopens there too, because it is the same cabin on the same boat.
        </p>
      </div>
    </Modal>
  );
}
