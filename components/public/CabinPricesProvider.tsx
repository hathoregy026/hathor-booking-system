"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CabinPriceTable } from "@/lib/cabin-prices-shared";

/** undefined: no provider above; null: the server could not read the prices. */
const CabinPricesContext = createContext<CabinPriceTable | null | undefined>(undefined);

export function CabinPricesProvider({ prices, children }: { prices: CabinPriceTable | null; children: ReactNode }) {
  return <CabinPricesContext.Provider value={prices}>{children}</CabinPricesContext.Provider>;
}

let pending: Promise<CabinPriceTable | null> | null = null;
function fetchPrices(): Promise<CabinPriceTable | null> {
  pending ??= fetch("/api/cabin-prices")
    .then(response => (response.ok ? response.json() : { prices: null }))
    .then((data: { prices: CabinPriceTable | null }) => data.prices)
    .catch(() => null);
  return pending;
}

/**
 * The dashboard's cabin prices. Pages under the public layout get them with
 * the page; anything outside it (the cart) asks once. Null until known —
 * callers keep their published prices meanwhile.
 */
export function useCabinPrices(): CabinPriceTable | null {
  const provided = useContext(CabinPricesContext);
  const [fetched, setFetched] = useState<CabinPriceTable | null>(null);
  useEffect(() => {
    if (provided !== undefined) return;
    let alive = true;
    void fetchPrices().then(prices => {
      if (alive) setFetched(prices);
    });
    return () => {
      alive = false;
    };
  }, [provided]);
  return provided === undefined ? fetched : provided;
}
