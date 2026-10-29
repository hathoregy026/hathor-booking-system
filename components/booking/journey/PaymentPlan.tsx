"use client";

import { BOOKING_COPY } from "@/lib/i18n/booking-copy";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { PaymentStage } from "./model";
import { CurrencySettlementNote, useCurrency } from "@/components/public/CurrencyProvider";

/** The three plans (lib/payment-schedule.ts and hathor_acquire_hold decide which applies). */
const PLAN_STAGES = [3, 2, 1] as const;

/**
 * The whole payment map: each invoice with its own amount and share, when it
 * falls due, and the running total — plus which plan applies and why. Amounts
 * come from the stages the booking engine gives (cumulative), so they always
 * match what Hathor invoices. Shown on the result page and in the
 * journey, so the language comes in as a prop.
 */
export function PaymentPlan({ stages, paidCents = 0, locale = "en" }: { stages: PaymentStage[]; paidCents?: number; locale?: PublicLocale }) {
  const { money } = useCurrency();
  if (stages.length === 0) return null;
  const t = BOOKING_COPY[locale];
  const total = stages[stages.length - 1].cumulativeCents;
  const names = t.plan.names[stages.length as 1 | 2 | 3] ?? stages.map((_, index) => t.plan.invoice(index + 1));
  /** Hathor set this booking's first payment and balance date itself, so no standard plan applies. */
  const custom = stages.some(stage => stage.milestone === "BALANCE");

  return (
    <div className="hj-payplan">
      <CurrencySettlementNote cents={total} />
      <ol className="hj-payplan__steps">
        {stages.map((stage, index) => {
          const amount = stage.cumulativeCents - (index === 0 ? 0 : stages[index - 1].cumulativeCents);
          const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
          const paid = paidCents > 0 && paidCents >= stage.cumulativeCents;
          return (
            <li key={stage.milestone} className={`hj-payplan__step${paid ? " hj-payplan__step--paid" : ""}`}>
              <span className="hj-payplan__num" aria-hidden>{paid ? "✓" : index + 1}</span>
              <span className="hj-payplan__body">
                <span className="hj-payplan__title">{names[index]} · {percent}%</span>
                <span className="hj-payplan__when">{t.stageLabel(stage)}</span>
              </span>
              <span className="hj-payplan__amount">
                {money(amount)}
                <small>{paid ? t.plan.paid : stages.length > 1 ? t.plan.paidByThen(money(stage.cumulativeCents)) : t.plan.whole}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="hj-payplan__rules" aria-label={t.plan.rulesLabel}>
        {custom ? (
          <li aria-current="true">{t.plan.custom}</li>
        ) : (
          PLAN_STAGES.map(plan => (
            <li key={plan} aria-current={plan === stages.length ? "true" : undefined}>
              {t.plan.rules[plan]}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
