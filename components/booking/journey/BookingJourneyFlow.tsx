"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCountdown, getRemainingSeconds } from "@/lib/client-dates";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { JourneyProgress, PanelHead, type JourneyStep } from "./JourneyChrome";
import { ItineraryAccordion, VoyagePicker } from "./ItineraryPanel";
import { SailingCalendar } from "./SailingCalendar";
import { CabinCards } from "./CabinSelection";
import { VoyageRail } from "./VoyageRail";
import { DetailsPaymentScreen } from "./GuestDetails";
import {
  MAX_CABINS,
  STORAGE_KEY,
  distributeParty,
  emptyGuestForm,
  partyProblem,
  passengersFor,
  plural,
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
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hj-counter">
      <span className="hj-counter__copy">
        <span className="hj-counter__label">{label}</span>
        {hint ? <span className="hj-counter__hint">{hint}</span> : null}
      </span>
      <span className="hj-counter__ctrl">
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
  const rooms = distributeParty(party);

  const saveAttempt = useCallback((next: Attempt) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  }, []);
  const clearAttempt = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
  }, []);

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
        setStep(4);
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
  }, [step]);

  useEffect(() => {
    if (loadingSailings) return;
    if (step >= 3 && !sailing) setStep(scheduleId ? 2 : 1);
    if (step === 4 && !hold) setStep(3);
  }, [hold, loadingSailings, sailing, scheduleId, step]);

  useEffect(() => {
    if (!hold?.holdExpiresAt || step < 4) return;
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
    if (step > 2) setStep(2);
  }

  function jump(target: JourneyStep) {
    if (target < step) setStep(target);
  }

  async function continueToSuites() {
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
      setStep(3);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Unable to check availability.");
    } finally {
      setBusy(false);
    }
  }

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
        setStep(3);
        throw new Error("That cabin has just been taken. Please choose another cabin or sailing.");
      }

      const key = attempt && attempt.scheduleId === sailing.scheduleId && attempt.roomType === roomType && attempt.party.cabins === party.cabins
        ? attempt.key
        : crypto.randomUUID();
      const roomsForHold = distributeParty(party).map(cabin => ({ roomType, adults: cabin.adults, children: cabin.children }));
      const next: Attempt = { key, duration, scheduleId: sailing.scheduleId, roomType, party };
      saveAttempt(next);

      const held = await readJson<Hold>(
        await fetch("/api/bookings/hold", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": key },
          body: JSON.stringify({ cruiseScheduleId: sailing.scheduleId, rooms: roomsForHold }),
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
      setStep(4);
    } catch (error) {
      setAlert(error instanceof Error ? error.message : "Your cabin could not be held.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRequest() {
    if (!hold || !attempt) return;
    const found: Record<string, string> = {};
    if (!form.firstName.trim()) found.firstName = "Please enter the lead guest first name.";
    if (!form.lastName.trim()) found.lastName = "Please enter the lead guest last name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) found.email = "Please enter a valid email address.";
    if (!PHONE.test(form.phone.replace(/[\s()-]/g, ""))) found.phone = "Use an international number, for example +20 10 1234 5678.";
    if (form.country.trim().length < 2) found.country = "Please enter your country.";
    if (names.length === 0 || names.some(name => !name.trim())) found.names = "Please give a name for every travelling guest.";
    if (!form.termsAccepted) found.terms = "Please accept the booking and cancellation terms.";
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
      const merged = { ...attempt, hold: { ...hold, ...current, accessToken: hold.accessToken } };
      setAttempt(merged);
      saveAttempt(merged);

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
  const rail = (
    <VoyageRail
      duration={duration}
      sailing={sailing}
      party={party}
      roomType={roomType}
      hold={hold}
      step={step}
      onJump={jump}
    />
  );

  return (
    <div className="hj" style={scene}>
      <div className="hj-folio" id="hj-folio-top" ref={stageRef}>
        <JourneyProgress step={step} onJump={jump} />

        <div className="hj-stage">
          {step === 1 ? (
            <>
              <section className="hj-panel">
                {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
                <PanelHead step={1} title="Plan Your Journey" lede="Three extraordinary voyages. One timeless river." />

                <span className="hj-step-label">Choose your itinerary</span>
                <VoyagePicker value={duration} onChange={next => { setDuration(next); setRoomType(null); setScheduleId(""); }} />

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
                  <button type="button" className="hj-btn" disabled={!scheduleId} onClick={() => setStep(2)}>
                    Continue to guests <span aria-hidden>→</span>
                  </button>
                </div>
                {!scheduleId ? <p className="hj-note">Choose a sailing date to continue.</p> : null}
              </section>
              {rail}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <section className="hj-panel">
                {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
                <PanelHead step={2} title="Tell Us Who Is Travelling" lede="Help us shape a voyage that is perfectly yours." />

                <div className="hj-guests">
                  <div>
                    <span className="hj-step-label">Number of guests</span>
                    <div className="hj-counters">
                      <Counter label="Adults" hint="12 years and over" value={party.adults} min={1} max={24} onChange={adults => changeParty({ adults })} />
                      <Counter label="Children" hint="Aged 2 – 11 years" value={party.children} min={0} max={8} onChange={children => changeParty({ children })} />
                      <Counter label="Number of cabins" value={party.cabins} min={1} max={MAX_CABINS} onChange={cabins => changeParty({ cabins })} />
                    </div>

                    <span className="hj-step-label">Cabin arrangement</span>
                    <div className="hj-choice-row">
                      <label className={`hj-choice${party.cabins === 1 ? " hj-choice--on" : ""}`}>
                        <input type="radio" name="hj-cabin-together" checked={party.cabins === 1} onChange={() => changeParty({ cabins: 1 })} />
                        <span>
                          <strong>One cabin</strong>
                          <span>All guests in the same cabin, when occupancy allows.</span>
                        </span>
                      </label>
                      <label className={`hj-choice${party.cabins > 1 ? " hj-choice--on" : ""}`}>
                        <input type="radio" name="hj-cabin-together" checked={party.cabins > 1} onChange={() => changeParty({ cabins: Math.max(2, party.cabins) })} />
                        <span>
                          <strong>Separate cabins</strong>
                          <span>Use the cabin counter for family or friends travelling together.</span>
                        </span>
                      </label>
                    </div>
                    {problem ? <p className="hj-error">{problem}</p> : null}
                    <p className="hj-note-box">Children count toward cabin occupancy and are charged at the cabin rate.</p>
                  </div>

                  <div>
                    <span className="hj-step-label">How guests will be allocated</span>
                    <p className="hj-ledger__note" style={{ marginTop: 0 }}>
                      Hathor spreads the party evenly across the cabins you request. This is the occupancy the availability check will use.
                    </p>
                    <div className="hj-rooms">
                      {rooms.map((cabin, index) => (
                        <div className="hj-roomchip" key={index}>
                          <b>Cabin {String(index + 1).padStart(2, "0")}</b>
                          <span>{plural(cabin.adults, "Adult")} · {plural(cabin.children, "Child", "Children")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hj-actions">
                  <button type="button" className="hj-btn hj-btn--ghost" onClick={() => setStep(1)}>← Back to journey</button>
                  <button type="button" className="hj-btn" disabled={busy || !scheduleId || Boolean(problem)} onClick={() => void continueToSuites()}>
                    {busy ? "Checking…" : "Continue to suites"} <span aria-hidden>→</span>
                  </button>
                </div>
              </section>
              {rail}
            </>
          ) : null}

          {step === 3 && sailing ? (
            <>
              <section className="hj-panel">
                {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
                <PanelHead step={3} title="Select Your Cabin or Suite" lede="Each residence is a sanctuary, inspired by the timeless beauty of the Nile." />
                <p className="hj-suites-note">Only cabins that fit your party are selectable for this sailing.</p>
                <CabinCards sailing={sailing} cabins={party.cabins} selected={roomType} onSelect={setRoomType} />
                <div className="hj-actions">
                  <button type="button" className="hj-btn hj-btn--ghost" onClick={() => setStep(2)}>← Back to guests</button>
                  <button type="button" className="hj-btn" disabled={busy || !roomType} onClick={() => void holdCabins()}>
                    {busy ? "Holding your cabin…" : "Continue to details"} <span aria-hidden>→</span>
                  </button>
                </div>
                <p className="hj-note">Your cabin is held for 15 minutes once you continue. <Link className="hj-underlink" href="/terms-and-conditions" target="_blank">Payment &amp; cancellation terms</Link></p>
              </section>
              {rail}
            </>
          ) : null}

          {step === 4 && hold && roomType && sailing ? (
            <>
              <section className="hj-panel">
                <PanelHead step={4} title="Guest Details & Payment Preference" lede="Almost there. Please provide your details and choose your preferred payment method." />
                {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
                <DetailsPaymentScreen
                  roomType={roomType}
                  party={party}
                  hold={hold}
                  form={form}
                  onForm={patchForm}
                  names={names}
                  onNames={patchName}
                  errors={errors}
                  busy={busy}
                  onBack={() => setStep(3)}
                  onConfirm={() => void confirmRequest()}
                />
                {secondsLeft > 0 ? <p className="hj-note">Your cabin is held for {formatCountdown(secondsLeft)}.</p> : null}
              </section>
              {rail}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
