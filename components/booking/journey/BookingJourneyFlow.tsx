"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { paymentSchedule } from "@/lib/payment-schedule";
import { bookingItinerary } from "@/lib/i18n/booking-itineraries-it";
import { localizedHref, type PublicLocale } from "@/lib/i18n/locale";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType, RequestedRoom } from "@/lib/physical-inventory";
import { JourneyBand, JourneyProgress, PanelHead, ScrollCue, StepBanner, StepGuide, type JourneyStep } from "./JourneyChrome";
import { ItineraryAccordion, VoyagePicker } from "./ItineraryPanel";
import { SailingCalendar } from "./SailingCalendar";
import { GuestsSuitesScreen } from "./GuestsSuites";
import { VoyageBar, VoyageRail } from "./VoyageRail";
import { DetailsPaymentScreen } from "./GuestDetails";
import {
  ActionBar,
  DateSheet,
  GuestsSheet,
  IconLead,
  IconMap,
  IconReceipt,
  MobileBack,
  PlanTiles,
  ReviewCards,
  SectionTabs,
  reveal,
  useRevealOnPhone,
  type SectionTab,
} from "./JourneyMobile";
import { IconBed, IconCalendar, IconCard, IconGuests } from "./icons";
import {
  EMPTY_ARRANGEMENT,
  arrangementIssues,
  arrangementTotal,
  autoArrange,
  cabinViews,
  fitToOffers,
  guestLabel,
  guestList,
  guestsFor,
  offersFromTypes,
  passengersPayload,
  placementReminder,
  resizeParty,
  roomsPayload,
  shortName,
  unplacedGuests,
  type Arrangement,
} from "./allocation";
import { findCountry } from "@/lib/countries";
import { useBookingCopy } from "./useBookingCopy";
import {
  STORAGE_KEY,
  emptyGuestForm,
  internationalPhone,
  type Attempt,
  type GuestForm,
  type Hold,
  type PaymentStage,
  type Sailing,
} from "./model";

const PHONE = /^\+[1-9][0-9]{6,14}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

class RequestFailed extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** A failed reply's message, in the visitor's language. */
type Translate = (message: string) => string;

async function readJson<T>(response: Response, translate: Translate): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new RequestFailed(translate(data.details?.formErrors?.[0] ?? data.error ?? "Please try again."), response.status);
  }
  return data as T;
}

/** Where the journey starts: a room page, or the cart with its saved sailing and party. */
export type JourneyStart = {
  duration: StayDurationValue;
  roomType: PhysicalRoomType | null;
  roomId?: string | null;
  sailingDate?: string | null;
  adults?: number | null;
  children?: number | null;
};

const successUrl = (bookingId: string, token: string, locale: PublicLocale) =>
  localizedHref(`/booking/success?bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`, locale);

