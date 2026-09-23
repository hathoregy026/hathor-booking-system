"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { MoneyInput } from "@/components/admin/MoneyInput";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import { formatPrice } from "@/lib/client-dates";

type Voyage = { cruiseId: string; name: string; prices: Record<string, number> };
type DateRate = {
  scheduleId: string;
  date: string;
  basePriceCents: number;
  overridePriceCents: number | null;
  availableCabins: number;
};
type DateRatesResponse = { dates: DateRate[] };

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

/** Only real, future departures appear. A blank override means the base rate. */
export function SailingPriceEditor({ voyages, roomTypes }: {
  voyages: Voyage[];
  roomTypes: string[];
}) {
  const { showToast } = useToast();
  const [cruiseId, setCruiseId] = useState(voyages[0]?.cruiseId ?? "");
  const [roomType, setRoomType] = useState(roomTypes[0] ?? "");
  const [month, setMonth] = useState(currentMonth);
  const [dates, setDates] = useState<DateRate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, number | null>>({});
  const [monthPrice, setMonthPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cruiseId || !roomType) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ cruiseId, roomType, month });
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setDates([]);
      setDrafts({});
      setError(null);
    });
    adminFetch(`/api/admin/sailing-prices?${params}`, {
      cache: "no-store", signal: controller.signal,
    }).then(async response => {
      const body = await response.json() as DateRatesResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not load sailing prices");
      if (!controller.signal.aborted) {
        setDates(body.dates);
        setDrafts(Object.fromEntries(body.dates.map(date => [date.scheduleId, date.overridePriceCents])));
      }
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load sailing prices");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [cruiseId, roomType, month]);

  const voyage = voyages.find(entry => entry.cruiseId === cruiseId);
  const availableTypes = roomTypes.filter(type => voyage?.prices[type] !== undefined);
  const changes = useMemo(() => dates
    .filter(date => drafts[date.scheduleId] !== date.overridePriceCents)
    .map(date => ({ scheduleId: date.scheduleId, priceCents: drafts[date.scheduleId] ?? null })),
  [dates, drafts]);
  const invalid = changes.some(change => change.priceCents !== null &&
    (!Number.isInteger(change.priceCents) || change.priceCents < 100 || change.priceCents > 100_000_000));

  async function save() {
    if (!changes.length || invalid) return;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/sailing-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cruiseId, roomType, month, changes }),
      });
      const body = await response.json() as DateRatesResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not save sailing prices");
      setDates(body.dates);
      setDrafts(Object.fromEntries(body.dates.map(date => [date.scheduleId, date.overridePriceCents])));
      showToast("success", "Date prices saved. New booking requests use these rates.");
    } catch (reason) {
      showToast("error", reason instanceof Error ? reason.message : "Could not save sailing prices");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card p-4 sm:p-6" aria-labelledby="date-prices-title">
      <h2 id="date-prices-title" className="admin-heading text-base">Prices by departure date</h2>
      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        Pick a package, cabin and month. Set prices on individual open dates, or apply one price to the month.
        A date with no special price uses the base price above. Existing requests keep their saved amount.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-xs font-medium">
          Package
          <select className="admin-input w-full text-sm" value={cruiseId} onChange={event => {
            const next = voyages.find(item => item.cruiseId === event.target.value);
            setCruiseId(event.target.value);
            if (next && next.prices[roomType] === undefined) setRoomType(Object.keys(next.prices)[0] ?? "");
          }}>
            {voyages.map(item => <option key={item.cruiseId} value={item.cruiseId}>{item.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium">
          Cabin type
          <select className="admin-input w-full text-sm" value={roomType} onChange={event => setRoomType(event.target.value)}>
            {availableTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium">
          Departure month
          <input className="admin-input w-full text-sm" type="month" min={currentMonth()}
            max={`${bookingHorizonYear()}-12`} value={month}
            onChange={event => event.target.value && setMonth(event.target.value)} />
        </label>
      </div>

      {dates.some(date => date.availableCabins > 0) ? (
        <div className="mt-5 flex flex-wrap items-end gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <div className="w-44"><MoneyInput id="month-date-price" label="Month price" valueCents={monthPrice} onChangeCents={setMonthPrice} /></div>
          <ActionButton variant="outline" disabled={monthPrice < 100 || monthPrice > 100_000_000 || loading || saving}
            onClick={() => setDrafts(current => ({ ...current, ...Object.fromEntries(
              dates.filter(date => date.availableCabins > 0).map(date => [date.scheduleId, monthPrice]),
            ) }))}>
            Apply to open dates
          </ActionButton>
        </div>
      ) : null}

      {loading ? <p className="mt-5 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading dates…</p> : null}
      {error ? <p className="mt-5 text-sm" role="alert" style={{ color: "var(--danger)" }}>{error}</p> : null}
      {!loading && !error && dates.length === 0 ? (
        <p className="mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>No open sailings in this month.</p>
      ) : null}

      {!loading && dates.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {dates.map(date => {
            const price = drafts[date.scheduleId];
            const changed = price !== date.overridePriceCents;
            const soldOut = date.availableCabins === 0;
            return (
              <div key={date.scheduleId} className="grid items-center gap-2 rounded-xl border p-3 sm:grid-cols-[minmax(140px,1fr)_minmax(130px,1fr)_minmax(150px,1fr)_auto]"
                style={{ borderColor: changed ? "var(--warning)" : "var(--border)" }}>
                <div>
                  <p className="text-sm font-medium">{new Date(`${date.date}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{soldOut ? "Sold out" : `${date.availableCabins} cabins available`}</p>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Base {formatPrice(date.basePriceCents)}</p>
                <MoneyInput id={`date-price-${date.scheduleId}`} label={changed ? "Unsaved price" : "Date price"}
                  valueCents={price ?? 0} disabled={soldOut || saving}
                  onChangeCents={cents => setDrafts(current => ({ ...current, [date.scheduleId]: cents }))} />
                <button type="button" className="text-xs underline disabled:opacity-40" disabled={soldOut || saving || price === null}
                  onClick={() => setDrafts(current => ({ ...current, [date.scheduleId]: null }))}>
                  Use base
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ActionButton icon={saving ? Loader2 : Save} disabled={!changes.length || invalid || saving || loading}
          onClick={() => void save()}>{saving ? "Saving…" : `Save ${changes.length} date ${changes.length === 1 ? "change" : "changes"}`}</ActionButton>
        {changes.length > 0 ? <ActionButton variant="outline" icon={RotateCcw} disabled={saving}
          onClick={() => setDrafts(Object.fromEntries(dates.map(date => [date.scheduleId, date.overridePriceCents])))}>Undo</ActionButton> : null}
        {invalid ? <span className="text-xs" style={{ color: "var(--danger)" }}>Use a price from $1 to $1,000,000.</span> : null}
      </div>
    </section>
  );
}
