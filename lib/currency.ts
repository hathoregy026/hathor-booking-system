import { z } from "zod";
import type { PublicLocale } from "@/lib/i18n/locale";

export const CURRENCIES = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "US dollar", symbol: "$" },
  { code: "GBP", name: "British pound", symbol: "£" },
  { code: "EGP", name: "Egyptian pound", symbol: "E£" },
  { code: "RUB", name: "Russian ruble", symbol: "₽" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["code"];
export const currencySchema = z.enum(["EUR", "USD", "GBP", "EGP", "RUB"]);
const rateSchema = z.number().finite().positive().max(1_000_000);
export const RATE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const rateDateSchema = z.iso.date().refine(value => {
  const age = Date.now() - Date.parse(`${value}T00:00:00Z`);
  return age >= -24 * 60 * 60 * 1000 && age <= RATE_MAX_AGE_MS;
}, "Exchange rate is out of date");

export const exchangeRatesSchema = z.object({
  base: z.literal("USD"),
  rates: z.object({ USD: z.literal(1), EUR: rateSchema, GBP: rateSchema, EGP: rateSchema, RUB: rateSchema }),
  dates: z.object({ EUR: rateDateSchema, GBP: rateDateSchema, EGP: rateDateSchema, RUB: rateDateSchema }),
});
export type ExchangeRates = z.infer<typeof exchangeRatesSchema>;

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.some(currency => currency.code === value);
}

/** Only a display conversion. All booking arithmetic and writes remain integer USD cents. */
export function convertUsdCents(cents: number, currency: Currency, rates: ExchangeRates | null): number {
  if (!Number.isSafeInteger(cents)) throw new RangeError("Expected integer USD cents");
  if (currency !== "USD" && !rates) throw new Error("Exchange rates are unavailable");
  const converted = Math.round(cents * (currency === "USD" ? 1 : rates!.rates[currency]));
  if (!Number.isSafeInteger(converted)) throw new RangeError("Converted amount is too large");
  return converted;
}

export function formatCurrency(cents: number, currency: Currency = "USD", rates: ExchangeRates | null = null, style: "price" | "money" = "price", locale: PublicLocale = "en"): string {
  const converted = convertUsdCents(cents, currency, rates);
  const grouped = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: style === "price" || converted % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(converted / 100);
  // Italian pages swap the separators ($7.000,00), as every other Italian price does.
  const amount = locale === "it" ? grouped.replace(/[,.]/g, mark => (mark === "," ? "." : ",")) : grouped;
  // Explicit ISO codes disambiguate the Egyptian and British pound.
  const prefix = style === "money" || currency === "EGP" || currency === "RUB"
    ? `${currency} `
    : CURRENCIES.find(item => item.code === currency)!.symbol;
  return `${currency === "USD" ? "" : "≈ "}${prefix}${amount}`;
}
