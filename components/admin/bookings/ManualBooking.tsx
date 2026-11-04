"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import type { ClosureSale } from "@/lib/admin-bookings";
import { Dialog, Field, Footer } from "./BookingActions";
import { SaleFields, saleFormFrom, salePayload, type SaleFormState } from "./ClosureBookings";

/*
 * Bookings -> Add booking. A booking taken by phone, WhatsApp, email or in
 * person: pick the sailing and the free cabins, enter the guest, and the cabins
 * close on Availability at once with the guest on record (Via Availability).
 */

const VOYAGES = [
  { slug: "7-nights-luxor-aswan-luxor", label: "7 nights · Luxor → Aswan → Luxor" },
  { slug: "4-nights-luxor-aswan", label: "4 nights · Luxor → Aswan" },
  { slug: "3-nights-aswan-luxor", label: "3 nights · Aswan → Luxor" },
] as const;

type DateOption = { scheduleId: string; departure: string; arrival: string };
type BoardRoom = { id: string; name: string; roomType: string; capacity: number; shipName?: string | null };
type Board = { rooms: BoardRoom[]; sailings: { scheduleId: string; cabins: Record<string, unknown[]> }[] };

const TYPE_ONE: Record<string, string> = {
  "Luxury King Cabin": "King cabin",
  "Luxury Twin Cabin": "Twin cabin",
  "Luxury Suite": "Luxury suite",
  "Royal Suite": "Royal suite",
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function roomTitle(room: BoardRoom) {
  const type = TYPE_ONE[room.roomType] ?? room.roomType;
  if (!room.shipName) return `${type} ${room.id}`;
  return /suite/i.test(room.shipName) ? room.shipName : `${room.shipName} · ${type}`;
}

/** Closes the cabins for the guest and records them; throws the server's reason. */
export async function submitManualBooking(scheduleId: string, roomIds: string[], sale: ClosureSale, idempotencyKey: string) {
  const response = await adminFetch("/api/admin/closure-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ scheduleId, roomIds, ...sale }),
  }, 60_000);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Could not add this booking.");
  return data as { blockKey: string; closed: string[] };
}

export function ManualBookingDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const [voyage, setVoyage] = useState<string>(VOYAGES[0].slug);
  const [dates, setDates] = useState<DateOption[] | null>(null);
  const [scheduleId, setScheduleId] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [rooms, setRooms] = useState<string[]>([]);
  const [form, setForm] = useState<SaleFormState>(() => saleFormFrom(null, "Phone"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operation = useRef(crypto.randomUUID());

  // The voyage's open departures.
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setDates(null); setScheduleId(""); setRooms([]); } });
    adminFetch(`/api/admin/cabin-closures?voyage=${voyage}&view=dates`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load departures.");
        return body as { dates: DateOption[] };
      })
      .then(body => { if (!controller.signal.aborted) setDates(body.dates); })
      .catch(err => { if (!controller.signal.aborted) { setDates([]); setError(err instanceof Error ? err.message : "Could not load departures."); } });
    return () => controller.abort();
  }, [voyage]);

  const chosen = dates?.find(date => date.scheduleId === scheduleId) ?? null;

  // What is still free on the chosen sailing.
  useEffect(() => {
    if (!chosen) return;
    const controller = new AbortController();
    queueMicrotask(() => { if (!controller.signal.aborted) { setBoardLoading(true); setRooms([]); } });
    adminFetch(`/api/admin/cabin-closures?voyage=${voyage}&month=${chosen.departure.slice(0, 7)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load the cabins.");
        return body as Board;
      })
      .then(body => { if (!controller.signal.aborted) setBoard(body); })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load the cabins."); })
      .finally(() => { if (!controller.signal.aborted) setBoardLoading(false); });
    return () => controller.abort();
  }, [voyage, chosen]);

  const sailing = board?.sailings.find(entry => entry.scheduleId === scheduleId) ?? null;
  const freeRooms = useMemo(
    () => (sailing && board ? board.rooms.filter(room => !(sailing.cabins[room.id]?.length)) : []),
    [board, sailing],
  );
  const capacity = freeRooms.filter(room => rooms.includes(room.id)).reduce((sum, room) => sum + room.capacity, 0);

  // A changed choice is a new operation; a retry of the same one is safe.
  useEffect(() => { operation.current = crypto.randomUUID(); }, [scheduleId, rooms]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!scheduleId) return setError("Choose the departure date.");
    if (!rooms.length) return setError("Choose at least one free cabin.");
    const payload = salePayload(form);
    if ("error" in payload) return setError(payload.error);
    const guests = (payload.sale.adults ?? 0) + (payload.sale.children ?? 0);
    if (capacity && guests > capacity) return setError(`These cabins sleep ${capacity}. Choose another cabin for ${guests} guests.`);
    setBusy(true);
    setError(null);
    try {
      const result = await submitManualBooking(scheduleId, rooms, payload.sale, operation.current);
      showToast("success", `Booking added. ${result.closed.length} ${result.closed.length === 1 ? "cabin is" : "cabins are"} now closed on Availability.`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title="Add a booking" kicker="Phone · WhatsApp · email · in person" onClose={onClose}>
      <form onSubmit={submit}>
        <p className="text-sm text-muted">The cabins you choose close on Availability straight away, so the website cannot sell them again.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Voyage">
            <select className="input h-10 px-3 text-sm" value={voyage} onChange={event => setVoyage(event.target.value)}>
              {VOYAGES.map(entry => <option key={entry.slug} value={entry.slug}>{entry.label}</option>)}
            </select>
          </Field>
          <Field label="Departure">
            <select className="input h-10 px-3 text-sm" value={scheduleId} onChange={event => setScheduleId(event.target.value)} disabled={!dates?.length}>
              <option value="">{!dates ? "Loading departures…" : dates.length ? "Choose a date" : "No open departures"}</option>
              {(dates ?? []).map(date => <option key={date.scheduleId} value={date.scheduleId}>{day(date.departure)} → {day(date.arrival)}</option>)}
            </select>
          </Field>
        </div>

        {chosen ? (
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted">Free cabins</legend>
            {boardLoading || !sailing ? (
              <p className="mt-2 text-sm text-muted"><Loader2 className="inline h-3.5 w-3.5 animate-spin" aria-hidden /> Loading cabins…</p>
            ) : !freeRooms.length ? (
              <p className="mt-2 text-sm text-muted">No cabin is free on this sailing.</p>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {freeRooms.map(room => {
                  const on = rooms.includes(room.id);
                  return (
                    <label key={room.id} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: on ? "var(--accent)" : "var(--border)", background: on ? "color-mix(in srgb, var(--accent) 10%, transparent)" : undefined }}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setRooms(current => (on ? current.filter(id => id !== room.id) : [...current, room.id]))}
                        className="h-4 w-4"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{roomTitle(room)}</span>
                      <span className="shrink-0 text-xs text-muted">up to {room.capacity}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        ) : null}

        <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
          <SaleFields form={form} onChange={setForm} />
        </div>
        {error ? <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</p> : null}
        <Footer busy={busy} submitLabel="Add booking & close cabins" onCancel={onClose} />
      </form>
    </Dialog>
  );
}
