"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCountdown, getRemainingSeconds } from "@/lib/client-dates";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { JourneyBand, JourneyProgress, PageHead, PanelHead, type JourneyStep } from "./JourneyChrome";
import { ItineraryAccordion, VoyagePicker } from "./ItineraryPanel";
import { SailingCalendar } from "./SailingCalendar";
import { CabinCards, CabinPriceList } from "./CabinSelection";
import { VoyageRail } from "./VoyageRail";
import { GuestDetailsScreen } from "./GuestDetails";
import { ReviewScreen } from "./ReviewRequest";
import {
  MAX_CABINS,
  STORAGE_KEY,
  distributeParty,
  emptyGuestForm,
  partyProblem,
  partySummary,
  passengersFor,
  plural,
  rangeLabel,
  type Attempt,
  type GuestForm,
  type Hold,
  type Party,
  type Sailing,
} from "./model";

const PHONE = /^\+[1-9][0-9]{6,14}$/;

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new Error(data.details?.formErrors?.[0] ?? data.error ?? "Please try again.");
  return data as T;
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hj-counter">
      <span className="hj-counter__label">{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <button
          type="button"
          className="hj-counter__btn"
          aria-label={`One fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <output className="hj-counter__value">{value}</output>
        <button
          type="button"
          className="hj-counter__btn"
          aria-label={`One more ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </span>
    </div>
  );
}

export type JourneyStart = { duration: StayDurationValue; roomType: PhysicalRoomType | null };

