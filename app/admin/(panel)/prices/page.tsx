"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { MoneyInput } from "@/components/admin/MoneyInput";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/client-dates";

type Voyage = { cruiseId: string; slug: string; name: string; prices: Record<string, number>; updatedAt: string | null };
type Cabin = { roomType: string; cabins: number; sizeSqm: number | null; capacity: number };
type PricesResponse = { voyages: Voyage[]; cabins: Cabin[] };

const priceKey = (cruiseId: string, roomType: string) => `${cruiseId}|${roomType}`;

/**
 * Dashboard → Prices & Cabins. One grid: each voyage's price per cabin (for
 * the whole voyage), as the booking charges it, and each cabin type's size.
 * Saving updates the booking at once, and the room cards, listings, cart and
 * homepage on their next load.
 */
export default function AdminPricesPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PricesResponse | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const adopt = useCallback((next: PricesResponse) => {
    setData(next);
    setPrices(Object.fromEntries(next.voyages.flatMap(voyage => Object.entries(voyage.prices).map(([type, cents]) => [priceKey(voyage.cruiseId, type), cents]))));
    setSizes(Object.fromEntries(next.cabins.map(cabin => [cabin.roomType, cabin.sizeSqm ?? 0])));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await adminFetch("/api/admin/cabin-prices", { cache: "no-store" });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Could not load prices");
      adopt((await response.json()) as PricesResponse);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load prices");
    } finally {
      setLoading(false);
    }
  }, [adopt]);

  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/cabin-prices", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Could not load prices");
        return response.json() as Promise<PricesResponse>;
      })
      .then(next => {
        if (active) adopt(next);
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load prices");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [adopt]);

  const changedPrices = useMemo(() => {
    if (!data) return [];
    return data.voyages.flatMap(voyage =>
      Object.entries(voyage.prices)
        .filter(([type, cents]) => prices[priceKey(voyage.cruiseId, type)] !== cents)
        .map(([type]) => ({ cruiseId: voyage.cruiseId, roomType: type, priceCents: prices[priceKey(voyage.cruiseId, type)] })),
    );
  }, [data, prices]);
  const changedSizes = useMemo(
    () => (data ? data.cabins.filter(cabin => sizes[cabin.roomType] !== (cabin.sizeSqm ?? 0)).map(cabin => ({ roomType: cabin.roomType, sizeSqm: sizes[cabin.roomType] })) : []),
    [data, sizes],
  );
  const invalid = changedPrices.some(price => !price.priceCents || price.priceCents < 100) || changedSizes.some(size => !size.sizeSqm || size.sizeSqm < 5 || size.sizeSqm > 500);
  const dirty = changedPrices.length + changedSizes.length > 0;

  async function save() {
    if (!dirty || invalid) return;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/cabin-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: changedPrices, sizes: changedSizes }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Could not save");
      adopt((await response.json()) as PricesResponse);
      showToast("success", "Saved. The booking uses the new prices now; room cards and listings follow on their next load.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not save prices");
    } finally {
      setSaving(false);
    }
  }

  const roomTypes = data?.cabins.map(cabin => cabin.roomType) ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="admin-page-title">Prices &amp; Cabins</h1>
        <p className="admin-page-subtitle">
          The price of each cabin for the whole voyage, exactly as the booking charges it, and each cabin type&rsquo;s size.
        </p>
      </div>

      {loading ? (
        <div className="admin-card flex items-center gap-2 p-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          <Loader2 className="h-4 w-4 animate-spin" /> Loading prices…
        </div>
      ) : loadError ? (
        <div className="admin-card space-y-3 p-6 text-sm">
          <p style={{ color: "var(--danger)" }}>{loadError}</p>
          <ActionButton variant="outline" icon={RotateCcw} onClick={() => void load()}>Try again</ActionButton>
        </div>
      ) : data ? (
        <>
          <div className="admin-card overflow-x-auto p-4 sm:p-6">
            <h2 className="admin-heading text-sm">Price per cabin, entire voyage</h2>
            <table className="mt-4 w-full min-w-[640px] border-separate" style={{ borderSpacing: "0 0.5rem" }}>
              <thead>
                <tr className="text-left text-xs" style={{ color: "var(--text-secondary)" }}>
                  <th className="pr-3 font-medium">Cabin type</th>
                  {data.voyages.map(voyage => (
                    <th key={voyage.cruiseId} className="px-2 font-medium">
                      {voyage.name}
                      {voyage.updatedAt ? (
                        <span className="block text-[11px] font-normal opacity-70">
                          Updated {new Date(voyage.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roomTypes.map(type => (
                  <tr key={type}>
                    <th scope="row" className="pr-3 text-left text-sm font-medium">{type}</th>
                    {data.voyages.map(voyage => {
                      const key = priceKey(voyage.cruiseId, type);
                      const saved = voyage.prices[type];
                      if (saved === undefined) {
                        return <td key={key} className="px-2 text-xs" style={{ color: "var(--text-secondary)" }}>Not sold on this voyage</td>;
                      }
                      const changed = prices[key] !== saved;
                      return (
                        <td key={key} className="px-2 align-top">
                          <MoneyInput
                            id={`price-${key}`}
                            label={changed ? `Was ${formatPrice(saved)}` : "Price"}
                            valueCents={prices[key] ?? 0}
                            onChangeCents={cents => setPrices(current => ({ ...current, [key]: cents }))}
                            className={changed ? "ring-1 ring-[var(--warning)] rounded-md" : ""}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              New prices apply to every request sent from now on, and the booking recalculates totals and payment stages from them.
              Requests already sent keep the price they were sent with. The voyage&rsquo;s &ldquo;from&rdquo; price follows its lowest cabin price.
            </p>
          </div>

          <div className="admin-card p-4 sm:p-6">
            <h2 className="admin-heading text-sm">Cabin types</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.cabins.map(cabin => {
                const changed = sizes[cabin.roomType] !== (cabin.sizeSqm ?? 0);
                return (
                  <div key={cabin.roomType} className="rounded-lg border p-3" style={{ borderColor: changed ? "var(--warning)" : "var(--border)" }}>
                    <p className="text-sm font-medium">{cabin.roomType}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {cabin.cabins} {cabin.cabins === 1 ? "cabin" : "cabins"} on board · up to {cabin.capacity} guests each
                    </p>
                    <div className="admin-field mt-3">
                      <input
                        id={`size-${cabin.roomType}`}
                        type="number"
                        min={5}
                        max={500}
                        inputMode="numeric"
                        value={sizes[cabin.roomType] || ""}
                        onChange={event => setSizes(current => ({ ...current, [cabin.roomType]: Number.parseInt(event.target.value, 10) || 0 }))}
                        placeholder=" "
                        className="admin-input w-full text-sm"
                      />
                      <label className="admin-field__label" htmlFor={`size-${cabin.roomType}`}>Size (m²)</label>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              Sizes show on the booking&rsquo;s cabin cards and preview. Guests per cabin are part of the booking rules, so they are shown here but not edited.
              Cabin names, numbers and descriptions are edited in <Link className="underline" href="/admin/cruises">Cruises</Link>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton icon={saving ? Loader2 : Save} onClick={() => void save()} disabled={!dirty || invalid || saving} className="px-5 py-2.5 text-sm">
              {saving ? "Saving…" : dirty ? `Save ${changedPrices.length + changedSizes.length} ${changedPrices.length + changedSizes.length === 1 ? "change" : "changes"}` : "No changes"}
            </ActionButton>
            {dirty ? (
              <ActionButton variant="outline" icon={RotateCcw} onClick={() => adopt(data)} disabled={saving} className="px-4 py-2.5 text-sm">
                Undo changes
              </ActionButton>
            ) : null}
            {invalid ? (
              <span className="text-xs" style={{ color: "var(--danger)" }}>Every price needs at least $1, and sizes 5–500 m².</span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
