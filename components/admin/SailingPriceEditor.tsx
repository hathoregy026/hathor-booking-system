"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Save } from "lucide-react";
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
type DateRatesResponse = { dates: DateRate[]; code?: string; error?: string };

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function adjacentMonth(month: string, offset: number) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7);
}

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
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
  const [setupRequired, setSetupRequired] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
      setSetupRequired(false);
      setMonthPrice(0);
    });
    adminFetch(`/api/admin/sailing-prices?${params}`, {
      cache: "no-store", signal: controller.signal,
    }).then(async response => {
      const body = await response.json() as DateRatesResponse;
      if (!response.ok) {
        if (!controller.signal.aborted && body.code === "DATE_PRICING_NOT_READY") setSetupRequired(true);
        throw new Error(body.error ?? "Could not load sailing prices");
      }
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
  }, [cruiseId, roomType, month, reloadKey]);

  const voyage = voyages.find(entry => entry.cruiseId === cruiseId);
  const availableTypes = roomTypes.filter(type => voyage?.prices[type] !== undefined);
  const changes = useMemo(() => dates
    .filter(date => drafts[date.scheduleId] !== date.overridePriceCents)
    .map(date => ({ scheduleId: date.scheduleId, priceCents: drafts[date.scheduleId] ?? null })),
  [dates, drafts]);
  const invalid = changes.some(change => change.priceCents !== null &&
    (!Number.isInteger(change.priceCents) || change.priceCents < 100 || change.priceCents > 100_000_000));
  const filterLocked = changes.length > 0 || saving;
  const firstMonth = currentMonth();
  const lastMonth = `${bookingHorizonYear()}-12`;

  async function save() {
    if (!changes.length || invalid) return;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/sailing-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cruiseId, roomType, month, changes }),
      });
      const body = await response.json() as DateRatesResponse;
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
    <section className="admin-card overflow-hidden" aria-labelledby="date-prices-title">
      <div className="border-b px-4 py-5 sm:px-6" style={{ borderColor: "var(--border)" }}>
        <p className="admin-section-label mb-1 uppercase tracking-[0.18em]">Departure pricing</p>
        <h2 id="date-prices-title" className="admin-heading text-lg sm:text-xl">Set a price for each sailing</h2>
        <p className="mt-1 max-w-3xl text-sm" style={{ color: "var(--text-secondary)" }}>
          Choose the voyage, cabin and month. A blank date price uses the cabin&rsquo;s base price above.
          Existing bookings keep the price already agreed.
        </p>
      </div>

      <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          <p className="admin-section-label mb-2 uppercase tracking-[0.14em]">1 · Choose a voyage</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {voyages.map(item => (
              <button key={item.cruiseId} type="button" disabled={filterLocked}
                aria-pressed={cruiseId === item.cruiseId}
                onClick={() => {
                  setCruiseId(item.cruiseId);
                  if (item.prices[roomType] === undefined) setRoomType(Object.keys(item.prices)[0] ?? "");
                }}
                className="min-h-16 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: cruiseId === item.cruiseId ? "var(--accent)" : "var(--border)", background: cruiseId === item.cruiseId ? "var(--sidebar-active)" : "var(--bg-secondary)" }}>
                {item.name}
              </button>
            ))}
          </div>

          <p className="admin-section-label mb-2 mt-5 uppercase tracking-[0.14em]">2 · Choose a cabin</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cabin type">
            {availableTypes.map(type => (
              <button key={type} type="button" disabled={filterLocked} aria-pressed={roomType === type}
                onClick={() => setRoomType(type)}
                className="min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: roomType === type ? "var(--accent)" : "var(--border)", background: roomType === type ? "var(--sidebar-active)" : "var(--bg-secondary)" }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <p className="admin-section-label mb-2 uppercase tracking-[0.14em]">3 · Choose a departure month</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous month" disabled={filterLocked || month <= firstMonth}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border disabled:opacity-40"
              style={{ borderColor: "var(--border)" }} onClick={() => setMonth(adjacentMonth(month, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input aria-label="Departure month" className="admin-input min-w-0 flex-1 text-sm" type="month"
              min={firstMonth} max={lastMonth} value={month} disabled={filterLocked}
              onChange={event => event.target.value && setMonth(event.target.value)} />
            <button type="button" aria-label="Next month" disabled={filterLocked || month >= lastMonth}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border disabled:opacity-40"
              style={{ borderColor: "var(--border)" }} onClick={() => setMonth(adjacentMonth(month, 1))}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm font-medium">{monthLabel(month)}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {voyage?.name} · {roomType}
          </p>
          {filterLocked && changes.length > 0 ? (
            <p className="mt-3 text-xs" style={{ color: "var(--accent)" }}>Save or undo your edits before changing filters.</p>
          ) : null}
        </div>
      </div>

      <div className="border-t px-4 py-5 sm:px-6" style={{ borderColor: "var(--border)" }}>
        {loading ? <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading departures…</p> : null}
        {!loading && error ? (
          <div className="rounded-xl border p-4 sm:p-5" role="alert" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
            <p className="text-sm font-semibold">{setupRequired ? "Date-price setup is still pending" : "Could not load departure prices"}</p>
            <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--text-secondary)" }}>
              {setupRequired
                ? "This database has not received the new pricing migration. Base voyage prices still work, but date-price editing needs a separate local or staging database with the migration applied before you can test it safely."
                : error}
            </p>
            <ActionButton variant="outline" icon={RotateCcw} className="mt-4" onClick={() => setReloadKey(key => key + 1)}>Try again</ActionButton>
          </div>
        ) : null}
        {!loading && !error && dates.length === 0 ? (
          <p className="rounded-xl border p-5 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            No bookable departures for this cabin in {monthLabel(month)}. Choose another month or voyage.
          </p>
        ) : null}
        {!loading && !error && dates.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="admin-heading text-base">{monthLabel(month)} departures</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {dates.length} {dates.length === 1 ? "sailing" : "sailings"} · prices are per cabin
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                <div className="w-40"><MoneyInput id="month-date-price" label="Price for all dates" valueCents={monthPrice} onChangeCents={setMonthPrice} /></div>
                <ActionButton variant="outline" disabled={monthPrice < 100 || monthPrice > 100_000_000 || saving || !dates.some(date => date.availableCabins > 0)}
                  onClick={() => setDrafts(current => ({ ...current, ...Object.fromEntries(
                    dates.filter(date => date.availableCabins > 0).map(date => [date.scheduleId, monthPrice]),
                  ) }))}>Apply to available dates</ActionButton>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <div className="hidden grid-cols-[minmax(170px,1.2fr)_minmax(100px,0.65fr)_minmax(150px,1fr)_minmax(80px,0.4fr)] gap-4 border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide md:grid"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>
                <span>Departure / availability</span><span>Base price</span><span>Price for this date</span><span>Reset</span>
              </div>
              {dates.map(date => {
                const price = drafts[date.scheduleId];
                const changed = price !== date.overridePriceCents;
                const soldOut = date.availableCabins === 0;
                return (
                  <div key={date.scheduleId} className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[minmax(170px,1.2fr)_minmax(100px,0.65fr)_minmax(150px,1fr)_minmax(80px,0.4fr)] md:items-center md:gap-4"
                    style={{ borderColor: "var(--border)", background: changed ? "var(--sidebar-active)" : undefined }}>
                    <div>
                      <p className="text-sm font-semibold">{new Date(`${date.date}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                      <p className="mt-0.5 text-xs" style={{ color: soldOut ? "var(--text-muted)" : "var(--text-secondary)" }}>{soldOut ? "Sold out" : `${date.availableCabins} cabins available`}</p>
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}><span className="md:hidden">Base price · </span>{formatPrice(date.basePriceCents)}</div>
                    <MoneyInput id={`date-price-${date.scheduleId}`} label={changed ? "Unsaved price" : "Date price"}
                      valueCents={price ?? 0} disabled={soldOut || saving}
                      onChangeCents={cents => setDrafts(current => ({ ...current, [date.scheduleId]: cents }))} />
                    <button type="button" className="min-h-10 justify-self-start text-xs underline disabled:opacity-40" disabled={soldOut || saving || price === null}
                      onClick={() => setDrafts(current => ({ ...current, [date.scheduleId]: null }))}>Use base</button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {changes.length ? `${changes.length} unsaved ${changes.length === 1 ? "change" : "changes"}` : "No unsaved changes"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {changes.length > 0 ? <ActionButton variant="outline" icon={RotateCcw} disabled={saving}
                  onClick={() => setDrafts(Object.fromEntries(dates.map(date => [date.scheduleId, date.overridePriceCents])))}>Undo</ActionButton> : null}
                <ActionButton icon={saving ? Loader2 : Save} disabled={!changes.length || invalid || saving}
                  onClick={() => void save()}>{saving ? "Saving…" : `Save ${changes.length} ${changes.length === 1 ? "change" : "changes"}`}</ActionButton>
              </div>
            </div>
            {invalid ? <p className="mt-2 text-xs" style={{ color: "var(--danger)" }}>Use a price from $1 to $1,000,000.</p> : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