export function BookingJourneyFlow({ start }: { start: JourneyStart | null }) {
  const router = useRouter();
  const [duration, setDuration] = useState<StayDurationValue>(start?.duration ?? "7-nights-luxor-aswan-luxor");
  const [party, setParty] = useState<Party>({ adults: 2, children: 0, cabins: 1 });
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [loadingSailings, setLoadingSailings] = useState(true);
  const [scheduleId, setScheduleId] = useState("");
  const [roomType, setRoomType] = useState<PhysicalRoomType | null>(start?.roomType ?? null);
  const [step, setStep] = useState<JourneyStep>(1);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [form, setForm] = useState<GuestForm>(emptyGuestForm);
  const [names, setNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const restored = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const voyage = itineraryFor(duration);
  const hold = attempt?.hold ?? null;
  const sailing = useMemo(() => sailings.find(entry => entry.scheduleId === scheduleId) ?? null, [sailings, scheduleId]);
  const problem = partyProblem(party);

  const saveAttempt = useCallback((next: Attempt) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  }, []);
  const clearAttempt = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
  }, []);

  /** Availability for the chosen voyage and party — the one authoritative read. */
  const loadSailings = useCallback(async (signal?: AbortSignal): Promise<Sailing[]> => {
    const params = new URLSearchParams({
      mode: "request",
      duration,
      adults: String(party.adults),
      children: String(party.children),
      rooms: String(party.cabins),
    });
    const data = await readJson<{ sailings: Sailing[] }>(
      await fetch(`/api/booking/availability?${params.toString()}`, { cache: "no-store", signal }),
    );
    return data.sailings;
  }, [duration, party.adults, party.children, party.cabins]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoadingSailings(true);
      loadSailings(controller.signal)
        .then(list => {
          setSailings(list);
          setScheduleId(current => (list.some(entry => entry.scheduleId === current) ? current : ""));
        })
        .catch(error => { if (!controller.signal.aborted) setAlert(error instanceof Error ? error.message : "Availability is unavailable."); })
        .finally(() => { if (!controller.signal.aborted) setLoadingSailings(false); });
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [loadSailings]);

  /** Bring a guest back to an unfinished request instead of starting a second one. */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let alive = true;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as Attempt;
        if (!saved?.key || !saved.hold) return;
        const current = await readJson<Hold>(
          await fetch(`/api/bookings/${encodeURIComponent(saved.hold.bookingId)}`, {
            headers: { Authorization: `Bearer ${saved.hold.accessToken}` },
            cache: "no-store",
          }),
        );
        if (!alive) return;
        if (["REQUESTED", "CONFIRMED"].includes(current.status)) {
          clearAttempt();
          router.replace(`/booking/success?bookingId=${encodeURIComponent(saved.hold.bookingId)}&token=${encodeURIComponent(saved.hold.accessToken)}`);
          return;
        }
        if (current.status !== "PENDING_HOLD") { clearAttempt(); return; }
        setDuration(saved.duration);
        setParty(saved.party);
        setScheduleId(saved.scheduleId);
        setRoomType(saved.roomType);
        setNames(passengersFor(saved.party).map(() => ""));
        setAttempt({ ...saved, hold: { ...saved.hold, ...current, accessToken: saved.hold.accessToken } });
        setStep(3);
      } catch {
        clearAttempt();
      }
    })();
    return () => { alive = false; };
  }, [router, clearAttempt]);

  /** Each screen starts at its own beginning, not halfway down the last one. */
  useEffect(() => {
    if (step === 1) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Land on the band, not the stage: the band carries the running summary and
    // its own scroll-margin clears the fixed site header, so the new screen's
    // title always arrives fully visible.
    const target = document.getElementById("hj-band-top") ?? stageRef.current;
    target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [step]);

  /** Hold countdown on the later screens. */
  useEffect(() => {
    if (!hold?.holdExpiresAt || step < 3) return;
    const timer = setInterval(() => setTick(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [hold?.holdExpiresAt, step]);

  const secondsLeft = hold?.holdExpiresAt ? getRemainingSeconds(hold.holdExpiresAt) : 0;
  void tick;

  function patchForm(patch: Partial<GuestForm>) {
    setForm(current => ({ ...current, ...patch }));
    setErrors(current => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function patchName(index: number, value: string) {
    setNames(current => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    setErrors(current => ({ ...current, names: "" }));
  }

  function changeParty(patch: Partial<Party>) {
    setParty(current => ({ ...current, ...patch }));
    setRoomType(null);
    setStep(1);
  }

  async function checkAvailability() {
    setBusy(true);
    setAlert(null);
    try {
      if (!scheduleId) throw new Error("Choose one of the open sailing dates first.");
      if (problem) throw new Error(problem);
      const list = await loadSailings();
      setSailings(list);
      const fresh = list.find(entry => entry.scheduleId === scheduleId);
      if (!fresh) throw new Error("That sailing has just closed. Please choose another date.");
      if (fresh.soldOut) throw new Error("This sailing is fully booked. Please choose another date.");
      setStep(2);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Unable to check availability.");
    } finally {
      setBusy(false);
    }
  }

  /** Silent revalidation, then the physical cabin hold from the existing engine. */
  async function holdCabins() {
    if (!roomType || !sailing) return;
    setBusy(true);
    setAlert(null);
    try {
      const list = await loadSailings();
      setSailings(list);
      const fresh = list.find(entry => entry.scheduleId === sailing.scheduleId);
      const type = fresh?.types.find(entry => entry.roomType === roomType);
      if (!fresh || !type || type.status !== "AVAILABLE") {
        setStep(2);
        throw new Error("That cabin has just been taken. Please choose another cabin or sailing.");
      }

      const key = attempt && attempt.scheduleId === sailing.scheduleId && attempt.roomType === roomType && attempt.party.cabins === party.cabins
        ? attempt.key
        : crypto.randomUUID();
      const rooms = distributeParty(party).map(cabin => ({ roomType, adults: cabin.adults, children: cabin.children }));
      const next: Attempt = { key, duration, scheduleId: sailing.scheduleId, roomType, party };
      saveAttempt(next);

      const held = await readJson<Hold>(
        await fetch("/api/bookings/hold", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": key },
          body: JSON.stringify({ cruiseScheduleId: sailing.scheduleId, rooms }),
        }),
      );

      if (["REQUESTED", "CONFIRMED"].includes(held.status)) {
        clearAttempt();
        router.push(`/booking/success?bookingId=${encodeURIComponent(held.bookingId)}&token=${encodeURIComponent(held.accessToken)}`);
        return;
      }

      const withHold = { ...next, hold: held };
      saveAttempt(withHold);
      setAttempt(withHold);
      setNames(passengersFor(party).map(() => ""));
      setStep(3);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Your cabin could not be held.");
    } finally {
      setBusy(false);
    }
  }

  async function continueToReview() {
    if (!hold) return;
    const found: Record<string, string> = {};
    if (!form.firstName.trim()) found.firstName = "Please enter the lead guest first name.";
    if (!form.lastName.trim()) found.lastName = "Please enter the lead guest last name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) found.email = "Please enter a valid email address.";
    if (!PHONE.test(form.phone.replace(/[\s()-]/g, ""))) found.phone = "Use an international number, for example +20 10 1234 5678.";
    if (form.country.trim().length < 2) found.country = "Please enter your country.";
    if (names.length === 0 || names.some(name => !name.trim())) found.names = "Please give a name for every travelling guest.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setAlert(null);
    try {
      const current = await readJson<Hold>(
        await fetch(`/api/bookings/${encodeURIComponent(hold.bookingId)}`, {
          headers: { Authorization: `Bearer ${hold.accessToken}` },
          cache: "no-store",
        }),
      );
      if (current.status !== "PENDING_HOLD") throw new Error("Your cabin hold has ended. Please choose your cabin again.");
      const merged = { ...attempt!, hold: { ...hold, ...current, accessToken: hold.accessToken } };
      setAttempt(merged);
      saveAttempt(merged);
      setStep(4);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "We could not check your hold.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRequest() {
    if (!hold || !attempt) return;
    if (!form.termsAccepted) {
      setErrors(current => ({ ...current, terms: "Please accept the booking and cancellation terms." }));
      return;
    }
    setBusy(true);
    setAlert(null);
    try {
      const passengers = passengersFor(party).map((passenger, index) => ({ ...passenger, fullName: names[index]?.trim() ?? "" }));
      const specialRequests = [
        form.dietary.trim() ? `Dietary requirements: ${form.dietary.trim()}` : "",
        form.transfers.trim() ? `Arrival and transfers: ${form.transfers.trim()}` : "",
        form.requests.trim() ? `Special requests: ${form.requests.trim()}` : "",
      ].filter(Boolean).join("\n").slice(0, 2000);

      const result = await readJson<{ bookingId: string; accessToken: string }>(
        await fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.key },
          body: JSON.stringify({
            bookingId: hold.bookingId,
            accessToken: hold.accessToken,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.replace(/[\s()-]/g, ""),
            country: form.country.trim(),
            paymentMethod: form.paymentMethod,
            specialRequests,
            marketingOptIn: form.marketingOptIn,
            termsAccepted: true,
            passengers,
          }),
        }),
      );
      clearAttempt();
      router.push(`/booking/success?bookingId=${encodeURIComponent(result.bookingId)}&token=${encodeURIComponent(result.accessToken)}`);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Your request could not be sent. Trying again keeps the same request.");
      setBusy(false);
    }
  }

  const scene = { "--hj-scene": `url("${voyage.image}")` } as CSSProperties;
  const datesLabel = sailing ? rangeLabel(sailing.departureTime, sailing.arrivalTime) : "Select";
  const cabinLabel = roomType ? plural(party.cabins, "Cabin") : "Select";
  const wide = step >= 3;

  return (
    <div className="hj" style={scene}>
      <JourneyBand
        step={step}
        guests={partySummary(party)}
        dates={datesLabel}
        cabin={cabinLabel}
        totalCents={hold?.totalPriceCents ?? null}
        onJump={target => { if (target < step) setStep(target); }}
      />

      <div className={`hj-stage${wide ? " hj-stage--wide" : ""}`} ref={stageRef}>
        {step === 1 ? (
          <>
            <section className="hj-panel">
              {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
              <PanelHead title="Plan Your Journey" lede="Choose your route and sailing date." />

              <span className="hj-step-label">1. Choose your itinerary</span>
              <VoyagePicker value={duration} onChange={next => { setDuration(next); setRoomType(null); setScheduleId(""); }} />

              <span className="hj-step-label">2. Select your sailing date</span>
              <SailingCalendar
                sailings={sailings}
                loading={loadingSailings}
                departureDay={voyage.departureDay.replace(/s$/, "")}
                selectedId={scheduleId}
                onSelect={setScheduleId}
              />

              <span className="hj-step-label">3. Guests and cabins</span>
              <div className="hj-counters">
                <Counter label="Adults" value={party.adults} min={1} max={24} onChange={adults => changeParty({ adults })} />
                <Counter label="Children" value={party.children} min={0} max={8} onChange={children => changeParty({ children })} />
                <Counter label="Cabins" value={party.cabins} min={1} max={MAX_CABINS} onChange={cabins => changeParty({ cabins })} />
              </div>
              {problem ? <p className="hj-error">{problem}</p> : null}
              <p className="hj-ledger__note">Children count toward cabin occupancy and are charged at the cabin rate.</p>

              <span className="hj-step-label">4. Your itinerary, day by day</span>
              <ItineraryAccordion duration={duration} />

              <span className="hj-step-label">5. Cabins and suites on this voyage</span>
              <CabinPriceList sailing={sailing} />

              <div className="hj-actions">
                <button type="button" className="hj-btn" disabled={busy || !scheduleId || Boolean(problem)} onClick={() => void checkAvailability()}>
                  {busy ? "Checking…" : "Continue to cabin selection"} <span aria-hidden>→</span>
                </button>
              </div>
              {!scheduleId ? <p className="hj-note">Choose a sailing date to check availability.</p> : null}
            </section>
            <VoyageRail duration={duration} sailing={sailing} party={party} roomType={roomType} hold={hold} />
          </>
        ) : null}

        {step === 2 && sailing ? (
          <>
            <section className="hj-panel">
              {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
              <PanelHead title="Select Your Cabin or Suite" lede="Live availability for your sailing, straight from our reservations system." />
              <CabinCards sailing={sailing} cabins={party.cabins} selected={roomType} onSelect={setRoomType} />
              <div className="hj-actions">
                <button type="button" className="hj-btn hj-btn--quiet" onClick={() => setStep(1)}>Back to journey</button>
                <button type="button" className="hj-btn" disabled={busy || !roomType} onClick={() => void holdCabins()}>
                  {busy ? "Holding your cabin…" : "Continue to guest details"} <span aria-hidden>→</span>
                </button>
              </div>
              <Link className="hj-underlink" href="/terms-and-conditions" target="_blank">View payment &amp; cancellation terms</Link>
              <p className="hj-note">Your cabin is held for 15 minutes once you continue.</p>
            </section>
            <VoyageRail duration={duration} sailing={sailing} party={party} roomType={roomType} hold={hold} />
          </>
        ) : null}

        {step === 3 && hold && roomType && sailing ? (
          <div>
            <PageHead title="Complete Your Booking" lede="Review your selections and enter the lead guest details." />
            {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
            <GuestDetailsScreen
              duration={duration}
              roomType={roomType}
              party={party}
              hold={hold}
              departureIso={sailing.departureTime}
              arrivalIso={sailing.arrivalTime}
              form={form}
              onForm={patchForm}
              names={names}
              onNames={patchName}
              errors={errors}
              busy={busy}
              onEdit={() => setStep(2)}
              onContinue={() => void continueToReview()}
            />
            {secondsLeft > 0 ? <p className="hj-note">Your cabin is held for {formatCountdown(secondsLeft)}.</p> : null}
          </div>
        ) : null}

        {step === 4 && hold && roomType && sailing ? (
          <div>
            <PageHead title="Complete Your Booking" lede="Review your selections and confirm how you would like to pay." />
            {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
            <ReviewScreen
              duration={duration}
              roomType={roomType}
              party={party}
              hold={hold}
              departureIso={sailing.departureTime}
              arrivalIso={sailing.arrivalTime}
              form={form}
              onForm={patchForm}
              errors={errors}
              busy={busy}
              onEdit={() => setStep(3)}
              onConfirm={() => void confirmRequest()}
            />
            {secondsLeft > 0 ? <p className="hj-note">Your cabin is held for {formatCountdown(secondsLeft)}.</p> : null}
          </div>
        ) : null}
      </div>

      <JourneyProgress step={step} />
    </div>
  );
}
