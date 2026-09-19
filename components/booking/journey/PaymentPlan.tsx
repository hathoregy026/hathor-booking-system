import { money, stageLabel, type PaymentStage } from "./model";

/** The three plans (lib/payment-schedule.ts and hathor_acquire_hold decide which applies). */
const PLANS = [
  { stages: 3, text: "Booked more than 60 days before departure: 30% with the first invoice, 20% by 60 days before, and the last 50% by 45 days before." },
  { stages: 2, text: "Booked 46 to 60 days before departure: 50% with the first invoice and the other 50% by 45 days before." },
  { stages: 1, text: "Booked 45 days or less before departure: the full amount with the first invoice." },
] as const;

const INVOICE_NAMES: Record<number, string[]> = {
  1: ["Full payment"],
  2: ["First invoice", "Final invoice"],
  3: ["First invoice", "Second invoice", "Final invoice"],
};

/**
 * The whole payment map: each invoice with its own amount and share, when it
 * falls due, and the running total — plus which plan applies and why. Amounts
 * come from the stages the booking engine gives (cumulative), so they always
 * match what Hathor invoices.
 */
export function PaymentPlan({ stages, paidCents = 0 }: { stages: PaymentStage[]; paidCents?: number }) {
  if (stages.length === 0) return null;
  const total = stages[stages.length - 1].cumulativeCents;
  const names = INVOICE_NAMES[stages.length] ?? stages.map((_, index) => `Invoice ${index + 1}`);

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
                <span className="hj-payplan__when">{stageLabel(stage)}</span>
              </span>
              <span className="hj-payplan__amount">
                {money(amount)}
                <small>{paid ? "Paid" : stages.length > 1 ? `${money(stage.cumulativeCents)} paid by then` : "The whole voyage"}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="hj-payplan__rules" aria-label="How payment is split">
        {PLANS.map(plan => (
          <li key={plan.stages} aria-current={plan.stages === stages.length ? "true" : undefined}>
            {plan.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
