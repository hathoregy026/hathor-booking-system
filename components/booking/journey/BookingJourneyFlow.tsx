"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { itineraryFor } from "@/lib/booking-itineraries";
import { paymentSchedule } from "@/lib/payment-schedule";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType, RequestedRoom } from "@/lib/physical-inventory";
import { JourneyProgress, PanelHead, StepGuide, type JourneyStep } from "./JourneyChrome";
import { ItineraryAccordion, VoyagePicker } from "./ItineraryPanel";
import { SailingCalendar } from "./SailingCalendar";
import { GuestsSuitesScreen } from "./GuestsSuites";
import { VoyageRail } from "./VoyageRail";
import { DetailsPaymentScreen } from "./GuestDetails";
import {
  EMPTY_ARRANGEMENT,
  arrangementIssues,
  arrangementTotal,
  autoArrange,
  cabinViews,
  fitToOffers,
  guestsFor,
  offersFromTypes,
  passengersPayload,
  resizeParty,
  roomsPayload,
  shortName,
  type Arrangement,
} from "./allocation";
import { findCountry } from "@/lib/countries";
import {
  STORAGE_KEY,
  emptyGuestForm,
  internationalPhone,
  longDate,
  money,
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

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new RequestFailed(data.details?.formErrors?.[0] ?? data.error ?? "Please try again.", response.status);
  }
  return data as T;
}

/** Where the journey starts: a room page, or the cart with its saved sailing and party. */
export type JourneyStart = {
  duration: StayDurationValue;
  roomType: PhysicalRoomType | null;
  sailingDate?: string | null;
  adults?: number | null;
  children?: number | null;
};

const successUrl = (bookingId: string, token: string) =>
  `/booking/success?bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`;

