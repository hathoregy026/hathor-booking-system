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
  serviceChargeCents: number;
  totalCents: number;
  serviceChargeRate: number;
};

export function computeBookingTotals(
  subtotalCents: number,
  serviceChargeRate = getServiceChargeRate(),
): BookingTotals {
  const serviceChargeCents = Math.round(subtotalCents * serviceChargeRate);
  return {
    subtotalCents,
    serviceChargeCents,
    totalCents: subtotalCents + serviceChargeCents,
    serviceChargeRate,
  };
}

export function formatServiceChargePercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
