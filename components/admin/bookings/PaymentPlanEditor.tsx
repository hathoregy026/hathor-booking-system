"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { AdminBookingDto, AdminPaymentStage } from "@/lib/admin-bookings";
import { paymentPlan, stageTitle } from "@/lib/booking-code";
import { formatPrice } from "@/lib/client-dates";
import { paymentSchedule } from "@/lib/payment-schedule";

export type PlanPreset = "standard" | "full" | "custom";

export type StaffPlan = {
  totalCents: number;
  reason?: string;
  stages: { milestone: string; dueOn: string | null; cumulativeCents: number }[];
};

type Row = { key: number; milestone: string; title: string; dueOn: string; amount: string; locked: boolean };

/** "1234.5" → 123450 cents, or null when it is not a USD amount with at most two decimals. */
export function parseUsd(text: string): number | null {
  const value = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

const usd = (cents: number) => (cents / 100).toFixed(2);

const PRESETS: { id: PlanPreset; label: string; hint: string }[] = [
  { id: "standard", label: "Hathor schedule", hint: "Stages by how far ahead they booked" },
  { id: "full", label: "Pay in full", hint: "One payment for the whole balance" },
  { id: "custom", label: "Custom", hint: "Your own amounts and dates" },
];

/** The booking's standard stages at this total, from the day it was requested. */
function standardStages(booking: AdminBookingDto, totalCents: number): AdminPaymentStage[] {
  const requested = new Date(booking.requestedAt ?? booking.createdAt);
  return paymentSchedule(totalCents, new Date(booking.departureTime), requested).milestones.map(stage => ({
    milestone: stage.milestone,
    cumulativeCents: stage.cumulativeCents,
    dueAt: stage.dueAt ? stage.dueAt.toISOString() : null,
  }));
}

function fullStages(paidCents: number, totalCents: number): AdminPaymentStage[] {
  if (paidCents <= 0 || paidCents >= totalCents) return [{ milestone: "INITIAL", cumulativeCents: totalCents, dueAt: null }];
  return [
    { milestone: "INITIAL", cumulativeCents: paidCents, dueAt: null },
    { milestone: "Full balance", cumulativeCents: totalCents, dueAt: null },
  ];
}

let lastRowKey = 0;

function toRows(stages: AdminPaymentStage[], paidCents: number): Row[] {
  const plan = paymentPlan(stages, paidCents);
  return plan.map(stage => {
    lastRowKey += 1;
    return {
      key: lastRowKey,
      milestone: stage.milestone,
      title: stageTitle(stage.milestone, plan.length),
      dueOn: stage.dueAt?.slice(0, 10) ?? "",
      amount: usd(stage.amountCents),
      locked: stage.state === "paid",
    };
  });
}

function firstPreset(booking: AdminBookingDto, schedule: AdminPaymentStage[], totalCents: number): PlanPreset {
  if (booking.planCustomised || schedule.some(stage => stage.milestone === "BALANCE")) return "custom";
  return schedule.length === 1 && standardStages(booking, totalCents).length > 1 ? "full" : "standard";
}

/**
 * What the guest pays, as the team sets it: the total and every payment. The
 * first payment always stays the one that confirms the booking, and payments
 * already received cannot be changed.
 */
export function usePaymentPlanEditor(booking: AdminBookingDto, schedule: AdminPaymentStage[], baseTotalCents: number) {
  const [base, setBase] = useState(baseTotalCents);
  const [preset, setPreset] = useState<PlanPreset>(() => firstPreset(booking, schedule, baseTotalCents));
  const [total, setTotal] = useState(usd(baseTotalCents));
  const [reason, setReason] = useState("");
  const [rows, setRows] = useState<Row[]>(() => toRows(schedule, booking.paidCents));
  if (base !== baseTotalCents) {
    // The payment method moved the total (card surcharge): start again from the new amounts.
    setBase(baseTotalCents);
    setPreset(firstPreset(booking, schedule, baseTotalCents));
    setTotal(usd(baseTotalCents));
    setReason("");
    setRows(toRows(schedule, booking.paidCents));
  }

  function rebuild(next: PlanPreset, totalCents: number) {
    setRows(toRows(next === "full" ? fullStages(booking.paidCents, totalCents) : standardStages(booking, totalCents), booking.paidCents));
  }

  function choosePreset(next: PlanPreset) {
    setPreset(next);
    const totalCents = parseUsd(total);
    if (next !== "custom" && totalCents) rebuild(next, totalCents);
  }

  function changeTotal(text: string) {
    setTotal(text);
    const totalCents = parseUsd(text);
    if (preset !== "custom" && totalCents) rebuild(preset, totalCents);
  }

  function changeRow(key: number, change: Partial<Row>) {
    setPreset("custom");
    setRows(current => current.map(row => (row.key === key ? { ...row, ...change } : row)));
  }

  function addRow() {
    setPreset("custom");
    lastRowKey += 1;
    const key = lastRowKey;
    setRows(current => [...current, { key, milestone: "", title: "", dueOn: "", amount: "0.00", locked: false }]);
  }

  function removeRow(key: number) {
    setPreset("custom");
    setRows(current => current.filter(row => row.key !== key));
  }

  function fillLastRow() {
    const totalCents = parseUsd(total);
    if (!totalCents) return;
    const others = rows.slice(0, -1).reduce((sum, row) => sum + (parseUsd(row.amount) ?? 0), 0);
    const last = rows[rows.length - 1];
    if (last) changeRow(last.key, { amount: usd(Math.max(0, totalCents - others)) });
  }

  const summary = useMemo(() => {
    const totalCents = parseUsd(total);
    const sum = rows.reduce((value, row) => value + (parseUsd(row.amount) ?? 0), 0);
    const differenceCents = (totalCents ?? 0) - sum;
    const firstOpen = rows.find(row => !row.locked);
    const dueNowCents = firstOpen ? parseUsd(firstOpen.amount) ?? 0 : 0;

    const names = new Set<string>();
    const stages: StaffPlan["stages"] = [];
    let cumulative = 0;
    for (const [index, row] of rows.entries()) {
      cumulative += parseUsd(row.amount) ?? 0;
      const original = schedule.find(stage => stage.milestone === row.milestone);
      const untouched = original && stageTitle(row.milestone, rows.length) === row.title && (original.dueAt?.slice(0, 10) ?? "") === row.dueOn;
      // A renamed or re-dated standard stage must lose "· 45 days before", which no longer holds.
      let milestone = index === 0 ? "INITIAL" : untouched ? row.milestone : row.title.split(" · ")[0]!.trim();
      if (names.has(milestone.toLowerCase())) milestone = `${milestone} ${index + 1}`;
      names.add(milestone.toLowerCase());
      stages.push({ milestone, dueOn: index === 0 ? null : row.dueOn || null, cumulativeCents: cumulative });
    }

    let error: string | null = null;
    if (totalCents === null || totalCents <= 0) error = "Enter the booking total in USD, with at most two decimals.";
    else if (totalCents < booking.paidCents) error = `The total cannot be less than the ${formatPrice(booking.paidCents)} already received.`;
    else if (rows.some(row => (parseUsd(row.amount) ?? 0) <= 0)) error = "Every payment needs an amount above zero.";
    else if (stages.some(stage => !stage.milestone)) error = "Give every payment a name.";
    else if (differenceCents !== 0) error = differenceCents > 0 ? `${formatPrice(differenceCents)} short of the total.` : `${formatPrice(-differenceCents)} over the total.`;
    else if (totalCents !== baseTotalCents && !reason.trim()) error = "Say why the total changed.";

    const before = schedule.map(stage => ({ milestone: stage.milestone, dueOn: stage.milestone === "INITIAL" ? null : stage.dueAt?.slice(0, 10) ?? null, cumulativeCents: stage.cumulativeCents }));
    const changed = totalCents !== baseTotalCents || JSON.stringify(before) !== JSON.stringify(stages);
    const plan: StaffPlan | null = error || totalCents === null ? null : { totalCents, stages, ...(reason.trim() ? { reason: reason.trim() } : {}) };
    return { totalCents, differenceCents, dueNowCents, error, changed, plan };
  }, [rows, total, reason, schedule, baseTotalCents, booking.paidCents]);

  return { preset, total, reason, rows, baseTotalCents, ...summary, setReason, choosePreset, changeTotal, changeRow, addRow, removeRow, fillLastRow };
}

export function PaymentPlanEditor({ editor }: { editor: ReturnType<typeof usePaymentPlanEditor> }) {
  const open = editor.rows.filter(row => !row.locked).length;
  const totalChanged = editor.totalCents !== editor.baseTotalCents;
  return (
    <div className="bk-plan">
      <div className="bk-plan__choice" role="group" aria-label="How the guest pays">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={editor.preset === preset.id}
            className="bk-plan__option"
            onClick={() => editor.choosePreset(preset.id)}
          >
            <strong>{preset.label}</strong>
            <span>{preset.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Booking total (USD)</span>
          <input className="input mt-1.5 h-10 px-3 text-sm tabular" inputMode="decimal" value={editor.total} onChange={event => editor.changeTotal(event.target.value)} />
        </label>
        {totalChanged ? (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Why the total changed</span>
            <input className="input mt-1.5 h-10 px-3 text-sm" placeholder="e.g. Agreed discount" maxLength={300} value={editor.reason} onChange={event => editor.setReason(event.target.value)} />
          </label>
        ) : null}
      </div>

      <div>
        <div className="bk-plan__head" aria-hidden>
          <span>Payment</span>
          <span>Due</span>
          <span>Amount</span>
          <span />
        </div>
        <ol className="bk-plan__rows">
          {editor.rows.map((row, index) => (
            <li key={row.key} className="bk-plan__row">
              {row.locked ? (
                <>
                  <span className="bk-plan__fixed">{row.title}</span>
                  <span className="bk-plan__fixed">Received</span>
                  <span className="bk-plan__fixed tabular">{formatPrice(parseUsd(row.amount) ?? 0)}</span>
                </>
              ) : (
                <>
                  {index === 0 ? (
                    <span className="bk-plan__fixed">{editor.rows.length === 1 ? "Full payment" : "First payment · confirms the booking"}</span>
                  ) : (
                    <input className="input h-10 px-3 text-sm" aria-label="Payment name" maxLength={80} value={row.title} onChange={event => editor.changeRow(row.key, { title: event.target.value })} />
                  )}
                  {index === 0 ? (
                    <span className="bk-plan__fixed">With the invoice</span>
                  ) : (
                    <input className="input h-10 px-3 text-sm" type="date" aria-label="Due date" value={row.dueOn} onChange={event => editor.changeRow(row.key, { dueOn: event.target.value })} />
                  )}
                  <input className="input h-10 px-3 text-sm tabular" inputMode="decimal" aria-label="Amount in US dollars" value={row.amount} onChange={event => editor.changeRow(row.key, { amount: event.target.value })} />
                </>
              )}
              {!row.locked && open > 1 && index > 0 ? (
                <button type="button" className="bk-plan__remove" aria-label="Remove this payment" onClick={() => editor.removeRow(row.key)}>
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : <span />}
            </li>
          ))}
        </ol>
        <button type="button" className="btn-outline mt-2 h-9 px-3 text-[13px]" onClick={editor.addRow} disabled={editor.rows.length >= 8}>
          <Plus className="h-4 w-4" aria-hidden />
          Add a payment
        </button>
      </div>

      <div className="bk-plan__sum" data-off={editor.error ? "true" : undefined}>
        <span>{editor.error ?? `Payments add up to the total, ${formatPrice(editor.totalCents ?? 0)}.`}</span>
        {editor.differenceCents !== 0 && editor.totalCents ? (
          <button type="button" className="btn-outline h-8 px-2.5 text-xs" onClick={editor.fillLastRow}>Put the difference on the last payment</button>
        ) : null}
      </div>
    </div>
  );
}