export function BookingJourneyFlow({ start }: { start: JourneyStart | null }) {
  const router = useRouter();
  const t = useBookingCopy();
  /** Opens the reminder of exactly what is missing on Details & Payment. */
  const REMIND = t.details.remind;
  const translate = t.serverMessage;
  const [duration, setDuration] = useState<StayDurationValue>(start?.duration ?? "7-nights-luxor-aswan-luxor");
  const [adults, setAdults] = useState(start?.adults ?? 2);
  const [children, setChildren] = useState(start?.children ?? 0);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loadingSailings, setLoadingSailings] = useState(true);
  const [scheduleId, setScheduleId] = useState("");
  const [preferredRoomId, setPreferredRoomId] = useState(start?.roomId ?? null);
  const [arrangement, setArrangement] = useState<Arrangement>(EMPTY_ARRANGEMENT);
  const [step, setStep] = useState<JourneyStep>(1);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [form, setForm] = useState<GuestForm>(emptyGuestForm);
  const [names, setNames] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Phone and tablet: the date or party sheet open on the journey step. */
  const [sheet, setSheet] = useState<"dates" | "guests" | null>(null);
  const restored = useRef(false);
  /** A sailing date handed over by the cart, applied once the dates load. */
  const pendingSailingDate = useRef(start?.sailingDate ?? null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const voyage = bookingItinerary(duration, t.locale);
  const preferred = start?.roomType ?? null;
  const sailing = useMemo(() => sailings.find(entry => entry.scheduleId === scheduleId) ?? null, [sailings, scheduleId]);
  const offers = useMemo(() => (sailing ? offersFromTypes(sailing.types) : {}), [sailing]);
  const guests = useMemo(() => guestsFor(adults, children), [adults, children]);
  const cabins = useMemo(() => cabinViews(arrangement, guests, offers, t), [arrangement, guests, offers, t]);
  const issues = useMemo(() => arrangementIssues(arrangement, guests, t), [arrangement, guests, t]);
  const rooms = useMemo(() => {
    const payload = roomsPayload(arrangement, guests);
    if (preferredRoomId && preferred) {
      const chosen = payload.find(entry => entry.roomType === preferred);
      if (chosen) chosen.roomId = preferredRoomId;
    }
    return payload;
  }, [arrangement, guests, preferredRoomId, preferred]);
  const signature = sailing ? JSON.stringify({ scheduleId: sailing.scheduleId, rooms }) : "";
  const hold = attempt?.hold && attempt.signature === signature ? attempt.hold : null;
  const totalCents = hold?.totalPriceCents ?? arrangementTotal(arrangement, offers);
  const schedule: PaymentStage[] = useMemo(() => {
    if (hold) return hold.paymentSchedule;
    if (!sailing || totalCents === null) return [];
    return paymentSchedule(totalCents, new Date(sailing.departureTime)).milestones.map(stage => ({
      milestone: stage.milestone,
      dueAt: stage.dueAt ? stage.dueAt.toISOString() : null,
      cumulativeCents: stage.cumulativeCents,
    }));
  }, [hold, sailing, totalCents]);

  // A screen that lost its sailing (closed date, changed voyage) falls back to the journey.
  const view: JourneyStep = step > 1 && !loadingSailings && !sailing ? 1 : step;

  const phoneToSend = internationalPhone(form.phone, findCountry(form.countryCode)?.dial ?? null);

  const saveAttempt = useCallback((next: Attempt) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  }, []);
  const clearAttempt = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
  }, []);

  // Free cabins do not depend on the party: the arrangement decides the rooms.
  const loadSailings = useCallback(async (signal?: AbortSignal): Promise<Sailing[]> => {
    const params = new URLSearchParams({ mode: "request", duration });
    const data = await readJson<{ sailings: Sailing[] }>(
      await fetch(`/api/booking/availability?${params.toString()}`, { cache: "no-store", signal }),
      translate,
    );
    return data.sailings;
  }, [duration, translate]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoadingSailings(true);
      loadSailings(controller.signal)
        .then(list => {
          setSailings(list);
          const wanted = pendingSailingDate.current;
          if (!wanted) {
            setScheduleId(current => (list.some(entry => entry.scheduleId === current) ? current : ""));
            return;
          }
          // Coming from the cart: re-check the saved sailing, then go straight to the cabins.
          pendingSailingDate.current = null;
          const match = list.find(entry => entry.departureTime.slice(0, 10) === wanted && !entry.soldOut);
          if (!match) {
            setAlert(t.alerts.cartSailingClosed(t.longDate(`${wanted}T00:00:00.000Z`)));
            return;
          }
          setScheduleId(match.scheduleId);
          if (start?.roomId && !match.types.some(type => type.freeCabins.some(cabin => cabin.id === start.roomId))) {
            setAlert(t.alerts.cartCabinClosed(start.roomId));
            return;
          }
          // The cabin chosen in the cart is the guest's own choice: place the party in that type
          // when it fits. Otherwise everyone waits in Who Is Travelling to be placed.
          if (start?.roomType) {
            const startGuests = guestsFor(start.adults ?? 2, start.children ?? 0);
            setArrangement(autoArrange(startGuests, offersFromTypes(match.types), [start.roomType]) ?? EMPTY_ARRANGEMENT);
          }
          setStep(2);
        })
        .catch(error => { if (!controller.signal.aborted) setAlert(error instanceof Error ? error.message : t.alerts.availabilityUnavailable); })
        .finally(() => { if (!controller.signal.aborted) setLoadingSailings(false); });
    }, 150);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [loadSailings, start, t]);

  // A reload between the hold and the request picks up exactly where it stopped.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let alive = true;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as Attempt;
        if (!saved?.key || !saved.hold || !saved.arrangement) { clearAttempt(); return; }
        const current = await readJson<Hold>(
          await fetch(`/api/bookings/${encodeURIComponent(saved.hold.bookingId)}`, {
            headers: { Authorization: `Bearer ${saved.hold.accessToken}` },
            cache: "no-store",
          }),
          translate,
        );
        if (!alive) return;
        if (["REQUESTED", "CONFIRMED"].includes(current.status)) {
          clearAttempt();
          router.replace(successUrl(saved.hold.bookingId, saved.hold.accessToken, t.locale));
          return;
        }
        if (current.status !== "PENDING_HOLD") { clearAttempt(); return; }
        pendingSailingDate.current = null;
        setDuration(saved.duration);
        setAdults(saved.adults);
        setChildren(saved.children);
        setScheduleId(saved.scheduleId);
        setArrangement(saved.arrangement);
        setAttempt({ ...saved, hold: { ...saved.hold, ...current, accessToken: saved.hold.accessToken } });
        setStep(3);
      } catch {
        clearAttempt();
      }
    })();
    return () => { alive = false; };
  }, [router, clearAttempt, translate, t.locale]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.getElementById("hj-folio-top") ?? stageRef.current;
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [view]);

  function patchForm(patch: Partial<GuestForm>) {
    setForm(current => ({ ...current, ...patch }));
    setErrors(current => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function patchName(guestId: string, value: string) {
    setNames(current => ({ ...current, [guestId]: value }));
    setErrors(current => ({ ...current, names: "" }));
  }

  function jump(target: JourneyStep) {
    if (target < view) {
      setAlert(null);
      setStep(target);
    }
  }

  /** Guests are created here: new ones wait in Who Is Travelling until they are placed. */
  function changeCounts(nextAdults: number, nextChildren: number) {
    setAdults(nextAdults);
    setChildren(nextChildren);
    setArrangement(current => resizeParty(current, guests, nextAdults, nextChildren));
  }

  function changeArrangement(next: Arrangement) {
    setArrangement(next);
  }

  /** Arrange for me, in the cabin types the guest picked. A message when they cannot hold everyone. */
  function arrangeForMe(types: PhysicalRoomType[]): string | null {
    const next = autoArrange(guests, offers, types);
    if (!next) {
      return t.alerts.cannotFit(types.length, guests.length);
    }
    setArrangement(next);
    return null;
  }

  /** Re-reads availability and trims or rebuilds the arrangement for that sailing. */
  async function refreshForSailing(): Promise<{ fresh: Sailing; removed: PhysicalRoomType[] } | null> {
    const list = await loadSailings();
    setSailings(list);
    const fresh = list.find(entry => entry.scheduleId === scheduleId);
    if (!fresh) return null;
    const { next, removed } = fitToOffers(arrangement, offersFromTypes(fresh.types));
    setArrangement(next);
    return { fresh, removed };
  }

  const trimmedMessage = (removed: PhysicalRoomType[]) =>
    t.alerts.trimmed([...new Set(removed)].map(type => shortName(type)));

  async function enterGuestsSuites() {
    setBusy(true);
    setAlert(null);
    try {
      if (!scheduleId) throw new Error(t.alerts.chooseDateFirst);
      const result = await refreshForSailing();
      if (!result) throw new Error(t.alerts.sailingClosed);
      if (result.fresh.soldOut) throw new Error(t.alerts.sailingFull);
      if (result.removed.length > 0) setAlert(trimmedMessage(result.removed));
      setStep(2);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : t.alerts.unableToCheck);
    } finally {
      setBusy(false);
    }
  }

  /** Silent revalidation only; nothing is held until the request is sent. */
  async function continueToDetails() {
    if (issues.length > 0) return;
    setBusy(true);
    setAlert(null);
    try {
      const result = await refreshForSailing();
      if (!result) {
        setStep(1);
        throw new Error(t.alerts.sailingClosed);
      }
      if (result.removed.length > 0) throw new Error(trimmedMessage(result.removed));
      if (preferredRoomId) {
        if (!result.fresh.types.some(type => type.freeCabins.some(cabin => cabin.id === preferredRoomId))) {
          throw new Error(t.alerts.cabinClosed(preferredRoomId));
        }
        if (!rooms.some(room => room.roomId === preferredRoomId)) {
          throw new Error(t.alerts.placeInPreferred(preferredRoomId, true));
        }
      }
      setStep(3);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : t.alerts.unableToCheck);
    } finally {
      setBusy(false);
    }
  }

  /** Before a cabin type goes in the cart: is it still free on this sailing right now? */
  async function verifyCabinType(roomType: PhysicalRoomType): Promise<string | null> {
    try {
      const list = await loadSailings();
      setSailings(list);
      const fresh = list.find(entry => entry.scheduleId === scheduleId);
      if (!fresh) return t.alerts.closedNothingAdded;
      setArrangement(current => fitToOffers(current, offersFromTypes(fresh.types)).next);
      const type = fresh.types.find(entry => entry.roomType === roomType);
      if (!type || type.availableCabins === 0) return t.alerts.typeBooked(roomType);
      return null;
    } catch {
      return t.alerts.couldNotCheck;
    }
  }

  async function requestHold(key: string, requested: RequestedRoom[]): Promise<Hold> {
    return readJson<Hold>(
      await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ cruiseScheduleId: scheduleId, rooms: requested }),
      }),
      translate,
    );
  }

  /** Gives a hold back at once. Returns the booking's status, or null if unknown. */
  async function releaseHold(target: Hold): Promise<string | null> {
    try {
      const result = await readJson<{ status: string }>(
        await fetch("/api/bookings/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: target.bookingId, accessToken: target.accessToken }),
        }),
        translate,
      );
      return result.status;
    } catch {
      return null;
    }
  }

  function detailsProblems(): Record<string, string> {
    const found: Record<string, string> = {};
    const e = t.details.errors;
    if (!form.firstName.trim()) found.firstName = e.firstName;
    if (!form.lastName.trim()) found.lastName = e.lastName;
    if (!EMAIL.test(form.email.trim())) found.email = e.email;
    if (!form.countryCode) found.country = e.country;
    if (!PHONE.test(phoneToSend)) {
      found.phone = form.countryCode ? e.phone : e.phoneNoCountry;
    }
    const unnamed = cabins.flatMap(cabin =>
      cabin.guests.filter(guest => !(names[guest.id] ?? "").trim()).map(guest => `${guestLabel(guest, t)} (${cabin.label})`),
    );
    if (unnamed.length > 0) {
      found.names = e.names(t.joinAnd(unnamed));
    }
    if (!form.termsAccepted) found.terms = e.terms;
    return found;
  }

  /** The missing details in one sentence, so the guest knows exactly what to add. */
  function detailsReminder(found: Record<string, string>): string | null {
    const unnamed = guests.filter(guest => !(names[guest.id] ?? "").trim());
    const r = t.details.reminder;
    const parts = [
      found.firstName ? r.firstName : "",
      found.lastName ? r.lastName : "",
      found.email ? r.email : "",
      found.country ? r.country : "",
      found.phone ? (form.countryCode ? r.phoneValid : r.phone) : "",
      found.names ? r.names(unnamed.length, guestList(unnamed, t)) : "",
      found.terms ? r.terms : "",
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return `${REMIND}${parts.join("; ")}.`;
  }

  async function confirmRequest() {
    if (!sailing) return;
    if (preferredRoomId && !rooms.some(room => room.roomId === preferredRoomId)) {
      setAlert(t.alerts.placeInPreferred(preferredRoomId, false));
      setStep(2);
      return;
    }
    const found = detailsProblems();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAlert(detailsReminder(found));
      revealMissingField();
      return;
    }
    if (issues.length > 0) {
      setAlert(issues[0]);
      setStep(2);
      return;
    }

    setBusy(true);
    setAlert(null);
    const shownTotal = totalCents;

    // A hold kept from before a reload, for a selection since changed, goes back first.
    if (attempt?.hold && attempt.signature !== signature) {
      await releaseHold(attempt.hold);
      clearAttempt();
      setAttempt(null);
    }
    const reuse = attempt && attempt.signature === signature && attempt.hold?.status === "PENDING_HOLD" ? attempt : null;
    let current: Attempt = reuse ?? { key: crypto.randomUUID(), signature, duration, scheduleId, adults, children, arrangement };
    let held: Hold | null = null;

    try {
      // The cabins are held only now, with the guest's details already complete.
      held = await requestHold(current.key, rooms);
      if (["REQUESTED", "CONFIRMED"].includes(held.status)) {
        clearAttempt();
        router.push(successUrl(held.bookingId, held.accessToken, t.locale));
        return;
      }

      current = { ...current, hold: held };
      saveAttempt(current);
      setAttempt(current);

      if (shownTotal !== null && held.totalPriceCents !== shownTotal) {
        await releaseHold(held);
        clearAttempt();
        setAttempt(null);
        await refreshForSailing().catch(() => null);
        setAlert(t.alerts.totalChanged(t.money(held.totalPriceCents)));
        setBusy(false);
        return;
      }

      const specialRequests = [
        form.dietary.trim() ? `Dietary requirements: ${form.dietary.trim()}` : "",
        form.transfers.trim() ? `Arrival and transfers: ${form.transfers.trim()}` : "",
        form.requests.trim() ? `Special requests: ${form.requests.trim()}` : "",
      ].filter(Boolean).join("\n").slice(0, 2000);

      const result = await readJson<{ bookingId: string; accessToken: string }>(
        await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": current.key },
          body: JSON.stringify({
            bookingId: held.bookingId,
            accessToken: held.accessToken,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: phoneToSend,
            country: form.country.trim(),
            paymentMethod: form.paymentMethod,
            specialRequests,
            marketingOptIn: form.marketingOptIn,
            termsAccepted: true,
            passengers: passengersPayload(arrangement, guests, names),
          }),
        }),
        translate,
      );
      clearAttempt();
      router.push(successUrl(result.bookingId, result.accessToken, t.locale));
    } catch (error) {
      if (held) {
        // Never leave cabins blocked by a request that did not go through. If the
        // request actually arrived (a dropped reply), the release says so.
        const status = await releaseHold(held);
        if (status === "REQUESTED" || status === "CONFIRMED") {
          clearAttempt();
          router.push(successUrl(held.bookingId, held.accessToken, t.locale));
          return;
        }
        clearAttempt();
        setAttempt(null);
      }
      if (error instanceof RequestFailed && error.status === 409) {
        const refreshed = await refreshForSailing().catch(() => null);
        setStep(2);
        setAlert(
          refreshed && refreshed.removed.length > 0
            ? trimmedMessage(refreshed.removed)
            : t.alerts.cabinTaken,
        );
      } else {
        const reason = error instanceof Error ? error.message : t.alerts.notSent;
        setAlert(t.alerts.sendFailed(reason));
      }
      setBusy(false);
    }
  }

  const leadDone = Boolean(form.firstName.trim() && form.lastName.trim() && EMAIL.test(form.email.trim())
    && form.countryCode && PHONE.test(phoneToSend));
  const namesDone = guests.every(guest => (names[guest.id] ?? "").trim());

  /* ---------- phone and tablet: the step map as tabs, the summary cards and the bar ---------- */

  // On a small screen an alert is far above the bar the guest pressed. A missing
  // field is shown by the bar itself (see the details bar below), not the alert.
  useRevealOnPhone(".hj-alert", alert?.startsWith(REMIND) ? null : alert);
  function revealMissingField() {
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        const missing = document.querySelector(".hj-field--invalid, .hj-details .hj-error");
        reveal(missing, "center");
        // The first field still to fill takes the cursor, so the guest can type straight away.
        const field = document.querySelector<HTMLElement>(".hj-field--invalid input, .hj-field--invalid textarea");
        field?.focus({ preventScroll: true });
      }),
    );
  }

  /** The lowest open cabin rate: for the chosen sailing, or across the dates on offer. */
  const fromCents = useMemo(() => {
    const pool = sailing ? [sailing] : sailings;
    const rates = pool.flatMap(entry => entry.types.filter(type => type.availableCabins > 0).map(type => type.priceCents));
    return rates.length > 0 ? Math.min(...rates) : null;
  }, [sailing, sailings]);
  const waitingCount = unplacedGuests(arrangement, guests).length;
  const namedCount = guests.filter(guest => (names[guest.id] ?? "").trim()).length;
  const methodLabel = t.details.methodShort(form.paymentMethod === "BANK_TRANSFER");
  const j = t.journey;
  const dt = t.details;

  const mapTabs: SectionTab[] =
    view === 1
      ? [
          { id: "hj-m-route", label: j.tabs.voyage, icon: <IconMap />, status: t.nights(voyage.nights), done: true },
          { id: "hj-m-dates", label: j.tabs.date, icon: <IconCalendar />, status: sailing ? t.shortDate(sailing.departureTime) : j.tabs.toChoose, done: Boolean(scheduleId) },
          { id: "hj-m-summary", label: j.tabs.review, icon: <IconReceipt />, status: j.tabs.nothingHeld, done: false },
        ]
      : view === 2
        ? [
            { id: "hj-party", label: t.suites.tabs.guests, icon: <IconGuests />, status: t.partyLine(adults, children).replace(" · ", ", "), done: guests.length > 0 },
            {
              id: "hj-cabins",
              label: t.suites.tabs.cabins,
              icon: <IconBed />,
              status: issues.length === 0 ? t.cabins(cabins.length) : waitingCount > 0 ? t.suites.tabs.placed(guests.length - waitingCount, guests.length) : t.suites.tabs.checkCabin,
              done: issues.length === 0,
            },
            { id: "hj-m-summary", label: j.tabs.review, icon: <IconReceipt />, status: j.tabs.nothingHeld, done: false },
          ]
        : [
            { id: "hj-m-lead", label: dt.tabs.lead, icon: <IconLead />, status: leadDone ? dt.tabs.complete : dt.tabs.yourDetails, done: leadDone },
            { id: "hj-m-passengers", label: dt.tabs.passengers, icon: <IconGuests />, status: dt.tabs.named(namedCount, guests.length), done: namesDone },
            { id: "hj-m-payment", label: dt.tabs.payment, icon: <IconCard />, status: form.termsAccepted ? dt.tabs.withTerms(methodLabel) : methodLabel, done: form.termsAccepted },
            { id: "hj-m-summary", label: dt.tabs.review, icon: <IconReceipt />, status: dt.tabs.thenConfirm, done: false },
          ];

  const summary = (
    <ReviewCards
      id="hj-m-summary"
      title={view === 3 ? dt.reviewTitle : dt.soFarTitle}
      lede={view === 3 ? dt.reviewLede : dt.soFarLede}
      duration={duration}
      sailing={sailing}
      adults={adults}
      childCount={children}
      cabins={cabins}
      totalCents={totalCents}
      step={view}
      onJump={jump}
      payment={
        view === 3
          ? {
              label: dt.methodLong(form.paymentMethod === "BANK_TRANSFER"),
              sub: dt.paymentSub,
              onEdit: () => reveal("#hj-m-payment"),
            }
          : null
      }
    />
  );

  const partySub = `${t.partyLine(adults, children)} · ${t.nights(voyage.nights)}`;
  const totalLabel = t.rail.total(cabins.length);
  /** The bar's "Place guests" / "Check cabins": to the cabins, or to the cabin that needs an adult. */
  const showWarning = () =>
    waitingCount > 0 ? reveal("#hj-cabins") : reveal(document.querySelector(".hj-cabin-card--warn") ?? "#hj-cabins", "center");

  const scene = { "--hj-scene": `url("${voyage.image}")` } as CSSProperties;
  const rail = (
    <VoyageRail
      duration={duration}
      sailing={sailing}
      adults={adults}
      childCount={children}
      cabins={cabins}
      totalCents={totalCents}
      step={view}
      onJump={jump}
    />
  );

  return (
    <div className={`hj hj--step-${view}`} style={scene}>
      <div className="hj-folio" id="hj-folio-top" ref={stageRef}>
        {view === 1 ? (
          <StepBanner
            step={1}
            kicker={j.kicker}
            title={j.title}
            lede={j.lede}
            quote={j.quote}
          />
        ) : null}
        {view === 3 ? (
          <StepBanner
            step={3}
            kicker={dt.kicker}
            title={dt.title}
            lede={dt.lede}
            quote={dt.quote}
          />
        ) : null}
        <MobileBack step={view} onJump={jump} />
        <JourneyProgress step={view} onJump={jump} />
        {/* The step's map: the same bar, in the same place, on every step. */}
        <div className="hj-guidebar">
          <StepGuide
            items={
              view === 1
                ? [
                    { ...j.guide[0], done: true },
                    { ...j.guide[1], done: Boolean(scheduleId) },
                    { ...j.guide[2], done: false },
                  ]
                : view === 2
                  ? [
                      { ...t.suites.guide[0], done: guests.length > 0 },
                      { ...t.suites.guide[1], done: issues.length === 0 },
                      { ...t.suites.guide[2], done: false },
                    ]
                  : [
                      { ...dt.guide[0], done: leadDone },
                      { ...dt.guide[1], done: namesDone },
                      { ...dt.guide[2], done: form.termsAccepted },
                      { ...dt.guide[3], done: false },
                    ]
            }
          />
        </div>
        <SectionTabs items={mapTabs} />

        {view === 1 ? (
          <div className="hj-stage">
            <section className="hj-panel">
              {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
              <PanelHead step={1} title={j.title} lede={j.lede} />

              <span className="hj-step-label" id="hj-m-route">{t.voyage.chooseItinerary}</span>
              <VoyagePicker value={duration} onChange={next => { setDuration(next); setScheduleId(""); setPreferredRoomId(null); }} />
              {preferredRoomId ? <div className="hj-map-choice" role="status"><span>{j.mapChoice(preferredRoomId)}</span><button type="button" onClick={() => setPreferredRoomId(null)}>{j.chooseFreely}</button></div> : null}
              <div className="hj-mplan" id="hj-m-dates">
                <span className="hj-step-label">{j.yourDeparture}</span>
                <PlanTiles
                  sailing={sailing}
                  loading={loadingSailings}
                  adults={adults}
                  childCount={children}
                  onDates={() => setSheet("dates")}
                  onGuests={() => setSheet("guests")}
                />
              </div>

              <div className="hj-plan">
                <SailingCalendar
                  sailings={sailings}
                  loading={loadingSailings}
                  departureDay={voyage.departureDay.replace(/s$/, "")}
                  selectedId={scheduleId}
                  onSelect={setScheduleId}
                />
                <ItineraryAccordion duration={duration} />
              </div>

              <p className="hj-dates-help">
                <span aria-hidden>✦</span>
                <span>
                  {j.datesHelp}{" "}
                  <Link href={localizedHref("/contact", t.locale)}>{j.datesHelpLink}</Link>.
                </span>
              </p>

              <JourneyBand />
              <div className="hj-actions">
                <span className="hj-actions__hint">
                  {sailing ? `${voyage.title} · ${t.folioRange(sailing.departureTime, sailing.arrivalTime)}` : j.chooseToContinue}
                </span>
                <button type="button" className="hj-btn" disabled={!scheduleId || busy} onClick={() => void enterGuestsSuites()}>
                  {busy ? j.checking : j.continueLong} <span aria-hidden>→</span>
                </button>
              </div>
              {!scheduleId ? <p className="hj-note">{j.chooseToContinue}</p> : null}
            </section>
            {rail}
            {summary}
            <ActionBar
              label={sailing ? j.departs(t.shortDate(sailing.departureTime)) : voyage.title}
              amount={fromCents === null ? (loadingSailings ? j.loadingDates : j.noOpenDates) : t.calendar.from(t.money(fromCents))}
              sub={fromCents === null ? voyage.route : j.perCabin}
              action={scheduleId ? j.continueShort : j.chooseDate}
              ariaLabel={scheduleId ? j.continueLong : j.chooseDepartureDate}
              busy={busy}
              busyLabel={j.checkingShort}
              onAction={() => (scheduleId ? void enterGuestsSuites() : setSheet("dates"))}
            />
            <DateSheet
              open={sheet === "dates"}
              onClose={() => setSheet(null)}
              sailings={sailings}
              loading={loadingSailings}
              departureDay={voyage.departureDay.replace(/s$/, "")}
              voyageTitle={`${voyage.title} · ${voyage.route}`}
              selectedId={scheduleId}
              onApply={setScheduleId}
            />
            <GuestsSheet
              open={sheet === "guests"}
              onClose={() => setSheet(null)}
              adults={adults}
              childCount={children}
              onCounts={changeCounts}
            />
          </div>
        ) : null}

        {view === 2 && sailing ? (
          <div className="hj-stage hj-stage--suites">
            <GuestsSuitesScreen
              duration={duration}
              sailing={sailing}
              sailingDate={sailing.departureTime.slice(0, 10)}
              offers={offers}
              guests={guests}
              adults={adults}
              childCount={children}
              onCounts={changeCounts}
              arrangement={arrangement}
              onArrangement={changeArrangement}
              onArrange={arrangeForMe}
              preferredType={preferred}
              preferredRoomId={preferredRoomId}
              onReleasePreferredRoom={() => setPreferredRoomId(null)}
              issues={issues}
              alert={alert}
              busy={busy}
              onBack={() => jump(1)}
              onContinue={() => void continueToDetails()}
              verifyCabinType={verifyCabinType}
              rail={<>{rail}{summary}</>}
              mobileBar={
                <ActionBar
                  label={totalLabel}
                  amount={totalCents === null ? t.suites.noCabinYet : t.money(totalCents)}
                  sub={partySub}
                  note={issues.length > 0 && waitingCount === 0 ? issues[0] : null}
                  action={issues.length === 0 ? j.continueShort : waitingCount > 0 ? t.suites.placeGuests : t.suites.checkCabins}
                  ariaLabel={issues.length === 0 ? t.suites.continueDetailsLabel : undefined}
                  busy={busy}
                  busyLabel={j.checkingShort}
                  onAction={() => (issues.length === 0 ? void continueToDetails() : showWarning())}
                />
              }
            />
          </div>
        ) : null}

        {view === 3 && sailing ? (
          <div className="hj-stage">
            <section className="hj-panel">
              <PanelHead step={3} title={dt.panelTitle} lede={dt.panelLede} />
              {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
              <DetailsPaymentScreen
                cabins={cabins}
                schedule={schedule}
                form={form}
                onForm={patchForm}
                names={names}
                onName={patchName}
                errors={errors}
                busy={busy}
                onBack={() => jump(2)}
                onConfirm={() => void confirmRequest()}
              />
              {summary}
            </section>
            {rail}
            <ActionBar
              label={totalLabel}
              amount={totalCents === null ? "—" : t.money(totalCents)}
              sub={partySub}
              action={dt.barConfirm}
              busy={busy}
              busyLabel={dt.barSending}
              onAction={() => {
                void confirmRequest();
                revealMissingField();
              }}
            />
          </div>
        ) : null}

        {view === 1 || sailing ? (
          <VoyageBar
            key={view}
            duration={duration}
            sailing={sailing}
            adults={adults}
            childCount={children}
            cabins={cabins}
            totalCents={totalCents}
            pendingTotal={view === 1 ? (fromCents === null ? j.chooseDate : t.calendar.from(t.money(fromCents))) : t.suites.placeYourGuests}
            onEdit={view > 1 ? () => jump((view - 1) as JourneyStep) : undefined}
            details={rail}
            busy={busy}
            {...(view === 1
              ? {
                  label: j.continueShort,
                  ariaLabel: j.barContinueLabel,
                  busyLabel: j.checkingShort,
                  blocker: scheduleId ? null : j.blocker,
                  onContinue: () => void enterGuestsSuites(),
                  onBlocked: () => reveal(".hj-cal", "center"),
                }
              : view === 2
                ? {
                    label: j.continueShort,
                    ariaLabel: t.suites.barContinueLabel,
                    busyLabel: j.checkingShort,
                    blocker: placementReminder(arrangement, guests, t),
                    onContinue: () => void continueToDetails(),
                    onBlocked: showWarning,
                  }
                : {
                    label: dt.barConfirm,
                    ariaLabel: dt.barConfirmLabel,
                    busyLabel: dt.sendingShort,
                    blocker: detailsReminder(detailsProblems()),
                    onContinue: () => void confirmRequest(),
                    onBlocked: () => void confirmRequest(),
                  })}
          />
        ) : null}
        <ScrollCue />
      </div>
    </div>
  );
}
