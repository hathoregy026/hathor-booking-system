const dayMs = 86_400_000;

/** Integer cents, so a stage never lands a cent away from the database's. */
const share = (total: number, percent: number) => Math.ceil((total * percent) / 100);

/**
 * Stages depend on how far ahead the guest books, and mirror
 * hathor_acquire_hold, which stores the authoritative rows:
 *   over 60 days   30% now, 50% cumulative at 60 days, all of it at 45 days
 *   46 to 60 days  50% now, then the rest at 45 days
 *   45 days or less  the full amount
 *
 * Pure and dependency-free so the booking screens can preview the same plan
 * before any cabin is held.
 */
export function paymentSchedule(total: number, departure: Date, now = new Date()) {
  const days = Math.round((Date.UTC(departure.getUTCFullYear(), departure.getUTCMonth(), departure.getUTCDate()) -
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / dayMs);
  const day60 = new Date(departure.getTime() - 60 * dayMs);
  const day45 = new Date(departure.getTime() - 45 * dayMs);

  return {
    requiredCents: days <= 45 ? total : share(total, days <= 60 ? 50 : 30),
    milestones: days > 60
      ? [
          { milestone: "INITIAL", dueAt: null, cumulativeCents: share(total, 30) },
          { milestone: "DAY_60", dueAt: day60, cumulativeCents: share(total, 50) },
          { milestone: "DAY_45", dueAt: day45, cumulativeCents: total },
        ]
      : days > 45
        ? [
            { milestone: "INITIAL", dueAt: null, cumulativeCents: share(total, 50) },
            { milestone: "DAY_45", dueAt: day45, cumulativeCents: total },
          ]
        : [{ milestone: "INITIAL", dueAt: null, cumulativeCents: total }],
  };
}
