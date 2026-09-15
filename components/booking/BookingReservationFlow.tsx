"use client";

import { HATHOR_BOOKING_INCLUSIONS } from "@/lib/booking-room-media";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { STAY_DURATION_OPTIONS, type StayDurationValue, type RoomSearchConfig } from "@/lib/booking-search-config";
import { PHYSICAL_ROOM_TYPES, roomCapacity, type RequestedRoom, type PhysicalRoomType } from "@/lib/physical-inventory";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import type { getRequestAvailability } from "@/lib/booking-request-availability";

export type RoomBookingEntry = { duration: StayDurationValue; roomConfig: RoomSearchConfig; roomId: string; roomName: string; cruiseId: string };
type Sailing = Awaited<ReturnType<typeof getRequestAvailability>>[number];
type Hold = {
  requiredCents?: number; bookingId: string; accessToken: string; status: string; holdExpiresAt: string | null; totalPriceCents: number;
  rooms: { roomType: PhysicalRoomType; adults: number; children: number; unitPriceCents: number }[];
  paymentSchedule: { milestone: string; dueAt: string | null; cumulativeCents: number }[];
};
type Attempt = { key: string; duration: StayDurationValue; scheduleId: string; rooms: RequestedRoom[]; hold?: Hold };
const STORAGE = "hathor-request-attempt-v2";
const inputClass = "hathor-checkout-field w-full border px-3 py-2.5 text-sm";
const freshRoom = (): RequestedRoom => ({ roomType: "Luxury King Cabin", adults: 1, children: 0 });
async function jsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new Error(data.details?.formErrors?.[0] ?? data.error ?? "Please try again.");
  return data;
}
function saveAttempt(attempt: Attempt) { localStorage.setItem(STORAGE, JSON.stringify(attempt)); }

