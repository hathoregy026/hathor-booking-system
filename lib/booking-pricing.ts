export type BookingTotals = {
  subtotalCents: number;
  totalCents: number;
};

/** Room rate is the final checkout total (no tax or service add-ons). */
export function computeBookingTotals(subtotalCents: number): BookingTotals {
  return {
    subtotalCents,
    totalCents: subtotalCents,
  };
}
