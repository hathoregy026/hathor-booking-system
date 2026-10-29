/**
 * Online card payments (Visa / credit card) carry this surcharge on top of the
 * cabin quote; bank transfers carry none. The database snapshots it with the
 * request ("cardSurchargeCents"), so the guest owes quote + surcharge and the
 * recorded payments include it. Keep in step with hathor_submit_request.
 */
export const CARD_SURCHARGE_PERCENT = 2.5;

export function cardSurchargeCents(amountCents: number): number {
  return Math.round((amountCents * CARD_SURCHARGE_PERCENT) / 100);
}

/** Moves a cumulative schedule from one amount owed to another, exactly as hathor_rescale_schedule does. */
export function rescaleSchedule<T extends { cumulativeCents: number }>(stages: T[], fromCents: number, toCents: number): T[] {
  if (fromCents <= 0 || fromCents === toCents) return stages;
  return stages.map(stage => ({
    ...stage,
    cumulativeCents: stage.cumulativeCents >= fromCents ? toCents : Math.ceil((stage.cumulativeCents * toCents) / fromCents),
  }));
}

/** Each payment carries its share of the surcharge, as the database stores it with a Visa request. */
export function withCardSurcharge<T extends { cumulativeCents: number }>(stages: T[], quoteCents: number, surchargeCents: number): T[] {
  return surchargeCents > 0 ? rescaleSchedule(stages, quoteCents, quoteCents + surchargeCents) : stages;
}
