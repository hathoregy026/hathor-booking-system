import assert from "node:assert/strict";
import { CURRENCIES, convertUsdCents, exchangeRatesSchema, formatCurrency, isCurrency } from "../lib/currency.ts";

// Deterministic test rates, deliberately different from live rates.
const today = new Date().toISOString().slice(0, 10);
const rates = exchangeRatesSchema.parse({
  base: "USD",
  rates: { USD: 1, EUR: 0.9, GBP: 0.75, EGP: 50, RUB: 80 },
  dates: { EUR: today, GBP: today, EGP: today, RUB: today },
});
const original = JSON.stringify(rates);
assert.deepEqual(CURRENCIES.map(item => item.code), ["EUR", "USD", "GBP", "EGP", "RUB"]);
for (const code of CURRENCIES.map(item => item.code)) assert.ok(isCurrency(code));
for (const input of [null, undefined, "JPY", "usd", "__proto__", "<script>", {}, 1]) assert.equal(isCurrency(input), false);
assert.equal(formatCurrency(700000), "$7,000.00");
assert.equal(formatCurrency(700000, "USD", null, "money"), "USD 7,000");
assert.equal(formatCurrency(700001, "USD", null, "money"), "USD 7,000.01");
assert.equal(formatCurrency(700000, "EUR", rates, "money"), "≈ EUR 6,300");
assert.equal(formatCurrency(700000, "GBP", rates), "≈ £5,250.00");
assert.equal(formatCurrency(700000, "EGP", rates, "money"), "≈ EGP 350,000");
assert.equal(formatCurrency(700000, "RUB", rates, "money"), "≈ RUB 560,000");
assert.equal(convertUsdCents(101, "GBP", rates), 76);
assert.equal(convertUsdCents(0, "RUB", rates), 0);
assert.equal(convertUsdCents(700000, "USD", null), 700000);
assert.throws(() => convertUsdCents(100, "EUR", null));
for (const cents of [NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => convertUsdCents(cents, "USD", null));
assert.throws(() => convertUsdCents(Number.MAX_SAFE_INTEGER, "RUB", rates));
assert.equal(JSON.stringify(rates), original, "Display conversion must never modify source rates or USD prices");
for (const bad of [0, -1, NaN, Infinity, 1_000_001, "0.9"]) {
  assert.equal(exchangeRatesSchema.safeParse({ ...rates, rates: { ...rates.rates, EUR: bad } }).success, false);
}
assert.equal(exchangeRatesSchema.safeParse({ ...rates, base: "EUR" }).success, false);
assert.equal(exchangeRatesSchema.safeParse({ ...rates, rates: { USD: 1, EUR: 0.9, GBP: 0.75, RUB: 80 } }).success, false);
assert.equal(exchangeRatesSchema.safeParse({ ...rates, dates: { ...rates.dates, RUB: "2020-01-01" } }).success, false);
assert.equal(exchangeRatesSchema.safeParse({ ...rates, dates: { ...rates.dates, RUB: "2099-01-01" } }).success, false);
assert.equal(exchangeRatesSchema.safeParse({ ...rates, dates: { ...rates.dates, RUB: "2026-02-30" } }).success, false);
console.log("Currency checks passed: all five currencies, rounding, USD integrity, validation, stale rates and unavailable rates.");
