/** Historia-style rate plans — non-refundable is 10% below standard website rate. */
export type RatePlanId = "standard" | "non-refundable";

export const NON_REFUNDABLE_DISCOUNT_RATE = 0.1;

export function applyRatePlan(
  basePriceCents: number,
  plan: RatePlanId,
): number {
  if (plan === "non-refundable") {
    return Math.round(basePriceCents * (1 - NON_REFUNDABLE_DISCOUNT_RATE));
  }
  return basePriceCents;
}

export function standardRateLabel(durationLabel: string): string {
  return `Hathor Website ${durationLabel}`;
}

export function nonRefundableRateLabel(durationLabel: string): string {
  return `Non Refundable - ${durationLabel}`;
}
