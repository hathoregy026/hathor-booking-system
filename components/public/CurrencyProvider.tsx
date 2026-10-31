"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { exchangeRatesSchema, formatCurrency, isCurrency, type Currency, type ExchangeRates } from "@/lib/currency";
import { CURRENCY_COPY } from "@/lib/i18n/currency-copy";
import { splitLocalePath, type PublicLocale } from "@/lib/i18n/locale";

const STORAGE_KEY = "hathor-display-currency-v1";
type Snapshot = { preferred: Currency; rates: ExchangeRates | null; status: "loading" | "ready" | "error" };
const initial: Snapshot = { preferred: "USD", rates: null, status: "loading" };
let snapshot = initial;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const emit = (next: Snapshot) => { snapshot = next; listeners.forEach(listener => listener()); };

async function loadRates() {
  if (pending) return pending;
  emit({ ...snapshot, status: "loading" });
  pending = (async () => {
    try {
      const response = await fetch("/api/exchange-rates", { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error("Rates unavailable");
      const rates = exchangeRatesSchema.parse(await response.json());
      emit({ ...snapshot, rates, status: "ready" });
    } catch {
      emit({ ...snapshot, rates: null, status: "error" });
    } finally { pending = null; }
  })();
  return pending;
}

function selectCurrency(currency: Currency) {
  if (!isCurrency(currency) || (currency !== "USD" && !snapshot.rates)) return;
  emit({ ...snapshot, preferred: currency });
  try { localStorage.setItem(STORAGE_KEY, currency); } catch { /* The preference still works in memory. */ }
}

function useCurrencyState(locale: PublicLocale) {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  return useMemo(() => {
    const currency = state.rates ? state.preferred : "USD";
    return {
      ...state, currency, locale, selectCurrency, retry: loadRates,
      formatPrice: (cents: number) => formatCurrency(cents, currency, state.rates, "price", locale),
      money: (cents: number) => formatCurrency(cents, currency, state.rates, "money", locale),
    };
  }, [state, locale]);
}
type CurrencyContextValue = ReturnType<typeof useCurrencyState>;
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const value = useCurrencyState(splitLocalePath(pathname).locale);
  useEffect(() => {
    if (isAdmin) return;
    const restore = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        emit({ ...snapshot, preferred: isCurrency(saved) ? saved : "USD" });
      } catch { /* Storage can be disabled without breaking the site. */ }
    };
    restore();
    if (!snapshot.rates) void loadRates();
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) restore(); };
    const refresh = () => { if (document.visibilityState === "visible") void loadRates(); };
    const timer = window.setInterval(() => void loadRates(), 60 * 60 * 1000);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [isAdmin]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("CurrencyProvider is required");
  return value;
}

/** Can be rendered inside a Server Component, including the booking receipt. */
export function CurrencyAmount({ cents }: { cents: number }) {
  const { money } = useCurrency();
  return <>{money(cents)}</>;
}

export function CurrencySettlementNote({ cents }: { cents?: number }) {
  const { currency, locale } = useCurrency();
  if (currency === "USD") return null;
  const usdTotal = cents === undefined ? null : formatCurrency(cents, "USD", null, "money", locale);
  return <p className="hathor-currency-settlement">{CURRENCY_COPY[locale].settlement(currency, usdTotal)}</p>;
}