/** Core request flow uses existing booking styles; final visual design is a later stage. */
export function BookingReservationFlow({ initialRoomBooking = null }: { initialRoomBooking?: RoomBookingEntry | null }) {
  const router = useRouter();
  const storeDuration = useBookingStore(s => s.duration);
  const storeRooms = useBookingStore(s => s.roomConfigs);
  const [duration, setDuration] = useState<StayDurationValue>(initialRoomBooking?.duration ?? (storeDuration || "4-nights-luxor-aswan"));
  const [rooms, setRooms] = useState<RequestedRoom[]>(() => storeRooms.map(r => ({ roomType: r.adults + r.children > 2 ? "Luxury Suite" : "Luxury King Cabin", adults: r.adults, children: r.children })));
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [scheduleId, setScheduleId] = useState("");
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", country: "", specialRequests: "", paymentMethod: "VISA", termsAccepted: false, marketingOptIn: false });
  const sailing = sailings.find(s => s.scheduleId === scheduleId);
  const hold = attempt?.hold;

  useEffect(() => {
    let alive = true;
    fetch(`/api/booking/availability?mode=request&duration=${encodeURIComponent(duration)}`, { cache: "no-store" })
      .then(r => jsonResponse<{ sailings: Sailing[] }>(r)).then(data => { if (alive) setSailings(data.sailings); })
      .catch(e => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [duration]);

  useEffect(() => {
    let alive = true;
    async function restore() {
      try {
        const raw = localStorage.getItem(STORAGE);
        if (!raw) return;
        const saved: Attempt = JSON.parse(raw);
        if (!saved.key || !saved.rooms?.length || !STAY_DURATION_OPTIONS.some(d => d.value === saved.duration)) return;
        if (saved.hold) {
          const current = await jsonResponse<Hold>(await fetch(`/api/bookings/${encodeURIComponent(saved.hold.bookingId)}`, { headers: { Authorization: `Bearer ${saved.hold.accessToken}` }, cache: "no-store" }));
          if (!alive) return;
          if (["REQUESTED", "CONFIRMED"].includes(current.status)) {
            localStorage.removeItem(STORAGE);
            router.replace(`/booking/success?bookingId=${encodeURIComponent(saved.hold.bookingId)}&token=${encodeURIComponent(saved.hold.accessToken)}`);
            return;
          }
          if (current.status !== "PENDING_HOLD") { localStorage.removeItem(STORAGE); return; }
          saved.hold = { ...saved.hold, ...current };
        }
        if (!alive) return;
        setDuration(saved.duration); setScheduleId(saved.scheduleId); setRooms(saved.rooms); setAttempt(saved);
        if (saved.hold) setStep(2);
      } catch { if (alive) setError("Your previous request could not be restored. You can retry or use View Reservation."); }
    }
    void restore();
    return () => { alive = false; };
  }, [router]);

  const people = rooms.flatMap((r, roomIndex) => [
    ...Array.from({ length: r.adults }, () => ({ roomIndex, isChild: false })),
    ...Array.from({ length: r.children }, () => ({ roomIndex, isChild: true })),
  ]);
  function changeRoom(index: number, patch: Partial<RequestedRoom>) {
    setRooms(current => current.map((r,i) => i === index ? { ...r, ...patch } : r)); setChecked(false);
  }
  async function checkAvailability() {
    setBusy(true); setError(null);
    try {
      if (!scheduleId) throw new Error("Choose an existing sailing date.");
      if (rooms.some(r => r.adults + r.children > roomCapacity(r.roomType))) throw new Error("Guest count exceeds cabin capacity.");
      const data = await jsonResponse<{ sailings: Sailing[] }>(await fetch(`/api/booking/availability?mode=request&duration=${duration}`, { cache: "no-store" }));
      setSailings(data.sailings); setChecked(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to check availability."); }
    finally { setBusy(false); }
  }
  async function acquire() {
    setBusy(true); setError(null);
    try {
      const same = attempt && attempt.duration === duration && attempt.scheduleId === scheduleId && JSON.stringify(attempt.rooms) === JSON.stringify(rooms);
      const next: Attempt = same ? attempt : { key: crypto.randomUUID(), duration, scheduleId, rooms };
      saveAttempt(next); setAttempt(next);
      const held = await jsonResponse<Hold>(await fetch("/api/bookings/hold", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": next.key }, body: JSON.stringify({ cruiseScheduleId: scheduleId, rooms }) }));
      next.hold = held; saveAttempt(next); setAttempt({ ...next });
      if (["REQUESTED", "CONFIRMED"].includes(held.status)) {
        router.push(`/booking/success?bookingId=${encodeURIComponent(held.bookingId)}&token=${encodeURIComponent(held.accessToken)}`); return;
      }
      setRooms(held.rooms.map(r => ({ roomType: r.roomType, adults: r.adults, children: r.children })));
      setNames([]); setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : "Rooms could not be held."); }
    finally { setBusy(false); }
  }
  async function verifyHold() {
    if (!hold) throw new Error("Select rooms first.");
    const current = await jsonResponse<Hold>(await fetch(`/api/bookings/${encodeURIComponent(hold.bookingId)}`, { headers: { Authorization: `Bearer ${hold.accessToken}` }, cache: "no-store" }));
    if (current.status !== "PENDING_HOLD") throw new Error("Your hold ended. Please start a new room selection.");
    return current;
  }
  async function review(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null);
    try { const current = await verifyHold(); setAttempt(a => a ? { ...a, hold: { ...a.hold!, ...current } } : a); setStep(3); } catch (e) { setError(e instanceof Error ? e.message : "Unable to review hold."); } finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!attempt || !hold) return;
    setBusy(true); setError(null);
    try {
      const result = await jsonResponse<{ requiredCents?: number; bookingId: string; accessToken: string }>(await fetch("/api/bookings/confirm", {
        method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.key },
        body: JSON.stringify({ bookingId: hold.bookingId, accessToken: hold.accessToken, ...form, passengers: people.map((p,i) => ({ ...p, fullName: names[i] ?? "" })) }),
      }));
      localStorage.removeItem(STORAGE);
      router.push(`/booking/success?bookingId=${encodeURIComponent(result.bookingId)}&token=${encodeURIComponent(result.accessToken)}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit. Retrying keeps the same request."); }
    finally { setBusy(false); }
  }
  function startAgain() { localStorage.removeItem(STORAGE); setAttempt(null); setStep(1); setChecked(false); setError(null); }

  return <div className="hathor-booking-flow">
    <header className="hathor-booking-flow__header"><h1 className="booking-serif hathor-booking-flow__title">{step === 1 ? "Your voyage" : step === 2 ? "Guest details" : "Review your request"}</h1>
      <p>No payment is collected here. Hathor reservations will send your invoice and payment instructions.</p></header>
    {error && <p className="hathor-checkout-alert" role="alert">{error}</p>}
    {step === 1 ? <section className="booking-card space-y-5 p-4 sm:p-8">
      <label>Voyage<select className={inputClass} value={duration} onChange={e => { setDuration(e.target.value as StayDurationValue); setScheduleId(""); setChecked(false); }}>{STAY_DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label.replace(/^⛵\s*/, "")}</option>)}</select></label>
      <label>Departure<select className={inputClass} value={scheduleId} onChange={e => { setScheduleId(e.target.value); setChecked(false); }}><option value="">Choose a sailing</option>{sailings.map(s => <option key={s.scheduleId} value={s.scheduleId}>{formatUtcDate(s.departureTime)} — {formatUtcDate(s.arrivalTime)}</option>)}</select></label>
      {sailings.length === 0 && <p>No future sailings are currently open for this voyage.</p>}
      <label>Number of rooms<input className={inputClass} type="number" min={1} max={12} value={rooms.length} onChange={e => { const n = Math.max(1, Math.min(12, Number(e.target.value) || 1)); setRooms(current => Array.from({ length: n }, (_,i) => current[i] ?? freshRoom())); setChecked(false); }} /></label>
      {rooms.map((room,i) => <fieldset key={i} className="space-y-3"><legend>Room {i+1}</legend>
        <label>Room type<select className={inputClass} value={room.roomType} onChange={e => changeRoom(i,{ roomType: e.target.value as PhysicalRoomType })}>{PHYSICAL_ROOM_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Adults<input className={inputClass} type="number" min={1} max={4} value={room.adults} onChange={e => changeRoom(i,{ adults: Math.max(1,Math.min(4,Number(e.target.value)||1)) })} /></label>
        <label>Children<input className={inputClass} type="number" min={0} max={3} value={room.children} onChange={e => changeRoom(i,{ children: Math.max(0,Math.min(3,Number(e.target.value)||0)) })} /></label>
        <p>Maximum {roomCapacity(room.roomType)} guests. Children count toward occupancy. Rates are per cabin.</p>
      </fieldset>)}
      <button className="public-btn-gold" disabled={busy || !scheduleId} onClick={() => void checkAvailability()}>Check Availability</button>
      {checked && sailing && <div className="space-y-4"><p>{sailing.route} · {formatUtcDate(sailing.departureTime)} – {formatUtcDate(sailing.arrivalTime)}</p>{sailing.types.map(t => <p key={t.roomType}>{t.roomType} · {t.sizeSqm} m² · {formatPrice(t.priceCents)} · {t.available ? `${t.available} available` : "Sold out"}</p>)}
        <button className="public-btn-gold" disabled={busy || rooms.some(r => (sailing.types.find(t => t.roomType === r.roomType)?.available ?? 0) < rooms.filter(x => x.roomType === r.roomType).length)} onClick={() => void acquire()}>{busy ? "Holding rooms…" : "Select rooms & continue"}</button>
      </div>}
    </section> : <>
      <aside className="booking-card space-y-3 p-4 sm:p-8"><h2 className="booking-serif">My voyage</h2><p>{sailing?.voyage ?? STAY_DURATION_OPTIONS.find(d => d.value === duration)?.label}</p><p>{sailing ? `${formatUtcDate(sailing.departureTime)} – ${formatUtcDate(sailing.arrivalTime)}` : ""}</p>
        {hold?.rooms.map((r,i) => <p key={i}>{r.roomType} · {r.adults} adults, {r.children} children · {formatPrice(r.unitPriceCents)}</p>)}
        <p>Total booking value: <strong>{formatPrice(hold?.totalPriceCents ?? 0)}</strong></p>
        <p>Temporary hold expires: {hold?.holdExpiresAt ? new Date(hold.holdExpiresAt).toLocaleString() : "—"}</p>
      </aside>
      {step === 2 ? <form onSubmit={review} className="booking-card space-y-5 p-4 sm:p-8">
        {([['firstName','Lead guest first name'],['lastName','Lead guest last name'],['email','Email'],['phone','Phone with country code'],['country','Country']] as const).map(([key,label]) => <label key={key} className="block">{label}<input className={inputClass} required type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} maxLength={key === 'email' ? 254 : 80} pattern={key === 'phone' ? '\\+[1-9][0-9]{6,14}' : undefined} placeholder={key === 'phone' ? '+201234567890' : undefined} value={form[key]} onChange={e => setForm(f => ({ ...f,[key]:e.target.value }))} /></label>)}
        {people.map((person,i) => <label className="block" key={i}>Room {person.roomIndex+1} · {person.isChild ? 'Child' : 'Adult'} full name<input className={inputClass} required maxLength={120} value={names[i] ?? ''} onChange={e => setNames(current => { const next = [...current]; next[i] = e.target.value; return next; })} /></label>)}
        <label className="block">Dietary requirements, arrival/transfer details, or special requests (optional)<textarea className={inputClass} maxLength={2000} value={form.specialRequests} onChange={e => setForm(f => ({ ...f,specialRequests:e.target.value }))} /></label>
        <button className="public-btn-gold" disabled={busy}>Continue to review</button>
      </form> : <form className="booking-card space-y-5 p-4 sm:p-8" onSubmit={submit}>
        <p>{form.firstName} {form.lastName} · {form.email} · {form.phone} · {form.country}</p>
        {people.map((p,i) => <p key={i}>Room {p.roomIndex+1}: {names[i]}</p>)}
        <details><summary>Voyage inclusions</summary><ul>{HATHOR_BOOKING_INCLUSIONS.map(item=><li key={item}>{item}</li>)}</ul></details>
        <p>Required initial payment when invoiced: {formatPrice(hold?.requiredCents ?? 0)}. Nothing is charged on this website.</p>
        <p>Payment schedule: 30% initially; total payments must reach 50% by 60 days before departure; full payment by 45 days before departure.</p>
        {hold?.paymentSchedule.map(p => <p key={p.milestone}>{p.milestone === 'INITIAL' ? 'Initial payment' : p.dueAt ? formatUtcDate(p.dueAt) : p.milestone}: cumulative {formatPrice(p.cumulativeCents)}</p>)}
        <fieldset><legend>Preferred payment method</legend>{[['VISA','Visa'],['BANK_TRANSFER','Bank Transfer']].map(([value,label]) => <label key={value} className="block"><input type="radio" name="paymentMethod" checked={form.paymentMethod === value} onChange={() => setForm(f => ({ ...f,paymentMethod:value }))} /> {label}</label>)}</fieldset>
        <p>No card details are collected. Your reservation is confirmed only after Hathor acceptance and the required payment is recorded.</p>
        <label className="block"><input type="checkbox" required checked={form.termsAccepted} onChange={e => setForm(f => ({ ...f,termsAccepted:e.target.checked }))} /> I accept the <a href="/terms-and-conditions" target="_blank" rel="noreferrer">terms and cancellation policy</a> and understand this submits a booking request.</label>
        <button type="button" className="public-btn-outline-gold" onClick={() => setStep(2)}>Edit guest details</button>
        <button className="public-btn-gold" disabled={busy}>{busy ? 'Sending request…' : 'Confirm Request'}</button>
      </form>}
      <button type="button" className="public-btn-outline-gold" onClick={startAgain}>Start a new room selection</button>
    </>}
    <p><a href="/booking/lookup">View Reservation</a> · <a href="/contact">Contact Hathor</a></p>
  </div>;
}
