import { BOOKING_COPY } from "@/lib/i18n/booking-copy";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { PaymentStage } from "./model";

/** The three plans (lib/payment-schedule.ts and hathor_acquire_hold decide which applies). */
const PLAN_STAGES = [3, 2, 1] as const;

/**
 * The whole payment map: each invoice with its own amount and share, when it
 * falls due, and the running total — plus which plan applies and why. Amounts
 * come from the stages the booking engine gives (cumulative), so they always
 * match what Hathor invoices. Rendered on the server (result page) and in the
 * journey, so the language comes in as a prop.
 */
export function PaymentPlan({ stages, paidCents = 0, locale = "en" }: { stages: PaymentStage[]; paidCents?: number; locale?: PublicLocale }) {
  if (stages.length === 0) return null;
  const t = BOOKING_COPY[locale];
  const total = stages[stages.length - 1].cumulativeCents;
  const names = t.plan.names[stages.length as 1 | 2 | 3] ?? stages.map((_, index) => t.plan.invoice(index + 1));

  return (
    <div className="hj-payplan">
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
                {t.money(amount)}
                <small>{paid ? t.plan.paid : stages.length > 1 ? t.plan.paidByThen(t.money(stage.cumulativeCents)) : t.plan.whole}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="hj-payplan__rules" aria-label={t.plan.rulesLabel}>
        {PLAN_STAGES.map(plan => (
          <li key={plan} aria-current={plan === stages.length ? "true" : undefined}>
            {t.plan.rules[plan]}
          </li>
        ))}
      </ul>
    </div>
  );
}
