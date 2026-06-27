/** Default service charge rate (15%) — configurable via env. */
export const DEFAULT_SERVICE_CHARGE_RATE = 0.15;

export function getServiceChargeRate(): number {
  const raw = process.env.NEXT_PUBLIC_BOOKING_SERVICE_CHARGE_RATE;
  if (!raw) return DEFAULT_SERVICE_CHARGE_RATE;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_SERVICE_CHARGE_RATE;
  }
  return parsed;
}

export type BookingTotals = {
  subtotalCents: number;
  taxCents: number;
  taxRate: number;
  serviceChargeCents: number;
  totalCents: number;
  serviceChargeRate: number;
};

/** Default tourism/VAT display rate for checkout breakdown (UI only until payment integration). */
export const DEFAULT_TAX_RATE = 0.14;

export function getTaxRate(): number {
  const raw = process.env.NEXT_PUBLIC_BOOKING_TAX_RATE;
  if (!raw) return DEFAULT_TAX_RATE;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TAX_RATE;
  }
  return parsed;
}

export function formatTaxPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function computeBookingTotals(
  subtotalCents: number,
  serviceChargeRate = getServiceChargeRate(),
  taxRate = getTaxRate(),
): BookingTotals {
  const taxCents = Math.round(subtotalCents * taxRate);
  const serviceChargeCents = Math.round(subtotalCents * serviceChargeRate);
  return {
    subtotalCents,
    taxCents,
    taxRate,
    serviceChargeCents,
    totalCents: subtotalCents + taxCents + serviceChargeCents,
    serviceChargeRate,
  };
}

export function formatServiceChargePercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
