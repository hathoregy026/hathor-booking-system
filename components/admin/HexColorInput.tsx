"use client";

import { useEffect, useState } from "react";

/** Normalize typed / pasted colours to `#RRGGBB`, or null if invalid. */
export function normalizeHexColor(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const short = /^#([0-9A-Fa-f]{3})$/.exec(withHash);
  if (short) {
    const [r, g, b] = short[1]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  /* Allow #RRGGBBAA from pickers — store opaque RGB only. */
  const longAlpha = /^#([0-9A-Fa-f]{8})$/.exec(withHash);
  if (longAlpha) return `#${longAlpha[1]!.slice(0, 6)}`.toUpperCase();
  if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) return withHash.toUpperCase();
  return null;
}

/** Swatch + editable hex (#RGB / #RRGGBB). Applies as soon as the value is valid. */
export function HexColorInput({
  value,
  onChange,
  "aria-label": ariaLabel = "Color",
}: {
  value: string;
  onChange: (hex: string) => void;
  "aria-label"?: string;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = (raw: string, revertOnInvalid = true) => {
    const next = normalizeHexColor(raw);
    if (next) {
      if (next !== value) onChange(next);
      setDraft(next);
      return true;
    }
    if (revertOnInvalid) setDraft(value);
    return false;
  };

  const swatchValue = normalizeHexColor(value) ?? "#B69F64";

  return (
    <div className="typo-easy__color">
      <input
        type="color"
        className="typo-easy__swatch"
        value={swatchValue.toLowerCase()}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label={`${ariaLabel} swatch`}
      />
      <input
        type="text"
        className="typo-easy__hex-input admin-input"
        value={draft}
        spellCheck={false}
        autoComplete="off"
        maxLength={9}
        aria-label={`${ariaLabel} hex`}
        placeholder="#B69F64"
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          /* Apply immediately once valid — don't wait for blur/Save. */
          const next = normalizeHexColor(raw);
          if (next && next !== value) onChange(next);
        }}
        onBlur={() => commit(draft, true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft, true);
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </div>
  );
}