export function BookingJourneyFlow({ start }: { start: JourneyStart | null }) {
  const router = useRouter();
  const [duration, setDuration] = useState<StayDurationValue>(start?.duration ?? "7-nights-luxor-aswan-luxor");
  const [adults, setAdults] = useState(start?.adults ?? 2);
  const [children, setChildren] = useState(start?.children ?? 0);
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loadingSailings, setLoadingSailings] = useState(true);
  const [scheduleId, setScheduleId] = useState("");
  const [arrangement, setArrangement] = useState<Arrangement>(EMPTY_ARRANGEMENT);
  const [step, setStep] = useState<JourneyStep>(1);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [form, setForm] = useState<GuestForm>(emptyGuestForm);
  const [names, setNames] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const restored = useRef(false);
  /** A sailing date handed over by the cart, applied once the dates load. */
  const pendingSailingDate = useRef(start?.sailingDate ?? null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const voyage = itineraryFor(duration);
  const preferred = start?.roomType ?? null;
  const sailing = useMemo(() => sailings.find(entry => entry.scheduleId === scheduleId) ?? null, [sailings, scheduleId]);
  const offers = useMemo(() => (sailing ? offersFromTypes(sailing.types) : {}), [sailing]);
  const guests = useMemo(() => guestsFor(adults, children), [adults, children]);
  const cabins = useMemo(() => cabinViews(arrangement, guests, offers), [arrangement, guests, offers]);
  const issues = useMemo(() => arrangementIssues(arrangement, guests), [arrangement, guests]);
  const rooms = useMemo(() => roomsPayload(arrangement, guests), [arrangement, guests]);
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
    );
    return data.sailings;
  }, [duration]);

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
            setAlert(`The sailing in your cart (${longDate(`${wanted}T00:00:00.000Z`)}) is no longer open. Please choose another date.`);
            return;
          }
          setScheduleId(match.scheduleId);
          // The cabin chosen in the cart is the guest's own choice: place the party in that type
          // when it fits. Otherwise everyone waits in Who Is Travelling to be placed.
          if (start?.roomType) {
            const startGuests = guestsFor(start.adults ?? 2, start.children ?? 0);
            setArrangement(autoArrange(startGuests, offersFromTypes(match.types), [start.roomType]) ?? EMPTY_ARRANGEMENT);
          }
          setStep(2);
        })
        .catch(error => { if (!controller.signal.aborted) setAlert(error instanceof Error ? error.message : "Availability is unavailable."); })
        .finally(() => { if (!controller.signal.aborted) setLoadingSailings(false); });
    }, 150);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [loadSailings, start]);

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
        );
        if (!alive) return;
        if (["REQUESTED", "CONFIRMED"].includes(current.status)) {
          clearAttempt();
          router.replace(successUrl(saved.hold.bookingId, saved.hold.accessToken));
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
  }, [router, clearAttempt]);

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
      return `${types.length === 1 ? "That cabin type" : "Those cabin types"} cannot take all ${guests.length} guests on this date. Choose another type as well.`;
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
    `A ${[...new Set(removed)].map(type => shortName(type)).join(" and ")} you chose was just booked by another guest. Its guests are waiting in Who Is Travelling — please place them again.`;

  async function enterGuestsSuites() {
    setBusy(true);
    setAlert(null);
    try {
      if (!scheduleId) throw new Error("Choose one of the open sailing dates first.");
      const result = await refreshForSailing();
      if (!result) throw new Error("That sailing has just closed. Please choose another date.");
      if (result.fresh.soldOut) throw new Error("This sailing is fully booked. Please choose another date.");
      if (result.removed.length > 0) setAlert(trimmedMessage(result.removed));
      setStep(2);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Unable to check availability.");
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
        throw new Error("That sailing has just closed. Please choose another date.");
      }
      if (result.removed.length > 0) throw new Error(trimmedMessage(result.removed));
      setStep(3);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Unable to check availability.");
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
      if (!fresh) return "This sailing has just closed, so nothing was added to your cart.";
      setArrangement(current => fitToOffers(current, offersFromTypes(fresh.types)).next);
      const type = fresh.types.find(entry => entry.roomType === roomType);
      if (!type || type.availableCabins === 0) return `${roomType} was just booked on this sailing, so it was not added to your cart.`;
      return null;
    } catch {
      return "We could not check availability just now, so nothing was added. Please try again.";
    }
  }

  async function requestHold(key: string, requested: RequestedRoom[]): Promise<Hold> {
    return readJson<Hold>(
      await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ cruiseScheduleId: scheduleId, rooms: requested }),
      }),
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
      );
      return result.status;
    } catch {
      return null;
    }
  }

  function detailsProblems(): Record<string, string> {
    const found: Record<string, string> = {};
    if (!form.firstName.trim()) found.firstName = "Please enter the lead guest first name.";
    if (!form.lastName.trim()) found.lastName = "Please enter the lead guest last name.";
    if (!EMAIL.test(form.email.trim())) found.email = "Please enter a valid email address.";
    if (!form.countryCode) found.country = "Please choose your country.";
    if (!PHONE.test(phoneToSend)) {
      found.phone = form.countryCode
        ? "Please check the phone number."
        : "Choose your country first, then enter your number.";
    }
    if (guests.some(guest => !(names[guest.id] ?? "").trim())) found.names = "Please give a name for every travelling guest.";
    if (!form.termsAccepted) found.terms = "Please accept the booking and cancellation terms.";
    return found;
  }

  async function confirmRequest() {
    if (!sailing) return;
    const found = detailsProblems();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAlert("Please complete the highlighted details.");
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
        router.push(successUrl(held.bookingId, held.accessToken));
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
        setAlert(`The voyage total for these cabins is now ${money(held.totalPriceCents)}. Please check it and press Confirm request again.`);
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
      );
      clearAttempt();
      router.push(successUrl(result.bookingId, result.accessToken));
    } catch (error) {
      if (held) {
        // Never leave cabins blocked by a request that did not go through. If the
        // request actually arrived (a dropped reply), the release says so.
        const status = await releaseHold(held);
        if (status === "REQUESTED" || status === "CONFIRMED") {
          clearAttempt();
          router.push(successUrl(held.bookingId, held.accessToken));
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
            : "One of your cabins was just booked by another guest. Availability has been updated. Please check your cabins and try again.",
        );
      } else {
        const reason = error instanceof Error ? error.message : "Your request could not be sent.";
        setAlert(`${reason} Nothing is being held for you, so pressing Confirm request again starts a fresh request.`);
      }
      setBusy(false);
    }
  }

  const leadDone = Boolean(form.firstName.trim() && form.lastName.trim() && EMAIL.test(form.email.trim())
    && form.countryCode && PHONE.test(phoneToSend));
  const namesDone = guests.every(guest => (names[guest.id] ?? "").trim());

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
    <div className="hj" style={scene}>
      <div className="hj-folio" id="hj-folio-top" ref={stageRef}>
        <JourneyProgress step={view} onJump={jump} />

        {view === 1 ? (
          <div className="hj-stage">
            <section className="hj-panel">
              {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
              <PanelHead step={1} title="Plan Your Journey" lede="Three extraordinary voyages. One timeless river." />
              <StepGuide
                items={[
                  { label: "Choose your voyage", hint: "3, 4 or 7 nights on the Nile", done: true },
                  { label: "Pick a sailing date", hint: "Open departures are marked", done: Boolean(scheduleId) },
                  { label: "Continue to guests & suites", hint: "Nothing is held yet", done: false },
                ]}
              />

              <span className="hj-step-label">Choose your itinerary</span>
              <VoyagePicker value={duration} onChange={next => { setDuration(next); setScheduleId(""); }} />

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
                  Need a different date? If you cannot find your preferred sailing,{" "}
                  <Link href="/contact">contact Hathor Reservations</Link>.
                </span>
              </p>

              <div className="hj-actions">
                <span />
                <button type="button" className="hj-btn" disabled={!scheduleId || busy} onClick={() => void enterGuestsSuites()}>
                  {busy ? "Checking availability…" : "Continue to guests & suites"} <span aria-hidden>→</span>
                </button>
              </div>
              {!scheduleId ? <p className="hj-note">Choose a sailing date to continue.</p> : null}
            </section>
            {rail}
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
              issues={issues}
              alert={alert}
              busy={busy}
              onBack={() => jump(1)}
              onContinue={() => void continueToDetails()}
              verifyCabinType={verifyCabinType}
              guide={
                <StepGuide
                  items={[
                    { label: "Set who is travelling", hint: "Adults and children", done: guests.length > 0 },
                    { label: "Place every guest in a cabin", hint: "Drag, tap, or use the menus", done: issues.length === 0 },
                    { label: "Continue to details", hint: "Nothing is held yet", done: false },
                  ]}
                />
              }
              rail={rail}
            />
          </div>
        ) : null}

        {view === 3 && sailing ? (
          <div className="hj-stage">
            <section className="hj-panel">
              <PanelHead step={3} title="Guest Details & Payment Preference" lede="Almost there. Please provide your details and choose your preferred payment method." />
              <StepGuide
                items={[
                  { label: "Lead guest details", hint: "Name, email, phone, country", done: leadDone },
                  { label: "Passenger names", hint: "As shown in passports", done: namesDone },
                  { label: "Payment preference & terms", hint: "No card details needed", done: form.termsAccepted },
                  { label: "Confirm request", hint: "Your cabins are reserved as you send", done: false },
                ]}
              />
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
            </section>
            {rail}
          </div>
        ) : null}
      </div>
    </div>
  );
}
