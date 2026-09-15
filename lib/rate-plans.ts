/** The only supported fare is the published standard Hathor rate. */
export type RatePlanId = "standard";
export function applyRatePlan(priceCents: number, _plan: RatePlanId): number { return priceCents; }
export function standardRateLabel(durationLabel: string): string { return `Hathor Website ${durationLabel}`; }
