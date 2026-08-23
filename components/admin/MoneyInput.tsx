"use client";

import { useState } from "react";

/**
 * Currency field that shows and accepts DOLLARS while storing CENTS.
 *
 * The API and Prisma schema store integer cents; the admin used to type raw
 * cents into a bare number input labelled "(cents)", so 500 silently created a
 * $5.00 cruise. This component keeps the stored unit identical — callers still
 * receive cents — and only changes what the human types and reads.
 *
 * Conversion is done on the digit strings rather than `parseFloat(v) * 100`,
 * because binary floats round the wrong way on values like 1.005 or 8.115.
 */

/** 250000 -> "2500.00" */
export function centsToDollarString(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  const negative = safe < 0;
  const abs = Math.abs(safe);
  const whole = Math.floor(abs / 100);
  const frac = (abs % 100).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${frac}`;
}

/** "2500.5" -> 250050. Exact: no float multiplication. */
export function dollarStringToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const [wholePart = "", fracPart = ""] = cleaned.split(".");
  const whole = Number.parseInt(wholePart || "0", 10);
  const frac = Number.parseInt(`${fracPart}00`.slice(0, 2), 10);
  if (!Number.isFinite(whole) || !Number.isFinite(frac)) return 0;
  return whole * 100 + frac;
}

/** Keep only digits and a single dot, capped at two decimal places. */
function sanitizeDraft(raw: string): string {
  const stripped = raw.replace(/[^0-9.]/g, "");
  const firstDot = stripped.indexOf(".");
  if (firstDot === -1) return stripped;
  const whole = stripped.slice(0, firstDot);
  const frac = stripped.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  return `${whole}.${frac}`;
}

type MoneyInputProps = {
  id: string;
  label: string;
  /** Value in cents — the unit the API stores. */
  valueCents: number;
  onChangeCents: (cents: number) => void;
  currencySymbol?: string;
  disabled?: boolean;
  className?: string;
};

export function MoneyInput({
  id,
  label,
  valueCents,
  onChangeCents,
  currencySymbol = "$",
  disabled = false,
  className = "",
}: MoneyInputProps) {
  // `draft` is non-null only while the field has focus, so an external change
  // to valueCents is reflected immediately without a sync effect.
  const [draft, setDraft] = useState<string | null>(null);

  const canonical = valueCents ? centsToDollarString(valueCents) : "";
  const display = draft ?? canonical;

  return (
    <div className={`admin-field admin-field--money ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={display}
        placeholder=" "
        onFocus={() => setDraft(canonical)}
        onBlur={() => setDraft(null)}
        onChange={(event) => {
          const next = sanitizeDraft(event.target.value);
          setDraft(next);
          onChangeCents(dollarStringToCents(next));
        }}
        className="admin-input w-full text-sm"
      />
      <label className="admin-field__label" htmlFor={id}>
        {label}
      </label>
      <span className="admin-field__prefix" aria-hidden>
        {currencySymbol}
      </span>
    </div>
  );
}
