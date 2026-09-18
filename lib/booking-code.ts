const CODE_PATTERN = /^HB-?([0-9A-Z]{8})$/i;

/** The short reference guests quote and type to track a booking: HB- plus the id's first 8 characters. */
export function bookingCode(id: string): string {
  return `HB-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** A typed reference is either a booking code (matched by id prefix) or a full id. */
export function parseBookingReference(input: string): { prefix: string } | { id: string } {
  const value = input.trim();
  const code = CODE_PATTERN.exec(value);
  return code ? { prefix: code[1]!.toLowerCase() } : { id: value };
}

export type PaymentPlanStage = {
  milestone: string;
  dueAt: string | null;
  cumulativeCents: number;
  amountCents: number;
  state: "paid" | "due" | "upcoming";
};

/** Splits the cumulative schedule into what each stage asks for, and how much of it is covered. */
export function paymentPlan(
  stages: { milestone: string; dueAt: string | Date | null; cumulativeCents: number }[],
  paidCents: number,
): PaymentPlanStage[] {
  const ordered = [...stages].sort((a, b) => a.cumulativeCents - b.cumulativeCents);
  let previous = 0;
  let dueMarked = false;
  return ordered.map(stage => {
    const amountCents = stage.cumulativeCents - previous;
    previous = stage.cumulativeCents;
    let state: PaymentPlanStage["state"] = "upcoming";
    if (paidCents >= stage.cumulativeCents) state = "paid";
    else if (!dueMarked) { state = "due"; dueMarked = true; }
    const dueAt = stage.dueAt instanceof Date ? stage.dueAt.toISOString() : stage.dueAt;
    return { milestone: stage.milestone, dueAt, cumulativeCents: stage.cumulativeCents, amountCents, state };
  });
}

export function stageTitle(milestone: string): string {
  if (milestone === "INITIAL") return "Deposit to confirm";
  if (milestone === "DAY_60") return "Second payment · 60 days before";
  if (milestone === "DAY_45") return "Final balance · 45 days before";
  return milestone;
}
