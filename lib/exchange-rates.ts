import "server-only";
import { z } from "zod";
import { exchangeRatesSchema, rateDateSchema, type ExchangeRates } from "@/lib/currency";

const feedSchema = z.array(z.object({
  date: rateDateSchema,
  base: z.literal("USD"),
  quote: z.enum(["EUR", "GBP", "EGP", "RUB"]),
  rate: z.number().finite().positive().max(1_000_000),
})).length(4);

let cached: { value: ExchangeRates; expiresAt: number } | null = null;
let pending: Promise<ExchangeRates> | null = null;
let retryAt = 0;

/** Fixed upstream URL; requests cannot control the host, base, or currency list. */
export async function getExchangeRates(): Promise<ExchangeRates> {
  if (cached && cached.expiresAt > Date.now() && exchangeRatesSchema.safeParse(cached.value).success) return cached.value;
  if (pending) return pending;
  if (Date.now() < retryAt) throw new Error("Exchange rates temporarily unavailable");
  pending = (async () => {
    try {
      const response = await fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP,EGP,RUB", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 3600 },
      });
      if (!response.ok) throw new Error("Exchange rate feed failed");
      const rows = feedSchema.parse(await response.json());
      if (new Set(rows.map(row => row.quote)).size !== 4) throw new Error("Incomplete exchange rate feed");
      const value = exchangeRatesSchema.parse({
        base: "USD",
        rates: { USD: 1, ...Object.fromEntries(rows.map(row => [row.quote, row.rate])) },
        dates: Object.fromEntries(rows.map(row => [row.quote, row.date])),
      });
      cached = { value, expiresAt: Date.now() + 60 * 60 * 1000 };
      return value;
    } catch {
      retryAt = Date.now() + 60_000;
      // An outage must never silently relabel a USD amount as another currency.
      throw new Error("Exchange rates temporarily unavailable");
    } finally {
      pending = null;
    }
  })();
  return pending;
}
